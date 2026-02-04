# Feature 3: Discovery + Public Student Profile

A comprehensive guide to the Discovery and Public Profile feature in FYP Finder.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [File Structure](#file-structure)
3. [Complete Workflow](#complete-workflow)
4. [API Routes](#api-routes)
5. [Frontend Services](#frontend-services)
6. [React Query Hooks](#react-query-hooks)
7. [Components](#components)
8. [Pages](#pages)
9. [Filter System](#filter-system)
10. [Pagination Logic](#pagination-logic)
11. [Group Status Logic](#group-status-logic)
12. [React Query Configuration](#react-query-configuration)
13. [UX Features](#ux-features)

---

## Overview

Feature 3 enables students to:
- **Discover** other students based on filters (department, semester, skills)
- **View public profiles** of potential FYP partners
- **See group status** to know if a student is available for partnering

---

## File Structure

```
fypfinder/
├── app/
│   ├── api/
│   │   ├── discovery/
│   │   │   └── get-matched-students/
│   │   │       └── route.ts              # Discovery API endpoint
│   │   └── student/
│   │       └── get-public-profile/
│   │           └── [studentId]/
│   │               └── route.ts          # Public profile API endpoint
│   └── dashboard/
│       └── discovery/
│           ├── page.tsx                  # Discovery list page
│           └── profile/
│               └── [studentId]/
│                   └── page.tsx          # Public profile page
├── components/
│   ├── discovery/
│   │   ├── DiscoveryFilters.tsx         # Filter controls component
│   │   └── StudentCard.tsx               # Student preview card
│   └── student/
│       └── PublicProfileView.tsx         # Full profile display
├── hooks/
│   └── discovery/
│       ├── useDiscovery.ts               # Discovery query hook
│       └── usePublicProfile.ts           # Public profile query hook
├── services/
│   ├── discovery.service.ts              # Discovery API service
│   └── studentPublic.service.ts          # Public profile API service
└── modules/
    └── discovery/
        └── discovery.service.ts          # Backend business logic
```

---

## Complete Workflow

### Discovery Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. USER visits /dashboard/discovery                                         │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│ 2. PAGE: app/dashboard/discovery/page.tsx                                   │
│    • useRequireAuth() - checks authentication                               │
│    • useDiscovery({ initialLimit: 12 }) - fetches students                  │
│    • Renders DiscoveryFilters + StudentCard grid                            │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│ 3. HOOK: hooks/discovery/useDiscovery.ts                                    │
│    • Manages pendingFilters (UI) vs appliedFilters (server)                 │
│    • Calls discoveryService.getMatchedStudentsWithSkills()                  │
│    • Handles pagination state                                               │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│ 4. SERVICE: services/discovery.service.ts                                   │
│    • getMatchedStudentsWithSkills() - builds URL with skill[] params        │
│    • Uses apiClient with credentials: "include"                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│ 5. API ROUTE: app/api/discovery/get-matched-students/route.ts               │
│    • requireRole(UserRole.STUDENT) - auth enforcement                       │
│    • Calls getMatchedStudents() from modules                                │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│ 6. MODULE: modules/discovery/discovery.service.ts                           │
│    • Builds Prisma where clause with mandatory rules                        │
│    • Applies optional filters (department, semester, skills)                │
│    • Returns { items, total, limit, offset }                                │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Public Profile Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. USER hovers on StudentCard                                               │
│    • StudentCard calls prefetchPublicProfile(queryClient, student.id)       │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│ 2. USER clicks StudentCard → navigates to /dashboard/discovery/profile/[id] │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│ 3. PAGE: app/dashboard/discovery/profile/[studentId]/page.tsx               │
│    • useParams() → gets studentId                                           │
│    • useRequireAuth() - checks auth                                         │
│    • usePublicProfile(studentId) - fetches (from cache if prefetched)       │
│    • Renders PublicProfileView                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│ 4. HOOK: hooks/student/usePublicProfile.ts                                  │
│    • Calls studentPublicService.getPublicProfile(studentId)                 │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│ 5. SERVICE: services/studentPublic.service.ts                               │
│    • apiClient.get(`/api/student/get-public-profile/${studentId}`)          │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│ 6. API ROUTE: app/api/student/get-public-profile/[studentId]/route.ts       │
│    • requireRole(UserRole.STUDENT)                                          │
│    • Fetches student with skills, projects, groupMember                     │
│    • Returns public-safe data (no private info)                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## API Routes

### GET `/api/discovery/get-matched-students`

**Purpose**: Fetches paginated list of matched students with filters

**Query Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `department` | string | - | Filter by department (CS, SE, AI, etc.) |
| `semester` | number | - | Filter by semester (5, 6, 7) |
| `skills[]` | string[] | - | Filter by skills (can be multiple) |
| `limit` | number | 7 | Items per page (max 20) |
| `offset` | number | 0 | Pagination offset |

**Response**:
```typescript
{
  success: true,
  message: "Matched students fetched",
  data: {
    items: MatchedStudent[],
    total: number,
    limit: number,
    offset: number
  }
}
```

**Mandatory Backend Rules** (cannot be bypassed):
```typescript
where: {
  userId: { not: currentUserId },      // Exclude self
  currentSemester: { gte: 5, lte: 7 }, // Only FYP-eligible semesters
  availability: "AVAILABLE",           // Only available students
  user: { status: "ACTIVE" },          // Only active accounts
}
```

---

### GET `/api/student/get-public-profile/[studentId]`

**Purpose**: Fetches a single student's public profile

**Response**:
```typescript
{
  success: true,
  message: "Public profile fetched successfully",
  data: {
    id: string,
    name: string,
    department: string,
    semester: number,
    profilePicture: string | null,
    interests: string | null,
    availability: "AVAILABLE" | "BUSY" | "AWAY",
    isGrouped: boolean,
    availableForGroup: boolean,
    groupInfo: {
      groupId: string,
      projectName: string,
      isLocked: boolean
    } | null,
    skills: Array<{ id, name, level }>,
    projects: Array<{ id, name, description?, liveLink?, githubLink? }>
  }
}
```

---

## Frontend Services

### `services/discovery.service.ts`

```typescript
// Type definitions
export interface MatchedStudent {
  id: string;
  name: string;
  department: string;
  semester: number;
  profilePicture: string | null;
  interests: string | null;
  availability: "AVAILABLE" | "BUSY" | "AWAY";
  skills: Array<{ id: string; name: string; level: string }>;
}

export interface DiscoveryFilters {
  department?: string;
  semester?: number;
  skills?: string[];
  limit?: number;
  offset?: number;
}

export interface DiscoveryResponse {
  items: MatchedStudent[];
  total: number;
  limit: number;
  offset: number;
}

// Main function
export async function getMatchedStudentsWithSkills(
  filters: DiscoveryFilters = {}
): Promise<DiscoveryResponse> {
  // Builds URL with query params including skill[] array
  // Uses apiClient for HTTP request
}
```

---

### `services/studentPublic.service.ts`

```typescript
// Type definitions
export interface GroupInfo {
  groupId: string;
  projectName: string;
  isLocked: boolean;
}

export interface PublicStudentProfile {
  id: string;
  name: string;
  department: string;
  semester: number;
  profilePicture?: string | null;
  interests?: string;
  availability: "AVAILABLE" | "BUSY" | "AWAY";
  isGrouped: boolean;
  availableForGroup: boolean;
  groupInfo: GroupInfo | null;
  skills: Array<{ id: string; name: string; level: string }>;
  projects: Array<{
    id: string;
    name: string;
    description?: string;
    liveLink?: string;
    githubLink?: string;
  }>;
}

// Main function
export async function getPublicProfile(
  studentId: string
): Promise<PublicStudentProfile> {
  // Fetches from /api/student/get-public-profile/[studentId]
}
```

---

## React Query Hooks

### `hooks/discovery/useDiscovery.ts`

**Purpose**: Manages discovery state, filters, and pagination

**Configuration**:
```typescript
{
  queryKey: ["discovery", appliedFilters],
  staleTime: 5 * 60 * 1000,        // 5 minutes
  gcTime: 15 * 60 * 1000,          // 15 minutes
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  placeholderData: (previousData) => previousData,
}
```

**Returns**:
```typescript
{
  // Data
  students: MatchedStudent[],
  pagination: { total, limit, offset },
  
  // Filter State
  pendingFilters: DiscoveryFilters,       // UI state
  appliedFilters: DiscoveryFilters,       // Server state
  hasUnappliedChanges: boolean,           // Computed
  
  // Filter Actions
  setFilters: (updates) => void,          // Update pending only
  applyFilters: () => void,               // Copy pending → applied
  clearFilters: () => void,               // Reset both
  
  // Pagination Actions
  goToPage: (page: number) => void,
  nextPage: () => void,
  previousPage: () => void,
  
  // Pagination Computed
  currentPage: number,
  totalPages: number,
  hasNextPage: boolean,
  hasPreviousPage: boolean,
  
  // Query State
  isLoading: boolean,
  isFetching: boolean,
  error: Error | null,
}
```

---

### `hooks/discovery/usePublicProfile.ts`

**Purpose**: Fetches and caches public student profiles

**Configuration**:
```typescript
{
  queryKey: ["student", "public-profile", studentId],
  staleTime: 10 * 60 * 1000,       // 10 minutes
  gcTime: 30 * 60 * 1000,          // 30 minutes
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  retry: 1,
  enabled: !!studentId,            // Only fetch if ID exists
}
```

**Returns**:
```typescript
{
  profile: PublicStudentProfile | undefined,
  isLoading: boolean,
  error: Error | null,
}
```

**Prefetch Function** (exported separately):
```typescript
export function prefetchPublicProfile(
  queryClient: QueryClient,
  studentId: string
): void {
  // Prefetches profile data on hover for instant navigation
  queryClient.prefetchQuery({
    queryKey: ["student", "public-profile", studentId],
    queryFn: () => getPublicProfile(studentId),
    staleTime: 10 * 60 * 1000,
  });
}
```

---

## Components

### `components/discovery/DiscoveryFilters.tsx`

**Props**:
```typescript
interface DiscoveryFiltersProps {
  pendingFilters: DiscoveryFilters;
  appliedFilters: DiscoveryFilters;
  hasUnappliedChanges: boolean;
  onFilterChange: (updates: Partial<DiscoveryFilters>) => void;
  onApply: () => void;
  onClear: () => void;
  isLoading?: boolean;
}
```

**Features**:
- Department dropdown (CS, SE, AI, DS, IT, CY)
- Semester dropdown (5, 6, 7)
- Skills multi-select with popular skills
- **Apply Filters** button with loading spinner
- **Clear All** button
- Unapplied changes warning banner

---

### `components/discovery/StudentCard.tsx`

**Props**:
```typescript
interface StudentCardProps {
  student: MatchedStudent;
}
```

**Features**:
- Profile picture with initials fallback
- Name, department, semester display
- Skills preview (first 3 + count)
- Availability badge
- **Hover prefetch** for instant profile loading
- Link to `/dashboard/discovery/profile/[id]`

---

### `components/student/PublicProfileView.tsx`

**Props**:
```typescript
interface PublicProfileViewProps {
  profile: PublicStudentProfile;
}
```

**Sections**:
1. **Header Card**: Avatar, name, department, semester, badges
2. **Group Status**: Shows if in group, locked status, project name
3. **About**: Interests/bio section
4. **Skills**: Grid with skill level badges (Beginner/Intermediate/Advanced)
5. **Projects**: Cards with description, live demo, GitHub links
6. **CTA**: "Send Partner Request" button

---

## Pages

### `app/dashboard/discovery/page.tsx`

**Features**:
- Authentication check via `useRequireAuth()`
- Filter sidebar
- Student grid with pagination
- Loading skeleton during initial fetch
- Floating loader during background refetch
- Empty state with different messages

---

### `app/dashboard/discovery/profile/[studentId]/page.tsx`

**Features**:
- Dynamic route with `[studentId]` param
- Authentication check
- Loading skeleton
- Error state with retry
- Back navigation button
- Full profile via `PublicProfileView`

---

## Filter System

### Two-State Filter Pattern

| State | Purpose | Triggers API |
|-------|---------|--------------|
| `pendingFilters` | UI state - what user is selecting | ❌ No |
| `appliedFilters` | Server state - what's sent to API | ✅ Yes |

### Flow

```
1. User changes filter → updates pendingFilters only
2. hasUnappliedChanges computed by comparing pending vs applied
3. User clicks "Apply Filters" → pendingFilters copied to appliedFilters
4. appliedFilters change triggers React Query refetch
5. "Clear All" resets both states to default
```

### Available Filter Options

**Departments**: CS, SE, AI, DS, IT, CY

**Semesters**: 5, 6, 7

**Skills**: React, Next.js, Node.js, Python, TypeScript, JavaScript, Machine Learning, Flutter, React Native, MongoDB, PostgreSQL, AWS, Docker, Figma, UI/UX

---

## Pagination Logic

### Backend (modules/discovery/discovery.service.ts)

```typescript
const limit = Math.min(Number(searchParams.get("limit")) || 7, 20);  // Max 20
const offset = Math.max(Number(searchParams.get("offset")) || 0, 0);

prisma.student.findMany({
  where,
  skip: offset,
  take: limit,
  orderBy: { createdAt: "desc" },
});
```

### Frontend (hooks/discovery/useDiscovery.ts)

```typescript
// Computed values
totalPages = Math.ceil(pagination.total / pagination.limit);
currentPage = Math.floor(pagination.offset / pagination.limit) + 1;
hasNextPage = pagination.offset + pagination.limit < pagination.total;
hasPreviousPage = pagination.offset > 0;

// Actions
goToPage(page) → newOffset = (page - 1) * limit
nextPage()     → offset += limit
previousPage() → offset -= limit (min 0)
```

---

## Group Status Logic

### Backend Calculation

```typescript
const isGrouped = !!student.groupMember;

const groupInfo = student.groupMember
  ? {
      groupId: student.groupMember.group.id,
      projectName: student.groupMember.group.projectName,
      isLocked: student.groupMember.group.isLocked,
    }
  : null;

// Available for group if:
// 1. Not in any group, OR
// 2. In a group that is NOT locked
const availableForGroup = !isGrouped || (isGrouped && !groupInfo?.isLocked);
```

### Frontend Display

| Condition | Label | Icon | Description |
|-----------|-------|------|-------------|
| Not in group | "Looking for a Group" | 👋 | "Open to joining FYP groups" |
| In unlocked group | "In a Group (Open)" | 👥 | "Working on: {projectName}" |
| In locked group | "Group Locked" | 🔒 | "Team is finalized" |

---

## React Query Configuration

### Cache Timing Summary

| Hook | staleTime | gcTime | Reason |
|------|-----------|--------|--------|
| `useDiscovery` | 5 min | 15 min | Discovery data changes more frequently |
| `usePublicProfile` | 10 min | 30 min | Profile data is fairly static |

### Query Keys

```typescript
// Discovery
["discovery", appliedFilters]

// Public Profile  
["student", "public-profile", studentId]
```

### Prefetching Strategy

- **StudentCard**: Prefetches profile on mouse enter
- **Pagination**: Can prefetch next page for smoother navigation

---

## UX Features

| Feature | Description |
|---------|-------------|
| **Hover Prefetch** | StudentCard prefetches profile on hover for instant navigation |
| **Skeleton Loading** | Beautiful loading skeletons while data fetches |
| **Unapplied Warning** | Amber banner shows when filters haven't been applied |
| **Floating Loader** | Bottom-right loader during background refetches |
| **Empty States** | Different messages for "no results" vs "no results with filters" |
| **Error Handling** | Dedicated error states with retry options |
| **Responsive Design** | Works on mobile, tablet, and desktop |

---

## Request Timeline

```
User Action                  │ What Happens                          │ Time
─────────────────────────────┼───────────────────────────────────────┼──────
Visit /dashboard/discovery   │ Initial fetch with default filters    │ ~200ms
Change filter (no apply)     │ UI updates, no API call               │ 0ms
Click "Apply Filters"        │ API call with new filters             │ ~150ms
Hover on StudentCard         │ Prefetch profile in background        │ ~100ms
Click StudentCard            │ Navigate (profile already cached!)    │ 0ms
Back to discovery            │ Data from cache (if < staleTime)      │ 0ms
```

---

## Error Handling

### Network Errors
- Displayed with error message and retry button
- Query retries once before showing error

### Empty Results
- Shows friendly empty state
- Suggests clearing filters if filters are applied

### Auth Errors
- Redirects to login page via `useRequireAuth()`

---

## Summary

Feature 3 provides a complete discovery system with:
- ✅ Paginated student list with filters
- ✅ Two-state filter pattern (pending/applied)
- ✅ Public profile with group status
- ✅ Prefetching for instant navigation
- ✅ Smart caching with React Query
- ✅ Responsive, accessible design
