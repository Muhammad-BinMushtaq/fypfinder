// app/api/student/skill/add/route.ts

import logger from "@/lib/logger"
import { NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { UserRole, ExperienceLevel } from "@/lib/generated/prisma/enums"
import { addSkill } from "@/modules/student/student.service"

export async function POST(req: Request) {
  try {
    const user = await requireRole(UserRole.STUDENT)

    const body = await req.json()
    const { name, description, level } = body

    if (!name || !level) {
      return NextResponse.json(
        { success: false, message: "Skill name and level are required" },
        { status: 400 }
      )
    }

    if (!Object.values(ExperienceLevel).includes(level)) {
      return NextResponse.json(
        { success: false, message: "Invalid experience level" },
        { status: 400 }
      )
    }

    const skill = await addSkill(user.id, { name, description, level })

    return NextResponse.json(
      { success: true, message: "Skill added successfully", data: skill },
      { status: 201 }
    )
  } catch (error: any) {
    logger.error("Add skill error:", error)

    if (error.message === "Skill already added") {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 409 }
      )
    }

    if (error.message === "Student profile not found") {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
