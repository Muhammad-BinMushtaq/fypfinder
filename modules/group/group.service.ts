import prisma from "@/lib/db"
import { RequestStatus, RequestType, UserStatus } from "@/lib/generated/prisma/enums"
import { WorkspaceService } from "@/modules/workspace/workspace.service"

// Get the FYP group of a student (if exists), enriched with workspace meta and pending invites
export async function getMyGroup(studentId: string) {
    // 1. Find membership
    const membership = await prisma.fYPGroupMember.findUnique({
        where: { studentId },
        include: {
            group: {
                include: {
                    members: {
                        include: {
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
    })

    // 2. No group case
    if (!membership) {
        return null
    }

    const group = membership.group
    const memberIds = group.members.map((m) => m.student.id)

    // 3. Fetch workspace metadata & pending outgoing partner requests from any member of this group
    const [workspaceMeta, pendingRequests] = await Promise.all([
        WorkspaceService.getWorkspaceMeta(group.id),
        prisma.request.findMany({
            where: {
                fromStudentId: { in: memberIds },
                type: RequestType.PARTNER,
                status: RequestStatus.PENDING,
            },
            orderBy: { createdAt: "desc" },
            include: {
                toStudent: {
                    select: {
                        id: true,
                        name: true,
                        department: true,
                        currentSemester: true,
                        profilePicture: true,
                        user: {
                            select: { email: true },
                        },
                    },
                },
                fromStudent: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        }),
    ])

    // 4. Shape clean response
    return {
        id: group.id,
        projectName: group.projectName,
        description: group.description,
        isLocked: group.isLocked,
        createdAt: group.createdAt,
        currentStudentId: studentId,
        workspaceMeta,
        pendingInvites: pendingRequests.map((req) => ({
            requestId: req.id,
            toStudentId: req.toStudent.id,
            name: req.toStudent.name,
            email: req.toStudent.user?.email || "",
            department: req.toStudent.department,
            semester: req.toStudent.currentSemester,
            profilePicture: req.toStudent.profilePicture,
            invitedByName: req.fromStudent.name,
            createdAt: req.createdAt,
        })),
        members: group.members.map(
            (m: {
                joinedAt: Date
                student: {
                    id: string
                    name: string
                    department: string
                    currentSemester: number
                    profilePicture: string | null
                    showGroupOnProfile: boolean
                }
            }) => ({
                id: m.student.id,
                name: m.student.name,
                department: m.student.department,
                semester: m.student.currentSemester,
                profilePicture: m.student.profilePicture,
                showGroupOnProfile: m.student.showGroupOnProfile,
                joinedAt: m.joinedAt,
            })
        ),
    }
}

/**
 * Initialize a new FYP Project Group with the current student as founding Group Leader.
 * Allows students to set up their project title, repo link, milestones, and invite collaborators
 * directly from /dashboard/fyp.
 */
export async function createInitialGroup(
    studentId: string,
    projectName: string,
    description?: string
) {
    const existingMembership = await prisma.fYPGroupMember.findUnique({
        where: { studentId },
    })

    if (existingMembership) {
        throw new Error("You are already part of an FYP group")
    }

    const trimmedName = (projectName || "").trim()
    if (!trimmedName) {
        throw new Error("Project name is required")
    }
    if (trimmedName.length > 100) {
        throw new Error("Project name must be 100 characters or less")
    }

    const group = await prisma.$transaction(async (tx) => {
        const createdGroup = await tx.fYPGroup.create({
            data: {
                projectName: trimmedName,
                description: description?.trim() || null,
            },
        })

        await tx.fYPGroupMember.create({
            data: {
                groupId: createdGroup.id,
                studentId,
            },
        })

        return createdGroup
    })

    return getMyGroup(studentId)
}

/**
 * GitHub-style collaborator search for inviting teammates directly from /dashboard/fyp.
 * Searches active, non-graduated students in the same semester by name or email.
 */
export async function searchStudentsForGroupInvite(
    requesterStudentId: string,
    query: string
) {
    const requester = await prisma.student.findUnique({
        where: { id: requesterStudentId },
        select: {
            id: true,
            currentSemester: true,
            department: true,
            isGraduated: true,
            groupMember: {
                select: {
                    groupId: true,
                    group: {
                        select: {
                            members: { select: { studentId: true } },
                        },
                    },
                },
            },
        },
    })

    if (!requester) {
        throw new Error("Student not found")
    }

    const q = (query || "").trim()
    const groupMemberIds =
        requester.groupMember?.group?.members.map((m) => m.studentId) || [
            requesterStudentId,
        ]

    const where: any = {
        id: { notIn: groupMemberIds },
        currentSemester: requester.currentSemester,
        isGraduated: false,
        user: {
            status: UserStatus.ACTIVE,
        },
    }

    if (q.length > 0) {
        where.OR = [
            { name: { contains: q, mode: "insensitive" } },
            { user: { email: { contains: q, mode: "insensitive" } } },
            { department: { contains: q, mode: "insensitive" } },
        ]
    }

    const [candidates, existingPending] = await Promise.all([
        prisma.student.findMany({
            where,
            take: 8,
            orderBy: { name: "asc" },
            select: {
                id: true,
                name: true,
                department: true,
                currentSemester: true,
                profilePicture: true,
                seekingStatus: true,
                user: {
                    select: { email: true },
                },
                groupMember: {
                    select: {
                        group: {
                            select: {
                                id: true,
                                isLocked: true,
                                _count: { select: { members: true } },
                            },
                        },
                    },
                },
            },
        }),
        prisma.request.findMany({
            where: {
                type: RequestType.PARTNER,
                status: RequestStatus.PENDING,
                OR: [
                    { fromStudentId: { in: groupMemberIds } },
                    { toStudentId: { in: groupMemberIds } },
                ],
            },
            select: {
                fromStudentId: true,
                toStudentId: true,
            },
        }),
    ])

    const pendingStudentIds = new Set<string>()
    for (const r of existingPending) {
        pendingStudentIds.add(r.fromStudentId)
        pendingStudentIds.add(r.toStudentId)
    }

    return candidates.map((c) => {
        const memberCount = c.groupMember?.group?._count?.members || 0
        const isGroupLocked = Boolean(c.groupMember?.group?.isLocked)
        const isFull = isGroupLocked || memberCount >= 3
        const isPending = pendingStudentIds.has(c.id)

        return {
            id: c.id,
            name: c.name,
            email: c.user?.email || "",
            department: c.department,
            semester: c.currentSemester,
            profilePicture: c.profilePicture,
            memberCount,
            isPending,
            isFull,
            canInvite: !isFull && !isPending && requester.currentSemester < 8,
        }
    })
}

export async function lockGroup(studentId: string) {
    const membership = await prisma.fYPGroupMember.findUnique({
        where: { studentId },
        include: {
            group: {
                include: {
                    members: true,
                },
            },
        },
    })

    if (!membership) {
        throw new Error("Student is not part of any group")
    }

    const group = membership.group

    if (group.isLocked) {
        throw new Error("Group is already locked")
    }

    const memberCount = group.members.length
    if (memberCount < 2 || memberCount > 3) {
        throw new Error("Group must have 2 or 3 members to be locked")
    }

    const lockedGroup = await prisma.fYPGroup.update({
        where: { id: group.id },
        data: {
            isLocked: true,
        },
    })

    return {
        id: lockedGroup.id,
        isLocked: lockedGroup.isLocked,
    }
}

export async function removeGroupMember(
    requesterStudentId: string,
    targetStudentId: string
) {
    const requesterMembership = await prisma.fYPGroupMember.findUnique({
        where: { studentId: requesterStudentId },
        include: {
            group: {
                include: {
                    members: true,
                },
            },
        },
    })

    if (!requesterMembership) {
        throw new Error("You are not part of any group")
    }

    const group = requesterMembership.group

    if (group.isLocked) {
        throw new Error("Group is locked and cannot be modified")
    }

    const targetMembership = group.members.find(
        (m: { id: string; studentId: string; joinedAt?: Date }) =>
            m.studentId === targetStudentId
    )

    if (!targetMembership) {
        throw new Error("Target student is not part of your group")
    }

    const sortedMembers = [...group.members].sort(
        (a: any, b: any) =>
            new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime()
    )
    const leaderStudentId = sortedMembers[0]?.studentId

    const isSelfLeave = requesterStudentId === targetStudentId
    const isLeader = requesterStudentId === leaderStudentId

    if (!isSelfLeave && !isLeader) {
        throw new Error(
            "Only the group leader can remove other members from the group"
        )
    }

    if (!isSelfLeave && targetStudentId === leaderStudentId) {
        throw new Error("The group leader cannot be removed by other members")
    }

    await prisma.fYPGroupMember.delete({
        where: {
            id: targetMembership.id,
        },
    })

    if (group.members.length <= 1) {
        await prisma.fYPGroup.delete({
            where: { id: group.id },
        })
    }

    return {
        removedStudentId: targetStudentId,
        groupId: group.id,
    }
}

export async function updateGroupProject(
    studentId: string,
    projectName: string,
    description?: string
) {
    const membership = await prisma.fYPGroupMember.findUnique({
        where: { studentId },
        include: {
            group: true,
        },
    })

    if (!membership) {
        throw new Error("Student is not part of any group")
    }

    if (!projectName || projectName.trim().length === 0) {
        throw new Error("Project name is required")
    }

    if (projectName.trim().length > 100) {
        throw new Error("Project name must be 100 characters or less")
    }

    if (description && description.trim().length > 500) {
        throw new Error("Description must be 500 characters or less")
    }

    const updatedGroup = await prisma.fYPGroup.update({
        where: { id: membership.group.id },
        data: {
            projectName: projectName.trim(),
            description: description?.trim() || null,
        },
    })

    return {
        id: updatedGroup.id,
        projectName: updatedGroup.projectName,
        description: updatedGroup.description,
        isLocked: updatedGroup.isLocked,
    }
}

export async function updateGroupVisibility(
    studentId: string,
    showGroupOnProfile: boolean
) {
    const student = await prisma.student.findUnique({
        where: { id: studentId },
    })

    if (!student) {
        throw new Error("Student not found")
    }

    const updatedStudent = await prisma.student.update({
        where: { id: studentId },
        data: {
            showGroupOnProfile,
        },
        select: {
            id: true,
            showGroupOnProfile: true,
        },
    })

    return updatedStudent
}
