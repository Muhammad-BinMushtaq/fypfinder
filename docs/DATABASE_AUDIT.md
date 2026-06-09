# Database Audit — FYP Finder

## 1. Summary
The FYP Finder database schema is well-aligned to the application's domain, with normalized student profile data, request workflows, messaging, group membership, and AI validation records. Several strengths are noted, along with targeted recommendations to improve integrity, indexing, and operational reliability.

## 2. Strengths
- Clear separation of authentication data (`User`) from profile data (`Student`).
- Unique constraints enforce business rules:
  - one `Skill` name per student
  - one group membership per student
  - one conversation per student pair
  - one AI idea validation per student/input hash
- Indexed foreign keys and query fields optimize filtering and chat retrieval.
- Realtime-friendly tables `Message` and `Request` are suitable for Supabase subscriptions.

## 3. Schema Review
### Entity coverage
- `User`, `Student`, `Admin`: auth and profile
- `Skill`, `Project`, `Internship`: portfolio and experience
- `Request`: message and partner workflows
- `FYPGroup`, `FYPGroupMember`: team membership
- `Conversation`, `Message`: chat system
- `PushSubscription`: notification delivery
- `FYPIdeaValidation`: AI idea analysis
- `PastFypIdea`: archived idea catalog

### Constraints and indexes
- `@@unique([studentId, name])` on `Skill`
- `@@unique([studentId])` on `FYPGroupMember`
- `@@unique([studentAId, studentBId])` on `Conversation`
- `@@index([type, status])` on `Request`
- `@@index([conversationId])` and `@@index([createdAt])` on `Message`
- `@@unique([studentId, inputHash])` on `FYPIdeaValidation`

## 4. Notable Observations
### Email / user identity
- `User.email` is unique and used to map Supabase identity to Prisma records.
- The codebase updates `User.id` if Supabase authenticates a returning email with a new ID.

### Group membership
- `FYPGroupMember` enforces one active group per student at schema level.
- `FYPGroup.isLocked` is stored on the group and used to prevent member changes.

### Conversation pair uniqueness
- Conversations are unique per ordered pair. The code must ensure consistent ordering to avoid duplicate pair creation.

### AI validation
- `FYPIdeaValidation` captures model outputs, scores, and recommendations.
- `inputHash` deduplication is key to avoid repeated API usage.

## 5. Recommendations
### 5.1 Add explicit referential cascade review
- Confirm cascade behavior for `User` → `Student` / `Admin` deletion if account removal is allowed.
- Ensure `PushSubscription` and `FYPIdeaValidation` cleanup on user deletion if required.

### 5.2 Maintain RLS policy documentation
- Document Supabase RLS rules for `Message` and `Request` tables in the repo or docs.
- Ensure policies only expose rows to authorized participants.

### 5.3 Review unused schema fields
- `Student` includes several optional project and career fields; verify UI coverage and usage.
- If fields are unused, consider removing or documenting them for future use.

### 5.4 Add audit logging if needed
- If admin actions require accountability, add an audit trail table for `suspend`, `delete`, and group changes.

### 5.5 Optimize search in `PastFypIdea`
- Confirm `searchText` is being used effectively for search; if not, consider full-text indexes or search tooling.

## 6. Risk Areas
- Complex partner request and group merge logic depends on correct membership constraints.
- Conversation uniqueness requires code to normalize student pair ordering.
- AI validation raw JSON may grow over time; monitor storage and consider pruning old results.

## 7. Conclusion
The database design is strong and matches the application domain. Focus on maintaining schema-documentation sync, validating Supabase RLS, and reviewing optional fields for actual UI usage to keep the data model lean and stable.
