"use client";

import { useState } from "react";
import { Plus, LayoutGrid, List, ExternalLink, Calendar, User, Trash2 } from "lucide-react";
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
  {
    id: "TODO",
    title: "To Do",
    bg: "bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800/60",
  },
  {
    id: "IN_PROGRESS",
    title: "In Progress",
    bg: "bg-sky-50/50 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900/30",
  },
  {
    id: "REVIEW",
    title: "Under Review",
    bg: "bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30",
  },
  {
    id: "DONE",
    title: "Done",
    bg: "bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30",
  },
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
    title: "Mid-Term Evaluation Slides & Live Demo Prep",
    description: "Synthesize sprint milestones and live prototype demo flow into defense slides.",
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
  // Default to visual 4-column sticky-note Board view
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
        onSuccess: () => {
          setIsModalOpen(false);
          toast.success("Task updated");
        },
      });
    } else {
      createTask.mutate(data, {
        onSuccess: () => {
          setIsModalOpen(false);
          toast.success(
            data.assignedToId
              ? "Task created & notification email sent to assignee"
              : "Task created"
          );
        },
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
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900/60 space-y-5">
      {/* Header Bar with Clean "+ Assign Task" Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Team Task Board
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Drag sticky cards across columns or click Assign Task to set target dates and notify teammates via email.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          <div className="inline-flex items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("board")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                viewMode === "board"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Board
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                viewMode === "list"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
              }`}
            >
              <List className="w-3.5 h-3.5" />
              List
            </button>
          </div>

          <button
            type="button"
            onClick={() => openNewTaskModal("TODO")}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Assign Task
          </button>
        </div>
      </div>

      {/* Filter Pills & Progress */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setAssigneeFilter("ALL")}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
              assigneeFilter === "ALL"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                : "bg-slate-100/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200/70"
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
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  assigneeFilter === member.id
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                    : "bg-slate-100/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200/70"
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
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
              assigneeFilter === "UNASSIGNED"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                : "bg-slate-100/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200/70"
            }`}
          >
            Unassigned ({allTasks.filter((t) => !t.assignedToId).length})
          </button>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Completed: <strong className="text-slate-900 dark:text-white">{doneTasks}/{totalTasks}</strong> ({progressPercent}%)
          </span>
        </div>
      </div>

      {/* 4-Column Sticky-Note Board View (Default) */}
      {viewMode === "board" ? (
        <div className="grid h-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {COLUMNS.map((col) => {
            const columnTasks = filteredTasks.filter((t) => t.status === col.id);

            return (
              <div
                key={col.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.id)}
                className={`flex h-full flex-col rounded-2xl p-4 ${col.bg} transition-colors`}
              >
                <div className="mb-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
                      {col.title}
                    </h4>
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50">
                      {columnTasks.length}
                    </span>
                  </div>
                  <button
                    onClick={() => openNewTaskModal(col.id)}
                    title="Add Task to Column"
                    className="rounded-lg p-1 text-slate-500 transition hover:bg-white hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto min-h-[200px] pr-0.5">
                  {columnTasks.length === 0 ? (
                    <div className="flex h-28 items-center justify-center rounded-xl border border-dashed border-slate-200/80 dark:border-slate-800 text-xs text-slate-400">
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
                    No tasks yet. Click Assign Task above to add your first task.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => (
                  <tr
                    key={task.id}
                    onClick={() => openEditTaskModal(task)}
                    className="cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="py-3 px-4 max-w-sm">
                      <div className="font-medium text-slate-900 dark:text-white">
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
                    <td className="py-3 px-3 whitespace-nowrap text-slate-600 dark:text-slate-400">
                      {task.dueDate ? (
                        <span className="inline-flex items-center gap-1">
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
                      <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {task.priority || "MEDIUM"}
                      </span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={task.status}
                        onChange={(e) => handleInlineStatusChange(task, e.target.value)}
                        className="px-2 py-1 rounded-md text-[11px] font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                      >
                        <option value="TODO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="REVIEW">Under Review</option>
                        <option value="DONE">Done</option>
                      </select>
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="inline-flex items-center gap-2">
                        {task.deliverableUrl && (
                          <a
                            href={task.deliverableUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {!previewMode && (
                          <button
                            type="button"
                            onClick={() => handleDelete(task.id)}
                            className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
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
