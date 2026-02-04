// app/api/messaging/get-conversations/route.ts
import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase"
import prisma from "@/lib/db"
import { getConversationsForStudent } from "@/modules/messaging/messaging.service"

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

    const conversations = await getConversationsForStudent(student.id)

    return NextResponse.json({ conversations })
  } catch (error) {
    console.error("Get conversations error:", error)
    return NextResponse.json(
      { error: "Failed to get conversations" },
      { status: 500 }
    )
  }
}
