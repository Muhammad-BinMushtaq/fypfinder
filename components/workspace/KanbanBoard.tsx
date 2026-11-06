"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Check,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  ExternalLink,
  LayoutGrid,
  List as ListIcon,
  X,
  Calendar,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  useGroupTasks,
  useCreateTask,
  useCreateBatchTasks,
  useUpdateTask,
  useDeleteTask,
  type FYPTask,
  type FYPMilestoneItem,
} from "@/services/workspace.service";
import {
  TaskCard,
  StatusControl,
  STATUS_LABELS,
  isTaskOverdue,
  formatTaskDate,
} from "./TaskCard";
import { TaskDetailModal } from "./TaskDetailModal";
import { STARTER_CHECKLIST_PACKS } from "./starterChecklists";
import {
  Sheet,
  btnPrimary,
  btnSecondary,
  btnGhost,
  inputCls,
  cardSurface,
} from "./workspaceUi";

interface KanbanBoardProps {
  groupId: string;
  members: any[];
  currentStudentId?: string;
  milestones?: FYPMilestoneItem[];
  selectedMilestoneId?: string;
  onSelectMilestone?: (milestoneId: string) => void;
  externalTaskPrefill?: {
    title: string;
    description?: string;
    onCreated?: (taskId: string) => void;
  } | null;
  onClearExternalPrefill?: () => void;
  previewMode?: boolean;
}

const COLUMNS: Array<{
  id: FYPTask["status"];
  title: string;
  mobileTitle: string;
}> = [
  { id: "TODO", title: "To do", mobileTitle: "To do" },
  { id: "IN_PROGRESS", title: "In progress", mobileTitle: "Active" },
  { id: "REVIEW", title: "In review", mobileTitle: "Review" },
  { id: "DONE", title: "Done", mobileTitle: "Done" },
];

// Order in which groups appear in the List view (most active work first).
const LIST_GROUPS: Array<FYPTask["status"]> = [
  "IN_PROGRESS",
  "REVIEW",
  "TODO",
  "DONE",
];

const VIEW_STORAGE_KEY = "fypmate-task-view";

const PREVIEW_TASKS: FYPTask[] = [
  {
    id: "preview-1",
    groupId: "preview-group",
    title: "Literature Review & Research Paper Survey",
    description: null,
    status: "TODO",
    priority: "HIGH",
    milestoneId: "m-1",
    assignedToId: "preview-m1",
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    assignedTo: { id: "preview-m1", name: "Ayesha Malik", profilePicture: null },
  },
  {
    id: "preview-2",
    groupId: "preview-group",
    title: "System Architecture & API Schema Design",
    description: null,
    status: "IN_PROGRESS",
    priority: "HIGH",
    milestoneId: "m-2",
    assignedToId: "preview-m2",
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    assignedTo: { id: "preview-m2", name: "Hamza Tariq", profilePicture: null },
  },
];

function sortByDue(a: FYPTask, b: FYPTask) {
  if (a.dueDate && b.dueDate) {
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  }
  if (a.dueDate) return -1;
  if (b.dueDate) return 1;
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}

