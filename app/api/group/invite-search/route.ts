import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { UserRole, RequestType, RequestStatus } from "@/lib/generated/prisma/enums";
import prisma from "@/lib/db";
import {
  searchStudentsForGroupInvite,
  createInitialGroup,
} from "@/modules/group/group.service";
import { sendPartnerRequest } from "@/modules/request/request.service";
import { isEmailConfigured, sendSingleEmail } from "@/lib/email";
import { buildCollaboratorInviteEmail } from "@/lib/email-templates";

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
      include: {
        groupMember: {
          include: {
            group: true,
          },
        },
      },
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

    if (body.action === "RESEND_INVITE") {
      if (!body.requestId) {
        return NextResponse.json(
          { success: false, message: "Request ID is required" },
          { status: 400 }
        );
      }

      const pendingReq = await prisma.request.findUnique({
        where: { id: body.requestId },
        include: {
          toStudent: {
            include: {
              user: { select: { email: true, status: true } },
            },
          },
          fromStudent: {
            select: { name: true, department: true, currentSemester: true },
          },
        },
      });

      if (!pendingReq || pendingReq.status !== RequestStatus.PENDING) {
        return NextResponse.json(
          { success: false, message: "Pending invitation not found" },
          { status: 404 }
        );
      }

      if (!isEmailConfigured() || !pendingReq.toStudent?.user?.email) {
        return NextResponse.json(
          { success: false, message: "Recipient email is not available" },
          { status: 400 }
        );
      }

      const projectName = student.groupMember?.group?.projectName || "FYP Project Team";
      const { subject, html } = buildCollaboratorInviteEmail({
        toName: pendingReq.toStudent.name,
        inviterName: student.name,
        inviterDepartment: student.department,
        inviterSemester: student.currentSemester,
        projectName,
        note: pendingReq.reason,
      });

      const emailRes = await sendSingleEmail({
        to: pendingReq.toStudent.user.email,
        subject,
        html,
        studentId: pendingReq.toStudent.id,
        category: "TRANSACTIONAL",
        templateKey: "collaboratorInvite",
      });

      if (!emailRes.success) {
        return NextResponse.json(
          { success: false, message: emailRes.error || "Failed to send email" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: `Invitation email sent to ${pendingReq.toStudent.name} (${pendingReq.toStudent.user.email})`,
      });
    }

    if (body.action === "CANCEL_INVITE") {
      if (!body.requestId) {
        return NextResponse.json(
          { success: false, message: "Request ID is required" },
          { status: 400 }
        );
      }

      await prisma.request.deleteMany({
        where: {
          id: body.requestId,
          type: RequestType.PARTNER,
          status: RequestStatus.PENDING,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Pending invitation withdrawn",
      });
    }

    // Default action: INVITE collaborator
    if (!body.toStudentId) {
      return NextResponse.json(
        { success: false, message: "Target student is required" },
        { status: 400 }
      );
    }

    const projectName = student.groupMember?.group?.projectName || "FYP Project";
    const reason =
      body.reason?.trim() ||
      `Invited to join "${projectName}" as an FYP collaborator.`;

    const request = await sendPartnerRequest(
      student.id,
      body.toStudentId,
      reason
    );

    const targetStudent = await prisma.student.findUnique({
      where: { id: body.toStudentId },
      select: {
        id: true,
        name: true,
        user: { select: { email: true } },
      },
    });

    return NextResponse.json({
      success: true,
      message: targetStudent?.user?.email
        ? `Invitation & email sent to ${targetStudent.name} (${targetStudent.user.email})`
        : `Invitation sent to ${targetStudent?.name || "student"}`,
      data: request,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Action failed" },
      { status: 400 }
    );
  }
}
