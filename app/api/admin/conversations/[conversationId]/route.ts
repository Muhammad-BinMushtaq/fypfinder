// app/api/admin/conversations/[conversationId]/route.ts
// Get single conversation details for admin view

import { NextResponse, NextRequest } from "next/server"
import { requireRole } from "@/lib/auth"
import { UserRole } from "@/lib/generated/prisma/enums"
import prisma from "@/lib/db"
import logger from "@/lib/logger"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    await requireRole(UserRole.ADMIN)

    const { conversationId } = await params

    if (!conversationId) {
      return NextResponse.json(
        { success: false, message: "Conversation ID is required" },
        { status: 400 }
      )
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
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
        _count: {
          select: { messages: true },
        },
      },
    })

    if (!conversation) {
      return NextResponse.json(
        { success: false, message: "Conversation not found" },
        { status: 404 }
      )
    }

    const data = {
      id: conversation.id,
      studentA: {
        id: conversation.studentA.id,
        name: conversation.studentA.name,
        email: conversation.studentA.user.email,
        profilePicture: conversation.studentA.profilePicture,
      },
      studentB: {
        id: conversation.studentB.id,
        name: conversation.studentB.name,
        email: conversation.studentB.user.email,
        profilePicture: conversation.studentB.profilePicture,
      },
      messageCount: conversation._count.messages,
      createdAt: conversation.createdAt.toISOString(),
    }

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error: any) {
    logger.error("Admin get conversation details error:", error)

    const isUnauthorized = error?.message?.includes("Unauthorized")
    return NextResponse.json(
      { success: false, message: isUnauthorized ? "Unauthorized" : "Failed to fetch conversation" },
      { status: isUnauthorized ? 403 : 500 }
    )
  }
}
