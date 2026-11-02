"use client";

import { Calendar, Clock, ExternalLink } from "lucide-react";
import type { FYPTask } from "@/services/workspace.service";

interface TaskCardProps {
  task: FYPTask;
  onClick: () => void;
  onDragStart: (e: React.DragEvent) => void;
}

const STATUS_COLORS = {
  TODO: "border-l-slate-400 dark:border-l-slate-500",
  IN_PROGRESS: "border-l-indigo-500 dark:border-l-indigo-400",
  REVIEW: "border-l-amber-500 dark:border-l-amber-400",
  DONE: "border-l-emerald-500 dark:border-l-emerald-400",
};

const PRIORITY_STYLES = {
  HIGH: "bg-red-50 text-red-700 border-red-200/70 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900/40",
  MEDIUM:
    "bg-slate-100 text-slate-700 border-slate-200/70 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  LOW: "bg-slate-50 text-slate-500 border-slate-200/50 dark:bg-slate-850 dark:text-slate-400 dark:border-slate-800",
};

export function TaskCard({ task, onClick, onDragStart }: TaskCardProps) {
  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== "DONE";
  const priority = task.priority || "MEDIUM";

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      className={`group cursor-grab active:cursor-grabbing relative overflow-hidden rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-2xs transition-all hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/90 dark:hover:border-slate-700 border-l-4 ${
        STATUS_COLORS[task.status]
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <span
          className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
            PRIORITY_STYLES[priority] || PRIORITY_STYLES.MEDIUM
          }`}
        >
          {priority}
        </span>

        {task.deliverableUrl && (
          <a
            href={task.deliverableUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/40"
            title="Open deliverable link"
          >
            <ExternalLink className="h-3 w-3" />
            <span>Link</span>
          </a>
        )}
      </div>

      <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white line-clamp-2">
        {task.title}
      </h4>

      {task.description && (
        <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="mt-3 flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/70">
        <div className="flex items-center gap-1.5 min-w-0">
          {task.assignedTo ? (
            <>
              {task.assignedTo.profilePicture ? (
                <img
                  src={task.assignedTo.profilePicture}
                  alt={task.assignedTo.name}
                  className="h-5 w-5 rounded-full object-cover shrink-0 ring-1 ring-slate-200 dark:ring-slate-700"
                />
              ) : (
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[9px] font-semibold text-white dark:bg-white dark:text-slate-900">
                  {task.assignedTo.name.substring(0, 2).toUpperCase()}
                </div>
              )}
              <span className="truncate text-[11px] font-medium text-slate-600 dark:text-slate-300">
                {task.assignedTo.name}
              </span>
            </>
          ) : (
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              Unassigned
            </span>
          )}
        </div>

        {task.dueDate && (
          <div
            className={`flex items-center gap-1 shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-medium ${
              isOverdue
                ? "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
            }`}
          >
            {isOverdue ? (
              <Clock className="h-2.5 w-2.5" />
            ) : (
              <Calendar className="h-2.5 w-2.5" />
            )}
            {new Date(task.dueDate).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })}
          </div>
        )}
      </div>
    </div>
  );
}
