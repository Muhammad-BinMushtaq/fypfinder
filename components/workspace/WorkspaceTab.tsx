"use client";

import { KanbanBoard } from "./KanbanBoard";
import { DeadlineTimeline } from "./DeadlineTimeline";

interface WorkspaceTabProps {
  groupId: string;
  members: any[];
}

export function WorkspaceTab({ groupId, members }: WorkspaceTabProps) {
  return (
    <div className="space-y-6">
      <DeadlineTimeline />
      
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Task Board</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage and assign tasks for your FYP group</p>
        </div>
        <div className="h-[600px]">
          <KanbanBoard groupId={groupId} members={members} />
        </div>
      </div>
    </div>
  );
}
