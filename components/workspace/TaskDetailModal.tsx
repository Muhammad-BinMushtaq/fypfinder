"use client";

import { useState, useEffect } from "react";
import { Calendar, Trash, X, Link2 } from "lucide-react";
import type { FYPTask, TaskPriority } from "@/services/workspace.service";

interface Member {
  id: string;
  name: string;
  profilePicture: string | null;
}

interface TaskDetailModalProps {
  task?: FYPTask;
  members: Member[];
  onClose: () => void;
  onSave: (data: any) => void;
  onDelete?: (taskId: string) => void;
  isSaving: boolean;
  isDeleting?: boolean;
  defaultStatus?: string;
  isReadOnly?: boolean;
}

export function TaskDetailModal({
  task,
  members,
  onClose,
  onSave,
  onDelete,
  isSaving,
  isDeleting,
  defaultStatus = "TODO",
  isReadOnly = false,
}: TaskDetailModalProps) {
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [assignedToId, setAssignedToId] = useState(task?.assignedToId || "");
  const [status, setStatus] = useState(task?.status || defaultStatus);
  const [priority, setPriority] = useState<TaskPriority>(
    task?.priority || "MEDIUM"
  );
  const [deliverableUrl, setDeliverableUrl] = useState(
    task?.deliverableUrl || ""
  );
  const [dueDate, setDueDate] = useState(
    task?.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : ""
  );

  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.body.classList.add("modal-open");
    return () => {
      document.body.style.overflow = "unset";
      document.body.classList.remove("modal-open");
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) {
      onClose();
      return;
    }
    if (!title.trim()) return;

    onSave({
      taskId: task?.id,
      title: title.trim(),
      description: description.trim() || null,
      assignedToId: assignedToId || null,
      status,
      priority,
      deliverableUrl: deliverableUrl.trim() || null,
      dueDate: dueDate || null,
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200/80 px-5 py-4 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {isReadOnly
                ? "Task Preview"
                : task
                ? "Edit Task"
                : "Assign New Task"}
            </h2>
            {isReadOnly ? (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                Initialize or join a group to create live tasks
              </p>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Assigned teammates are notified automatically via email
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Task Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Complete Database ER Diagram & API Routes"
              disabled={isReadOnly}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 px-3.5 py-2 text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-slate-400 dark:focus:border-slate-600"
              autoFocus
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Description / Requirements
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline specific deliverables or acceptance criteria..."
              disabled={isReadOnly}
              rows={3}
              className="w-full resize-none rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 px-3.5 py-2 text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-slate-400 dark:focus:border-slate-600"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Assign To Teammate
              </label>
              <select
                value={assignedToId}
                onChange={(e) => setAssignedToId(e.target.value)}
                disabled={isReadOnly}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white outline-none"
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Due Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  disabled={isReadOnly}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white outline-none"
                />
                {!dueDate && (
                  <Calendar className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                disabled={isReadOnly}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white outline-none"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                disabled={isReadOnly}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white outline-none"
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="REVIEW">Under Review</option>
                <option value="DONE">Done</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <Link2 className="h-3.5 w-3.5 text-slate-400" />
              <span>Deliverable / PR / Document Link (Optional)</span>
            </label>
            <input
              type="url"
              value={deliverableUrl}
              onChange={(e) => setDeliverableUrl(e.target.value)}
              placeholder="https://github.com/... or Google Drive link"
              disabled={isReadOnly}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 px-3.5 py-2 text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-slate-400"
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-200/80 dark:border-slate-800">
            {task && onDelete && !isReadOnly ? (
              <button
                type="button"
                onClick={() => onDelete(task.id)}
                disabled={isDeleting || isSaving}
                className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 cursor-pointer"
              >
                <Trash className="h-3.5 w-3.5" />
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            ) : (
              <div />
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                {isReadOnly ? "Close" : "Cancel"}
              </button>
              {!isReadOnly && (
                <button
                  type="submit"
                  disabled={isSaving || isDeleting}
                  className="rounded-xl bg-slate-900 dark:bg-white px-5 py-2 text-xs font-semibold text-white dark:text-slate-900 hover:opacity-90 disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? "Saving..." : "Save Task"}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
