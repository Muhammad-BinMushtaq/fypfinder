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
  milestoneId?: string | null;
  createdById?: string | null;
}

export interface CustomResourceLink {
  id: string;
  label: string;
  url: string;
  category?: "THESIS" | "SLIDES" | "DATASET" | "OTHER";
}

export interface SupervisorActionItem {
  id: string;
  text: string;
  completed: boolean;
  linkedTaskId?: string | null;
}

export interface SupervisorMeetingItem {
  id: string;
  date: string;
  summary: string;
  actionItems: SupervisorActionItem[];
  createdByName?: string | null;
  createdAt: string;
}

export interface WorkspaceExtraData {
  customLinks: CustomResourceLink[];
  memberRoles: Record<string, string>;
  supervisorMeetings: SupervisorMeetingItem[];
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
  customLinks: CustomResourceLink[];
  memberRoles: Record<string, string>;
  supervisorMeetings: SupervisorMeetingItem[];
}

export function sanitizeExternalUrl(raw?: string | null): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    const parsed = new URL(
      trimmed.startsWith("http://") || trimmed.startsWith("https://")
        ? trimmed
        : `https://${trimmed}`
    );
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
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
    note: "Submit proposal document and SRS specification",
  },
  {
    id: "m-3",
    title: "Mid-Semester Evaluation (Prototype)",
    dueDate: null,
    status: "UPCOMING",
    note: "System architecture and core prototype demo",
  },
  {
    id: "m-4",
    title: "Final Defense & Thesis Report",
    dueDate: null,
    status: "UPCOMING",
    note: "Complete implementation, testing, and final thesis",
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
        "extraData" JSONB NOT NULL DEFAULT '{}'::jsonb,
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "FYPGroupWorkspaceMeta"
      ADD COLUMN IF NOT EXISTS "extraData" JSONB NOT NULL DEFAULT '{}'::jsonb;
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
    customLinks: [],
    memberRoles: {},
    supervisorMeetings: [],
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
            extraData: any;
          }>
        >`
          SELECT "groupId", "repoUrl", "docsUrl", "demoUrl", "supervisorName", "supervisorStatus", "domainTrack", "milestones", "taskMeta", "extraData"
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
          const parsedExtra =
            typeof r.extraData === "string"
              ? JSON.parse(r.extraData)
              : r.extraData || {};

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
            customLinks: Array.isArray(parsedExtra?.customLinks)
              ? parsedExtra.customLinks
              : [],
            memberRoles:
              parsedExtra?.memberRoles &&
              typeof parsedExtra.memberRoles === "object"
                ? parsedExtra.memberRoles
                : {},
            supervisorMeetings: Array.isArray(parsedExtra?.supervisorMeetings)
              ? parsedExtra.supervisorMeetings
              : [],
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

    const sanitizedCustomLinks =
      partial.customLinks !== undefined
        ? partial.customLinks
            .map((link) => {
              const validUrl = sanitizeExternalUrl(link.url);
              if (!validUrl || !link.label?.trim()) return null;
              return {
                id: link.id || `link-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                label: link.label.trim().slice(0, 60),
                url: validUrl,
                category: link.category || "OTHER",
              };
            })
            .filter((item): item is NonNullable<typeof item> => item !== null)
            .slice(0, 8)
        : current.customLinks;

    const sanitizedMemberRoles =
      partial.memberRoles !== undefined
        ? Object.fromEntries(
            Object.entries(partial.memberRoles)
              .map(([k, v]) => [k, (v || "").trim().slice(0, 50)])
              .filter(([, v]) => v.length > 0)
          )
        : current.memberRoles;

    const sanitizedMeetings =
      partial.supervisorMeetings !== undefined
        ? partial.supervisorMeetings.slice(0, 50)
        : current.supervisorMeetings;

    const updated: GroupWorkspaceMeta = {
      ...current,
      ...partial,
      groupId,
      repoUrl:
        partial.repoUrl !== undefined
          ? sanitizeExternalUrl(partial.repoUrl)
          : current.repoUrl,
      docsUrl:
        partial.docsUrl !== undefined
          ? sanitizeExternalUrl(partial.docsUrl)
          : current.docsUrl,
      demoUrl:
        partial.demoUrl !== undefined
          ? sanitizeExternalUrl(partial.demoUrl)
          : current.demoUrl,
      milestones: partial.milestones ?? current.milestones,
      taskMeta: partial.taskMeta ?? current.taskMeta,
      customLinks: sanitizedCustomLinks,
      memberRoles: sanitizedMemberRoles,
      supervisorMeetings: sanitizedMeetings,
    };

    _memoryWorkspaceMeta.set(groupId, updated);

    try {
      const ok = await ensureWorkspaceMetaTable();
      if (ok) {
        const milestonesJson = JSON.stringify(updated.milestones);
        const taskMetaJson = JSON.stringify(updated.taskMeta);
        const extraDataJson = JSON.stringify({
          customLinks: updated.customLinks,
          memberRoles: updated.memberRoles,
          supervisorMeetings: updated.supervisorMeetings,
        });

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
            "extraData",
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
            ${extraDataJson}::jsonb,
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
            "taskMeta" = CASE
              WHEN ${partial.taskMeta !== undefined} THEN EXCLUDED."taskMeta"
              ELSE "FYPGroupWorkspaceMeta"."taskMeta"
            END,
            "extraData" = EXCLUDED."extraData",
            "updatedAt" = NOW()
        `;
      }
    } catch (err) {
      logger.warn("[WorkspaceMeta] Failed saving meta to DB:", err);
    }

    return updated;
  }

  /**
   * Atomically updates a single task's metadata key inside `"FYPGroupWorkspaceMeta"."taskMeta"`
   * using PostgreSQL `jsonb_set`, preventing concurrent read-modify-write lost updates.
   */
  static async setSingleTaskMetaAtomically(
    groupId: string,
    taskId: string,
    extra: TaskExtraMeta
  ): Promise<void> {
    const current = _memoryWorkspaceMeta.get(groupId);
    if (current) {
      current.taskMeta = { ...current.taskMeta, [taskId]: extra };
    }

    try {
      const ok = await ensureWorkspaceMetaTable();
      if (!ok) return;

      const defaultMilestonesJson = JSON.stringify(DEFAULT_MILESTONES);
      const entryJson = JSON.stringify(extra);
      const initialMapJson = JSON.stringify({ [taskId]: extra });

      await prisma.$executeRaw`
        INSERT INTO "FYPGroupWorkspaceMeta" (
          "groupId",
          "milestones",
          "taskMeta",
          "extraData",
          "updatedAt"
        )
        VALUES (
          ${groupId},
          ${defaultMilestonesJson}::jsonb,
          ${initialMapJson}::jsonb,
          '{}'::jsonb,
          NOW()
        )
        ON CONFLICT ("groupId") DO UPDATE SET
          "taskMeta" = jsonb_set(
            COALESCE("FYPGroupWorkspaceMeta"."taskMeta", '{}'::jsonb),
            ARRAY[${taskId}],
            ${entryJson}::jsonb,
            true
          ),
          "updatedAt" = NOW()
      `;
    } catch (err) {
      logger.warn("[WorkspaceMeta] Atomic taskMeta update failed:", err);
    }
  }

  /**
   * Atomically removes a deleted task's metadata entry from `"FYPGroupWorkspaceMeta"."taskMeta"`.
   */
  static async removeSingleTaskMetaAtomically(
    groupId: string,
    taskId: string
  ): Promise<void> {
    const current = _memoryWorkspaceMeta.get(groupId);
    if (current && current.taskMeta) {
      const next = { ...current.taskMeta };
      delete next[taskId];
      current.taskMeta = next;
    }

    try {
      const ok = await ensureWorkspaceMetaTable();
      if (!ok) return;

      await prisma.$executeRaw`
        UPDATE "FYPGroupWorkspaceMeta"
        SET "taskMeta" = COALESCE("taskMeta", '{}'::jsonb) - ${taskId},
            "updatedAt" = NOW()
        WHERE "groupId" = ${groupId}
      `;
    } catch (err) {
      logger.warn("[WorkspaceMeta] Atomic taskMeta removal failed:", err);
    }
  }

  /**
   * Deletes the workspace metadata row when a 1-member group is dissolved.
   */
  static async deleteWorkspaceMeta(groupId: string): Promise<void> {
    _memoryWorkspaceMeta.delete(groupId);
    try {
      const ok = await ensureWorkspaceMetaTable();
      if (!ok) return;
      await prisma.$executeRaw`
        DELETE FROM "FYPGroupWorkspaceMeta"
        WHERE "groupId" = ${groupId}
      `;
    } catch (err) {
      logger.warn("[WorkspaceMeta] Failed deleting workspace meta:", err);
    }
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
        milestoneId: null,
      };
      return {
        ...t,
        priority: extra.priority || "MEDIUM",
        deliverableUrl: extra.deliverableUrl || null,
        milestoneId: extra.milestoneId || null,
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
      milestoneId?: string | null;
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
    const deliverableUrl = sanitizeExternalUrl(data.deliverableUrl);
    const milestoneId = data.milestoneId?.trim() || null;

    await this.setSingleTaskMetaAtomically(groupId, created.id, {
      priority,
      deliverableUrl,
      milestoneId,
      createdById: data.creatorStudentId || null,
    });

    // Notify assignee (including self-assigned tasks for personal email record)
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
      milestoneId,
      createdById: data.creatorStudentId || null,
    };
  }

  /**
   * Batch creates starter checklist tasks for a group without spamming emails.
   */
  static async createBatchTasks(
    groupId: string,
    creatorStudentId: string,
    items: Array<{
      title: string;
      description?: string;
      priority?: TaskPriority;
      milestoneId?: string | null;
    }>
  ) {
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error("No starter tasks selected");
    }

    const validItems = items
      .map((item) => ({
        title: (item.title || "").trim().slice(0, 160),
        description: item.description?.trim().slice(0, 600) || null,
        priority: (item.priority || "MEDIUM") as TaskPriority,
        milestoneId: item.milestoneId?.trim() || null,
      }))
      .filter((item) => item.title.length > 0)
      .slice(0, 20);

    if (validItems.length === 0) {
      throw new Error("No valid tasks provided");
    }

    const createdTasks = await prisma.$transaction(
      validItems.map((item) =>
        prisma.fYPTask.create({
          data: {
            groupId,
            title: item.title,
            description: item.description,
            status: "TODO",
          },
          include: {
            assignedTo: {
              select: { id: true, name: true, profilePicture: true },
            },
          },
        })
      )
    );

    const meta = await this.getWorkspaceMeta(groupId);
    const nextTaskMeta = { ...meta.taskMeta };

    createdTasks.forEach((created, idx) => {
      const source = validItems[idx];
      nextTaskMeta[created.id] = {
        priority: source.priority,
        deliverableUrl: null,
        milestoneId: source.milestoneId,
        createdById: creatorStudentId,
      };
    });

    await this.saveWorkspaceMeta(groupId, { taskMeta: nextTaskMeta });

    return createdTasks.map((created, idx) => ({
      ...created,
      priority: validItems[idx].priority,
      deliverableUrl: null,
      milestoneId: validItems[idx].milestoneId,
      createdById: creatorStudentId,
    }));
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
      milestoneId?: string | null;
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
      milestoneId: null,
    };

    const nextExtra: TaskExtraMeta = {
      priority: data.priority ?? existingExtra.priority ?? "MEDIUM",
      deliverableUrl:
        data.deliverableUrl !== undefined
          ? sanitizeExternalUrl(data.deliverableUrl)
          : existingExtra.deliverableUrl || null,
      milestoneId:
        data.milestoneId !== undefined
          ? data.milestoneId?.trim() || null
          : existingExtra.milestoneId || null,
      createdById: existingExtra.createdById || null,
    };

    await this.setSingleTaskMetaAtomically(task.groupId, taskId, nextExtra);

    // If assignee was set or changed, send notification
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
      milestoneId: nextExtra.milestoneId,
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

    const deleted = await prisma.fYPTask.delete({ where: { id: taskId } });
    await this.removeSingleTaskMetaAtomically(task.groupId, taskId);
    return deleted;
  }
}
