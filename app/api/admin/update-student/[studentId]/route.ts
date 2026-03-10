// app/api/admin/update-student/[studentId]/route.ts
// Admin update student name and/or semester - minimal targeted update

import logger from "@/lib/logger"
import { NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { UserRole } from "@/lib/generated/prisma/enums"
import prisma from "@/lib/db"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    await requireRole(UserRole.ADMIN)

    const { studentId } = await params

    if (!studentId) {
      return NextResponse.json(
        { success: false, message: "Student ID is required" },
        { status: 400 }
      )
    }

    const body = await req.json()
    const { name, currentSemester } = body

    // Validate at least one field is provided
    if (name === undefined && currentSemester === undefined) {
      return NextResponse.json(
        { success: false, message: "At least one field (name or currentSemester) is required" },
        { status: 400 }
      )
    }

    // Build update data - only include provided fields
    const updateData: Record<string, any> = {}

    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length < 2) {
        return NextResponse.json(
          { success: false, message: "Name must be at least 2 characters" },
          { status: 400 }
        )
      }
      updateData.name = name.trim()
    }

    if (currentSemester !== undefined) {
      const sem = Number(currentSemester)
      if (!Number.isInteger(sem) || sem < 1 || sem > 12) {
        return NextResponse.json(
          { success: false, message: "Semester must be an integer between 1 and 12" },
          { status: 400 }
        )
      }
      updateData.currentSemester = sem
    }

    // Single update call - no prior existence check needed, Prisma throws if not found
    const updated = await prisma.student.update({
      where: { id: studentId },
      select: {
        id: true,
        name: true,
        currentSemester: true,
      },
    data: updateData,
    })

    return NextResponse.json(
      {
        success: true,
        message: "Student updated successfully",
        data: updated,
      },
      { status: 200 }
    )
  } catch (err: any) {
    if (process.env.NODE_ENV === "development") {
      logger.error("Admin update student error:", err)
    }

    // Prisma P2025 = record not found
    if (err.code === "P2025") {
      return NextResponse.json(
        { success: false, message: "Student not found" },
        { status: 404 }
      )
    }

    const isUnauthorized = err.message?.includes("Unauthorized")
    return NextResponse.json(
      { success: false, message: isUnauthorized ? "Unauthorized" : "Failed to update student" },
      { status: isUnauthorized ? 403 : 500 }
    )
  }
}
