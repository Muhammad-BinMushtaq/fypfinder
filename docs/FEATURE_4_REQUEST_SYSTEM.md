# Feature 4: Request System

## Overview

The Request System enables students to send, receive, and manage two types of requests:

1. **MESSAGE Requests** - Permission to start a conversation
2. **PARTNER Requests** - Invitation to join the same FYP group

This feature follows the **"Backend is the Judge"** pattern where the frontend only displays data and triggers actions, while all validation and business logic happens server-side.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        REQUEST SYSTEM                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────────────┐ │
│   │   Frontend   │    │   Backend    │    │     Database         │ │
│   │              │    │              │    │                      │ │
│   │  • Services  │───>│  • Routes    │───>│  • Request table     │ │
│   │  • Hooks     │<───│  • Services  │<───│  • FYPGroup table    │ │
│   │  • Components│    │  • Validation│    │  • FYPGroupMember    │ │
│   │  • Pages     │    │              │    │                      │ │
│   │              │    │              │    │                      │ │
│   └──────────────┘    └──────────────┘    └──────────────────────┘ │
│         │                    │                                      │
│         │        ┌───────────┴────────────┐                        │
│         └───────>│  Supabase Realtime     │────────────┐           │
│                  │  (Cache Invalidation)  │            │           │
│                  └────────────────────────┘            │           │
│                                                        │           │
│   ┌────────────────────────────────────────────────────┘           │
│   │                                                                │
│   ▼   React Query Cache Invalidation                               │
│   • ["requests", "message", "sent"]                                │
│   • ["requests", "message", "received"]                            │
│   • ["requests", "partner", "sent"]                                │
│   • ["requests", "partner", "received"]                            │
│   • ["group", "my-group"] (on partner accept)                      │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## Request Types

### MESSAGE Request

- **Purpose**: Get permission to message another student
- **Side Effect on Accept**: Status changes to ACCEPTED (no group mutation)
- **Validation Rules**:
  - No self-requests
  - No duplicate pending requests to same student

### PARTNER Request

- **Purpose**: Invite another student to join your FYP group
- **Side Effect on Accept**:
  - Creates or modifies FYP group
  - Both students become group members
  - Group auto-locks when full (3 members)
- **Validation Rules**:
  - No self-requests
  - Same semester requirement
  - Sender's group must not be locked
  - No duplicate pending requests

## File Structure

```
fypfinder/
├── services/
│   ├── requestMessage.service.ts    # MESSAGE request API contracts
│   └── requestPartner.service.ts    # PARTNER request API contracts
│
├── hooks/
│   └── request/
│       ├── index.ts                 # Barrel exports
│       ├── useMessageRequests.ts    # MESSAGE request hooks
│       ├── usePartnerRequests.ts    # PARTNER request hooks
│       └── useRequestRealtime.ts    # Supabase realtime subscription
│
├── components/
│   └── request/
│       ├── index.ts                 # Barrel exports
│       ├── RequestCard.tsx          # Request card display
│       ├── RequestActions.tsx       # Accept/Reject buttons
│       ├── RequestTabs.tsx          # Sent/Received tabs
│       ├── RequestEmptyState.tsx    # Empty state display
│       ├── RequestList.tsx          # Grid of request cards
│       └── SendRequestButtons.tsx   # Send request buttons (public profile)
│
├── app/
│   └── dashboard/
│       └── requests/
│           ├── messages/
│           │   └── page.tsx         # Message requests page
│           └── partner/
│               └── page.tsx         # Partner requests page
│
└── modules/
    └── request/
        └── request.service.ts       # Backend business logic (DO NOT MODIFY)
```

## Services

### requestMessage.service.ts

```typescript
// Types
export type RequestStatus = "PENDING" | "ACCEPTED" | "REJECTED";
export interface MessageRequest { ... }
export interface SendMessageRequestPayload { toStudentId: string; reason?: string; }
export interface AcceptRejectPayload { requestId: string; }

// Functions
export async function sendMessageRequest(payload): Promise<MessageRequest>
export async function getSentMessageRequests(): Promise<MessageRequest[]>
export async function getReceivedMessageRequests(): Promise<MessageRequest[]>
export async function acceptMessageRequest(payload): Promise<MessageRequest>
export async function rejectMessageRequest(payload): Promise<MessageRequest>
```

### requestPartner.service.ts

```typescript
// Types
export interface PartnerRequest { ... }
export interface SendPartnerRequestPayload { toStudentId: string; }

// Functions (same pattern as message)
export async function sendPartnerRequest(payload): Promise<PartnerRequest>
export async function getSentPartnerRequests(): Promise<PartnerRequest[]>
export async function getReceivedPartnerRequests(): Promise<PartnerRequest[]>
export async function acceptPartnerRequest(payload): Promise<PartnerRequest>
export async function rejectPartnerRequest(payload): Promise<PartnerRequest>
```

## Hooks

### Query Keys Strategy

```typescript
// Message requests
messageRequestKeys = {
  all: ["requests", "message"],
  sent: () => ["requests", "message", "sent"],
  received: () => ["requests", "message", "received"],
}

// Partner requests
partnerRequestKeys = {
  all: ["requests", "partner"],
  sent: () => ["requests", "partner", "sent"],
  received: () => ["requests", "partner", "received"],
}

// Group (invalidated on partner accept)
groupKeys = {
  all: ["group"],
  myGroup: () => ["group", "my-group"],
}
```

### Available Hooks

