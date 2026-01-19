import prisma from "@/lib/db"
import { AvailabilityStatus, UserStatus } from "@/lib/generated/prisma/enums"


export interface MatchedStudent {
    id: string
    name: string
    department: string
    semester: number
    profilePicture: string | null
    skills: string[]
}

export interface DiscoveryResult {
    items: MatchedStudent[]
    total: number
    limit: number
    offset: number
}

export async function getMatchedStudents(
    searchParams: URLSearchParams,
    userId: string
): Promise<DiscoveryResult> {

    const limit = Math.min(Number(searchParams.get("limit")) || 7, 20)
    const offset = Math.max(Number(searchParams.get("offset")) || 0, 0)

    const department = searchParams.get("department")
    const semesterParam = searchParams.get("semester")
    const skillNames = searchParams.getAll("skill") // skill names, not IDs

    // 🧠 3. Base WHERE (MANDATORY RULES)
    const where: any = {
        // exclude current user
        userId: { not: userId },

        // enforce eligibility
        currentSemester: {
            gte: 5,
            lte: 7,
        },

        // availability rule
        availability: AvailabilityStatus.AVAILABLE,

        // user account must be active
        user: {
            status: UserStatus.ACTIVE,
        },
    }

    // 🧩 4. Optional filters
    if (department) {
        where.department = {
            equals: department,
            mode: "insensitive",
        }
    }

    if (semesterParam) {
        const semester = Number(semesterParam)
        if (!Number.isNaN(semester)) {
            where.currentSemester = semester
        }
    }

    if (skillNames.length > 0) {
        where.skills = {
            some: {
                name: {
                    in: skillNames,
                    mode: "insensitive",
                },
            },
        }
    }

    // 📦 5. Query DB (parallel)
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
                profilePicture: true,
                skills: {
                    select: {
                        name: true,
                    },
                },
            },
        }),
        prisma.student.count({ where }),
    ])

    // 🎁 6. Shape response
    const items = students.map((s) => ({
        id: s.id,
        name: s.name,
        department: s.department,
        semester: s.currentSemester,
        profilePicture: s.profilePicture,
        skills: s.skills.map((sk) => sk.name),
    }))


    return ({
        items,
        limit,
        offset,
        total
    })
}