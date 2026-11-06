"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  LayoutGrid,
  List,
  ExternalLink,
  Calendar,
  User,
  Trash2,
  ClipboardList,
  Check,
  X,
  Flag,
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
  type TaskPriority,
} from "@/services/workspace.service";
import { TaskCard } from "./TaskCard";
import { TaskDetailModal } from "./TaskDetailModal";

interface KanbanBoardProps {
  groupId: string;
  members: any[];
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

const COLUMNS = [
  {
    id: "TODO",
    title: "To Do",
    shortTitle: "To Do",
    bg: "bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800/60",
  },
  {
    id: "IN_PROGRESS",
    title: "In Progress",
    shortTitle: "Doing",
    bg: "bg-sky-50/50 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900/30",
  },
  {
    id: "REVIEW",
    title: "Under Review",
    shortTitle: "Review",
    bg: "bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30",
  },
  {
    id: "DONE",
    title: "Done",
    shortTitle: "Done",
    bg: "bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30",
  },
];

interface StarterChecklistPack {
  id: string;
  title: string;
  subtitle: string;
  defaultMilestoneIndex: number;
  items: Array<{
    title: string;
    description: string;
    priority: TaskPriority;
  }>;
}

const STARTER_CHECKLIST_PACKS: StarterChecklistPack[] = [
  {
    id: "pack-proposal",
    title: "1. Proposal & Literature Review",
    subtitle: "Problem scoping, literature matrix, and supervisor alignment",
    defaultMilestoneIndex: 0,
    items: [
      {
        title: "Define Problem Statement, Objectives & Scope",
        description:
          "Document the core problem, target users, measurable objectives, and explicit project boundaries.",
        priority: "HIGH",
      },
      {
        title: "Literature Review & Comparative Matrix (10–15 Papers)",
        description:
          "Summarize recent research papers/existing systems, their limitations, and how our FYP addresses the gap.",
        priority: "HIGH",
      },
      {
        title: "Select Tech Stack, Dataset & Hardware/Cloud Tools",
        description:
          "Finalize frameworks, database, APIs, or datasets required for feasibility.",
        priority: "MEDIUM",
      },
      {
        title: "Prepare Proposal Document & Defense Slides",
        description:
          "Draft the proposal report and presentation deck for supervisor and committee review.",
        priority: "HIGH",
      },
    ],
  },
  {
    id: "pack-srs",
    title: "2. SRS & System Design",
    subtitle: "Requirements specification, architecture diagrams, and database schema",
    defaultMilestoneIndex: 1,
    items: [
      {
        title: "Functional & Non-Functional Requirements Specification",
        description:
          "List user roles, user stories, functional modules, and performance/security constraints.",
        priority: "HIGH",
      },
      {
        title: "System Architecture & Data Flow Diagrams",
        description:
          "Create high-level architecture, use case diagrams, and sequence/activity diagrams.",
        priority: "HIGH",
      },
      {
        title: "Database Schema (ERD) & API Route Contracts",
        description:
          "Design entity relationships, tables, and backend API request/response schemas.",
        priority: "MEDIUM",
      },
      {
        title: "UI Wireframes & Interactive Prototype",
        description:
          "Design key user screens and navigation flows before full implementation.",
        priority: "MEDIUM",
      },
    ],
  },
  {
    id: "pack-prototype",
    title: "3. Prototype & Midterm Evaluation",
    subtitle: "Core implementation, integration, and midterm demonstration",
    defaultMilestoneIndex: 2,
    items: [
      {
        title: "Setup GitHub Repository, Branch Rules & Environment",
        description:
          "Initialize project repository, README, environment variables, and base project structure.",
        priority: "HIGH",
      },
      {
        title: "Build Core Backend / AI Model Pipeline",
        description:
          "Implement primary business logic, database operations, or model training/inference pipeline.",
        priority: "HIGH",
      },
      {
        title: "Integrate Frontend UI with Core Workflows",
        description:
          "Connect primary user-facing screens with live data for the end-to-end prototype.",
        priority: "HIGH",
      },
      {
        title: "Midterm Demo Rehearsal & Progress Presentation",
        description:
          "Test end-to-end demo scenario and prepare midterm evaluation slides.",
        priority: "MEDIUM",
      },
    ],
  },
  {
    id: "pack-final",
    title: "4. Final Thesis & Defense",
    subtitle: "Testing, evaluation metrics, final report chapters, and defense",
    defaultMilestoneIndex: 3,
    items: [
      {
        title: "End-to-End Testing, Bug Fixing & Performance Benchmarks",
        description:
          "Execute test cases, record accuracy/latency metrics, and resolve edge-case bugs.",
        priority: "HIGH",
      },
      {
        title: "Write Final Thesis / Report Chapters (Methodology & Results)",
        description:
          "Complete all thesis chapters, figures, tables, and IEEE/APA citations.",
        priority: "HIGH",
      },
      {
        title: "Supervisor Thesis Review & Plagiarism Check",
        description:
          "Incorporate final supervisor corrections and verify formatting/similarity compliance.",
        priority: "MEDIUM",
      },
      {
        title: "Final Defense Presentation, Live Demo & Code Handover",
        description:
          "Prepare final defense deck, backup demo video, and clean repository documentation.",
        priority: "HIGH",
      },
    ],
  },
];

const PREVIEW_TASKS: FYPTask[] = [
  {
    id: "preview-1",
    groupId: "preview-group",
    title: "Literature Review & Research Paper Survey",
    description:
      "Survey 10-15 peer-reviewed papers on transformer architectures and defense benchmarks.",
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
    description:
      "Draft system architecture diagrams and PostgreSQL schema for midterm review.",
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

export function KanbanBoard({
  groupId,
  members,
  milestones = [],
  selectedMilestoneId = "ALL",
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
  const [viewMode, setViewMode] = useState<"board" | "list">("board");
  const [mobileActiveColumn, setMobileActiveColumn] = useState<string>("TODO");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("ALL");
  const [, setDraggedTaskId] = useState<string | null>(null);

  // Starter Checklists Modal state
  const [showChecklistsModal, setShowChecklistsModal] = useState(false);
  const [activePackId, setActivePackId] = useState<string>(
    STARTER_CHECKLIST_PACKS[0].id
  );
  const [selectedPackIndices, setSelectedPackIndices] = useState<number[]>([
    0, 1, 2, 3,
  ]);

  // Open task modal automatically when triggered from Supervisor Action Item conversion
  useEffect(() => {
    if (externalTaskPrefill) {
      setActiveTask(null);
      setModalPrefill({
        title: externalTaskPrefill.title,
        description: externalTaskPrefill.description,
        milestoneId:
          selectedMilestoneId !== "ALL" ? selectedMilestoneId : undefined,
      });
      setDefaultStatus("TODO");
      setIsModalOpen(true);
    }
  }, [externalTaskPrefill, selectedMilestoneId]);

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

  const filteredTasks = allTasks.filter((t) => {
    if (assigneeFilter === "UNASSIGNED" && t.assignedToId) return false;
    if (
      assigneeFilter !== "ALL" &&
      assigneeFilter !== "UNASSIGNED" &&
      t.assignedToId !== assigneeFilter
    ) {
      return false;
    }
    if (selectedMilestoneId !== "ALL") {
      if (selectedMilestoneId === "UNLINKED") return !t.milestoneId;
      return t.milestoneId === selectedMilestoneId;
    }
    return true;
  });

  const totalTasks = filteredTasks.length;
  const doneTasks = filteredTasks.filter((t) => t.status === "DONE").length;
  const progressPercent =
    totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

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
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    setDraggedTaskId(null);

    if (taskId) {
      const task = allTasks.find((t) => t.id === taskId);
      if (task) {
        handleInlineStatusChange(task, status);
      }
    }
  };

  const openNewTaskModal = (status: string) => {
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
              ? "Task created & notification email sent to assignee"
              : "Task created"
          );
        },
      });
    }
  };

  const handleDelete = (taskId: string) => {
    if (previewMode) {
      closeModal();
      return;
    }

    deleteTask.mutate(taskId, {
      onSuccess: () => closeModal(),
    });
  };

  const activePack =
    STARTER_CHECKLIST_PACKS.find((p) => p.id === activePackId) ||
    STARTER_CHECKLIST_PACKS[0];

  const handleSelectPack = (pack: StarterChecklistPack) => {
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
      toast.info("Selected starter tasks are already on your board");
      setShowChecklistsModal(false);
      return;
    }

    createBatchTasks.mutate(itemsToCreate, {
      onSuccess: (created) => {
        toast.success(`Added ${created.length} starter tasks to your board`);
        setShowChecklistsModal(false);
      },
      onError: (err: any) => {
        toast.error(err?.message || "Failed to add starter tasks");
      },
    });
  };

  if (!previewMode && isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-900 dark:border-white border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900/60 space-y-4">
      {/* Header Bar with Starter Checklists & Assign Task Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Team Task Board
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Assign tasks with target dates, link them to academic milestones, or load starter checklists.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <div className="inline-flex items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("board")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                viewMode === "board"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Board
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                viewMode === "list"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
              }`}
            >
              <List className="w-3.5 h-3.5" />
              List
            </button>
          </div>

          {!previewMode && (
            <button
              type="button"
              onClick={() => setShowChecklistsModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <ClipboardList className="w-3.5 h-3.5" />
              <span>Starter Checklists</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => openNewTaskModal("TODO")}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Assign Task
          </button>
        </div>
      </div>

      {/* Filter Pills (Assignee & Milestone Stage) & Progress */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setAssigneeFilter("ALL")}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              assigneeFilter === "ALL"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                : "bg-slate-100/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200/70"
            }`}
          >
            All ({allTasks.length})
          </button>
          {effectiveMembers.map((member) => {
            const memberTasks = allTasks.filter(
              (t) => t.assignedToId === member.id
            );
            const memberDone = memberTasks.filter(
              (t) => t.status === "DONE"
            ).length;
            return (
              <button
                key={member.id}
                type="button"
                onClick={() => setAssigneeFilter(member.id)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  assigneeFilter === member.id
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                    : "bg-slate-100/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200/70"
                }`}
              >
                <span>{member.name}</span>
                <span className="text-[10px] opacity-75">
                  {memberDone}/{memberTasks.length}
                </span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setAssigneeFilter("UNASSIGNED")}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              assigneeFilter === "UNASSIGNED"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                : "bg-slate-100/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200/70"
            }`}
          >
            Unassigned ({allTasks.filter((t) => !t.assignedToId).length})
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {milestones.length > 0 && onSelectMilestone && (
            <select
              value={selectedMilestoneId}
              onChange={(e) => onSelectMilestone(e.target.value)}
              aria-label="Filter by academic milestone"
              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-200 outline-none"
            >
              <option value="ALL">All Academic Stages</option>
              {milestones.map((ms) => (
                <option key={ms.id} value={ms.id}>
                  Stage: {ms.title}
                </option>
              ))}
              <option value="UNLINKED">Unlinked Tasks</option>
            </select>
          )}

          <span className="text-xs text-slate-500 dark:text-slate-400">
            Completed:{" "}
            <strong className="text-slate-900 dark:text-white">
              {doneTasks}/{totalTasks}
            </strong>{" "}
            ({progressPercent}%)
          </span>
        </div>
      </div>

      {/* Empty Board Starter Prompt */}
      {!previewMode && allTasks.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
              Starting a new FYP workspace?
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Load a curated starter checklist for Proposal, SRS, Prototype, or Final Thesis and adapt it to your project.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowChecklistsModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-semibold shrink-0 cursor-pointer"
          >
            <ClipboardList className="w-3.5 h-3.5" />
            Browse Starter Checklists
          </button>
        </div>
      )}

      {/* BOARD VIEW */}
      {viewMode === "board" ? (
        <>
          {/* MOBILE (<640px): Compact 4-Column Tab Switcher to eliminate 1000px vertical scroll */}
          <div className="grid grid-cols-4 gap-1 rounded-xl bg-slate-100/90 dark:bg-slate-800/80 p-1 sm:hidden">
            {COLUMNS.map((col) => {
              const count = filteredTasks.filter(
                (t) => t.status === col.id
              ).length;
              const isActive = mobileActiveColumn === col.id;
              return (
                <button
                  key={col.id}
                  type="button"
                  onClick={() => setMobileActiveColumn(col.id)}
                  className={`flex items-center justify-center gap-1 rounded-lg py-1.5 px-1 text-[11px] font-semibold transition-colors ${
                    isActive
                      ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs"
                      : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  <span className="truncate">{col.shortTitle}</span>
                  <span className="text-[10px] opacity-75">({count})</span>
                </button>
              );
            })}
          </div>

          <div className="grid h-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {COLUMNS.map((col) => {
              const columnTasks = filteredTasks.filter(
                (t) => t.status === col.id
              );
              const isHiddenOnMobile = mobileActiveColumn !== col.id;

              return (
                <div
                  key={col.id}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, col.id)}
                  className={`${
                    isHiddenOnMobile ? "hidden sm:flex" : "flex"
                  } h-full flex-col rounded-2xl p-4 ${col.bg} transition-colors`}
                >
                  <div className="mb-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
                        {col.title}
                      </h4>
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50">
                        {columnTasks.length}
                      </span>
                    </div>
                    <button
                      onClick={() => openNewTaskModal(col.id)}
                      title="Add Task to Column"
                      className="rounded-lg p-1 text-slate-500 transition hover:bg-white hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex-1 space-y-3 overflow-y-auto min-h-[180px] pr-0.5">
                    {columnTasks.length === 0 ? (
                      <div className="flex h-28 items-center justify-center rounded-xl border border-dashed border-slate-200/80 dark:border-slate-800 text-xs text-slate-400">
                        No tasks in {col.title}
                      </div>
                    ) : (
                      columnTasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          milestoneTitle={
                            task.milestoneId
                              ? milestoneMap.get(task.milestoneId) || null
                              : null
                          }
                          onClick={() => openEditTaskModal(task)}
                          onDragStart={(e) => handleDragStart(e, task.id)}
                          onStatusChange={(newStatus) =>
                            handleInlineStatusChange(task, newStatus)
                          }
                        />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        /* LIST VIEW */
        <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/50">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-2.5 px-4">Task</th>
                <th className="py-2.5 px-3">Stage</th>
                <th className="py-2.5 px-3">Assignee</th>
                <th className="py-2.5 px-3">Due Date</th>
                <th className="py-2.5 px-3">Priority</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60 text-xs">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    No tasks match the current filter.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => (
                  <tr
                    key={task.id}
                    onClick={() => openEditTaskModal(task)}
                    className="cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-medium text-slate-900 dark:text-white">
                        {task.title}
                      </div>
                      {task.description && (
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {task.description}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap text-slate-600 dark:text-slate-400">
                      {task.milestoneId &&
                      milestoneMap.get(task.milestoneId) ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-medium text-slate-700 dark:text-slate-300">
                          <Flag className="w-2.5 h-2.5 text-slate-400" />
                          {milestoneMap.get(task.milestoneId)}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {task.assignedTo ? (
                        <span className="inline-flex items-center gap-1.5 font-medium">
                          <User className="w-3 h-3 text-slate-400" />
                          {task.assignedTo.name}
                        </span>
                      ) : (
                        <span className="text-slate-400">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap text-slate-600 dark:text-slate-400">
                      {task.dueDate ? (
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(task.dueDate).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {task.priority || "MEDIUM"}
                      </span>
                    </td>
                    <td
                      className="py-3 px-3 whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <select
                        value={task.status}
                        onChange={(e) =>
                          handleInlineStatusChange(task, e.target.value)
                        }
                        className="px-2 py-1 rounded-md text-[11px] font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                      >
                        <option value="TODO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="REVIEW">Under Review</option>
                        <option value="DONE">Done</option>
                      </select>
                    </td>
                    <td
                      className="py-3 px-3 text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="inline-flex items-center gap-2">
                        {task.deliverableUrl && (
                          <a
                            href={task.deliverableUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {!previewMode && (
                          <button
                            type="button"
                            onClick={() => handleDelete(task.id)}
                            className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Starter Checklists Modal */}
      {showChecklistsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 px-5 py-4 shrink-0">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  FYP Starter Task Checklists
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Select a project phase and choose tasks to add to your board. You can edit or assign them anytime.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowChecklistsModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              {/* Phase Selector Tabs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {STARTER_CHECKLIST_PACKS.map((pack) => {
                  const isSelected = pack.id === activePack.id;
                  return (
                    <button
                      key={pack.id}
                      type="button"
                      onClick={() => handleSelectPack(pack)}
                      className={`text-left rounded-xl border p-3 transition-colors cursor-pointer ${
                        isSelected
                          ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900"
                          : "border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-slate-800 dark:text-slate-200 hover:bg-slate-100/80"
                      }`}
                    >
                      <div className="text-xs font-bold">{pack.title}</div>
                      <div
                        className={`text-[11px] mt-0.5 line-clamp-1 ${
                          isSelected
                            ? "text-slate-200 dark:text-slate-600"
                            : "text-slate-500 dark:text-slate-400"
                        }`}
                      >
                        {pack.subtitle}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Tasks in Selected Pack */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>
                    Tasks in <strong>{activePack.title}</strong>
                  </span>
                  <span>
                    {selectedPackIndices.length} of {activePack.items.length}{" "}
                    selected
                  </span>
                </div>

                <div className="divide-y divide-slate-200/70 dark:divide-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
                  {activePack.items.map((item, idx) => {
                    const checked = selectedPackIndices.includes(idx);
                    return (
                      <label
                        key={idx}
                        onClick={() => toggleChecklistItem(idx)}
                        className="flex items-start gap-3 p-3.5 cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <div
                          className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                            checked
                              ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900"
                              : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                          }`}
                        >
                          {checked && <Check className="h-3 w-3" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold text-slate-900 dark:text-white">
                              {item.title}
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0">
                              {item.priority}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            {item.description}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-200/80 dark:border-slate-800 px-5 py-3.5 shrink-0">
              <button
                type="button"
                onClick={() => setShowChecklistsModal(false)}
                className="rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleInsertStarterTasks}
                disabled={
                  selectedPackIndices.length === 0 || createBatchTasks.isPending
                }
                className="rounded-xl bg-slate-900 dark:bg-white px-4 py-2 text-xs font-semibold text-white dark:text-slate-900 hover:opacity-90 disabled:opacity-50 cursor-pointer"
              >
                {createBatchTasks.isPending
                  ? "Adding..."
                  : `Add ${selectedPackIndices.length} Tasks to Board`}
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <TaskDetailModal
          task={activeTask || undefined}
          prefill={modalPrefill}
          defaultStatus={defaultStatus}
          defaultMilestoneId={selectedMilestoneId}
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
    </div>
  );
}
