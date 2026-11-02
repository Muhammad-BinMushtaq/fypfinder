"use client";

import { useState } from "react";
import { Plus, LayoutGrid, List, ExternalLink, Calendar, User } from "lucide-react";
import { toast } from "react-toastify";
import { useGroupTasks, useCreateTask, useUpdateTask, useDeleteTask } from "@/services/workspace.service";
import type { FYPTask } from "@/services/workspace.service";
import { TaskCard } from "./TaskCard";
import { TaskDetailModal } from "./TaskDetailModal";

interface KanbanBoardProps {
  groupId: string;
  members: any[];
  previewMode?: boolean;
}

const COLUMNS = [
  { id: "TODO", title: "To Do", bg: "bg-slate-50/90 dark:bg-slate-800/30 border border-slate-200/70 dark:border-slate-800/60" },
  { id: "IN_PROGRESS", title: "In Progress", bg: "bg-slate-50/90 dark:bg-slate-800/30 border border-slate-200/70 dark:border-slate-800/60" },
  { id: "REVIEW", title: "Under Review", bg: "bg-slate-50/90 dark:bg-slate-800/30 border border-slate-200/70 dark:border-slate-800/60" },
  { id: "DONE", title: "Completed", bg: "bg-slate-50/90 dark:bg-slate-800/30 border border-slate-200/70 dark:border-slate-800/60" },
];

