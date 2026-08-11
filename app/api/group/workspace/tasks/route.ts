import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { UserRole } from "@/lib/generated/prisma/enums";
import { WorkspaceService } from "@/modules/workspace/workspace.service";
import prisma from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(UserRole.STUDENT);
    const student = await prisma.student.findUnique({ where: { userId: user.id }, select: { id: true } });
    if (!student) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const member = await prisma.fYPGroupMember.findUnique({
      where: { studentId: student.id },
      include: { group: true },
    });

    if (!member) {
      return NextResponse.json({ success: false, message: "No group found" }, { status: 404 });
    }

    const tasks = await WorkspaceService.getGroupTasks(member.groupId);
    return NextResponse.json({ success: true, data: tasks });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(UserRole.STUDENT);
    const student = await prisma.student.findUnique({ where: { userId: user.id }, select: { id: true } });
    if (!student) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const member = await prisma.fYPGroupMember.findUnique({
      where: { studentId: student.id },
      include: { group: true },
    });

    if (!member) {
      return NextResponse.json({ success: false, message: "No group found" }, { status: 404 });
    }

    if (!member.group.isLocked) {
      return NextResponse.json({ success: false, message: "Group must be locked" }, { status: 403 });
    }

    const body = await req.json();
    const task = await WorkspaceService.createTask(member.groupId, {
      title: body.title,
      description: body.description,
      assignedToId: body.assignedToId,
      dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
    });

    return NextResponse.json({ success: true, data: task });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
