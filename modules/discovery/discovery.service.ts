import prisma from "@/lib/db"
import { AvailabilityStatus, UserStatus } from "@/lib/generated/prisma/enums"


export interface MatchedStudent {
    id: string
    name: string
    department: string
    semester: number
    profilePicture: string | null
    skills: string[]
    // New fields
    interests: string | null
    linkedinUrl: string | null
    githubUrl: string | null
    profileCompletion: number // 0-100 percentage
    isGroupLocked: boolean // If student's group is locked
    availability: "AVAILABLE" | "BUSY" | "AWAY" // Student's availability status
    projectCount: number // Number of projects for matching
    industryPreference: string | null // FYP industry preference
    hobbies: string | null // Student hobbies
    projectNames: string[] // Names of student projects
}

export interface DiscoveryResult {
    items: MatchedStudent[]
    total: number
    limit: number
    offset: number
}

/**
 * Calculate profile completeness score (0-100)
 * Used to prioritize more complete profiles in discovery
 */
function calculateProfileCompleteness(student: {
    profilePicture: string | null
    interests: string | null
    skills: { name: string }[]
    projects: { id: string }[]
    linkedinUrl: string | null
    githubUrl: string | null
    careerGoal: string | null
    industryPreference: string | null
}): number {
    let score = 0
    
    // Profile picture (25 points) - High impact on discovery
    if (student.profilePicture) score += 25
    
    // Bio/interests (15 points)
    if (student.interests && student.interests.trim().length > 0) score += 15
    
    // Skills (20 points) - At least 3 skills for full points
    const skillCount = student.skills.length
    if (skillCount >= 3) score += 20
    else if (skillCount >= 1) score += skillCount * 5
    
    // Projects (20 points) - At least 1 project
    if (student.projects.length >= 1) score += 20
    
    // Social links (10 points)
    if (student.linkedinUrl || student.githubUrl) score += 10
    
    // Career goal (5 points)
    if (student.careerGoal && student.careerGoal.trim().length > 0) score += 5
    
    // FYP Industry (5 points)
    if (student.industryPreference && student.industryPreference.trim().length > 0) score += 5
    
    return Math.min(100, score)
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
    const availabilityParam = searchParams.get("availability") // AVAILABLE, BUSY, AWAY

    // 🧠 3. Base WHERE (MANDATORY RULES)
    const where: any = {
        // exclude current user
        userId: { not: userId },

        // enforce eligibility (semesters 5-8 are FYP eligible)
        // Note: Semester 8 students can appear in discovery but cannot send partner requests
        currentSemester: {
            gte: 5,
            lte: 8,
        },

        // user account must be active
        user: {
            status: UserStatus.ACTIVE,
        },
    }

    // Availability filter - default to AVAILABLE if not specified
    if (availabilityParam && ["AVAILABLE", "BUSY", "AWAY"].includes(availabilityParam)) {
        where.availability = availabilityParam as AvailabilityStatus
    } else {
        // Default to AVAILABLE
        where.availability = AvailabilityStatus.AVAILABLE
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
            select: {
                id: true,
                name: true,
                department: true,
                currentSemester: true,
                profilePicture: true,
                interests: true,
                linkedinUrl: true,
                githubUrl: true,
                availability: true,
                careerGoal: true,
                industryPreference: true,
                hobbies: true,
                createdAt: true,
                skills: {
                    select: {
                        name: true,
                    },
                },
                projects: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                groupMember: {
                    select: {
                        group: {
                            select: {
                                isLocked: true,
                            },
                        },
                    },
                },
            },
        }),
        prisma.student.count({ where }),
    ])
    
    // 🎁 6. Shape response — ordered by profile completion (descending)
    const items: MatchedStudent[] = students.map((s) => {
        const profileCompletion = calculateProfileCompleteness({
            profilePicture: s.profilePicture,
            interests: s.interests,
            skills: s.skills,
            projects: s.projects,
            linkedinUrl: s.linkedinUrl,
            githubUrl: s.githubUrl,
            careerGoal: s.careerGoal,
            industryPreference: s.industryPreference,
        })
        
        return {
            id: s.id,
            name: s.name,
            department: s.department,
            semester: s.currentSemester,
            profilePicture: s.profilePicture,
            skills: s.skills.map((sk) => sk.name),
            interests: s.interests,
            linkedinUrl: s.linkedinUrl,
            githubUrl: s.githubUrl,
            profileCompletion,
            isGroupLocked: s.groupMember?.group?.isLocked ?? false,
            availability: s.availability as "AVAILABLE" | "BUSY" | "AWAY",
            projectCount: s.projects.length,
            industryPreference: s.industryPreference,
            hobbies: s.hobbies,
            projectNames: s.projects.map((p) => p.name),
        }
    })

    // Sort by profile completion (100% first, then descending)
    items.sort((a, b) => b.profileCompletion - a.profileCompletion)


    return ({
        items,
        limit,
        offset,
        total
    })
}