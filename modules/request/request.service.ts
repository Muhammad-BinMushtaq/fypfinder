// modules/request/request.service.ts

import prisma from "@/lib/db"
import { RequestType, RequestStatus } from "@/lib/generated/prisma/enums"
import { request } from "http"


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
    })

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
    })



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

    // 7️⃣ Prevent duplicate pending partner request
    const existingRequest = await prisma.request.findFirst({
        where: {
            fromStudentId,
            toStudentId,
            type: RequestType.PARTNER,
            status: RequestStatus.PENDING,
        },
    })

    if (existingRequest) {
        throw new Error("A pending partner request already exists")
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
    return await prisma.$transaction(async (tx) => {
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

        // ❌ Both already in groups → reject
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

        return updatedRequest
    })
}

