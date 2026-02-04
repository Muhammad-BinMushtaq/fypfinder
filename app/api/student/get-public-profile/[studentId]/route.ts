import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import { requireRole } from "@/lib/auth"
import { UserRole } from "@/lib/generated/prisma/enums"

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ studentId: string }> }
) {
    try {
        const currentUser = await requireRole(UserRole.STUDENT)

        const { studentId } = await params

        if (!studentId) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Student ID is required",
                    data: null,
                },
                { status: 400 }
            )
        }

        // Fetch student with skills, projects, and group membership
        const student = await prisma.student.findUnique({
            where: { id: studentId },
            include: {
                skills: true,
                projects: true,
                groupMember: {
                    include: {
                        group: {
                            select: {
                                id: true,
                                projectName: true,
                                isLocked: true,
                            },
                        },
                    },
                },
            },
        })

        if (!student) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Student not found",
                    data: null,
                },
                { status: 404 }
            )
        }

        // Determine group status
        const isGrouped = !!student.groupMember
        const groupInfo = student.groupMember
            ? {
                groupId: student.groupMember.group.id,
                projectName: student.groupMember.group.projectName,
                isLocked: student.groupMember.group.isLocked,
            }
            : null

        // A student is available for group if:
        // 1. Not in any group, OR
        // 2. In a group that is NOT locked
        const availableForGroup = !isGrouped || (isGrouped && !student.groupMember?.group.isLocked)

        // ✅ Public-safe response with group status
        return NextResponse.json(
            {
                success: true,
                message: "Public profile fetched",
                data: {
                    id: student.id,
                    name: student.name,
                    department: student.department,
                    semester: student.currentSemester,
                    profilePicture: student.profilePicture,
                    interests: student.interests,
                    availability: student.availability,
                    // Group status
                    isGrouped,
                    availableForGroup,
                    groupInfo,
                    // Skills & Projects
                    skills: student.skills.map((s: { id: string; name: string; level: string }) => ({
                        id: s.id,
                        name: s.name,
                        level: s.level,
                    })),
                    projects: student.projects,
                },
            },
            { status: 200 }
        )
    } catch (error) {
        console.error("Get public profile error:", error)

        return NextResponse.json(
            {
                success: false,
                message: "Internal server error",
                data: null,
            },
            { status: 500 }
        )
    }
}
