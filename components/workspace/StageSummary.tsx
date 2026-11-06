"use client";

import { useGroupTasks, type FYPMilestoneItem } from "@/services/workspace.service";
import { describeStageDue } from "./DeadlineTimeline";
import { btnGhost } from "./workspaceUi";

interface StageSummaryProps {
  groupId: string;
  milestones: FYPMilestoneItem[];
  onOpenStages: () => void;
}

/**
 * One compact summary of where the team is: the current stage, its deadline and task progress.
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
    <section aria-label="Current academic stage" className="space-y-3">
      {/* Stage position: one thin segment per stage */}
      <div className="flex gap-1" aria-hidden="true">
        {milestones.map((m, i) => (
          <span
            key={m.id}
            className={`h-1 flex-1 rounded-full ${
              m.status === "COMPLETED" || i === idx
                ? "bg-slate-900 dark:bg-white"
                : "bg-slate-200 dark:bg-slate-700"
            }`}
          />
        ))}
      </div>

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {allDone ? "All stages complete" : `Current stage · ${idx + 1} of ${milestones.length}`}
          </p>
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            {stage.title}
          </h2>
          <p
            className={`mt-0.5 text-sm ${
              due.overdue
                ? "font-medium text-red-600 dark:text-red-400"
                : "text-slate-500 dark:text-slate-400"
            }`}
          >
            {due.text}
          </p>
        </div>
        <button type="button" onClick={onOpenStages} className={`${btnGhost} shrink-0`}>
          All stages
        </button>
      </div>

      {stageTasks.length > 0 ? (
        <div>
          <div
            className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
            role="progressbar"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Tasks completed in this stage"
          >
            <div
              className="h-full rounded-full bg-slate-900 dark:bg-white transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            {done} of {stageTasks.length} tasks done for this stage
          </p>
        </div>
      ) : (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No tasks are linked to this stage yet. Choose a stage when creating a task.
        </p>
      )}
    </section>
  );
}
