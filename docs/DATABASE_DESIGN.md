# Database Design — FYP Finder

## 1. Overview
This document describes the database schema and design principles for FYP Finder. The authoritative implementation is in `prisma/schema.prisma`.

## 2. Design Goals
- Separate authentication data from student profile data
- Enforce permissions and uniqueness through schema constraints
- Support realtime messaging and request workflows
- Persist AI idea validation and push subscription metadata
- Keep profile and group data normalized

## 3. Core Entities

### User
- `id`: UUID primary key
- `email`: unique identifier
- `role`: `STUDENT` or `ADMIN`
- `status`: `ACTIVE` or `SUSPENDED`
- Relationship:
  - `student`: optional one-to-one to `Student`
  - `admin`: optional one-to-one to `Admin`
  - `pushSubscriptions`: one-to-many

### Student
- `id`: UUID primary key
- `userId`: unique foreign key to `User`
- Profile fields: `name`, `department`, `currentSemester`, `profilePicture`, `interests`, `phone`, `linkedinUrl`, `githubUrl`
- Availability: `AvailabilityStatus`
- Privacy: `showGroupOnProfile`
- Additional fields: `careerGoal`, `hobbies`, `preferredTechStack`, `industryPreference`
- Relationships:
  - `skills`, `projects`, `internships`
  - `sentRequests`, `receivedRequests`
  - `groupMember`
  - `conversationsAsA`, `conversationsAsB`, `sentMessages`
  - `ideaValidations`

### Admin
- `id`: UUID primary key
- `userId`: unique foreign key to `User`
- `name`

### Skill
- `studentId`: foreign key to `Student`
- `name`, `description`, `level`
- Unique constraint on `(studentId, name)`

### Project
- `studentId`: foreign key to `Student`
- `name`, `description`, optional `liveLink`, `githubLink`

### Internship
- `studentId`: foreign key to `Student`
- `companyName`, `position`, `duration`, optional `description`, `certificateLink`

### Request
- `fromStudentId`, `toStudentId`: sender and recipient
- `type`: `MESSAGE` or `PARTNER`
- `reason`, `status`, `createdAt`
- Relevant indexes for queries by sender, recipient, type, and status

### FYPGroup and FYPGroupMember
- `FYPGroup` stores project metadata and `isLocked`
- `FYPGroupMember` joins `Student` to `FYPGroup`
- Unique `studentId` in `FYPGroupMember` enforces single-group membership

### Conversation and Message
- Conversations connect two students with a unique pair constraint
- Messages belong to a conversation and track sender, read status, edit status, and timestamps
- Indexes on `conversationId`, `senderId`, and `createdAt`

### PushSubscription
- Stores browser push endpoint, encryption keys, user agent, and last used timestamp
- Unique by `endpoint`
- Related to `User`

### FYPIdeaValidation
- AI validation records for idea submissions
- Stores normalized input hash and raw model output JSON
- Scores and recommendation fields
- Unique `(studentId, inputHash)` prevents duplicate evaluations

### PastFypIdea
- Catalog of historic FYP ideas and metadata
- Includes searchable JSON fields and text indices for search

## 4. Relationship Model
- `User` 1:1 `Student`
- `User` 1:1 `Admin`
- `Student` 1:N `Skill`, `Project`, `Internship`, `FYPIdeaValidation`
- `Student` 1:N `Request` as sender and receiver
- `Student` 1:1 `FYPGroupMember`
- `FYPGroup` 1:N `FYPGroupMember`
- `Student` 1:N `Conversation` as `studentA` or `studentB`
- `Conversation` 1:N `Message`
- `User` 1:N `PushSubscription`

## 5. Index Strategy
- `@@index([studentId])` on `Skill`, `Project`, `Internship`, `FYPIdeaValidation`
- `@@index([fromStudentId])`, `@@index([toStudentId])`, `@@index([type, status])` on `Request`
- Unique index on `Conversation.studentAId, studentBId`
- `Message` indexed by `conversationId`, `senderId`, `createdAt`
- `PushSubscription` indexed by `userId`

## 6. Business Constraint Enforcement
- Unique student-group membership ensures one group per student
- Unique conversation pairs prevent duplicate chats
- Request status and type indexes optimize pending request queries
- Input hash uniqueness avoids duplicate AI validation work

## 7. Realtime Considerations
- `Message` and `Request` tables are intended for Supabase Realtime subscriptions
- Realtime updates are used for chat and request notifications
- Ensure RLS policies on these tables only expose authorized participants

## 8. Schema Extensions
The current schema supports future extension points:
- Additional admin roles, permissions, or audit logs
- Group metadata like topic tags or milestones
- Team discussion threads or shared documents
- Advanced match scoring attributes
- Analytics events or action history tables

## 9. Notes
- `datasource db` is configured for PostgreSQL, but the connection URL is omitted in the schema file for environment security.
- `generator client` outputs generated Prisma types to `lib/generated/prisma`.
- Keep Prisma-generated types synchronized with the schema by running `prisma generate` after every schema change.
