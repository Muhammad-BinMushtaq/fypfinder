"use client";

import {
  Circle,
  CircleDot,
  CircleDashed,
  CheckCircle2,
  ExternalLink,
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
  return new Date(dueDate).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

interface StatusControlProps {
  status: FYPTask["status"];
  onChange: (status: string) => void;
}

/**
 * Status indicator that doubles as a control. A native select sits invisibly on top,
 * so it opens the platform picker on phones (no drag-and-drop needed) and never gets clipped.
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
      : status === "TODO"
      ? "text-slate-400"
      : "text-slate-900 dark:text-white";

  return (
    <span
      className="relative inline-flex h-10 w-10 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
      onClick={(e) => e.stopPropagation()}
      title={`Status: ${STATUS_LABELS[status]}`}
    >
      <Icon className={`h-5 w-5 ${color}`} />
      <select
        aria-label={`Change status (currently ${STATUS_LABELS[status]})`}
        value={status}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
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
      className="cursor-pointer rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 transition-colors hover:border-slate-300 dark:hover:border-slate-700"
    >
      <div className="flex items-start gap-2">
        {onStatusChange && (
          <div className="-ml-1 -mt-1">
            <StatusControl status={task.status} onChange={onStatusChange} />
          </div>
        )}
        <div className="min-w-0 flex-1 pt-0.5">
          <p
            className={`text-sm font-medium leading-snug line-clamp-3 ${
              isDone
                ? "text-slate-400 line-through"
                : "text-slate-900 dark:text-white"
            }`}
          >
            {task.title}
          </p>
          {milestoneTitle && (
            <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
              {milestoneTitle}
            </p>
          )}
        </div>
        {task.deliverableUrl && (
          <a
            href={task.deliverableUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            aria-label="Open deliverable link"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        )}
      </div>

      <div className="mt-2.5 flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
        <span className="truncate">
          {task.assignedTo ? task.assignedTo.name : "Unassigned"}
        </span>
        <span className="flex shrink-0 items-center gap-2">
          {task.priority === "HIGH" && !isDone && (
            <span className="font-medium text-slate-900 dark:text-white">
              High
            </span>
          )}
          {task.dueDate && (
            <span
              className={
                overdue ? "font-medium text-red-600 dark:text-red-400" : ""
              }
            >
              {formatTaskDate(task.dueDate)}
              {overdue ? " · overdue" : ""}
            </span>
          )}
        </span>
      </div>
    </div>
  );
}