export function KanbanBoard({
  groupId,
  members,
  currentStudentId,
  milestones = [],
  selectedMilestoneId,
  onSelectMilestone,
  externalTaskPrefill,
  onClearExternalPrefill,
  previewMode = false,
}: KanbanBoardProps) {
  const { data: serverTasks = [], isLoading } = useGroupTasks(
    groupId,
    !previewMode
  );
  const createTask = useCreateTask(groupId);
  const createBatchTasks = useCreateBatchTasks(groupId);
  const updateTask = useUpdateTask(groupId);
  const deleteTask = useDeleteTask(groupId);

  const [previewTasks, setPreviewTasks] = useState<FYPTask[]>(PREVIEW_TASKS);
  const [activeTask, setActiveTask] = useState<FYPTask | null>(null);
  const [modalPrefill, setModalPrefill] = useState<{
    title?: string;
    description?: string;
    milestoneId?: string | null;
  } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [defaultStatus, setDefaultStatus] = useState("TODO");

  // List is default; last choice is remembered on this device.
  const [viewMode, setViewMode] = useState<"list" | "board">("list");
  const [mobileColumn, setMobileColumn] = useState<FYPTask["status"]>("TODO");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("ALL");
  const [localStage, setLocalStage] = useState<string>("ALL");
  const [showDone, setShowDone] = useState(false);

  const [showChecklists, setShowChecklists] = useState(false);
  const [activePackId, setActivePackId] = useState<string>(
    STARTER_CHECKLIST_PACKS[0].id
  );
  const [selectedPackIndices, setSelectedPackIndices] = useState<number[]>([
    0, 1, 2, 3,
  ]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(VIEW_STORAGE_KEY);
      if (saved === "board" || saved === "list") setViewMode(saved);
    } catch {
      /* ignore storage errors */
    }
  }, []);

  const changeView = (mode: "list" | "board") => {
    setViewMode(mode);
    try {
      window.localStorage.setItem(VIEW_STORAGE_KEY, mode);
    } catch {
      /* ignore storage errors */
    }
  };

  const stageFilter = onSelectMilestone
    ? selectedMilestoneId ?? "ALL"
    : localStage;

  // Open the task dialog when a supervisor action item is converted to a task
  useEffect(() => {
    if (externalTaskPrefill) {
      setActiveTask(null);
      setModalPrefill({
        title: externalTaskPrefill.title,
        description: externalTaskPrefill.description,
        milestoneId: stageFilter !== "ALL" ? stageFilter : undefined,
      });
      setDefaultStatus("TODO");
      setIsModalOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalTaskPrefill]);

  const allTasks = previewMode ? previewTasks : serverTasks;

  const effectiveMembers = previewMode
    ? [
        { id: "preview-m1", name: "Ayesha Malik", profilePicture: null },
        { id: "preview-m2", name: "Hamza Tariq", profilePicture: null },
      ]
    : members;

  const milestoneMap = new Map<string, string>(
    milestones.map((m) => [m.id, m.title])
  );

  const activeStageTitle =
    stageFilter !== "ALL" && stageFilter !== "UNLINKED"
      ? milestoneMap.get(stageFilter)
      : null;

  const filteredTasks = allTasks
    .filter((t) => {
      if (assigneeFilter === "MINE") {
        if (!currentStudentId || t.assignedToId !== currentStudentId)
          return false;
      } else if (assigneeFilter === "UNASSIGNED") {
        if (t.assignedToId) return false;
      } else if (assigneeFilter !== "ALL") {
        if (t.assignedToId !== assigneeFilter) return false;
      }
      if (stageFilter === "UNLINKED") return !t.milestoneId;
      if (stageFilter !== "ALL") return t.milestoneId === stageFilter;
      return true;
    })
    .sort(sortByDue);

  const totalTasks = allTasks.length;
  const doneTasks = allTasks.filter((t) => t.status === "DONE").length;

  const handleInlineStatusChange = (task: FYPTask, newStatus: string) => {
    if (previewMode) {
      setPreviewTasks((prev) =>
        prev.map((t) =>
          t.id === task.id ? { ...t, status: newStatus as FYPTask["status"] } : t
        )
      );
      return;
    }
    if (task.status !== newStatus) {
      updateTask.mutate({ taskId: task.id, status: newStatus });
    }
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("taskId", taskId);
  };

  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    if (!taskId) return;
    const task = allTasks.find((t) => t.id === taskId);
    if (task) handleInlineStatusChange(task, status);
  };

  const openNewTaskModal = (status = "TODO") => {
    if (previewMode) {
      toast.info("Initialize your project space to assign live tasks.");
      return;
    }
    setActiveTask(null);
    setModalPrefill(null);
    setDefaultStatus(status);
    setIsModalOpen(true);
  };

  const openEditTaskModal = (task: FYPTask) => {
    setActiveTask(task);
    setModalPrefill(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalPrefill(null);
    if (onClearExternalPrefill) onClearExternalPrefill();
  };

  const handleSave = (data: any) => {
    if (previewMode) {
      closeModal();
      return;
    }

    if (data.taskId) {
      updateTask.mutate(data, {
        onSuccess: () => {
          closeModal();
          toast.success("Task updated");
        },
        onError: (err: any) =>
          toast.error(err?.message || "Failed to update task"),
      });
    } else {
      createTask.mutate(data, {
        onSuccess: (created) => {
          if (externalTaskPrefill?.onCreated && created?.id) {
            externalTaskPrefill.onCreated(created.id);
          }
          closeModal();
          toast.success(
            data.assignedToId
              ? "Task created and assignee notified by email"
              : "Task created"
          );
        },
        onError: (err: any) =>
          toast.error(err?.message || "Failed to create task"),
      });
    }
  };

  const handleDelete = (taskId: string) => {
    if (previewMode) {
      closeModal();
      return;
    }
    deleteTask.mutate(taskId, { onSuccess: () => closeModal() });
  };

  const activePack =
    STARTER_CHECKLIST_PACKS.find((p) => p.id === activePackId) ||
    STARTER_CHECKLIST_PACKS[0];

  const handleSelectPack = (packId: string) => {
    const pack = STARTER_CHECKLIST_PACKS.find((p) => p.id === packId);
    if (!pack) return;
    setActivePackId(pack.id);
    setSelectedPackIndices(pack.items.map((_, idx) => idx));
  };

  const toggleChecklistItem = (index: number) => {
    setSelectedPackIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleInsertStarterTasks = () => {
    if (previewMode) return;
    const targetMilestone =
      milestones[activePack.defaultMilestoneIndex] || milestones[0] || null;
    const existingTitles = new Set(
      allTasks.map((t) => t.title.trim().toLowerCase())
    );

    const itemsToCreate = activePack.items
      .filter((_, idx) => selectedPackIndices.includes(idx))
      .filter((item) => !existingTitles.has(item.title.trim().toLowerCase()))
      .map((item) => ({
        title: item.title,
        description: item.description,
        priority: item.priority,
        milestoneId: targetMilestone?.id || null,
      }));

    if (itemsToCreate.length === 0) {
      toast.info("Selected tasks are already on your board");
      setShowChecklists(false);
      return;
    }

    createBatchTasks.mutate(itemsToCreate, {
      onSuccess: (created) => {
        toast.success(`Added ${created.length} tasks`);
        setShowChecklists(false);
      },
      onError: (err: any) => toast.error(err?.message || "Failed to add tasks"),
    });
  };

  if (!previewMode && isLoading) {
    return (
      <div className={`${cardSurface} flex h-40 items-center justify-center p-4`}>
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-900 dark:border-white border-t-transparent" />
      </div>
    );
  }

  // Stage name is shown on a task only when not already filtered by that stage
  const stageLabelFor = (task: FYPTask) =>
    stageFilter === "ALL" && task.milestoneId
      ? milestoneMap.get(task.milestoneId) || null
      : null;

  const segBase =
    "inline-flex h-8 items-center justify-center px-2.5 text-xs font-medium rounded-lg transition-all cursor-pointer";
  const segOn =
    "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold";
  const segOff =
    "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white";

  return (
    <section className={`${cardSurface} p-3.5 sm:p-5 space-y-3.5`}>
      {/* Primary Header Row: Title + Checklists + View Switcher + New Task */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Tasks
          </h2>
          {totalTasks > 0 && (
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {doneTasks}/{totalTasks} done
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {!previewMode && (
            <button
              type="button"
              onClick={() => setShowChecklists(true)}
              className={`${btnSecondary} !h-8 !px-2 text-xs`}
              title="Add standard FYP checklist templates"
            >
              <ClipboardList className="h-3.5 w-3.5 text-slate-500" />
              <span className="hidden sm:inline">Templates</span>
            </button>
          )}

          {/* View switcher: compact List/Board toggle */}
          <div className="inline-flex rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5">
            <button
              type="button"
              onClick={() => changeView("list")}
              aria-label="List view"
              className={`${segBase} !h-7 !px-2 gap-1 ${
                viewMode === "list" ? segOn : segOff
              }`}
            >
              <ListIcon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">List</span>
            </button>
            <button
              type="button"
              onClick={() => changeView("board")}
              aria-label="Board view"
              className={`${segBase} !h-7 !px-2 gap-1 ${
                viewMode === "board" ? segOn : segOff
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Board</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => openNewTaskModal("TODO")}
            className={`${btnPrimary} !h-8 !px-3 text-xs`}
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New task</span>
          </button>
        </div>
      </div>

      {/* Clean, Non-Repetitive Filter Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800/80 pt-2.5">
        <div className="flex flex-wrap items-center gap-1.5 min-w-0">
          {/* Unified Scope Toggle: All | Mine | Unassigned */}
          <div className="inline-flex rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5">
            <button
              type="button"
              onClick={() => setAssigneeFilter("ALL")}
              className={`${segBase} !h-7 ${
                assigneeFilter === "ALL" ? segOn : segOff
              }`}
            >
              All
            </button>
            {currentStudentId && (
              <button
                type="button"
                onClick={() => setAssigneeFilter("MINE")}
                className={`${segBase} !h-7 ${
                  assigneeFilter === "MINE" ? segOn : segOff
                }`}
              >
                Mine
              </button>
            )}
            <button
              type="button"
              onClick={() => setAssigneeFilter("UNASSIGNED")}
              className={`${segBase} !h-7 ${
                assigneeFilter === "UNASSIGNED" ? segOn : segOff
              }`}
            >
              Unassigned
            </button>
          </div>

          {/* Member picker if group has multiple teammates */}
          {effectiveMembers.length > 1 && (
            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="h-7 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 px-2 text-xs text-slate-700 dark:text-slate-300 outline-none"
            >
              <option value="ALL">All members</option>
              {currentStudentId && <option value="MINE">Assigned to me</option>}
              <option value="UNASSIGNED">Unassigned</option>
              {effectiveMembers.map((m: any) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          )}

          {/* Active Stage Filter Pill (set by clicking nodes on the visual timeline diagram above) */}
          {activeStageTitle && onSelectMilestone && (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-2 py-1 text-xs font-medium">
              <span>Phase: {activeStageTitle}</span>
              <button
                type="button"
                onClick={() => onSelectMilestone("ALL")}
                className="hover:opacity-75 cursor-pointer"
                title="Clear stage filter"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>

        {/* Clear filter indicator if non-default filter is applied */}
        {(assigneeFilter !== "ALL" || stageFilter !== "ALL") && (
          <button
            type="button"
            onClick={() => {
              setAssigneeFilter("ALL");
              if (onSelectMilestone) onSelectMilestone("ALL");
              else setLocalStage("ALL");
            }}
            className="text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Empty State */}
      {!previewMode && totalTasks === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 px-4 py-8 text-center">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">
            No tasks yet
          </p>
          <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400">
            Create your first task or insert a starter checklist for your current FYP phase.
          </p>
          <div className="mt-4 flex flex-col items-stretch justify-center gap-2 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => openNewTaskModal("TODO")}
              className={`${btnPrimary} !h-8 text-xs`}
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New task</span>
            </button>
            <button
              type="button"
              onClick={() => setShowChecklists(true)}
              className={`${btnSecondary} !h-8 text-xs`}
            >
              <ClipboardList className="h-3.5 w-3.5" />
              <span>Starter checklists</span>
            </button>
          </div>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 px-4 py-8 text-center">
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            No tasks match the active filters.
          </p>
          <button
            type="button"
            onClick={() => {
              setAssigneeFilter("ALL");
              if (onSelectMilestone) onSelectMilestone("ALL");
              else setLocalStage("ALL");
            }}
            className={`${btnGhost} mt-2 !h-8 text-xs`}
          >
            Reset filters
          </button>
        </div>
      ) : viewMode === "list" ? (
        /* LIST VIEW (default) — grouped by status, done tasks collapsible */
        <div className="space-y-4 pt-0.5">
          {LIST_GROUPS.map((status) => {
            const items = filteredTasks.filter((t) => t.status === status);
            if (items.length === 0) return null;
            const isDoneGroup = status === "DONE";
            const collapsed = isDoneGroup && !showDone;

            return (
              <div key={status} className="space-y-1.5">
                {isDoneGroup ? (
                  <button
                    type="button"
                    onClick={() => setShowDone((v) => !v)}
                    aria-expanded={!collapsed}
                    className="inline-flex h-7 items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer"
                  >
                    {collapsed ? (
                      <ChevronRight className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5" />
                    )}
                    <span>{STATUS_LABELS[status]}</span>
                    <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 text-[11px] font-medium text-slate-500">
                      {items.length}
                    </span>
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {STATUS_LABELS[status]}
                    </h3>
                    <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 text-[11px] font-medium text-slate-500">
                      {items.length}
                    </span>
                  </div>
                )}

                {!collapsed && (
                  <ul className="divide-y divide-slate-100 dark:divide-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
                    {items.map((task) => {
                      const overdue = isTaskOverdue(task);
                      const stage = stageLabelFor(task);
                      const isDone = task.status === "DONE";

                      return (
                        <li
                          key={task.id}
                          onClick={() => openEditTaskModal(task)}
                          className="flex cursor-pointer items-start sm:items-center gap-2.5 px-3 py-2.5 sm:px-3.5 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <div className="-ml-1 mt-0.5 sm:mt-0">
                            <StatusControl
                              status={task.status}
                              onChange={(s) => handleInlineStatusChange(task, s)}
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <p
                                className={`text-xs sm:text-sm font-medium leading-snug break-words ${
                                  isDone
                                    ? "text-slate-400 line-through"
                                    : "text-slate-900 dark:text-white"
                                }`}
                              >
                                {task.title}
                              </p>
                              {task.priority === "HIGH" && !isDone && (
                                <span className="inline-flex items-center rounded bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.2 text-[10px] font-semibold text-amber-700 dark:text-amber-300">
                                  High
                                </span>
                              )}
                            </div>

                            {/* Mobile metadata: Assignee + Stage + Due Date */}
                            <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[11px] text-slate-500 dark:text-slate-400 sm:hidden">
                              <span>
                                {task.assignedTo
                                  ? task.assignedTo.name
                                  : "Unassigned"}
                              </span>
                              {stage && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span className="truncate max-w-[140px]">
                                    {stage}
                                  </span>
                                </>
                              )}
                              {task.dueDate && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span
                                    className={
                                      overdue
                                        ? "font-medium text-red-600 dark:text-red-400"
                                        : ""
                                    }
                                  >
                                    {formatTaskDate(task.dueDate)}
                                    {overdue ? " (Overdue)" : ""}
                                  </span>
                                </>
                              )}
                            </div>

                            {/* Desktop stage subtitle */}
                            {stage && (
                              <p className="hidden truncate text-[11px] text-slate-400 sm:block">
                                {stage}
                              </p>
                            )}
                          </div>

                          {/* Desktop Assignee column */}
                          <span className="hidden w-36 shrink-0 truncate text-xs text-slate-600 dark:text-slate-300 sm:block">
                            {task.assignedTo
                              ? task.assignedTo.name
                              : "Unassigned"}
                          </span>

                          {/* Desktop Due Date column */}
                          <span
                            className={`hidden sm:inline-flex w-24 shrink-0 items-center justify-end gap-1 text-right text-xs ${
                              overdue
                                ? "font-medium text-red-600 dark:text-red-400"
                                : "text-slate-500 dark:text-slate-400"
                            }`}
                          >
                            {task.dueDate ? (
                              <>
                                <Calendar className="h-3 w-3 shrink-0" />
                                <span>{formatTaskDate(task.dueDate)}</span>
                              </>
                            ) : (
                              "—"
                            )}
                          </span>

                          {task.deliverableUrl && (
                            <a
                              href={task.deliverableUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              aria-label="Open deliverable link"
                              className="-mr-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* BOARD VIEW — neutral columns, 1 column at a time on mobile */
        <div className="space-y-3 pt-0.5">
          <div className="grid grid-cols-4 gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 p-0.5 sm:hidden">
            {COLUMNS.map((col) => {
              const count = filteredTasks.filter(
                (t) => t.status === col.id
              ).length;
              return (
                <button
                  key={col.id}
                  type="button"
                  onClick={() => setMobileColumn(col.id)}
                  className={`flex h-8 items-center justify-center gap-1 rounded-lg px-1 text-xs font-medium transition-all cursor-pointer ${
                    mobileColumn === col.id ? segOn : segOff
                  }`}
                >
                  <span className="truncate">{col.mobileTitle}</span>
                  <span className="text-[10px] opacity-70">{count}</span>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {COLUMNS.map((col) => {
              const columnTasks = filteredTasks.filter(
                (t) => t.status === col.id
              );
              return (
                <div
                  key={col.id}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, col.id)}
                  className={`${
                    mobileColumn === col.id ? "block" : "hidden"
                  } sm:block rounded-xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/30 p-2.5`}
                >
                  <div className="mb-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                        {col.title}
                      </h3>
                      <span className="rounded-full bg-slate-200/70 dark:bg-slate-800 px-1.5 py-0.2 text-[10px] font-medium text-slate-600 dark:text-slate-400">
                        {columnTasks.length}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => openNewTaskModal(col.id)}
                      aria-label={`Add task to ${col.title}`}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-white dark:hover:bg-slate-800 cursor-pointer transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="min-h-[96px] space-y-2">
                    {columnTasks.length === 0 ? (
                      <p className="px-2 py-6 text-center text-xs text-slate-400">
                        No tasks
                      </p>
                    ) : (
                      columnTasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          milestoneTitle={stageLabelFor(task)}
                          onClick={() => openEditTaskModal(task)}
                          onDragStart={(e) => handleDragStart(e, task.id)}
                          onStatusChange={(s) =>
                            handleInlineStatusChange(task, s)
                          }
                        />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Starter Checklists Modal */}
      {showChecklists && (
        <Sheet
          title="Starter checklists"
          description="Select standard deliverables to populate your task list."
          onClose={() => setShowChecklists(false)}
          wide
          footer={
            <>
              <button
                type="button"
                onClick={() => setShowChecklists(false)}
                className={btnSecondary}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleInsertStarterTasks}
                disabled={
                  selectedPackIndices.length === 0 || createBatchTasks.isPending
                }
                className={btnPrimary}
              >
                {createBatchTasks.isPending
                  ? "Adding..."
                  : `Add ${selectedPackIndices.length} task${
                      selectedPackIndices.length === 1 ? "" : "s"
                    }`}
              </button>
            </>
          }
        >
          <div className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
                Project phase
              </span>
              <select
                value={activePack.id}
                onChange={(e) => handleSelectPack(e.target.value)}
                className={inputCls}
              >
                {STARTER_CHECKLIST_PACKS.map((pack, idx) => (
                  <option key={pack.id} value={pack.id}>
                    {idx + 1}. {pack.title}
                  </option>
                ))}
              </select>
              <span className="mt-1.5 block text-xs text-slate-500 dark:text-slate-400">
                {activePack.subtitle}
              </span>
            </label>

            <ul className="divide-y divide-slate-100 dark:divide-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              {activePack.items.map((item, idx) => {
                const checked = selectedPackIndices.includes(idx);
                return (
                  <li key={idx}>
                    <button
                      type="button"
                      onClick={() => toggleChecklistItem(idx)}
                      className="flex w-full items-start gap-3 p-3.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                    >
                      <span
                        className={`mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded border transition-colors ${
                          checked
                            ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900"
                            : "border-slate-300 dark:border-slate-600"
                        }`}
                      >
                        {checked && <Check className="h-3 w-3" />}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-xs sm:text-sm font-medium text-slate-900 dark:text-white">
                          {item.title}
                        </span>
                        <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">
                          {item.description}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </Sheet>
      )}

      {isModalOpen && (
        <TaskDetailModal
          task={activeTask || undefined}
          prefill={modalPrefill}
          defaultStatus={defaultStatus}
          defaultMilestoneId={stageFilter}
          members={effectiveMembers}
          milestones={milestones}
          onClose={closeModal}
          onSave={handleSave}
          onDelete={previewMode ? undefined : handleDelete}
          isSaving={createTask.isPending || updateTask.isPending}
          isDeleting={deleteTask.isPending}
          isReadOnly={previewMode}
        />
      )}
    </section>
  );
}
