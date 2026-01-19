import prisma from "@/lib/db"
import { UserStatus } from "@/lib/generated/prisma/enums"


// Get all students with optional filters and pagination
interface GetAllStudentsParams {
    limit: number
    offset: number
    studentId?: string
    name?: string
    department?: string
    semester?: number
    status?: UserStatus
}

export async function getAllStudents(params: GetAllStudentsParams) {
    const {
        limit,
        offset,
        studentId,
        name,
        department,
        semester,
        status,
    } = params

    /**
     * Build WHERE clause dynamically
     * Only add filters if provided
     */
    const where: any = {}

    // 🔍 Search by student ID (exact)
    if (studentId) {
        where.id = studentId
    }

    // 🔍 Search by name (partial, case-insensitive)
    if (name) {
        where.name = {
            contains: name,
            mode: "insensitive",
        }
    }

    // 🎓 Department filter
    if (department) {
        where.department = {
            equals: department,
            mode: "insensitive",
        }
    }

    // 📚 Semester filter
    if (semester) {
        where.currentSemester = semester
    }

    // 🚦 Status filter (comes from User table)
    if (status) {
        where.user = {
            status,
        }
    }

    /**
     * Fetch paginated students + total count
     * Parallel execution for performance
     */
    const [students, total] = await Promise.all([
        prisma.student.findMany({
            where,
            skip: offset,
            take: limit,
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                name: true,
                department: true,
                currentSemester: true,
                availability: true,
                createdAt: true,
                user: {
                    select: {
                        email: true,
                        status: true,
                    },
                },
            },
        }),

        prisma.student.count({ where }),
    ])



    return {
        items: students,
        pagination: {
            limit,
            offset,
            total,
        },
    }
}


// Delete and suspend student by ID




export async function deleteStudentService(
    studentId: string) {
    const student = await prisma.student.findUnique({
        where: { id: studentId },
        include: { user: true },
    })

    if (!student) {
        throw new Error("Student not found")
    }

    // ❌ Do not allow deletion unless requested or forced
    if (
        student.user.status !== UserStatus.DELETION_REQUESTED 
        
    ) {
        throw new Error("Student has not requested deletion")
    }

    await prisma.$transaction(async (tx) => {
        // 1️⃣ Remove requests
        await tx.request.deleteMany({
            where: {
                OR: [
                    { fromStudentId: student.id },
                    { toStudentId: student.id },
                ],
            },
        })

        // 2️⃣ Remove from group (if any)
        await tx.fYPGroupMember.deleteMany({
            where: { studentId: student.id },
        })

        // 3️⃣ Delete student profile
        await tx.student.delete({
            where: { id: student.id },
        })

        // 4️⃣ Suspend user (soft delete)
        await tx.user.update({
            where: { id: student.userId },
            data: { status: UserStatus.SUSPENDED },
        })
    })

    return { success: true }
}
