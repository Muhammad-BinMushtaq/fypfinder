# Feature Execution Log & Parallel Development Plan — FYP Finder

## 1. Executive Strategy & Parallel Execution Architecture

To implement all features quickly without breaking existing logic or design aesthetics, development is divided into a **Phase 0 (Schema Setup)** followed by **2 Parallel Streams**. 

Running **2 Subagents concurrently** (one for Stream A, one for Stream B) is the optimal sweet spot. It doubles development speed while ensuring subagents work on completely isolated domains, preventing database schema locks and code merge conflicts. We will not run 4 agents at once, as that makes quality assurance and type-checking harder to manage.

```text
               ┌─────────────────────────────────────────┐
               │         Antigravity Main Agent          │
               │   (Orchestrator & Final QA Verifier)    │
               └────────────────────┬────────────────────┘
                                    │
                              [Phase 0: Schema]
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

| Phase | Stream | Feature Name | Primary Files Affected | Status | Subagent Role |
|---|---|---|---|---|---|
| **0** | **Core** | **Schema & DB Migrations** | `prisma/schema.prisma`, `npx prisma generate` | 🧪 VERIFIED | `orchestrator` |
| **1** | **Stream A** | **3. Seamless Onboarding & Command Palette** | `components/onboarding/`, `app/dashboard/layout.tsx`, `components/ui/` | 🧪 VERIFIED | `ui-onboarding-engineer` |
| **1** | **Stream A** | **1. Interactive Profile & PDF/GitHub Embeds** | `components/student/`, `modules/student/`, `app/dashboard/profile/` | 🧪 VERIFIED | `ui-profile-engineer` |
| **1** | **Stream B** | **2. FYP Validator Wizard & Radar Dashboard** | `modules/fyp-ideas/`, `components/fyp-ideas/` | 🧪 VERIFIED | `ai-validator-engineer` |
| **1** | **Stream B** | **4. Post-Lock FYP Workspace & Kanban Board** | `components/workspace/`, `app/api/group/`, `app/dashboard/fyp/` | 🧪 VERIFIED | `workspace-kanban-engineer` |

*Status Legend: ⏹️ NOT_STARTED | 🔄 IN_PROGRESS | ✅ COMPLETED | 🧪 VERIFIED*

---

## 3. Execution Plan: How We Run This

### Phase 0: Schema Serialization (The Main Agent)
Before any subagent starts, the Main Agent (Orchestrator) modifies `prisma/schema.prisma` to add all new fields (`FYPTask`, `onboardingCompleted`, `embedType`, etc.) and runs `prisma generate`. This prevents subagents from causing Prisma merge conflicts.

### Phase 1: Parallel Feature Execution (The Subagents)
Once Phase 0 is verified, the Orchestrator launches two subagents in the background using the `invoke_subagent` tool:
1. **Subagent A** handles Stream A (Features 1 & 3).
2. **Subagent B** handles Stream B (Features 2 & 4).

### Phase 2: Synthesis & QA (The Main Agent)
When both subagents report they are finished, the Orchestrator runs:
- `npx tsc --noEmit` (Type verification)
- `npm run build` (Build verification)
If errors exist, the Orchestrator fixes them or sends the subagent back to fix them. Once clean, the Orchestrator commits the code.

---

## 4. Verification Checklist & Regression Safety Rules

Before marking any feature as `VERIFIED`:
1. **TypeScript Type Check**: `npx tsc --noEmit` must return 0 errors.
2. **Build Check**: `npm run build` must compile cleanly.
3. **Authentication Check**: Signup domain check for `@paf-iast.edu.pk` remains enforced.
4. **Group Limits**: Single group per student and max 3 members per group remain strictly enforced.
