// app/api/messaging/unread-count/route.ts
import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase"
import prisma from "@/lib/db"
import { getTotalUnreadCount } from "@/modules/messaging/messaging.service"

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get student ID from user ID
    const student = await prisma.student.findUnique({
      where: { userId: user.id },
      select: { id: true },
    })

    if (!student) {
      return NextResponse.json({ error: "Student profile not found" }, { status: 404 })
    }

    const unreadCount = await getTotalUnreadCount(student.id)

    return NextResponse.json({ unreadCount })
  } catch (error) {
    console.error("Get unread count error:", error)
    return NextResponse.json(
      { error: "Failed to get unread count" },
      { status: 500 }
    )
  }
}
