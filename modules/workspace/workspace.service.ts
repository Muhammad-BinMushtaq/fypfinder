import prisma from "@/lib/db";

export class WorkspaceService {
  static async getGroupTasks(groupId: string) {
    return await prisma.fYPTask.findMany({
      where: { groupId },
      include: {
        assignedTo: {
          select: { id: true, name: true, profilePicture: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async createTask(
    groupId: string,
    data: { title: string; description?: string; assignedToId?: string; dueDate?: Date }
  ) {
    const group = await prisma.fYPGroup.findUnique({ where: { id: groupId } });
    if (!group?.isLocked) throw new Error("Group must be locked to create tasks");

    return await prisma.fYPTask.create({
      data: {
        groupId,
        title: data.title,
        description: data.description,
        assignedToId: data.assignedToId,
        dueDate: data.dueDate,
        status: "TODO",
      },
      include: {
        assignedTo: { select: { id: true, name: true, profilePicture: true } },
      },
    });
  }

  static async updateTask(
    taskId: string,
    studentId: string,
    data: { title?: string; description?: string; status?: string; assignedToId?: string | null; dueDate?: Date | null }
  ) {
    const task = await prisma.fYPTask.findUnique({
      where: { id: taskId },
      include: { group: { include: { members: true } } },
    });
    if (!task) throw new Error("Task not found");

    const isMember = task.group.members.some((m: any) => m.studentId === studentId);
    if (!isMember) throw new Error("Not a group member");

    return await prisma.fYPTask.update({
      where: { id: taskId },
      data,
      include: {
        assignedTo: { select: { id: true, name: true, profilePicture: true } },
      },
    });
  }

  static async deleteTask(taskId: string, studentId: string) {
    const task = await prisma.fYPTask.findUnique({
      where: { id: taskId },
      include: { group: { include: { members: true } } },
    });
    if (!task) throw new Error("Task not found");

    const isMember = task.group.members.some((m: any) => m.studentId === studentId);
    if (!isMember) throw new Error("Not a group member");

    return await prisma.fYPTask.delete({ where: { id: taskId } });
  }
}
