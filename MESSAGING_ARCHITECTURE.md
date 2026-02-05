# 📬 Real-Time Messaging System Architecture

## Overview

This document describes the architecture of the real-time messaging system built with **Supabase Realtime** and **React Query** for the FYP Finder application.

---

## � Complete Feature Flow

### User Journey & Component Mapping

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        MESSAGING FEATURE COMPLETE FLOW                           │
└─────────────────────────────────────────────────────────────────────────────────┘

1️⃣ PERMISSION CHECK (Can users message each other?)
   ┌─────────────────────────────────────────────────────────────────────────────┐
   │ User visits Profile Page → /dashboard/discovery/profile/[studentId]         │
   │                                                                             │
   │  Component: PublicProfileView → SendRequestButtons                          │
   │       ↓                                                                     │
   │  Hook: useCheckMessagePermission(targetStudentId)                           │
   │       ↓                                                                     │
   │  API: GET /api/messaging/check-permission?targetStudentId=xxx               │
   │       ↓                                                                     │
   │  Service: canStudentsMessage(studentA, studentB)                            │
   │       ↓                                                                     │
   │  Checks: ① Are they partners in same group?                                 │
   │          ② Does either have ACCEPTED message request from the other?        │
   │       ↓                                                                     │
   │  Returns: { allowed: true/false }                                           │
   │       ↓                                                                     │
   │  UI Shows: "Start Conversation" button OR "Send Message Request" button     │
   └─────────────────────────────────────────────────────────────────────────────┘

2️⃣ START CONVERSATION
   ┌─────────────────────────────────────────────────────────────────────────────┐
   │ User clicks "Start Conversation" button                                     │
   │                                                                             │
   │  Component: SendRequestButtons                                              │
   │       ↓                                                                     │
   │  Hook: useStartConversation() → startConversation({ targetStudentId })      │
   │       ↓                                                                     │
   │  API: POST /api/messaging/start                                             │
   │       ↓                                                                     │
   │  Service: getOrCreateConversation(studentA, studentB)                       │
   │       ↓                                                                     │
   │  Creates Conversation in DB (or returns existing one)                       │
   │       ↓                                                                     │
   │  Redirect to: /dashboard/messages/[conversationId]                          │
   └─────────────────────────────────────────────────────────────────────────────┘

3️⃣ VIEW CONVERSATIONS LIST
   ┌─────────────────────────────────────────────────────────────────────────────┐
   │ User visits Messages Page → /dashboard/messages                             │
   │                                                                             │
   │  Page: app/dashboard/messages/page.tsx                                      │
   │       ↓                                                                     │
   │  Component: ConversationList                                                │
   │       ↓                                                                     │
   │  Hook: useConversations()                                                   │
   │       ↓ (React Query - cached for 2 minutes)                                │
   │  API: GET /api/messaging/get-conversations                                  │
   │       ↓                                                                     │
   │  Service: getConversationsForStudent(studentId)                             │
   │       ↓                                                                     │
   │  Returns: List with otherStudent info, lastMessage, unreadCount             │
   │       ↓                                                                     │
   │  Real-time Updates via: useRealtimeConversationUpdates(studentId)           │
   │  (Subscribes to Message table INSERT events, invalidates cache)             │
   └─────────────────────────────────────────────────────────────────────────────┘

