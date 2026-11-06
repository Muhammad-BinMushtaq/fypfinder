"use client";

import { useState } from "react";
import { Plus, Check, X, Pencil } from "lucide-react";
import { toast } from "react-toastify";
import {
  useUpdateWorkspaceMeta,
  type GroupWorkspaceMeta,
  type SupervisorMeetingItem,
  type SupervisorStatus,
} from "@/services/workspace.service";
import {
  Sheet,
  btnPrimary,
  btnSecondary,
  btnGhost,
  btnDangerText,
  inputCls,
  textareaCls,
  labelCls,
  cardSurface,
} from "./workspaceUi";

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

const STATUS_TEXT: Record<SupervisorStatus, string> = {
  NOT_DECIDED: "Not decided",
  APPROACHED: "Approached",
  CONFIRMED: "Confirmed",
};

export function SupervisorLog({
  groupId,
  meta,
  currentUserName,
  onConvertActionToTask,
}: SupervisorLogProps) {
  const updateMeta = useUpdateWorkspaceMeta(groupId);

  const [showSupervisor, setShowSupervisor] = useState(false);
  const [supName, setSupName] = useState("");
  const [supStatus, setSupStatus] = useState<SupervisorStatus>("NOT_DECIDED");

  const [showMeeting, setShowMeeting] = useState(false);
  const [meetingDate, setMeetingDate] = useState("");
  const [summary, setSummary] = useState("");
  const [actionInputs, setActionInputs] = useState<string[]>([""]);

  const meetings: SupervisorMeetingItem[] = meta?.supervisorMeetings || [];

  const openSupervisorEditor = () => {
    setSupName(meta?.supervisorName || "");
    setSupStatus(meta?.supervisorStatus || "NOT_DECIDED");
    setShowSupervisor(true);
  };

  const openMeetingForm = () => {
    setMeetingDate(new Date().toISOString().split("T")[0]);
    setSummary("");
    setActionInputs([""]);
    setShowMeeting(true);
  };

  const saveSupervisor = (e: React.FormEvent) => {
    e.preventDefault();
    updateMeta.mutate(
      { supervisorName: supName.trim() || null, supervisorStatus: supStatus },
      {
        onSuccess: () => {
          setShowSupervisor(false);
          toast.success("Supervisor updated");
        },
        onError: (err: any) =>
          toast.error(err?.message || "Failed to update supervisor"),
      }
    );
  };

  const saveMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!summary.trim()) {
      toast.error("Please add the feedback or discussion notes");
      return;
    }

    const actionItems = actionInputs
      .map((t) => t.trim())
      .filter(Boolean)
      .map((text, idx) => ({
        id: `act-${Date.now()}-${idx}`,
        text,
        completed: false,
        linkedTaskId: null,
      }));

    const meeting: SupervisorMeetingItem = {
      id: `mtg-${Date.now()}`,
      date: meetingDate || new Date().toISOString().split("T")[0],
      summary: summary.trim(),
      actionItems,
      createdByName: currentUserName || null,
      createdAt: new Date().toISOString(),
    };

    updateMeta.mutate(
      { supervisorMeetings: [meeting, ...meetings] },
      {
        onSuccess: () => {
          setShowMeeting(false);
          toast.success("Meeting saved");
        },
        onError: (err: any) =>
          toast.error(err?.message || "Failed to save meeting"),
      }
    );
  };

  const toggleAction = (meetingId: string, actionId: string) => {
    updateMeta.mutate({
      supervisorMeetings: meetings.map((m) =>
        m.id !== meetingId
          ? m
          : {
              ...m,
              actionItems: m.actionItems.map((a) =>
                a.id === actionId ? { ...a, completed: !a.completed } : a
              ),
            }
      ),
    });
  };

  const deleteMeeting = (meetingId: string) => {
    if (!window.confirm("Delete this meeting record?")) return;
    updateMeta.mutate(
      { supervisorMeetings: meetings.filter((m) => m.id !== meetingId) },
      { onSuccess: () => toast.success("Meeting deleted") }
    );
  };

  const currentStatus = meta?.supervisorStatus || "NOT_DECIDED";

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Supervisor Summary Card */}
      <section className={`${cardSurface} p-4 sm:p-5`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Project Supervisor
              </p>
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                  currentStatus === "CONFIRMED"
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                    : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                {STATUS_TEXT[currentStatus]}
              </span>
            </div>
            <h2 className="mt-1 text-base font-semibold text-slate-900 dark:text-white">
              {meta?.supervisorName || "Not assigned yet"}
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={openSupervisorEditor}
              className={`${btnSecondary} !h-9 !px-3 text-xs sm:text-sm`}
            >
              <Pencil className="h-3.5 w-3.5 text-slate-400" />
              <span>Edit</span>
            </button>
            <button
              type="button"
              onClick={openMeetingForm}
              className={`${btnPrimary} !h-9 !px-3.5 text-xs sm:text-sm`}
            >
              <Plus className="h-4 w-4" />
              <span>Log meeting</span>
            </button>
          </div>
        </div>
      </section>

      {/* Meeting History Card */}
      <section className={`${cardSurface} p-4 sm:p-5 space-y-4`}>
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            Meeting history
          </h2>
          {meetings.length > 0 && (
            <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-600 dark:text-slate-300">
              {meetings.length}
            </span>
          )}
        </div>

        {meetings.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 px-4 py-8 text-center">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              No meetings recorded yet
            </p>
            <p className="mx-auto mt-1 max-w-sm text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              After meeting your supervisor, log the feedback and agreed action items so the whole team stays aligned.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
            {meetings.map((mtg) => (
              <li key={mtg.id} className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {new Date(mtg.date).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                    {mtg.createdByName && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Recorded by {mtg.createdByName}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteMeeting(mtg.id)}
                    className={`${btnDangerText} !h-8 !px-2 text-xs -mr-1.5`}
                  >
                    Delete
                  </button>
                </div>

                <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  {mtg.summary}
                </p>

                {mtg.actionItems?.length > 0 && (
                  <div className="rounded-xl bg-slate-50/70 dark:bg-slate-800/40 p-3 space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Action items
                    </p>
                    <ul className="space-y-1.5">
                      {mtg.actionItems.map((act) => (
                        <li
                          key={act.id}
                          className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <button
                            type="button"
                            onClick={() => toggleAction(mtg.id, act.id)}
                            className="flex min-h-8 flex-1 items-start sm:items-center gap-2.5 text-left cursor-pointer"
                          >
                            <span
                              className={`mt-0.5 sm:mt-0 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded border transition-colors ${
                                act.completed
                                  ? "border-emerald-600 bg-emerald-600 text-white"
                                  : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                              }`}
                            >
                              {act.completed && (
                                <Check className="h-3 w-3" />
                              )}
                            </span>
                            <span
                              className={`text-xs sm:text-sm leading-snug ${
                                act.completed
                                  ? "text-slate-400 line-through"
                                  : "text-slate-800 dark:text-slate-200"
                              }`}
                            >
                              {act.text}
                            </span>
                          </button>

                          {act.linkedTaskId ? (
                            <span className="pl-7 text-xs font-medium text-emerald-600 dark:text-emerald-400 sm:pl-0 shrink-0">
                              Added to tasks
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
                              className={`${btnGhost} !h-7 !px-2 text-xs self-start ml-7 sm:ml-0 sm:self-auto shrink-0`}
                            >
                              + Add to tasks
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {showSupervisor && (
        <Sheet
          title="Supervisor details"
          onClose={() => setShowSupervisor(false)}
          footer={
            <>
              <button
                type="button"
                onClick={() => setShowSupervisor(false)}
                className={btnSecondary}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="supervisor-form"
                disabled={updateMeta.isPending}
                className={btnPrimary}
              >
                Save
              </button>
            </>
          }
        >
          <form
            id="supervisor-form"
            onSubmit={saveSupervisor}
            className="space-y-4"
          >
            <div>
              <label className={labelCls} htmlFor="sv-name">
                Supervisor name
              </label>
              <input
                id="sv-name"
                value={supName}
                onChange={(e) => setSupName(e.target.value)}
                placeholder="e.g. Dr. Muhammad Bilal"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls} htmlFor="sv-status">
                Status
              </label>
              <select
                id="sv-status"
                value={supStatus}
                onChange={(e) =>
                  setSupStatus(e.target.value as SupervisorStatus)
                }
                className={inputCls}
              >
                <option value="NOT_DECIDED">Not decided</option>
                <option value="APPROACHED">Approached</option>
                <option value="CONFIRMED">Confirmed</option>
              </select>
            </div>
          </form>
        </Sheet>
      )}

      {showMeeting && (
        <Sheet
          title="Log a supervisor meeting"
          description="Record what your supervisor advised and what the team agreed to work on."
          onClose={() => setShowMeeting(false)}
          wide
          footer={
            <>
              <button
                type="button"
                onClick={() => setShowMeeting(false)}
                className={btnSecondary}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="meeting-form"
                disabled={updateMeta.isPending}
                className={btnPrimary}
              >
                {updateMeta.isPending ? "Saving..." : "Save meeting"}
              </button>
            </>
          }
        >
          <form id="meeting-form" onSubmit={saveMeeting} className="space-y-4">
            <div>
              <label className={labelCls} htmlFor="mt-date">
                Meeting date
              </label>
              <input
                id="mt-date"
                type="date"
                value={meetingDate}
                onChange={(e) => setMeetingDate(e.target.value)}
                required
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls} htmlFor="mt-summary">
                Feedback & discussion notes
              </label>
              <textarea
                id="mt-summary"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={4}
                required
                placeholder="e.g. Approved the ER diagram. Asked us to add a comparison table to Chapter 3."
                className={textareaCls}
              />
            </div>

            <div>
              <span className={labelCls}>Action items (optional)</span>
              <div className="space-y-2">
                {actionInputs.map((val, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      value={val}
                      onChange={(e) =>
                        setActionInputs((prev) =>
                          prev.map((v, i) => (i === idx ? e.target.value : v))
                        )
                      }
                      placeholder={`Action item ${idx + 1}`}
                      aria-label={`Action item ${idx + 1}`}
                      className={inputCls}
                    />
                    {actionInputs.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setActionInputs((prev) =>
                            prev.filter((_, i) => i !== idx)
                          )
                        }
                        aria-label="Remove action item"
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {actionInputs.length < 8 && (
                <button
                  type="button"
                  onClick={() => setActionInputs((prev) => [...prev, ""])}
                  className={`${btnGhost} mt-1.5 -ml-2`}
                >
                  <Plus className="h-4 w-4" />
                  Add another action item
                </button>
              )}
            </div>
          </form>
        </Sheet>
      )}
    </div>
  );
}
