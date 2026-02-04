// app/api/messaging/get-messages/route.ts
import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase"
import prisma from "@/lib/db"
import { getMessages, markMessagesAsRead } from "@/modules/messaging/messaging.service"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get("conversationId")
    const cursor = searchParams.get("cursor") || undefined
    const limit = parseInt(searchParams.get("limit") || "50", 10)

    if (!conversationId) {
      return NextResponse.json({ error: "conversationId is required" }, { status: 400 })
    }

    // Get student ID from user ID
    const student = await prisma.student.findUnique({
      where: { userId: user.id },
      select: { id: true },
    })

    if (!student) {
      return NextResponse.json({ error: "Student profile not found" }, { status: 404 })
    }

    const messages = await getMessages(conversationId, student.id, { cursor, limit })

    // Mark messages as read when fetching
    await markMessagesAsRead(conversationId, student.id)

    return NextResponse.json({ messages })
  } catch (error) {
    console.error("Get messages error:", error)
    const message = error instanceof Error ? error.message : "Failed to get messages"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
