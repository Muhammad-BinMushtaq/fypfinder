"use client";

import { useState } from "react";
import { Calendar, Trash, X } from "lucide-react";
import type { FYPTask } from "@/services/workspace.service";

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
}: TaskDetailModalProps) {
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [assignedToId, setAssignedToId] = useState(task?.assignedToId || "");
  const [status, setStatus] = useState(task?.status || defaultStatus);
  const [dueDate, setDueDate] = useState(
    task?.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : ""
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      taskId: task?.id,
      title,
      description,
      assignedToId: assignedToId || null,
      status,
      dueDate: dueDate || null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-gray-100 p-5 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {task ? "Edit Task" : "New Task"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-slate-800 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5">
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What needs to be done?"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 dark:border-slate-700 dark:bg-slate-800"
                autoFocus
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add more details..."
                rows={3}
                className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 dark:border-slate-700 dark:bg-slate-800"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 dark:border-slate-700 dark:bg-slate-800"
                >
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="REVIEW">Under Review</option>
                  <option value="DONE">Done</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Assignee
                </label>
                <select
                  value={assignedToId}
                  onChange={(e) => setAssignedToId(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 dark:border-slate-700 dark:bg-slate-800"
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
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Due Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between">
            {task && onDelete ? (
              <button
                type="button"
                onClick={() => onDelete(task.id)}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:hover:bg-red-950/30"
              >
                <Trash className="h-4 w-4" />
                Delete
              </button>
            ) : (
              <div />
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving || !title.trim()}
                className="rounded-xl bg-gray-900 px-6 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
              >
                {isSaving ? "Saving..." : "Save Task"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
