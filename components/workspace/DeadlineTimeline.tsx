"use client";

import { useState } from "react";
import {
  Check,
  Plus,
  Trash2,
  Edit2,
  X,
  ArrowRight,
} from "lucide-react";
import {
  useWorkspaceMeta,
  useUpdateWorkspaceMeta,
  type FYPMilestoneItem,
  type MilestoneStatus,
} from "@/services/workspace.service";
import { toast } from "react-toastify";

interface DeadlineTimelineProps {
  groupId?: string;
  previewMode?: boolean;
}

const PREVIEW_MILESTONES: FYPMilestoneItem[] = [
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

function formatDateShort(dueDate: string | null, status: MilestoneStatus): string {
  if (!dueDate) {
    return status === "COMPLETED" ? "Done" : "Set date";
  }
  const formatted = new Date(dueDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  if (status === "COMPLETED") return `${formatted} · Done`;

  const diffDays = Math.ceil(
    (new Date(dueDate).getTime() - new Date().setHours(0, 0, 0, 0)) / 86400000
  );
  if (diffDays < 0) return `${formatted} · ${Math.abs(diffDays)}d late`;
  if (diffDays === 0) return `${formatted} · Today`;
  return `${formatted} · ${diffDays}d left`;
}

export function DeadlineTimeline({
  groupId = "",
  previewMode = false,
}: DeadlineTimelineProps) {
  const { data: meta } = useWorkspaceMeta(groupId, !!groupId && !previewMode);
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

  const completedCount = milestones.filter(
    (m) => m.status === "COMPLETED"
  ).length;

  const handleSaveMilestones = (nextList: FYPMilestoneItem[]) => {
    if (previewMode || !groupId) {
      toast.info("Initialize or join a group to save milestone changes");
      return;
    }
    updateMeta.mutate(
      { milestones: nextList },
      {
        onSuccess: () => {
          setEditingId(null);
          setIsAdding(false);
        },
        onError: (err: any) => {
          toast.error(err?.message || "Failed to update milestones");
        },
      }
    );
  };

  const handleCycleStatus = (item: FYPMilestoneItem) => {
    if (previewMode) return;
    const order: MilestoneStatus[] = ["UPCOMING", "IN_PROGRESS", "COMPLETED"];
    const nextStatus = order[(order.indexOf(item.status) + 1) % order.length];
    const nextList = milestones.map((m) =>
      m.id === item.id ? { ...m, status: nextStatus } : m
    );
    handleSaveMilestones(nextList);
  };

  const startEditing = (item: FYPMilestoneItem) => {
    if (previewMode) return;
    setEditingId(item.id);
    setEditTitle(item.title);
    setEditDate(item.dueDate ? item.dueDate.split("T")[0] : "");
    setEditStatus(item.status);
  };

  const saveEdit = (id: string) => {
    if (!editTitle.trim()) return;
    const nextList = milestones.map((m) =>
      m.id === id
        ? {
            ...m,
            title: editTitle.trim(),
            dueDate: editDate || null,
            status: editStatus,
          }
        : m
    );
    handleSaveMilestones(nextList);
  };

  const handleDelete = (id: string) => {
    const nextList = milestones.filter((m) => m.id !== id);
    handleSaveMilestones(nextList);
  };

  const handleAddMilestone = () => {
    if (!newTitle.trim()) return;
    const newItem: FYPMilestoneItem = {
      id: `m-${Date.now()}`,
      title: newTitle.trim(),
      dueDate: newDate || null,
      status: "UPCOMING",
      note: null,
    };
    handleSaveMilestones([...milestones, newItem]);
    setNewTitle("");
    setNewDate("");
  };

  const activeEditItem = milestones.find((m) => m.id === editingId);

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
      {/* Compact Header */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2.5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Academic Timeline
          </h3>
          <span className="text-xs text-slate-400 dark:text-slate-500">
            {completedCount}/{milestones.length} done
          </span>
        </div>

        {!previewMode && !isAdding && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setIsAdding(true);
            }}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Stage</span>
          </button>
        )}
      </div>

      {/* DESKTOP: Horizontal Connected Arrow Timeline */}
      <div className="hidden md:flex items-start justify-between w-full pt-1 pb-1">
        {milestones.map((m, idx) => {
          const isLast = idx === milestones.length - 1;
          const isDone = m.status === "COMPLETED";
          const isCurrent = m.status === "IN_PROGRESS";

          return (
            <div key={m.id} className="flex items-start flex-1 min-w-0">
              {/* Step Node + Labels */}
              <div className="flex flex-col items-start min-w-0 pr-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCycleStatus(m)}
                    title="Click to toggle status"
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all cursor-pointer ${
                      isDone
                        ? "bg-emerald-600 text-white"
                        : isCurrent
                        ? "bg-slate-900 text-white ring-4 ring-slate-900/10 dark:bg-white dark:text-slate-900 dark:ring-white/15"
                        : "border-2 border-slate-300 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-500"
                    }`}
                  >
                    {isDone ? <Check className="h-3.5 w-3.5" /> : idx + 1}
                  </button>

                  {!previewMode && (
                    <button
                      type="button"
                      onClick={() => startEditing(m)}
                      className="text-slate-300 hover:text-slate-600 dark:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                      title="Edit stage"
                    >
                      <Edit2 className="h-3 w-3" />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => startEditing(m)}
                  className="mt-2 text-left group cursor-pointer max-w-[170px]"
                >
                  <p
                    className={`text-xs font-semibold truncate ${
                      isDone
                        ? "text-slate-600 dark:text-slate-300"
                        : isCurrent
                        ? "text-slate-900 dark:text-white"
                        : "text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {m.title}
                  </p>
                  <p
                    className={`text-[11px] mt-0.5 ${
                      isDone
                        ? "text-emerald-600 dark:text-emerald-400 font-medium"
                        : isCurrent
                        ? "text-amber-600 dark:text-amber-400 font-medium"
                        : "text-slate-400 dark:text-slate-500"
                    }`}
                  >
                    {formatDateShort(m.dueDate, m.status)}
                  </p>
                </button>
              </div>

              {/* Connecting Line + Arrow to Next Stage */}
              {!isLast && (
                <div className="flex items-center flex-1 px-2 mt-3">
                  <div
                    className={`h-0.5 flex-1 rounded-full ${
                      isDone
                        ? "bg-emerald-500/70"
                        : "bg-slate-200 dark:bg-slate-800"
                    }`}
                  />
                  <ArrowRight
                    className={`h-3.5 w-3.5 -ml-1 shrink-0 ${
                      isDone
                        ? "text-emerald-500"
                        : "text-slate-300 dark:text-slate-700"
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* MOBILE: Clean Vertical Connected Timeline */}
      <div className="md:hidden space-y-0">
        {milestones.map((m, idx) => {
          const isLast = idx === milestones.length - 1;
          const isDone = m.status === "COMPLETED";
          const isCurrent = m.status === "IN_PROGRESS";

          return (
            <div key={m.id} className="flex items-stretch gap-3">
              {/* Left Vertical Line + Circle Node */}
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => handleCycleStatus(m)}
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                    isDone
                      ? "bg-emerald-600 text-white"
                      : isCurrent
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                      : "border-2 border-slate-300 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-900"
                  }`}
                >
                  {isDone ? <Check className="h-3 w-3" /> : idx + 1}
                </button>
                {!isLast && (
                  <div
                    className={`w-0.5 flex-1 my-1 ${
                      isDone
                        ? "bg-emerald-500/60"
                        : "bg-slate-200 dark:bg-slate-800"
                    }`}
                  />
                )}
              </div>

              {/* Right Content Row */}
              <div className={`flex-1 flex items-center justify-between gap-2 ${isLast ? "pb-0" : "pb-3.5"}`}>
                <button
                  type="button"
                  onClick={() => startEditing(m)}
                  className="text-left min-w-0"
                >
                  <p
                    className={`text-xs font-semibold truncate ${
                      isDone
                        ? "text-slate-600 dark:text-slate-300"
                        : "text-slate-900 dark:text-white"
                    }`}
                  >
                    {m.title}
                  </p>
                  <p
                    className={`text-[11px] ${
                      isDone
                        ? "text-emerald-600 dark:text-emerald-400"
                        : isCurrent
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-slate-400"
                    }`}
                  >
                    {formatDateShort(m.dueDate, m.status)}
                  </p>
                </button>

                {!previewMode && (
                  <button
                    type="button"
                    onClick={() => startEditing(m)}
                    className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 shrink-0"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Compact Single-Row Inline Editor (Only shown when editing or adding a stage) */}
      {activeEditItem && (
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Stage title"
            className="flex-1 min-w-[160px] rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-white outline-none"
          />
          <input
            type="date"
            value={editDate}
            onChange={(e) => setEditDate(e.target.value)}
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 text-xs text-slate-900 dark:text-white outline-none"
          />
          <select
            value={editStatus}
            onChange={(e) => setEditStatus(e.target.value as MilestoneStatus)}
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 text-xs text-slate-900 dark:text-white outline-none"
          >
            <option value="UPCOMING">Upcoming</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
          <button
            type="button"
            onClick={() => saveEdit(activeEditItem.id)}
            className="rounded-lg bg-slate-900 dark:bg-white px-3 py-1.5 text-xs font-semibold text-white dark:text-slate-900 cursor-pointer"
          >
            Save
          </button>
          {milestones.length > 1 && (
            <button
              type="button"
              onClick={() => handleDelete(activeEditItem.id)}
              className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer"
              title="Delete stage"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setEditingId(null)}
            className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {isAdding && (
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2">
          <input
            type="text"
            placeholder="New stage title (e.g. Prototype Demo)"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="flex-1 min-w-[160px] rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-white outline-none"
          />
          <input
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 text-xs text-slate-900 dark:text-white outline-none"
          />
          <button
            type="button"
            onClick={handleAddMilestone}
            className="rounded-lg bg-slate-900 dark:bg-white px-3 py-1.5 text-xs font-semibold text-white dark:text-slate-900 cursor-pointer"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => setIsAdding(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
