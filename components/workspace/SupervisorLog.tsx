"use client";

import { useState } from "react";
import { Plus, Check, X } from "lucide-react";
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

  return (
    <div className="space-y-8">
      {/* Supervisor */}
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm text-slate-500 dark:text-slate-400">Supervisor</p>
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            {meta?.supervisorName || "Not assigned yet"}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {STATUS_TEXT[meta?.supervisorStatus || "NOT_DECIDED"]}
            <button
              type="button"
              onClick={openSupervisorEditor}
              className="ml-3 underline underline-offset-2 hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              Edit
            </button>
          </p>
        </div>
        <button type="button" onClick={openMeetingForm} className={btnPrimary}>
          <Plus className="h-4 w-4" />
          Log a meeting
        </button>
      </section>

      {/* Meeting history */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          Meeting history{" "}
          <span className="font-normal text-slate-500">{meetings.length}</span>
        </h2>

        {meetings.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 px-5 py-8 text-center">
            <p className="text-sm font-medium text-slate-900 dark:text-white">
              No meetings recorded
            </p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
              After meeting your supervisor, note the feedback and what you agreed to do, so
              the whole team remembers it.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800 rounded-xl border border-slate-200 dark:border-slate-800">
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
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Recorded by {mtg.createdByName}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteMeeting(mtg.id)}
                    className={`${btnDangerText} -mr-2`}
                  >
                    Delete
                  </button>
                </div>

                <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  {mtg.summary}
                </p>

                {mtg.actionItems?.length > 0 && (
                  <div>
                    <p className="mb-1 text-sm font-medium text-slate-900 dark:text-white">
                      Action items
                    </p>
                    <ul className="space-y-0.5">
                      {mtg.actionItems.map((act) => (
                        <li
                          key={act.id}
                          className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <button
                            type="button"
                            onClick={() => toggleAction(mtg.id, act.id)}
                            className="flex min-h-10 flex-1 items-center gap-3 text-left cursor-pointer"
                          >
                            <span
                              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                                act.completed
                                  ? "border-emerald-600 bg-emerald-600 text-white"
                                  : "border-slate-300 dark:border-slate-600"
                              }`}
                            >
                              {act.completed && <Check className="h-3.5 w-3.5" />}
                            </span>
                            <span
                              className={`text-sm ${
                                act.completed
                                  ? "text-slate-400 line-through"
                                  : "text-slate-800 dark:text-slate-200"
                              }`}
                            >
                              {act.text}
                            </span>
                          </button>

                          {act.linkedTaskId ? (
                            <span className="pl-8 text-sm text-slate-500 sm:pl-0">
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
                              className={`${btnGhost} self-start pl-8 sm:pl-2.5 sm:self-auto`}
                            >
                              Add to tasks
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
          title="Supervisor"
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
          <form id="supervisor-form" onSubmit={saveSupervisor} className="space-y-4">
            <div>
              <label className={labelCls} htmlFor="sv-name">
                Name
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
                onChange={(e) => setSupStatus(e.target.value as SupervisorStatus)}
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
          title="Log a meeting"
          description="Record what your supervisor said and what the team agreed to do."
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
                Date
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
                Feedback and discussion
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
                          setActionInputs((prev) => prev.filter((_, i) => i !== idx))
                        }
                        aria-label="Remove action item"
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
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
                  className={`${btnGhost} mt-1 -ml-2.5`}
                >
                  <Plus className="h-4 w-4" />
                  Add another
                </button>
              )}
            </div>
          </form>
        </Sheet>
      )}
    </div>
  );
}
