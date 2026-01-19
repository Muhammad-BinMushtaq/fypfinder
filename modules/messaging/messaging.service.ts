import prisma from "@/lib/db"

/**
 * Checks whether two students are allowed to message each other.
 *
 * Rules:
 * 1. ACCEPTED message request exists between them
 * OR
 * 2. Both belong to the same FYP group
 */
export async function canStudentsMessage(
  studentAId: string,
  studentBId: string
): Promise<boolean> {

  // ❌ Safety: same student
  if (studentAId === studentBId) {
    return false
  }

  console.log(`Checking messaging permission between ${studentAId} and ${studentBId}`)

  // 1️⃣ Check ACCEPTED message request (either direction)
  const messageRequest = await prisma.request.findFirst({
    where: {
      type: "MESSAGE",
      status: "ACCEPTED",
      OR: [
        {
          fromStudentId: studentAId,
          toStudentId: studentBId,
        },
        {
          fromStudentId: studentBId,
          toStudentId: studentAId,
        },
      ],
    },
    select: { id: true },
  })

  if (messageRequest) {
    return true
  }

  console.log("Message request found:", messageRequest)
  // 2️⃣ Check shared FYP group
  const sharedGroup = await prisma.fYPGroupMember.findFirst({
    where: {
      studentId: studentAId,
      group: {
        members: {
          some: {
            studentId: studentBId,
          },
        },
      },
    },
    select: { id: true },
  })

  console.log("Shared group found:", sharedGroup)
  return Boolean(sharedGroup)
}
