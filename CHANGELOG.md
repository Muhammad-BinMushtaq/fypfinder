# Changelog

All notable changes to the **FYP Finder** project will be documented in this file.

## [Unreleased] - 2026-08-11

### Added
- **Feature 1: Interactive Profiles & Media Portfolio**
  - Added primary role badges (e.g., Frontend Lead, AI/ML Specialist) to student profiles.
  - Added `ProjectEmbedCard` to render live GitHub repository stats (stars, forks, language) and PDF project previews.
  - Upgraded the Profile Completion Progress meter to include onboarding and seeking status criteria.
- **Feature 2: Enhanced FYP Validator & Radar Dashboard**
  - Upgraded the AI validation form into a multi-step `ValidatorWizard` (Domain → Problem → Stack → Team).
  - Built an animated SVG `RadarChart` component to visually break down AI validation scores.
  - Added a `ProposalDownloadButton` using `jspdf` to generate PAF-IAST formatted FYP Proposal PDFs directly from the browser.
- **Feature 3: Seamless Onboarding & Interactive Discovery UX**
  - Implemented a 3-Step `WelcomeModal` onboarding flow capturing Semester/Department, Top Skills, and Seeking Status.
  - Added a Global Command Palette (`CommandPalette.tsx`) activated via `Ctrl+K` / `Cmd+K` for rapid app-wide navigation and search.
  - Added "Invite Note" capabilities to the partner request flow, allowing 200-character custom messages.
  - Added a Role Gap Highlighter to discovery cards that flags students who possess skills missing from the user's current group.
- **Feature 4: Post-Lock FYP Workspace & Milestone Kanban Board**
  - Added a dedicated Workspace tab to the FYP group page, accessible only when the group is locked.
  - Built a fully functional Drag-and-Drop `KanbanBoard` (To Do, In Progress, Review, Done) using native HTML5 drag events.
  - Added comprehensive `FYPTask` backend API routes and TanStack Query services for task CRUD operations.
  - Implemented a visual `DeadlineTimeline` component tracking university milestones.

### Changed
- **Schema & Database**
  - Added `FYPTask` model to `prisma/schema.prisma`.
  - Added `onboardingCompleted`, `primaryRoles`, and `seekingStatus` fields to the `Student` model.
  - Added `embedType`, `embedUrl`, and `mediaMetadata` fields to the `Project` model.
  - Added `inviteNote` field to the `Request` model.
  - Reverted `url` field inside the Prisma datasource block to match Prisma 7 adapter configuration.

### Fixed
- **BUG-001**: Fixed database connection errors by replacing broken `prisma.config` imports with direct `process.env.DATABASE_URL` in `lib/db.ts`.
- **BUG-003**: Enforced permission checks in `messaging.service.ts` to prevent unauthorized message sending, returning proper HTTP 403 in the route handler.
- **BUG-004**: Rewrote semester calculation logic in `auth.service.ts` to accurately handle summer months (June-August).
- **BUG-005**: Added logic in `request.service.ts` to automatically reject all stale pending partner requests when a student successfully joins a locked group.
- **BUG-006**: Wrapped the OAuth ID synchronization flow in a Prisma `$transaction` inside `callback/route.ts` to fix foreign key violation race conditions.
- **BUG-008**: Resolved widespread TypeScript implicit-any errors by explicitly typing lambda parameters and adding `"types": ["node"]` to `tsconfig.json`.

### Removed
- **Documentation Cleanup**: Removed stale audit files (`AUDIT_SUMMARY.md`, `SECURITY_AUDIT.md`, `DATABASE_AUDIT.md`, `PERFORMANCE_AUDIT.md`, `CODEBASE_AUDIT_REPORT.md`, `DOCUMENTATION_CLEANUP_REPORT.md`) from the `docs/` directory.
