import { NextResponse } from "next/server"
import { requireAuth, requireRole } from "@/lib/auth"
import prisma from "@/lib/db"
import { UserRole } from "@/lib/generated/prisma/enums"

export async function GET() {
    try {

        // const user= await requireAuth()

        const currentUser = await requireRole(UserRole.STUDENT)

        //  Fetch student profile by userId
        const student = await prisma.student.findUnique({
            where: { userId: currentUser.id },
            include: {
                skills: {
                    
                },
                projects: true,
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

        //  Return full private profile
        return NextResponse.json(
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
                },
            },
            { status: 200 }
        )
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