4️⃣ VIEW CHAT / SEND MESSAGES
   ┌─────────────────────────────────────────────────────────────────────────────┐
   │ User clicks on a conversation                                               │
   │                                                                             │
   │  Page: app/dashboard/messages/[conversationId]/page.tsx                     │
   │       ↓                                                                     │
   │  Components: ConversationList (sidebar) + ChatWindow                        │
   │       ↓                                                                     │
   │  ┌─────────────────────────────────────────────────────────────────────┐   │
   │  │ ChatWindow                                                           │   │
   │  │                                                                      │   │
   │  │  Hook: useMessages(conversationId)                                   │   │
   │  │       ↓ (React Query - cached for 5 minutes)                         │   │
   │  │  API: GET /api/messaging/get-messages?conversationId=xxx             │   │
   │  │       ↓                                                              │   │
   │  │  Service: getMessages(conversationId, studentId)                     │   │
   │  │       ↓                                                              │   │
   │  │  Also calls: markMessagesAsRead(conversationId, studentId)           │   │
   │  │                                                                      │   │
   │  │  Real-time Hook: useRealtimeMessages(conversationId, studentId)      │   │
   │  │       ↓                                                              │   │
   │  │  Supabase Channel: messages:{conversationId}                         │   │
   │  │       ↓                                                              │   │
   │  │  On INSERT → Add message to cache → Invalidate conversations         │   │
   │  └─────────────────────────────────────────────────────────────────────┘   │
   │                                                                             │
   │  User types message and clicks Send                                         │
   │       ↓                                                                     │
   │  Hook: useSendMessage() → sendMessage({ conversationId, content, ... })     │
   │       ↓                                                                     │
   │  Optimistic Update: Add message to cache immediately                        │
   │       ↓                                                                     │
   │  API: POST /api/messaging/send                                              │
   │       ↓                                                                     │
   │  Service: sendMessage(conversationId, senderId, content)                    │
   │       ↓                                                                     │
   │  Creates Message in DB → Triggers Supabase Realtime → Other user sees it    │
   └─────────────────────────────────────────────────────────────────────────────┘

5️⃣ GLOBAL NOTIFICATIONS (Bell Icon)
   ┌─────────────────────────────────────────────────────────────────────────────┐
   │ User is anywhere in the dashboard                                           │
   │                                                                             │
   │  Context: NotificationProvider (wraps entire dashboard)                     │
   │       ↓                                                                     │
   │  Hook: useMyProfile() → Gets current student ID                             │
   │       ↓                                                                     │
   │  Supabase Channel: message-notifications-{studentId}                        │
   │       ↓                                                                     │
   │  Listens for: postgres_changes on Message table (INSERT events)             │
   │       ↓                                                                     │
   │  When new message arrives (not from self):                                  │
   │       ↓                                                                     │
   │  ① Invalidate: conversations, unreadCount, messages cache                   │
   │  ② Fetch sender info: GET /api/student/get-public-profile/{senderId}        │
   │  ③ Add notification to state: { type: "NEW_MESSAGE", senderName, ... }      │
   │  ④ Show Toast: "💬 {senderName}: {messagePreview}"                          │
   │       ↓                                                                     │
   │  Component: NotificationBell                                                │
   │       ↓                                                                     │
   │  Shows: Badge with unread count, dropdown with notifications                │
   │  Click: Navigates to /dashboard/messages/{conversationId}                   │
   └─────────────────────────────────────────────────────────────────────────────┘

6️⃣ SIDEBAR UNREAD BADGE
   ┌─────────────────────────────────────────────────────────────────────────────┐
   │ Sidebar always visible in dashboard                                         │
   │                                                                             │
   │  Component: DashboardSidebar                                                │
   │       ↓                                                                     │
   │  Hook: useUnreadCount()                                                     │
   │       ↓ (React Query - cached for 30 seconds)                               │
   │  API: GET /api/messaging/unread-count                                       │
   │       ↓                                                                     │
   │  Service: getTotalUnreadCount(studentId)                                    │
   │       ↓                                                                     │
   │  Shows: Badge next to "Messages" menu item                                  │
   │       ↓                                                                     │
   │  Auto-updates: When NotificationContext invalidates unreadCount cache       │
   └─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Real-Time Update Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         REAL-TIME MESSAGE DELIVERY                               │
