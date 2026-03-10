// modules/student/student.service.ts
// Business logic for student profile, skills, projects, and internships

import prisma from "@/lib/db"
import { ExperienceLevel, UserStatus } from "@/lib/generated/prisma/enums"

// =====================
// Profile
// =====================

const MY_PROFILE_SELECT = {
  id: true,
  name: true,
  department: true,
  currentSemester: true,
  profilePicture: true,
  interests: true,
  phone: true,
  linkedinUrl: true,
  githubUrl: true,
  availability: true,
  careerGoal: true,
  hobbies: true,
  preferredTechStack: true,
  industryPreference: true,
  user: {
    select: {
      status: true,
      email: true,
      createdAt: true,
    },
  },
  skills: {
    select: {
      id: true,
      name: true,
      description: true,
      level: true,
    },
  },
  projects: {
    select: {
      id: true,
      name: true,
      description: true,
      liveLink: true,
      githubLink: true,
    },
  },
  internships: {
    select: {
      id: true,
      companyName: true,
      position: true,
      duration: true,
      description: true,
      certificateLink: true,
    },
    orderBy: { createdAt: "desc" as const },
  },
}

/**
 * Get the authenticated student's full profile
 */
export async function getMyProfile(userId: string) {
  const student = await prisma.student.findUnique({
    where: { userId },
    select: MY_PROFILE_SELECT,
  })

  if (!student) return null

  return {
    id: student.id,
    name: student.name,
    department: student.department,
    semester: student.currentSemester,
    profilePicture: student.profilePicture,
    interests: student.interests,
    phone: student.phone,
    linkedinUrl: student.linkedinUrl,
    githubUrl: student.githubUrl,
    availability: student.availability,
    careerGoal: student.careerGoal,
    hobbies: student.hobbies,
    preferredTechStack: student.preferredTechStack,
    fypIndustry: student.industryPreference,
    skills: student.skills,
    projects: student.projects,
    internships: student.internships,
    user: student.user,
  }
}

import { AvailabilityStatus } from "@/lib/generated/prisma/enums"

/**
 * Update student profile (partial update, excluding name and department)
 */
export async function updateMyProfile(
  userId: string,
  data: {
    currentSemester?: number
    profilePicture?: string
    interests?: string
    phone?: string
    linkedinUrl?: string
    githubUrl?: string
    availability?: AvailabilityStatus
    careerGoal?: string
    hobbies?: string
    preferredTechStack?: string
    fypIndustry?: string
  }
) {
  const {
    currentSemester,
    profilePicture,
    interests,
    phone,
    linkedinUrl,
    githubUrl,
    availability,
    careerGoal,
    hobbies,
    preferredTechStack,
    fypIndustry,
  } = data

  return prisma.student.update({
    where: { userId },
    data: {
      ...(currentSemester !== undefined && { currentSemester }),
      ...(profilePicture !== undefined && { profilePicture }),
      ...(interests !== undefined && { interests }),
      ...(phone !== undefined && { phone }),
      ...(linkedinUrl !== undefined && { linkedinUrl }),
      ...(githubUrl !== undefined && { githubUrl }),
      ...(availability !== undefined && { availability }),
      ...(careerGoal !== undefined && { careerGoal }),
      ...(hobbies !== undefined && { hobbies }),
      ...(preferredTechStack !== undefined && { preferredTechStack }),
      ...(fypIndustry !== undefined && { industryPreference: fypIndustry }),
    },
  })
}

/**
 * Get a student's public profile by studentId
 */
