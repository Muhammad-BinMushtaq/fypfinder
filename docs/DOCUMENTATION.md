# FYP Finder Documentation

## Overview
FYP Finder is a university-focused social interaction and collaboration platform built for Final Year Project (FYP) teams at PAF-IAST. Students create profiles, discover teammates, send message and partner requests, and chat in real time. Admins can manage students, view conversations, and monitor platform activity.

## Tech Stack
- Next.js (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Prisma ORM
- PostgreSQL (Supabase)
- Supabase Auth and Realtime
- React Query (TanStack)

## High-Level Architecture
1. UI layer in `app/` pages and `components/`
2. Client state and data fetching in `hooks/` with React Query
3. API contract layer in `services/`
4. Server routes in `app/api/`
5. Business logic in `modules/`
6. Realtime and notifications in `contexts/NotificationContext.tsx` and `hooks/messaging/useRealtimeMessages.ts`

## Roles
- Student: uses discovery, profile, messaging, and group features
- Admin: manages students, views conversations, and checks stats

## Data Model
Defined in `prisma/schema.prisma`.

Key entities
- User: auth identity, role, status
- Student: profile data and relations to skills, projects, requests, messages, and group
- Skill, Project: student portfolio items
- Request: message and partner requests
- Conversation: one-to-one chat between two students
- Message: chat messages with read tracking
- FYPGroup, FYPGroupMember: team membership and lock state

## Authentication and Authorization
- Supabase Auth is used for session handling
- `lib/auth.ts` provides `requireAuth` and `requireRole`
- Suspended users are blocked from student actions
- API routes enforce role checks where required

## Discovery Feature
Flow
1. Client calls `services/discovery.service.ts`
2. API route `/api/discovery/get-matched-students`
3. Business rules in `modules/discovery/discovery.service.ts`

Rules
- Excludes current user
- Only semesters 5 to 7
- Only ACTIVE users
- Default availability filter is AVAILABLE
- Optional filters for department, semester, skills, availability
- Match score based on skills, department, semester, and project count

## Messaging Feature
Flow
1. Start conversation via `/api/messaging/start`
2. Fetch messages via `/api/messaging/get-messages`
3. Send messages via `/api/messaging/send`
4. Mark read via `/api/messaging/mark-read`
5. Realtime updates via `useRealtimeMessages`

Key behavior
- Optimistic UI updates when sending
- Realtime inserts update cache for open chat
- Conversation list and unread count are invalidated by realtime

## Request System
Message requests
- Enable chat permission between two students
- Endpoints in `/api/request/message/*`

Partner requests
- Form FYP groups
- Endpoints in `/api/request/partner/*`

Rules
- No self requests
- Message requests block duplicates if pending
- Partner requests require same semester
- Partner requests block if group locked or full
- Accepting partner request creates or merges group

## Groups
Endpoints
- `/api/group/get-my-group`
- `/api/group/update-project`
- `/api/group/lock`
- `/api/group/remove-member`
- `/api/group/update-visibility`

Rules
- Group can lock only with 2 or 3 members
- Locked groups cannot remove members
- Only members can update group data

## Admin
Endpoints
- `/api/admin/login`, `/api/admin/signup`, `/api/admin/session`, `/api/admin/logout`
- `/api/admin/get-all-students`
- `/api/admin/suspend-student`
- `/api/admin/delete-student`
- `/api/admin/conversations`
- `/api/admin/conversations/[conversationId]/messages`
- `/api/admin/stats`

Capabilities
- Manage student accounts
- View conversations and messages
- Monitor platform stats

## Realtime and Notifications
- `NotificationContext.tsx` subscribes to Request and Message inserts
- Invalidates caches for conversations and unread count
- Displays toast notifications and NotificationBell badge updates
- `useRealtimeMessages.ts` updates open chat in real time

## Client Caching Strategy
React Query keys
- `['conversations']`
- `['messages', conversationId]`
- `['unreadCount']`
- Profile and request keys in corresponding hooks

Defaults
- Queries use staleTime and gcTime tuned for realtime updates
- Refetch on window focus is disabled in most cases

## Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`
- `SECRET_SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`
- `SHADOW_DATABASE_URL`
- `NEXT_PUBLIC_APP_URL`

## Scripts
- `npm run dev`
- `npm run build`
- `npm run start`

## Project Structure
Top level
- `app/`: pages and API routes
- `components/`: reusable UI
- `hooks/`: React Query and feature hooks
- `modules/`: server-side business logic
- `services/`: API contract layer
- `contexts/`: global state and realtime providers
- `lib/`: shared utilities
- `prisma/`: schema
- `docs/`: project documentation

## Important Pages
- `/` landing page
- `/login`, `/signup`
- `/dashboard/discovery`
- `/dashboard/messages`
- `/dashboard/messages/[conversationId]`
- `/dashboard/requests/messages`
- `/dashboard/requests/partner`
- `/dashboard/profile`
- `/dashboard/fyp`
- `/admin/login`, `/admin/signup`
- `/admin/(authenticated)/dashboard`
- `/admin/(authenticated)/students`
- `/admin/(authenticated)/messages`

## API Summary
Authentication
- POST `/api/auth/signup`
- POST `/api/auth/login`
- POST `/api/auth/logout`
- GET `/api/auth/session`

Student profile
- GET `/api/student/get-my-profile`
- PATCH `/api/student/update-my-profile`
- PATCH `/api/student/skill/add`
- PATCH `/api/student/skill/update`
- DELETE `/api/student/skill/remove`
- PATCH `/api/student/project/add`
- PATCH `/api/student/project/update`
- DELETE `/api/student/project/remove`
- PATCH `/api/student/delete-my-profile`
- PATCH `/api/student/cancel-deletion`
- GET `/api/student/get-public-profile/[studentId]`

Discovery
- GET `/api/discovery/get-matched-students`

Messaging
- POST `/api/messaging/start`
- GET `/api/messaging/get-messages`
- POST `/api/messaging/send`
- POST `/api/messaging/mark-read`
- GET `/api/messaging/get-conversations`
- GET `/api/messaging/unread-count`
- GET `/api/messaging/check-permission`

Requests
- POST `/api/request/message/send`
- GET `/api/request/message/get-sent`
- GET `/api/request/message/get-received`
- POST `/api/request/message/accept`
- POST `/api/request/message/reject`
- POST `/api/request/partner/send`
- GET `/api/request/partner/get-sent`
- GET `/api/request/partner/get-received`
- POST `/api/request/partner/accept`
- POST `/api/request/partner/reject`

Groups
- GET `/api/group/get-my-group`
- PATCH `/api/group/update-project`
- PATCH `/api/group/update-visibility`
- PATCH `/api/group/lock`
- PATCH `/api/group/remove-member`

Admin
- POST `/api/admin/signup`
- POST `/api/admin/login`
- GET `/api/admin/session`
- POST `/api/admin/logout`
- GET `/api/admin/get-all-students`
- PATCH `/api/admin/suspend-student`
- DELETE `/api/admin/delete-student`
- GET `/api/admin/stats`
- GET `/api/admin/conversations`
- GET `/api/admin/conversations/[conversationId]/messages`

## Notes
- Supabase Realtime must be enabled for the `Message` table in the Supabase dashboard
- Ensure RLS policies allow required realtime events and API access
- Messaging permissions are granted by accepted message requests or shared group
