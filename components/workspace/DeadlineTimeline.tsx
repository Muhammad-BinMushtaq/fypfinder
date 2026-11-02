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
    title: "Proposal Defense & SRS",
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
    status: "IN_PROGRESS",
    note: "Submit proposal document and defense slides",
  },
  {
    id: "m-3",
    title: "Mid-Semester Evaluation",
    dueDate: new Date(Date.now() + 45 * 86400000).toISOString().split("T")[0],
    status: "UPCOMING",
    note: "System architecture and 40% prototype demo",
  },
  {
    id: "m-4",
    title: "Final Defense & Thesis",
    dueDate: new Date(Date.now() + 90 * 86400000).toISOString().split("T")[0],
    status: "UPCOMING",
    note: "Complete implementation, testing, and final report",
  },
];

function getCountdownLabel(dueDate: string | null, status: MilestoneStatus) {
  if (status === "COMPLETED") return { text: "Completed", tone: "emerald" };
  if (!dueDate) return { text: "Click edit to set date", tone: "slate" };

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
  const progressPercent =
    milestones.length > 0
      ? Math.round((completedCount / milestones.length) * 100)
      : 0;

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
    if (previewMode) return;
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
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
      {/* Header + Progress Bar */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Academic Milestones
            </h3>
            <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
              {completedCount}/{milestones.length} Completed ({progressPercent}%)
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Click any milestone badge to cycle status or click Edit on any card to set target defense dates.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="hidden sm:block w-28 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {!previewMode && !isAdding && (
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Milestone</span>
            </button>
          )}
        </div>
      </div>

      {/* Add New Milestone Inline Form */}
      {isAdding && (
        <div className="mb-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-3.5 space-y-3">
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
              placeholder="Short deliverable note (optional)"
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

      {/* Visual Connected Stepper Cards Grid */}
      <div className="relative grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {milestones.map((m, index) => {
          const isEditingThis = editingId === m.id;
          const countdown = getCountdownLabel(m.dueDate, m.status);

          const cardStyle =
            m.status === "COMPLETED"
              ? "border-emerald-200/90 bg-emerald-50/30 dark:border-emerald-900/40 dark:bg-emerald-950/15"
              : m.status === "IN_PROGRESS"
              ? "border-amber-200/90 bg-amber-50/40 dark:border-amber-900/50 dark:bg-amber-950/20"
              : "border-slate-200/80 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/30";

          return (
            <div
              key={m.id}
              className={`relative flex flex-col justify-between rounded-xl border p-4 transition-all ${cardStyle}`}
            >
              {isEditingThis ? (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Edit Stage {index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Milestone title"
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-slate-900 dark:text-white outline-none"
                  />
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs text-slate-900 dark:text-white outline-none"
                  />
                  <select
                    value={editStatus}
                    onChange={(e) =>
                      setEditStatus(e.target.value as MilestoneStatus)
                    }
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs text-slate-900 dark:text-white outline-none"
                  >
                    <option value="UPCOMING">Upcoming</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                  <input
                    type="text"
                    value={editNote}
                    onChange={(e) => setEditNote(e.target.value)}
                    placeholder="Note / deliverable..."
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs text-slate-900 dark:text-white outline-none"
                  />
                  <div className="flex items-center justify-between pt-1">
                    {milestones.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => handleDelete(m.id)}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-red-600 hover:underline"
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </button>
                    ) : (
                      <span />
                    )}
                    <button
                      type="button"
                      onClick={() => saveEdit(m.id)}
                      className="inline-flex items-center gap-1 rounded-lg bg-slate-900 dark:bg-white px-3 py-1 text-xs font-semibold text-white dark:text-slate-900"
                    >
                      <Check className="h-3 w-3" />
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    {/* Top Row: Step Node + Status Pill + Edit Button */}
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <button
                        type="button"
                        onClick={() => handleCycleStatus(m)}
                        title="Click to cycle status (Upcoming → In Progress → Completed)"
                        className="inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        {m.status === "COMPLETED" ? (
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white shadow-2xs">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          </span>
                        ) : m.status === "IN_PROGRESS" ? (
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-white text-[11px] font-bold shadow-2xs">
                            {index + 1}
                          </span>
                        ) : (
                          <span className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 text-[11px] font-bold">
                            {index + 1}
                          </span>
                        )}

                        <span
                          className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                            m.status === "COMPLETED"
                              ? "bg-emerald-100/80 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                              : m.status === "IN_PROGRESS"
                              ? "bg-amber-100/80 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                              : "bg-slate-200/70 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                          }`}
                        >
                          {m.status === "COMPLETED"
                            ? "Completed"
                            : m.status === "IN_PROGRESS"
                            ? "In Progress"
                            : "Upcoming"}
                        </span>
                      </button>

                      {!previewMode && (
                        <button
                          type="button"
                          onClick={() => startEditing(m)}
                          title="Edit milestone title & date"
                          className="rounded-lg p-1 text-slate-400 hover:bg-white/80 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Title & Note */}
                    <h4
                      className={`text-xs sm:text-sm font-bold leading-snug ${
                        m.status === "COMPLETED"
                          ? "text-slate-700 dark:text-slate-300"
                          : "text-slate-900 dark:text-white"
                      }`}
                    >
                      {m.title}
                    </h4>
                    {m.note && (
                      <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                        {m.note}
                      </p>
                    )}
                  </div>

                  {/* Bottom Row: Target Date & Countdown */}
                  <div className="mt-3.5 pt-2.5 border-t border-slate-200/60 dark:border-slate-800/70 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => startEditing(m)}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:underline"
                    >
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
                    </button>

                    <span
                      className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                        countdown.tone === "emerald"
                          ? "text-emerald-700 dark:text-emerald-400"
                          : countdown.tone === "red"
                          ? "bg-red-100/80 text-red-700 dark:bg-red-950/50 dark:text-red-300"
                          : countdown.tone === "amber"
                          ? "bg-amber-100/80 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300"
                          : "text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      <Clock className="h-2.5 w-2.5" />
                      {countdown.text}
                    </span>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