└─────────────────────────────────────────────────────────────────────────────────┘

  User A (Sender)                                         User B (Receiver)
       │                                                        │
       │ Types message & clicks Send                            │
       │        │                                               │
       ▼        │                                               │
  ┌─────────────┴───────┐                                       │
  │ useSendMessage()    │                                       │
  │ Optimistic update   │                                       │
  │ (message appears    │                                       │
  │  instantly)         │                                       │
  └─────────────────────┘                                       │
       │                                                        │
       │ POST /api/messaging/send                               │
       │                                                        │
       ▼                                                        │
  ┌─────────────────────────────────────────────────────────────┴───────────┐
  │                          SUPABASE DATABASE                              │
  │   INSERT INTO Message (conversationId, senderId, content, ...)         │
  │                                                                         │
  │   ┌─────────────────────────────────────────────────────────────────┐   │
  │   │              SUPABASE REALTIME (WebSocket)                       │   │
  │   │   Broadcasts: postgres_changes event (INSERT on Message)         │   │
  │   └─────────────────────────────────────────────────────────────────┘   │
  └─────────────────────────────────────────────────────────────────────────┘
       │                                                        │
       │                                                        │
       │                           ┌────────────────────────────┘
       │                           │
       │                           ▼
       │                    ┌───────────────────────────────────────────────┐
       │                    │ User B's Browser                              │
       │                    │                                               │
       │                    │ ① NotificationContext (Global)                │
       │                    │    - Receives INSERT event                    │
       │                    │    - Checks: senderId !== myId ✓              │
       │                    │    - Invalidates: conversations, unreadCount  │
       │                    │    - Fetches sender name                      │
       │                    │    - Creates notification                     │
       │                    │    - Shows toast: "💬 User A: Hello!"         │
       │                    │                                               │
       │                    │ ② useRealtimeMessages (if chat is open)       │
       │                    │    - Receives INSERT event                    │
       │                    │    - Checks: conversationId matches ✓         │
       │                    │    - Adds message to cache                    │
       │                    │    - UI updates instantly                     │
       │                    │                                               │
       │                    │ ③ useRealtimeConversationUpdates              │
       │                    │    - Receives INSERT event                    │
       │                    │    - Invalidates conversations cache          │
       │                    │    - Conversation list updates                │
       │                    └───────────────────────────────────────────────┘
       │
       ▼
  ┌─────────────────────────────────────────────────────────────────────────┐
  │ User A sees: Message sent confirmation (optimistic update was correct)  │
  └─────────────────────────────────────────────────────────────────────────┘
```

---

## �🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENT (Next.js)                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐     │
│  │  Messages Page  │    │  ConversationList│    │   ChatWindow    │     │
│  │  /dashboard/    │────│                 │────│                 │     │
│  │   messages      │    │ - List all chats │    │ - Message list  │     │
│  └─────────────────┘    │ - Unread badges  │    │ - Input field   │     │
│          │              │ - Last message   │    │ - Real-time     │     │
│          │              └─────────────────┘    └─────────────────┘     │
│          │                      │                      │               │
│          ▼                      ▼                      ▼               │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │                    REACT QUERY + HOOKS                          │   │
│  ├────────────────────────────────────────────────────────────────┤   │
│  │  useConversations()  │  useMessages()  │  useRealtimeMessages() │   │
│  │  useSendMessage()    │  useStartConversation()                  │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                │                                       │
└────────────────────────────────│───────────────────────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
                    ▼                         ▼
        ┌─────────────────┐       ┌─────────────────────┐
        │   REST API      │       │  Supabase Realtime  │
        │   (Next.js)     │       │  (WebSocket)        │
        │                 │       │                     │
        │ GET /messages   │       │ - Channel: messages │
        │ POST /send      │       │ - Event: INSERT     │
        │ POST /start     │       │ - Payload: Message  │
        └────────┬────────┘       └──────────┬──────────┘
                 │                           │
                 │                           │
                 ▼                           ▼
        ┌─────────────────────────────────────────────┐
        │              SUPABASE                        │
        │  ┌─────────────────────────────────────┐    │
        │  │           PostgreSQL                 │    │
        │  │  ┌───────────┐  ┌────────────────┐  │    │
        │  │  │Conversation│  │    Message     │  │    │
        │  │  │           │──│                │  │    │
        │  │  │ id        │  │ id             │  │    │
        │  │  │ studentA  │  │ conversationId │  │    │
        │  │  │ studentB  │  │ senderId       │  │    │
        │  │  │ createdAt │  │ content        │  │    │
        │  │  │ updatedAt │  │ isRead         │  │    │
        │  │  └───────────┘  │ createdAt      │  │    │
        │  │                 └────────────────┘  │    │
        │  └─────────────────────────────────────┘    │
        └─────────────────────────────────────────────┘
```

---

## 📊 Database Schema

### Conversation Model
```prisma
model Conversation {
  id         String    @id @default(uuid())
  studentAId String
  studentBId String
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt

  studentA   Student   @relation("ConversationsAsA", fields: [studentAId], references: [id])
  studentB   Student   @relation("ConversationsAsB", fields: [studentBId], references: [id])
  messages   Message[]

  @@unique([studentAId, studentBId])
  @@index([studentAId])
  @@index([studentBId])
}
```

