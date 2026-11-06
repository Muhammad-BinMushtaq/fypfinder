"use client";

import { Calendar, Clock, ExternalLink, Flag } from "lucide-react";
import type { FYPTask } from "@/services/workspace.service";

interface TaskCardProps {
  task: FYPTask;
  milestoneTitle?: string | null;
  onClick: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onStatusChange?: (newStatus: string) => void;
}

const STICKY_CARD_STYLES = {
  TODO: "bg-amber-50/70 hover:bg-amber-50 border-amber-200/80 dark:bg-slate-900/90 dark:border-slate-800 border-l-4 border-l-amber-400",
  IN_PROGRESS:
    "bg-sky-50/70 hover:bg-sky-50 border-sky-200/80 dark:bg-slate-900/90 dark:border-slate-800 border-l-4 border-l-sky-500",
  REVIEW:
    "bg-purple-50/60 hover:bg-purple-50 border-purple-200/80 dark:bg-slate-900/90 dark:border-slate-800 border-l-4 border-l-purple-500",
  DONE: "bg-emerald-50/60 hover:bg-emerald-50 border-emerald-200/80 dark:bg-slate-900/90 dark:border-slate-800 border-l-4 border-l-emerald-500",
};

const PRIORITY_STYLES = {
  HIGH: "bg-red-100/80 text-red-800 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-900/50",
  MEDIUM:
    "bg-white/80 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  LOW: "bg-white/60 text-slate-500 border-slate-200/60 dark:bg-slate-850 dark:text-slate-400 dark:border-slate-800",
};

export function TaskCard({
  task,
  milestoneTitle,
  onClick,
  onDragStart,
  onStatusChange,
}: TaskCardProps) {
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
      className={`group cursor-grab active:cursor-grabbing relative overflow-hidden rounded-xl border p-3.5 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-sm ${
        STICKY_CARD_STYLES[task.status] || STICKY_CARD_STYLES.TODO
      }`}
    >
      <div className="flex items-center justify-between gap-1.5 mb-2 flex-wrap">
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide shrink-0 ${
              PRIORITY_STYLES[priority] || PRIORITY_STYLES.MEDIUM
            }`}
          >
            {priority}
          </span>

          {milestoneTitle && (
            <span
              className="inline-flex items-center gap-1 rounded bg-white/85 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 dark:text-slate-300 truncate max-w-[130px]"
              title={`Stage: ${milestoneTitle}`}
            >
              <Flag className="h-2.5 w-2.5 shrink-0 text-slate-400" />
              <span className="truncate">{milestoneTitle}</span>
            </span>
          )}
        </div>

        {task.deliverableUrl && (
          <a
            href={task.deliverableUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 rounded bg-white/80 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-medium text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 shrink-0"
            title="Open deliverable link"
          >
            <ExternalLink className="h-3 w-3" />
            <span>Link</span>
          </a>
        )}
      </div>

      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">
        {task.title}
      </h4>

      {task.description && (
        <p className="mt-1.5 text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      <div className="mt-3.5 flex items-center justify-between gap-2 pt-2.5 border-t border-slate-200/60 dark:border-slate-800/70">
        <div className="flex items-center gap-1.5 min-w-0">
          {task.assignedTo ? (
            <>
              {task.assignedTo.profilePicture ? (
                <img
                  src={task.assignedTo.profilePicture}
                  alt={task.assignedTo.name}
                  className="h-5 w-5 rounded-full object-cover shrink-0 ring-1 ring-slate-300 dark:ring-slate-700"
                />
              ) : (
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[9px] font-bold text-white dark:bg-white dark:text-slate-900">
                  {task.assignedTo.name.substring(0, 2).toUpperCase()}
                </div>
              )}
              <span className="truncate text-[11px] font-semibold text-slate-700 dark:text-slate-200">
                {task.assignedTo.name}
              </span>
            </>
          ) : (
            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
              Unassigned
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {task.dueDate && (
            <div
              className={`flex items-center gap-1 shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${
                isOverdue
                  ? "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                  : "bg-white/80 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
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

          {/* Touch-friendly 1-tap Status Switcher (essential on mobile where HTML5 drag is unavailable) */}
          {onStatusChange && (
            <select
              value={task.status}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => {
                e.stopPropagation();
                onStatusChange(e.target.value);
              }}
              aria-label="Change task status"
              className="rounded-md border border-slate-200/80 dark:border-slate-700 bg-white/90 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
            >
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">Doing</option>
              <option value="REVIEW">Review</option>
              <option value="DONE">Done</option>
            </select>
          )}
        </div>
      </div>
    </div>
  );
}
