// app/api/fyp-ideas/validate/route.ts

import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { UserRole } from "@/lib/generated/prisma/enums"
import { logger } from "@/lib/logger"
import { createRateLimiter, getClientIdentifier } from "@/lib/rate-limit"
import { ideaInputSchema } from "@/modules/fyp-ideas/schemas"
import {
  toStudentFacingValidationResult,
  validateIdea,
} from "@/modules/fyp-ideas/fyp-ideas.service"

const guestIdeaValidatorRateLimiter = createRateLimiter({
  windowMs: 24 * 60 * 60 * 1000,
  maxRequests: 1,
})

export async function POST(request: NextRequest) {
  try {
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { success: false, message: "Request body must be valid JSON" },
        { status: 400 }
      )
    }

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

    let currentUser = null
    try {
      currentUser = await getCurrentUser()
    } catch (authError) {
      logger.warn("Continuing validator request without authenticated user context:", authError)
    }

    const isStudentUser =
      currentUser?.role === UserRole.STUDENT &&
      currentUser?.status === "ACTIVE"

    let studentId: string | null = null
    let accessMode: "student" | "guest" = "guest"

    if (isStudentUser && currentUser) {
      const student = await prisma.student.findUnique({
        where: { userId: currentUser.id },
        select: { id: true },
      })

      if (!student) {
        return NextResponse.json(
          { success: false, message: "Student profile not found" },
          { status: 404 }
        )
      }

      studentId = student.id
      accessMode = "student"
    } else {
      const guestIdentifier = getClientIdentifier(request.headers, "guest:fyp-idea-validator")
      const rateLimit = guestIdeaValidatorRateLimiter.check(guestIdentifier)

      if (!rateLimit.allowed) {
        return NextResponse.json(
          {
            success: false,
            message: "Guests can validate only one idea per day. Sign up to unlock full unlimited-style daily access.",
          },
          { status: 429 }
        )
      }
    }

    const result = await validateIdea(parsed.data, {
      studentId,
      accessMode,
    })

    return NextResponse.json(
      {
        success: true,
        message: "Idea validated successfully",
        data: toStudentFacingValidationResult(result),
      },
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

    if (errorMessage.includes("Account suspended")) {
      return NextResponse.json(
        { success: false, message: errorMessage },
        { status: 403 }
      )
    }

    if (errorMessage.includes("Student profile not found")) {
      return NextResponse.json(
        { success: false, message: errorMessage },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    )
  }
}
