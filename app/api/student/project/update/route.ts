import { requireRole } from "@/lib/auth"
import prisma from "@/lib/db"
import { UserRole } from "@/lib/generated/prisma/enums"
import { NextResponse } from "next/server"

export async function PATCH(req: Request) {
  try {
    // 🔐 Auth
    const user = await requireRole(UserRole.STUDENT)

    const body = await req.json()
    const { projectId, name, description, liveLink, githubLink } = body

    if (!projectId) {
      return NextResponse.json(
        { success: false, message: "Project ID is required" },
        { status: 400 }
      )
    }

    // 🔗 Get student
    const student = await prisma.student.findUnique({
      where: { userId: user.id },
    })

    if (!student) {
      return NextResponse.json(
        { success: false, message: "Student profile not found" },
        { status: 404 }
      )
    }

    // 🔒 Ownership check
    const existingProject = await prisma.project.findFirst({
      where: {
        id: projectId,
        studentId: student.id,
      },
    })

    if (!existingProject) {
      return NextResponse.json(
        { success: false, message: "Project not found or unauthorized" },
        { status: 404 }
      )
    }

    // ✏️ Update project (partial update)
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(liveLink !== undefined && { liveLink }),
        ...(githubLink !== undefined && { githubLink }),
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: "Project updated successfully",
        data: updatedProject,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error("Update project error:", error)

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Internal server error",
      },
      { status: 500 }
    )
  }
}
