import { NextResponse } from "next/server"
import prisma from "@/lib/db"
import { requireRole } from "@/lib/auth"
import { UserRole } from "@/lib/generated/prisma/enums"
import { acceptPartnerRequest } from "@/modules/request/request.service"

export async function POST(req: Request) {
  try {
    // 🔐 Auth + role
    const user = await requireRole(UserRole.STUDENT)

    const body = await req.json()
    const { requestId } = body

    if (!requestId) {
      return NextResponse.json(
        { success: false, message: "Request ID is required" },
        { status: 400 }
      )
    }

    // 🔗 Get current student
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

    // ✅ Accept partner request
    const request = await acceptPartnerRequest(
      requestId,
      student.id
    )

    console.log("Partner request accepted:", request)
    return NextResponse.json(
      {
        success: true,
        message: "Partner request accepted",
        data: request,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error("Accept partner request error:", error)

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Unable to accept request",
      },
      { status: 400 }
    )
  }
}
