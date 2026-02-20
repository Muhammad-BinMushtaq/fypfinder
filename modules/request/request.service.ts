// modules/request/request.service.ts

import prisma from "@/lib/db"
import { RequestType, RequestStatus } from "@/lib/generated/prisma/enums"
import { request } from "http"
import { notifyMessageRequest, notifyPartnerRequest, notifyRequestAccepted } from "@/lib/push-service"


// Message Request

export async function sendMessageRequest(
    fromStudentId: string,
    toStudentId: string,
    reason: string
) {
    // 1️⃣ Prevent self-request
    if (fromStudentId === toStudentId) {
        throw new Error("You cannot send a request to yourself")
    }

    // 2️⃣ Ensure receiver exists
    const receiver = await prisma.student.findUnique({
        where: { id: toStudentId },
        select: { id: true },
    })

    if (!receiver) {
        throw new Error("Target student does not exist")
    }

    // 3️⃣ Prevent duplicate active request
    const existingRequest = await prisma.request.findFirst({
        where: {
            fromStudentId,
            toStudentId,
            type: RequestType.MESSAGE,
            status: RequestStatus.PENDING,
        },
    })

    if (existingRequest) {
        throw new Error("A pending message request already exists")
    }

    // 4️⃣ Create request
    const request = await prisma.request.create({
        data: {
            fromStudentId,
            toStudentId,
            type: RequestType.MESSAGE,
            status: RequestStatus.PENDING,
            reason: reason,
        },
        include: {
            fromStudent: {
                select: { name: true },
            },
        },
    })

    // 5️⃣ Send push notification (async, don't block response)
    notifyMessageRequest(
        toStudentId,
        request.fromStudent.name,
        request.id,
        reason
    ).catch(err => console.error('Push notification error:', err))

    return request
}


// get send messages requests


export async function getSentMessageRequests(studentId: string) {
    return prisma.request.findMany({
        where: {
            fromStudentId: studentId,
            type: RequestType.MESSAGE,
        },
        orderBy: {
            createdAt: "desc",
        },
        include: {
            toStudent: {
                select: {
                    id: true,
                    name: true,
                    department: true,
                    currentSemester: true,
                    profilePicture: true,
                },
            },
        },
    })

}

// get recieved messages requests
export async function getRecievedMessageRequests(studentId: string) {
    return prisma.request.findMany({
        where: {
            toStudentId: studentId,
            type: RequestType.MESSAGE,
        },
        orderBy: {
            createdAt: "desc",
        },
        include: {
            fromStudent: {
                select: {
                    id: true,
                    name: true,
                    department: true,
                    currentSemester: true,
                    profilePicture: true,
                },
            },
        },
    })
}



// accept message request
export async function acceptMessageRequest(
    requestId: string,
    receiverStudentId: string
) {
    // 1️⃣ Fetch request
    const request = await prisma.request.findUnique({
        where: { id: requestId },
    })

    if (!request) {
        throw new Error("Request not found")
    }

    // 2️⃣ Validate request type
    if (request.type !== RequestType.MESSAGE) {
        throw new Error("Invalid request type")
    }

    // 3️⃣ Validate status
    if (request.status !== RequestStatus.PENDING) {
        throw new Error("Request already processed")
    }

    // 4️⃣ Validate receiver
    if (request.toStudentId !== receiverStudentId) {
        throw new Error("Unauthorized: not request receiver")
    }

    // 5️⃣ Update request status
    const updatedRequest = await prisma.request.update({
        where: { id: requestId },
        data: {
            status: RequestStatus.ACCEPTED,
        },
        include: {
            toStudent: {
                select: { name: true },
            },
        },
    })

    // 6️⃣ Send push notification to original sender (async)
    notifyRequestAccepted(
        request.fromStudentId,
        'MESSAGE',
        updatedRequest.toStudent.name
    ).catch(err => console.error('Push notification error:', err))

    return updatedRequest
}

// Reject Message 
export async function rejectMessageRequest(
    requestId: string,
    receiverStudentId: string
) {
    // 1️⃣ Fetch request
    const request = await prisma.request.findUnique({
        where: { id: requestId },
    })

    if (!request) {
        throw new Error("Request not found")
    }

    // 2️⃣ Validate request type
    if (request.type !== RequestType.MESSAGE) {
        throw new Error("Invalid request type")
    }

    // 3️⃣ Validate status
    if (request.status !== RequestStatus.PENDING) {
        throw new Error("Request already processed")
    }

    // 4️⃣ Validate receiver
    if (request.toStudentId !== receiverStudentId) {
        throw new Error("Unauthorized: not request receiver")
    }

    // 5️⃣ Update request status
    const updatedRequest = await prisma.request.update({
        where: { id: requestId },
        data: {
            status: RequestStatus.REJECTED,
        },
    })



    return updatedRequest
}



