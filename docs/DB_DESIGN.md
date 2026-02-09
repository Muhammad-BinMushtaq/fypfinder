# Database Design (Final) — FYP Finder

Version: 1.0  
Date: 2026-02-09

**Overview**  
This document describes the final database design for the FYP Finder system. It is based on the Prisma schema in `prisma/schema.prisma` and reflects the production model for authentication, student profiles, discovery, requests, messaging, groups, and administration.

---

**Design Goals**

- Keep authentication separate from student profile data.
- Enforce strict messaging permissions via request acceptance or group membership.
- Support real‑time updates for messaging and requests.
- Maintain data integrity with clear relations and constraints.
- Favor normalized schema with minimal redundancy.

---

**Entity Relationship Summary**

```
User (1) ── (0..1) Student
User (1) ── (0..1) Admin

Student (1) ── (0..*) Skill
Student (1) ── (0..*) Project

Student (1) ── (0..*) Request [sent]
Student (1) ── (0..*) Request [received]

Student (1) ── (0..1) FYPGroupMember ── (1) FYPGroup ── (1..3) Members

Student (1) ── (0..*) Conversation [as A]
Student (1) ── (0..*) Conversation [as B]
Conversation (1) ── (0..*) Message
Student (1) ── (0..*) Message [sent]
```

---

**Data Dictionary**

**User**

- `id` (PK, UUID)
- `email` (unique)
- `role` (enum: STUDENT, ADMIN)
- `status` (enum: ACTIVE, SUSPENDED, DELETION_REQUESTED)
- `createdAt`

**Student**

- `id` (PK, UUID)
- `userId` (unique, FK → User.id)
- `name`
- `department`
- `currentSemester` (int)
- `profilePicture` (nullable)
- `interests` (nullable)
- `phone` (nullable)
- `linkedinUrl` (nullable)
- `githubUrl` (nullable)
- `availability` (enum: AVAILABLE, BUSY, AWAY)
- `showGroupOnProfile` (boolean, default true)
- `createdAt`

**Admin**

- `id` (PK, UUID)
- `userId` (unique, FK → User.id)
- `name`

**Skill**

- `id` (PK, UUID)
- `studentId` (FK → Student.id)
- `name`
- `description` (nullable)
- `level` (enum: BEGINNER, INTERMEDIATE, ADVANCED)

Constraint: `@@unique([studentId, name])`

**Project**

- `id` (PK, UUID)
- `studentId` (FK → Student.id)
- `name`
- `description` (nullable)
- `liveLink` (nullable)
- `githubLink` (nullable)

**Request**

- `id` (PK, UUID)
- `fromStudentId` (FK → Student.id)
- `toStudentId` (FK → Student.id)
- `type` (enum: MESSAGE, PARTNER)
- `reason`
- `status` (enum: PENDING, ACCEPTED, REJECTED)
- `createdAt`

**FYPGroup**

- `id` (PK, UUID)
- `projectName`
- `description` (nullable)
- `isLocked` (boolean, default false)
- `createdAt`

**FYPGroupMember**

- `id` (PK, UUID)
- `groupId` (FK → FYPGroup.id)
- `studentId` (FK → Student.id)
- `joinedAt`

Constraint: `@@unique([studentId])`  
This enforces **one group membership per student**.

**Conversation**

- `id` (PK, UUID)
- `studentAId` (FK → Student.id)
- `studentBId` (FK → Student.id)
- `createdAt`
- `updatedAt` (auto‑updated)

Constraints:  
`@@unique([studentAId, studentBId])` ensures only one conversation per pair.  
Indices on `studentAId`, `studentBId`.

**Message**

- `id` (PK, UUID)
- `conversationId` (FK → Conversation.id)
- `senderId` (FK → Student.id)
- `content` (text)
- `isRead` (boolean, default false)
- `createdAt`

Indices on `conversationId`, `senderId`, `createdAt`.  
Cascade delete on conversation.

---

**Key Business Rules Enforced at Application Layer**

- Students can only signup if semester is 5–7.
- MESSAGE requests grant chat permission only when ACCEPTED.
- PARTNER requests require same semester and unlocked groups.
- Group size is limited to 3; group can lock only at size 2–3.
- A student can belong to only one FYP group.
- Conversation is unique per student pair.

---

**Indexes and Performance Notes**

- `Conversation.studentAId` and `Conversation.studentBId` indexed for fast listing.
- `Message.conversationId` indexed for chat retrieval.
- `Message.createdAt` indexed for ordered pagination.
- `Request.createdAt` used for sorting request lists.
- Discovery uses `Student.department`, `Student.currentSemester`, `Student.availability`.

---

**Realtime and RLS (Supabase)**

- Realtime enabled for `Request` and `Message`.
- `Message` RLS policies allow only conversation participants to read/write.
- Requests can use realtime for cache invalidation.

See:
- `supabase/enable_realtime_requests.sql`
- `supabase/enable_realtime_messages.sql`

---

**Schema Normalization**

- User and Student are separated to keep authentication isolated.
- Skills and Projects are normalized into child tables.
- Group membership is represented via a join table to enforce constraints.

---

**Appendix: Enum Definitions**

```
UserRole: STUDENT | ADMIN
UserStatus: ACTIVE | SUSPENDED | DELETION_REQUESTED
AvailabilityStatus: AVAILABLE | BUSY | AWAY
ExperienceLevel: BEGINNER | INTERMEDIATE | ADVANCED
RequestType: MESSAGE | PARTNER
RequestStatus: PENDING | ACCEPTED | REJECTED
```
