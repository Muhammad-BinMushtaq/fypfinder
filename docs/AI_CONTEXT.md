# AI Context — FYP Finder

## 1. How To Use This Context
This document is a prompt-ready summary for external AI systems. It preserves the project’s architecture, data model, business rules, and non-negotiable constraints. Use it as the default context before making changes, generating code, or answering questions about the repository.

## 2. One-Line Project Summary
FYP Finder is a university collaboration platform for PAF-IAST students that supports profile management, teammate discovery, message and partner requests, realtime chat, FYP group formation, admin oversight, push notifications, and AI-assisted idea validation.

## 3. Primary Stack
- Next.js 15 with App Router
- React 19
- TypeScript 5
- Tailwind CSS v4
- Prisma ORM 7.3.0
- PostgreSQL via Supabase
- Supabase Auth and Supabase Realtime
- TanStack React Query 5
- `groq-sdk` for AI idea validation
- `web-push` for browser notifications
- `resend` and `maileroo-sdk` for email workflows

## 4. System Shape
The application follows a layered monolith design.

```text
UI pages and components
→ hooks and services
→ app/api route handlers
→ modules business logic
→ Prisma client
→ Supabase PostgreSQL
```

Realtime updates are event-driven:

```text
Database INSERT or UPDATE
→ Supabase Realtime
→ client subscription
→ React Query cache invalidation
→ UI refresh
```

## 5. Canonical Source Of Truth By Concern
- Authentication and session handling: `lib/auth.ts`, `lib/supabase.ts`, `app/api/auth/`, `app/api/admin/`
- Student profile and portfolio data: `modules/student/student.service.ts`, `app/api/student/`
- Discovery and matching: `modules/discovery/discovery.service.ts`, `app/api/discovery/`
- Messaging and chat rules: `modules/messaging/messaging.service.ts`, `app/api/messaging/`
- Message and partner requests: `modules/request/request.service.ts`, `app/api/request/`
- FYP group rules: `modules/group/group.service.ts`, `app/api/group/`
- Push notifications: `lib/push-service.ts`, `app/api/push/`
- AI validation records: `prisma/schema.prisma`, `app/api/fyp-ideas/`
- Database schema: `prisma/schema.prisma`
- Client state caching: `hooks/`, `services/`, `contexts/`

## 6. Roles And Responsibilities
### Student
- Signs in using university email and Supabase auth
- Maintains profile, skills, projects, internships, and availability
- Discovers other students and sends requests
- Chats only after permission is granted
- Joins or creates an FYP group

### Admin
- Logs in through admin routes, separate from student auth
- Views students, conversations, stats, and moderation actions
- Can suspend or delete student accounts

## 7. Hard Constraints That Must Not Be Broken
- Student registration is restricted to the university email domains `paf-iast.edu.pk` and `fecid.paf-iast.edu.pk`
- The OAuth local-part is treated as the registration number and must pass validation
- Only semesters 5 to 8 are valid for student onboarding and discovery eligibility
- Suspended accounts must not gain access to student features
- Message permission requires an accepted message request or a shared FYP group
- Partner requests must respect semester compatibility and group constraints
- A student can belong to only one FYP group at a time
- A group can only lock when it has 2 or 3 members
- Group removal should be blocked once a group is locked
- Conversations must remain unique per student pair
- AI validation should be deduplicated using `inputHash`

## 8. Major Features And Rules
### Authentication
- Student auth is handled through Supabase OAuth callback logic in `app/api/auth/callback/route.ts`
- Admin auth is handled through dedicated admin login and signup routes
- Route helpers in `lib/auth.ts` enforce authenticated and role-gated access

### Student Profile
- Profile data includes name, department, semester, picture, links, interests, availability, and visibility preferences
- Skills and projects are normalized into child records
- Internship and additional career fields exist in the schema and should be preserved unless there is a clear migration plan

### Discovery
- Discovery excludes the current user
- Discovery filters typically use department, semester, skills, and availability
- Discovery is intended to surface active students in the eligible semester range

### Requests
- `MESSAGE` requests unlock chat permissions
- `PARTNER` requests form FYP teams
- Duplicate pending requests should be rejected
- Self-requests should be rejected
- Partner request acceptance may create, merge, or extend a group

### Messaging
- One-to-one conversations are backed by `Conversation`
- Messages store sender, content, read state, edit state, and timestamps
- Open chats and unread counts are synced through realtime events

### Groups
- Group metadata includes project name, description, and lock state
- Members can update project information while allowed
- Visibility of group membership can be controlled per member profile

### Push And Notifications
- Push subscriptions are persisted in `PushSubscription`
- The app supports browser-level notifications using VAPID keys
- Realtime and push are complementary, not interchangeable