// Partner Request
export async function sendPartnerRequest(
    fromStudentId: string,
    toStudentId: string,
    reason?: string,
) {


    // 1️⃣ Prevent self-request
    if (fromStudentId === toStudentId) {
        throw new Error("You cannot send a partner request to yourself")
    }

    // 2️⃣ Fetch both students with group info
    const [sender, receiver] = await Promise.all([
        prisma.student.findUnique({
            where: { id: fromStudentId },
            include: {
                groupMember: {
                    include: { group: { include: { members: true } } },
                },
            },
        }),
        prisma.student.findUnique({
            where: { id: toStudentId },
            include: {
                groupMember: {
                    include: { group: { include: { members: true } } },
                },
            },
        }),
    ])

    if (!sender || !receiver) {
        throw new Error("One or both students do not exist")
    }

    // 3️⃣ Eligibility checks (semester rule)
    if (sender.currentSemester !== receiver.currentSemester) {
        throw new Error("Both students must be in same semesters")
    }

    // 3.5️⃣ Check if both are already in the SAME group (edge case fix)
    if (sender.groupMember && receiver.groupMember &&
        sender.groupMember.groupId === receiver.groupMember.groupId) {
        throw new Error("You are already in the same group as this student")
    }

    // 4️⃣ Prevent sending request if sender group is locked
    if (sender.groupMember?.group?.isLocked) {
        throw new Error("Your FYP group is already locked")
    }

    // 5️⃣ Prevent sending request if receiver group is locked
    if (receiver.groupMember?.group?.isLocked) {
        throw new Error("Target student's group is already locked")
    }

    // 6️⃣ Check if sender's group is full (max 3 members)
    if (sender.groupMember?.group?.members && sender.groupMember.group.members.length >= 3) {
        throw new Error("Your group is already full (max 3 members)")
    }

    // 6.5️⃣ Check if receiver already has a group (edge case fix)
    // If receiver has a group, check if adding sender would exceed limit
    if (receiver.groupMember?.group?.members) {
        const receiverGroupSize = receiver.groupMember.group.members.length
        if (receiverGroupSize >= 3) {
            throw new Error("Target student's group is already full (max 3 members)")
        }
    }

    // 7️⃣ Prevent duplicate pending partner request (either direction)
    const existingRequest = await prisma.request.findFirst({
        where: {
            type: RequestType.PARTNER,
            status: RequestStatus.PENDING,
            OR: [
                { fromStudentId, toStudentId },
                { fromStudentId: toStudentId, toStudentId: fromStudentId }, // Check reverse direction too
            ],
        },
    })

    if (existingRequest) {
        throw new Error("A pending partner request already exists between you and this student")
    }

    // 8️⃣ Create partner request
    const request = await prisma.request.create({
        data: {
            fromStudentId,
            toStudentId,
            type: RequestType.PARTNER,
            status: RequestStatus.PENDING,
            reason: reason || "",
        },
    })

    // 9️⃣ Send push notification (async, don't block response)
    notifyPartnerRequest(
        toStudentId,
        sender.name,
        request.id,
        reason || ""
    ).catch(err => console.error('Push notification error:', err))

    return request
}


//get send partner request
export async function getSentPartnerRequests(studentId: string) {
    return prisma.request.findMany({
        where: {
            fromStudentId: studentId,
            type: RequestType.PARTNER,
        },
        orderBy: {
            createdAt: "desc",
        },
        include: {
            toStudent: {
                select: {
                    id: true,
                    name: true,
                    department: true,
                    currentSemester: true,
                    profilePicture: true,
                },
            },
        },
    })
}

// get recieved partner requests 
export async function getRecievedPartnerRequests(studentId: string) {
    return prisma.request.findMany({
        where: {
            toStudentId: studentId,
            type: RequestType.PARTNER,
        },
        orderBy: {
            createdAt: "desc",
        },
        include: {
            fromStudent: {
                select: {
                    id: true,
                    name: true,
                    department: true,
                    currentSemester: true,
                    profilePicture: true,
                },
            },
        },
    })
}


