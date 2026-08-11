# Future Requirements & Feature Specifications — FYP Finder

## 1. Executive Summary & Document Purpose
This document provides an exhaustive technical and functional specification for upcoming features, userflow optimizations, and schema extensions for **FYP Finder**. It serves as the authoritative blueprint for future developers and AI assistants to implement enhancements without breaking existing core constraints (such as PAF-IAST email domain checks, semester 5–8 discovery rules, 2–3 member group locks, single-group membership, and one-conversation-per-pair limits).

---

## 2. Feature 1: Interactive Profile Enhancements & Media Portfolio

### 2.1 Overview & Goals
Transform student profiles from static resume-style pages into interactive portfolio showcases. Enable students to highlight past projects with embedded PDFs, live GitHub repository previews, and primary role badges.

### 2.2 Detailed Functional Requirements
1. **PDF Document Embedder**:
   - Allow students to attach PDF files (e.g., project reports, research papers, or certificates) to their profile or projects.
   - Render inline PDF previews using an embedded viewer (`react-pdf` or iframe preview) with page navigation and full-screen modal preview.
2. **Live GitHub & Project Embed Cards**:
   - When a student adds a GitHub or live web link to a project, auto-fetch or render an interactive rich preview card showing primary language, stars, forks, and live site favicon/meta title.
3. **Primary Skill Role Badges**:
   - Allow students to select up to 2 primary technical roles (e.g., `Frontend Lead`, `Backend Dev`, `AI/ML Specialist`, `UI/UX Designer`, `IoT/Embedded Lead`).
   - Display these badges prominently on discovery cards and profile headers.
4. **Profile Completion & Match Readiness Meter**:
   - Calculate profile completeness percentage based on: Profile picture (15%), Semester/Dept (15%), Skills >= 3 (20%), Projects >= 1 (20%), Bio/Interests (15%), Social Links (15%).
   - Show a non-intrusive progress banner encouraging students to complete missing fields.

### 2.3 Database Schema Additions (`prisma/schema.prisma`)
```prisma
// Extend Project model or add dedicated fields
model Project {
  // Existing fields...
  embedType     String?   // "GITHUB" | "PDF" | "DEMO"
  embedUrl      String?   // Raw embed URL or Supabase storage path
  mediaMetadata Json?     // { stars: 12, language: "TypeScript" }
}

// Extend Student model for role badges
model Student {
  // Existing fields...
  primaryRoles  Json?     // Array of strings e.g. ["AI/ML Specialist", "Frontend Lead"]
}
```

### 2.4 Guardrails & Non-Breaking Rules
- **DO NOT** delete existing `Project` fields (`liveLink`, `githubLink`, `description`).
- Keep PDF file uploads constrained to max 10MB via Supabase Storage bucket policies.
- Ensure profile visibility controls (`showGroupOnProfile`) continue to be respected when rendering public profiles.

---

## 3. Feature 2: Enhanced FYP Idea Validator & Semantic Vector Search

### 3.1 Overview & Goals
Upgrade the FYP Idea Validator from a basic input form into a guided multi-step wizard backed by semantic vector embeddings (`pgvector`) for historical FYP similarity detection and exportable PAF-IAST proposal documents.

### 3.2 Detailed Functional Requirements
1. **Multi-Step Guided Wizard (Stepper UI)**:
   - **Step 1: Domain & Title**: Select target domain (AI/ML, IoT, Web, Mobile, Cyber Security) and title.
   - **Step 2: Problem & Solution**: Describe the target problem and proposed technical approach.
   - **Step 3: Tech Stack & Scope**: Select tools, APIs, frameworks, and hardware requirements.
   - **Step 4: Team & Target Semester**: Specify team size (1-3) and expected semester completion.
2. **One-Click Quick Starter Templates**:
   - Provide pre-populated prompt templates for common domains (e.g., *"Smart Agriculture IoT Monitor"*, *"AI Medical Image Classifier"*) to allow one-click testing.
3. **Semantic Vector Search (`pgvector`) for Past FYPs**:
   - Generate embeddings for new proposal abstracts using `groq-sdk` or OpenAI embedding models.
   - Store embeddings in PostgreSQL using `pgvector`.
   - Calculate cosine similarity against `PastFypIdea` records to detect semantic overlap (e.g., identifying conceptual similarity even when phrasing differs).
4. **Visual Feasibility Dashboard**:
   - Render a radar chart breaking down: Feasibility (0-100), Originality (0-100), Complexity (0-100), Market Relevance (0-100), and Timeline Realism (0-100).
5. **Downloadable PAF-IAST Proposal PDF**:
   - Generate a single-click download of a structured PDF document formatted according to PAF-IAST FYP proposal standards, including Abstract, Proposed Methodology, Tech Stack, and Risk Assessment.

### 3.3 Database Schema Additions (`prisma/schema.prisma`)
```prisma
// Add vector column support via raw SQL migration for pgvector
// In PastFypIdea:
model PastFypIdea {
  // Existing fields...
  // embedding Unsupported("vector(1536)")?
}

// In FYPIdeaValidation:
model FYPIdeaValidation {
  // Existing fields...
  originalityScore Int?     // 0 - 100
  feasibilityScore   Int?     // 0 - 100
  complexityScore   Int?     // 0 - 100
  radarBreakdown    Json?    // Detailed radar scores
}
```

