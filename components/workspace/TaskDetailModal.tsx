"use client";

import { useState } from "react";
import { Trash2, Link2, Flag } from "lucide-react";
import type {
  FYPTask,
  TaskPriority,
  FYPMilestoneItem,
} from "@/services/workspace.service";
import {
  Sheet,
  btnPrimary,
  btnSecondary,
  btnDangerText,
  inputCls,
  textareaCls,
  labelCls,
} from "./workspaceUi";

interface Member {
  id: string;
  name: string;
  profilePicture: string | null;
}

interface TaskDetailModalProps {
  task?: FYPTask;
  prefill?: {
    title?: string;
    description?: string;
    milestoneId?: string | null;
  } | null;
  members: Member[];
  milestones?: FYPMilestoneItem[];
  onClose: () => void;
  onSave: (data: any) => void;
  onDelete?: (taskId: string) => void;
  isSaving: boolean;
  isDeleting?: boolean;
  defaultStatus?: string;
  defaultMilestoneId?: string | null;
  isReadOnly?: boolean;
}

export function TaskDetailModal({
  task,
  prefill,
  members,
  milestones = [],
  onClose,
  onSave,
  onDelete,
  isSaving,
  isDeleting,
  defaultStatus = "TODO",
  defaultMilestoneId = null,
  isReadOnly = false,
}: TaskDetailModalProps) {
  const [title, setTitle] = useState(task?.title || prefill?.title || "");
  const [description, setDescription] = useState(
    task?.description || prefill?.description || ""
  );
  const [assignedToId, setAssignedToId] = useState(task?.assignedToId || "");
  const [status, setStatus] = useState(task?.status || defaultStatus);
  const [priority, setPriority] = useState<TaskPriority>(
    task?.priority || "MEDIUM"
  );
  const [milestoneId, setMilestoneId] = useState<string>(
    task?.milestoneId ||
      prefill?.milestoneId ||
      (defaultMilestoneId &&
      defaultMilestoneId !== "ALL" &&
      defaultMilestoneId !== "UNLINKED"
        ? defaultMilestoneId
        : "")
  );
  const [deliverableUrl, setDeliverableUrl] = useState(
    task?.deliverableUrl || ""
  );
  const [dueDate, setDueDate] = useState(
    task?.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : ""
  );

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
      milestoneId: milestoneId || null,
      deliverableUrl: deliverableUrl.trim() || null,
      dueDate: dueDate || null,
    });
  };

  return (
    <Sheet
      title={
        isReadOnly ? "Task preview" : task ? "Edit task" : "New task"
      }
      description={
        isReadOnly
          ? "Create or join a workspace to assign live tasks."
          : "Assigned teammates receive an email notification automatically."
      }
      onClose={onClose}
      footer={
        <div className="flex w-full items-center justify-between gap-2">
          {task && onDelete && !isReadOnly ? (
            <button
              type="button"
              onClick={() => onDelete(task.id)}
              disabled={isDeleting || isSaving}
              className={btnDangerText}
            >
              <Trash2 className="h-4 w-4" />
              <span>{isDeleting ? "Deleting..." : "Delete"}</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className={btnSecondary}
            >
              {isReadOnly ? "Close" : "Cancel"}
            </button>
            {!isReadOnly && (
              <button
                type="submit"
                form="task-detail-form"
                disabled={!title.trim() || isSaving || isDeleting}
                className={btnPrimary}
              >
                {isSaving ? "Saving..." : task ? "Save changes" : "Create task"}
              </button>
            )}
          </div>
        </div>
      }
    >
      <form
        id="task-detail-form"
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <div>
          <label className={labelCls} htmlFor="td-title">
            Task title <span className="text-red-500">*</span>
          </label>
          <input
            id="td-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Complete Database ER Diagram & API Routes"
            disabled={isReadOnly}
            className={inputCls}
            required
          />
        </div>

        <div>
          <label className={labelCls} htmlFor="td-desc">
            Description / requirements
          </label>
          <textarea
            id="td-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Outline specific deliverables or acceptance criteria..."
            disabled={isReadOnly}
            rows={3}
            className={textareaCls}
          />
        </div>

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <div>
            <label className={labelCls} htmlFor="td-assignee">
              Assign to teammate
            </label>
            <select
              id="td-assignee"
              value={assignedToId}
              onChange={(e) => setAssignedToId(e.target.value)}
              disabled={isReadOnly}
              className={inputCls}
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
            <label className={labelCls} htmlFor="td-due">
              Due date
            </label>
            <input
              id="td-due"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              disabled={isReadOnly}
              className={inputCls}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3">
          <div>
            <label className={labelCls} htmlFor="td-priority">
              Priority
            </label>
            <select
              id="td-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              disabled={isReadOnly}
              className={inputCls}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>

          <div>
            <label className={labelCls} htmlFor="td-status">
              Status
            </label>
            <select
              id="td-status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              disabled={isReadOnly}
              className={inputCls}
            >
              <option value="TODO">To do</option>
              <option value="IN_PROGRESS">In progress</option>
              <option value="REVIEW">In review</option>
              <option value="DONE">Done</option>
            </select>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label
              className={`${labelCls} flex items-center gap-1`}
              htmlFor="td-stage"
            >
              <Flag className="h-3.5 w-3.5 text-slate-400" />
              <span>Academic stage</span>
            </label>
            <select
              id="td-stage"
              value={milestoneId}
              onChange={(e) => setMilestoneId(e.target.value)}
              disabled={isReadOnly}
              className={inputCls}
            >
              <option value="">No specific stage</option>
              {milestones.map((ms) => (
                <option key={ms.id} value={ms.id}>
                  {ms.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label
            className={`${labelCls} flex items-center gap-1.5`}
            htmlFor="td-link"
          >
            <Link2 className="h-3.5 w-3.5 text-slate-400" />
            <span>Deliverable / PR / document link (optional)</span>
          </label>
          <input
            id="td-link"
            type="url"
            value={deliverableUrl}
            onChange={(e) => setDeliverableUrl(e.target.value)}
            placeholder="https://github.com/... or Google Drive link"
            disabled={isReadOnly}
            className={inputCls}
          />
        </div>
      </form>
    </Sheet>
  );
}
