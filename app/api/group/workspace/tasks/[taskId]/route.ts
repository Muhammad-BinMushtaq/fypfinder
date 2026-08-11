import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { UserRole } from "@/lib/generated/prisma/enums";
import { WorkspaceService } from "@/modules/workspace/workspace.service";
import prisma from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ taskId: string }> }) {
  try {
    const resolvedParams = await params;
    const user = await requireRole(UserRole.STUDENT);
    const student = await prisma.student.findUnique({ where: { userId: user.id }, select: { id: true } });
    if (!student) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const task = await WorkspaceService.updateTask(resolvedParams.taskId, student.id, {
      title: body.title,
      description: body.description,
      status: body.status,
      assignedToId: body.assignedToId,
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
    });

    return NextResponse.json({ success: true, data: task });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ taskId: string }> }) {
  try {
    const resolvedParams = await params;
    const user = await requireRole(UserRole.STUDENT);
    const student = await prisma.student.findUnique({ where: { userId: user.id }, select: { id: true } });
    if (!student) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    await WorkspaceService.deleteTask(resolvedParams.taskId, student.id);

    return NextResponse.json({ success: true, data: { deleted: true } });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