### Message Model
```prisma
model Message {
  id             String       @id @default(uuid())
  conversationId String
  senderId       String
  content        String       @db.Text
  isRead         Boolean      @default(false)
  createdAt      DateTime     @default(now())

  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  sender         Student      @relation(fields: [senderId], references: [id])

  @@index([conversationId])
  @@index([senderId])
  @@index([createdAt])
}
```

---

## 🔄 Data Flow

### 1. Starting a Conversation

```
User clicks "Start Chat" on PublicProfileView
            │
            ▼
┌─────────────────────────────┐
│  POST /api/messaging/start  │
│  Body: { targetStudentId }  │
└─────────────────────────────┘
            │
            ▼
┌─────────────────────────────┐
│ Check messaging permission  │
│ (canStudentsMessage)        │
└─────────────────────────────┘
            │
            ▼
┌─────────────────────────────┐
│ Find or create conversation │
│ Order: smaller ID first     │
└─────────────────────────────┘
            │
            ▼
┌─────────────────────────────┐
│ Return conversation ID      │
│ Redirect to chat page       │
└─────────────────────────────┘
```

### 2. Sending a Message

```
User types message and clicks Send
            │
            ▼
┌─────────────────────────────┐
│  useSendMessage mutation    │
│  optimisticUpdate: true     │
└─────────────────────────────┘
            │
            ├────────────────────────┐
            │                        │
            ▼                        ▼
┌─────────────────────┐   ┌─────────────────────┐
│  Optimistic Update  │   │  POST /api/messaging │
│  Add to cache       │   │  /send               │
│  immediately        │   │  Body: { content,    │
└─────────────────────┘   │   conversationId }   │
                          └─────────────────────┘
                                    │
                                    ▼
                          ┌─────────────────────┐
                          │  Insert to Postgres │
                          │  (triggers Realtime)│
                          └─────────────────────┘
                                    │
                                    ▼
                          ┌─────────────────────┐
                          │  Supabase Realtime  │
                          │  broadcasts INSERT  │
                          │  to subscribers     │
                          └─────────────────────┘
```

### 3. Receiving Messages (Real-time)

```
┌─────────────────────────────────────────────────────────────┐
│                     ChatWindow Component                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  useEffect(() => {                                          │
│    const channel = supabase                                 │
│      .channel(`messages:${conversationId}`)                 │
│      .on('postgres_changes', {                              │
│        event: 'INSERT',                                     │
│        schema: 'public',                                    │
│        table: 'Message',                                    │
│        filter: `conversationId=eq.${conversationId}`        │
│      }, (payload) => {                                      │
│        // Update React Query cache                          │
│        queryClient.setQueryData(...)                        │
│      })                                                     │
│      .subscribe()                                           │
│  }, [conversationId])                                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗂️ File Structure

```
fypfinder/
├── app/
│   ├── api/
│   │   └── messaging/
│   │       ├── check-permission/
│   │       │   └── route.ts          # Check if users can message
│   │       ├── get-conversations/
│   │       │   └── route.ts          # Get all conversations
│   │       ├── get-messages/
│   │       │   └── route.ts          # Get messages for conversation
│   │       ├── send/
│   │       │   └── route.ts          # Send a message
│   │       ├── start/
│   │       │   └── route.ts          # Start/get conversation
│   │       └── mark-read/
│   │           └── route.ts          # Mark messages as read
│   │
│   └── dashboard/
│       └── messages/
│           ├── page.tsx              # Main messages page
│           └── [conversationId]/
│               └── page.tsx          # Individual chat page
│
├── components/
│   └── messaging/
│       ├── ConversationList.tsx      # List of conversations
│       ├── ConversationItem.tsx      # Single conversation item
│       ├── ChatWindow.tsx            # Chat interface
│       ├── MessageList.tsx           # List of messages
│       ├── MessageBubble.tsx         # Single message bubble
│       ├── ChatInput.tsx             # Message input field
│       └── index.ts                  # Barrel exports
│
├── hooks/
│   └── messaging/
│       ├── useConversations.ts       # Fetch all conversations
│       ├── useMessages.ts            # Fetch messages
│       ├── useRealtimeMessages.ts    # Supabase realtime subscription
│       ├── useSendMessage.ts         # Send message mutation
│       ├── useStartConversation.ts   # Start conversation mutation
│       ├── useMarkAsRead.ts          # Mark messages as read
│       └── index.ts                  # Barrel exports
│
├── modules/
│   └── messaging/
│       └── messaging.service.ts      # Business logic
│
├── lib/
│   ├── supabase.ts                   # Server-side Supabase client
│   └── supabaseClient.ts             # Client-side Supabase client (NEW)
│
└── prisma/
    └── schema.prisma                 # Database schema
