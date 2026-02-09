# Software Requirements Specification (SRS) — FYP Finder

Version: 1.0  
Date: 2026-02-09

**Introduction**

**Purpose**  
This document specifies the functional and non-functional requirements for the FYP Finder system. It is intended for developers, testers, project supervisors, and stakeholders.

**Scope**  
FYP Finder is a web platform that enables eligible university students to create profiles, discover potential teammates, send message and partner requests, form Final Year Project (FYP) groups, and chat in real time. Administrators can manage student accounts and view platform activity.

**Definitions and Abbreviations**  
FYP: Final Year Project  
RLS: Row Level Security (PostgreSQL/Supabase)  
Realtime: Supabase realtime database change events  
RQ: React Query (TanStack)  
Student: End-user with student role  
Admin: End-user with admin role

**References**  
`docs/DOCUMENTATION.md`  
`docs/FEATURE_3_DISCOVERY.md`  
`docs/FEATURE_4_REQUEST_SYSTEM.md`  
`MESSAGING_ARCHITECTURE.md`  
`prisma/schema.prisma`

**Overall Description**

**Product Perspective**  
The system is a Next.js (App Router) web application with server API routes, a PostgreSQL database (Supabase), and client-side state management using React Query. Authentication is handled via Supabase Auth with application-level user and student data stored in Prisma-managed tables.

**User Classes and Characteristics**  
Student: Creates and maintains profile, discovers peers, sends requests, manages group, and chats.  
Admin: Manages students, views conversations, and monitors platform statistics.

**Operating Environment**  
Client: Modern web browsers on desktop and mobile.  
Server: Node.js runtime hosting Next.js server routes and Prisma.  
Database: Supabase-hosted PostgreSQL with Realtime enabled on selected tables.

**Constraints**  
Signup must use university email domain `@paf-iast.edu.pk`.  
Student ID must match the required format and represent an eligible semester (5–7).  
Discovery results only include ACTIVE users in semesters 5–7.  
Partner group size is limited to 3 members.  
Group locking is allowed only when group size is 2 or 3.  
Message content length is limited to 1000 characters.  
Project name length is limited to 100 characters and description to 500 characters.

**Assumptions and Dependencies**  
Supabase Auth is available and configured correctly.  
Supabase Realtime is enabled for required tables.  
RLS policies are configured for secure realtime payloads.  
Reliable internet connectivity is available to clients.

**System Features and Functional Requirements**

**Authentication and Session Management**  
FR-1: The system shall allow students to sign up using a valid `@paf-iast.edu.pk` email address.  
FR-2: The system shall validate student ID format and eligibility at signup, accepting only semesters 5–7.  
FR-3: The system shall authenticate users via Supabase Auth and synchronize users into the application database.  
FR-4: The system shall block suspended users from accessing student features.  
FR-5: The system shall provide login and logout flows for students and admins.

**Student Profile Management**  
FR-6: The system shall allow students to view and update their own profiles.  
FR-7: The system shall allow students to add, update, and remove skills.  
FR-8: The system shall allow students to add, update, and remove projects.  
FR-9: The system shall allow students to update group visibility on their public profile.

**Discovery and Public Profiles**  
FR-10: The system shall provide a discovery list of students based on mandatory eligibility rules.  
FR-11: The system shall support discovery filters for department, semester, skills, and availability.  
FR-12: The system shall compute and return a match score for each discovered student.  
FR-13: The system shall allow viewing a public profile for any discovered student.

**Messaging Permissions and Requests**  
FR-14: The system shall require a MESSAGE request to be ACCEPTED before two students can chat.  
FR-15: The system shall prevent self-requests.  
FR-16: The system shall prevent duplicate pending MESSAGE requests between the same pair.  
FR-17: The system shall allow students to accept or reject MESSAGE requests they receive.

**Partner Requests and Group Formation**  
FR-18: The system shall allow students to send PARTNER requests to eligible students.  
FR-19: The system shall require both students to be in the same semester for PARTNER requests.  
FR-20: The system shall prevent PARTNER requests if either student’s group is locked.  
FR-21: The system shall prevent PARTNER requests if the sender’s group is already full.  
FR-22: The system shall allow receivers to accept or reject PARTNER requests.  
FR-23: The system shall create or update FYP groups when a PARTNER request is accepted.  
FR-24: The system shall auto-lock a group when it reaches the maximum member count.