```typescript
// Message Request Hooks
useSendMessageRequest()       // Mutation
useSentMessageRequests()      // Query
useReceivedMessageRequests()  // Query
useAcceptMessageRequest()     // Mutation
useRejectMessageRequest()     // Mutation
useInvalidateMessageRequests() // Utility

// Partner Request Hooks
useSendPartnerRequest()       // Mutation
useSentPartnerRequests()      // Query
useReceivedPartnerRequests()  // Query
useAcceptPartnerRequest()     // Mutation (also invalidates group)
useRejectPartnerRequest()     // Mutation
useInvalidatePartnerRequests() // Utility

// Realtime
useRequestRealtime({ studentId, enabled })  // Cache invalidation on changes
```

## Components

### RequestCard

Displays a single request with:
- Student avatar and info
- Request type badge (MESSAGE/PARTNER)
- Status badge (PENDING/ACCEPTED/REJECTED)
- Timestamp
- Optional reason message
- Accept/Reject actions (for received + pending)

### RequestTabs

Tab navigation between Sent and Received with counts.

### RequestList

Grid of RequestCards with loading skeleton and empty state.

### SendRequestButtons

Action buttons shown on public profiles to send MESSAGE or PARTNER requests.

## Pages

### Message Requests Page (`/dashboard/requests/messages`)

- Lists all message requests (sent and received)
- Tabs to switch between views
- Accept/Reject actions for pending received requests
- Pending count badge
- Realtime updates via Supabase

### Partner Requests Page (`/dashboard/requests/partner`)

- Lists all partner requests (sent and received)
- Important notice about group creation
- Tabs to switch between views
- Accept/Reject actions for pending received requests
- Pending count badge
- Realtime updates via Supabase

## Realtime Updates

The `useRequestRealtime` hook subscribes to Supabase Realtime for the Request table:

1. Listens for INSERT, UPDATE, DELETE events
2. Filters events that affect the current user
3. Invalidates relevant React Query cache
4. Does NOT modify local state directly

This ensures the frontend always reflects the latest server state.

## Backend API Routes

### Message Requests

| Method | Route | Body | Response |
|--------|-------|------|----------|
| POST | `/api/request/message/send` | `{ toStudentId, reason? }` | MessageRequest |
| GET | `/api/request/message/get-sent` | - | MessageRequest[] |
| GET | `/api/request/message/get-received` | - | MessageRequest[] |
| POST | `/api/request/message/accept` | `{ requestId }` | MessageRequest |
| POST | `/api/request/message/reject` | `{ requestId }` | MessageRequest |

### Partner Requests

| Method | Route | Body | Response |
|--------|-------|------|----------|
| POST | `/api/request/partner/send` | `{ toStudentId }` | PartnerRequest |
| GET | `/api/request/partner/get-sent` | - | PartnerRequest[] |
| GET | `/api/request/partner/get-received` | - | PartnerRequest[] |
| POST | `/api/request/partner/accept` | `{ requestId }` | PartnerRequest |
| POST | `/api/request/partner/reject` | `{ requestId }` | PartnerRequest |

## Usage Examples

### Sending a Message Request

```tsx
import { useSendMessageRequest } from "@/hooks/request/useMessageRequests";

function MyComponent() {
  const sendMutation = useSendMessageRequest();
  
  const handleSend = async (studentId: string) => {
    await sendMutation.mutateAsync({
      toStudentId: studentId,
      reason: "I'd like to discuss FYP ideas!",
    });
  };
}
```

### Displaying Received Requests

```tsx
import { useReceivedPartnerRequests, useAcceptPartnerRequest } from "@/hooks/request/usePartnerRequests";
import { RequestList } from "@/components/request";

function ReceivedRequests() {
  const { data, isLoading } = useReceivedPartnerRequests();
  const acceptMutation = useAcceptPartnerRequest();
  
  return (
    <RequestList
      requests={data || []}
      variant="received"
      type="partner"
      onAccept={(requestId) => acceptMutation.mutate({ requestId })}
      isLoading={isLoading}
    />
  );
}
```

### Enabling Realtime Updates

```tsx
import { useRequestRealtime } from "@/hooks/request/useRequestRealtime";
import { useMyProfile } from "@/hooks/student/useMyProfile";

function RequestsPage() {
  const { profile } = useMyProfile();
  
  // Subscribe to realtime updates
  useRequestRealtime({
    studentId: profile?.id || null,
    enabled: !!profile?.id,
  });
  
  // ... rest of page
}
```

## Important Notes

### Separation of Concerns

MESSAGE and PARTNER requests are intentionally kept separate:
- Different services
- Different hooks
- Different consequences
- Never mix their logic

### Backend is the Judge

- Frontend NEVER decides eligibility
- All validation happens server-side
- Frontend only displays and reacts
- Error messages come from backend

### Realtime is Just a Notification

- Supabase Realtime only triggers cache invalidation
- No local state updates from realtime events
- Always refetch from server to get truth

### Partner Accept Side Effects

When a PARTNER request is accepted, the backend:
1. Updates request status to ACCEPTED
2. Creates or modifies FYP group
3. Adds both students as group members
4. Locks group if full (MAX_PARTNERS = 3)

The frontend invalidates both request and group caches to reflect these changes.

## Dependencies

- `@tanstack/react-query` - Data fetching and caching
- `@supabase/supabase-js` - Realtime subscriptions
- `lucide-react` - Icons
- `date-fns` - Date formatting
- `react-toastify` - Toast notifications
