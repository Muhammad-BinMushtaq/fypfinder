# Codebase Audit Report — FYP Finder

## 1. Summary
FYP Finder is implemented as a clean, layered Next.js application with a strong separation of client UI, API contracts, server business logic, and persistence. The repository is generally well-structured, but there are some areas for hardening, test coverage, and maintainability improvements.

## 2. Architecture and Module Quality
### Strengths
- Clear separation: `app/` pages, `hooks/` clients, `services/` API wrappers, `modules/` domain logic, `prisma/` schema.
- Business rules centralized in `modules/` rather than scattered in UI.
- Use of React Query for optimistic updates and cache management.
- Admin APIs isolated under `app/api/admin/`.

### Observations
- The codebase lacks visible automated tests, especially for critical workflows like auth, request handling, conversation permissions, and group locking.
- Documentation is present but fragmented, creating a risk of divergence from implementation.
- Some routes and data paths may be duplicated between docs and actual code; canonicalization is needed.

## 3. Security and Auth Checks
- `lib/auth.ts` provides `requireAuth()` and `requireRole()`.
- Student signup restrictions are enforced in `app/api/auth/callback/route.ts`.
- Rate limiting exists for admin auth routes.
- Suspended users are blocked from login and protected routes.
- Potential gaps:
  - RLS policies are not visible in code; external Supabase configuration is assumed.
  - Input validation is present but could be standardized using a schema validation library like Zod across routes.

## 4. Business Logic Review
- Request and group rules are implemented in domain services, which is good.
- Partner requests and group merging are complex flows that require regression testing.
- Messaging permission logic is a critical responsibility and should be covered with end-to-end tests.
- AI idea validation is stored in the schema and appears to be deduplicated by `inputHash`.

## 5. Frontend Architecture
- UI is built with React components and uses Tailwind CSS for styling.
- Pages are client components where necessary, and data is fetched through hooks.
- There is no obvious centralized error boundary or global loading state across dashboard pages.
- The FYP group page contains inline editing state and action handling, which is acceptable but should be consistent with other feature pages.

## 6. Performance Considerations
- React Query cache keys are used for conversations, messages, unread count, and profile data.
- Realtime subscriptions are used to update the client, reducing polling overhead.
- Database indexing appears to be aligned with query patterns for conversations and requests.
- Recommendations in `PERFORMANCE_AUDIT.md` can be used for further optimization.

## 7. Maintainability Recommendations
- Add tests for API routes and modules:
  - `app/api/auth/callback/route.ts`
  - `modules/request/request.service.ts`
  - `modules/group/group.service.ts`
  - `modules/messaging/messaging.service.ts`
- Create a docs index or `README.md` under `docs/`.
- Standardize error response shapes across routes.
- Refactor repeated validation patterns into shared utilities or schema validators.

## 8. Technical Debt and Risks
- The absence of a test suite is the most significant risk.
- Realtime behavior and Supabase RLS configuration are external dependencies that must be tested in a real environment.
- Group merge logic and partner request edge cases may contain hidden bugs.
- `prisma/schema.prisma` includes many extended profile fields; some may be unused in UI.

## 9. Suggested Next Actions
1. Add automated tests for auth, requests, messaging, and groups.
2. Create a documentation index and migrate legacy docs to canonical artifacts.
3. Review and standardize input validation in routes.
4. Audit Supabase RLS policies and realtime configuration.
5. Inspect and remove any unused schema fields or UI props if they are truly stale.

## 10. Key Files Reviewed
- `app/api/auth/callback/route.ts`
- `app/api/admin/login/route.ts`
- `app/api/admin/signup/route.ts`
- `app/api/group/*`
- `app/api/messaging/*`
- `app/api/request/*`
- `app/api/discovery/get-matched-students/route.ts`
- `lib/auth.ts`
- `modules/*`
- `prisma/schema.prisma`
