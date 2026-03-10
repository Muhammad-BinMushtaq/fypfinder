// app/api/admin/session/route.ts
// Get current admin session

import logger from "@/lib/logger"
import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase"
import prisma from "@/lib/db"
import { UserRole, UserStatus } from "@/lib/generated/prisma/enums"

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient()

    const {
      data: { user: supabaseUser },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !supabaseUser) {
      return NextResponse.json(
        { success: true, message: "No active session", data: { admin: null } },
        { status: 200 }
      )
    }

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

    if (!user || user.role !== UserRole.ADMIN || !user.admin || user.status !== UserStatus.ACTIVE) {
      return NextResponse.json(
        { success: true, message: "No admin profile", data: { admin: null } },
        { status: 200 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: "Session active",
        data: {
          admin: {
            id: user.admin.id,
            email: user.email,
            name: user.admin.name,
            role: "ADMIN",
          },
        },
      },
      { status: 200 }
    )
  } catch (err: any) {
    logger.error("Admin session error:", err)
    return NextResponse.json(
      { success: false, message: "Internal server error", data: { admin: null } },
      { status: 500 }
    )
  }
}
