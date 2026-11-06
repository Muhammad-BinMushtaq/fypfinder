"use client";

import { useState } from "react";
import { Check, Plus } from "lucide-react";
import { toast } from "react-toastify";
import {
  useWorkspaceMeta,
  useUpdateWorkspaceMeta,
  useGroupTasks,
  type FYPMilestoneItem,
  type MilestoneStatus,
  type GroupWorkspaceMeta,
} from "@/services/workspace.service";
import {
  btnPrimary,
  btnSecondary,
  btnGhost,
  btnDangerText,
  inputCls,
} from "./workspaceUi";

interface DeadlineTimelineProps {
  groupId?: string;
  previewMode?: boolean;
  initialMeta?: GroupWorkspaceMeta;
  selectedMilestoneId?: string;
  onSelectMilestone?: (milestoneId: string) => void;
  /** Called after a stage is chosen as a task filter (lets a surrounding panel close itself). */
  onDone?: () => void;
}

export const PREVIEW_MILESTONES: FYPMilestoneItem[] = [
  {
    id: "m-1",
    title: "Idea & Supervisor",
    dueDate: new Date(Date.now() - 5 * 86400000).toISOString().split("T")[0],
    status: "COMPLETED",
    note: null,
  },
  {
    id: "m-2",
    title: "Proposal & SRS Defense",
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
    status: "IN_PROGRESS",
    note: null,
  },
  {
    id: "m-3",
    title: "Mid-Term Evaluation",
    dueDate: new Date(Date.now() + 45 * 86400000).toISOString().split("T")[0],
    status: "UPCOMING",
    note: null,
  },
  {
    id: "m-4",
    title: "Final Defense & Thesis",
    dueDate: new Date(Date.now() + 90 * 86400000).toISOString().split("T")[0],
    status: "UPCOMING",
    note: null,
  },
];

const STAGE_STATUS_LABEL: Record<MilestoneStatus, string> = {
  UPCOMING: "Upcoming",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
};

