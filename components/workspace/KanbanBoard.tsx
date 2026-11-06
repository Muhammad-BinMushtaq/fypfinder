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
  SlidersHorizontal,
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

const COLUMNS: Array<{ id: FYPTask["status"]; title: string }> = [
  { id: "TODO", title: "To do" },
  { id: "IN_PROGRESS", title: "In progress" },
  { id: "REVIEW", title: "In review" },
  { id: "DONE", title: "Done" },
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

  // List is the default; the student's last choice is remembered on this device.
  const [viewMode, setViewMode] = useState<"list" | "board">("list");
  const [mobileColumn, setMobileColumn] = useState<FYPTask["status"]>("TODO");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("ALL");
  const [localStage, setLocalStage] = useState<string>("ALL");
  const [showFilters, setShowFilters] = useState(false);
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
  const setStageFilter = (id: string) => {
    if (onSelectMilestone) onSelectMilestone(id);
    else setLocalStage(id);
  };

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

  const advancedFilterCount =
    (assigneeFilter !== "ALL" && assigneeFilter !== "MINE" ? 1 : 0) +
    (stageFilter !== "ALL" ? 1 : 0);
  const hasAnyFilter = assigneeFilter !== "ALL" || stageFilter !== "ALL";

  const clearFilters = () => {
    setAssigneeFilter("ALL");
    setStageFilter("ALL");
  };

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
        onError: (err: any) => toast.error(err?.message || "Failed to update task"),
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
        onError: (err: any) => toast.error(err?.message || "Failed to create task"),
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
      <div className="flex h-40 items-center justify-center">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-900 dark:border-white border-t-transparent" />
      </div>
    );
  }

  // Stage name is shown on a task only when it is not already implied by the active stage filter.
  const stageLabelFor = (task: FYPTask) =>
    stageFilter === "ALL" && task.milestoneId
      ? milestoneMap.get(task.milestoneId) || null
      : null;

  const segBase =
    "inline-flex h-10 items-center justify-center px-3.5 text-sm font-medium rounded-md transition-colors cursor-pointer";
  const segOn =
    "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm";
  const segOff = "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white";

  return (
    <section className="space-y-4">
      {/* Section header: title + primary action (always in the page flow, never floating) */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            Tasks
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {totalTasks === 0
              ? "Nothing here yet"
              : `${doneTasks} of ${totalTasks} done`}
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {!previewMode && (
            <button
              type="button"
              onClick={() => setShowChecklists(true)}
              className={`${btnGhost} hidden sm:inline-flex`}
            >
              <ClipboardList className="h-4 w-4" />
              Checklists
            </button>
          )}
          <button
            type="button"
            onClick={() => openNewTaskModal("TODO")}
            className={btnPrimary}
          >
            <Plus className="h-4 w-4" />
            New task
          </button>
        </div>
      </div>

      {/* Controls: scope toggle, filters, view */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-lg bg-slate-100 dark:bg-slate-800 p-1">
          <button
            type="button"
            onClick={() => setAssigneeFilter("ALL")}
            className={`${segBase} ${assigneeFilter === "ALL" ? segOn : segOff}`}
          >
            Everyone
          </button>
          {currentStudentId && (
            <button
              type="button"
              onClick={() => setAssigneeFilter("MINE")}
              className={`${segBase} ${
                assigneeFilter === "MINE" ? segOn : segOff
              }`}
            >
              Mine
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setShowFilters((v) => !v)}
          aria-expanded={showFilters}
          className={btnSecondary}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filter
          {advancedFilterCount > 0 && (
            <span className="text-slate-900 dark:text-white">
              ({advancedFilterCount})
            </span>
          )}
        </button>

        <div className="ml-auto inline-flex rounded-lg bg-slate-100 dark:bg-slate-800 p-1">
          <button
            type="button"
            onClick={() => changeView("list")}
            aria-label="List view"
            className={`${segBase} gap-1.5 ${viewMode === "list" ? segOn : segOff}`}
          >
            <ListIcon className="h-4 w-4" />
            <span className="hidden sm:inline">List</span>
          </button>
          <button
            type="button"
            onClick={() => changeView("board")}
            aria-label="Board view"
            className={`${segBase} gap-1.5 ${viewMode === "board" ? segOn : segOff}`}
          >
            <LayoutGrid className="h-4 w-4" />
            <span className="hidden sm:inline">Board</span>
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Assigned to
            </span>
            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className={inputCls}
            >
              <option value="ALL">Everyone</option>
              {currentStudentId && <option value="MINE">Me</option>}
              <option value="UNASSIGNED">Unassigned</option>
              {effectiveMembers.map((m: any) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Academic stage
            </span>
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className={inputCls}
            >
              <option value="ALL">All stages</option>
              {milestones.map((ms) => (
                <option key={ms.id} value={ms.id}>
                  {ms.title}
                </option>
              ))}
              <option value="UNLINKED">Not linked to a stage</option>
            </select>
          </label>
          {hasAnyFilter && (
            <div className="sm:col-span-2">
              <button type="button" onClick={clearFilters} className={btnGhost}>
                Clear filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Empty workspace */}
      {!previewMode && totalTasks === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 px-5 py-8 text-center">
          <p className="text-sm font-medium text-slate-900 dark:text-white">
            No tasks yet
          </p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
            Add your first task, or start from a suggested checklist for each
            phase of your project and adapt it.
          </p>
          <div className="mt-4 flex flex-col items-stretch justify-center gap-2 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => openNewTaskModal("TODO")}
              className={btnPrimary}
            >
              <Plus className="h-4 w-4" />
              New task
            </button>
            <button
              type="button"
              onClick={() => setShowChecklists(true)}
              className={btnSecondary}
            >
              Browse checklists
            </button>
          </div>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 px-5 py-8 text-center">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            No tasks match these filters.
          </p>
          <button type="button" onClick={clearFilters} className={`${btnGhost} mt-2`}>
            Clear filters
          </button>
        </div>
      ) : viewMode === "list" ? (
        /* LIST VIEW (default) — grouped by status, done tasks collapsed */
        <div className="space-y-6">
          {LIST_GROUPS.map((status) => {
            const items = filteredTasks.filter((t) => t.status === status);
            if (items.length === 0) return null;
            const isDoneGroup = status === "DONE";
            const collapsed = isDoneGroup && !showDone;

            return (
              <div key={status}>
                {isDoneGroup ? (
                  <button
                    type="button"
                    onClick={() => setShowDone((v) => !v)}
                    aria-expanded={!collapsed}
                    className="mb-2 inline-flex h-10 items-center gap-1.5 text-sm font-semibold text-slate-600 dark:text-slate-300 cursor-pointer"
                  >
                    {collapsed ? (
                      <ChevronRight className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                    {STATUS_LABELS[status]}
                    <span className="font-normal text-slate-500">
                      {items.length}
                    </span>
                  </button>
                ) : (
                  <h3 className="mb-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
                    {STATUS_LABELS[status]}{" "}
                    <span className="font-normal text-slate-500">
                      {items.length}
                    </span>
                  </h3>
                )}

                {!collapsed && (
                  <ul className="divide-y divide-slate-100 dark:divide-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40">
                    {items.map((task) => {
                      const overdue = isTaskOverdue(task);
                      const stage = stageLabelFor(task);
                      return (
                        <li
                          key={task.id}
                          onClick={() => openEditTaskModal(task)}
                          className="flex cursor-pointer items-center gap-2 px-2 py-2 sm:px-3 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                        >
                          <StatusControl
                            status={task.status}
                            onChange={(s) => handleInlineStatusChange(task, s)}
                          />

                          <div className="min-w-0 flex-1 py-1">
                            <p
                              className={`text-sm font-medium leading-snug ${
                                task.status === "DONE"
                                  ? "text-slate-400 line-through"
                                  : "text-slate-900 dark:text-white"
                              }`}
                            >
                              {task.title}
                              {task.priority === "HIGH" &&
                                task.status !== "DONE" && (
                                  <span className="ml-2 text-xs font-medium text-slate-900 dark:text-white no-underline">
                                    High priority
                                  </span>
                                )}
                            </p>
                            <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                              <span className="sm:hidden">
                                {task.assignedTo
                                  ? task.assignedTo.name
                                  : "Unassigned"}
                                {stage ? ` · ${stage}` : ""}
                              </span>
                              {stage && (
                                <span className="hidden sm:inline">{stage}</span>
                              )}
                            </p>
                          </div>

                          <span className="hidden w-40 shrink-0 truncate text-sm text-slate-600 dark:text-slate-300 sm:block">
                            {task.assignedTo
                              ? task.assignedTo.name
                              : "Unassigned"}
                          </span>

                          <span
                            className={`w-24 shrink-0 pr-1 text-right text-xs sm:text-sm ${
                              overdue
                                ? "font-medium text-red-600 dark:text-red-400"
                                : "text-slate-500 dark:text-slate-400"
                            }`}
                          >
                            {task.dueDate ? (
                              <>
                                {formatTaskDate(task.dueDate)}
                                {overdue && (
                                  <span className="block text-xs sm:inline">
                                    {" "}
                                    overdue
                                  </span>
                                )}
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
                              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 sm:h-8 sm:w-8"
                            >
                              <ExternalLink className="h-4 w-4" />
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
        /* BOARD VIEW — neutral columns */
        <div className="space-y-3">
          {/* Mobile: one column at a time */}
          <div className="grid grid-cols-4 gap-1 rounded-lg bg-slate-100 dark:bg-slate-800 p-1 sm:hidden">
            {COLUMNS.map((col) => {
              const count = filteredTasks.filter((t) => t.status === col.id).length;
              return (
                <button
                  key={col.id}
                  type="button"
                  onClick={() => setMobileColumn(col.id)}
                  className={`h-10 rounded-md px-1 text-xs font-medium ${
                    mobileColumn === col.id ? segOn : segOff
                  }`}
                >
                  {col.title}
                  <span className="ml-1 text-slate-500">{count}</span>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {COLUMNS.map((col) => {
              const columnTasks = filteredTasks.filter((t) => t.status === col.id);
              return (
                <div
                  key={col.id}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, col.id)}
                  className={`${
                    mobileColumn === col.id ? "block" : "hidden"
                  } sm:block rounded-xl bg-slate-50 dark:bg-slate-900/40 p-3`}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      {col.title}{" "}
                      <span className="font-normal text-slate-500">
                        {columnTasks.length}
                      </span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => openNewTaskModal(col.id)}
                      aria-label={`Add task to ${col.title}`}
                      className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 hover:bg-white dark:hover:bg-slate-800 sm:h-8 sm:w-8 cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="min-h-[96px] space-y-2.5">
                    {columnTasks.length === 0 ? (
                      <p className="px-1 py-6 text-center text-sm text-slate-400">
                        Nothing here
                      </p>
                    ) : (
                      columnTasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          milestoneTitle={stageLabelFor(task)}
                          onClick={() => openEditTaskModal(task)}
                          onDragStart={(e) => handleDragStart(e, task.id)}
                          onStatusChange={(s) => handleInlineStatusChange(task, s)}
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

      {/* Checklists are reachable on mobile too (the toolbar button is hidden there to save space) */}
      {!previewMode && totalTasks > 0 && (
        <div className="sm:hidden">
          <button
            type="button"
            onClick={() => setShowChecklists(true)}
            className={btnGhost}
          >
            <ClipboardList className="h-4 w-4" />
            Starter checklists
          </button>
        </div>
      )}

      {showChecklists && (
        <Sheet
          title="Starter checklists"
          description="Suggested starting points. Pick a phase, choose the tasks you want, and edit them afterwards."
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
              <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Phase
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
              <span className="mt-1.5 block text-sm text-slate-500 dark:text-slate-400">
                {activePack.subtitle}
              </span>
            </label>

            <ul className="divide-y divide-slate-100 dark:divide-slate-800 rounded-xl border border-slate-200 dark:border-slate-800">
              {activePack.items.map((item, idx) => {
                const checked = selectedPackIndices.includes(idx);
                return (
                  <li key={idx}>
                    <button
                      type="button"
                      onClick={() => toggleChecklistItem(idx)}
                      className="flex w-full items-start gap-3 p-3.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer"
                    >
                      <span
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                          checked
                            ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900"
                            : "border-slate-300 dark:border-slate-600"
                        }`}
                      >
                        {checked && <Check className="h-3.5 w-3.5" />}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-slate-900 dark:text-white">
                          {item.title}
                        </span>
                        <span className="mt-0.5 block text-sm text-slate-500 dark:text-slate-400">
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
