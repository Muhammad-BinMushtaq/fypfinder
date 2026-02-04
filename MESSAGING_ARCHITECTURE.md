# 📬 Real-Time Messaging System Architecture

## Overview

This document describes the architecture of the real-time messaging system built with **Supabase Realtime** and **React Query** for the FYP Finder application.

---

## 🏗️ System Architecture

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