### 3.4 Guardrails & Non-Breaking Rules
- Preserve the existing `inputHash` deduplication logic in `modules/fyp-ideas/fyp-ideas.service.ts` to avoid redundant LLM billing/API usage.
- Fallback to text matching if the vector extension is disabled or unavailable during offline testing.

---

## 4. Feature 3: Seamless Onboarding & Interactive Discovery UX

### 4.1 Overview & Goals
Eliminate user drop-off during registration and make teammate discovery seamless through guided onboarding and rapid search utilities.

### 4.2 Detailed Functional Requirements
1. **3-Step First-Time Onboarding Modal**:
   - Trigger automatically after OAuth callback if `Student` profile lacks semester or department.
   - *Step 1*: Select Department & Semester (restrict options to Semesters 5–8).
   - *Step 2*: Choose Top 3 Skills & Experience Levels.
   - *Step 3*: Set Group Seeking Status (`LOOKING_FOR_TEAM`, `HAS_TEAM_LOOKING_FOR_MEMBERS`, `NOT_LOOKING`).
2. **Global Command Palette (`Ctrl + K` / `Cmd + K`)**:
   - Keyboard-accessible modal overlay to search for students by skill/name, search past FYP ideas, jump to active messages, or navigate dashboard pages.
3. **One-Click Team Invites with Custom Notes**:
   - Allow sending a `PARTNER` request directly from a student's discovery card with an optional 200-character invitation message.
4. **Role Gap Highlighter in Discovery**:
   - If the current user is in an un-locked group of 2, highlight students in discovery whose primary roles fill missing skills (e.g., *"Fills your group's missing Mobile Dev role"*).

### 4.3 Database Schema & API Changes
- Add `onboardingCompleted Boolean @default(false)` to `Student` model.
- Add optional `inviteNote String?` field to `Request` model.

### 4.4 Guardrails & Non-Breaking Rules
- Onboarding **MUST NOT** bypass email domain validation (`@paf-iast.edu.pk` or `@fecid.paf-iast.edu.pk`).
- Semester eligibility checks (Semesters 5 to 8) must strictly apply during onboarding step 1.

---

## 5. Feature 4: Post-Lock FYP Workspace & Milestone Kanban Board

### 5.1 Overview & Goals
Once an FYP group is complete and locked (2-3 members), provide a lightweight internal workspace to track project milestones, task progress, and upcoming university deadlines.

### 5.2 Detailed Functional Requirements
1. **Group Workspace Tab**:
   - Unlock a dedicated "FYP Workspace" tab inside `/dashboard/fyp` once `FYPGroup.isLocked` is `true`.
2. **Task & Milestone Kanban Board**:
   - Columns: `To Do`, `In Progress`, `Under Review`, `Completed`.
   - Allow group members to create tasks, assign members, set due dates, and attach links.
3. **University Deadline Timeline Tracker**:
   - Display a pre-set PAF-IAST FYP timeline calendar (e.g., Proposal Submission, Mid-term Evaluation, Final Defense, Documentation Submission).

### 5.3 Database Schema Additions (`prisma/schema.prisma`)
```prisma
model FYPTask {
  id          String     @id @default(uuid())
  groupId     String
  title       String
  description String?    @db.Text
  status      String     @default("TODO") // "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE"
  assignedToId String?
  dueDate     DateTime?
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  group       FYPGroup   @relation(fields: [groupId], references: [id], onDelete: Cascade)
  assignedTo  Student?   @relation(fields: [assignedToId], references: [id], onDelete: SetNull)

  @@index([groupId])
  @@index([status])
}
```

### 5.4 Guardrails & Non-Breaking Rules
- Milestone board access is **ONLY** enabled for locked group members (`FYPGroupMember`).
- Unlocked or unformed groups should see the standard group creation/partner request UI.

---

## 6. Architectural Guardrails & Backward Compatibility Checklist

When implementing any of the features described above, the following non-negotiable system rules must be adhered to:

| Area | Guardrail Rule |
|---|---|
| **Authentication** | Never relax the `@paf-iast.edu.pk` and `@fecid.paf-iast.edu.pk` email domain check during onboarding or auth callback. |
| **Semester Rules** | Restrict discovery and partner request eligibility to semesters 5–8 exclusively. |
| **Group Limits** | Enforce max group size of 3 and strictly 1 group per student at all times. |
| **Group Locks** | Once `FYPGroup.isLocked` is true, block `remove-member` or group deletion API calls. |
| **Messaging Integrity** | Maintain 1-to-1 conversation uniqueness via `@@unique([studentAId, studentBId])` and enforce request permission checks before granting chat access. |
| **API Response Format** | All API route handlers must return standard JSON format: `{ success: boolean, message?: string, data?: any }`. |
| **State Management** | Wrap all data mutations with TanStack React Query cache invalidations using key patterns defined in `services/`. |
