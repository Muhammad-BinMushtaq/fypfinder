# System Architecture — FYP Finder

Version: 1.0  
Date: 2026-02-09

**Overview**  
FYP Finder is a multi‑tier web application built with Next.js (App Router), Prisma ORM, and Supabase (PostgreSQL + Auth + Realtime). The system uses API routes for server-side operations and React Query for client data synchronization.

---

**Architecture Style**

- Client–Server with API routes
- Layered modules: UI → Hooks → Services → API → Modules → Database
- Event-driven updates via Supabase Realtime

---

**High-Level Components**

1. **Client UI (Next.js App Router)**
   - Pages in `app/`
   - Reusable components in `components/`
   - Uses React Query for caching and state synchronization

2. **Client Data Layer**
   - Hooks in `hooks/`
   - Services in `services/` for API calls
   - Notification provider and realtime listeners in `contexts/`

3. **Server API Layer**
   - Next.js API routes in `app/api/`
   - Auth checks via `lib/auth.ts`
   - Business logic delegated to `modules/`

4. **Business Logic Layer**
   - Domain services in `modules/`
   - Centralized rules for discovery, messaging, requests, groups, and admin

5. **Persistence Layer**
   - PostgreSQL (Supabase) via Prisma ORM
   - Schema defined in `prisma/schema.prisma`
   - Realtime events enabled for Request/Message tables

---

**Logical Flow (Request Lifecycle)**

```
UI Component
  → Hook (React Query)
    → Service (HTTP)
      → API Route (app/api)
        → Module (business rules)
          → Prisma → Database
          → Response back to UI
```

---

**Realtime Flow (Messages)**

```
Database INSERT → Supabase Realtime
  → Client Subscription (NotificationContext / ChatWindow)
    → React Query Cache Update
      → UI re-render
```

---

**Subsystems**

**Authentication**
- Supabase Auth for login/signup
- `lib/auth.ts` enforces role checks and suspension rules
- Users synchronized into Prisma `User` and `Student` tables

**Student Profile**
- CRUD operations for profile, skills, and projects
- Profile visibility and group display rules

**Discovery**
- Filtered search for eligible students
- Match scoring logic in `modules/discovery`

**Requests**
- Message and Partner requests
- Backend is the authority for validation
- Realtime invalidation via Supabase

**Messaging**
- One‑to‑one conversations
- Optimistic UI + realtime inserts
- Unread counts and conversation previews

**Groups**
- Membership enforced by join table
- Locking rules enforced in backend

**Admin**
- Admin login and session
- Student management and conversation viewing

---

**Deployment Architecture**

**Frontend / Backend**
- Same Next.js deployment (Vercel)
- Serverless API routes

**Database**
- Supabase PostgreSQL
- RLS enforced for realtime visibility

**Realtime**
- Supabase Realtime WebSocket

---

**Key Technical Decisions**

- **Supabase Auth + Prisma**: Auth handled by Supabase, domain data in Prisma.
- **React Query**: Single source of truth for client data.
- **Realtime as Notification**: Realtime events trigger cache updates and refetches.
- **Backend as Authority**: All validation and rule enforcement in server modules.

---

**Directory Architecture (Core)**

```
app/                 # Pages and API routes
components/          # UI components
hooks/               # React Query hooks
services/            # API client calls
modules/             # Business logic
contexts/            # Global providers (realtime)
lib/                 # Shared utilities (auth, db, supabase)
prisma/              # Schema
docs/                # Documentation
```

---

**Operational Concerns**

- **Caching**: React Query caches per feature with tuned staleTime/gcTime.
- **Security**: Role checks on all protected endpoints and RLS policies for realtime.
- **Performance**: Indexed queries on conversations and messages.
- **Reliability**: Optimistic updates with rollback and refetch on failure.

---

**Future Extension Points**

- Add push notifications via service workers.
- Add analytics/monitoring for request and messaging metrics.
- Add multi-admin roles with permission tiers.
