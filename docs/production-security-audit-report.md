# FYPMate — Production Security Audit & Vulnerability Report
**Document Version:** 1.0.0  
**Audit Date:** October 10, 2026  
**Target Application:** FYPMate (`https://fypmate.com`)  
**Audit Scope:** Application Security, Authorization, Database/RLS, File Storage, External Integrations, Abuse Prevention, and Privacy  
**Auditor:** Senior Application Security Engineering Team  

---

## 1. Executive Summary & Production Readiness Verdict

### Production Readiness Verdict: 🛑 NOT READY FOR PUBLIC PRODUCTION (CRITICAL BLOCKERS IDENTIFIED)

FYPMate possesses several positive security foundations: robust schema validations using Zod in core profile update flows, parameterized queries via Prisma ORM preventing standard SQL injection, explicit role checks (`requireRole`) on most internal API routes, and domain-restricted institutional OAuth for student signups (`@paf-iast.edu.pk`).

However, the audit revealed **multiple critical and high-severity security vulnerabilities** that expose the production platform to immediate compromise, data destruction, cross-tenant harassment, and resource exhaustion:

1. **Storage Bucket Catastrophic Exposure (CRITICAL):** The Supabase Storage `avatars` bucket allows unrestricted `INSERT`, `UPDATE`, and `DELETE` access to the unauthenticated `anon` and `public` roles with **no file size limit** and **no MIME-type restrictions**. Any attacker on the internet can delete every user avatar, overwrite any user file, upload gigabytes of junk, or host malicious scripts.
2. **Host Header Injection & Open Redirect in OAuth Flow (CRITICAL):** `/api/auth/callback` trusts the untrusted `x-forwarded-host` request header to construct redirect URLs, allowing session tokens and error codes to be hijacked to attacker-controlled origins.
3. **Environment Secret Variable Mismatch (CRITICAL):** `.env` defines `SUPABASE_SECRET_KEY`, but `lib/supabase.ts` expects `SUPABASE_SERVICE_ROLE_KEY` or `SECRET_SUPABASE_SERVICE_ROLE_KEY`. Consequently, all privileged admin calls—including deleting unauthorized OAuth users from Supabase Auth and syncing student suspensions—fail silently with an undefined key.
4. **Serverless Rate Limiting Inefficacy & Missing Limits (HIGH):** 63 out of 68 API endpoints have **zero rate limiting**. The existing rate limiter uses an in-memory `Map`, which is completely reset on Vercel serverless cold starts and fails across concurrent edge instances. An attacker can mass-spam partner invitations, bomb chat messages, and exhaust server resources.
5. **Missing Baseline HTTP Security Headers (HIGH):** `middleware.ts` sets no security headers. The application runs without `Strict-Transport-Security` (HSTS), `X-Frame-Options` (Clickjacking), `Content-Security-Policy` (CSP), and `X-Content-Type-Options: nosniff`.
6. **Unauthenticated Public API Proxy (HIGH):** `/api/student/github-meta` is completely unauthenticated and unrated, allowing external attackers to exhaust FYPMate server IP limits against the GitHub API.

---

## 2. Comprehensive Route Inventory & Access Matrix

Every route across `app/api/` was audited for Authentication, Authorization (RBAC / Ownership), Rate Limiting, and Vulnerabilities:

