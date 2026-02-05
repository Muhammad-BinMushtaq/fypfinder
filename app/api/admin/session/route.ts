// app/api/admin/session/route.ts
// Get current admin session

import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase"
import prisma from "@/lib/db"
import { UserRole } from "@/lib/generated/prisma/enums"

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient()

    const {
      data: { user: supabaseUser },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !supabaseUser) {
      return NextResponse.json(
        { admin: null },
        { status: 200 }
      )
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: supabaseUser.id },
      include: {
        admin: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!user || user.role !== UserRole.ADMIN || !user.admin) {
      return NextResponse.json(
        { admin: null },
        { status: 200 }
      )
    }

    return NextResponse.json({
      admin: {
        id: user.admin.id,
        email: user.email,
        name: user.admin.name,
        role: "ADMIN",
      },
    })
  } catch (err: any) {
    console.error("Admin session error:", err)
    return NextResponse.json(
      { error: "Internal server error", admin: null },
      { status: 500 }
    )
  }
}
