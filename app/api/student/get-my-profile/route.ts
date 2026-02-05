import { NextResponse } from "next/server"
import { requireAuth, requireRole } from "@/lib/auth"
import prisma from "@/lib/db"
import { UserRole } from "@/lib/generated/prisma/enums"

export async function GET() {
    try {
        const currentUser = await requireRole(UserRole.STUDENT)

        // ✅ Optimized: Single query with select for only needed fields
        const student = await prisma.student.findUnique({
            where: { userId: currentUser.id },
            select: {
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
            },
        })

        if (!student) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Student profile not found",
                    data: null,
                },
                { status: 404 }
            )
        }

        // ✅ Add cache headers: Allow client to cache for 5 minutes
        const response = NextResponse.json(
            {
                success: true,
                message: "Profile fetched",
                data: {
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
                    skills: student.skills,
                    projects: student.projects,
                    user: student.user,
                },
            },
            { status: 200 }
        )

        // ✅ No-cache to ensure fresh data after mutations
        response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate")
        return response
    } catch (error) {
        // console.error("Get my profile error:", error)

        return NextResponse.json(
            {
                success: false,
                message: "Unauthorized: not logged in",
                data: null,
            },
            { status: 401 }
        )
    }
}
