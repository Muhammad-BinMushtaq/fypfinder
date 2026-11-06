import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { UserRole } from "@/lib/generated/prisma/enums";
import { WorkspaceService } from "@/modules/workspace/workspace.service";
import prisma from "@/lib/db";

export async function GET(_req: NextRequest) {
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

    const member = await prisma.fYPGroupMember.findUnique({
      where: { studentId: student.id },
      select: { groupId: true },
    });

    if (!member) {
      return NextResponse.json(
        { success: false, message: "No group found" },
        { status: 404 }
      );
    }

    const meta = await WorkspaceService.getWorkspaceMeta(member.groupId);
    return NextResponse.json({ success: true, data: meta });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
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

    const member = await prisma.fYPGroupMember.findUnique({
      where: { studentId: student.id },
      select: { groupId: true },
    });

    if (!member) {
      return NextResponse.json(
        { success: false, message: "No group found" },
        { status: 404 }
      );
    }

    const body = await req.json();

    // If projectName is provided, atomically update the FYPGroup record in the same request
    if (body.projectName !== undefined) {
      const trimmedProjectName = String(body.projectName || "").trim();
      if (!trimmedProjectName) {
        return NextResponse.json(
          { success: false, message: "Project title is required" },
          { status: 400 }
        );
      }
      if (trimmedProjectName.length > 100) {
        return NextResponse.json(
          {
            success: false,
            message: "Project title must be 100 characters or less",
          },
          { status: 400 }
        );
      }

      const trimmedDesc =
        body.description !== undefined
          ? String(body.description || "").trim() || null
          : undefined;

      if (trimmedDesc && trimmedDesc.length > 500) {
        return NextResponse.json(
          {
            success: false,
            message: "Description must be 500 characters or less",
          },
          { status: 400 }
        );
      }

      await prisma.fYPGroup.update({
        where: { id: member.groupId },
        data: {
          projectName: trimmedProjectName,
          ...(trimmedDesc !== undefined ? { description: trimmedDesc } : {}),
        },
      });
    }

    const updated = await WorkspaceService.saveWorkspaceMeta(member.groupId, {
      ...(body.repoUrl !== undefined
        ? { repoUrl: body.repoUrl?.trim() || null }
        : {}),
      ...(body.docsUrl !== undefined
        ? { docsUrl: body.docsUrl?.trim() || null }
        : {}),
      ...(body.demoUrl !== undefined
        ? { demoUrl: body.demoUrl?.trim() || null }
        : {}),
      ...(body.supervisorName !== undefined
        ? { supervisorName: body.supervisorName?.trim() || null }
        : {}),
      ...(body.supervisorStatus !== undefined
        ? { supervisorStatus: body.supervisorStatus }
        : {}),
      ...(body.domainTrack !== undefined
        ? { domainTrack: body.domainTrack?.trim() || null }
        : {}),
      ...(Array.isArray(body.milestones)
        ? { milestones: body.milestones }
        : {}),
      ...(Array.isArray(body.customLinks)
        ? { customLinks: body.customLinks }
        : {}),
      ...(body.memberRoles && typeof body.memberRoles === "object"
        ? { memberRoles: body.memberRoles }
        : {}),
      ...(Array.isArray(body.supervisorMeetings)
        ? { supervisorMeetings: body.supervisorMeetings }
        : {}),
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