```

---

## 🔐 Permission System

### Who Can Message Whom?

```
┌─────────────────────────────────────────────────────────────┐
│                   MESSAGING PERMISSION RULES                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Student A can message Student B if:                        │
│                                                              │
│  1️⃣ ACCEPTED Message Request exists between them            │
│     - A sent request to B (ACCEPTED) OR                     │
│     - B sent request to A (ACCEPTED)                        │
│                                                              │
│                      OR                                      │
│                                                              │
│  2️⃣ Both are members of the same FYP Group                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Permission Check Flow

```
canStudentsMessage(studentAId, studentBId)
            │
            ▼
    ┌───────────────┐
    │ Same student? │───Yes───▶ Return FALSE
    └───────────────┘
            │ No
            ▼
    ┌───────────────────────┐
    │ Check for ACCEPTED    │
    │ MESSAGE request       │───Found───▶ Return TRUE
    │ (either direction)    │
    └───────────────────────┘
            │ Not Found
            ▼
    ┌───────────────────────┐
    │ Check if both in      │
    │ same FYP Group        │───Yes───▶ Return TRUE
    └───────────────────────┘
            │ No
            ▼
        Return FALSE
```

---

## 🚀 Supabase Realtime Configuration

### Enable Realtime on Message Table

In Supabase Dashboard:
1. Go to **Database** → **Replication**
2. Enable replication for `Message` table
3. Select events: `INSERT`, `UPDATE`, `DELETE`

### Channel Subscription Pattern

```typescript
// Client-side subscription
const channel = supabase
  .channel(`conversation:${conversationId}`)
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'Message',
      filter: `conversationId=eq.${conversationId}`
    },
    (payload) => {
      // payload.new contains the new message
      const newMessage = payload.new as Message;
      
      // Update React Query cache
      queryClient.setQueryData(
        ['messages', conversationId],
        (old: Message[]) => [...old, newMessage]
      );
    }
  )
  .subscribe();
```

---

## 📱 UI Components

### ConversationList
- Shows all conversations for current user
- Displays unread count badges
- Shows last message preview
- Sorted by most recent activity
- Click to navigate to chat

### ChatWindow
- Full chat interface
- Real-time message updates
- Auto-scroll to newest message
- Loading states
- Empty state when no messages

### MessageBubble
- Different styles for sent/received
- Timestamp display
- Read status indicator
- Sender name (for received)

### ChatInput
- Text input with submit button
- Enter key to send
- Character limit (1000)
- Disabled when sending

---

## 🔄 State Management

### React Query Cache Structure

```
queryClient.cache = {
  // All conversations for current user
  ['conversations']: Conversation[],
  
  // Messages for specific conversation
  ['messages', conversationId]: Message[],
  
  // Permission check cache
  ['canMessage', studentId]: boolean,
}
```

### Optimistic Updates

When sending a message:
1. Immediately add message to cache with `isOptimistic: true`
2. Make API call
3. On success: Replace optimistic message with real one
4. On error: Remove optimistic message, show toast

---

## 📊 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/messaging/get-conversations` | GET | Get all conversations for user |
| `/api/messaging/get-messages` | GET | Get messages for a conversation |
| `/api/messaging/send` | POST | Send a new message |
| `/api/messaging/start` | POST | Start or get existing conversation |
| `/api/messaging/mark-read` | POST | Mark messages as read |
| `/api/messaging/check-permission` | GET | Check if can message a student |

---

## ⚡ Performance Optimizations

1. **Pagination**: Messages loaded in batches of 50
2. **Cursor-based pagination**: Using `createdAt` for efficient loading
3. **Optimistic updates**: Immediate UI feedback
4. **Message deduplication**: Prevent duplicate messages in cache
5. **Subscription cleanup**: Proper channel unsubscription
6. **Stale-while-revalidate**: Show cached data while fetching