export async function getPublicProfile(studentId: string) {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      user: { select: { email: true } },
      skills: true,
      projects: true,
      internships: {
        select: {
          id: true,
          companyName: true,
          position: true,
          duration: true,
          description: true,
          certificateLink: true,
        },
        orderBy: { createdAt: "desc" },
      },
      groupMember: {
        include: {
          group: {
            select: {
              id: true,
              projectName: true,
              description: true,
              isLocked: true,
              members: {
                select: {
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
      },
    },
  })

  if (!student) return null

  // Group visibility logic
  const isGrouped = !!student.groupMember
  const showGroupInfo = isGrouped && student.showGroupOnProfile

  let groupInfo = null
  if (showGroupInfo && student.groupMember) {
    const visibleMembers = student.groupMember.group.members
      .filter((m) => m.student.showGroupOnProfile)
      .map((m) => ({
        id: m.student.id,
        name: m.student.name,
        department: m.student.department,
        semester: m.student.currentSemester,
        profilePicture: m.student.profilePicture,
      }))

    groupInfo = {
      groupId: student.groupMember.group.id,
      projectName: student.groupMember.group.projectName,
      description: student.groupMember.group.description,
      isLocked: student.groupMember.group.isLocked,
      members: visibleMembers,
    }
  }

  const availableForGroup =
    !isGrouped || (isGrouped && !student.groupMember?.group.isLocked)

  return {
    id: student.id,
    name: student.name,
    email: student.user.email,
    department: student.department,
    semester: student.currentSemester,
    profilePicture: student.profilePicture,
    interests: student.interests,
    availability: student.availability,
    careerGoal: student.careerGoal,
    hobbies: student.hobbies,
    preferredTechStack: student.preferredTechStack,
    fypIndustry: student.industryPreference,
    linkedinUrl: student.linkedinUrl,
    githubUrl: student.githubUrl,
    isGrouped,
    availableForGroup,
    groupInfo,
    skills: student.skills.map((s: { id: string; name: string; level: string }) => ({
      id: s.id,
      name: s.name,
      level: s.level,
    })),
    projects: student.projects,
    internships: student.internships,
  }
}

/**
 * Request account deletion (sets status to DELETION_REQUESTED)
 */
export async function requestDeletion(userId: string, currentStatus: string) {
  if (currentStatus !== UserStatus.ACTIVE) {
    throw new Error("Account already in process")
  }

  await prisma.user.update({
    where: { id: userId },
    data: { status: UserStatus.DELETION_REQUESTED },
  })
}

/**
 * Cancel a pending deletion request (sets status back to ACTIVE)
 */
export async function cancelDeletion(userId: string, currentStatus: string) {
  if (currentStatus !== UserStatus.DELETION_REQUESTED) {
    throw new Error("No pending deletion request")
  }

  await prisma.user.update({
    where: { id: userId },
    data: { status: UserStatus.ACTIVE },
  })
}

// =====================
// Skills
// =====================

/**
 * Resolve the student record from userId, or throw
 */
async function getStudentOrThrow(userId: string) {
  const student = await prisma.student.findUnique({
    where: { userId },
  })
  if (!student) throw new Error("Student profile not found")
  return student
}

/**
 * Add a skill to the student's profile
 */
export async function addSkill(
  userId: string,
  data: { name: string; description?: string; level: ExperienceLevel }
) {
  const student = await getStudentOrThrow(userId)

  const normalizedName = data.name.trim().toLowerCase()

  // Duplicate check
  const existing = await prisma.skill.findUnique({
    where: {
      studentId_name: {
        studentId: student.id,
        name: normalizedName,
      },
    },
  })

  if (existing) {
    throw new Error("Skill already added")
  }

  return prisma.skill.create({
    data: {
      studentId: student.id,
      name: normalizedName,
      description: data.description,
      level: data.level,
    },
  })
}

/**
 * Update an existing skill (partial update)
 */
export async function updateSkill(
  userId: string,
  skillId: string,
  data: { name?: string; description?: string; level?: ExperienceLevel }
) {
  const student = await getStudentOrThrow(userId)

  // Ownership check
  const existing = await prisma.skill.findFirst({
    where: { id: skillId, studentId: student.id },
  })
  if (!existing) throw new Error("Skill not found or unauthorized")

  return prisma.skill.update({
    where: { id: skillId },
    data: {
      ...(data.name !== undefined && { name: data.name.trim().toLowerCase() }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.level !== undefined && { level: data.level }),
    },
  })
}

/**
 * Remove a skill by ID (with ownership via userId join)
 */
export async function removeSkill(userId: string, skillId: string) {
  const result = await prisma.skill.deleteMany({
    where: {
      id: skillId,
      student: { userId },
    },
  })
  if (result.count === 0) throw new Error("Skill not found or unauthorized")
}

// =====================
// Projects
// =====================

/**
 * Add a project to the student's profile
 */
export async function addProject(
  userId: string,
  data: {
    name: string
    description?: string
    liveLink?: string
    githubLink: string
  }
) {
  const student = await getStudentOrThrow(userId)

  return prisma.project.create({
    data: {
      studentId: student.id,
      name: data.name,
      description: data.description,
      liveLink: data.liveLink,
      githubLink: data.githubLink,
    },
  })
}

/**
 * Update an existing project (partial update)
 */
export async function updateProject(
  userId: string,
  projectId: string,
  data: {
    name?: string
    description?: string
    liveLink?: string
    githubLink?: string
  }
) {
  const student = await getStudentOrThrow(userId)

  // Ownership check
  const existing = await prisma.project.findFirst({
    where: { id: projectId, studentId: student.id },
  })
  if (!existing) throw new Error("Project not found or unauthorized")

  return prisma.project.update({
    where: { id: projectId },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.liveLink !== undefined && { liveLink: data.liveLink }),
      ...(data.githubLink !== undefined && { githubLink: data.githubLink }),
    },
  })
}