| # | Route | Method | Auth Required | Authorization / RBAC | Rate Limited | Security Status / Findings |
|---|---|---|---|---|---|---|
| 1 | `/api/admin/ai-stats` | GET | Yes | `requireRole(ADMIN)` | ❌ None | Low risk (Admin only) |
| 2 | `/api/admin/conversations` | GET | Yes | `requireRole(ADMIN)` | ❌ None | ⚠️ Privacy concern: Admins read all student DMs |
| 3 | `/api/admin/conversations/[id]` | GET | Yes | `requireRole(ADMIN)` | ❌ None | ⚠️ Privacy concern: Admins read student DMs |
| 4 | `/api/admin/conversations/[id]/messages` | GET | Yes | `requireRole(ADMIN)` | ❌ None | ⚠️ Privacy concern: Admins read student DMs |
| 5 | `/api/admin/feedback` | GET | Yes | `requireRole(ADMIN)` | ❌ None | Secure |
| 6 | `/api/admin/feedback/[id]` | PATCH | Yes | `requireRole(ADMIN)` | ❌ None | Validates status & responses via Zod |
| 7 | `/api/admin/get-all-students` | GET | Yes | `requireRole(ADMIN)` | ❌ None | Secure (Admin only) |
| 8 | `/api/admin/get-student/[studentId]` | GET | Yes | `requireRole(ADMIN)` | ❌ None | Secure (Admin only) |
| 9 | `/api/admin/login` | POST | No | DB Role check (`ADMIN`) | ⚠️ In-memory IP | Vulnerable to distributed brute-force |
| 10 | `/api/admin/logout` | POST | Optional | Signs out session | ❌ None | Secure |
| 11 | `/api/admin/reports` | GET | Yes | `requireRole(ADMIN)` | ❌ None | Parallel aggregation; heavy query load |
| 12 | `/api/admin/session` | GET | Yes | `requireRole(ADMIN)` | ❌ None | Secure |
| 13 | `/api/admin/signup` | POST | Yes | `requireRole(ADMIN)` | ⚠️ In-memory IP | ⚠️ Weak password min length (6 chars) |
| 14 | `/api/admin/stats` | GET | Yes | `requireRole(ADMIN)` | ❌ None | Secure |
| 15 | `/api/admin/suspend-student` | PATCH | Yes | `requireRole(ADMIN)` | ❌ None | 🛑 Supabase admin key mismatch breaks ban sync |
| 16 | `/api/admin/update-student/[id]` | PATCH | Yes | `requireRole(ADMIN)` | ❌ None | Validates name/semester; lacks audit log |
| 17 | `/api/auth/callback` | GET | No | Domain check (`paf-iast`) | ❌ None | 🛑 Open Redirect via `X-Forwarded-Host` |
| 18 | `/api/auth/logout` | POST | Optional | Signs out session | ❌ None | Secure |
| 19 | `/api/auth/session` | GET | Yes | Session verify | ❌ None | Secure |
| 20 | `/api/discovery/get-matched-students` | GET | Yes | `requireRole(STUDENT)` | ❌ None | Omits phone/email; no rate limiting |
| 21 | `/api/feedback/my-feedback` | GET | Yes | `requireRole(STUDENT)` | ❌ None | Restricts to own feedback |
| 22 | `/api/feedback/submit` | POST | Yes | `requireRole(STUDENT)` | ❌ None | Checks 1 active ticket limit; lacks rate limit |
| 23 | `/api/fyp-ideas/extract-pdf` | POST | N/A | Stubbed (501) | N/A | Feature disabled; no active vulnerability |
| 24 | `/api/fyp-ideas/my-validations` | GET | Yes | `requireRole(STUDENT)` | ❌ None | Restricts to own studentId |
| 25 | `/api/fyp-ideas/my-validations/[id]` | GET | Yes | `requireRole(STUDENT)` | ❌ None | Restricts to own validation record |
| 26 | `/api/fyp-ideas/validate` | POST | Optional | Student quota / Guest 1/day | ⚠️ In-memory (Guest) | ⚠️ Concurrency race condition on quotas |
| 27 | `/api/group/get-my-group` | GET | Yes | `requireRole(STUDENT)` | ❌ None | Verified membership |
| 28 | `/api/group/lock` | POST | Yes | `requireRole(STUDENT)` | ❌ None | Locks group; verified membership |
| 29 | `/api/group/remove-member` | POST | Yes | `requireRole(STUDENT)` | ❌ None | ⚠️ Any member can kick creator / any peer |
| 30 | `/api/group/update-project` | PATCH | Yes | `requireRole(STUDENT)` | ❌ None | Verified membership |
| 31 | `/api/group/update-visibility` | PATCH | Yes | `requireRole(STUDENT)` | ❌ None | Updates own visibility |
| 32 | `/api/group/workspace/tasks` | GET | Yes | `requireRole(STUDENT)` | ❌ None | Restricts to user's group |
| 33 | `/api/group/workspace/tasks` | POST | Yes | `requireRole(STUDENT)` | ❌ None | Checks group membership |
| 34 | `/api/group/workspace/tasks/[taskId]` | PATCH | Yes | `requireRole(STUDENT)` | ❌ None | Checks task belongs to user's group |
| 35 | `/api/group/workspace/tasks/[taskId]` | DELETE | Yes | `requireRole(STUDENT)` | ❌ None | Checks task belongs to user's group |
| 36 | `/api/messaging/check-permission` | GET | Yes | `requireRole(STUDENT)` | ❌ None | Checks partner/request state |
| 37 | `/api/messaging/edit` | PATCH | Yes | `requireRole(STUDENT)` | ⚠️ In-memory | Restricts to sender + 15 min window |
| 38 | `/api/messaging/get-conversations` | GET | Yes | `requireRole(STUDENT)` | ❌ None | Restricts to user's conversations |
| 39 | `/api/messaging/get-messages` | GET | Yes | `requireRole(STUDENT)` | ❌ None | Verifies user is conversation participant |
| 40 | `/api/messaging/mark-read` | POST | Yes | `requireRole(STUDENT)` | ❌ None | Verifies user is recipient |
| 41 | `/api/messaging/send` | POST | Yes | `requireRole(STUDENT)` | ⚠️ In-memory | Sanitizes invisible chars; max 1000 chars |
| 42 | `/api/messaging/start` | POST | Yes | `requireRole(STUDENT)` | ❌ None | Verifies request approval |
| 43 | `/api/messaging/unread-count` | GET | Yes | `requireRole(STUDENT)` | ❌ None | Counts unread for current student |
| 44 | `/api/push/subscribe` | POST | Yes | `requireAuth()` | ❌ None | ⚠️ Blind SSRF risk on unvalidated endpoint URL |
| 45 | `/api/push/unsubscribe` | POST | Yes | `requireAuth()` | ❌ None | Deletes by user endpoint |
| 46 | `/api/push/vapid-key` | GET | No | Public VAPID key | ❌ None | Public info |
| 47 | `/api/request/message/accept` | POST | Yes | `requireRole(STUDENT)` | ❌ None | Verifies `toStudentId === currentStudent` |
| 48 | `/api/request/message/get-received` | GET | Yes | `requireRole(STUDENT)` | ❌ None | Restricts to own received requests |
| 49 | `/api/request/message/get-sent` | GET | Yes | `requireRole(STUDENT)` | ❌ None | Restricts to own sent requests |
| 50 | `/api/request/message/reject` | POST | Yes | `requireRole(STUDENT)` | ❌ None | Verifies `toStudentId === currentStudent` |
| 51 | `/api/request/message/send` | POST | Yes | `requireRole(STUDENT)` | ❌ None | ⚠️ No rate limit or global pending quota |
| 52 | `/api/request/partner/accept` | POST | Yes | `requireRole(STUDENT)` | ❌ None | Transactional; verifies recipient & semester |
| 53 | `/api/request/partner/get-received` | GET | Yes | `requireRole(STUDENT)` | ❌ None | Restricts to own received requests |
| 54 | `/api/request/partner/get-sent` | GET | Yes | `requireRole(STUDENT)` | ❌ None | Restricts to own sent requests |
| 55 | `/api/request/partner/reject` | POST | Yes | `requireRole(STUDENT)` | ❌ None | Verifies `toStudentId === currentStudent` |
| 56 | `/api/request/partner/send` | POST | Yes | `requireRole(STUDENT)` | ❌ None | ⚠️ No rate limit or global pending quota |
| 57 | `/api/student/cancel-deletion` | PATCH | Yes | `requireRole(STUDENT)` | ❌ None | Restricts to own user |
| 58 | `/api/student/delete-my-profile` | PATCH | Yes | `requireRole(STUDENT)` | ❌ None | Sets `DELETION_REQUESTED` |
| 59 | `/api/student/get-my-profile` | GET | Yes | `requireRole(STUDENT)` | ❌ None | Returns full profile including phone |
| 60 | `/api/student/get-public-profile/[id]` | GET | Yes | `requireRole(STUDENT)` | ❌ None | ⚠️ Exposes full university email to all students |
| 61 | `/api/student/github-meta` | GET | No | ❌ None (Public) | ❌ None | 🛑 Unauthenticated external GitHub proxy |
| 62 | `/api/student/internship/add` | POST | Yes | `requireRole(STUDENT)` | ❌ None | Enforces max 10 internships; trims fields |
| 63 | `/api/student/internship/remove/[id]`| DELETE | Yes | `requireRole(STUDENT)` | ❌ None | Verifies student ownership |
| 64 | `/api/student/internship/update/[id]`| PATCH | Yes | `requireRole(STUDENT)` | ❌ None | Verifies student ownership |
| 65 | `/api/student/project/add` | POST | Yes | `requireRole(STUDENT)` | ❌ None | Enforces max 10 projects; Zod URL validation |
| 66 | `/api/student/project/remove` | DELETE | Yes | `requireRole(STUDENT)` | ❌ None | Verifies student ownership via join |
| 67 | `/api/student/project/update` | PATCH | Yes | `requireRole(STUDENT)` | ❌ None | Verifies student ownership |
| 68 | `/api/student/skill/add` | POST | Yes | `requireRole(STUDENT)` | ❌ None | Verifies student ownership |
| 69 | `/api/student/skill/remove` | DELETE | Yes | `requireRole(STUDENT)` | ❌ None | Verifies student ownership |
| 70 | `/api/student/skill/update` | PATCH | Yes | `requireRole(STUDENT)` | ❌ None | Verifies student ownership |
| 71 | `/api/student/update-my-profile` | PATCH | Yes | `requireRole(STUDENT)` | ❌ None | Validates URLs; protects semester |