---

## � File Structure

```
├── app/
│   ├── api/
│   │   └── messaging/
│   │       ├── check-permission/route.ts  # GET - Check if users can message
│   │       ├── get-conversations/route.ts # GET - List user's conversations
│   │       ├── get-messages/route.ts      # GET - Messages for a conversation
│   │       ├── mark-read/route.ts         # POST - Mark messages as read
│   │       ├── send/route.ts              # POST - Send a message
│   │       ├── start/route.ts             # POST - Start/get conversation
│   │       └── unread-count/route.ts      # GET - Total unread count
│   │
│   └── dashboard/
│       └── messages/
│           ├── page.tsx                   # Messages list page
│           └── [conversationId]/
│               └── page.tsx               # Chat page
│
├── components/
│   ├── messaging/
│   │   ├── ChatInput.tsx                  # Message input field
│   │   ├── ChatWindow.tsx                 # Main chat view
│   │   ├── ConversationItem.tsx           # Single conversation row
│   │   ├── ConversationList.tsx           # List of conversations
│   │   ├── MessageBubble.tsx              # Single message bubble
│   │   └── MessageList.tsx                # List of messages
│   │
│   ├── notifications/
│   │   └── NotificationBell.tsx           # Notification bell with dropdown
│   │
│   └── request/
│       └── SendRequestButtons.tsx         # Start Conversation button
│
├── contexts/
│   └── NotificationContext.tsx            # Global real-time notifications
│
├── hooks/
│   └── messaging/
│       ├── index.ts                       # Barrel export
│       ├── useCheckMessagePermission.ts   # Check if can message
│       ├── useConversations.ts            # Fetch conversations
│       ├── useMessages.ts                 # Fetch messages
│       ├── useRealtimeMessages.ts         # Real-time subscriptions
│       ├── useSendMessage.ts              # Send message mutation
│       ├── useStartConversation.ts        # Start conversation mutation
│       └── useUnreadCount.ts              # Get unread count
│
└── modules/
    └── messaging/
        └── messaging.service.ts           # Business logic
```

---

## 💾 Caching Strategy (React Query)

| Query Key | staleTime | gcTime | Refetch on Focus | Notes |
|-----------|-----------|--------|------------------|-------|
| `["conversations"]` | 2 min | 10 min | No | Updated via real-time |
| `["messages", id]` | 5 min | 30 min | No | Updated via real-time |
| `["unreadCount"]` | 30 sec | 5 min | Yes | Quick updates needed |
| `["messagePermission", id]` | 5 min | 10 min | No | Permission rarely changes |

### Why This Strategy?
- **Long staleTime**: Since we have real-time updates, we don't need frequent refetches
- **No refetch on focus**: Real-time handles updates, no need for focus-based refetch
- **Long gcTime**: Keep data in cache longer to avoid unnecessary API calls when navigating

---

## 🔒 Security Considerations

1. **Server-side permission checks**: Every API validates permissions
2. **Message ownership**: Only sender can see their sent messages
3. **Conversation access**: Only participants can view conversation
4. **Rate limiting**: Consider adding rate limits for send endpoint
5. **Content sanitization**: Sanitize message content before storage

---

## 🛠️ Setup Instructions

### 1. Run Database Migration
```bash
npx prisma migrate dev --name add_messaging
```

### 2. Enable Supabase Realtime
- Go to Supabase Dashboard → Database → Replication
- Enable replication for `Message` table

Or run this SQL:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE "Message";
```

### 3. Environment Variables
Ensure these are set:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_anon_key
```

### 4. Regenerate Prisma Client
```bash
npx prisma generate
```

---

## 🧪 Testing Checklist

- [ ] User can start a conversation with permitted student
- [ ] User cannot message non-permitted student
- [ ] Messages appear in real-time for both users
- [ ] Conversation list shows unread count
- [ ] Messages marked as read when viewed
- [ ] Optimistic updates work correctly
- [ ] Error handling shows appropriate messages
- [ ] Mobile responsive design
- [ ] Proper cleanup on unmount
- [ ] Global notification shows for new messages
- [ ] Sidebar badge updates for unread messages
- [ ] Start Conversation button shows on profile for allowed users
