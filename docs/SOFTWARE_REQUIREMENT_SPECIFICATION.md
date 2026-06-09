# Software Requirement Specification — FYP Finder

## 1. Introduction

### 1.1 Purpose
This document defines the functional and nonfunctional requirements for FYP Finder, a collaboration platform for PAF-IAST final year project students.

### 1.2 Scope
FYP Finder supports student discovery, messaging, partner requests, FYP group management, admin oversight, AI idea validation, and notifications.

### 1.3 Definitions
- **Student**: authenticated PAF-IAST user with a student profile.
- **Admin**: authenticated user with elevated platform management privileges.
- **Request**: an action seeking permission to chat or join a project group.
- **Conversation**: a one-to-one chat between two students.
- **FYP Group**: a team of 2–3 students working on a project.

## 2. Overall Description

### 2.1 Product Perspective
The application is a single Next.js project with integrated frontend, API routes, and server-side business logic. It uses Supabase for authentication, PostgreSQL persistence, and realtime sync.

### 2.2 Product Functions
- Student registration and login via university email OAuth
- Profile creation and updating
- Student discovery and matching
- Message request workflow and chat
- Partner request workflow and FYP group creation
- Group project details and locking
- AI-assisted idea validation
- Push notifications and realtime updates
- Admin management of users and conversations

### 2.3 User Characteristics
- Students may not be technical and need a clear discovery/chat workflow.
- Admins need a secure dashboard for moderating student activity.

### 2.4 Constraints
- Only students with `paf-iast.edu.pk` or `fecid.paf-iast.edu.pk` email domains may register.
- Student registration numbers must be validated against institution rules.
- Groups can contain a maximum of three students.
- Messaging requires explicit permission through accepted request or group membership.

### 2.5 Assumptions and Dependencies
- Supabase services remain available for auth and realtime.
- PostgreSQL schema stays in sync with Prisma migrations.
- Web push subscriptions are only valid in supported browsers.

## 3. Functional Requirements

### 3.1 Authentication and Authorization
- FR1: System shall authenticate students using Microsoft OAuth via Supabase.
- FR2: System shall validate allowed email domains and student registration numbers.
- FR3: System shall authenticate admins using email/password.
- FR4: System shall enforce role-based route access.

### 3.2 Student Profile Management
- FR5: Students shall create and edit profile details.
- FR6: Students shall add, update, and remove skills.
- FR7: Students shall add, update, and remove project entries.
- FR8: Students shall add professional links and availability status.
- FR9: Students shall opt to show or hide FYP group membership on public profiles.

### 3.3 Discovery
- FR10: Students shall search for peers using department, semester, availability, and skills filters.
- FR11: System shall exclude the current student from discovery results.
- FR12: System shall rank matches by shared academic and skill attributes.

### 3.4 Request Workflows
- FR13: Students shall send message requests to enable chat.
- FR14: Students shall send partner requests to invite others to FYP groups.
- FR15: System shall prevent duplicate pending requests.
- FR16: System shall reject requests to oneself.
- FR17: System shall allow request acceptance or rejection.
- FR18: Accepted partner requests shall create or update groups.

### 3.5 Messaging
- FR19: Students shall create or resume one-to-one conversations.
- FR20: Students shall send and receive chat messages.
- FR21: System shall mark messages as read and provide unread counts.
- FR22: Chat access shall require an accepted message request or shared group membership.

### 3.6 FYP Group Management
- FR23: Students shall view their current FYP group and members.
- FR24: Group members shall update project name and description.
- FR25: Students shall lock groups when membership is complete.
- FR26: Locked groups shall prevent member removal.

### 3.7 AI Idea Validation
- FR27: Students shall submit an idea for AI evaluation.
- FR28: System shall persist AI evaluation results and recommendations.
- FR29: System shall avoid duplicate validation using input hashing.

### 3.8 Notifications
- FR30: System shall support browser push subscription and unsubscription.
- FR31: System shall send notifications for incoming messages and requests.
- FR32: System shall reflect realtime updates in the UI.

### 3.9 Admin Capabilities
- FR33: Admins shall view all students and account status.
- FR34: Admins shall suspend or delete student accounts.
- FR35: Admins shall inspect conversation metadata and message history.
- FR36: Admins shall view platform statistics.

## 4. Nonfunctional Requirements

### 4.1 Performance
- NFR1: Discovery and messaging endpoints shall respond with minimal latency.
- NFR2: Realtime updates shall appear within seconds of database changes.

### 4.2 Security
- NFR3: All protected routes shall require authentication.
- NFR4: Admin functionality shall be access-controlled.
- NFR5: User input shall be validated on the server.
- NFR6: Rate limiting shall protect auth endpoints.

### 4.3 Reliability
- NFR7: System shall handle invalid or expired auth sessions gracefully.
- NFR8: Suspended accounts shall not access protected resources.

### 4.4 Maintainability
- NFR9: Business rules shall be centralized in `modules/`.
- NFR10: API contracts shall be defined consistently in `services/`.
- NFR11: Documentation shall reflect actual behavior and route structure.

## 5. External Interface Requirements

### 5.1 User Interfaces
- Web UI consists of dashboard pages under `/dashboard`, admin pages under `/admin`, and landing/auth pages.

### 5.2 Hardware Interfaces
- Browser-based clients only.

### 5.3 Software Interfaces
- Supabase Auth and Realtime
- PostgreSQL database via Prisma
- Web push APIs in supported browsers
- Third-party email and AI services

## 6. System Features Traceability
- Discovery feature maps to `app/api/discovery/get-matched-students`, `modules/discovery/discovery.service.ts`, and `app/dashboard/discovery`
- Messaging maps to `app/api/messaging/*`, `modules/messaging/messaging.service.ts`, and `app/dashboard/messages`
- Requests map to `app/api/request/*`, `modules/request/request.service.ts`, and `app/dashboard/requests`
- Groups map to `app/api/group/*`, `modules/group/group.service.ts`, and `app/dashboard/fyp`
- Admin maps to `app/api/admin/*` and `app/admin/`

## 7. Assumptions
- University email validation logic remains current with registration formats.
- Supabase Realtime and Web Push are correctly configured and enabled.

## 8. Appendices
- `prisma/schema.prisma`
- `app/api/auth/callback/route.ts`
- `lib/auth.ts`
- `lib/push-service.ts`
- `supabase/enable_realtime_messages.sql`
- `supabase/enable_realtime_requests.sql`
