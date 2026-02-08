import prisma from "@/lib/db"

/**
 * Checks whether two students are allowed to message each other.
 *
 * Rules:
 * 1. ACCEPTED message request exists between them
 * OR
 * 2. Both belong to the same FYP group
 */
export async function canStudentsMessage(
  studentAId: string,
  studentBId: string
): Promise<boolean> {

  // ❌ Safety: same student
  if (studentAId === studentBId) {
    return false
  }

  // 1️⃣ Check ACCEPTED message request (either direction)
  const messageRequest = await prisma.request.findFirst({
    where: {
      type: "MESSAGE",
      status: "ACCEPTED",
      OR: [
        {
          fromStudentId: studentAId,
          toStudentId: studentBId,
        },
        {
          fromStudentId: studentBId,
          toStudentId: studentAId,
        },
      ],
    },
    select: { id: true },
  })

  if (messageRequest) {
    return true
  }

  // 2️⃣ Check shared FYP group
  const sharedGroup = await prisma.fYPGroupMember.findFirst({
    where: {
      studentId: studentAId,
      group: {
        members: {
          some: {
            studentId: studentBId,
          },
        },
      },
    },
    select: { id: true },
  })

  return Boolean(sharedGroup)
}

// =====================
// Conversation Services
// =====================

/**
 * Get or create a conversation between two students.
 * Always orders student IDs consistently (smaller first) to ensure uniqueness.
 */
export async function getOrCreateConversation(
  studentAId: string,
  studentBId: string
) {
  // Ensure consistent ordering - smaller ID is always studentA
  const [orderedA, orderedB] = [studentAId, studentBId].sort()

  // Try to find existing conversation
  const existingConversation = await prisma.conversation.findUnique({
    where: {
      studentAId_studentBId: {
        studentAId: orderedA,
        studentBId: orderedB,
      },
    },
    include: {
      studentA: {
        select: { id: true, name: true, profilePicture: true },
      },
      studentB: {
        select: { id: true, name: true, profilePicture: true },
      },
    },
  })

  if (existingConversation) {
    return existingConversation
  }

  // Create new conversation
  return prisma.conversation.create({
    data: {
      studentAId: orderedA,
      studentBId: orderedB,
    },
    include: {
      studentA: {
        select: { id: true, name: true, profilePicture: true },
      },
      studentB: {
        select: { id: true, name: true, profilePicture: true },
      },
    },
  })
}

/**
 * Get all conversations for a student with last message and unread count.
 */
export async function getConversationsForStudent(studentId: string) {
  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [
        { studentAId: studentId },
        { studentBId: studentId },
      ],
    },
    include: {
      studentA: {
        select: { id: true, name: true, profilePicture: true },
      },
      studentB: {
        select: { id: true, name: true, profilePicture: true },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          id: true,
          content: true,
          senderId: true,
          isRead: true,
          createdAt: true,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  })

  // Get unread counts for each conversation
  const conversationsWithUnread = await Promise.all(
    conversations.map(async (conv) => {
      const unreadCount = await prisma.message.count({
        where: {
          conversationId: conv.id,
          senderId: { not: studentId },
          isRead: false,
        },
      })

      // Determine the other participant
      const otherStudent = conv.studentAId === studentId ? conv.studentB : conv.studentA
      const lastMessage = conv.messages[0] || null

      return {
        id: conv.id,
        otherStudent,
        lastMessage,
        unreadCount,
        updatedAt: conv.updatedAt,
      }
    })
  )

  return conversationsWithUnread
}

/**
 * Get a single conversation by ID with permission check.
 */
export async function getConversationById(
  conversationId: string,
  requestingStudentId: string
) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      studentA: {
        select: { id: true, name: true, profilePicture: true },
      },
      studentB: {
        select: { id: true, name: true, profilePicture: true },
      },
    },
  })

  if (!conversation) {
    return null
  }

  // Check if requesting student is a participant
  if (conversation.studentAId !== requestingStudentId && conversation.studentBId !== requestingStudentId) {
    throw new Error("You are not a participant in this conversation")
  }

  return conversation
}

// =====================
// Message Services
// =====================

/**
 * Send a message in a conversation.
 */
export async function sendMessage(
  conversationId: string,
  senderId: string,
  content: string
) {
  // Validate content
  if (!content || content.trim().length === 0) {
    throw new Error("Message content cannot be empty")
  }

  if (content.length > 1000) {
    throw new Error("Message content cannot exceed 1000 characters")
  }

  // Verify sender is a participant
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { studentAId: true, studentBId: true },
  })

  if (!conversation) {
    throw new Error("Conversation not found")
  }

  if (conversation.studentAId !== senderId && conversation.studentBId !== senderId) {
    throw new Error("You are not a participant in this conversation")
  }

  // Create the message
  const message = await prisma.message.create({
    data: {
      conversationId,
      senderId,
      content: content.trim(),
    },
    include: {
      sender: {
        select: { id: true, name: true, profilePicture: true },
      },
    },
  })

  // Update conversation's updatedAt timestamp
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  })

  return message
}

/**
 * Get messages for a conversation with pagination.
 */
export async function getMessages(
  conversationId: string,
  requestingStudentId: string,
  options: {
    cursor?: string  // message ID to start from
    limit?: number
  } = {}
) {
  const { cursor, limit = 50 } = options

  // Verify requester is a participant
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { studentAId: true, studentBId: true },
  })

  if (!conversation) {
    throw new Error("Conversation not found")
  }

  if (conversation.studentAId !== requestingStudentId && conversation.studentBId !== requestingStudentId) {
    throw new Error("You are not a participant in this conversation")
  }

  // Build query
  const messages = await prisma.message.findMany({
    where: { conversationId },
    include: {
      sender: {
        select: { id: true, name: true, profilePicture: true },
      },
    },
    orderBy: { createdAt: "asc" },
    take: limit,
    ...(cursor && {
      cursor: { id: cursor },
      skip: 1, // Skip the cursor itself
    }),
  })

  return messages
}

/**
 * Mark messages as read.
 */
export async function markMessagesAsRead(
  conversationId: string,
  readerId: string
) {
  // Verify reader is a participant
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { studentAId: true, studentBId: true },
  })

  if (!conversation) {
    throw new Error("Conversation not found")
  }

  if (conversation.studentAId !== readerId && conversation.studentBId !== readerId) {
    throw new Error("You are not a participant in this conversation")
  }

  // Mark all unread messages from the other person as read
  const result = await prisma.message.updateMany({
    where: {
      conversationId,
      senderId: { not: readerId },
      isRead: false,
    },
    data: { isRead: true },
  })

  return { markedAsRead: result.count }
}

/**
 * Get total unread message count for a student.
 */
export async function getTotalUnreadCount(studentId: string) {
  // Get all conversation IDs where student is a participant
  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [
        { studentAId: studentId },
        { studentBId: studentId },
      ],
    },
    select: { id: true },
  })

  const conversationIds = conversations.map(c => c.id)

  // Count unread messages not sent by the student
  const unreadCount = await prisma.message.count({
    where: {
      conversationId: { in: conversationIds },
      senderId: { not: studentId },
      isRead: false,
    },
  })

  return unreadCount
}
