import { requireRole } from "@/lib/auth"
import prisma from "@/lib/db"
import { UserRole } from "@/lib/generated/prisma/enums"
import { NextResponse } from "next/server"

export async function DELETE(req: Request) {
    try {
        // 🔐 Auth
        const user = await requireRole(UserRole.STUDENT)

        const body = await req.json()
        const { skillId } = body

        if (!skillId) {
            return NextResponse.json(
                { success: false, message: "Project ID is required" },
                { status: 400 }
            )
        }

        //  Get student
        const student = await prisma.student.findUnique({
            where: { userId: user.id },
        })

        if (!student) {
            return NextResponse.json(
                { success: false, message: "Student profile not found" },
                { status: 404 }
            )
        }

        //  Ownership check
        const skill = await prisma.skill.findFirst({
            where: {
                id: skillId
            },
        })

        if (!skill) {
            return NextResponse.json(
                { success: false, message: "Skill not found or unauthorized" },
                { status: 404 }
            )
        }

        // console.log(`${skill?.name}skill deleted successfully`)
        // 🗑 Delete skill
        await prisma.skill.delete({
            where: { id: skillId },
        })

        return NextResponse.json(
            {
                success: true,
                message: `${skill.name}skill deleted successfully`,
            },
            { status: 200 }
        )


    } catch (error: any) {
        console.error("Delete skill error:", error)

        return NextResponse.json(
            {
                success: false,
                message: error.message || "Internal server error",
            },
            { status: 500 }
        )
    }
}
