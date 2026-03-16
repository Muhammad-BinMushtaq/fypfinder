// app/api/fyp-ideas/validate/route.ts

import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import { requireRole } from "@/lib/auth"
import { UserRole } from "@/lib/generated/prisma/enums"
import { logger } from "@/lib/logger"
import { ideaInputSchema } from "@/modules/fyp-ideas/schemas"
import { validateIdea } from "@/modules/fyp-ideas/fyp-ideas.service"

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(UserRole.STUDENT)

    const body = await request.json()

    // Validate input with Zod
    const parsed = ideaInputSchema.safeParse(body)
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]
      return NextResponse.json(
        {
          success: false,
          message: firstError?.message || "Invalid input",
          errors: parsed.error.issues.map((i) => ({
            field: i.path.join("."),
            message: i.message,
          })),
        },
        { status: 400 }
      )
    }

    // Get student profile
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

    const result = await validateIdea(student.id, parsed.data)

    return NextResponse.json(
      { success: true, message: "Idea validated successfully", data: result },
      { status: 200 }
    )
  } catch (error) {
    logger.error("FYP idea validate error:", error)
    const errorMessage =
      error instanceof Error ? error.message : "Failed to validate idea"

    // Rate limit errors → 429
    if (errorMessage.includes("Daily limit")) {
      return NextResponse.json(
        { success: false, message: errorMessage },
        { status: 429 }
      )
    }

    // Groq API key missing → 503
    if (errorMessage.includes("GROQ_API_KEY")) {
      return NextResponse.json(
        {
          success: false,
          message: "AI validation service is not configured",
        },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    )
  }
}
