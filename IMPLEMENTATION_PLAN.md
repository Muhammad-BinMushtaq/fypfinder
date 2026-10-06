# Implementation Plan: Top 4 Critical Issues

Based on the defensive application audit, here is the step-by-step implementation plan to resolve the top 4 critical issues in the FYP Finder codebase.

## 1. Discovery API Memory Exhaustion & Over-fetching
**Issue:** `getMatchedStudents` fetches all eligible students into server memory, calculates profile completeness, and then slices the array for pagination.
**Location:** `modules/discovery/discovery.service.ts`

**Implementation Steps:**
1. **Refactor `getMatchedStudents`**: 
   - Move the pagination (`take` and `skip`) directly into the Prisma `findMany` query.
   - Remove the `Promise.all` with the redundant `count` query if total count isn't strictly necessary, or keep the `count` query but ensure the `findMany` uses `take` (limit) and `skip` (offset).
2. **Handle Profile Completeness**:
   - Since calculating completeness requires pulling nested relations, we can compute it on the fly for the *paginated* result set only, rather than for the entire database.
   - *Note*: Sorting by an in-memory calculated field (`profileCompletion`) across the entire dataset is not scalable. We should either add a `profileCompletionScore` column to the `Student` table that updates whenever their profile changes, OR just sort by a database field (like `createdAt`) and calculate completeness for display purposes only. 
   - **Action**: Add `profileScore` to `Student` schema in a future migration, but for now, apply `take` and `skip` to prevent memory exhaustion, even if it affects global sorting.

## 2. Un-leaveable Groups Bug
**Issue:** `removeGroupMember` throws an error if the group size is $\le 2$ before the removal takes place, meaning a 2-person group can never be dissolved or leave.
**Location:** `modules/group/group.service.ts` -> `removeGroupMember`

**Implementation Steps:**
1. **Update Logic in `removeGroupMember`**:
   - Change the validation logic: If removing a member causes the group size to drop below 2 (i.e., it becomes 1), the remaining member should either be allowed to stay as a solo project, OR the group should be automatically dissolved.
   - For FYP purposes, a group of 1 is usually invalid. However, we should allow the removal and just update the group status or delete the group entirely if the last member leaves.
   - **Action**: Remove the `if (group.members.length <= 2)` block. Allow the removal. If the group is left with 1 member, unlock the group (`isLocked: false`). If it has 0 members, delete the group.

## 3. Over-Aggressive Partner Request Rejection
**Issue:** When two students accept a partner request and form a group of 2, the system automatically rejects all other pending requests involving them, preventing them from easily finding a 3rd member.
**Location:** `modules/request/request.service.ts` -> `acceptPartnerRequest`

**Implementation Steps:**
1. **Modify Auto-Rejection Condition**:
   - Wrap the auto-reject query in an `if` block that checks if the group is now full (`membersCount >= MAX_PARTNERS`).
   - Only execute `tx.request.updateMany({ data: { status: RequestStatus.REJECTED } })` if the group has reached 3 members.
   - Alternatively, only reject requests involving students who are already in a group *that is now full*.

## 4. Stale Cache / LocalStorage Quota Exceeded
**Issue:** TanStack Query is persisting large data (like discovery lists) to `localStorage` with a 24-hour GC time and `refetchOnMount: false`. This causes stale data and crashes due to the 5MB quota.
**Location:** `lib/reactQuery.ts` and `lib/providers.tsx`

**Implementation Steps:**
1. **Update `QueryClient` Config**:
   - In `lib/reactQuery.ts`, change `refetchOnMount: true` (or remove the `false` override) so the app fetches fresh data in the background when the user returns.
   - Reduce `staleTime` to a reasonable amount (e.g., `1 * 60 * 1000` = 1 minute).
2. **Update Persister Config**:
   - In `lib/providers.tsx`, modify the `dehydrateOptions.shouldDehydrateQuery` function.
   - Exclude high-volume data like `discovery`, `messages`, and `conversations` from `localStorage` persistence. Only persist lightweight data like `profile` or `student` settings.
