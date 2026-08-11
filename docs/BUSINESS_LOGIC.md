# Business Logic — FYP Finder

## 1. Overview
This document captures the authoritative business rules and decision logic implemented by FYP Finder. The server-side domain lives in `modules/`, and API routes delegate to these modules for all validation and permission enforcement.

## 2. Authentication and Student Onboarding

### Student Signup and Login
- Students authenticate via Microsoft OAuth through Supabase.
- `app/api/auth/callback/route.ts` handles the OAuth exchange and session setup.
- Only university email domains `paf-iast.edu.pk` and `fecid.paf-iast.edu.pk` are allowed.
- The local part of the email is treated as a registration number, validated by `validateStudentID()`.
- New students are created as `User(role=STUDENT)` and `Student` records.
- Existing users are matched by email; if the Supabase user ID changes, the Prisma `User.id` and `Student.userId` are updated.
- Suspended users are blocked from login after validation.

### Admin Authentication
- Admins authenticate through `/api/admin/login` using email/password.
- Admin signup requires an authenticated existing admin via `requireRole(UserRole.ADMIN)`.
- Admin accounts are stored in Prisma as `User(role=ADMIN)` plus a linked `Admin` profile.

## 3. Student Profile Management

### Profile fields
- Name, department, semester, profile picture, interests
- External links: LinkedIn, GitHub, phone
- Availability status: `AVAILABLE`, `BUSY`, `AWAY`
- Career goal, hobbies, preferred tech stack, industry preference
- Group visibility: `showGroupOnProfile`

### Portfolio data
- `Skill`: one entry per student/skill name, with experience level
- `Project`: student project records with optional links
- `Internship`: internship experience data

### Profile actions
- Update profile fields through `/api/student/update-my-profile`
- Add/update/remove skills and projects via nested endpoints
- Delete profile and cancel deletion actions

## 4. Discovery Logic

### Eligibility
- Only active students are included
- Current student is excluded
- Only students with semester 5–8 are considered for discovery (semester 8 has read-only partner request access)
- Availability filter defaults to `AVAILABLE`

### Filters and matching
- Supports filtering by department, semester, availability, skills
- Match scoring is based on:
  - shared skills
  - same department
  - same semester
  - project count or shared interests
- Matching is implemented in `modules/discovery/discovery.service.ts`

## 5. Request System

### Request types
- `MESSAGE`: request to enable one-to-one chat
- `PARTNER`: request to form or join a FYP group

### Rules for message requests
- Cannot send request to self
- Duplicate pending requests are blocked
- Request status transitions: `PENDING` → `ACCEPTED` / `REJECTED`
- Accepted message requests enable chat permission

### Rules for partner requests
- Partner requests require same semester eligibility
- Cannot target a locked or full group
- Accepting a partner request may:
  - create a new group
  - merge two existing groups
  - add a student to an existing group
- Groups are limited to 2–3 members
- Locked groups prevent members from leaving or being removed

### Request endpoints
- Message: `/api/request/message/*`
- Partner: `/api/request/partner/*`

## 6. Group Management

### Group lifecycle
- Groups are represented by `FYPGroup` and `FYPGroupMember`
- Each student may belong to only one group at a time
- Group metadata includes `projectName`, `description`, and `isLocked`

### Group business rules
- Group can be locked only when it has 2 or 3 members
- Locked groups cannot remove members
- Group visibility is controlled by each member’s `showGroupOnProfile`
- Project details may be updated only by group members

### Group endpoints
- `/api/group/get-my-group`
- `/api/group/update-project`
- `/api/group/update-visibility`
- `/api/group/lock`
- `/api/group/remove-member`

## 7. Messaging Logic

### Conversations
- One `Conversation` exists for a student pair
- Uniqueness enforced by `@@unique([studentAId, studentBId])`
- Conversations can be created when required by accepted message requests

### Message rules
- Messages belong to a conversation and are authored by a student sender
- `isRead`, `isEdited`, and `createdAt` are tracked
- Chat permission requires either accepted `MESSAGE` request or shared group membership
- Messages are validated and stored through `modules/messaging/messaging.service.ts`

### Real-time behavior
- Supabase Realtime syncs `Message` inserts to clients
- Open chat windows receive updates through `useRealtimeMessages`
- Notification context invalidates caches and updates unread counters

## 8. AI Idea Validation

### Validation storage model
- `FYPIdeaValidation` stores idea metadata, model outputs, scores, recommendations, and raw JSON results
- Inputs are hashed via `inputHash` to prevent duplicate validation work

### Validation workflow
- Students submit idea details through the UI
- AI evaluation is performed using `groq-sdk`
- Results include scores for feasibility, innovation, relevance, originality, usefulness
- Recommendation categories: `STRONGLY_RECOMMENDED`, `RECOMMENDED_WITH_CHANGES`, `NEEDS_MAJOR_REVISION`, `NOT_RECOMMENDED`

## 9. Push Notification Logic

### Subscription flow
- Clients subscribe via `/api/push/subscribe`
- Subscriptions are persisted in `PushSubscription`
- Routes also support unsubscribing and retrieving VAPID public keys

### Notification delivery
- `lib/push-service.ts` constructs and sends push payloads
- Notifications are used for messages, requests, and group events

## 10. Admin Controls

### Capabilities
- View all students and their status
- Suspend or delete student accounts
- Inspect conversation metadata and individual messages
- View platform statistics
- Send emails through integrated email service routes

### Admin API routes
- `/api/admin/login`
- `/api/admin/signup`
- `/api/admin/session`
- `/api/admin/logout`
- `/api/admin/get-all-students`
- `/api/admin/suspend-student`
- `/api/admin/delete-student`
- `/api/admin/conversations`
- `/api/admin/conversations/[conversationId]/messages`
- `/api/admin/stats`

### Admin business rules
- Admin signup requires existing admin authorization
- Only active admins may access admin dashboard routes
- Suspended users are served a locked state and prevented from logging in

## 11. Error Handling and Rate Limiting
- Rate limiting is applied for auth and admin login/signup endpoints (`lib/rate-limit.ts`)
- API responses consistently return `success`, `message`, and `data` fields
- OAuth callback includes cleanup of unauthorized users and redirects with error details

## 12. Notes
- The domain logic layer is the single source of truth. Avoid duplicating validation in page components.
- Any behavior change in discovery, requests, messaging, or groups should be reflected in `modules/` and corresponding API routes.
- New request or messaging types must consider permission, duplicate blocking, and realtime invalidation.