---

## 3. Deep-Dive Vulnerability Findings

### 3.1 Critical Severity (P0 — Immediate Remediation Required)

#### FINDING-01: Supabase Storage Bucket Permissive RLS & Missing Restrictions
- **Affected Resource:** Supabase Storage bucket `avatars` and table `storage.objects`
- **Database Findings:**
  - `storage.buckets`: `name: "avatars"`, `public: true`, `file_size_limit: null`, `allowed_mime_types: null`.
  - `storage.objects` Policies:
    - `"Allow public uploads 1oj01fe_0"`: `role: anon`, `cmd: INSERT`, `with_check: (bucket_id = 'avatars')`
    - `"Allow public update 1oj01fe_0"`: `role: anon`, `cmd: UPDATE`, `with_check: (bucket_id = 'avatars')`
    - `"avatars_delete"`: `role: public`, `cmd: DELETE`, `qual: (bucket_id = 'avatars')`
- **Technical Impact:**
  1. **Arbitrary File Upload & Stored XSS:** Any anonymous visitor with the public `NEXT_PUBLIC_SUPABASE_ANON_KEY` can upload `.html`, `.svg`, `.exe`, or `.js` files. An attacker can upload an HTML file containing credential-harvesting scripts and share it via `https://<project-ref>.supabase.co/storage/v1/object/public/avatars/phish.html`.
  2. **Data Tampering & Defacement:** Any user or anonymous script can overwrite any student's profile picture by uploading with `upsert: true` to `profile-pictures/<targetStudentId>-*.jpg`.
  3. **Data Loss:** Any unauthenticated caller can delete every object in the `avatars` bucket via `DELETE /storage/v1/object/avatars/...`.
  4. **Denial of Wallet / Storage Exhaustion:** With `file_size_limit = null`, an attacker can upload multiple 5GB files to exhaust project storage limits.
