# Performance Audit — FYP Finder

## 1. Summary
The FYP Finder application uses modern client-side caching with React Query and Supabase realtime to reduce polling. The architecture is performance-friendly, but a few areas can improve responsiveness and scalability.

## 2. Observations
- React Query is used for queries and mutations, which is good for caching and background refetch.
- Realtime subscriptions reduce the need for polling and keep chat/update flows fresh.
- The conversation and message model includes sensible indexes for chat retrieval.
- Discovery filtering may require attention for large student populations.

## 3. Potential Hotspots
### 3.1 Discovery
- `get-matched-students` may scan active students and score matches on the server.
- Recommendation: review query plans and add search indexes or limit result sets.

### 3.2 Messaging
- Message lists may grow large within a conversation.
- Recommendation: add pagination or limit the initial message fetch to a recent window.
- Ensure `Message` indexes on `conversationId` and `createdAt` are used.

### 3.3 Request Lists
- Sent/received request endpoints may return all records if no pagination is used.
- Recommendation: add pagination and date sorting if the request volume increases.

### 3.4 Push and Realtime
- Realtime subscription load is manageable for chat and notification channels, but verify the number of active subscriptions under load.
- Recommendation: use scoped channels per user and avoid broad table subscriptions.

## 4. Client Performance
- The dashboard uses client-only components with React Query; this is appropriate for dynamic data.
- Static pages and landing content can remain server-rendered if not requiring auth.
- There is no visible global loading indicator; consider shared status for long-running mutations.

## 5. Recommendations
- Validate expensive discovery queries with real query plans and add indexes where needed.
- Add paging for messages and requests.
- Keep React Query stale times tuned to reduce unnecessary refetches while preserving realtime freshness.
- Audit component render cost on dashboard pages if experience is slow on mobile devices.
- Measure API latency for auth callback flow, discovery, and message sends.

## 6. Notes
- Performance issues are currently speculative without runtime profiling, but the architecture is sound.
- The largest improvements will come from query optimization and pagination for chat/request lists.
