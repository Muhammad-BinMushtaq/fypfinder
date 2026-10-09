"use client";

import { Sparkles } from "lucide-react";
import { KanbanBoard } from "./KanbanBoard";
import { DeadlineTimeline } from "./DeadlineTimeline";

interface WorkspaceTabProps {
  groupId?: string;
  members?: any[];
  previewMode?: boolean;
  previewReason?: string;
  previewAction?: React.ReactNode;
}

export function WorkspaceTab({
  groupId = "",
  members = [],
  previewMode = false,
  previewReason,
  previewAction,
}: WorkspaceTabProps) {
  return (
    <div className="space-y-6">
      {previewMode && (
        <div className="rounded-2xl border border-amber-200/90 bg-gradient-to-r from-amber-50/80 via-orange-50/40 to-amber-50/80 p-4 sm:p-5 dark:border-amber-900/40 dark:from-amber-950/25 dark:via-slate-900/40 dark:to-amber-950/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs transition-colors">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Workspace Preview Mode</h4>
              <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5 leading-relaxed">
                {previewReason || "This is an interactive preview of the FYP Workspace. Form or lock your FYP team to activate live collaborative task management."}
              </p>
            </div>
          </div>
          {previewAction && (
            <div className="shrink-0 w-full sm:w-auto">
              {previewAction}
            </div>
          )}
        </div>
      )}

      <DeadlineTimeline />
      
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">Team Task Board</h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400">
              {previewMode ? "Drag cards across columns to explore how your team organizes sprint tasks." : "Manage and assign tasks for your FYP group members."}
            </p>
          </div>
          {previewMode && (
            <span className="inline-flex items-center self-start sm:self-auto px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50">
              Interactive Preview
            </span>
          )}
        </div>
        <div className="min-h-[550px]">
          <KanbanBoard groupId={groupId} members={members} previewMode={previewMode} />
        </div>
      </div>
    </div>
  );
}
