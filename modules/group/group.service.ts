import prisma from "@/lib/db"


//   Get the FYP group of a student (if exists)

export async function getMyGroup(studentId: string) {
    // 1️⃣ Find membership
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

    // 2️⃣ No group case
    if (!membership) {
        return null
    }

    const group = membership.group

    // 3️⃣ Shape clean response
    return {
        id: group.id,
        projectName: group.projectName,
        description: group.description,
        isLocked: group.isLocked,
        createdAt: group.createdAt,
        members: group.members.map((m) => ({
            id: m.student.id,
            name: m.student.name,
            department: m.student.department,
            semester: m.student.currentSemester,
            profilePicture: m.student.profilePicture,
            showGroupOnProfile: m.student.showGroupOnProfile,
        })),
    }
}



/**
 * Lock an existing FYP group
 * Rules:
 * - Group must exist
 * - Group must NOT already be locked
 * - Student must be a member
 * - Group must have valid member count (2 or 3)
 */

export async function lockGroup(studentId: string) {
    // 1️⃣ Find membership + group
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

    // 2️⃣ Group already locked
    if (group.isLocked) {
        throw new Error("Group is already locked")
    }

    // 3️⃣ Validate member count
    const memberCount = group.members.length
    if (memberCount < 2 || memberCount > 3) {
        throw new Error("Group must have 2 or 3 members to be locked")
    }

    // 4️⃣ Lock group
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
    // 1️⃣ Find requester membership + group
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

    // 2️⃣ Locked group check
    if (group.isLocked) {
        throw new Error("Group is locked and cannot be modified")
    }

    // 3️⃣ Verify target is in same group
    const targetMembership = group.members.find(
        (m) => m.studentId === targetStudentId
    )

    if (!targetMembership) {
        throw new Error("Target student is not part of your group")
    }

    // 4️⃣ Prevent invalid group state
    if (group.members.length <= 2) {
        throw new Error("Group must have at least 2 members")
    }

    // 5️⃣ Remove member
    await prisma.fYPGroupMember.delete({
        where: {
            id: targetMembership.id,
        },
    })

    return {
        removedStudentId: targetStudentId,
        groupId: group.id,
    }
}


/**
 * Update FYP Group Project Details
 * Rules:
 * - Student must be a member of the group
 * - Name and description CAN be edited even when locked
 */
export async function updateGroupProject(
    studentId: string,
    projectName: string,
    description?: string
) {
    // 1️⃣ Find membership + group
    const membership = await prisma.fYPGroupMember.findUnique({
        where: { studentId },
        include: {
            group: true,
        },
    })

    if (!membership) {
        throw new Error("Student is not part of any group")
    }

    // 2️⃣ Validate project name
    if (!projectName || projectName.trim().length === 0) {
        throw new Error("Project name is required")
    }

    if (projectName.trim().length > 100) {
        throw new Error("Project name must be 100 characters or less")
    }

    if (description && description.trim().length > 500) {
        throw new Error("Description must be 500 characters or less")
    }

    // 3️⃣ Update group
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


/**
 * Toggle Group Visibility on Public Profile
 * Rules:
 * - Student must exist
 * - This only affects the student's own visibility preference
 */
export async function updateGroupVisibility(
    studentId: string,
    showGroupOnProfile: boolean
) {
    // 1️⃣ Verify student exists
    const student = await prisma.student.findUnique({
        where: { id: studentId },
    })

    if (!student) {
        throw new Error("Student not found")
    }

    // 2️⃣ Update visibility preference
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