const PREVIEW_TASKS: FYPTask[] = [
  {
    id: "preview-1",
    groupId: "preview-group",
    title: "Literature Review & Research Paper Survey",
    description: "Survey 10-15 peer-reviewed papers on transformer architectures, accuracy trade-offs, and defense benchmarks for proposal documentation.",
    status: "TODO",
    priority: "HIGH",
    assignedToId: "preview-m1",
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    assignedTo: { id: "preview-m1", name: "Ayesha Malik", profilePicture: null },
  },
  {
    id: "preview-2",
    groupId: "preview-group",
    title: "System Architecture & API Schema Design",
    description: "Draft comprehensive system architecture diagrams, sequence charts, and PostgreSQL entity-relationship models for midterm review.",
    status: "IN_PROGRESS",
    priority: "HIGH",
    assignedToId: "preview-m2",
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    assignedTo: { id: "preview-m2", name: "Hamza Tariq", profilePicture: null },
  },
  {
    id: "preview-3",
    groupId: "preview-group",
    title: "Mid-Term Evaluation Slides & Live Demo Prep",
    description: "Synthesize sprint milestones, risk matrix, and live prototype demo flow into 15 defense slides for committee evaluation.",
    status: "REVIEW",
    priority: "MEDIUM",
    assignedToId: "preview-m2",
    dueDate: new Date(Date.now() + 4 * 86400000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    assignedTo: { id: "preview-m2", name: "Hamza Tariq", profilePicture: null },
  },
  {
    id: "preview-4",
    groupId: "preview-group",
    title: "Project Proposal Defense Approval",
    description: "Formally approved by the PAF-IAST FYP Committee with supervisor endorsement.",
    status: "DONE",
    priority: "MEDIUM",
    assignedToId: "preview-m1",
    dueDate: new Date(Date.now() - 10 * 86400000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    assignedTo: { id: "preview-m1", name: "Ayesha Malik", profilePicture: null },
  },
];

export function KanbanBoard({ groupId, members, previewMode = false }: KanbanBoardProps) {
  const { data: serverTasks = [], isLoading } = useGroupTasks(groupId, !previewMode);
  const createTask = useCreateTask(groupId);
  const updateTask = useUpdateTask(groupId);
  const deleteTask = useDeleteTask(groupId);

  const [previewTasks, setPreviewTasks] = useState<FYPTask[]>(PREVIEW_TASKS);
  const [activeTask, setActiveTask] = useState<FYPTask | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [defaultStatus, setDefaultStatus] = useState("TODO");
  const [viewMode, setViewMode] = useState<"board" | "list">("board");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("ALL");
  const [, setDraggedTaskId] = useState<string | null>(null);

  const allTasks = previewMode ? previewTasks : serverTasks;

  const effectiveMembers = previewMode
    ? [
        { id: "preview-m1", name: "Ayesha Malik", profilePicture: null },
        { id: "preview-m2", name: "Hamza Tariq", profilePicture: null },
      ]
    : members;

  const filteredTasks = allTasks.filter((t) => {
    if (assigneeFilter === "ALL") return true;
    if (assigneeFilter === "UNASSIGNED") return !t.assignedToId;
    return t.assignedToId === assigneeFilter;
  });

  const totalTasks = allTasks.length;
  const doneTasks = allTasks.filter((t) => t.status === "DONE").length;
  const progressPercent = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("taskId", taskId);
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    setDraggedTaskId(null);

    if (taskId) {
      if (previewMode) {
        setPreviewTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, status: status as FYPTask["status"] } : t))
        );
        return;
      }

      const task = allTasks.find((t) => t.id === taskId);
      if (task && task.status !== status) {
        updateTask.mutate({ taskId, status });
      }
    }
  };

  const openNewTaskModal = (status: string) => {
    if (previewMode) {
      toast.info("This is an interactive preview. Initialize or join an FYP group to assign live team tasks.");
      return;
    }
    setActiveTask(null);
    setDefaultStatus(status);
    setIsModalOpen(true);
  };

  const openEditTaskModal = (task: FYPTask) => {
    setActiveTask(task);
    setIsModalOpen(true);
  };

  const handleSave = (data: any) => {
    if (previewMode) {
      setIsModalOpen(false);
      return;
    }

    if (data.taskId) {
      updateTask.mutate(data, {
        onSuccess: () => setIsModalOpen(false),
      });
    } else {
      createTask.mutate(data, {
        onSuccess: () => setIsModalOpen(false),
      });
    }
  };

  const handleDelete = (taskId: string) => {
    if (previewMode) {
      setIsModalOpen(false);
      return;
    }

    deleteTask.mutate(taskId, {
      onSuccess: () => setIsModalOpen(false),
    });
  };

  if (!previewMode && isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-900 dark:border-white border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header Controls & Team Progress */}
      <div className="flex flex-col gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Task Assignments & Deliverables
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Assign tasks with target dates and deliverable links. Assigned teammates receive an email notification.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            {/* View Switcher */}
            <div className="inline-flex items-center rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 p-0.5">
              <button
                type="button"
                onClick={() => setViewMode("board")}
                className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  viewMode === "board"
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Board
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  viewMode === "list"
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                <List className="w-3.5 h-3.5" />
                List
              </button>
            </div>

            {/* New Task Button */}
            <button
              type="button"
              onClick={() => openNewTaskModal("TODO")}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Assign Task
            </button>
          </div>
        </div>

        {/* Team Progress & Member Filter Pills */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setAssigneeFilter("ALL")}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors border ${
                assigneeFilter === "ALL"
                  ? "bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300"
              }`}
            >
              All Tasks ({allTasks.length})
            </button>
            {effectiveMembers.map((member) => {
              const memberTasks = allTasks.filter((t) => t.assignedToId === member.id);
              const memberDone = memberTasks.filter((t) => t.status === "DONE").length;
              return (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => setAssigneeFilter(member.id)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors border ${
                    assigneeFilter === member.id
                      ? "bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white"
                      : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300"
                  }`}
                >
                  <span>{member.name}</span>
                  <span className="text-[10px] opacity-75">
                    {memberDone}/{memberTasks.length}
                  </span>
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setAssigneeFilter("UNASSIGNED")}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors border ${
                assigneeFilter === "UNASSIGNED"
                  ? "bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300"
              }`}
            >
              Unassigned ({allTasks.filter((t) => !t.assignedToId).length})
            </button>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Completion: <strong className="text-slate-900 dark:text-white">{doneTasks}/{totalTasks}</strong> ({progressPercent}%)
            </span>
            <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-slate-900 dark:bg-white rounded-full transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Board View */}
      {viewMode === "board" ? (
        <div className="grid h-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {COLUMNS.map((col) => {
            const columnTasks = filteredTasks.filter((t) => t.status === col.id);

            return (
              <div
                key={col.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.id)}
                className={`flex h-full flex-col rounded-xl p-3.5 ${col.bg} transition-colors`}
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                      {col.title}
                    </h4>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700/60">
                      {columnTasks.length}
                    </span>
                  </div>
                  <button
                    onClick={() => openNewTaskModal(col.id)}
                    title={previewMode ? "Preview Mode" : "Add Task"}
                    className="rounded-lg p-1 text-slate-500 transition hover:bg-white hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="flex-1 space-y-2.5 overflow-y-auto min-h-[180px] pr-0.5">
                  {columnTasks.length === 0 ? (
                    <div className="flex h-28 items-center justify-center rounded-lg border border-dashed border-slate-200/80 dark:border-slate-800/80 text-[11px] text-slate-400">
                      No tasks
                    </div>
                  ) : (
                    columnTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onClick={() => openEditTaskModal(task)}
                        onDragStart={(e) => handleDragStart(e, task.id)}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-2.5 px-4">Task</th>
                <th className="py-2.5 px-3">Assignee</th>
                <th className="py-2.5 px-3">Priority</th>
                <th className="py-2.5 px-3">Due Date</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Deliverable</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60 text-xs">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No tasks match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => (
                  <tr
                    key={task.id}
                    onClick={() => openEditTaskModal(task)}
                    className="cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="py-3 px-4 font-medium text-slate-900 dark:text-white max-w-xs">
                      <div className="truncate">{task.title}</div>
                      {task.description && (
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {task.description}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {task.assignedTo ? (
                        <span className="inline-flex items-center gap-1.5">
                          <User className="w-3 h-3 text-slate-400" />
                          {task.assignedTo.name}
                        </span>
                      ) : (
                        <span className="text-slate-400">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          task.priority === "HIGH"
                            ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300"
                            : task.priority === "LOW"
                            ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                            : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                        }`}
                      >
                        {task.priority || "MEDIUM"}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {task.dueDate ? (
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(task.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {COLUMNS.find((c) => c.id === task.status)?.title || task.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      {task.deliverableUrl ? (
                        <a
                          href={task.deliverableUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-slate-700 dark:text-slate-300 hover:underline font-medium"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Open
                        </a>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <TaskDetailModal
          task={activeTask || undefined}
          defaultStatus={defaultStatus}
          members={effectiveMembers}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          onDelete={previewMode ? undefined : handleDelete}
          isSaving={createTask.isPending || updateTask.isPending}
          isDeleting={deleteTask.isPending}
          isReadOnly={previewMode}
        />
      )}
    </div>
  );
}