/** Human-friendly deadline text, e.g. "Nov 20 · 14 days left". */
export function describeStageDue(
  dueDate: string | null,
  status: MilestoneStatus
): { text: string; overdue: boolean } {
  if (!dueDate) return { text: "No date set", overdue: false };
  const formatted = new Date(dueDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  if (status === "COMPLETED") return { text: formatted, overdue: false };

  const diffDays = Math.ceil(
    (new Date(dueDate).getTime() - new Date().setHours(0, 0, 0, 0)) / 86400000
  );
  if (diffDays < 0)
    return {
      text: `${formatted} · ${Math.abs(diffDays)} day${
        Math.abs(diffDays) === 1 ? "" : "s"
      } overdue`,
      overdue: true,
    };
  if (diffDays === 0) return { text: `${formatted} · due today`, overdue: false };
  return {
    text: `${formatted} · ${diffDays} day${diffDays === 1 ? "" : "s"} left`,
    overdue: false,
  };
}

/**
 * Full list of academic stages. Shown inside a panel opened from the compact stage summary.
 * Every stage can be edited, re-dated, completed, removed, or used as a task filter.
 */
export function DeadlineTimeline({
  groupId = "",
  previewMode = false,
  initialMeta,
  selectedMilestoneId = "ALL",
  onSelectMilestone,
  onDone,
}: DeadlineTimelineProps) {
  const { data: meta } = useWorkspaceMeta(
    groupId,
    !!groupId && !previewMode,
    initialMeta
  );
  const { data: tasks = [] } = useGroupTasks(groupId, !!groupId && !previewMode);
  const updateMeta = useUpdateWorkspaceMeta(groupId);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editStatus, setEditStatus] = useState<MilestoneStatus>("UPCOMING");

  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");

  const milestones: FYPMilestoneItem[] = previewMode
    ? PREVIEW_MILESTONES
    : meta?.milestones || PREVIEW_MILESTONES;

  const stats = (id: string) => {
    const stageTasks = tasks.filter((t) => t.milestoneId === id);
    return {
      total: stageTasks.length,
      done: stageTasks.filter((t) => t.status === "DONE").length,
    };
  };

  const save = (next: FYPMilestoneItem[], after?: () => void) => {
    if (previewMode || !groupId) {
      toast.info("Initialize or join a group to save milestone changes");
      return;
    }
    updateMeta.mutate(
      { milestones: next },
      {
        onSuccess: () => {
          setEditingId(null);
          setIsAdding(false);
          after?.();
        },
        onError: (err: any) =>
          toast.error(err?.message || "Failed to update milestones"),
      }
    );
  };

  const setStatus = (item: FYPMilestoneItem, status: string) => {
    save(
      milestones.map((m) =>
        m.id === item.id ? { ...m, status: status as MilestoneStatus } : m
      )
    );
  };

  const startEditing = (item: FYPMilestoneItem) => {
    setIsAdding(false);
    setEditingId(item.id);
    setEditTitle(item.title);
    setEditDate(item.dueDate ? item.dueDate.split("T")[0] : "");
    setEditStatus(item.status);
  };

  const saveEdit = (id: string) => {
    if (!editTitle.trim()) return;
    save(
      milestones.map((m) =>
        m.id === id
          ? {
              ...m,
              title: editTitle.trim(),
              dueDate: editDate || null,
              status: editStatus,
            }
          : m
      )
    );
  };

  const remove = (id: string) => {
    if (!window.confirm("Remove this stage? Tasks linked to it will keep their other details.")) return;
    if (selectedMilestoneId === id) onSelectMilestone?.("ALL");
    save(milestones.filter((m) => m.id !== id));
  };

  const addStage = () => {
    if (!newTitle.trim()) return;
    save(
      [
        ...milestones,
        {
          id: `m-${Date.now()}`,
          title: newTitle.trim(),
          dueDate: newDate || null,
          status: "UPCOMING",
          note: null,
        },
      ],
      () => {
        setNewTitle("");
        setNewDate("");
      }
    );
  };

  return (
    <div>
      <ol className="divide-y divide-slate-100 dark:divide-slate-800">
        {milestones.map((m, idx) => {
          const isDone = m.status === "COMPLETED";
          const isCurrent = m.status === "IN_PROGRESS";
          const due = describeStageDue(m.dueDate, m.status);
          const s = stats(m.id);

          if (editingId === m.id) {
            return (
              <li key={m.id} className="space-y-3 py-4">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Stage name"
                  aria-label="Stage name"
                  className={inputCls}
                />
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    aria-label="Stage due date"
                    className={inputCls}
                  />
                  <select
                    value={editStatus}
                    onChange={(e) =>
                      setEditStatus(e.target.value as MilestoneStatus)
                    }
                    aria-label="Stage status"
                    className={inputCls}
                  >
                    <option value="UPCOMING">Upcoming</option>
                    <option value="IN_PROGRESS">In progress</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => saveEdit(m.id)}
                    disabled={updateMeta.isPending || !editTitle.trim()}
                    className={btnPrimary}
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className={btnSecondary}
                  >
                    Cancel
                  </button>
                  {milestones.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(m.id)}
                      className={`${btnDangerText} ml-auto`}
                    >
                      Remove stage
                    </button>
                  )}
                </div>
              </li>
            );
          }

          return (
            <li key={m.id} className="flex items-start gap-3 py-3.5">
              <span
                className={`relative mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium ${
                  isDone
                    ? "bg-emerald-600 text-white"
                    : isCurrent
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                    : "border border-slate-300 text-slate-500 dark:border-slate-600"
                }`}
              >
                {isDone ? <Check className="h-4 w-4" /> : idx + 1}
                {!previewMode && (
                  <select
                    aria-label={`Status of ${m.title}`}
                    value={m.status}
                    onChange={(e) => setStatus(m, e.target.value)}
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  >
                    <option value="UPCOMING">Upcoming</option>
                    <option value="IN_PROGRESS">In progress</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                )}
              </span>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {m.title}
                </p>
                <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                  {STAGE_STATUS_LABEL[m.status]} ·{" "}
                  <span
                    className={
                      due.overdue ? "font-medium text-red-600 dark:text-red-400" : ""
                    }
                  >
                    {due.text}
                  </span>
                  {s.total > 0 && ` · ${s.done}/${s.total} tasks done`}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-1 -ml-2.5">
                  {onSelectMilestone && s.total > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        onSelectMilestone(
                          selectedMilestoneId === m.id ? "ALL" : m.id
                        );
                        onDone?.();
                      }}
                      className={btnGhost}
                    >
                      {selectedMilestoneId === m.id
                        ? "Show all tasks"
                        : "Show tasks"}
                    </button>
                  )}
                  {!previewMode && (
                    <button
                      type="button"
                      onClick={() => startEditing(m)}
                      className={btnGhost}
                    >
                      Edit
                    </button>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      {!previewMode && (
        <div className="pt-3">
          {isAdding ? (
            <div className="space-y-3 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
              <input
                type="text"
                placeholder="New stage name (e.g. Prototype demo)"
                aria-label="New stage name"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className={inputCls}
              />
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                aria-label="New stage due date"
                className={inputCls}
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={addStage}
                  disabled={!newTitle.trim() || updateMeta.isPending}
                  className={btnPrimary}
                >
                  Add stage
                </button>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className={btnSecondary}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setIsAdding(true);
              }}
              className={btnGhost}
            >
              <Plus className="h-4 w-4" />
              Add stage
            </button>
          )}
        </div>
      )}
    </div>
  );
}
