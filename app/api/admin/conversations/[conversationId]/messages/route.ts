// app/api/admin/conversations/[conversationId]/messages/route.ts
// Get messages in a conversation for admin read-only view

import { NextResponse, NextRequest } from "next/server"
import { requireRole } from "@/lib/auth"
import { UserRole } from "@/lib/generated/prisma/enums"
import prisma from "@/lib/db"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    // 🔐 Admin only
    await requireRole(UserRole.ADMIN)

    const { conversationId } = await params
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const pageSize = parseInt(searchParams.get("pageSize") || "50")
    const skip = (page - 1) * pageSize

    // Verify conversation exists
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    })

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      )
    }

    // Get total message count
    const total = await prisma.message.count({
      where: { conversationId },
    })

    // Get paginated messages with sender info
    const messages = await prisma.message.findMany({
      where: { conversationId },
      skip,
      take: pageSize,
      orderBy: { createdAt: "asc" },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            user: {
              select: { email: true },
            },
          },
        },
      },
    })

    // Transform to frontend format
    const data = messages.map((msg) => ({
      id: msg.id,
      conversationId: msg.conversationId,
      senderId: msg.senderId,
      senderName: msg.sender.name,
      senderEmail: msg.sender.user.email,
      content: msg.content,
      createdAt: msg.createdAt.toISOString(),
      isRead: msg.isRead,
    }))

    return NextResponse.json({
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    })
  } catch (error: any) {
    console.error("Admin get messages error:", error)

    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json(
        { error: error.message },
        { status: error.message === "Unauthorized" ? 401 : 403 }
      )
    }

    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    )
  }
}
