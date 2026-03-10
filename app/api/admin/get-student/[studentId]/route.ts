// app/api/admin/get-student/[studentId]/route.ts
// Get full student profile for admin viewing - single optimized query

import logger from "@/lib/logger"
import { NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { UserRole } from "@/lib/generated/prisma/enums"
import prisma from "@/lib/db"

export async function GET(
  _req: Request,
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

    // Single optimized query - fetch everything in one call
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        userId: true,
        name: true,
        department: true,
        currentSemester: true,
        profilePicture: true,
        interests: true,
        phone: true,
        linkedinUrl: true,
        githubUrl: true,
        availability: true,
        careerGoal: true,
        hobbies: true,
        preferredTechStack: true,
        industryPreference: true,
        showGroupOnProfile: true,
        createdAt: true,
        user: {
          select: {
            email: true,
            status: true,
            createdAt: true,
          },
        },
        skills: {
          select: {
            id: true,
            name: true,
            level: true,
          },
          orderBy: { name: "asc" },
        },
        projects: {
          select: {
            id: true,
            name: true,
            description: true,
            liveLink: true,
            githubLink: true,
          },
          orderBy: { id: "desc" },
        },
        internships: {
          select: {
            id: true,
            companyName: true,
            position: true,
            duration: true,
            description: true,
            certificateLink: true,
          },
          orderBy: { createdAt: "desc" },
        },
        groupMember: {
          select: {
            joinedAt: true,
            group: {
              select: {
                id: true,
                projectName: true,
                isLocked: true,
                members: {
                  select: {
                    student: {
                      select: {
                        id: true,
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!student) {
      return NextResponse.json(
        { success: false, message: "Student not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: "Student profile fetched",
        data: student,
      },
      { status: 200 }
    )
  } catch (err: any) {
    if (process.env.NODE_ENV === "development") {
      logger.error("Admin get student error:", err)
    }

    const isUnauthorized = err.message?.includes("Unauthorized")
    return NextResponse.json(
      { success: false, message: isUnauthorized ? "Unauthorized" : "Failed to fetch student" },
      { status: isUnauthorized ? 403 : 500 }
    )
  }
}
