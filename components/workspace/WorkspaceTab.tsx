"use client";

import { FolderKanban } from "lucide-react";
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
        <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs transition-colors">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
              <FolderKanban className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Workspace Preview Mode</h4>
              <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5 leading-relaxed">
                {previewReason || "This is an interactive preview of the FYP Workspace. Initialize your FYP project or join a team to activate live task assignments and academic milestones."}
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

      <DeadlineTimeline groupId={groupId} previewMode={previewMode} />

      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
        <div className="min-h-[480px]">
          <KanbanBoard groupId={groupId} members={members} previewMode={previewMode} />
        </div>
      </div>
    </div>
  );
}
