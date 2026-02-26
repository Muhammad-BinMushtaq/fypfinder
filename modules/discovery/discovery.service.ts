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
    industryPreference: string | null // FYP industry preference
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
            industryPreference: true,
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
    const userIndustryPref = currentUserData?.industryPreference || ""
    const isNewUser = userSkillNames.length === 0 // No skills = new user

    const [students, total] = await Promise.all([
        prisma.student.findMany({
            where,
            skip: offset,
            take: limit,
            orderBy: { createdAt: "asc" },
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
                createdAt: true,
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
    
    // 🎁 6. Shape response with improved match score calculation
    const items: MatchedStudent[] = students.map((s) => {
        const studentSkillNames = s.skills.map((sk) => sk.name.toLowerCase())
        const studentProjectCount = s.projects.length
        
        // Calculate profile completeness for this student
        const profileCompleteness = calculateProfileCompleteness({
            profilePicture: s.profilePicture,
            interests: s.interests,
            skills: s.skills,
            projects: s.projects,
            linkedinUrl: s.linkedinUrl,
            githubUrl: s.githubUrl,
            careerGoal: s.careerGoal,
            industryPreference: s.industryPreference,
        })
        
        // Calculate match score based on multiple factors:
        // For NEW USERS (no skills): Prioritize profile completeness
        // For ESTABLISHED USERS: Balance all factors
        let matchScore = 0
        
        if (isNewUser) {
            // NEW USER SCORING (no skills to match):
            // Profile completeness: 40%, Department: 20%, Semester: 20%, Projects: 20%
            matchScore += (profileCompleteness / 100) * 40
            
            if (s.department.toLowerCase() === userDepartment.toLowerCase()) {
                matchScore += 20
            } else {
                matchScore += 5
            }
            
            if (userSemester > 0 && s.currentSemester === userSemester) {
                matchScore += 20
            } else if (userSemester > 0 && Math.abs(s.currentSemester - userSemester) === 1) {
                matchScore += 10
            }
            
            if (studentProjectCount > 0) {
                matchScore += Math.min(studentProjectCount * 5, 20)
            }
        } else {
            // ESTABLISHED USER SCORING:
            // Skill overlap: 25%, Complementary skills: 15%, Department: 15%, 
            // Semester: 15%, Profile completeness: 15%, FYP Industry: 10%, Projects: 5%
            
            // 1. Skill overlap (25%): percentage of matching skills
            if (studentSkillNames.length > 0) {
                const matchingSkills = studentSkillNames.filter((skill) => 
                    userSkillNames.includes(skill)
                ).length
                const userMatchPercent = matchingSkills / userSkillNames.length
                const studentMatchPercent = matchingSkills / studentSkillNames.length
                const skillScore = ((userMatchPercent + studentMatchPercent) / 2) * 25
                matchScore += skillScore
            }
            
            // 2. Complementary skills (15%): skills they have that user doesn't
            // This encourages diverse team building
            if (studentSkillNames.length > 0) {
                const complementarySkills = studentSkillNames.filter((skill) => 
                    !userSkillNames.includes(skill)
                ).length
                // More unique skills = higher complementary score, cap at 15%
                const complementaryScore = Math.min((complementarySkills / studentSkillNames.length) * 15, 15)
                matchScore += complementaryScore
            }
            
            // 3. Department matching (15%): same department = better collaboration
            if (userDepartment && s.department.toLowerCase() === userDepartment.toLowerCase()) {
                matchScore += 15
            } else {
                matchScore += 3
            }
            
            // 4. Semester matching (15%): same semester = aligned FYP timeline
            if (userSemester > 0 && s.currentSemester === userSemester) {
                matchScore += 15
            } else if (userSemester > 0 && Math.abs(s.currentSemester - userSemester) === 1) {
                matchScore += 8
            }
            
            // 5. Profile completeness (15%): well-filled profiles are more trustworthy
            matchScore += (profileCompleteness / 100) * 15
            
            // 6. FYP Industry matching (10%): same industry interest = shared vision
            if (userIndustryPref && s.industryPreference && 
                s.industryPreference.toLowerCase() === userIndustryPref.toLowerCase()) {
                matchScore += 10
            } else if (s.industryPreference) {
                // Has an industry preference (even if different) shows commitment
                matchScore += 3
            }
            
            // 7. Project experience (5%): having projects shows commitment
            if (studentProjectCount > 0) {
                matchScore += Math.min(studentProjectCount * 2, 5)
            }
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
            industryPreference: s.industryPreference,
        }
    })

    // Sort by match score (highest first), then by profile completeness as tiebreaker
    items.sort((a, b) => {
        if (b.matchScore !== a.matchScore) {
            return b.matchScore - a.matchScore
        }
        // Tiebreaker: more projects = more active
        return (b.projectCount || 0) - (a.projectCount || 0)
    })


    return ({
        items,
        limit,
        offset,
        total
    })
}