- **Required Remediation:**
  1. Restrict `allowed_mime_types` on the bucket to `['image/jpeg', 'image/png', 'image/webp']`.
  2. Set `file_size_limit` to `2097152` (2 MB).
  3. Drop all `anon` write, update, and public delete policies on `storage.objects`.
  4. Create strict authenticated RLS policies where `auth.uid()::text = (storage.foldername(name))[1]` or prefix files by authenticated student user ID, allowing only authenticated owners to insert/update/delete their own pictures.

---

#### FINDING-02: Host Header Injection & Open Redirect in OAuth Callback
- **Affected File:** [`app/api/auth/callback/route.ts`](file:///c:/Users/Muhammad/Desktop/fypfinder/app/api/auth/callback/route.ts#L9-L34)
- **Code Trace:**
  ```typescript
  function getRedirectOrigin(req: Request) {
      if (process.env.NODE_ENV === "development") {
          return new URL(req.url).origin
      }
      const forwardedHost = req.headers.get("x-forwarded-host")
      const forwardedProto = req.headers.get("x-forwarded-proto") || "https"
      if (forwardedHost) {
          return `${forwardedProto}://${forwardedHost}`
      }
      ...
  ```
- **Technical Impact:**
  `x-forwarded-host` is derived from an untrusted client header unless the upstream reverse proxy strips and overrides it. If an attacker passes `X-Forwarded-Host: evil.com` during the OAuth handshake or redirection flow, the server constructs:
  `NextResponse.redirect("https://evil.com/login?error=...")` or redirects to `/dashboard/discovery` on `evil.com`.
  This allows stealing session state, auth codes, and redirecting students to phishing domains.
- **Required Remediation:**
  Do not trust arbitrary incoming `x-forwarded-host` headers. Use an allowlist of trusted origins:
  ```typescript
  const ALLOWED_ORIGINS = ["https://fypmate.com", "https://www.fypmate.com"];
  ```
  Or strictly default to `process.env.NEXT_PUBLIC_APP_URL`.

---

#### FINDING-03: Supabase Service Role Key Environment Variable Mismatch
- **Affected Files:**
  - [`.env`](file:///c:/Users/Muhammad/Desktop/fypfinder/.env): Sets `SUPABASE_SECRET_KEY=sb_secret_...`
  - [`lib/supabase.ts`](file:///c:/Users/Muhammad/Desktop/fypfinder/lib/supabase.ts#L39-L43):
    ```typescript
    export function createSupabaseAdminClient() {
      const serviceKey = process.env.SECRET_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
      return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey!, ...)
    }
    ```
- **Technical Impact:**
  Because the environment variable name does not match, `serviceKey` resolves to `undefined`.
  Whenever `createSupabaseAdminClient()` is invoked:
  1. `/api/auth/callback`: `deleteUserAndRedirect` fails to delete unauthorized users from Supabase Auth when non-institutional accounts sign in.
  2. `/api/admin/suspend-student`: Supabase Auth ban synchronization (`admin.updateUserById(..., { ban_duration })`) silently fails.
  3. `/api/admin/signup`: Creation of new admin accounts via Supabase Admin API throws an unhandled exception.
- **Required Remediation:**
  In `lib/supabase.ts`, align key detection:
  `process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SECRET_SUPABASE_SERVICE_ROLE_KEY`.

---

### 3.2 High Severity (P1 — Address Before Launch)

#### FINDING-04: Stateless In-Memory Rate Limiting on Serverless Architecture
- **Affected File:** [`lib/rate-limit.ts`](file:///c:/Users/Muhammad/Desktop/fypfinder/lib/rate-limit.ts#L10-L40)
- **Technical Details:**
  `RateLimiter` maintains state inside a JavaScript `Map<string, RateLimitEntry>`.
  On Vercel Serverless / AWS Lambda, instances spin up and terminate dynamically. Every cold start creates a blank `Map`. Different requests from the same user hit different container instances.
  Furthermore, 63 out of 68 routes do not invoke any rate limiter.
- **Abuse Scenarios:**
  - **Spamming Partner Requests:** A student can send 1,000 partner requests in 10 seconds to every peer in their semester.
  - **Notification Flooding:** Each partner request sends a push notification (`notifyPartnerRequest`), causing a denial of service on peer devices.
  - **Brute Force on Admin Login:** Repeated requests to `/api/admin/login` bypass the in-memory window across serverless instances.
- **Required Remediation:**
  Replace in-memory rate limiting with a distributed KV/Redis store (such as Upstash Redis with `@upstash/ratelimit`). Apply rate limiters uniformly across all mutation endpoints.

---

#### FINDING-05: Missing Baseline HTTP Security Headers
- **Affected Files:** [`middleware.ts`](file:///c:/Users/Muhammad/Desktop/fypfinder/middleware.ts), [`next.config.ts`](file:///c:/Users/Muhammad/Desktop/fypfinder/next.config.ts)
- **Technical Details:**
  Neither Next.js configuration nor middleware sets HTTP security response headers.
- **Missing Controls:**
  - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` (Ensures HTTPS enforcement)
  - `X-Frame-Options: DENY` (Mitigates clickjacking)
  - `X-Content-Type-Options: nosniff` (Prevents MIME-confusion attacks)
  - `Referrer-Policy: strict-origin-when-cross-origin` (Prevents leaking query parameters to external sites)
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()` (Restricts hardware device access)
  - `Content-Security-Policy` (Mitigates Cross-Site Scripting and unauthorized script injection)
- **Required Remediation:**
  Configure security headers in `next.config.ts` via the `headers()` method.

---

#### FINDING-06: Unauthenticated External GitHub API Proxy Endpoint
- **Affected File:** [`app/api/student/github-meta/route.ts`](file:///c:/Users/Muhammad/Desktop/fypfinder/app/api/student/github-meta/route.ts#L4-L53)
- **Technical Details:**
  The route takes `?url=` from query parameters and fetches `https://api.github.com/repos/{owner}/{repo}` without:
  1. Requiring user authentication (`requireAuth` or `requireRole`).
  2. Any rate limiting.
  3. GitHub API authentication token (unauthenticated GitHub API is limited to 60 requests/hour per public IP).
