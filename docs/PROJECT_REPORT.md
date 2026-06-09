# FYP Finder - Project Report

**Version:** 1.0  
**Date:** February 16, 2026  
**Project Type:** Final Year Project Management and Collaboration Platform

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Target Audience](#2-target-audience)
3. [System Requirements](#3-system-requirements)
   - 3.1 [Functional Requirements](#31-functional-requirements)
   - 3.2 [Non-Functional Requirements](#32-non-functional-requirements)
4. [Technology Stack](#4-technology-stack)
5. [System Architecture](#5-system-architecture)
   - 5.1 [Architectural Layers](#51-architectural-layers)
   - 5.2 [Core Architectural Components](#52-core-architectural-components)
6. [How the System Works](#6-how-the-system-works)
7. [Future Features - Progressive Web App](#7-future-features---progressive-web-app)
8. [Deployment](#8-deployment)
9. [Conclusion](#9-conclusion)

---

## 1. Project Overview

### 1.1 Introduction

**FYP Finder** is a comprehensive web-based platform designed to revolutionize how university students discover, connect, and collaborate on their Final Year Projects (FYP). The platform addresses the common challenge students face in finding compatible teammates with complementary skills, similar interests, and aligned project goals.

### 1.2 Problem Statement

University students, particularly those in their final years (semesters 5-7), often struggle with:
- Finding suitable project partners with complementary skills
- Communicating effectively with potential teammates before committing
- Managing group formation and project details
- Coordinating across departments and skill sets

### 1.3 Solution

FYP Finder provides a unified platform that enables students to:
- Create comprehensive academic profiles showcasing skills and projects
- Discover potential teammates through an intelligent matching algorithm
- Send and manage message/partner requests
- Communicate in real-time through built-in messaging
- Form and manage FYP groups efficiently
- Track availability status for better coordination

### 1.4 Key Features

| Feature | Description |
|---------|-------------|
| **Authentication** | Secure Microsoft OAuth-based login restricted to university email domains |
| **Student Profiles** | Comprehensive profiles with skills, projects, and availability status |
| **Discovery System** | AI-powered matching algorithm based on skills, department, and interests |
| **Request System** | Message and partner request workflows with approval mechanisms |
| **Real-time Messaging** | Instant messaging with read receipts and unread indicators |
| **Group Management** | FYP group creation, member management, and project tracking |
| **Admin Dashboard** | Platform management, student oversight, and analytics |

### 1.5 Scope

The system is designed specifically for **PAF-IAST (Pakistan Air Force Institute of Applied Sciences and Technology)** students, with validation rules ensuring only eligible students (semesters 5-7) with valid university email addresses (`@paf-iast.edu.pk`) can register and use the platform.

---

## 2. Target Audience

### 2.1 Primary Users

#### Students (End Users)
- **Demographics:** University students in semesters 5, 6, and 7
- **Needs:** Finding compatible FYP partners, showcasing skills, real-time communication
- **Technical Proficiency:** Basic to intermediate computer literacy
- **Access Method:** Web browsers on desktop and mobile devices

#### Administrators
- **Role:** Platform managers and university staff
- **Responsibilities:** Student account management, monitoring platform activity, viewing statistics
- **Access Level:** Full administrative privileges

### 2.2 User Characteristics

| User Type | Characteristics | Key Requirements |
|-----------|-----------------|------------------|
| **Students** | Tech-savvy university students seeking FYP partners | Intuitive UI, fast discovery, reliable messaging |
| **Admins** | University staff managing student interactions | Comprehensive dashboards, student management tools |

### 2.3 User Stories

**As a Student, I want to:**
- Create a profile showcasing my skills and previous projects
- Discover other students who match my skill requirements
- Send message requests to potential partners before committing
- Form an FYP group with accepted partners
- Communicate in real-time with my group members

**As an Administrator, I want to:**
- View all registered students and their profiles
- Suspend or manage problematic accounts
- Monitor platform usage statistics
- View conversations for moderation purposes

---

## 3. System Requirements

### 3.1 Functional Requirements

#### 3.1.1 Authentication and Session Management

| ID | Requirement |
|----|-------------|
| FR-01 | The system shall allow students to sign up using a valid `@paf-iast.edu.pk` email address via Microsoft OAuth |
| FR-02 | The system shall validate student ID format and eligibility at signup, accepting only semesters 5-7 |
| FR-03 | The system shall authenticate users via Supabase Auth and synchronize users into the application database |
| FR-04 | The system shall block suspended users from accessing student features |
| FR-05 | The system shall provide login and logout flows for students and admins |
| FR-06 | The system shall block users with DELETION_REQUESTED status from performing actions |

#### 3.1.2 Student Profile Management

| ID | Requirement |
|----|-------------|
| FR-07 | The system shall allow students to view and update their own profiles (except name and department) |
| FR-08 | The system shall allow students to add, update, and remove skills with experience levels |
| FR-09 | The system shall allow students to add, update, and remove projects with links |
| FR-10 | The system shall allow students to update group visibility on their public profile |
| FR-11 | The system shall allow students to set availability status (Available, Busy, Away) |

#### 3.1.3 Discovery and Public Profiles

| ID | Requirement |
|----|-------------|
| FR-12 | The system shall provide a discovery list of students based on mandatory eligibility rules |
| FR-13 | The system shall support discovery filters for department, semester, skills, and availability |
| FR-14 | The system shall compute and return a match score for each discovered student |
| FR-15 | The system shall allow viewing a public profile for any discovered student |
| FR-16 | Discovery results shall only include ACTIVE users in semesters 5-7 |

#### 3.1.4 Messaging Permissions and Requests

| ID | Requirement |
|----|-------------|
| FR-17 | The system shall require a MESSAGE request to be ACCEPTED before two students can chat |
| FR-18 | The system shall prevent self-requests |
| FR-19 | The system shall prevent duplicate pending MESSAGE requests between the same pair |
| FR-20 | The system shall allow students to accept or reject MESSAGE requests they receive |
| FR-21 | The system shall check bidirectional duplicate requests for partner requests |

#### 3.1.5 Partner Requests and Group Formation

| ID | Requirement |
|----|-------------|
| FR-22 | The system shall allow students to send PARTNER requests to eligible students |
| FR-23 | The system shall require both students to be in the same semester for PARTNER requests |
| FR-24 | The system shall prevent PARTNER requests if either student's group is locked |
| FR-25 | The system shall prevent PARTNER requests if the sender's group is already full (max 3) |
| FR-26 | The system shall prevent PARTNER requests to students already in the same group |
| FR-27 | The system shall create or update FYP groups when a PARTNER request is accepted |
| FR-28 | The system shall auto-lock a group when it reaches the maximum member count (3) |

#### 3.1.6 Conversations and Messages

| ID | Requirement |
|----|-------------|
| FR-29 | The system shall create a one-to-one conversation between two students who are allowed to message |
| FR-30 | The system shall allow users to send messages within an authorized conversation |
| FR-31 | The system shall persist messages with sender, content, timestamps, and read status |
| FR-32 | The system shall mark messages as read when a user fetches the conversation |
| FR-33 | The system shall show unread counts per conversation and in the sidebar |
| FR-34 | The system shall update open chats via polling (3-second interval) and real-time events |

#### 3.1.7 Groups

| ID | Requirement |
|----|-------------|
| FR-35 | The system shall allow students to view their current group and its members |
| FR-36 | The system shall allow group members to update the group project name and description |
| FR-37 | The system shall allow group members to lock a group only if size is 2 or 3 |
| FR-38 | The system shall prevent member removal when a group is locked |
| FR-39 | The system shall prevent removals that would result in fewer than 2 members |

#### 3.1.8 Admin Features

| ID | Requirement |
|----|-------------|
| FR-40 | The system shall allow admins to log in and manage student accounts |
| FR-41 | The system shall allow admins to view conversations and messages |
| FR-42 | The system shall provide platform statistics to admins |
| FR-43 | Admin signup shall require existing admin authentication |

---

### 3.2 Non-Functional Requirements

#### 3.2.1 Performance Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-01 | Page load time | < 3 seconds on initial load |
| NFR-02 | API response time | < 500ms for standard queries |
| NFR-03 | Message delivery latency | < 3 seconds (polling interval) |
| NFR-04 | Discovery query performance | < 2 seconds for filtered results |
| NFR-05 | Database query optimization | N+1 queries eliminated via batching |

#### 3.2.2 Security Requirements

| ID | Requirement |
|----|-------------|
| NFR-06 | All API endpoints shall enforce authentication via session validation |
| NFR-07 | Role-based access control shall be enforced on all protected routes |
| NFR-08 | Sensitive operations shall require re-authentication |
| NFR-09 | Rate limiting shall be applied to prevent abuse (configurable per endpoint) |
| NFR-10 | Production logs shall not expose sensitive user data |
| NFR-11 | Database connections shall use SSL encryption |
| NFR-12 | API responses shall not leak internal error details |

#### 3.2.3 Reliability Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-13 | System uptime | 99.5% availability |
| NFR-14 | Data persistence | Zero data loss with proper backups |
| NFR-15 | Failover | Graceful degradation when real-time unavailable |
| NFR-16 | Error handling | Consistent error responses across all endpoints |

#### 3.2.4 Usability Requirements

| ID | Requirement |
|----|-------------|
| NFR-17 | The UI shall be responsive and work on mobile, tablet, and desktop |
| NFR-18 | The system shall support dark mode and light mode themes |
| NFR-19 | Loading states shall be shown for all async operations |
| NFR-20 | Error messages shall be user-friendly and actionable |
| NFR-21 | Navigation shall be intuitive with a sidebar-based layout |

#### 3.2.5 Scalability Requirements

| ID | Requirement |
|----|-------------|
| NFR-22 | The system shall support concurrent users without degradation |
| NFR-23 | Database queries shall use proper indexing for performance |
| NFR-24 | The architecture shall support horizontal scaling via serverless |

#### 3.2.6 Maintainability Requirements

| ID | Requirement |
|----|-------------|
| NFR-25 | Code shall follow TypeScript best practices with strict typing |
| NFR-26 | The system shall use a modular architecture for easy maintenance |
| NFR-27 | API responses shall follow a standardized format |
| NFR-28 | Logging utilities shall separate development and production concerns |

---

## 4. Technology Stack

### 4.1 Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 15.5.9 | React framework with App Router for server-side rendering and routing |
| **React** | 19.1.0 | UI component library |
| **TypeScript** | 5.x | Type-safe JavaScript development |
| **Tailwind CSS** | 4.1.18 | Utility-first CSS framework for styling |
| **React Query (TanStack)** | 5.90.20 | Server state management and caching |
| **React Hook Form** | 7.65.0 | Form handling and validation |
| **Lucide React** | 0.563.0 | Icon library |
| **React Toastify** | 11.0.5 | Toast notifications |
| **date-fns** | 4.1.0 | Date formatting utilities |

### 4.2 Backend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js API Routes** | 15.5.9 | Server-side API endpoints |
| **Prisma ORM** | 7.3.0 | Database ORM and query builder |
| **Node.js** | 18+ | JavaScript runtime |
| **TypeScript** | 5.x | Type-safe server-side code |

### 4.3 Database

| Technology | Purpose |
|------------|---------|
| **PostgreSQL** | Primary relational database |
| **Supabase** | Managed PostgreSQL hosting with built-in features |
| **Prisma Client** | Type-safe database client |

### 4.4 Authentication & Real-time

| Technology | Purpose |
|------------|---------|
| **Supabase Auth** | OAuth authentication (Microsoft Azure) |
| **Supabase Realtime** | WebSocket-based real-time database changes |
| **@supabase/ssr** | Server-side Supabase client for Next.js |

### 4.5 Deployment & Infrastructure

| Technology | Purpose |
|------------|---------|
| **Vercel** | Frontend and serverless API deployment |
| **Supabase Cloud** | Database and authentication hosting |
| **GitHub** | Version control and CI/CD |

### 4.6 Development Tools

| Tool | Purpose |
|------|---------|
| **Prisma Studio** | Database GUI |
| **VS Code** | Primary IDE |
| **Turbopack** | Fast development bundler |
| **PostCSS** | CSS processing |

---

## 5. System Architecture

### 5.1 Architectural Layers

The FYP Finder system follows a **layered architecture** pattern with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Pages     │  │ Components  │  │   Hooks     │             │
│  │  (app/)     │  │             │  │             │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
├─────────────────────────────────────────────────────────────────┤
│                      SERVICE LAYER                              │
│  ┌─────────────────────────────────────────────────────┐       │
│  │              services/ (API Contracts)               │       │
│  └─────────────────────────────────────────────────────┘       │
├─────────────────────────────────────────────────────────────────┤
│                        API LAYER                                │
│  ┌─────────────────────────────────────────────────────┐       │
│  │           app/api/ (Next.js API Routes)             │       │
│  └─────────────────────────────────────────────────────┘       │
├─────────────────────────────────────────────────────────────────┤
│                    BUSINESS LOGIC LAYER                         │
│  ┌─────────────────────────────────────────────────────┐       │
│  │              modules/ (Domain Services)              │       │
│  └─────────────────────────────────────────────────────┘       │
├─────────────────────────────────────────────────────────────────┤
│                     DATA ACCESS LAYER                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Prisma    │  │  Supabase   │  │    lib/     │             │
│  │   Client    │  │  Realtime   │  │  (utils)    │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
├─────────────────────────────────────────────────────────────────┤
│                      DATABASE LAYER                             │
│  ┌─────────────────────────────────────────────────────┐       │
│  │            PostgreSQL (Supabase Hosted)              │       │
│  └─────────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────┘
```

#### Layer Descriptions

| Layer | Location | Responsibility |
|-------|----------|----------------|
| **Presentation** | `app/`, `components/`, `hooks/` | UI rendering, user interaction, state management |
| **Service** | `services/` | API contract definitions, HTTP client calls |
| **API** | `app/api/` | Request handling, authentication, validation |
| **Business Logic** | `modules/` | Domain rules, business validations, workflows |
| **Data Access** | `lib/`, Prisma | Database operations, caching, real-time |
| **Database** | PostgreSQL | Data persistence |

---

### 5.2 Core Architectural Components

#### 5.2.1 Client-Side Architecture

```
┌────────────────────────────────────────────────────────────┐
│                    CLIENT APPLICATION                       │
│                                                             │
│  ┌──────────────────┐    ┌──────────────────┐              │
│  │   React Query    │◄──►│    Services      │              │
│  │   (Cache)        │    │  (API Calls)     │              │
│  └────────┬─────────┘    └──────────────────┘              │
│           │                                                 │
│  ┌────────▼─────────┐    ┌──────────────────┐              │
│  │      Hooks       │◄──►│   Components     │              │
│  │  (Data Access)   │    │     (UI)         │              │
│  └──────────────────┘    └──────────────────┘              │
│                                                             │
│  ┌──────────────────────────────────────────┐              │
│  │         Supabase Realtime Client         │              │
│  │    (WebSocket for live updates)          │              │
│  └──────────────────────────────────────────┘              │
└────────────────────────────────────────────────────────────┘
```

**Key Components:**

| Component | File Location | Purpose |
|-----------|---------------|---------|
| **React Query Provider** | `app/providers.tsx` | Global cache and state management |
| **Theme Provider** | `components/ThemeProvider.tsx` | Dark/light mode support |
| **Dashboard Layout** | `app/dashboard/layout.tsx` | Authenticated page wrapper |
| **Supabase Client** | `lib/supabaseClient.ts` | Browser-side Supabase instance |

#### 5.2.2 Server-Side Architecture

```
┌────────────────────────────────────────────────────────────┐
│                    SERVER APPLICATION                       │
│                                                             │
│  ┌──────────────────────────────────────────┐              │
│  │            API Routes (app/api/)          │              │
│  │  ┌────────┐ ┌────────┐ ┌────────┐        │              │
│  │  │  auth  │ │student │ │ admin  │ ...    │              │
│  │  └────────┘ └────────┘ └────────┘        │              │
│  └──────────────────┬───────────────────────┘              │
│                     │                                       │
│  ┌──────────────────▼───────────────────────┐              │
│  │         Auth Middleware (lib/auth.ts)     │              │
│  │  • requireAuth()  • requireRole()         │              │
│  └──────────────────┬───────────────────────┘              │
│                     │                                       │
│  ┌──────────────────▼───────────────────────┐              │
│  │          Business Logic (modules/)        │              │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐  │              │
│  │  │discovery │ │messaging │ │ request  │  │              │
│  │  └──────────┘ └──────────┘ └──────────┘  │              │
│  └──────────────────┬───────────────────────┘              │
│                     │                                       │
│  ┌──────────────────▼───────────────────────┐              │
│  │           Prisma Client (lib/db.ts)       │              │
│  └──────────────────┬───────────────────────┘              │
│                     │                                       │
│  ┌──────────────────▼───────────────────────┐              │
│  │              PostgreSQL Database          │              │
│  └──────────────────────────────────────────┘              │
└────────────────────────────────────────────────────────────┘
```

#### 5.2.3 Database Schema Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE SCHEMA                           │
│                                                              │
│  ┌─────────┐         ┌─────────┐         ┌─────────┐       │
│  │  User   │────────►│ Student │────────►│  Skill  │       │
│  │         │    1:1  │         │    1:N  │         │       │
│  └─────────┘         └────┬────┘         └─────────┘       │
│       │                   │                                 │
│       │              ┌────▼────┐         ┌─────────┐       │
│       │              │ Project │         │ Request │       │
│       │         1:N  │         │    N:N  │(M/P)    │       │
│       │              └─────────┘         └─────────┘       │
│       │                                       │             │
│  ┌────▼────┐    ┌─────────────┐         ┌────▼────┐       │
│  │  Admin  │    │Conversation │◄────────│FYPGroup │       │
│  │         │    │    1:1      │   via   │   1:N   │       │
│  └─────────┘    └──────┬──────┘ member  └────┬────┘       │
│                        │                      │             │
│                   ┌────▼────┐          ┌─────▼─────┐       │
│                   │ Message │          │FYPGroup   │       │
│                   │   1:N   │          │  Member   │       │
│                   └─────────┘          └───────────┘       │
└─────────────────────────────────────────────────────────────┘
```

#### 5.2.4 Directory Structure

```
fypfinder/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── admin/                # Admin endpoints
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── discovery/            # Discovery endpoints
│   │   ├── group/                # Group management endpoints
│   │   ├── messaging/            # Messaging endpoints
│   │   ├── request/              # Request endpoints
│   │   └── student/              # Student profile endpoints
│   ├── dashboard/                # Protected student pages
│   │   ├── discovery/            # Discovery page
│   │   ├── fyp/                  # FYP group page
│   │   ├── messages/             # Messaging pages
│   │   ├── profile/              # Profile page
│   │   ├── requests/             # Requests page
│   │   └── settings/             # Settings page
│   ├── admin/                    # Admin pages
│   ├── login/                    # Login page
│   ├── signup/                   # Signup page
│   └── layout.tsx                # Root layout
│
├── components/                   # Reusable UI components
│   ├── dashboard/                # Dashboard-specific components
│   ├── messaging/                # Messaging components
│   ├── request/                  # Request components
│   └── student/                  # Student profile components
│
├── hooks/                        # Custom React hooks
│   ├── auth/                     # Authentication hooks
│   ├── group/                    # Group management hooks
│   ├── messaging/                # Messaging hooks
│   ├── request/                  # Request hooks
│   └── student/                  # Student profile hooks
│
├── modules/                      # Business logic services
│   ├── admin/                    # Admin business logic
│   ├── auth/                     # Auth business logic
│   ├── discovery/                # Discovery algorithm
│   ├── group/                    # Group business logic
│   ├── messaging/                # Messaging business logic
│   ├── request/                  # Request business logic
│   └── student/                  # Student business logic
│
├── services/                     # API client services
│   ├── student.service.ts        # Student API calls
│   ├── discovery.service.ts      # Discovery API calls
│   └── ...
│
├── lib/                          # Shared utilities
│   ├── auth.ts                   # Auth helpers
│   ├── db.ts                     # Prisma client
│   ├── supabase.ts               # Server Supabase client
│   ├── supabaseClient.ts         # Browser Supabase client
│   ├── logger.ts                 # Production-safe logger
│   ├── rate-limit.ts             # Rate limiting utility
│   └── api-response.ts           # Standardized responses
│
├── prisma/                       # Database schema
│   └── schema.prisma             # Prisma schema definition
│
└── docs/                         # Documentation
    ├── DOCUMENTATION.md
    ├── SRS.md
    ├── SYSTEM_ARCHITECTURE.md
    └── ...
```

---

## 6. How the System Works

### 6.1 User Registration Flow

```
┌─────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  User   │───►│ Signup   │───►│ Microsoft│───►│ Callback │
│ Visits  │    │  Page    │    │   OAuth  │    │  Route   │
└─────────┘    └──────────┘    └──────────┘    └────┬─────┘
                                                     │
     ┌───────────────────────────────────────────────┘
     │
     ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Validate   │───►│ Create User  │───►│   Create     │
│   Email &    │    │ in Prisma    │    │   Student    │
│  Student ID  │    │              │    │   Profile    │
└──────────────┘    └──────────────┘    └──────┬───────┘
                                               │
                                               ▼
                                        ┌──────────────┐
                                        │  Redirect to │
                                        │  Dashboard   │
                                        └──────────────┘
```

**Process Details:**
1. User visits `/signup` and clicks "Sign up with Microsoft"
2. Redirected to Microsoft OAuth consent screen
3. Upon approval, redirected to `/api/auth/callback`
4. Callback validates university email domain (`@paf-iast.edu.pk`)
5. Creates `User` record in database
6. Creates associated `Student` profile with default values
7. Redirects to `/dashboard/discovery`

### 6.2 Discovery and Matching Flow

```
┌─────────────┐    ┌──────────────┐    ┌──────────────┐
│  Student    │───►│   Apply      │───►│   API Call   │
│  Opens      │    │   Filters    │    │   to Server  │
│  Discovery  │    │              │    │              │
└─────────────┘    └──────────────┘    └──────┬───────┘
                                              │
     ┌────────────────────────────────────────┘
     │
     ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Query      │───►│   Calculate  │───►│   Return     │
│   Eligible   │    │   Match      │    │   Sorted     │
│   Students   │    │   Scores     │    │   Results    │
└──────────────┘    └──────────────┘    └──────────────┘
```

**Match Score Algorithm:**
- **Skill Match:** +20 points per matching skill
- **Department Match:** +15 points for same department
- **Semester Match:** +10 points for same semester
- **Project Relevance:** +5 points per project

**Filtering Criteria:**
- Only ACTIVE users
- Only semesters 5-7
- Excludes current user
- Optional filters: department, semester, skills, availability

### 6.3 Request System Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    REQUEST WORKFLOW                          │
│                                                              │
│   MESSAGE REQUEST                    PARTNER REQUEST         │
│   ┌─────────────┐                   ┌─────────────┐         │
│   │   Student   │                   │   Student   │         │
│   │   Sends     │                   │   Sends     │         │
│   │   Request   │                   │   Request   │         │
│   └──────┬──────┘                   └──────┬──────┘         │
│          │                                  │                │
│          ▼                                  ▼                │
│   ┌─────────────┐                   ┌─────────────┐         │
│   │  Validate   │                   │  Validate   │         │
│   │  - No self  │                   │  - Same sem │         │
│   │  - No dupe  │                   │  - Not full │         │
│   └──────┬──────┘                   │  - Not lock │         │
│          │                          │  - Not same │         │
│          ▼                          │    group    │         │
│   ┌─────────────┐                   └──────┬──────┘         │
│   │   Create    │                          │                │
│   │   PENDING   │                          ▼                │
│   │   Request   │                   ┌─────────────┐         │
│   └──────┬──────┘                   │   Create    │         │
│          │                          │   PENDING   │         │
│          ▼                          │   Request   │         │
│   ┌─────────────┐                   └──────┬──────┘         │
│   │  Receiver   │                          │                │
│   │  Accepts/   │                          ▼                │
│   │  Rejects    │                   ┌─────────────┐         │
│   └──────┬──────┘                   │  Receiver   │         │
│          │                          │  Accepts/   │         │
│          ▼                          │  Rejects    │         │
│   ┌─────────────┐                   └──────┬──────┘         │
│   │  If ACCEPT: │                          │                │
│   │  Can now    │                          ▼                │
│   │  message    │                   ┌─────────────┐         │
│   └─────────────┘                   │  If ACCEPT: │         │
│                                     │  Create/    │         │
│                                     │  Merge FYP  │         │
│                                     │  Group      │         │
│                                     └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

### 6.4 Messaging Flow

```
┌─────────────┐    ┌──────────────┐    ┌──────────────┐
│  Student    │───►│   Check      │───►│   Get/Create │
│  Clicks     │    │   Permission │    │  Conversation│
│  "Message"  │    │  (ACCEPTED)  │    │              │
└─────────────┘    └──────────────┘    └──────┬───────┘
                                              │
     ┌────────────────────────────────────────┘
     │
     ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Load       │◄──►│   Real-time  │◄──►│   Polling    │
│   Messages   │    │   WebSocket  │    │   (3 sec)    │
└──────┬───────┘    └──────────────┘    └──────────────┘
       │
       ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Send       │───►│   Optimistic │───►│   Persist    │
│   Message    │    │   UI Update  │    │   to DB      │
└──────────────┘    └──────────────┘    └──────────────┘
```

**Messaging Features:**
- Optimistic UI updates for instant feedback
- 3-second polling interval for reliable updates
- Supabase Realtime as enhancement when available
- Read receipts and unread indicators
- Connection status indicator

### 6.5 Group Management Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    GROUP LIFECYCLE                           │
│                                                              │
│   ┌─────────────┐                                           │
│   │   Partner   │                                           │
│   │   Request   │                                           │
│   │   Accepted  │                                           │
│   └──────┬──────┘                                           │
│          │                                                   │
│          ▼                                                   │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    │
│   │  Case 1:    │    │  Case 2:    │    │  Case 3:    │    │
│   │  Neither    │    │  One has    │    │  New group  │    │
│   │  has group  │    │   group     │    │   created   │    │
│   └──────┬──────┘    └──────┬──────┘    └──────┬──────┘    │
│          │                  │                   │            │
│          ▼                  ▼                   ▼            │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    │
│   │Create new   │    │ Add other   │    │ Both added  │    │
│   │   group     │    │  to group   │    │  to group   │    │
│   └──────┬──────┘    └─────────────┘    └─────────────┘    │
│          │                                                   │
│          ▼                                                   │
│   ┌─────────────┐                                           │
│   │  If 3 members │                                         │
│   │  Auto-lock    │                                         │
│   └─────────────┘                                           │
│                                                              │
│   GROUP ACTIONS:                                            │
│   • Update project name/description                         │
│   • Lock group (if 2-3 members)                            │
│   • Remove member (if not locked, keeps ≥2)               │
│   • Toggle group visibility on profile                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. Future Features - Progressive Web App

### 7.1 PWA Implementation Plan

FYP Finder is designed with Progressive Web App (PWA) capabilities in mind for future implementation:

#### 7.1.1 Planned PWA Features

| Feature | Description | Benefit |
|---------|-------------|---------|
| **Offline Support** | Service workers for offline access | Use app without internet |
| **Push Notifications** | Real-time alerts for messages/requests | Immediate user engagement |
| **Install Prompt** | Add to home screen functionality | Native app-like experience |
| **Background Sync** | Queue messages when offline | Seamless connectivity |
| **App Shell Architecture** | Instant loading cached shell | Faster perceived performance |

#### 7.1.2 Technical Requirements for PWA

```javascript
// Future manifest.json structure
{
  "name": "FYP Finder",
  "short_name": "FYP Finder",
  "description": "Find your perfect FYP partner",
  "start_url": "/dashboard/discovery",
  "display": "standalone",
  "background_color": "#1f2937",
  "theme_color": "#4f46e5",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192" },
    { "src": "/icons/icon-512.png", "sizes": "512x512" }
  ]
}
```

#### 7.1.3 PWA Benefits for Users

- **Mobile-First Experience:** Native app feel on mobile devices
- **Offline Access:** View profiles and cached conversations offline
- **Push Notifications:** Never miss a partner request or message
- **Faster Loading:** Cached assets for instant page loads
- **Cross-Platform:** Single codebase for web and mobile

---

## 8. Deployment

### 8.1 Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PRODUCTION ARCHITECTURE                   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                     VERCEL                           │    │
│  │  ┌─────────────┐    ┌─────────────┐                 │    │
│  │  │   Edge      │    │  Serverless │                 │    │
│  │  │   CDN       │    │  Functions  │                 │    │
│  │  │  (Static)   │    │  (API)      │                 │    │
│  │  └─────────────┘    └──────┬──────┘                 │    │
│  └─────────────────────────────┼───────────────────────┘    │
│                                │                             │
│                                ▼                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                    SUPABASE                          │    │
│  │  ┌─────────────┐    ┌─────────────┐                 │    │
│  │  │  PostgreSQL │    │   Auth      │                 │    │
│  │  │  Database   │    │   (OAuth)   │                 │    │
│  │  └─────────────┘    └─────────────┘                 │    │
│  │  ┌─────────────┐    ┌─────────────┐                 │    │
│  │  │  Realtime   │    │   Storage   │                 │    │
│  │  │  (WebSocket)│    │  (Images)   │                 │    │
│  │  └─────────────┘    └─────────────┘                 │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### 8.2 Environment Configuration

| Environment | URL | Purpose |
|-------------|-----|---------|
| **Production** | `fypfinder.vercel.app` | Live production environment |
| **Preview** | `fyp-*-branch.vercel.app` | PR preview deployments |
| **Development** | `localhost:3000` | Local development |

### 8.3 Required Environment Variables

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SECRET_SUPABASE_SERVICE_ROLE_KEY=xxx

# Database
DATABASE_URL=postgresql://...
SHADOW_DATABASE_URL=postgresql://...

# Application
NEXT_PUBLIC_APP_URL=https://fypfinder.vercel.app
```

### 8.4 Deployment Commands

```bash
# Build for production
npm run build

# Start production server
npm start

# Generate Prisma client
npx prisma generate

# Apply database migrations
npx prisma migrate deploy
```

### 8.5 CI/CD Pipeline

```
┌─────────────┐    ┌──────────────┐    ┌──────────────┐
│   Push to   │───►│   Vercel     │───►│   Deploy     │
│   GitHub    │    │   Build      │    │   Preview    │
└─────────────┘    └──────────────┘    └──────────────┘
       │
       │ merge to main
       ▼
┌─────────────┐    ┌──────────────┐    ┌──────────────┐
│   Merge     │───►│   Vercel     │───►│   Deploy     │
│   to Main   │    │   Build      │    │   Production │
└─────────────┘    └──────────────┘    └──────────────┘
```

---

## 9. Conclusion

### 9.1 Summary

FYP Finder is a comprehensive, production-ready platform that addresses the critical need for university students to find compatible Final Year Project partners. Built with modern technologies including Next.js 15, React 19, TypeScript, and Supabase, the system provides:

- **Secure Authentication:** Microsoft OAuth with university email validation
- **Intelligent Discovery:** Skill-based matching algorithm
- **Real-time Communication:** Instant messaging with polling and WebSocket support
- **Robust Group Management:** Complete FYP team formation workflow
- **Administrative Control:** Comprehensive admin dashboard for platform oversight

### 9.2 Key Achievements

- ✅ Secure, role-based authentication system
- ✅ Intelligent student matching algorithm
- ✅ Real-time messaging infrastructure
- ✅ Comprehensive request management system
- ✅ Scalable, maintainable codebase architecture
- ✅ Production-ready deployment on Vercel

### 9.3 Future Roadmap

| Phase | Features |
|-------|----------|
| **Phase 2** | PWA support with offline capabilities |
| **Phase 3** | Push notifications for mobile |
| **Phase 4** | AI-powered partner recommendations |
| **Phase 5** | Integration with university systems |

---

**Document Version:** 1.0  
**Last Updated:** February 16, 2026  
**Authors:** FYP Finder Development Team
