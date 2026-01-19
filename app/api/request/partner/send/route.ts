import { NextResponse } from "next/server"
import prisma from "@/lib/db"
import { requireRole } from "@/lib/auth"
import { UserRole } from "@/lib/generated/prisma/enums"
import { sendPartnerRequest } from "@/modules/request/request.service"

export async function POST(req: Request) {
  try {
    // 🔐 Auth + role
    const user = await requireRole(UserRole.STUDENT)

    const body = await req.json()
    const { toStudentId } = body

    if (!toStudentId) {
      return NextResponse.json(
        { success: false, message: "Target student ID is required" },
        { status: 400 }
      )
    }

    // 🔗 Fetch sender student
    const student = await prisma.student.findUnique({
      where: { userId: user.id },
      select: { id: true },
    })

    if (!student) {
      return NextResponse.json(
        { success: false, message: "Student profile not found" },
        { status: 404 }
      )
    }

    // 📩 Send partner request
    const request = await sendPartnerRequest(
      student.id,
      toStudentId
    )

    console.log("Partner request sent:", request)
    return NextResponse.json(
      {
        success: true,
        message: "Partner request sent",
        data: request,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("Send partner request error:", error)

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Bad request",
      },
      { status: 400 }
    )
  }
}