- **Abuse Scenario:**
  An external attacker can send 60 requests in 2 seconds to `/api/student/github-meta?url=...`, completely exhausting FYPMate's server IP allowance on GitHub API. This causes the feature to break for all legitimate users.
  Furthermore, regex `url.match(/github\.com\/([^\/]+)\/([^\/]+)/)` can accept special characters or path traversal components.
- **Required Remediation:**
  1. Enforce `requireRole(UserRole.STUDENT)`.
  2. Implement strict rate limiting (e.g., 10 req/min per student).
  3. Validate `owner` and `repo` match strictly `^[a-zA-Z0-9_.-]+$`.
  4. Cache GitHub repository metadata using Next.js `fetch` cache or Redis.

---

### 3.3 Medium Severity (P2 — Security & Data Integrity Hardening)

#### FINDING-07: University Email Address Exposure via Public Profiles
- **Affected File:** [`modules/student/student.service.ts`](file:///c:/Users/Muhammad/Desktop/fypfinder/modules/student/student.service.ts#L252) (`getPublicProfile`)
- **Technical Details:**
  `getPublicProfile` returns:
  ```typescript
  return {
    id: student.id,
    name: student.name,
    email: student.user.email, // <--- EXPOSED
    department: student.department,
    ...
  ```
  Any authenticated student can query `/api/student/get-public-profile/[studentId]` for every student in the university directory, harvesting personal university email addresses for scraping, mass phishing, or spamming.
- **Required Remediation:**
  Remove `email` from `getPublicProfile`. Email should only be revealed between students after a partner request has been officially accepted, or kept strictly inside platform messaging.

---

#### FINDING-08: Group Member Eviction Authorization Flaw
- **Affected File:** [`modules/group/group.service.ts`](file:///c:/Users/Muhammad/Desktop/fypfinder/modules/group/group.service.ts#L112-L166) (`removeGroupMember`)
- **Technical Details:**
  The function only checks:
  1. Is the requester in a group?
  2. Is the group unlocked?
  3. Is the target student in the same group?
  It does **not** distinguish between group creator/leader and members, nor does it require mutual agreement. Any student who joins a group can immediately kick the student who founded the group, or kick all other members, automatically deleting the group.
- **Required Remediation:**
  Introduce group roles (`LEADER` vs `MEMBER`) in `FYPGroupMember`, or enforce that only the group creator can remove other members, while regular members can only perform a "leave group" action for themselves.

---

#### FINDING-09: Concurrency Race Condition in AI Idea Validation Rate Limiting
- **Affected File:** [`modules/fyp-ideas/fyp-ideas.service.ts`](file:///c:/Users/Muhammad/Desktop/fypfinder/modules/fyp-ideas/fyp-ideas.service.ts#L188-L207)
- **Technical Details:**
  `enforceStudentRateLimit` counts records where `status: "COMPLETED"`.
  When a validation starts, it takes 5–8 seconds to call the LLM and complete.
  If a student sends 10 parallel HTTP requests simultaneously, all 10 requests check `todayCount`, all 10 find `todayCount < MAX_VALIDATIONS_PER_DAY`, and all 10 execute full LLM validation requests simultaneously.
- **Required Remediation:**
  Create a pending record in `FYPIdeaValidation` with `status: "PROCESSING"` inside an atomic transaction or increment an atomic Redis counter prior to invoking the AI provider.

---

#### FINDING-10: Blind SSRF Risk in Web Push Subscription Endpoint
- **Affected File:** [`app/api/push/subscribe/route.ts`](file:///c:/Users/Muhammad/Desktop/fypfinder/app/api/push/subscribe/route.ts#L33-L70)
- **Technical Details:**
  The endpoint accepts any arbitrary string for `subscription.endpoint` and stores it. When `webpush.sendNotification()` is triggered later, the server dispatches an HTTP POST request to this endpoint.
  If an attacker submits `http://169.254.169.254/latest/meta-data/` or internal VPC hostnames, the server makes outbound requests to internal destinations.
- **Required Remediation:**
  Validate that `endpoint` is a valid URL starting strictly with `https://` and matching known push gateways (`fcm.googleapis.com`, `push.apple.com`, `*.push.services.mozilla.com`, `*.notify.windows.com`).

---

#### FINDING-11: Weak Admin Password Policy
- **Affected File:** [`app/api/admin/signup/route.ts`](file:///c:/Users/Muhammad/Desktop/fypfinder/app/api/admin/signup/route.ts#L53)
- **Technical Details:**
  The check permits admin passwords with only 6 characters (`password.length < 6`).
  For privileged accounts with administrative access to read student communications and modify user accounts, NIST SP 800-63B guidelines require at least 12 characters with entropy/complexity checks.
- **Required Remediation:**
  Increase minimum admin password length to 12 characters and enforce uppercase, lowercase, digit, and symbol complexity.

---

### 3.4 Low Severity & Informational (P3)

#### FINDING-12: Zero RLS Policies on Public Database Tables (Defense-in-Depth Absence)
- **Database Advisor Observation:** 17 tables have RLS enabled, but 0 policies exist (`rls_enabled_no_policy`).
- **Explanation:**
  Prisma connects directly using the PostgreSQL postgres superuser/service role, which bypasses RLS completely. Direct Supabase PostgREST client calls using the Anon key are denied by default.
  While this does not cause a direct leak under normal Prisma usage, having no RLS policies means **zero defense-in-depth**: any slip in an API endpoint exposes the database because the database itself has no row-level guardrails.

#### FINDING-13: Privacy Policy Disconnect Regarding Admin Chat Access
- **Affected Files:** [`app/api/admin/conversations/route.ts`](file:///c:/Users/Muhammad/Desktop/fypfinder/app/api/admin/conversations/route.ts), [`app/privacy/page.tsx`](file:///c:/Users/Muhammad/Desktop/fypfinder/app/privacy/page.tsx)
- **Observation:**
  Admins have full read access to all private direct messages between students. The privacy policy does not clearly state that messages may be audited by university administrators, nor is there any audit logging when an administrator inspects a student's conversation.
- **Recommendation:**
  1. Add an `AuditLog` table recording every time an administrator views a conversation.
  2. Disclose administrative moderation in the platform Privacy Policy.

#### FINDING-14: Client IP Extraction Spoofability
- **Affected File:** [`lib/rate-limit.ts`](file:///c:/Users/Muhammad/Desktop/fypfinder/lib/rate-limit.ts#L67-L74)
- **Observation:**
  `getClientIdentifier` reads `x-forwarded-for` and splits by comma. If the edge reverse proxy does not sanitize untrusted client headers, an attacker can append spoofed IPs to bypass IP-based rate limiting.

---

## 4. Rate-Limiting & Abuse Prevention Architecture

### Recommended Limits Matrix

| Operation Category | Target Endpoints | Recommended Window | Recommended Max Requests | Keying Strategy | Storage Backend |
|---|---|---|---|---|---|
| **Admin Authentication** | `/api/admin/login` | 15 minutes | 5 attempts | IP + Email | Redis KV |
| **Admin Provisioning** | `/api/admin/signup` | 1 hour | 3 attempts | Admin User ID | Redis KV |
| **AI Idea Validation** | `/api/fyp-ideas/validate` | 24 hours | 1 (Guest), 5 (Student) | IP (Guest), `studentId` (Student) | Atomic DB / Redis |
| **Direct Messaging** | `/api/messaging/send` | 1 minute | 20 messages | `studentId` | Redis sliding window |
| **Message Editing** | `/api/messaging/edit` | 1 minute | 5 edits | `studentId` | Redis sliding window |
| **Partner Requests** | `/api/request/partner/send` | 1 hour | 5 requests | `studentId` | Redis + DB pending cap (max 5) |
| **Message Requests** | `/api/request/message/send` | 1 hour | 10 requests | `studentId` | Redis + DB pending cap (max 10) |
| **External Meta Proxy** | `/api/student/github-meta` | 1 minute | 10 requests | `studentId` | Redis sliding window |
| **Profile & Portfolio Updates**| `/api/student/update-my-profile`, `skill/*`, `project/*` | 1 minute | 30 requests | `studentId` | Redis sliding window |
| **Push Subscriptions** | `/api/push/subscribe` | 10 minutes | 5 requests | `userId` | Redis sliding window |

---

## 5. Storage & Database Hardening Specifications

### 5.1 Supabase Storage Hardening (`storage.objects`)

To eliminate the critical vulnerability in the `avatars` bucket, execute the following SQL in Supabase:

```sql
-- 1. Tighten bucket settings: limit to images and max 2MB
UPDATE storage.buckets
SET 
  file_size_limit = 2097152, -- 2 MB
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp']
WHERE id = 'avatars';

-- 2. Drop insecure public/anon policies
DROP POLICY IF EXISTS "Allow public uploads 1oj01fe_0" ON storage.objects;
DROP POLICY IF EXISTS "Allow public update 1oj01fe_0" ON storage.objects;
DROP POLICY IF EXISTS "Allow public update 1oj01fe_1" ON storage.objects;
DROP POLICY IF EXISTS "avatars_insert" ON storage.objects;
DROP POLICY IF EXISTS "avatars_update" ON storage.objects;
DROP POLICY IF EXISTS "avatars_delete" ON storage.objects;

-- 3. Public read remains open for avatars
CREATE POLICY "avatars_public_read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- 4. Only authenticated users can upload avatars into their own folder or with their ID prefix
CREATE POLICY "avatars_authenticated_upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = 'profile-pictures'
);

-- 5. Only the file owner can update or delete
CREATE POLICY "avatars_authenticated_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = owner::text)
WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "avatars_authenticated_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = owner::text);
```

---

## 6. Prioritized Remediation Roadmap

```
PHASE 1: Immediate Launch Blockers (P0)
├── 1. Fix Supabase Storage Bucket & RLS policies (prevent file defacement/data loss/XSS)
├── 2. Patch Host Header Injection in OAuth Callback (enforce strict allowed origins)
├── 3. Correct Service Role environment variable in lib/supabase.ts (fix user deletion/bans)
└── 4. Implement baseline HTTP Security Headers in next.config.ts / middleware.ts

PHASE 2: Abuse Prevention & Access Hardening (P1)
├── 5. Migrate from in-memory rate limiting to Upstash Redis across all routes
├── 6. Secure and authenticate /api/student/github-meta (prevent IP exhaustion)
├── 7. Enforce pending request limits (max 5 active partner requests, max 10 message requests)
├── 8. Prevent concurrent race condition bursts on AI Idea Validation
└── 9. Restrict student email exposure in getPublicProfile

PHASE 3: Governance, Integrity & Auditing (P2/P3)
├── 10. Implement Group Leadership model (prevent members from kicking creators)
├── 11. Increase Admin Password requirements to 12+ characters
├── 12. Add Push Subscription URL domain validation (prevent SSRF)
└── 13. Implement Admin Action Audit Logging (especially for viewing student DMs)
```

---

**Report Prepared By:** Application Security Audit Team  
**Status:** Completed & Delivered to Project Owner
