import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import { requireRole } from "@/lib/auth"
import { UserRole } from "@/lib/generated/prisma/enums"
import { logger } from "@/lib/logger"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(UserRole.STUDENT)
    
    // First, verify student profile exists
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

    const resolvedParams = await params
    const validationId = resolvedParams.id

    if (!validationId) {
      return NextResponse.json(
        { success: false, message: "Validation ID is required" },
        { status: 400 }
      )
    }

    // Check if validation exists and belongs to the student
    const validation = await prisma.fYPIdeaValidation.findUnique({
      where: { id: validationId },
      select: { studentId: true },
    })

    if (!validation) {
      return NextResponse.json(
        { success: false, message: "Validation not found" },
        { status: 404 }
      )
    }

    if (validation.studentId !== student.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized to delete this validation" },
        { status: 403 }
      )
    }

    // Delete the validation
    await prisma.fYPIdeaValidation.delete({
      where: { id: validationId },
    })

    return NextResponse.json(
      { success: true, message: "Validation deleted successfully" },
      { status: 200 }
    )
  } catch (error) {
    logger.error("Delete validation error:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to delete validation"

    if (errorMessage.includes("Unauthorized")) {
      return NextResponse.json({ success: false, message: errorMessage }, { status: 401 })
    }

    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 })
  }
}
