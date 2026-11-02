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
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
