"use client";

import {
  Circle,
  CircleDot,
  CircleDashed,
  CheckCircle2,
  ExternalLink,
  Calendar,
} from "lucide-react";
import type { FYPTask } from "@/services/workspace.service";

export const STATUS_LABELS: Record<FYPTask["status"], string> = {
  TODO: "To do",
  IN_PROGRESS: "In progress",
  REVIEW: "In review",
  DONE: "Done",
};

export function isTaskOverdue(task: FYPTask): boolean {
  return (
    !!task.dueDate &&
    task.status !== "DONE" &&
    new Date(task.dueDate).getTime() < new Date().setHours(0, 0, 0, 0)
  );
}

export function formatTaskDate(dueDate: string): string {
  return new Date(dueDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

interface StatusControlProps {
  status: FYPTask["status"];
  onChange: (status: string) => void;
}

/**
 * Status indicator that doubles as a control. A native select with text-base (16px)
 * sits invisibly on top so it opens the native mobile picker without triggering viewport zoom.
 */
export function StatusControl({ status, onChange }: StatusControlProps) {
  const Icon =
    status === "DONE"
      ? CheckCircle2
      : status === "IN_PROGRESS"
      ? CircleDot
      : status === "REVIEW"
      ? CircleDashed
      : Circle;
  const color =
    status === "DONE"
      ? "text-emerald-600 dark:text-emerald-400"
      : status === "IN_PROGRESS"
      ? "text-blue-600 dark:text-blue-400"
      : status === "REVIEW"
      ? "text-amber-600 dark:text-amber-400"
      : "text-slate-400 dark:text-slate-500";

  return (
    <span
      className="relative inline-flex h-9 w-9 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      onClick={(e) => e.stopPropagation()}
      title={`Status: ${STATUS_LABELS[status]}`}
    >
      <Icon className={`h-5 w-5 ${color}`} />
      <select
        aria-label={`Change status (currently ${STATUS_LABELS[status]})`}
        value={status}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0 text-base"
      >
        <option value="TODO">To do</option>
        <option value="IN_PROGRESS">In progress</option>
        <option value="REVIEW">In review</option>
        <option value="DONE">Done</option>
      </select>
    </span>
  );
}

interface TaskCardProps {
  task: FYPTask;
  /** Stage name, shown only when it adds context (i.e. not already filtered by stage). */
  milestoneTitle?: string | null;
  onClick: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onStatusChange?: (newStatus: string) => void;
}

export function TaskCard({
  task,
  milestoneTitle,
  onClick,
  onDragStart,
  onStatusChange,
}: TaskCardProps) {
  const overdue = isTaskOverdue(task);
  const isDone = task.status === "DONE";

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      className="cursor-pointer rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 shadow-2xs transition-all hover:border-slate-300 dark:hover:border-slate-700"
    >
      <div className="flex items-start gap-2.5">
        {onStatusChange && (
          <div className="-ml-1 -mt-0.5">
            <StatusControl status={task.status} onChange={onStatusChange} />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p
              className={`text-sm font-medium leading-snug break-words ${
                isDone
                  ? "text-slate-400 line-through"
                  : "text-slate-900 dark:text-white"
              }`}
            >
              {task.title}
            </p>
            {task.deliverableUrl && (
              <a
                href={task.deliverableUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                aria-label="Open deliverable link"
                className="-mr-1 -mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>

          {milestoneTitle && (
            <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
              {milestoneTitle}
            </p>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800/80 pt-2.5 text-xs text-slate-500 dark:text-slate-400">
        <span className="truncate font-medium text-slate-600 dark:text-slate-300 max-w-[140px]">
          {task.assignedTo ? task.assignedTo.name : "Unassigned"}
        </span>

        <span className="flex shrink-0 items-center gap-2">
          {task.priority === "HIGH" && !isDone && (
            <span className="inline-flex items-center rounded-md bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 text-[11px] font-medium text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/50">
              High
            </span>
          )}
          {task.dueDate && (
            <span
              className={`inline-flex items-center gap-1 ${
                overdue
                  ? "font-medium text-red-600 dark:text-red-400"
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              <Calendar className="h-3 w-3 shrink-0" />
              {formatTaskDate(task.dueDate)}
              {overdue ? " (Overdue)" : ""}
            </span>
          )}
        </span>
      </div>
    </div>
  );
}
