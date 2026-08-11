# Feature Execution Log & Parallel Development Plan — FYP Finder

## 1. Executive Strategy & Parallel Execution Architecture

To implement all features quickly without breaking existing logic or design aesthetics, development is divided into **2 Parallel Streams**. Running **2 Subagents concurrently** is the optimal sweet spot: it doubles development speed while ensuring subagents work on isolated files, preventing database schema locks and code merge conflicts.

```text
               ┌─────────────────────────────────────────┐
               │         Antigravity Main Agent          │
               │   (Orchestrator & Final QA Verifier)    │
               └────────────────────┬────────────────────┘
                                    │
           ┌────────────────────────┴────────────────────────┐
           ▼                                                 ▼
┌──────────────────────────────┐                 ┌──────────────────────────────┐
│       STREAM A SUBAGENT      │                 │       STREAM B SUBAGENT      │
│  UI, Profile & Onboarding    │                 │ FYP Validator & Workspace    │
├──────────────────────────────┤                 ├──────────────────────────────┤
│ - Feature 3: Onboarding UI   │                 │ - Feature 2: Validator AI    │
│ - Feature 1: Profile Embeds  │                 │ - Feature 4: Group Workspace │
│ - Command Palette (Ctrl+K)   │                 │ - Kanban Task Engine         │
└──────────────────────────────┘                 └──────────────────────────────┘
```

---

## 2. Feature Execution Status Tracker

| Stream | Feature Name | Primary Files Affected | Status | Subagent Role |
|---|---|---|---|---|
| **Stream A** | **3. Seamless Onboarding & Command Palette** | `app/(auth)/callback`, `components/onboarding/`, `lib/auth.ts` | ⏹️ NOT_STARTED | `ui-onboarding-engineer` |
| **Stream A** | **1. Interactive Profile & PDF/GitHub Embeds** | `components/student/`, `modules/student/`, `app/dashboard/profile/` | ⏹️ NOT_STARTED | `ui-profile-engineer` |
| **Stream B** | **2. FYP Validator Wizard & Radar Dashboard** | `modules/fyp-ideas/`, `app/api/fyp-ideas/`, `components/fyp-ideas/` | ⏹️ NOT_STARTED | `ai-validator-engineer` |
| **Stream B** | **4. Post-Lock FYP Workspace & Kanban Board** | `modules/group/`, `app/api/group/`, `components/workspace/` | ⏹️ NOT_STARTED | `workspace-kanban-engineer` |

*Status Legend: ⏹️ NOT_STARTED \| 🔄 IN_PROGRESS \| ✅ COMPLETED \| 🧪 VERIFIED*

---

## 3. Stream A Details: Profile, Onboarding & UX Enhancements

### 3.1 Task Breakdown
- [ ] **Task A.1**: Add `onboardingCompleted` flag check to OAuth callback & create 3-step Onboarding Modal (`Semesters 5-8`, `Top 3 Skills`, `Seeking Status`).
- [ ] **Task A.2**: Implement `Ctrl + K` Global Command Palette component for searching students, ideas, and pages.
- [ ] **Task A.3**: Add Primary Role Badges (`AI/ML Specialist`, `Frontend Lead`, etc.) to student profile headers and discovery cards.
- [ ] **Task A.4**: Add PDF previewer component & GitHub repository stats card to student projects.
- [ ] **Task A.5**: Implement Profile Completion Progress Meter (0-100%).

### 3.2 Key Target Files
- `components/onboarding/OnboardingModal.tsx` [NEW]
- `components/ui/CommandPalette.tsx` [NEW]
- `components/student/ProjectEmbedCard.tsx` [NEW]
- `app/dashboard/profile/page.tsx` [MODIFY]
- `modules/student/student.service.ts` [MODIFY]

---

## 4. Stream B Details: FYP Validator & Group Workspace Engine

### 4.1 Task Breakdown
- [ ] **Task B.1**: Refactor FYP Validator UI into a 4-Step Stepper Wizard (Domain -> Problem/Solution -> Tech Stack -> Team).
- [ ] **Task B.2**: Add visual Radar Chart component for scores (Feasibility, Originality, Complexity, Market Relevance, Timeline).
- [ ] **Task B.3**: Add PAF-IAST formatted FYP Proposal PDF download generator (`jspdf`/`pdf-lib`).
- [ ] **Task B.4**: Add `FYPTask` schema model to `prisma/schema.prisma` and run `npx prisma generate`.
- [ ] **Task B.5**: Create Post-Lock Group Workspace tab in `/dashboard/fyp` with Kanban Board (`To Do`, `In Progress`, `Review`, `Done`).

### 4.2 Key Target Files
- `components/fyp-ideas/ValidatorWizard.tsx` [NEW]
- `components/fyp-ideas/RadarChart.tsx` [NEW]
- `modules/fyp-ideas/fyp-ideas.service.ts` [MODIFY]
- `prisma/schema.prisma` [MODIFY]
- `components/workspace/KanbanBoard.tsx` [NEW]

---

## 5. Standard Operating Procedure (SOP) for Running Parallel Subagents

### Step 1: Launching the Parallel Subagents
Give the orchestrator agent the following prompt:

```text
"Run 2 parallel subagents to implement Phase 1 features from docs/DEVELOPMENT_LOG.md:
 Subagent 1 (Role: ui-onboarding-engineer): Build Stream A Tasks (Onboarding Modal & Role Badges).
 Subagent 2 (Role: ai-validator-engineer): Build Stream B Tasks (FYP Validator Stepper Wizard & Radar UI).
 Ensure both agents modify only their respective files and report back when finished."
```

### Step 2: Concurrent Execution & Reactive Wakeup
- Both subagents run simultaneously in their own isolated task contexts.
- You do not need to wait or poll in loops; Antigravity will notify you automatically when both subagents finish.

### Step 3: Synthesis & Full Type Verification
Once both subagents complete their tasks:
1. The Orchestrator main agent inspects the changes.
2. Runs type verification: `npx tsc --noEmit`.
3. Runs build check: `npm run build`.
4. Updates the status table in `docs/DEVELOPMENT_LOG.md` from `IN_PROGRESS` to `VERIFIED`.

---

## 6. Verification Checklist & Regression Safety Rules

Before marking any feature as `VERIFIED`:
1. **TypeScript Type Check**: `npx tsc --noEmit` must return 0 errors.
2. **Build Check**: `npm run build` must compile cleanly.
3. **Authentication Check**: Signup domain check for `@paf-iast.edu.pk` remains enforced.
4. **Group Limits**: Single group per student and max 3 members per group remain strictly enforced.
