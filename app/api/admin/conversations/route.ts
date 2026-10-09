// app/api/admin/conversations/route.ts
// Get all conversations for admin read-only view

import logger from "@/lib/logger"
import { NextResponse, NextRequest } from "next/server"
import { requireRole } from "@/lib/auth"
import { UserRole } from "@/lib/generated/prisma/enums"
import prisma from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    // 🔐 Admin only
    await requireRole(UserRole.ADMIN)

    const { searchParams } = new URL(req.url)
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"))
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "20")))
    const search = searchParams.get("search")?.trim() || ""
    const skip = (page - 1) * pageSize

    const where: any = {}
    if (search) {
      where.OR = [
        { studentA: { name: { contains: search, mode: "insensitive" } } },
        { studentB: { name: { contains: search, mode: "insensitive" } } },
        { studentA: { user: { email: { contains: search, mode: "insensitive" } } } },
        { studentB: { user: { email: { contains: search, mode: "insensitive" } } } },
      ]
    }

    // Get total count
    const total = await prisma.conversation.count({ where })

    // Get paginated conversations with participant info and last message
    const conversations = await prisma.conversation.findMany({
      where,
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
      totalPages: Math.ceil(total / pageSize) || 1,
    })
  } catch (error: any) {
    logger.error("Admin get conversations error:", error)

    const isUnauthorized = error?.message?.includes("Unauthorized")
    return NextResponse.json(
      { error: isUnauthorized ? "Unauthorized" : "Failed to fetch conversations" },
      { status: isUnauthorized ? 403 : 500 }
    )
  }
}
