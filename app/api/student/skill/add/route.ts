// app/api/student/skill/add/route.ts

import { NextResponse } from "next/server"
import prisma from "@/lib/db"
import { requireRole } from "@/lib/auth"
import { UserRole, ExperienceLevel } from "@/lib/generated/prisma/enums"

export async function POST(req: Request) {
  try {
    // 🔐 1. Auth + Role
    const user = await requireRole(UserRole.STUDENT)

    // 📥 2. Parse body
    const body = await req.json()
    const { name, description, level } = body

    // 🧪 3. Validation
    if (!name || !level) {
      return NextResponse.json(
        {
          success: false,
          message: "Skill name and level are required",
        },
        { status: 400 }
      )
    }

    if (!Object.values(ExperienceLevel).includes(level)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid experience level",
        },
        { status: 400 }
      )
    }

    // 🧹 4. Normalize skill name (important)
    const normalizedName = name.trim().toLowerCase()

    // 🔗 5. Get student profile
    const student = await prisma.student.findUnique({
      where: { userId: user.id },
    })

    if (!student) {
      return NextResponse.json(
        {
          success: false,
          message: "Student profile not found",
        },
        { status: 404 }
      )
    }

    //  6. Prevent duplicate skill for same student
    const existingSkill = await prisma.skill.findUnique({
      where: {
        studentId_name: {
          studentId: student.id,
          name: normalizedName,
        },
      },
    })

    if (existingSkill) {
      return NextResponse.json(
        {
          success: false,
          message: "Skill already added",
        },
        { status: 409 }
      )
    }

    // ✅ 7. Create skill
    const skill = await prisma.skill.create({
      data: {
        studentId: student.id,
        name: normalizedName,
        description,
        level,
      },
    })

    console.log("This is new skill", skill)
    // ✅ 8. Response
    return NextResponse.json(
      {
        success: true,
        message: "Skill added successfully",
        data: skill,
      },
      { status: 201 }
    )


  } catch (error: any) {
    console.error("Add skill error:", error)

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Internal server error",
      },
      { status: 500 }
    )
  }
}