### AI Idea Validation
- Validation results are stored in `FYPIdeaValidation`
- The system keeps raw model output, scores, recommendations, and latency metadata
- Validation deduplication is important to avoid repeated AI calls for the same input

## 9. Important Files And Entry Points
- `app/api/auth/callback/route.ts`
- `app/api/admin/login/route.ts`
- `app/api/admin/signup/route.ts`
- `app/api/discovery/get-matched-students/route.ts`
- `app/api/messaging/*`
- `app/api/request/*`
- `app/api/group/*`
- `app/api/push/*`
- `app/dashboard/fyp/page.tsx`
- `app/dashboard/messages/*`
- `app/dashboard/discovery/*`
- `app/dashboard/profile/*`
- `app/admin/*`

## 10. Data Model Summary
### Core tables
- `User`: auth identity, role, and status
- `Student`: profile and academic data
- `Admin`: admin profile
- `Skill`: normalized skills
- `Project`: student projects
- `Internship`: work experience
- `Request`: message and partner workflow state
- `Conversation`: student-to-student chat container
- `Message`: chat messages
- `FYPGroup`: team metadata
- `FYPGroupMember`: membership join table
- `PushSubscription`: notification endpoints
- `FYPIdeaValidation`: AI evaluation history
- `PastFypIdea`: archive of historical ideas

### Important relationships
- `User` has optional `Student` or `Admin`
- `Student` has many `Skill`, `Project`, `Request`, `Conversation`, `Message`, and validation records
- `Conversation` has many `Message`
- `FYPGroup` has many `FYPGroupMember`
- `User` has many `PushSubscription`

## 11. Schema And Integrity Rules
- `Skill` is unique per student by name
- `FYPGroupMember` is unique per student
- `Conversation` is unique per ordered student pair
- `FYPIdeaValidation` is unique per student and input hash
- Message and request tables are intended for realtime subscriptions
- Indexes exist to support conversation listing, request filtering, and chat retrieval

## 12. Client Patterns To Preserve
- Use React Query for data fetching, caching, optimistic updates, and invalidation
- Keep API wrappers inside `services/`
- Keep server-side rules inside `modules/`
- Keep pages focused on presentation and local interaction state
- Keep Prisma client access centralized in `lib/db.ts`

## 13. Security Rules To Preserve
- Do not weaken the existing role checks
- Do not bypass `requireAuth()` or `requireRole()` in protected flows
- Do not remove university email validation from onboarding
- Do not expose admin actions through student routes
- Do not change realtime behavior without checking Supabase RLS policies
- Treat all sensitive env vars as server-only, especially Supabase service-role credentials

## 14. External Integrations
- Supabase Auth for login and session management
- Supabase PostgreSQL for persistence
- Supabase Realtime for request/message updates
- Web Push for browser notifications
- Email providers for transactional mail
- Groq for FYP idea evaluation

## 15. Documentation Status
The repository already has canonical docs in `docs/` that should be treated as the main reference set:
- `docs/SYSTEM_OVERVIEW.md`
- `docs/BUSINESS_LOGIC.md`
- `docs/SOFTWARE_REQUIREMENT_SPECIFICATION.md`
- `docs/DATABASE_DESIGN.md`
- `docs/COMPLETE_PROJECT_REPORT.md`
- `docs/PROJECT_REPORT.md`

Legacy reference docs still exist and may overlap:
- `docs/DOCUMENTATION.md`
- `docs/FEATURE_3_DISCOVERY.md`
- `docs/FEATURE_4_REQUEST_SYSTEM.md`
- `docs/MESSAGING_ARCHITECTURE.md`
- `docs/PROJECT_REPORT.md`
- `docs/SRS.md`
- `docs/DB_DESIGN.md`
- `docs/DIAGRAMS.md`

## 16. Safe Editing Guidelines For Future AI
- If you change auth, requests, messaging, or groups, trace the change through route handlers, module services, hooks, and UI caches.
- If you change schema, update Prisma migrations, generated client types, and the matching docs.
- If you change realtime behavior, verify notification subscriptions and Supabase policies.
- If you change response shapes, update the consuming hooks and UI components together.
- Prefer small, local edits over broad rewrites unless the task is explicitly a consolidation or refactor.

## 17. High-Risk Areas
- OAuth callback and student onboarding
- Partner request acceptance and group merge logic
- Conversation uniqueness and chat permission enforcement
- Realtime subscriptions and RLS policy assumptions
- AI idea validation persistence and deduplication

## 18. Short Handoff Summary For Another AI
FYP Finder is a Next.js + Supabase + Prisma university collaboration system. The most important things to preserve are student onboarding validation, role-based access control, request-driven messaging permissions, one-group-per-student constraints, one-conversation-per-pair constraints, and realtime notification behavior. Business rules live in `modules/`, data shape lives in `prisma/schema.prisma`, and canonical documentation now lives in `docs/`.
