// app/api/admin/conversations/route.ts
// Get all conversations for admin read-only view

import { NextResponse, NextRequest } from "next/server"
import { requireRole } from "@/lib/auth"
import { UserRole } from "@/lib/generated/prisma/enums"
import prisma from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    // 🔐 Admin only
    await requireRole(UserRole.ADMIN)

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const pageSize = parseInt(searchParams.get("pageSize") || "20")
    const skip = (page - 1) * pageSize

    // Get total count
    const total = await prisma.conversation.count()

    // Get paginated conversations with participant info and last message
    const conversations = await prisma.conversation.findMany({
      skip,
      take: pageSize,
      orderBy: { updatedAt: "desc" },
      include: {
        studentA: {
          include: {
            user: {
              select: { email: true },
            },
          },
        },
        studentB: {
          include: {
            user: {
              select: { email: true },
            },
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            content: true,
            createdAt: true,
            senderId: true,
          },
        },
        _count: {
          select: { messages: true },
        },
      },
    })

    // Transform to frontend format
    const data = conversations.map((conv) => ({
      id: conv.id,
      studentA: {
        id: conv.studentA.id,
        name: conv.studentA.name,
        email: conv.studentA.user.email,
        profilePicture: conv.studentA.profilePicture,
      },
      studentB: {
        id: conv.studentB.id,
        name: conv.studentB.name,
        email: conv.studentB.user.email,
        profilePicture: conv.studentB.profilePicture,
      },
      lastMessage: conv.messages[0]
        ? {
            content: conv.messages[0].content,
            createdAt: conv.messages[0].createdAt.toISOString(),
            senderId: conv.messages[0].senderId,
          }
        : null,
      messageCount: conv._count.messages,
      createdAt: conv.createdAt.toISOString(),
    }))

    return NextResponse.json({
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    })
  } catch (error: any) {
    console.error("Admin get conversations error:", error)

    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json(
        { error: error.message },
        { status: error.message === "Unauthorized" ? 401 : 403 }
      )
    }

    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    )
  }
}
