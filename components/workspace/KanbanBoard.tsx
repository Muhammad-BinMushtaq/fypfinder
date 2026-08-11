"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useGroupTasks, useCreateTask, useUpdateTask, useDeleteTask } from "@/services/workspace.service";
import type { FYPTask } from "@/services/workspace.service";
import { TaskCard } from "./TaskCard";
import { TaskDetailModal } from "./TaskDetailModal";

interface KanbanBoardProps {
  groupId: string;
  members: any[];
}

const COLUMNS = [
  { id: "TODO", title: "To Do", bg: "bg-gray-100 dark:bg-slate-800/50" },
  { id: "IN_PROGRESS", title: "In Progress", bg: "bg-blue-50 dark:bg-blue-950/20" },
  { id: "REVIEW", title: "Under Review", bg: "bg-amber-50 dark:bg-amber-950/20" },
  { id: "DONE", title: "Done", bg: "bg-emerald-50 dark:bg-emerald-950/20" },
];

export function KanbanBoard({ groupId, members }: KanbanBoardProps) {
  const { data: tasks = [], isLoading } = useGroupTasks(groupId);
  const createTask = useCreateTask(groupId);
  const updateTask = useUpdateTask(groupId);
  const deleteTask = useDeleteTask(groupId);

  const [activeTask, setActiveTask] = useState<FYPTask | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [defaultStatus, setDefaultStatus] = useState("TODO");
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("taskId", taskId);
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    setDraggedTaskId(null);
    
    if (taskId) {
      const task = tasks.find((t) => t.id === taskId);
      if (task && task.status !== status) {
        updateTask.mutate({ taskId, status });
      }
    }
  };

  const openNewTaskModal = (status: string) => {
    setActiveTask(null);
    setDefaultStatus(status);
    setIsModalOpen(true);
  };

  const openEditTaskModal = (task: FYPTask) => {
    setActiveTask(task);
    setIsModalOpen(true);
  };

  const handleSave = (data: any) => {
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
    deleteTask.mutate(taskId, {
      onSuccess: () => setIsModalOpen(false),
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      <div className="grid h-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {COLUMNS.map((col) => {
          const columnTasks = tasks.filter((t) => t.status === col.id);
          
          return (
            <div
              key={col.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`flex h-full flex-col rounded-2xl p-4 ${col.bg}`}
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {col.title} <span className="ml-2 text-sm text-gray-500">{columnTasks.length}</span>
                </h3>
                <button
                  onClick={() => openNewTaskModal(col.id)}
                  className="rounded-lg p-1.5 text-gray-500 transition hover:bg-white hover:text-gray-900 dark:hover:bg-slate-800 dark:hover:text-white shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto min-h-[150px]">
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
          members={members}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          onDelete={handleDelete}
          isSaving={createTask.isPending || updateTask.isPending}
          isDeleting={deleteTask.isPending}
        />
      )}
    </>
  );
}
