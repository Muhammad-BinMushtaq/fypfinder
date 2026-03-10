import { requireRole } from "@/lib/auth"
import { UserRole } from "@/lib/generated/prisma/enums"
import logger from "@/lib/logger"
import { NextResponse } from "next/server"
import { updateProject } from "@/modules/student/student.service"

export async function PATCH(req: Request) {
  try {
    const user = await requireRole(UserRole.STUDENT)

    const body = await req.json()
    const { projectId, name, description, liveLink, githubLink } = body

    if (!projectId) {
      return NextResponse.json(
        { success: false, message: "Project ID is required" },
        { status: 400 }
      )
    }

    const updatedProject = await updateProject(user.id, projectId, {
      name,
      description,
      liveLink,
      githubLink,
    })

    return NextResponse.json(
      { success: true, message: "Project updated successfully", data: updatedProject },
      { status: 200 }
    )
  } catch (error: any) {
    logger.error("Update project error:", error)

    const status = error.message === "Student profile not found" ? 404
      : error.message === "Project not found or unauthorized" ? 404
      : 500

    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status }
    )
  }
}
