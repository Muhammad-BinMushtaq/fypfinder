# 📚 FYP Finder — Master Single Source of Truth (SSOT)

> **Document Version**: 1.0.0  
> **Last Updated**: 2026-09-15  
> **Target Audience**: Developers, System Administrators, Project Reviewers, AI Assistants  

---

## 📋 Table of Contents

1. [System Overview & Purpose](#1-system-overview--purpose)
2. [Getting Started & Local Setup](#2-getting-started--local-setup)
3. [Technology Stack & System Architecture](#3-technology-stack--system-architecture)
4. [Complete Database Design & Schema](#4-complete-database-design--schema)
5. [Core Domain Business Logic](#5-core-domain-business-logic)
6. [Real-Time Messaging System Architecture](#6-real-time-messaging-system-architecture)
7. [AI-Powered FYP Idea Validation](#7-ai-powered-fyp-idea-validation)
8. [Push Notifications & Real-Time Sync](#8-push-notifications--real-time-sync)
9. [Admin Operations & Oversight](#9-admin-operations--oversight)
10. [Software Requirement Specification (SRS)](#10-software-requirement-specification-srs)
11. [AI Context & Engineering Guidelines](#11-ai-context--engineering-guidelines)
12. [Development History & Metrics](#12-development-history--metrics)
13. [Future Roadmap & Requirements](#13-future-roadmap--requirements)

---

## 1. System Overview & Purpose

**FYP Finder** is a centralized university collaboration platform built specifically for students at **PAF-IAST** (Pak-Austria Fachhochschule: Institute of Applied Sciences and Technology). It connects students, streamlines Final Year Project (FYP) partner matching based on compatible skills and interests, facilitates group creation and governance, provides real-time chat, and includes AI-assisted project idea evaluation.

### Key Capabilities
- **Student Discovery**: Algorithmic match scoring based on skills, department, semester, and project interests.
- **Request Workflows**: Dual-mode request system (`MESSAGE` requests for 1-on-1 chat and `PARTNER` requests for group formation).
- **Group Governance**: FYP group creation, strict group size limits (2–3 students), locking mechanisms, and profile visibility toggles.
- **Real-Time Communication**: Supabase Realtime-powered messaging with cache persisters and unread status tracking.
- **AI Idea Validation**: Automated 5-role panel evaluation and detailed roadmaps using Groq SDK LLMs.
- **Administrative Portal**: Separate admin authentication, user suspension/deletion controls, conversation monitoring, and analytics.

### Primary User Roles
1. **Student**: Authenticates via university Microsoft OAuth (`paf-iast.edu.pk` / `fecid.paf-iast.edu.pk`), maintains academic portfolio, searches for partners, sends requests, and collaborates in FYP teams.
2. **Admin**: Authenticates via dedicated admin credentials (`/admin/login`), inspects user metrics, manages account statuses, and monitors system communications.

---

## 2. Getting Started & Local Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **PostgreSQL Database**: Host instance (e.g., Supabase PostgreSQL)

### Step-by-Step Installation

1. **Clone the Repository**:
   ```powershell
   git clone https://github.com/Muhammad-BinMushtaq/fypfinder.git
   cd fypfinder
   ```

2. **Install Dependencies**:
   ```powershell
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env.local` file in the project root:
   ```env
   # Database connection
   DATABASE_URL="postgresql://user:password@host:5432/fypfinder?pgbouncer=true"
   DIRECT_URL="postgresql://user:password@host:5432/fypfinder"

   # Supabase Auth & Realtime
   NEXT_PUBLIC_SUPABASE_URL="https://your-supabase-project.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
   SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"

   # AI Validation (Groq API)
   GROQ_API_KEY="gsk_your_groq_api_key"

   # Email Service (Resend / Maileroo)
   RESEND_API_KEY="re_your_resend_api_key"

   # Web Push VAPID Keys
   NEXT_PUBLIC_VAPID_PUBLIC_KEY="your_public_vapid_key"
   VAPID_PRIVATE_KEY="your_private_vapid_key"
   VAPID_SUBJECT="mailto:support@fypfinder.paf-iast.edu.pk"
   ```

4. **Initialize Database Schema**:
   ```powershell
   npx prisma generate
   npx prisma db push
   ```

5. **Run Development Server**:
   ```powershell
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 3. Technology Stack & System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                               FYP FINDER STACK                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│ [Frontend]        Next.js 15 (App Router), React 19, Tailwind CSS v4, Lucide   │
│ [State & Sync]    TanStack React Query v5 (Persist Sync Storage)                │
│ [API Layer]       Next.js Server Actions & API Routes (/app/api/*)             │
│ [Domain Layer]    Modular Domain Services (/modules/*)                          │
│ [Persistence]     Prisma ORM 7 + PostgreSQL (hosted on Supabase)                │
│ [Realtime]        Supabase Realtime WebSockets & Web Push API                   │
│ [AI Integration]  Groq SDK (Llama-3 / DeepSeek LLM models)                        │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Module Boundary Principles
- `app/api/*`: HTTP transport layer. Parses input headers/body, invokes module services, returns standardized JSON responses `{ success: boolean, data?: T, error?: string }`.
- `modules/*`: Pure business logic layer. Contains all domain validations, entity operations, authorization checks, and data transformations.
- `lib/*`: Low-level platform adapters (`auth.ts`, `db.ts`, `supabase.ts`, `logger.ts`, `rate-limit.ts`).

---

## 4. Complete Database Design & Schema

The database uses PostgreSQL managed via Prisma (`prisma/schema.prisma`).

### Enums
- `UserRole`: `STUDENT`, `ADMIN`
- `UserStatus`: `ACTIVE`, `SUSPENDED`, `DELETION_REQUESTED`
- `AvailabilityStatus`: `AVAILABLE`, `BUSY`, `AWAY`
- `ExperienceLevel`: `BEGINNER`, `INTERMEDIATE`, `ADVANCED`
- `RequestType`: `MESSAGE`, `PARTNER`
- `RequestStatus`: `PENDING`, `ACCEPTED`, `REJECTED`
- `ValidationStatus`: `PENDING`, `COMPLETED`, `FAILED`
- `ValidationRecommendation`: `STRONGLY_RECOMMENDED`, `RECOMMENDED_WITH_CHANGES`, `NEEDS_MAJOR_REVISION`, `NOT_RECOMMENDED`

### Core Data Models

#### 1. `User` & `Student` / `Admin`
- **`User`**: Core auth record containing `id`, `email` (unique), `role`, `status`, `createdAt`.
- **`Student`**: Academic profile containing `userId`, `name`, `department`, `currentSemester` (1-8), `profilePicture`, `interests`, `careerGoal`, `hobbies`, `preferredTechStack`, `industryPreference`, `availability`, `showGroupOnProfile`, `seekingStatus` ("LOOKING_FOR_TEAM" | "HAS_TEAM_LOOKING_FOR_MEMBERS" | "NOT_LOOKING").
- **`Admin`**: Administrative identity linked to `User`.

#### 2. Portfolio Entities
- **`Skill`**: Linked to `Student`. Multi-attribute skills with `level` (`BEGINNER`, `INTERMEDIATE`, `ADVANCED`). Unique constraint on `[studentId, name]`.
- **`Project`**: Student personal projects with live/GitHub links, embed types (`GITHUB`, `PDF`, `DEMO`), and metadata.
- **`Internship`**: Work experiences (`companyName`, `position`, `duration`, `description`, `certificateLink`).

#### 3. Requests & Group Management
- **`Request`**: Connects two students (`fromStudentId`, `toStudentId`). Tracks `type` (`MESSAGE` or `PARTNER`), `reason`, `inviteNote`, and `status` (`PENDING`, `ACCEPTED`, `REJECTED`).
- **`FYPGroup`**: Represents an FYP team with `projectName`, `description`, `isLocked`.
- **`FYPGroupMember`**: Enforces that a student belongs to at most one group (`@@unique([studentId])`).
- **`FYPTask`**: Group Kanban tasks (`title`, `description`, `status` ("TODO" | "IN_PROGRESS" | "REVIEW" | "DONE"), `assignedToId`).

#### 4. Real-Time Chat System
- **`Conversation`**: One-to-one conversation context between `studentAId` and `studentBId`. Unique index `@@unique([studentAId, studentBId])`.
- **`Message`**: Chat message in a conversation (`senderId`, `content`, `isRead`, `isEdited`, `createdAt`).

#### 5. AI & Catalogs
- **`FYPIdeaValidation`**: Stores SHA-256 `inputHash` of inputs to cache LLM results, scores (feasibility, innovation, relevance, originality, usefulness), 5-evaluator panel review, and detailed roadmap.
- **`PastFypIdea`**: Archival dataset of past projects for keyword/abstract search and duplicate checking.
- **`PushSubscription`**: Web Push subscriptions (`endpoint`, `p256dh`, `auth`, `userAgent`).

---

## 5. Core Domain Business Logic

### Student Registration & OAuth Rule
- Only emails ending in `@paf-iast.edu.pk` or `@fecid.paf-iast.edu.pk` are allowed.
- The prefix is checked against registration pattern regexes (e.g. `21-FYP-XXX`).
- Existing accounts are matched by email; Supabase OAuth ID changes update the matching `User.id` and `Student.userId`.

### Discovery & Match Scoring
- Filter criteria: active status, semesters 5–8, department, availability status.
- **Match Score Formula**:
  - Base points for shared technical skills (`+15` per matching skill name).
  - Bonus for same department (`+20` points).
  - Bonus for same semester (`+15` points).
  - Portfolio project overlap bonus (`+10` points).

### Request & Messaging Permissions
- **Message Permission Rule**: Two students can message each other **IF AND ONLY IF**:
  1. An accepted `MESSAGE` request exists between them, **OR**
  2. They are active co-members of the same `FYPGroup`.
- Duplicate pending requests between the same two students are strictly rejected.

### FYP Group Lifecycle & Locking Rules
- Maximum group capacity: **3 members**. Minimum recommended: **2 members**.
- A group can only be **locked** when member count is between 2 and 3.
- When a group is **locked**:
  - Members cannot leave or be removed by other members.
  - New members cannot be added via partner requests.
  - Project title/description edits remain restricted to group members.

---

## 6. Real-Time Messaging System Architecture

```
Client App (React Query Cache) ◄──► WebSockets (Supabase Realtime Channel: messages:conv_id)
       │                                     ▲
       ▼ HTTP POST                           │ DB Trigger / INSERT Notification
Next.js API (/api/messaging/send) ──► PostgreSQL (Message Table)
```

### Synchronization Flow
1. **Cache Invalidation**: Sending a message performs an optimistic update in React Query and posts to `/api/messaging/send`.
2. **Realtime Broadcast**: PostgreSQL `INSERT` event triggers Supabase Realtime listener on channel `messages:{conversationId}`.
3. **Receipt & Read Receipts**: Receiving client receives payload, appends message to list, and issues a background mark-as-read API call if the chat window is active.

---

## 7. AI-Powered FYP Idea Validation

### Pipeline Stages
1. **Input Normalization & SHA-256 Hashing**: Normalizes title, problem statement, and core features into a unique hash `inputHash`. If hash exists in `FYPIdeaValidation`, cached result is returned instantly.
2. **Call 1 — Panel Evaluation**: Groq LLM evaluates proposal through 5 expert personas:
   - Technical Architect
   - Domain Specialist
   - Innovation Officer
   - Project Manager
   - Ethics & Feasibility Auditor
3. **Call 2 — Synthesis & Scoring**: Combines panel outputs into 5 dimensional scores (0–100) and final recommendation (`STRONGLY_RECOMMENDED` to `NOT_RECOMMENDED`).
4. **Call 3 — On-Demand Roadmap**: Generates a 4-phase, sprint-by-sprint implementation milestone guide.

---

## 8. Push Notifications & Real-Time Sync

- Uses browser Web Push API (`web-push` npm package with VAPID signatures).
- Events triggering push notifications:
  - New incoming chat message (when user is offline/backgrounded).
  - New partner or message request.
  - Request acceptance/rejection update.
  - Group locked/unlocked events.

---

## 9. Admin Operations & Oversight

- **Admin Login**: `/admin/login` (email/password with rate-limiting).
- **User Management**: Inspect student profiles, suspend accounts (`UserStatus.SUSPENDED`), or trigger deletion requests.
- **Audit & Compliance**: View platform analytics (total students, active groups, messages sent) and inspect conversation logs for conflict resolution or policy violations.

---

## 10. Software Requirement Specification (SRS)

| ID | Requirement | Priority | Verification Method |
| :--- | :--- | :--- | :--- |
| **FR-1** | Restrict registration to PAF-IAST domain emails | High | Unit & API Test |
| **FR-2** | Algorithmic partner discovery with multi-parameter filter | High | Integration Test |
| **FR-3** | Dual request workflow (`MESSAGE` and `PARTNER`) | High | E2E Flow Test |
| **FR-4** | FYP Group creation, 3-member limit, and group locking | High | Business Logic Test |
| **FR-5** | Real-time chat with message read tracking | High | WebSocket & Integration Test |
| **FR-6** | AI FYP Idea validation with cached response mechanism | Medium | Integration Test |
| **FR-7** | Web Push notification delivery for offline updates | Medium | Manual Device Test |
| **FR-8** | Admin portal with student account governance | High | Security & Role Test |

---

## 11. AI Context & Engineering Guidelines

### Codebase Conventions
- **No Direct DB Calls in UI**: Pages and components MUST call hooks or service functions; NEVER invoke Prisma directly from React components.
- **Zod Validation**: All API routes MUST validate `req.json()` payloads using Zod schemas.
- **Standardized API Response**:
  ```ts
  type ApiResponse<T> = {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
  };
  ```
- **Error Handling**: Throw typed domain errors in `modules/` and catch them cleanly in route handlers.

---

## 12. Development History & Metrics

### Key Milestones
- **v0.1.0 (Initial Release)**: Next.js 15 migration, Prisma schema setup, Supabase OAuth integration.
- **v0.2.0 (Messaging & Groups)**: Real-time Supabase channels, TanStack Query persister, group locking logic.
- **v0.3.0 (AI & Admin)**: Groq SDK integration for 3-call panel evaluation, past FYP idea catalog search, admin dashboard.

---

## 13. Future Roadmap & Requirements

1. **AI Group Recommendation**: Automatic group formation recommendation based on complementary skills (e.g., pairing a Frontend Lead with an AI Specialist).
2. **Supervisor Portal**: Direct integration for faculty members to review and approve group project proposals.
3. **Mobile Companion Application**: Native React Native / PWA version for mobile push and instant messaging.
