"use client";

import { Calendar, Clock } from "lucide-react";
import type { FYPTask } from "@/services/workspace.service";

interface TaskCardProps {
  task: FYPTask;
  onClick: () => void;
  onDragStart: (e: React.DragEvent) => void;
}

const STATUS_COLORS = {
  TODO: "border-l-gray-400",
  IN_PROGRESS: "border-l-blue-500",
  REVIEW: "border-l-amber-500",
  DONE: "border-l-emerald-500",
};

export function TaskCard({ task, onClick, onDragStart }: TaskCardProps) {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "DONE";

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      className={`group cursor-grab active:cursor-grabbing relative overflow-hidden rounded-xl border border-gray-200 bg-white p-3 shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-800 border-l-4 ${STATUS_COLORS[task.status]}`}
    >
      <h4 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">
        {task.title}
      </h4>
      
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {task.assignedTo ? (
            task.assignedTo.profilePicture ? (
              <img
                src={task.assignedTo.profilePicture}
                alt={task.assignedTo.name}
                className="h-6 w-6 rounded-full object-cover ring-2 ring-white dark:ring-slate-800"
              />
            ) : (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-[10px] font-medium text-white dark:bg-white dark:text-gray-900 ring-2 ring-white dark:ring-slate-800">
                {task.assignedTo.name.substring(0, 2).toUpperCase()}
              </div>
            )
          ) : (
            <div className="h-6 w-6 rounded-full border border-dashed border-gray-300 dark:border-slate-600" />
          )}
        </div>

        {task.dueDate && (
          <div
            className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
              isOverdue
                ? "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                : "bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-300"
            }`}
          >
            {isOverdue ? <Clock className="h-3 w-3" /> : <Calendar className="h-3 w-3" />}
            {new Date(task.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
          </div>
        )}
      </div>
    </div>
  );
}
