"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Clock,
  Calendar,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
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
    title: "Idea & Supervisor Finalization",
    dueDate: new Date(Date.now() - 5 * 86400000).toISOString().split("T")[0],
    status: "COMPLETED",
    note: "Confirm FYP topic and supervisor approval",
  },
  {
    id: "m-2",
    title: "Proposal Defense & SRS Submission",
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
    status: "IN_PROGRESS",
    note: "Submit proposal document and defense slides",
  },
  {
    id: "m-3",
    title: "Mid-Semester Evaluation (FYP-I)",
    dueDate: new Date(Date.now() + 45 * 86400000).toISOString().split("T")[0],
    status: "UPCOMING",
    note: "System architecture and 40% prototype demo",
  },
  {
    id: "m-4",
    title: "Final Defense & Thesis Report",
    dueDate: new Date(Date.now() + 90 * 86400000).toISOString().split("T")[0],
    status: "UPCOMING",
    note: "Complete implementation, testing, and final report",
  },
];

function getCountdownLabel(dueDate: string | null, status: MilestoneStatus) {
  if (status === "COMPLETED") return { text: "Completed", tone: "emerald" };
  if (!dueDate) return { text: "No date set", tone: "slate" };

  const target = new Date(dueDate);
  const now = new Date();
  const diffDays = Math.ceil(
    (target.getTime() - now.setHours(0, 0, 0, 0)) / 86400000
  );

  if (diffDays < 0) {
    return { text: `${Math.abs(diffDays)}d overdue`, tone: "red" };
  }
  if (diffDays === 0) {
    return { text: "Due today", tone: "amber" };
  }
  return { text: `${diffDays}d left`, tone: diffDays <= 7 ? "amber" : "slate" };
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
  const [editNote, setEditNote] = useState("");
  const [editStatus, setEditStatus] = useState<MilestoneStatus>("UPCOMING");

  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newNote, setNewNote] = useState("");

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
    const nextStatus =
      order[(order.indexOf(item.status) + 1) % order.length];
    const nextList = milestones.map((m) =>
      m.id === item.id ? { ...m, status: nextStatus } : m
    );
    handleSaveMilestones(nextList);
  };

  const startEditing = (item: FYPMilestoneItem) => {
    setEditingId(item.id);
    setEditTitle(item.title);
    setEditDate(item.dueDate ? item.dueDate.split("T")[0] : "");
    setEditNote(item.note || "");
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
            note: editNote.trim() || null,
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
      note: newNote.trim() || null,
    };
    handleSaveMilestones([...milestones, newItem]);
    setNewTitle("");
    setNewDate("");
    setNewNote("");
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            FYP Milestones & Deadlines
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Set target defense dates and track stage completion ({completedCount}/
            {milestones.length} completed)
          </p>
        </div>

        {!previewMode && !isAdding && (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Milestone</span>
          </button>
        )}
      </div>

      {/* Add New Milestone Form */}
      {isAdding && (
        <div className="mb-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-3.5 space-y-3">
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            <input
              type="text"
              placeholder="Milestone title (e.g. SRS Submission)"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="sm:col-span-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-white outline-none"
            />
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-white outline-none"
            />
          </div>
          <div className="flex items-center justify-between gap-2">
            <input
              type="text"
              placeholder="Short note or deliverable requirement (optional)"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-white outline-none"
            />
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleAddMilestone}
                className="rounded-lg bg-slate-900 dark:bg-white px-3 py-1.5 text-xs font-semibold text-white dark:text-slate-900 cursor-pointer"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="rounded-lg border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-xs text-slate-600 dark:text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Milestones List */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800/70">
        {milestones.map((m) => {
          const isEditingThis = editingId === m.id;
          const countdown = getCountdownLabel(m.dueDate, m.status);

          if (isEditingThis) {
            return (
              <div key={m.id} className="py-3 space-y-2.5">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="sm:col-span-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-white outline-none"
                  />
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-white outline-none"
                  />
                  <select
                    value={editStatus}
                    onChange={(e) =>
                      setEditStatus(e.target.value as MilestoneStatus)
                    }
                    className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 text-xs text-slate-900 dark:text-white outline-none"
                  >
                    <option value="UPCOMING">Upcoming</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text"
                    value={editNote}
                    onChange={(e) => setEditNote(e.target.value)}
                    placeholder="Milestone note..."
                    className="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-white outline-none"
                  />
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => saveEdit(m.id)}
                      className="inline-flex items-center gap-1 rounded-lg bg-slate-900 dark:bg-white px-3 py-1.5 text-xs font-semibold text-white dark:text-slate-900 cursor-pointer"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>Save</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="rounded-lg border border-slate-200 dark:border-slate-700 p-1.5 text-slate-500 cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div
              key={m.id}
              className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => handleCycleStatus(m)}
                  title="Click to cycle status"
                  className="mt-0.5 shrink-0 cursor-pointer"
                >
                  {m.status === "COMPLETED" ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  ) : m.status === "IN_PROGRESS" ? (
                    <div className="h-4 w-4 rounded-full border-2 border-amber-500 bg-amber-100 dark:bg-amber-950" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-slate-300 dark:border-slate-600" />
                  )}
                </button>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p
                      className={`text-xs sm:text-sm font-semibold ${
                        m.status === "COMPLETED"
                          ? "line-through text-slate-400 dark:text-slate-500"
                          : "text-slate-900 dark:text-white"
                      }`}
                    >
                      {m.title}
                    </p>
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                        m.status === "COMPLETED"
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                          : m.status === "IN_PROGRESS"
                          ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                      }`}
                    >
                      {m.status === "COMPLETED"
                        ? "Completed"
                        : m.status === "IN_PROGRESS"
                        ? "In Progress"
                        : "Upcoming"}
                    </span>
                  </div>
                  {m.note && (
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      {m.note}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <div className="flex items-center gap-1.5 rounded-lg border border-slate-200/70 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 px-2.5 py-1 text-xs text-slate-600 dark:text-slate-300">
                  <Calendar className="h-3 w-3 text-slate-400" />
                  <span>
                    {m.dueDate
                      ? new Date(m.dueDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "Set date"}
                  </span>
                </div>

                <span
                  className={`rounded-md px-2 py-1 text-[10px] font-semibold ${
                    countdown.tone === "emerald"
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                      : countdown.tone === "red"
                      ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300"
                      : countdown.tone === "amber"
                      ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                  }`}
                >
                  {countdown.text}
                </span>

                {!previewMode && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => startEditing(m)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 cursor-pointer"
                      title="Edit milestone date & details"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    {milestones.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDelete(m.id)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 cursor-pointer"
                        title="Remove milestone"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
