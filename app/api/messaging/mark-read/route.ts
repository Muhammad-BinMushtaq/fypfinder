// app/api/messaging/mark-read/route.ts
import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase"
import prisma from "@/lib/db"
import { markMessagesAsRead } from "@/modules/messaging/messaging.service"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { conversationId } = body

    if (!conversationId) {
      return NextResponse.json(
        { error: "conversationId is required" },
        { status: 400 }
      )
    }

    // Get student ID from user ID
    const student = await prisma.student.findUnique({
      where: { userId: user.id },
      select: { id: true },
    })

    if (!student) {
      return NextResponse.json({ error: "Student profile not found" }, { status: 404 })
    }

    const result = await markMessagesAsRead(conversationId, student.id)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Mark read error:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to mark messages as read"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