/**
 * Remove a project by ID (with ownership via userId join)
 */
export async function removeProject(userId: string, projectId: string) {
  const result = await prisma.project.deleteMany({
    where: {
      id: projectId,
      student: { userId },
    },
  })
  if (result.count === 0) throw new Error("Project not found or unauthorized")
}

// =====================
// Internships
// =====================

/**
 * Add an internship to the student's profile
 */
export async function addInternship(
  userId: string,
  data: {
    companyName: string
    position: string
    duration: string
    description?: string | null
    certificateLink?: string | null
  }
) {
  const student = await getStudentOrThrow(userId)

  // Limit check (max 10)
  const count = await prisma.internship.count({
    where: { studentId: student.id },
  })
  if (count >= 10) throw new Error("Maximum 10 internships allowed")

  return prisma.internship.create({
    data: {
      studentId: student.id,
      companyName: data.companyName.trim(),
      position: data.position.trim(),
      duration: data.duration.trim(),
      description: data.description?.trim() || null,
      certificateLink: data.certificateLink?.trim() || null,
    },
  })
}

/**
 * Update an existing internship (partial update with ownership check)
 */
export async function updateInternship(
  userId: string,
  internshipId: string,
  data: {
    companyName?: string
    position?: string
    duration?: string
    description?: string | null
    certificateLink?: string | null
  }
) {
  const student = await getStudentOrThrow(userId)

  const existing = await prisma.internship.findUnique({
    where: { id: internshipId },
  })
  if (!existing) throw new Error("Internship not found")
  if (existing.studentId !== student.id)
    throw new Error("You can only update your own internships")

  return prisma.internship.update({
    where: { id: internshipId },
    data: {
      ...(data.companyName !== undefined && { companyName: data.companyName.trim() }),
      ...(data.position !== undefined && { position: data.position.trim() }),
      ...(data.duration !== undefined && { duration: data.duration.trim() }),
      ...(data.description !== undefined && { description: data.description?.trim() || null }),
      ...(data.certificateLink !== undefined && {
        certificateLink: data.certificateLink?.trim() || null,
      }),
    },
  })
}

/**
 * Remove an internship by ID with ownership check
 */
export async function removeInternship(userId: string, internshipId: string) {
  const student = await getStudentOrThrow(userId)

  const existing = await prisma.internship.findUnique({
    where: { id: internshipId },
  })
  if (!existing) throw new Error("Internship not found")
  if (existing.studentId !== student.id)
    throw new Error("You can only delete your own internships")

  await prisma.internship.delete({
    where: { id: internshipId },
  })
}
