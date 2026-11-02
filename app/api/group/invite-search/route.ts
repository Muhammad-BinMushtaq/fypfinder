import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { UserRole } from "@/lib/generated/prisma/enums";
import prisma from "@/lib/db";
import {
  searchStudentsForGroupInvite,
  createInitialGroup,
} from "@/modules/group/group.service";
import { sendPartnerRequest } from "@/modules/request/request.service";

export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(UserRole.STUDENT);
    const student = await prisma.student.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });

    if (!student) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const q = req.nextUrl.searchParams.get("q") || "";
    const results = await searchStudentsForGroupInvite(student.id, q);

    return NextResponse.json({ success: true, data: results });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Search failed" },
      { status: 400 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(UserRole.STUDENT);
    const student = await prisma.student.findUnique({
      where: { userId: user.id },
      select: { id: true, name: true },
    });

    if (!student) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    if (body.action === "CREATE_GROUP") {
      const group = await createInitialGroup(
        student.id,
        body.projectName || `${student.name}'s FYP Project`,
        body.description
      );
      return NextResponse.json({
        success: true,
        message: "FYP Project space initialized",
        data: group,
      });
    }

    // Default action: INVITE collaborator
    if (!body.toStudentId) {
      return NextResponse.json(
        { success: false, message: "Target student is required" },
        { status: 400 }
      );
    }

    const reason =
      body.reason?.trim() ||
      `Invited to join our FYP team from FYP Management workspace.`;

    const request = await sendPartnerRequest(
      student.id,
      body.toStudentId,
      reason
    );

    return NextResponse.json({
      success: true,
      message: "Partner invitation sent",
      data: request,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Action failed" },
      { status: 400 }
    );
  }
}
