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





