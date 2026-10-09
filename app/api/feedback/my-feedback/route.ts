// app/api/feedback/my-feedback/route.ts
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { UserRole } from "@/lib/generated/prisma/enums";
import prisma from "@/lib/db";
import logger from "@/lib/logger";

export async function GET() {
  try {
    const currentUser = await requireRole(UserRole.STUDENT);

    const student = await prisma.student.findUnique({
      where: { userId: currentUser.id },
      select: { id: true, name: true, department: true, currentSemester: true },
    });

    if (!student) {
      return NextResponse.json(
        { success: false, message: "Student profile not found", data: null },
        { status: 404 }
      );
    }

    // Check for an active ticket (PENDING or IN_PROGRESS)
    const activeTicket = await prisma.feedback.findFirst({
      where: {
        studentId: student.id,
        status: { in: ["PENDING", "IN_PROGRESS"] },
      },
      orderBy: { createdAt: "desc" },
    });

    // Check for the most recent completed ticket (IMPLEMENTED, RESOLVED, REJECTED)
    const latestResolvedTicket = await prisma.feedback.findFirst({
      where: {
        studentId: student.id,
        status: { in: ["IMPLEMENTED", "RESOLVED", "REJECTED"] },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          activeTicket,
          latestResolvedTicket,
          canSubmitNew: !activeTicket,
        },
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
      }
    );
  } catch (error: any) {
    logger.error("Error fetching student feedback:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Unauthorized" },
      { status: 401 }
    );
  }
}
