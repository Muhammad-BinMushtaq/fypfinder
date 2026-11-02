import prisma from "@/lib/db";
import logger from "@/lib/logger";
import { notifyTaskAssigned } from "@/lib/push-service";

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";
export type MilestoneStatus = "UPCOMING" | "IN_PROGRESS" | "COMPLETED";
export type SupervisorStatus = "NOT_DECIDED" | "APPROACHED" | "CONFIRMED";

export interface FYPMilestoneItem {
  id: string;
  title: string;
  dueDate: string | null;
  status: MilestoneStatus;
  note: string | null;
}

export interface TaskExtraMeta {
  priority: TaskPriority;
  deliverableUrl: string | null;
  createdById?: string | null;
}

export interface GroupWorkspaceMeta {
  groupId: string;
  repoUrl: string | null;
  docsUrl: string | null;
  demoUrl: string | null;
  supervisorName: string | null;
  supervisorStatus: SupervisorStatus;
  domainTrack: string | null;
  milestones: FYPMilestoneItem[];
  taskMeta: Record<string, TaskExtraMeta>;
}

const DEFAULT_MILESTONES: FYPMilestoneItem[] = [
  {
    id: "m-1",
    title: "Idea & Supervisor Finalization",
    dueDate: null,
    status: "IN_PROGRESS",
    note: "Confirm FYP topic and supervisor approval",
  },
  {
    id: "m-2",
    title: "Proposal Defense & SRS Submission",
    dueDate: null,
    status: "UPCOMING",
    note: "Submit proposal document and defense slides",
  },
  {
    id: "m-3",
    title: "Mid-Semester Evaluation (FYP-I)",
    dueDate: null,
    status: "UPCOMING",
    note: "System architecture and 40% prototype demo",
  },
  {
    id: "m-4",
    title: "Final Defense & Thesis Report",
    dueDate: null,
    status: "UPCOMING",
    note: "Complete implementation, testing, and final report",
  },
];

let _workspaceMetaTableReady = false;
const _memoryWorkspaceMeta = new Map<string, GroupWorkspaceMeta>();

async function ensureWorkspaceMetaTable(): Promise<boolean> {
  if (_workspaceMetaTableReady) return true;
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "FYPGroupWorkspaceMeta" (
        "groupId" TEXT PRIMARY KEY,
        "repoUrl" TEXT,
        "docsUrl" TEXT,
        "demoUrl" TEXT,
        "supervisorName" TEXT,
        "supervisorStatus" TEXT NOT NULL DEFAULT 'NOT_DECIDED',
        "domainTrack" TEXT,
        "milestones" JSONB NOT NULL DEFAULT '[]'::jsonb,
        "taskMeta" JSONB NOT NULL DEFAULT '{}'::jsonb,
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    _workspaceMetaTableReady = true;
    return true;
  } catch (err) {
    logger.warn("[WorkspaceMeta] Falling back to in-memory store:", err);
    return false;
  }
}

function buildDefaultMeta(groupId: string): GroupWorkspaceMeta {
  return {
    groupId,
    repoUrl: null,
    docsUrl: null,
    demoUrl: null,
    supervisorName: null,
    supervisorStatus: "NOT_DECIDED",
    domainTrack: null,
    milestones: DEFAULT_MILESTONES.map((m) => ({ ...m })),
    taskMeta: {},
  };
}

export class WorkspaceService {
  static async getWorkspaceMeta(groupId: string): Promise<GroupWorkspaceMeta> {
    if (!groupId) return buildDefaultMeta("");

    try {
      const ok = await ensureWorkspaceMetaTable();
      if (ok) {
        const rows = await prisma.$queryRaw<
          Array<{
            groupId: string;
            repoUrl: string | null;
            docsUrl: string | null;
            demoUrl: string | null;
            supervisorName: string | null;
            supervisorStatus: string | null;
            domainTrack: string | null;
            milestones: any;
            taskMeta: any;
          }>
        >`
          SELECT "groupId", "repoUrl", "docsUrl", "demoUrl", "supervisorName", "supervisorStatus", "domainTrack", "milestones", "taskMeta"
          FROM "FYPGroupWorkspaceMeta"
          WHERE "groupId" = ${groupId}
          LIMIT 1
        `;

        if (rows.length > 0) {
          const r = rows[0];
          const parsedMilestones =
            typeof r.milestones === "string"
              ? JSON.parse(r.milestones)
              : r.milestones;
          const parsedTaskMeta =
            typeof r.taskMeta === "string"
              ? JSON.parse(r.taskMeta)
              : r.taskMeta;

          const meta: GroupWorkspaceMeta = {
            groupId,
            repoUrl: r.repoUrl || null,
            docsUrl: r.docsUrl || null,
            demoUrl: r.demoUrl || null,
            supervisorName: r.supervisorName || null,
            supervisorStatus:
              (r.supervisorStatus as SupervisorStatus) || "NOT_DECIDED",
            domainTrack: r.domainTrack || null,
            milestones:
              Array.isArray(parsedMilestones) && parsedMilestones.length > 0
                ? parsedMilestones
                : DEFAULT_MILESTONES.map((m) => ({ ...m })),
            taskMeta:
              parsedTaskMeta && typeof parsedTaskMeta === "object"
                ? parsedTaskMeta
                : {},
          };
          _memoryWorkspaceMeta.set(groupId, meta);
          return meta;
        }
      }
    } catch (err) {
      logger.warn("[WorkspaceMeta] Failed reading meta from DB:", err);
    }

    return _memoryWorkspaceMeta.get(groupId) || buildDefaultMeta(groupId);
  }