**Conversations and Messages**  
FR-25: The system shall create a one-to-one conversation between two students who are allowed to message.  
FR-26: The system shall allow users to send messages within an authorized conversation.  
FR-27: The system shall persist messages with sender, content, timestamps, and read status.  
FR-28: The system shall mark messages as read when a user fetches the conversation.  
FR-29: The system shall show unread counts per conversation and in the sidebar.  
FR-30: The system shall update open chats in real time on message INSERT events.

**Groups**  
FR-31: The system shall allow students to view their current group and its members.  
FR-32: The system shall allow group members to update the group project name and description.  
FR-33: The system shall allow group members to lock a group only if size is 2 or 3.  
FR-34: The system shall prevent member removal when a group is locked.  
FR-35: The system shall prevent removals that would result in fewer than 2 members.

**Notifications and Realtime**  
FR-36: The system shall subscribe to realtime events for Request and Message tables.  
FR-37: The system shall update caches and notifications when realtime events are received.  
FR-38: The system shall show a notification badge for unread items.  
FR-39: The system shall provide toast notifications for relevant realtime events.

**Admin Features**  
FR-40: The system shall allow admins to log in and manage student accounts.  
FR-41: The system shall allow admins to view conversations and messages.  
FR-42: The system shall provide platform statistics to admins.

**External Interface Requirements**

**User Interface**  
The system shall provide web pages for authentication, discovery, profile, requests, messaging, and group management.  
The system shall provide admin pages for student management and conversation viewing.

**API Interfaces**  
The system shall expose REST-style endpoints under `app/api/*` for auth, student, discovery, messaging, requests, groups, and admin operations.  
Endpoints are defined in `docs/DOCUMENTATION.md` and implemented in `app/api/*`.

**Database Interface**  
The system shall use PostgreSQL via Prisma with entities: User, Student, Skill, Project, Request, Conversation, Message, FYPGroup, and FYPGroupMember.

**Communication Interfaces**  
The system shall use HTTPS for API communication.  
The system shall use Supabase Realtime (websocket-based) for database change events.

**Data Requirements**

**Core Entities and Relationships**  
User has role and status and is linked to Student or Admin.  
Student has profile data, skills, projects, requests, conversations, and group membership.  
Request connects two students for MESSAGE or PARTNER flows.  
Conversation connects two students uniquely.  
Message belongs to one conversation and one sender.  
FYPGroup and FYPGroupMember represent team membership.

**Data Validation Rules**  
Student email must be `@paf-iast.edu.pk`.  
Student ID format must follow validation rules defined in auth service.  
Message length must not exceed 1000 characters.  
Group project name and description must meet length limits.

**Non-Functional Requirements**

**Security**  
NFR-1: The system shall enforce role-based access controls on all protected routes.  
NFR-2: The system shall enforce RLS for realtime payload visibility where enabled.  
NFR-3: The system shall prevent unauthorized access to conversations and messages.

**Performance**  
NFR-4: The system shall use client-side caching for frequently accessed data.  
NFR-5: The system shall keep the UI responsive during background refetches.

**Reliability and Availability**  
NFR-6: The system shall handle transient network errors and retry requests where appropriate.  
NFR-7: The system shall not lose messages due to client-side cache overwrites.

**Usability**  
NFR-8: The system shall provide responsive layouts for desktop and mobile.  
NFR-9: The system shall provide clear feedback for loading, empty, and error states.

**Maintainability**  
NFR-10: The system shall separate UI, hooks, services, and server modules for clarity.  
NFR-11: The system shall be written in TypeScript with typed data models.

**Portability**  
NFR-12: The system shall run on any modern browser and standard Node.js runtime.

**Appendix: Key Pages**

Landing: `/`  
Auth: `/login`, `/signup`  
Discovery: `/dashboard/discovery`  
Public Profile: `/dashboard/discovery/profile/[studentId]`  
Messages: `/dashboard/messages`, `/dashboard/messages/[conversationId]`  
Requests: `/dashboard/requests/messages`, `/dashboard/requests/partner`  
FYP Group: `/dashboard/fyp`  
Admin: `/admin/login`, `/admin/signup`, `/admin/(authenticated)/dashboard`, `/admin/(authenticated)/students`, `/admin/(authenticated)/messages`