// reject partner request
export async function rejectPartnerRequest(
    requestId: string,
    receiverStudentId: string
) {
    // 1️⃣ Fetch request
    const request = await prisma.request.findUnique({
        where: { id: requestId },
    })

    if (!request) {
        throw new Error("Request not found")
    }

    // 2️⃣ Validate request type
    if (request.type !== RequestType.PARTNER) {
        throw new Error("Invalid request type")
    }

    // 3️⃣ Validate status
    if (request.status !== RequestStatus.PENDING) {
        throw new Error("Request already processed")
    }

    // 4️⃣ Validate receiver
    if (request.toStudentId !== receiverStudentId) {
        throw new Error("Unauthorized: not request receiver")
    }

    // 5️⃣ Update request status
    const updatedRequest = await prisma.request.update({
        where: { id: requestId },
        data: {
            status: RequestStatus.REJECTED,
        },
    })



    return updatedRequest
}

// Accept partner request


const MAX_PARTNERS = 3

export async function acceptPartnerRequest(
    requestId: string,
    currentStudentId: string
) {
    const result = await prisma.$transaction(async (tx) => {
        // 1️⃣ Fetch request
        const request = await tx.request.findUnique({
            where: { id: requestId },
        })

        if (!request) {
            throw new Error("Request not found")
        }

        if (request.type !== RequestType.PARTNER) {
            throw new Error("Invalid request type")
        }

        if (request.status !== RequestStatus.PENDING) {
            throw new Error("Request already processed")
        }

        if (request.toStudentId !== currentStudentId) {
            throw new Error("Unauthorized action")
        }

        // 2️⃣ Fetch both students with group info
        const [sender, receiver] = await Promise.all([
            tx.student.findUnique({
                where: { id: request.fromStudentId },
                include: {
                    groupMember: {
                        include: { group: { include: { members: true } } },
                    },
                },
            }),
            tx.student.findUnique({
                where: { id: request.toStudentId },
                include: {
                    groupMember: {
                        include: { group: { include: { members: true } } },
                    },
                },
            }),
        ])

        if (!sender || !receiver) {
            throw new Error("Student not found")
        }

        // 3️⃣ Eligibility check (semester)
        if (sender.currentSemester !== receiver.currentSemester) {
            throw new Error("Students must be in the same semester")
        }

        // 4️⃣ Determine group strategy
        let groupId: string

        const senderGroup = sender.groupMember?.group
        const receiverGroup = receiver.groupMember?.group

        // ❌ Check if either group is locked (race condition protection)
        if (senderGroup?.isLocked) {
            throw new Error("Sender's group is now locked")
        }
        if (receiverGroup?.isLocked) {
            throw new Error("Receiver's group is now locked")
        }

        // ❌ Check if already in same group (edge case)
        if (senderGroup && receiverGroup && senderGroup.id === receiverGroup.id) {
            throw new Error("Both students are already in the same group")
        }

        // ❌ Both already in different groups → reject
        if (senderGroup && receiverGroup) {
            throw new Error("Both students already have groups")
        }

        // 🟢 Case 1: Sender has group → add receiver
        if (senderGroup) {
            if (senderGroup.members.length >= MAX_PARTNERS) {
                throw new Error("Sender group is full")
            }

            groupId = senderGroup.id

            await tx.fYPGroupMember.create({
                data: {
                    groupId,
                    studentId: receiver.id,
                },
            })
        }

        // 🟢 Case 2: Receiver has group → add sender
        else if (receiverGroup) {
            if (receiverGroup.members.length >= MAX_PARTNERS) {
                throw new Error("Receiver group is full")
            }

            groupId = receiverGroup.id

            await tx.fYPGroupMember.create({
                data: {
                    groupId,
                    studentId: sender.id,
                },
            })
        }

        // 🟢 Case 3: Neither has group → create new
        else {
            const group = await tx.fYPGroup.create({
                data: {
                    projectName: "New FYP Group",
                },
            })

            groupId = group.id

            await tx.fYPGroupMember.createMany({
                data: [
                    { groupId, studentId: sender.id },
                    { groupId, studentId: receiver.id },
                ],
            })
        }

        // 5️⃣ Lock group if full
        const membersCount = await tx.fYPGroupMember.count({
            where: { groupId },
        })

        if (membersCount >= MAX_PARTNERS) {
            await tx.fYPGroup.update({
                where: { id: groupId },
                data: { isLocked: true },
            })
        }

        // 6️⃣ Mark request accepted
        const updatedRequest = await tx.request.update({
            where: { id: requestId },
            data: { status: RequestStatus.ACCEPTED },
        })

        return { updatedRequest, senderStudentId: sender.id, receiverName: receiver.name }
    })

    // 7️⃣ Send push notification to original sender (outside transaction)
    notifyRequestAccepted(
        result.senderStudentId,
        'PARTNER',
        result.receiverName
    ).catch(err => console.error('Push notification error:', err))

    return result.updatedRequest
}

