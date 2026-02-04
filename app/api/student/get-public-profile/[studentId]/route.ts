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
                                description: true,
                                isLocked: true,
                                members: {
                                    select: {
                                        student: {
                                            select: {
                                                id: true,
                                                name: true,
                                                department: true,
                                                currentSemester: true,
                                                profilePicture: true,
                                                showGroupOnProfile: true,
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
                {
                    success: false,
                    message: "Student not found",
                    data: null,
                },
                { status: 404 }
            )
        }

        // Determine group status
        // 🔒 VISIBILITY RULE: Only show group info if the VIEWED student has showGroupOnProfile: true
        const isGrouped = !!student.groupMember
        const showGroupInfo = isGrouped && student.showGroupOnProfile

        // Build group info only if student allows visibility
        let groupInfo = null
        if (showGroupInfo && student.groupMember) {
            // Filter out members who have hidden their group visibility
            const visibleMembers = student.groupMember.group.members
                .filter((m) => m.student.showGroupOnProfile)
                .map((m) => ({
                    id: m.student.id,
                    name: m.student.name,
                    department: m.student.department,
                    semester: m.student.currentSemester,
                    profilePicture: m.student.profilePicture,
                }))

            groupInfo = {
                groupId: student.groupMember.group.id,
                projectName: student.groupMember.group.projectName,
                description: student.groupMember.group.description,
                isLocked: student.groupMember.group.isLocked,
                members: visibleMembers,
            }
        }

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
                    // Social Links
                    linkedinUrl: student.linkedinUrl,
                    githubUrl: student.githubUrl,
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
