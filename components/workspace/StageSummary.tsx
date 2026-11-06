"use client";

import { Calendar, ChevronRight } from "lucide-react";
import { useGroupTasks, type FYPMilestoneItem } from "@/services/workspace.service";
import { describeStageDue } from "./DeadlineTimeline";
import { btnSecondary, cardSurface } from "./workspaceUi";

interface StageSummaryProps {
  groupId: string;
  milestones: FYPMilestoneItem[];
  onOpenStages: () => void;
}

/**
 * Compact summary card of where the team is: current academic stage, deadline, and linked task progress.
 * The complete list of stages (with editing) opens from "All stages".
 */
export function StageSummary({
  groupId,
  milestones,
  onOpenStages,
}: StageSummaryProps) {
  const { data: tasks = [] } = useGroupTasks(groupId, !!groupId);

  if (milestones.length === 0) return null;

  let idx = milestones.findIndex((m) => m.status === "IN_PROGRESS");
  if (idx === -1) idx = milestones.findIndex((m) => m.status !== "COMPLETED");
  if (idx === -1) idx = milestones.length - 1;

  const stage = milestones[idx];
  const due = describeStageDue(stage.dueDate, stage.status);
  const stageTasks = tasks.filter((t) => t.milestoneId === stage.id);
  const done = stageTasks.filter((t) => t.status === "DONE").length;
  const percent =
    stageTasks.length > 0 ? Math.round((done / stageTasks.length) * 100) : 0;
  const allDone = milestones.every((m) => m.status === "COMPLETED");

  return (
    <section
      aria-label="Current academic stage"
      className={`${cardSurface} p-4 sm:p-5 space-y-3.5`}
    >
      {/* Stage position: one thin segment per stage */}
      <div className="flex gap-1.5" aria-hidden="true">
        {milestones.map((m, i) => (
          <span
            key={m.id}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              m.status === "COMPLETED"
                ? "bg-emerald-500"
                : i === idx
                ? "bg-slate-900 dark:bg-white"
                : "bg-slate-100 dark:bg-slate-800"
            }`}
          />
        ))}
      </div>

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {allDone
              ? "All stages complete"
              : `Current stage · ${idx + 1} of ${milestones.length}`}
          </p>
          <h2 className="mt-0.5 text-base font-semibold text-slate-900 dark:text-white leading-snug">
            {stage.title}
          </h2>
          <p
            className={`mt-1 inline-flex items-center gap-1.5 text-xs sm:text-sm ${
              due.overdue
                ? "font-medium text-red-600 dark:text-red-400"
                : "text-slate-500 dark:text-slate-400"
            }`}
          >
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <span>{due.text}</span>
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenStages}
          className={`${btnSecondary} shrink-0 !h-9 !px-3 text-xs sm:text-sm`}
        >
          <span>All stages</span>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
        </button>
      </div>

      {stageTasks.length > 0 ? (
        <div className="pt-0.5">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
            <span>Stage task progress</span>
            <span className="font-medium text-slate-700 dark:text-slate-200">
              {done} of {stageTasks.length} done ({percent}%)
            </span>
          </div>
          <div
            className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
            role="progressbar"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Tasks completed in this stage"
          >
            <div
              className="h-full rounded-full bg-slate-900 dark:bg-white transition-all duration-300"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      ) : (
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          No tasks linked to this stage yet. Link tasks when creating or editing them.
        </p>
      )}
    </section>
  );
}
