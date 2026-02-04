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
    matchScore: number // 0-100 percentage
    isGroupLocked: boolean // If student's group is locked
    availability: "AVAILABLE" | "BUSY" | "AWAY" // Student's availability status
    projectCount: number // Number of projects for matching
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
    const availabilityParam = searchParams.get("availability") // AVAILABLE, BUSY, AWAY

    // 🧠 3. Base WHERE (MANDATORY RULES)
    const where: any = {
        // exclude current user
        userId: { not: userId },

        // enforce eligibility
        currentSemester: {
            gte: 5,
            lte: 7,
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
    // First, get the current user's data for matching
    const currentUserData = await prisma.student.findUnique({
        where: { userId },
        select: {
            department: true,
            currentSemester: true,
            skills: {
                select: { name: true },
            },
            projects: {
                select: { id: true },
            },
        },
    })
    const userSkillNames = currentUserData?.skills.map((s) => s.name.toLowerCase()) || []
    const userDepartment = currentUserData?.department || ""
    const userSemester = currentUserData?.currentSemester || 0
    const userProjectCount = currentUserData?.projects.length || 0

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
                interests: true,
                linkedinUrl: true,
                githubUrl: true,
                availability: true,
                skills: {
                    select: {
                        name: true,
                    },
                },
                projects: {
                    select: {
                        id: true,
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

    console.log("Students are ", students)
    
    // 🎁 6. Shape response with improved match score calculation
    const items: MatchedStudent[] = students.map((s) => {
        const studentSkillNames = s.skills.map((sk) => sk.name.toLowerCase())
        const studentProjectCount = s.projects.length
        
        // Calculate match score based on multiple factors:
        // 1. Skill overlap (40% weight) - How many skills match
        // 2. Same department (20% weight) - Bonus for same department
        // 3. Same semester (20% weight) - Important for FYP timing
        // 4. Project experience (20% weight) - Having projects shows commitment
        let matchScore = 0
        
        // 1. Skill matching (40%): percentage of overlapping skills
        if (userSkillNames.length > 0 && studentSkillNames.length > 0) {
            const matchingSkills = studentSkillNames.filter((skill) => 
                userSkillNames.includes(skill)
            ).length
            // Calculate both directions and average them
            const userMatchPercent = matchingSkills / userSkillNames.length
            const studentMatchPercent = matchingSkills / studentSkillNames.length
            const skillScore = ((userMatchPercent + studentMatchPercent) / 2) * 40
            matchScore += skillScore
        } else if (studentSkillNames.length > 0) {
            // If user has no skills but student does, give partial score
            matchScore += 10
        }
        
        // 2. Department matching (20%): same department = better collaboration
        if (userDepartment && s.department.toLowerCase() === userDepartment.toLowerCase()) {
            matchScore += 20
        } else {
            // Partial score for different but related departments
            matchScore += 5
        }
        
        // 3. Semester matching (20%): same semester = aligned FYP timeline
        if (userSemester > 0 && s.currentSemester === userSemester) {
            matchScore += 20
        } else if (userSemester > 0 && Math.abs(s.currentSemester - userSemester) === 1) {
            // Adjacent semester gets partial score
            matchScore += 10
        }
        
        // 4. Project experience (20%): having projects shows experience
        if (studentProjectCount > 0) {
            // More projects = higher score, cap at 20
            const projectScore = Math.min(studentProjectCount * 5, 20)
            matchScore += projectScore
        }
        
        // Ensure score is between 0-100
        matchScore = Math.min(100, Math.max(0, Math.round(matchScore)))
        
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
            matchScore,
            isGroupLocked: s.groupMember?.group?.isLocked ?? false,
            availability: s.availability as "AVAILABLE" | "BUSY" | "AWAY",
            projectCount: studentProjectCount,
        }
    })

    // Sort by match score (highest first)
    items.sort((a, b) => b.matchScore - a.matchScore)


    return ({
        items,
        limit,
        offset,
        total
    })
}