"use client";

import { useState } from "react";
import { Plus, LayoutGrid, List, ExternalLink, Calendar, User, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { useGroupTasks, useCreateTask, useUpdateTask, useDeleteTask } from "@/services/workspace.service";
import type { FYPTask, TaskPriority } from "@/services/workspace.service";
import { TaskCard } from "./TaskCard";
import { TaskDetailModal } from "./TaskDetailModal";

interface KanbanBoardProps {
  groupId: string;
  members: any[];
  previewMode?: boolean;
}

const COLUMNS = [
  { id: "TODO", title: "To Do", bg: "bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/70 dark:border-slate-800" },
  { id: "IN_PROGRESS", title: "In Progress", bg: "bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/70 dark:border-slate-800" },
  { id: "REVIEW", title: "Review", bg: "bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/70 dark:border-slate-800" },
  { id: "DONE", title: "Done", bg: "bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/70 dark:border-slate-800" },
];

const PREVIEW_TASKS: FYPTask[] = [
  {
    id: "preview-1",
    groupId: "preview-group",
    title: "Literature Review & Research Paper Survey",
    description: "Survey 10-15 peer-reviewed papers on transformer architectures and defense benchmarks.",
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
    description: "Draft system architecture diagrams and PostgreSQL schema for midterm review.",
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
  // Default to clean List view so it's immediately scannable and easy on the eyes
  const [viewMode, setViewMode] = useState<"list" | "board">("list");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("ALL");
  const [, setDraggedTaskId] = useState<string | null>(null);

  // Quick-add inline form state
  const [quickTitle, setQuickTitle] = useState("");
  const [quickAssignee, setQuickAssignee] = useState("");
  const [quickDueDate, setQuickDueDate] = useState("");
  const [quickPriority, setQuickPriority] = useState<TaskPriority>("MEDIUM");

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

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    if (previewMode) {
      toast.info("Initialize your project space to assign live tasks.");
      return;
    }

    createTask.mutate(
      {
        title: quickTitle.trim(),
        assignedToId: quickAssignee || undefined,
        dueDate: quickDueDate || undefined,
        priority: quickPriority,
      },
      {
        onSuccess: () => {
          setQuickTitle("");
          setQuickAssignee("");
          setQuickDueDate("");
          setQuickPriority("MEDIUM");
          toast.success(
            quickAssignee
              ? "Task assigned & notification email sent to teammate"
              : "Task added"
          );
        },
      }
    );
  };

  const handleInlineStatusChange = (task: FYPTask, newStatus: string) => {
    if (previewMode) {
      setPreviewTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: newStatus as FYPTask["status"] } : t))
      );
      return;
    }
    if (task.status !== newStatus) {
      updateTask.mutate({ taskId: task.id, status: newStatus });
    }
  };

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
      const task = allTasks.find((t) => t.id === taskId);
      if (task) {
        handleInlineStatusChange(task, status);
      }
    }
  };

  const openNewTaskModal = (status: string) => {
    if (previewMode) {
      toast.info("Initialize your project space to assign live tasks.");
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
      <div className="flex h-48 items-center justify-center">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-900 dark:border-white border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 1. Fast Inline Quick-Assign Bar (No popup required) */}
      {!previewMode && (
        <form
          onSubmit={handleQuickAdd}
          className="flex flex-col md:flex-row items-stretch md:items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40"
        >
          <input
            type="text"
            value={quickTitle}
            onChange={(e) => setQuickTitle(e.target.value)}
            placeholder="Quick-assign a task (e.g. Complete SRS Section 3)..."
            className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-slate-400"
          />
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
            <select
              value={quickAssignee}
              onChange={(e) => setQuickAssignee(e.target.value)}
              className="px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-200"
            >
              <option value="">Unassigned</option>
              {effectiveMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  Assign: {m.name}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={quickDueDate}
              onChange={(e) => setQuickDueDate(e.target.value)}
              title="Target Due Date"
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-200"
            />

            <select
              value={quickPriority}
              onChange={(e) => setQuickPriority(e.target.value as TaskPriority)}
              className="px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-200"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>

            <button
              type="submit"
              disabled={!quickTitle.trim() || createTask.isPending}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 disabled:opacity-50 shrink-0 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              {createTask.isPending ? "Adding..." : "Assign"}
            </button>
          </div>
        </form>
      )}

      {/* 2. Clean Filter Bar & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setAssigneeFilter("ALL")}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              assigneeFilter === "ALL"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            All ({allTasks.length})
          </button>
          {effectiveMembers.map((member) => {
            const memberTasks = allTasks.filter((t) => t.assignedToId === member.id);
            const memberDone = memberTasks.filter((t) => t.status === "DONE").length;
            return (
              <button
                key={member.id}
                type="button"
                onClick={() => setAssigneeFilter(member.id)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  assigneeFilter === member.id
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <span>{member.name}</span>
                <span className="text-[10px] opacity-70">
                  {memberDone}/{memberTasks.length}
                </span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setAssigneeFilter("UNASSIGNED")}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              assigneeFilter === "UNASSIGNED"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            Unassigned ({allTasks.filter((t) => !t.assignedToId).length})
          </button>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Done: <strong className="text-slate-900 dark:text-white">{doneTasks}/{totalTasks}</strong> ({progressPercent}%)
          </span>

          <div className="inline-flex items-center rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                viewMode === "list"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
              }`}
            >
              <List className="w-3.5 h-3.5" />
              List
            </button>
            <button
              type="button"
              onClick={() => setViewMode("board")}
              className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                viewMode === "board"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Board
            </button>
          </div>
        </div>
      </div>

      {/* 3. Task Table (List View) or Board View */}
      {viewMode === "list" ? (
        <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/50">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-2.5 px-4">Task</th>
                <th className="py-2.5 px-3">Assignee</th>
                <th className="py-2.5 px-3">Due Date</th>
                <th className="py-2.5 px-3">Priority</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60 text-xs">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    No tasks yet. Use the quick-assign bar above to add your first team task.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => {
                  const isOverdue =
                    task.dueDate &&
                    task.status !== "DONE" &&
                    new Date(task.dueDate).getTime() < new Date().setHours(0, 0, 0, 0);

                  return (
                    <tr
                      key={task.id}
                      onClick={() => openEditTaskModal(task)}
                      className="cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="py-3 px-4 max-w-sm">
                        <div
                          className={`font-medium ${
                            task.status === "DONE"
                              ? "line-through text-slate-400 dark:text-slate-500"
                              : "text-slate-900 dark:text-white"
                          }`}
                        >
                          {task.title}
                        </div>
                        {task.description && (
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {task.description}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        {task.assignedTo ? (
                          <span className="inline-flex items-center gap-1.5 font-medium">
                            <User className="w-3 h-3 text-slate-400" />
                            {task.assignedTo.name}
                          </span>
                        ) : (
                          <span className="text-slate-400">Unassigned</span>
                        )}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        {task.dueDate ? (
                          <span
                            className={`inline-flex items-center gap-1 ${
                              isOverdue
                                ? "text-red-600 dark:text-red-400 font-semibold"
                                : "text-slate-600 dark:text-slate-400"
                            }`}
                          >
                            <Calendar className="w-3 h-3" />
                            {new Date(task.dueDate).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
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

                      <td
                        className="py-3 px-3 whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <select
                          value={task.status}
                          onChange={(e) => handleInlineStatusChange(task, e.target.value)}
                          className={`px-2 py-1 rounded-md text-[11px] font-semibold border transition-colors ${
                            task.status === "DONE"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900/50"
                              : task.status === "IN_PROGRESS"
                              ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-900/50"
                              : task.status === "REVIEW"
                              ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-900/50"
                              : "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                          }`}
                        >
                          <option value="TODO">To Do</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="REVIEW">Review</option>
                          <option value="DONE">Done</option>
                        </select>
                      </td>

                      <td
                        className="py-3 px-3 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="inline-flex items-center gap-2">
                          {task.deliverableUrl && (
                            <a
                              href={task.deliverableUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Open Deliverable Link"
                              className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {!previewMode && (
                            <button
                              type="button"
                              onClick={() => handleDelete(task.id)}
                              title="Delete Task"
                              className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* Board View */
        <div className="grid h-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {COLUMNS.map((col) => {
            const columnTasks = filteredTasks.filter((t) => t.status === col.id);

            return (
              <div
                key={col.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.id)}
                className={`flex h-full flex-col rounded-xl p-3.5 ${col.bg}`}
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
                    title="Add Task"
                    className="rounded-lg p-1 text-slate-500 transition hover:bg-white hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="flex-1 space-y-2.5 overflow-y-auto min-h-[160px] pr-0.5">
                  {columnTasks.length === 0 ? (
                    <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-slate-200/80 dark:border-slate-800 text-[11px] text-slate-400">
                      Empty
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
