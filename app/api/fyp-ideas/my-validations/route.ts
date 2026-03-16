// app/api/fyp-ideas/my-validations/route.ts

import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import { requireRole } from "@/lib/auth"
import { UserRole } from "@/lib/generated/prisma/enums"
import { logger } from "@/lib/logger"
import {
  getStudentValidations,
  getRemainingValidations,
} from "@/modules/fyp-ideas/fyp-ideas.service"

export async function GET(request: NextRequest) {
  try {
    const user = await requireRole(UserRole.STUDENT)

    const student = await prisma.student.findUnique({
      where: { userId: user.id },
      select: { id: true },
    })

    if (!student) {
      return NextResponse.json(
        { success: false, message: "Student profile not found" },
        { status: 404 }
      )
    }

    const { searchParams } = new URL(request.url)
    const limit = Math.min(Number(searchParams.get("limit")) || 10, 20)
    const offset = Math.max(Number(searchParams.get("offset")) || 0, 0)

    const [validations, remaining] = await Promise.all([
      getStudentValidations(student.id, limit, offset),
      getRemainingValidations(student.id),
    ])

    return NextResponse.json(
      {
        success: true,
        message: "Validations fetched",
        data: {
          ...validations,
          remainingToday: remaining,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    logger.error("Get validations error:", error)
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch validations"
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: error instanceof Error && errorMessage.includes("Unauthorized") ? 401 : 500 }
    )
  }
}
