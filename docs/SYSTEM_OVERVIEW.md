# FYP Finder — System Overview

## Purpose
FYP Finder is a university collaboration platform for PAF-IAST students to discover teammates, form final year project (FYP) groups, exchange partner and message requests, validate project ideas, and chat in real time.

## Key Goals
- Help students find peers with compatible skills and interests
- Enable secure messaging and partner request workflows
- Support FYP group creation, locking, and visibility control
- Provide admin oversight for student management and conversation monitoring
- Include AI-assisted idea validation and web push notifications

## Primary User Roles
- **Student**: registers using PAF-IAST email, maintains profile, searches for collaborators, sends requests, chats, and participates in FYP groups.
- **Admin**: authenticates with dedicated admin credentials, manages student accounts, views statistics, and monitors conversations.

## Core User Journeys
1. Student logs in via Supabase/Microsoft OAuth with university email.
2. Platform validates student registration number and creates a `Student` profile.
3. Student uses discovery filters to search for compatible teammates.
4. Student sends message or partner requests to other students.
5. Upon request acceptance, students can chat or form a FYP group.
6. Group members can edit project details, lock the group, and choose whether to show the group on public profiles.
7. Admins log in separately to manage users, suspend or delete accounts, and inspect conversations and stats.

## High-Level Architecture
- **Frontend**: Next.js App Router pages in `app/`, reusable UI under `components/`, state and API integration in `hooks/` and `services/`.
- **API Layer**: Next.js server routes under `app/api/` that handle requests for auth, student profile, discovery, messaging, requests, groups, push, and admin.
- **Business Logic**: Domain rules live in `modules/` and enforce permissions, validation, group rules, messaging permissions, and admin actions.
- **Persistence**: Prisma ORM with PostgreSQL via Supabase, schema defined in `prisma/schema.prisma`.
- **Realtime & Notifications**: Supabase Realtime subscriptions and web push notifications for message/request updates.

## Technology Stack
- `next` 15.5.9
- `react` 19.1.0
- `typescript` 5
- `tailwindcss` 4
- `prisma` 7.3.0
- `@supabase/supabase-js` 2.90.1
- `@tanstack/react-query` 5
- `groq-sdk` for idea validation
- `resend` and `maileroo-sdk` for email
- `web-push` for notifications

## Repository Layout
- `app/`: page routes and server API endpoints
- `components/`: reusable UI components and feature blocks
- `hooks/`: React Query hooks for data and feature state
- `services/`: HTTP API client wrappers
- `modules/`: server-side domain business logic
- `lib/`: shared utilities (`auth`, `db`, `supabase`, `logger`, `rate-limit`)
- `prisma/`: database schema and migrations
- `docs/`: project documentation and audit artifacts

## Authentication & Authorization
- Supabase handles auth sessions and OAuth flows.
- `lib/auth.ts` validates the Supabase session and maps to Prisma `User` records.
- Student signup is restricted to verified PAF-IAST email domains and validated registration numbers.
- Admins use email/password login and have dedicated `/api/admin/*` routes.
- Role-based access is enforced in API routes and module services.

## Data Model Summary
- `User`: authentication identity, role, status
- `Student`: profile, availability, skills, projects, requests, group membership
- `Admin`: admin profile linked to `User`
- `Skill`, `Project`, `Internship`: student portfolio data
- `Request`: message or partner request workflows
- `Conversation`, `Message`: one-to-one chat system
- `FYPGroup`, `FYPGroupMember`: FYP team structure
- `PushSubscription`: web push endpoints
- `FYPIdeaValidation`: AI-generated idea validation records
- `PastFypIdea`: archived idea catalog

## Important Entrypoints
- `/dashboard/discovery`
- `/dashboard/messages`
- `/dashboard/requests`
- `/dashboard/profile`
- `/dashboard/fyp`
- `/admin/login`
- `/admin/dashboard`

## Current Documentation State
The project already includes existing documentation in `docs/`. This overview is intended to become the central, single-source reference for system purpose, structure, and core behavior.