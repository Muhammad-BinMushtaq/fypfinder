"use client";

import { useState } from "react";
import {
  GraduationCap,
  Plus,
  Calendar,
  Check,
  Trash2,
  ArrowUpRight,
  Edit2,
  X,
  Save,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  useUpdateWorkspaceMeta,
  type GroupWorkspaceMeta,
  type SupervisorMeetingItem,
  type SupervisorStatus,
} from "@/services/workspace.service";

interface SupervisorLogProps {
  groupId: string;
  meta?: GroupWorkspaceMeta;
  currentUserName?: string;
  onConvertActionToTask: (action: {
    meetingId: string;
    actionId: string;
    text: string;
    meetingDate: string;
  }) => void;
}

export function SupervisorLog({
  groupId,
  meta,
  currentUserName,
  onConvertActionToTask,
}: SupervisorLogProps) {
  const updateMeta = useUpdateWorkspaceMeta(groupId);

  // Supervisor info inline edit state
  const [isEditingSupervisor, setIsEditingSupervisor] = useState(false);
  const [supName, setSupName] = useState(meta?.supervisorName || "");
  const [supStatus, setSupStatus] = useState<SupervisorStatus>(
    meta?.supervisorStatus || "NOT_DECIDED"
  );

  // New Meeting Log form state
  const [isAddingMeeting, setIsAddingMeeting] = useState(false);
  const [meetingDate, setMeetingDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [summary, setSummary] = useState("");
  const [actionInputs, setActionInputs] = useState<string[]>([""]);

  const meetings: SupervisorMeetingItem[] = meta?.supervisorMeetings || [];

  const handleSaveSupervisorDetails = () => {
    updateMeta.mutate(
      {
        supervisorName: supName.trim() || null,
        supervisorStatus: supStatus,
      },
      {
        onSuccess: () => {
          setIsEditingSupervisor(false);
          toast.success("Supervisor details updated");
        },
        onError: (err: any) => {
          toast.error(err?.message || "Failed to update supervisor");
        },
      }
    );
  };

  const handleAddActionRow = () => {
    if (actionInputs.length >= 8) return;
    setActionInputs((prev) => [...prev, ""]);
  };

  const handleUpdateActionRow = (idx: number, val: string) => {
    setActionInputs((prev) => prev.map((item, i) => (i === idx ? val : item)));
  };

  const handleRemoveActionRow = (idx: number) => {
    if (actionInputs.length <= 1) {
      setActionInputs([""]);
      return;
    }
    setActionInputs((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSaveNewMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!summary.trim()) {
      toast.error("Please enter supervisor feedback or discussion notes");
      return;
    }

    const validActions = actionInputs
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
      .map((text, idx) => ({
        id: `act-${Date.now()}-${idx}`,
        text,
        completed: false,
        linkedTaskId: null,
      }));

    const newMeeting: SupervisorMeetingItem = {
      id: `mtg-${Date.now()}`,
      date: meetingDate || new Date().toISOString().split("T")[0],
      summary: summary.trim(),
      actionItems: validActions,
      createdByName: currentUserName || null,
      createdAt: new Date().toISOString(),
    };

    const nextMeetings = [newMeeting, ...meetings];
    updateMeta.mutate(
      { supervisorMeetings: nextMeetings },
      {
        onSuccess: () => {
          setIsAddingMeeting(false);
          setSummary("");
          setActionInputs([""]);
          toast.success("Supervisor meeting recorded");
        },
        onError: (err: any) => {
          toast.error(err?.message || "Failed to save meeting");
        },
      }
    );
  };

  const handleToggleActionCompleted = (meetingId: string, actionId: string) => {
    const nextMeetings = meetings.map((m) => {
      if (m.id !== meetingId) return m;
      return {
        ...m,
        actionItems: m.actionItems.map((a) =>
          a.id === actionId ? { ...a, completed: !a.completed } : a
        ),
      };
    });

    updateMeta.mutate({ supervisorMeetings: nextMeetings });
  };

  const handleDeleteMeeting = (meetingId: string) => {
    const nextMeetings = meetings.filter((m) => m.id !== meetingId);
    updateMeta.mutate(
      { supervisorMeetings: nextMeetings },
      {
        onSuccess: () => toast.success("Meeting entry removed"),
      }
    );
  };

  return (
    <div className="space-y-5">
      {/* 1. Supervisor Information Card */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-xs">
        {!isEditingSupervisor ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {meta?.supervisorName || "Supervisor Not Assigned Yet"}
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      meta?.supervisorStatus === "CONFIRMED"
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                        : meta?.supervisorStatus === "APPROACHED"
                        ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                    }`}
                  >
                    {meta?.supervisorStatus === "CONFIRMED"
                      ? "Confirmed"
                      : meta?.supervisorStatus === "APPROACHED"
                      ? "Approached"
                      : "Not Decided"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Keep a chronological record of supervisor meetings, feedback, and action items before evaluations.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => {
                  setSupName(meta?.supervisorName || "");
                  setSupStatus(meta?.supervisorStatus || "NOT_DECIDED");
                  setIsEditingSupervisor(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Edit Supervisor
              </button>
              {!isAddingMeeting && (
                <button
                  type="button"
                  onClick={() => setIsAddingMeeting(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Log Meeting
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Supervisor Details
              </h4>
              <button
                type="button"
                onClick={() => setIsEditingSupervisor(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Supervisor Name
                </label>
                <input
                  type="text"
                  value={supName}
                  onChange={(e) => setSupName(e.target.value)}
                  placeholder="e.g. Dr. Muhammad Bilal"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Confirmation Status
                </label>
                <select
                  value={supStatus}
                  onChange={(e) =>
                    setSupStatus(e.target.value as SupervisorStatus)
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                >
                  <option value="NOT_DECIDED">Not Decided</option>
                  <option value="APPROACHED">Approached</option>
                  <option value="CONFIRMED">Confirmed</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveSupervisorDetails}
                disabled={updateMeta.isPending}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-semibold cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                Save
              </button>
              <button
                type="button"
                onClick={() => setIsEditingSupervisor(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. New Meeting Form */}
      {isAddingMeeting && (
        <form
          onSubmit={handleSaveNewMeeting}
          className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 space-y-4 shadow-xs"
        >
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Record Supervisor Meeting & Feedback
            </h3>
            <button
              type="button"
              onClick={() => setIsAddingMeeting(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Meeting Date
              </label>
              <input
                type="date"
                value={meetingDate}
                onChange={(e) => setMeetingDate(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Supervisor Feedback / Discussion Summary *
              </label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={2}
                required
                placeholder="What did your supervisor review or suggest? (e.g. Approved ER diagram, asked to add benchmark comparison table in Chapter 3)"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white resize-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Agreed Action Items (Optional — can be converted to board tasks)
              </label>
              <button
                type="button"
                onClick={handleAddActionRow}
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Item
              </button>
            </div>

            <div className="space-y-2">
              {actionInputs.map((val, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={val}
                    onChange={(e) => handleUpdateActionRow(idx, e.target.value)}
                    placeholder={`Action item #${idx + 1} (e.g. Update architecture diagram with API gateway)`}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                  {actionInputs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveActionRow(idx)}
                      className="p-1.5 text-slate-400 hover:text-red-500"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingMeeting(false)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateMeta.isPending}
              className="px-4 py-1.5 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-semibold hover:bg-slate-800 disabled:opacity-50 cursor-pointer"
            >
              {updateMeta.isPending ? "Saving..." : "Save Meeting Record"}
            </button>
          </div>
        </form>
      )}

      {/* 3. Chronological Meeting History */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden shadow-xs">
        <div className="px-5 py-3.5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Meeting History & Action Items ({meetings.length})
          </h3>
        </div>

        {meetings.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
              No supervisor meetings logged yet
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              After each meeting with your supervisor, record their feedback and action items here so your team stays aligned before defense evaluations.
            </p>
            {!isAddingMeeting && (
              <button
                type="button"
                onClick={() => setIsAddingMeeting(true)}
                className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-semibold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Log First Meeting
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-200/70 dark:divide-slate-800">
            {meetings.map((mtg) => (
              <div key={mtg.id} className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      {new Date(mtg.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    {mtg.createdByName && (
                      <span className="text-[11px] text-slate-400">
                        Logged by {mtg.createdByName}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteMeeting(mtg.id)}
                    className="p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400 cursor-pointer"
                    title="Delete meeting log"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {mtg.summary}
                </p>

                {mtg.actionItems && mtg.actionItems.length > 0 && (
                  <div className="rounded-xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 p-3 space-y-2">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Agreed Action Items
                    </div>
                    <div className="space-y-1.5">
                      {mtg.actionItems.map((act) => (
                        <div
                          key={act.id}
                          className="flex items-center justify-between gap-2 py-1"
                        >
                          <button
                            type="button"
                            onClick={() =>
                              handleToggleActionCompleted(mtg.id, act.id)
                            }
                            className="flex items-center gap-2.5 text-left min-w-0 flex-1 cursor-pointer"
                          >
                            <div
                              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                                act.completed
                                  ? "border-emerald-600 bg-emerald-600 text-white"
                                  : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                              }`}
                            >
                              {act.completed && <Check className="h-3 w-3" />}
                            </div>
                            <span
                              className={`text-xs ${
                                act.completed
                                  ? "line-through text-slate-400 dark:text-slate-500"
                                  : "text-slate-800 dark:text-slate-200"
                              }`}
                            >
                              {act.text}
                            </span>
                          </button>

                          {act.linkedTaskId ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 shrink-0">
                              On Task Board
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                onConvertActionToTask({
                                  meetingId: mtg.id,
                                  actionId: act.id,
                                  text: act.text,
                                  meetingDate: mtg.date,
                                })
                              }
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 shrink-0 cursor-pointer"
                            >
                              <span>Convert to Task</span>
                              <ArrowUpRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
