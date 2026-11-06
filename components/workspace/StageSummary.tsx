"use client";

import { Fragment } from "react";
import { Check, ArrowRight, Pencil, X } from "lucide-react";
import { useGroupTasks, type FYPMilestoneItem } from "@/services/workspace.service";
import { describeStageDue } from "./DeadlineTimeline";
import { btnGhost, cardSurface } from "./workspaceUi";

interface StageSummaryProps {
  groupId: string;
  milestones: FYPMilestoneItem[];
  onOpenStages: () => void;
  selectedMilestoneId?: string;
  onSelectMilestone?: (milestoneId: string) => void;
}

/**
 * Visual arrow/diagram timeline of the FYP academic journey.
 * Minimal text, directional arrows, and point nodes.
 * Clicking any node focuses tasks for that stage.
 */
export function StageSummary({
  groupId,
  milestones,
  onOpenStages,
  selectedMilestoneId = "ALL",
  onSelectMilestone,
}: StageSummaryProps) {
  const { data: tasks = [] } = useGroupTasks(groupId, !!groupId);

  if (milestones.length === 0) return null;

  let currentIdx = milestones.findIndex((m) => m.status === "IN_PROGRESS");
  if (currentIdx === -1) currentIdx = milestones.findIndex((m) => m.status !== "COMPLETED");
  if (currentIdx === -1) currentIdx = milestones.length - 1;

  const currentStage = milestones[currentIdx];
  const currentDue = describeStageDue(currentStage.dueDate, currentStage.status);
  const allDone = milestones.every((m) => m.status === "COMPLETED");

  const stageTasksCount = (stageId: string) => {
    const list = tasks.filter((t) => t.milestoneId === stageId);
    return {
      total: list.length,
      done: list.filter((t) => t.status === "DONE").length,
    };
  };

  return (
    <section
      aria-label="Academic timeline diagram"
      className={`${cardSurface} p-3.5 sm:p-4 space-y-3`}
    >
      {/* Header bar: minimal section title + current position + edit action */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 min-w-0">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Timeline
          </span>
          <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">
            •
          </span>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
            {allDone ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                All stages completed
              </span>
            ) : (
              <>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  Phase {currentIdx + 1}:
                </span>{" "}
                {currentStage.title} ({currentDue.text})
              </>
            )}
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {selectedMilestoneId !== "ALL" && onSelectMilestone && (
            <button
              type="button"
              onClick={() => onSelectMilestone("ALL")}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white px-2 py-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Show all tasks"
            >
              <span>Reset filter</span>
              <X className="h-3 w-3" />
            </button>
          )}

          <button
            type="button"
            onClick={onOpenStages}
            className={`${btnGhost} !h-7 !px-2 text-xs`}
            title="Edit timeline stages & dates"
          >
            <Pencil className="h-3 w-3 text-slate-400" />
            <span>Edit</span>
          </button>
        </div>
      </div>

      {/* Visual Workflow Diagram: Points & Arrows */}
      <div className="overflow-x-auto no-scrollbar -mx-1 px-1 py-1">
        <div className="flex items-center min-w-[560px] sm:min-w-0 gap-1 sm:gap-1.5">
          {milestones.map((m, idx) => {
            const isDone = m.status === "COMPLETED";
            const isCurrent = idx === currentIdx && !allDone;
            const isSelected = selectedMilestoneId === m.id;
            const stats = stageTasksCount(m.id);
            const due = describeStageDue(m.dueDate, m.status);

            return (
              <Fragment key={m.id}>
                {/* Node Button */}
                <button
                  type="button"
                  onClick={() => {
                    if (onSelectMilestone) {
                      onSelectMilestone(isSelected ? "ALL" : m.id);
                    }
                  }}
                  title={
                    isSelected
                      ? "Showing tasks for this stage (click to clear)"
                      : `Click to filter tasks by ${m.title}`
                  }
                  className={`group relative flex items-center flex-1 min-w-0 gap-2 rounded-xl p-2 transition-all cursor-pointer text-left border ${
                    isSelected
                      ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900 shadow-sm"
                      : isCurrent
                      ? "border-slate-300 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/60 hover:border-slate-400"
                      : "border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {/* Point / Status Circle */}
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition-transform group-hover:scale-105 ${
                      isDone
                        ? isSelected
                          ? "bg-emerald-500 text-white"
                          : "bg-emerald-600 text-white"
                        : isCurrent
                        ? isSelected
                          ? "bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900"
                          : "bg-slate-900 text-white dark:bg-white dark:text-slate-900 ring-2 ring-slate-900/10 dark:ring-white/20"
                        : "border border-slate-300 dark:border-slate-700 text-slate-400 dark:text-slate-500"
                    }`}
                  >
                    {isDone ? (
                      <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                    ) : (
                      idx + 1
                    )}
                  </span>

                  {/* Stage Info */}
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-xs font-semibold leading-tight truncate ${
                        isSelected
                          ? "text-white dark:text-slate-900"
                          : isCurrent
                          ? "text-slate-900 dark:text-white"
                          : "text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      {m.title}
                    </p>
                    <p
                      className={`text-[10px] mt-0.5 leading-tight truncate ${
                        isSelected
                          ? "text-slate-200 dark:text-slate-700"
                          : isDone
                          ? "text-emerald-600 dark:text-emerald-400 font-medium"
                          : isCurrent
                          ? due.overdue
                            ? "text-red-600 dark:text-red-400 font-medium"
                            : "text-slate-500 dark:text-slate-400"
                          : "text-slate-400 dark:text-slate-500"
                      }`}
                    >
                      {isDone
                        ? "Done"
                        : stats.total > 0
                        ? `${stats.done}/${stats.total} tasks`
                        : m.dueDate
                        ? new Date(m.dueDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })
                        : "Upcoming"}
                    </p>
                  </div>
                </button>

                {/* Directional Arrow between nodes */}
                {idx < milestones.length - 1 && (
                  <div
                    className="flex items-center justify-center px-0.5 text-slate-300 dark:text-slate-600 shrink-0"
                    aria-hidden="true"
                  >
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                )}
              </Fragment>
            );
          })}
        </div>
      </div>
    </section>
  );
}
