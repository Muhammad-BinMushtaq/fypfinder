"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
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
  { id: "TODO", title: "To Do", bg: "bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800/60" },
  { id: "IN_PROGRESS", title: "In Progress", bg: "bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30" },
  { id: "REVIEW", title: "Under Review", bg: "bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30" },
  { id: "DONE", title: "Done", bg: "bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30" },
];

const PREVIEW_TASKS: FYPTask[] = [
  {
    id: "preview-1",
    groupId: "preview-group",
    title: "Literature Review & Research Paper Survey",
    description: "Survey 10-15 peer-reviewed papers on transformer architectures, accuracy trade-offs, and defense benchmarks for proposal documentation.",
    status: "TODO",
    assignedToId: "preview-m1",
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    assignedTo: { id: "preview-m1", name: "Ayesha Malik", profilePicture: null },
  },
  {
    id: "preview-2",
    groupId: "preview-group",
    title: "Hardware Component Sourcing & Sensor Sizing",
    description: "Benchmark microcontroller specs, verify camera sensor voltage compatibility, and submit equipment requisition form.",
    status: "TODO",
    assignedToId: null,
    dueDate: new Date(Date.now() + 21 * 86400000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    assignedTo: null,
  },
  {
    id: "preview-3",
    groupId: "preview-group",
    title: "System Architecture & API Schema Design",
    description: "Draft comprehensive system architecture diagrams, sequence charts, and PostgreSQL entity-relationship models for midterm review.",
    status: "IN_PROGRESS",
    assignedToId: "preview-m2",
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    assignedTo: { id: "preview-m2", name: "Hamza Tariq", profilePicture: null },
  },
  {
    id: "preview-4",
    groupId: "preview-group",
    title: "Dataset Collection & Annotation Pipeline",
    description: "Aggregate 3,000 domain-specific training images, execute augmentation scripts, and establish data validation criteria.",
    status: "IN_PROGRESS",
    assignedToId: "preview-m1",
    dueDate: new Date(Date.now() + 10 * 86400000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    assignedTo: { id: "preview-m1", name: "Ayesha Malik", profilePicture: null },
  },
  {
    id: "preview-5",
    groupId: "preview-group",
    title: "Mid-Term Evaluation Slides & Live Demo Prep",
    description: "Synthesize sprint milestones, risk matrix, and live prototype demo flow into 15 defense slides for committee evaluation.",
    status: "REVIEW",
    assignedToId: "preview-m2",
    dueDate: new Date(Date.now() + 4 * 86400000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    assignedTo: { id: "preview-m2", name: "Hamza Tariq", profilePicture: null },
  },
  {
    id: "preview-6",
    groupId: "preview-group",
    title: "Project Proposal Defense Approval",
    description: "Formally approved by the PAF-IAST FYP Committee with supervisor endorsement.",
    status: "DONE",
    assignedToId: "preview-m1",
    dueDate: new Date(Date.now() - 10 * 86400000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    assignedTo: { id: "preview-m1", name: "Ayesha Malik", profilePicture: null },
  },
  {
    id: "preview-7",
    groupId: "preview-group",
    title: "Team Responsibilities & Work Breakdown Structure",
    description: "Assigned core module ownership across backend, ML pipelines, and user interface layers.",
    status: "DONE",
    assignedToId: null,
    dueDate: new Date(Date.now() - 5 * 86400000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    assignedTo: null,
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
  const [, setDraggedTaskId] = useState<string | null>(null);

  const tasks = previewMode ? previewTasks : serverTasks;

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

      const task = tasks.find((t) => t.id === taskId);
      if (task && task.status !== status) {
        updateTask.mutate({ taskId, status });
      }
    }
  };

  const openNewTaskModal = (status: string) => {
    if (previewMode) {
      toast.info("This is an interactive preview. Form or lock your FYP group to add live team tasks!");
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

  const effectiveMembers = previewMode
    ? [
        { id: "preview-m1", name: "Ayesha Malik", profilePicture: null },
        { id: "preview-m2", name: "Hamza Tariq", profilePicture: null },
      ]
    : members;

  return (
    <>
      <div className="grid h-full grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {COLUMNS.map((col) => {
          const columnTasks = tasks.filter((t) => t.status === col.id);
          
          return (
            <div
              key={col.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`flex h-full flex-col rounded-2xl p-4 ${col.bg} transition-colors`}
            >
              <div className="mb-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                    {col.title}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 shadow-2xs border border-slate-200/50 dark:border-slate-700/50">
                    {columnTasks.length}
                  </span>
                </div>
                <button
                  onClick={() => openNewTaskModal(col.id)}
                  title={previewMode ? "Preview Mode" : "Add Task"}
                  className="rounded-lg p-1 text-slate-500 transition hover:bg-white hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white shadow-2xs"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto min-h-[160px] pr-0.5">
                {columnTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onClick={() => openEditTaskModal(task)}
                    onDragStart={(e) => handleDragStart(e, task.id)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

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
    </>
  );
}