  static async saveWorkspaceMeta(
    groupId: string,
    partial: Partial<Omit<GroupWorkspaceMeta, "groupId">>
  ): Promise<GroupWorkspaceMeta> {
    const current = await this.getWorkspaceMeta(groupId);
    const updated: GroupWorkspaceMeta = {
      ...current,
      ...partial,
      groupId,
      milestones: partial.milestones ?? current.milestones,
      taskMeta: partial.taskMeta ?? current.taskMeta,
    };

    _memoryWorkspaceMeta.set(groupId, updated);

    try {
      const ok = await ensureWorkspaceMetaTable();
      if (ok) {
        const milestonesJson = JSON.stringify(updated.milestones);
        const taskMetaJson = JSON.stringify(updated.taskMeta);

        await prisma.$executeRaw`
          INSERT INTO "FYPGroupWorkspaceMeta" (
            "groupId",
            "repoUrl",
            "docsUrl",
            "demoUrl",
            "supervisorName",
            "supervisorStatus",
            "domainTrack",
            "milestones",
            "taskMeta",
            "updatedAt"
          )
          VALUES (
            ${groupId},
            ${updated.repoUrl},
            ${updated.docsUrl},
            ${updated.demoUrl},
            ${updated.supervisorName},
            ${updated.supervisorStatus},
            ${updated.domainTrack},
            ${milestonesJson}::jsonb,
            ${taskMetaJson}::jsonb,
            NOW()
          )
          ON CONFLICT ("groupId") DO UPDATE SET
            "repoUrl" = EXCLUDED."repoUrl",
            "docsUrl" = EXCLUDED."docsUrl",
            "demoUrl" = EXCLUDED."demoUrl",
            "supervisorName" = EXCLUDED."supervisorName",
            "supervisorStatus" = EXCLUDED."supervisorStatus",
            "domainTrack" = EXCLUDED."domainTrack",
            "milestones" = EXCLUDED."milestones",
            "taskMeta" = EXCLUDED."taskMeta",
            "updatedAt" = NOW()
        `;
      }
    } catch (err) {
      logger.warn("[WorkspaceMeta] Failed saving meta to DB:", err);
    }

    return updated;
  }

