# System Diagrams — FYP Finder

Version: 1.0  
Date: 2026-02-09

---

**Use Case Diagram**

```mermaid
flowchart LR
  Student((Student))
  Admin((Admin))

  subgraph StudentUseCases[Student Use Cases]
    UC1[Sign up / Login]
    UC2[Manage Profile]
    UC3[Discover Students]
    UC4[Send Message Request]
    UC5[Send Partner Request]
    UC6[Chat in Realtime]
    UC7[Manage Group]
  end

  subgraph AdminUseCases[Admin Use Cases]
    UA1[Admin Login]
    UA2[Manage Students]
    UA3[View Conversations]
    UA4[View Platform Stats]
  end

  Student --> UC1
  Student --> UC2
  Student --> UC3
  Student --> UC4
  Student --> UC5
  Student --> UC6
  Student --> UC7

  Admin --> UA1
  Admin --> UA2
  Admin --> UA3
  Admin --> UA4
```

---

**Activity Diagram — Send Message**

```mermaid
flowchart TD
  A[Open Conversation] --> B{Allowed to Message?}
  B -- No --> C[Show Permission Error]
  B -- Yes --> D[Type Message]
  D --> E[Click Send]
  E --> F[Optimistic UI Update]
  F --> G[POST /api/messaging/send]
  G --> H{Server Validates}
  H -- Fail --> I[Rollback + Error Toast]
  H -- Pass --> J[Message Stored in DB]
  J --> K[Realtime INSERT Event]
  K --> L[Receiver Cache Update]
  L --> M[Message Appears in UI]
```

---

**Flowchart 1 — Discovery Flow**

```mermaid
flowchart TD
  A[Student Opens Discovery] --> B[Apply Filters]
  B --> C[GET /api/discovery/get-matched-students]
  C --> D[Backend Rules + Match Score]
  D --> E[Results Returned]
  E --> F[Render Student Cards]
  F --> G[Click Profile]
  G --> H[View Public Profile]
```

---

**Flowchart 2 — Partner Request Flow**

```mermaid
flowchart TD
  A[Send Partner Request] --> B{Same Semester?}
  B -- No --> C[Reject Request]
  B -- Yes --> D{Group Locked?}
  D -- Yes --> C
  D -- No --> E[Create Request]
  E --> F[Receiver Accepts?]
  F -- No --> G[Status: REJECTED]
  F -- Yes --> H[Create/Update Group]
  H --> I{Group Full?}
  I -- Yes --> J[Lock Group]
  I -- No --> K[Group Remains Open]
```

---

**Sequence Diagram — Realtime Messaging**

```mermaid
sequenceDiagram
  participant A as Student A (Sender)
  participant UI as Client UI
  participant API as API Route
  participant DB as Database
  participant RT as Supabase Realtime
  participant B as Student B (Receiver)

  A->>UI: Type message + Send
  UI->>UI: Optimistic update
  UI->>API: POST /api/messaging/send
  API->>DB: Insert message
  DB-->>API: Message saved
  DB-->>RT: INSERT event
  RT-->>B: Realtime payload
  B->>UI: Cache update
  UI-->>A: Send success
```

---

**Whole System Workflow Diagram**

```mermaid
flowchart LR
  Auth[Auth + Session] --> Profile[Profile Setup]
  Profile --> Discovery[Discovery]
  Discovery --> Requests[Requests System]
  Requests --> Messaging[Messaging]
  Requests --> Groups[Group Formation]
  Messaging --> Notifications[Realtime Notifications]
  Groups --> AdminView[Admin Monitoring]

  subgraph AdminFlow[Admin Flow]
    AdminLogin[Admin Login] --> StudentMgmt[Manage Students]
    StudentMgmt --> Stats[View Stats]
    StudentMgmt --> ViewChats[View Conversations]
  end
```
