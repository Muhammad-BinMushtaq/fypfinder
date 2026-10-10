# FYPMate — Phase 3 Security Remediation Log
**Execution Date:** October 10, 2026  
**Status:** Completed & Verified  
**Scope:** Governance, Integrity & Auditing (Phase 3)  
**Remediation Engineer:** Application Security Engineering  

---

## 1. Overview & Objectives

Phase 3 focused on business-logic authorization, resource integrity, Server-Side Request Forgery (SSRF) defenses, admin credential protection, and UI feature enablement for group management and portfolio embeds.

All issues were audited, root causes verified against the source code, and remediated with full backward compatibility and zero regressions.

---

## 2. Detailed Fixes & Features Implemented

### Fix 1: Group Member Eviction Authorization & Leadership Model
* **Target Files:**
  * [`modules/group/group.service.ts`](file:///c:/Users/Muhammad/Desktop/fypfinder/modules/group/group.service.ts)
  * [`hooks/group/useMyGroup.ts`](file:///c:/Users/Muhammad/Desktop/fypfinder/hooks/group/useMyGroup.ts)
  * [`app/dashboard/fyp/page.tsx`](file:///c:/Users/Muhammad/Desktop/fypfinder/app/dashboard/fyp/page.tsx)
* **Previous State (Vulnerable & Incomplete UI):**
  * `removeGroupMember` allowed any student in an unlocked group to kick any peer, enabling a newly joined student to kick the group's founder/creator or delete the group.
  * In the frontend UI, the Leave Group button was hidden when groups were locked and only located at the bottom of the page.
  * Team Member cards had zero action buttons (no Leave button on your own card, and no Remove button for leaders).
* **Remediation Executed:**
  1. **Founding Leadership Model:** In `group.service.ts`, members are evaluated chronologically by `joinedAt`. The earliest joined member is established as the Group Leader.
  2. **Strict Member Removal Authorization:**
     * Self-leaving (`requesterId === targetId`) is permitted for any member (in unlocked groups).
     * Removing other members (`requesterId !== targetId`) is restricted strictly to the group leader. Regular members attempting to kick peers receive an unauthorized error.
     * The group leader cannot be kicked by any other member.
  3. **Frontend UI Implementation:**
     * Added **Leader** / **Member** badges on team member cards.
     * Added a direct **Leave Group** button on the user's own member card (`You`).
     * Added a **Remove Member** action button on peer cards visible exclusively to the group leader.
     * Added a dedicated confirmation modal for removing members with clear feedback.

---

### Fix 2: GitHub Repository Metadata Fetch Feature Enablement
* **Target Files:**
  * [`components/student/ProjectsSection.tsx`](file:///c:/Users/Muhammad/Desktop/fypfinder/components/student/ProjectsSection.tsx)
  * [`components/student/ProjectEmbedCard.tsx`](file:///c:/Users/Muhammad/Desktop/fypfinder/components/student/ProjectEmbedCard.tsx)
* **Previous State (Dormant Feature):**
  * `/api/student/github-meta` was hardened in Phase 2, and `ProjectEmbedCard.tsx` had full code to render stars, forks, and language badges, but `ProjectsSection.tsx` never called the endpoint.
  * Students inputting GitHub URLs had no fetch button or preview, and `embedType: "GITHUB"` was never saved to the database.
* **Remediation Executed:**
  1. Added a **"Fetch Repo Info"** button with a loading spinner beside the Source Code URL field.
  2. Integrated direct calls to `/api/student/github-meta?url=...` with input validation.
  3. Added an interactive repository preview card showing stars, forks, primary language, and repository description directly in the project modal.
  4. Automatically pre-populates project name and description from repository details if left blank.
  5. Correctly saves `embedType: "GITHUB"`, `embedUrl: githubLink`, and `mediaMetadata: { stars, forks, language, description }`, enabling full visual rendering on public and private profile pages.

---

### Fix 3: Blind SSRF Defense in Web Push Subscriptions
* **Target File:** [`app/api/push/subscribe/route.ts`](file:///c:/Users/Muhammad/Desktop/fypfinder/app/api/push/subscribe/route.ts)
* **Previous State (Vulnerable):**
  * The endpoint accepted any arbitrary URL string as `subscription.endpoint`. When notifications were dispatched, the server initiated outbound HTTP requests to the stored URL, exposing internal network infrastructure (e.g. AWS metadata `169.254.169.254` or local VPC hosts) to Blind SSRF.
* **Remediation Executed:**
  1. Validated that `endpoint` is a parseable URL strictly utilizing the `https:` protocol.
  2. Enforced an allowlist of verified browser push gateway domains:
     * Google FCM (`fcm.googleapis.com`, `android.googleapis.com`)
     * Apple APNs (`*.push.apple.com`)
     * Mozilla Web Push (`*.push.services.mozilla.com`, `updates.push.services.mozilla.com`)
     * Microsoft WNS (`*.notify.windows.com`)
  3. Requests containing unrecognized domains, private IP addresses, or localhost endpoints are rejected immediately with HTTP 400.

---

### Fix 4: Hardened Admin Password Policy
* **Target File:** [`app/api/admin/signup/route.ts`](file:///c:/Users/Muhammad/Desktop/fypfinder/app/api/admin/signup/route.ts)
* **Previous State (Weak Policy):**
  * Admin passwords only required a minimum length of 6 characters.
* **Remediation Executed:**
  * Enforced NIST SP 800-63B standard password requirements for administrative accounts:
    * Minimum **12 characters** in length.
    * At least one uppercase letter (`[A-Z]`).
    * At least one lowercase letter (`[a-z]`).
    * At least one number (`[0-9]`).
    * At least one special symbol (`[^A-Za-z0-9]`).

---

### Fix 5: Administrative Conversation Inspection Audit Trail
* **Target File:** [`app/api/admin/conversations/[conversationId]/messages/route.ts`](file:///c:/Users/Muhammad/Desktop/fypfinder/app/api/admin/conversations/%5BconversationId%5D/messages/route.ts)
* **Previous State (Missing Audit Trail):**
  * Administrators could view student conversations without any audit logging.
* **Remediation Executed:**
  * Added structured audit logging on every administrative fetch:
    `[AUDIT LOG] Administrator {email} ({id}) accessed student conversation {conversationId} ({total} messages) from IP {ip}`.
  * Verified that Platform Privacy Policy Section 4 explicitly discloses administrative access standards for harassment and academic integrity enforcement.

---

## 3. Verification Matrix

| Vulnerability / Feature | Target | Severity | Status | Verification |
|---|---|---|---|---|
| Group Member Eviction Vulnerability | `group.service.ts` | **MEDIUM (P2)** | ✅ RESOLVED | Leader check enforced |
| Leave Group Option Missing in UI | `fyp/page.tsx` | **USABILITY** | ✅ RESOLVED | Direct card actions added |
| GitHub Meta Fetch Dormant in UI | `ProjectsSection.tsx` | **FEATURE** | ✅ RESOLVED | Live fetch & preview added |
| Blind SSRF in Push Subscriptions | `push/subscribe/route.ts` | **HIGH (P1)** | ✅ RESOLVED | Push gateway allowlist |
| Weak Admin Password Policy | `admin/signup/route.ts` | **HIGH (P1)** | ✅ RESOLVED | 12+ chars & NIST complexity |
| Admin Chat Access Audit Trail | `admin/messages/route.ts` | **MEDIUM (P2)** | ✅ RESOLVED | Audit log recorded |

**Phase 3 Sign-Off:** All Phase 3 security fixes and frontend feature implementations have been applied and documented.