  static async getGroupTasks(groupId: string) {
    const [tasks, meta] = await Promise.all([
      prisma.fYPTask.findMany({
        where: { groupId },
        include: {
          assignedTo: {
            select: { id: true, name: true, profilePicture: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      this.getWorkspaceMeta(groupId),
    ]);

    return tasks.map((t) => {
      const extra = meta.taskMeta?.[t.id] || {
        priority: "MEDIUM" as TaskPriority,
        deliverableUrl: null,
      };
      return {
        ...t,
        priority: extra.priority || "MEDIUM",
        deliverableUrl: extra.deliverableUrl || null,
        createdById: extra.createdById || null,
      };
    });
  }

  static async createTask(
    groupId: string,
    data: {
      title: string;
      description?: string;
      assignedToId?: string;
      dueDate?: Date;
      priority?: TaskPriority;
      deliverableUrl?: string | null;
      creatorStudentId?: string;
    }
  ) {
    const group = await prisma.fYPGroup.findUnique({
      where: { id: groupId },
      include: {
        members: {
          include: {
            student: { select: { id: true, name: true } },
          },
        },
      },
    });
    if (!group) throw new Error("Group not found");

    const trimmedTitle = (data.title || "").trim();
    if (!trimmedTitle) throw new Error("Task title is required");

    const created = await prisma.fYPTask.create({
      data: {
        groupId,
        title: trimmedTitle,
        description: data.description?.trim() || null,
        assignedToId: data.assignedToId || null,
        dueDate: data.dueDate,
        status: "TODO",
      },
      include: {
        assignedTo: { select: { id: true, name: true, profilePicture: true } },
      },
    });

    const priority: TaskPriority = data.priority || "MEDIUM";
    const deliverableUrl = data.deliverableUrl?.trim() || null;

    const meta = await this.getWorkspaceMeta(groupId);
    const nextTaskMeta = {
      ...meta.taskMeta,
      [created.id]: {
        priority,
        deliverableUrl,
        createdById: data.creatorStudentId || null,
      },
    };
    await this.saveWorkspaceMeta(groupId, { taskMeta: nextTaskMeta });

    // Notify assignee (including self-assigned tasks for personal email record/testing)
    if (created.assignedToId) {
      const creatorMember = group.members.find(
        (m) => m.studentId === data.creatorStudentId
      );
      const assignerName = creatorMember?.student?.name || "Your Group Leader";

      await notifyTaskAssigned({
        toStudentId: created.assignedToId,
        assignedByName: assignerName,
        projectName: group.projectName || "FYP Project",
        taskTitle: created.title,
        taskDescription: created.description,
        dueDate: created.dueDate ? created.dueDate.toISOString() : null,
        priority,
      }).catch((err) => logger.warn("Task assignment notification error:", err));
    }

    return {
      ...created,
      priority,
      deliverableUrl,
      createdById: data.creatorStudentId || null,
    };
  }

  static async updateTask(
    taskId: string,
    studentId: string,
    data: {
      title?: string;
      description?: string;
      status?: string;
      assignedToId?: string | null;
      dueDate?: Date | null;
      priority?: TaskPriority;
      deliverableUrl?: string | null;
    }
  ) {
    const task = await prisma.fYPTask.findUnique({
      where: { id: taskId },
      include: {
        group: {
          include: {
            members: {
              include: {
                student: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
    });
    if (!task) throw new Error("Task not found");

    const isMember = task.group.members.some(
      (m: any) => m.studentId === studentId
    );
    if (!isMember) throw new Error("Not a group member");

    const previousAssigneeId = task.assignedToId;

    const updated = await prisma.fYPTask.update({
      where: { id: taskId },
      data: {
        ...(data.title !== undefined ? { title: data.title.trim() } : {}),
        ...(data.description !== undefined
          ? { description: data.description?.trim() || null }
          : {}),
        ...(data.status !== undefined ? { status: data.status } : {}),
        ...(data.assignedToId !== undefined
          ? { assignedToId: data.assignedToId }
          : {}),
        ...(data.dueDate !== undefined ? { dueDate: data.dueDate } : {}),
      },
      include: {
        assignedTo: { select: { id: true, name: true, profilePicture: true } },
      },
    });

    const meta = await this.getWorkspaceMeta(task.groupId);
    const existingExtra = meta.taskMeta?.[taskId] || {
      priority: "MEDIUM" as TaskPriority,
      deliverableUrl: null,
    };

    const nextExtra: TaskExtraMeta = {
      priority: data.priority ?? existingExtra.priority ?? "MEDIUM",
      deliverableUrl:
        data.deliverableUrl !== undefined
          ? data.deliverableUrl?.trim() || null
          : existingExtra.deliverableUrl || null,
      createdById: existingExtra.createdById || null,
    };

    await this.saveWorkspaceMeta(task.groupId, {
      taskMeta: {
        ...meta.taskMeta,
        [taskId]: nextExtra,
      },
    });

    // If assignee was set or changed, send notification (including self-assignment)
    if (
      updated.assignedToId &&
      updated.assignedToId !== previousAssigneeId
    ) {
      const updaterMember = task.group.members.find(
        (m: any) => m.studentId === studentId
      );
      const assignerName = updaterMember?.student?.name || "Your Group Leader";

      await notifyTaskAssigned({
        toStudentId: updated.assignedToId,
        assignedByName: assignerName,
        projectName: task.group.projectName || "FYP Project",
        taskTitle: updated.title,
        taskDescription: updated.description,
        dueDate: updated.dueDate ? updated.dueDate.toISOString() : null,
        priority: nextExtra.priority,
      }).catch((err) => logger.warn("Task assignment notification error:", err));
    }

    return {
      ...updated,
      priority: nextExtra.priority,
      deliverableUrl: nextExtra.deliverableUrl,
      createdById: nextExtra.createdById,
    };
  }

  static async deleteTask(taskId: string, studentId: string) {
    const task = await prisma.fYPTask.findUnique({
      where: { id: taskId },
      include: { group: { include: { members: true } } },
    });
    if (!task) throw new Error("Task not found");

    const isMember = task.group.members.some(
      (m: any) => m.studentId === studentId
    );
    if (!isMember) throw new Error("Not a group member");

    return await prisma.fYPTask.delete({ where: { id: taskId } });
  }
}
