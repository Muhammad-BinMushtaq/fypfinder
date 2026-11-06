// app/dashboard/fyp/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { KanbanBoard } from "@/components/workspace/KanbanBoard";
import {
  DeadlineTimeline,
  PREVIEW_MILESTONES,
} from "@/components/workspace/DeadlineTimeline";
import { SupervisorLog } from "@/components/workspace/SupervisorLog";
import {
  useMyGroup,
  useUpdateGroupVisibility,
  useLeaveGroup,
  useRemoveMember,
  useLockGroup,
  useCreateInitialGroup,
  useInviteCollaborator,
  useResendCollaboratorInvite,
  useCancelCollaboratorInvite,
  searchCollaboratorsApi,
  type InviteSearchCandidate,
} from "@/hooks/group/useMyGroup";
import {
  useWorkspaceMeta,
  useUpdateWorkspaceMeta,
  type CustomResourceLink,
} from "@/services/workspace.service";
import { useMyProfile } from "@/hooks/student/useMyProfile";
import {
  Users,
  Lock,
  Unlock,
  Edit2,
  Save,
  X,
  AlertTriangle,
  Search,
  Crown,
  UserMinus,
  UserPlus,
  ExternalLink,
  GitBranch,
  FileText,
  Globe,
  GraduationCap,
  Plus,
  Mail,
  FolderKanban,
  MessageSquare,
  Link2,
  Trash2,
} from "lucide-react";

export default function FYPManagementPage() {
  const router = useRouter();
  const { group, isLoading, isInGroup, isGroupLocked } = useMyGroup();
  const { profile } = useMyProfile();
  const updateVisibility = useUpdateGroupVisibility();
  const leaveGroup = useLeaveGroup();
  const removeMember = useRemoveMember();
  const lockGroup = useLockGroup();
  const createInitialGroup = useCreateInitialGroup();
  const inviteCollaborator = useInviteCollaborator();
  const resendInvite = useResendCollaboratorInvite();
  const cancelInvite = useCancelCollaboratorInvite();

  const { data: workspaceMeta } = useWorkspaceMeta(
    group?.id || "",
    isInGroup,
    group?.workspaceMeta
  );
  const updateWorkspaceMeta = useUpdateWorkspaceMeta(group?.id || "");

  // Clean 3-Section Organization:
  // 1. "workspace" (Academic Milestones + Task Board + Starter Checklists)
  // 2. "supervisor" (Supervisor Status + Meeting Logs + Feedback & Action Items)
  // 3. "team" (Team Members, Responsibilities, Messaging Shortcuts, Invites & Settings)
  const [activeTab, setActiveTab] = useState<
    "workspace" | "supervisor" | "team"
  >("workspace");
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string>("ALL");
  const [isEditingProject, setIsEditingProject] = useState(false);

  // Project & Links edit state
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [docsUrl, setDocsUrl] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [supervisorName, setSupervisorName] = useState("");
  const [supervisorStatus, setSupervisorStatus] = useState<
    "NOT_DECIDED" | "APPROACHED" | "CONFIRMED"
  >("NOT_DECIDED");
  const [domainTrack, setDomainTrack] = useState("");
  const [customLinks, setCustomLinks] = useState<CustomResourceLink[]>([]);

  // Initial group setup state (for students without a group yet)
  const [initialProjectTitle, setInitialProjectTitle] = useState("");
  const [initialProjectDesc, setInitialProjectDesc] = useState("");

  // GitHub-style Collaborator Search & Direct Invite state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<InviteSearchCandidate[]>(
    []
  );
  const [isSearching, setIsSearching] = useState(false);
  const [inviteNote, setInviteNote] = useState("");

  // Member responsibility inline edit state
  const [editingRoleMemberId, setEditingRoleMemberId] = useState<string | null>(
    null
  );
  const [roleDraft, setRoleDraft] = useState("");
  const [messagingMemberId, setMessagingMemberId] = useState<string | null>(
    null
  );

  // Supervisor action-to-task bridge state
  const [externalTaskPrefill, setExternalTaskPrefill] = useState<{
    title: string;
    description?: string;
    onCreated?: (taskId: string) => void;
  } | null>(null);

  // Modals state
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showLockModal, setShowLockModal] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<any | null>(null);

  // Debounced collaborator search
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (trimmed.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    let cancelled = false;
    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const results = await searchCollaboratorsApi(trimmed);
        if (!cancelled) {
          setSearchResults(results);
        }
      } catch {
        if (!cancelled) setSearchResults([]);
      } finally {
        if (!cancelled) setIsSearching(false);
      }
    }, 280);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-2.5">
          <div className="animate-spin w-6 h-6 border-2 border-slate-900 dark:border-white border-t-transparent rounded-full" />
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Loading workspace...
          </p>
        </div>
      </div>
    );
  }

  // Current user & leader check
  const currentUserId = group?.currentStudentId || profile?.id;
  const currentMember = group?.members.find(
    (m) => m.id === currentUserId || (profile && m.id === profile.id)
  );
  const showGroupOnProfile = currentMember?.showGroupOnProfile ?? true;

  const sortedMembers = group?.members
    ? [...group.members].sort((a, b) => {
        if (!a.joinedAt || !b.joinedAt) return 0;
        return new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime();
      })
    : [];
  const leaderId = sortedMembers[0]?.id;
  const isCurrentUserLeader =
    leaderId === currentUserId || (!!profile?.id && leaderId === profile.id);

  const meta = workspaceMeta || group?.workspaceMeta;
  const activeMilestones = meta?.milestones || PREVIEW_MILESTONES;
  const memberRoles = meta?.memberRoles || {};
  const meetingsCount = meta?.supervisorMeetings?.length || 0;

  const handleStartEditProject = () => {
    if (!group) return;
    setProjectName(group.projectName || "");
    setDescription(group.description || "");
    setRepoUrl(meta?.repoUrl || "");
    setDocsUrl(meta?.docsUrl || "");
    setDemoUrl(meta?.demoUrl || "");
    setSupervisorName(meta?.supervisorName || "");
    setSupervisorStatus(meta?.supervisorStatus || "NOT_DECIDED");
    setDomainTrack(meta?.domainTrack || "");
    setCustomLinks(meta?.customLinks ? [...meta.customLinks] : []);
    setIsEditingProject(true);
  };

  /**
   * Single Atomic Save for Project Details + Resource Links + Supervisor Info
   */
  const handleSaveProject = () => {
    if (!projectName.trim()) {
      toast.error("Project title is required");
      return;
    }

    updateWorkspaceMeta.mutate(
      {
        projectName: projectName.trim(),
        description: description.trim() || null,
        repoUrl: repoUrl.trim() || null,
        docsUrl: docsUrl.trim() || null,
        demoUrl: demoUrl.trim() || null,
        supervisorName: supervisorName.trim() || null,
        supervisorStatus,
        domainTrack: domainTrack.trim() || null,
        customLinks: customLinks.filter(
          (l) => l.label.trim().length > 0 && l.url.trim().length > 0
        ),
      },
      {
        onSuccess: () => {
          setIsEditingProject(false);
          toast.success("Project details and resource links saved");
        },
        onError: (err: any) => {
          toast.error(err?.message || "Failed to save project details");
        },
      }
    );
  };

  const handleAddCustomLinkRow = () => {
    if (customLinks.length >= 6) return;
    setCustomLinks((prev) => [
      ...prev,
      {
        id: `link-${Date.now()}-${prev.length}`,
        label: "",
        url: "",
        category: "OTHER",
      },
    ]);
  };

  const handleUpdateCustomLinkRow = (
    idx: number,
    field: "label" | "url",
    value: string
  ) => {
    setCustomLinks((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item))
    );
  };

  const handleRemoveCustomLinkRow = (idx: number) => {
    setCustomLinks((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSaveMemberRole = (memberId: string) => {
    const nextRoles = { ...memberRoles };
    if (roleDraft.trim()) {
      nextRoles[memberId] = roleDraft.trim();
    } else {
      delete nextRoles[memberId];
    }

    updateWorkspaceMeta.mutate(
      { memberRoles: nextRoles },
      {
        onSuccess: () => {
          setEditingRoleMemberId(null);
          toast.success("Member responsibility updated");
        },
        onError: (err: any) => {
          toast.error(err?.message || "Failed to update responsibility");
        },
      }
    );
  };

  const handleStartMessageTeammate = async (targetStudentId: string) => {
    try {
      setMessagingMemberId(targetStudentId);
      const res = await fetch("/api/messaging/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetStudentId }),
      });
      const json = await res.json();
      if (!res.ok || !json.success || !json.data?.conversation?.id) {
        throw new Error(json.message || "Could not open conversation");
      }
      router.push(`/dashboard/messages/${json.data.conversation.id}`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to open chat");
    } finally {
      setMessagingMemberId(null);
    }
  };

  const handleConvertSupervisorActionToTask = (action: {
    meetingId: string;
    actionId: string;
    text: string;
    meetingDate: string;
  }) => {
    setActiveTab("workspace");
    setExternalTaskPrefill({
      title: action.text,
      description: `Action item from supervisor meeting on ${new Date(
        action.meetingDate
      ).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}.`,
      onCreated: (createdTaskId: string) => {
        const currentMeetings = meta?.supervisorMeetings || [];
        const updatedMeetings = currentMeetings.map((m) => {
          if (m.id !== action.meetingId) return m;
          return {
            ...m,
            actionItems: m.actionItems.map((a) =>
              a.id === action.actionId
                ? { ...a, linkedTaskId: createdTaskId }
                : a
            ),
          };
        });
        updateWorkspaceMeta.mutate({ supervisorMeetings: updatedMeetings });
      },
    });
  };

  const handleInviteStudent = (toStudentId: string) => {
    inviteCollaborator.mutate(
      {
        toStudentId,
        reason: inviteNote.trim() || undefined,
      },
      {
        onSuccess: () => {
          setSearchResults((prev) =>
            prev.map((item) =>
              item.id === toStudentId
                ? { ...item, isPending: true, canInvite: false }
                : item
            )
          );
          setInviteNote("");
        },
      }
    );
  };

  const handleInitializeGroup = (e: React.FormEvent) => {
    e.preventDefault();
    createInitialGroup.mutate({
      projectName: initialProjectTitle.trim() || "New FYP Project",
      description: initialProjectDesc.trim() || undefined,
    });
  };

  const handleConfirmLeave = () => {
    const targetId =
      currentMember?.id || currentUserId || profile?.id || "self";
    leaveGroup.mutate(targetId, {
      onSuccess: () => setShowLeaveModal(false),
    });
  };

  const handleConfirmLock = () => {
    lockGroup.mutate(undefined, {
      onSuccess: () => setShowLockModal(false),
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 sm:py-6 space-y-5">
      {/* ===================================================================== */}
      {/* ACTIVE GROUP WORKSPACE                                                */}
      {/* ===================================================================== */}
      {isInGroup && group ? (
        <div className="space-y-5">
          {/* 1. Compact Project Header & Resource Bar */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-xs">
            {!isEditingProject ? (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                        {group.projectName || "Untitled FYP Project"}
                      </h1>
                      {meta?.domainTrack && (
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {meta.domainTrack}
                        </span>
                      )}
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border ${
                          isGroupLocked
                            ? "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                            : "bg-emerald-50/80 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900/50"
                        }`}
                      >
                        {isGroupLocked ? (
                          <Lock className="w-2.5 h-2.5" />
                        ) : (
                          <Unlock className="w-2.5 h-2.5" />
                        )}
                        {isGroupLocked
                          ? "Locked Roster"
                          : `Team ${group.members.length}/3`}
                      </span>
                    </div>
                    {group.description && (
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 max-w-3xl leading-relaxed">
                        {group.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-start">
                    {!isGroupLocked && group.members.length < 3 && (
                      <button
                        type="button"
                        onClick={() => setActiveTab("team")}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        Add Collaborator
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleStartEditProject}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Edit Project & Links
                    </button>
                  </div>
                </div>

                {/* Compact Resource & Supervisor Strip */}
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                  <button
                    type="button"
                    onClick={() => setActiveTab("supervisor")}
                    className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                  >
                    <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-slate-400">Supervisor:</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {meta?.supervisorName || "Not set"}
                    </span>
                    {meta?.supervisorStatus === "CONFIRMED" && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                        Confirmed
                      </span>
                    )}
                    {meta?.supervisorStatus === "APPROACHED" && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                        Approached
                      </span>
                    )}
                  </button>

                  {meta?.repoUrl ? (
                    <a
                      href={meta.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:underline"
                    >
                      <GitBranch className="w-3.5 h-3.5 text-slate-400" />
                      GitHub Repo
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={handleStartEditProject}
                      className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                    >
                      <GitBranch className="w-3.5 h-3.5" />+ GitHub Repo
                    </button>
                  )}

                  {meta?.docsUrl ? (
                    <a
                      href={meta.docsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:underline"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      Docs / SRS
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={handleStartEditProject}
                      className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />+ Docs / SRS
                    </button>
                  )}

                  {meta?.demoUrl ? (
                    <a
                      href={meta.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:underline"
                    >
                      <Globe className="w-3.5 h-3.5 text-slate-400" />
                      Prototype / Demo
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={handleStartEditProject}
                      className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                    >
                      <Globe className="w-3.5 h-3.5" />+ Demo Link
                    </button>
                  )}

                  {/* Custom Resource Links (Thesis, Slides, Datasets, etc.) */}
                  {meta?.customLinks &&
                    meta.customLinks.map((link) => (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:underline"
                      >
                        <Link2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{link.label}</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </a>
                    ))}
                </div>
              </div>
            ) : (
              /* Clean Inline Project & Links Editor */
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Edit Project Details & Resource Links
                  </h2>
                  <button
                    type="button"
                    onClick={() => setIsEditingProject(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Project Title *
                    </label>
                    <input
                      type="text"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      maxLength={100}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Domain / Track
                    </label>
                    <input
                      type="text"
                      value={domainTrack}
                      onChange={(e) => setDomainTrack(e.target.value)}
                      placeholder="e.g. AI / Web / IoT"
                      maxLength={80}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Summary / Scope
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    maxLength={500}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Supervisor Name
                    </label>
                    <input
                      type="text"
                      value={supervisorName}
                      onChange={(e) => setSupervisorName(e.target.value)}
                      placeholder="e.g. Dr. Muhammad Bilal"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Supervisor Status
                    </label>
                    <select
                      value={supervisorStatus}
                      onChange={(e) =>
                        setSupervisorStatus(e.target.value as any)
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                    >
                      <option value="NOT_DECIDED">Not Decided</option>
                      <option value="APPROACHED">Approached</option>
                      <option value="CONFIRMED">Confirmed</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      GitHub Repository URL
                    </label>
                    <input
                      type="url"
                      value={repoUrl}
                      onChange={(e) => setRepoUrl(e.target.value)}
                      placeholder="https://github.com/..."
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Docs / SRS / Drive URL
                    </label>
                    <input
                      type="url"
                      value={docsUrl}
                      onChange={(e) => setDocsUrl(e.target.value)}
                      placeholder="https://docs.google.com/..."
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Demo / Figma URL
                    </label>
                    <input
                      type="url"
                      value={demoUrl}
                      onChange={(e) => setDemoUrl(e.target.value)}
                      placeholder="https://figma.com/..."
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Additional Custom Project Resources (Thesis, Slides, Dataset, etc.) */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                      Additional Resource Links (Thesis, Overleaf, Slides, Dataset)
                    </span>
                    {customLinks.length < 6 && (
                      <button
                        type="button"
                        onClick={handleAddCustomLinkRow}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:underline cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Resource Link
                      </button>
                    )}
                  </div>

                  {customLinks.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center"
                    >
                      <input
                        type="text"
                        value={item.label}
                        onChange={(e) =>
                          handleUpdateCustomLinkRow(
                            idx,
                            "label",
                            e.target.value
                          )
                        }
                        placeholder="Label (e.g. Final Thesis Overleaf)"
                        maxLength={50}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                      />
                      <div className="sm:col-span-2 flex items-center gap-2">
                        <input
                          type="url"
                          value={item.url}
                          onChange={(e) =>
                            handleUpdateCustomLinkRow(
                              idx,
                              "url",
                              e.target.value
                            )
                          }
                          placeholder="https://..."
                          className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomLinkRow(idx)}
                          className="p-1.5 text-slate-400 hover:text-red-500 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleSaveProject}
                    disabled={
                      !projectName.trim() || updateWorkspaceMeta.isPending
                    }
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 disabled:opacity-50 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {updateWorkspaceMeta.isPending
                      ? "Saving..."
                      : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingProject(false)}
                    className="px-3 py-2 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 2. Clean 3-Section Navigation: Workspace, Supervisor, Team */}
          <div className="flex items-center gap-5 sm:gap-7 border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-hide">
            <button
              type="button"
              onClick={() => setActiveTab("workspace")}
              className={`inline-flex items-center gap-2 pb-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === "workspace"
                  ? "border-slate-900 text-slate-900 dark:border-white dark:text-white"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <FolderKanban className="w-4 h-4" />
              <span>Workspace</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("supervisor")}
              className={`inline-flex items-center gap-2 pb-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === "supervisor"
                  ? "border-slate-900 text-slate-900 dark:border-white dark:text-white"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Supervisor</span>
              {meetingsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {meetingsCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("team")}
              className={`inline-flex items-center gap-2 pb-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === "team"
                  ? "border-slate-900 text-slate-900 dark:border-white dark:text-white"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Team</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {group.members.length}/3
              </span>
            </button>
          </div>

          {/* TAB 1: WORKSPACE (Milestones + Task Board + Starter Checklists) */}
          {activeTab === "workspace" && (
            <div className="space-y-5">
              <DeadlineTimeline
                groupId={group.id}
                previewMode={false}
                initialMeta={meta}
                selectedMilestoneId={selectedMilestoneId}
                onSelectMilestone={setSelectedMilestoneId}
              />

              <KanbanBoard
                groupId={group.id}
                members={group.members.map((m) => ({
                  id: m.id,
                  name: m.name,
                  profilePicture: m.profilePicture,
                }))}
                milestones={activeMilestones}
                selectedMilestoneId={selectedMilestoneId}
                onSelectMilestone={setSelectedMilestoneId}
                externalTaskPrefill={externalTaskPrefill}
                onClearExternalPrefill={() => setExternalTaskPrefill(null)}
                previewMode={false}
              />
            </div>
          )}

          {/* TAB 2: SUPERVISOR (Meetings, Feedback & Action Items) */}
          {activeTab === "supervisor" && (
            <SupervisorLog
              groupId={group.id}
              meta={meta}
              currentUserName={currentMember?.name || profile?.name}
              onConvertActionToTask={handleConvertSupervisorActionToTask}
            />
          )}

          {/* TAB 3: TEAM, RESPONSIBILITIES, COLLABORATOR INVITES & SETTINGS */}
          {activeTab === "team" && (
            <div className="space-y-5">
              {/* Direct Collaborator Invite Box (GitHub-style) */}
              {!isGroupLocked && group.members.length < 3 && (
                <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 space-y-3.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                        Add a Collaborator
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Search same-semester students by name or email. Clicking Invite sends a group invitation and an automatic email to their inbox.
                      </p>
                    </div>
                    <Link
                      href="/dashboard/discovery"
                      className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:underline shrink-0"
                    >
                      Browse Discovery →
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="sm:col-span-2 relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search classmate by full name, email, or department..."
                        className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                    <input
                      type="text"
                      value={inviteNote}
                      onChange={(e) => setInviteNote(e.target.value)}
                      placeholder="Optional note for email..."
                      maxLength={140}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  {isSearching && (
                    <p className="text-xs text-slate-400">
                      Searching students...
                    </p>
                  )}

                  {!isSearching &&
                    searchQuery.trim().length >= 2 &&
                    searchResults.length === 0 && (
                      <p className="text-xs text-slate-400">
                        No matching same-semester students found.
                      </p>
                    )}

                  {searchResults.length > 0 && (
                    <div className="divide-y divide-slate-200/70 dark:divide-slate-800 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 max-h-60 overflow-y-auto">
                      {searchResults.map((candidate) => (
                        <div
                          key={candidate.id}
                          className="flex items-center justify-between gap-3 px-4 py-2.5"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                                {candidate.name}
                              </span>
                              <span className="text-[11px] text-slate-500">
                                {candidate.department} • Sem{" "}
                                {candidate.semester}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 truncate">
                              {candidate.email}
                            </div>
                          </div>

                          <div className="shrink-0">
                            {candidate.canInvite ? (
                              <button
                                type="button"
                                onClick={() =>
                                  handleInviteStudent(candidate.id)
                                }
                                disabled={inviteCollaborator.isPending}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 disabled:opacity-50 cursor-pointer"
                              >
                                <UserPlus className="w-3.5 h-3.5" />
                                Invite & Email
                              </button>
                            ) : candidate.isPending ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                                Pending Invite
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-400">
                                Group Full
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Current Team Roster, Responsibilities, Messaging & Pending Invitations */}
              <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden">
                <div className="px-5 py-3.5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                      Team Members & Responsibilities ({group.members.length}/3)
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Assign functional project roles (e.g. AI/ML, Backend, Frontend & SRS) and message teammates directly.
                    </p>
                  </div>
                </div>

                <div className="divide-y divide-slate-200/60 dark:divide-slate-800/60">
                  {group.members.map((member) => {
                    const isSelf =
                      member.id === currentUserId ||
                      (!!profile?.id && member.id === profile.id);
                    const canEditRole = isSelf || isCurrentUserLeader;
                    const memberRoleLabel = memberRoles[member.id] || "";

                    return (
                      <div
                        key={member.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5"
                      >
                        <div className="flex items-start sm:items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 sm:mt-0">
                            {member.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                          <div className="min-w-0 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
                                {member.name}
                              </span>
                              {isSelf && (
                                <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                  You
                                </span>
                              )}
                              {member.id === leaderId ? (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
                                  <Crown className="w-2.5 h-2.5" />
                                  Leader
                                </span>
                              ) : (
                                <span className="text-[11px] text-slate-400">
                                  Member
                                </span>
                              )}
                              {memberRoleLabel &&
                                editingRoleMemberId !== member.id && (
                                  <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-sky-50 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300 border border-sky-200/60 dark:border-sky-900/50">
                                    {memberRoleLabel}
                                  </span>
                                )}
                            </div>

                            <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500 dark:text-slate-400">
                              <span>
                                {member.department} • Semester {member.semester}
                              </span>
                              {canEditRole &&
                                editingRoleMemberId !== member.id && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingRoleMemberId(member.id);
                                      setRoleDraft(memberRoleLabel);
                                    }}
                                    className="text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:underline cursor-pointer"
                                  >
                                    {memberRoleLabel
                                      ? "Edit Role"
                                      : "+ Set Responsibility"}
                                  </button>
                                )}
                            </div>

                            {/* Inline Responsibility Editor */}
                            {editingRoleMemberId === member.id && (
                              <div className="flex items-center gap-1.5 pt-1">
                                <input
                                  type="text"
                                  value={roleDraft}
                                  onChange={(e) => setRoleDraft(e.target.value)}
                                  placeholder="e.g. Backend & DB Lead"
                                  maxLength={50}
                                  className="px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleSaveMemberRole(member.id)
                                  }
                                  disabled={updateWorkspaceMeta.isPending}
                                  className="px-2.5 py-1 rounded-md bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-[11px] font-semibold cursor-pointer"
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingRoleMemberId(null)}
                                  className="px-2 py-1 text-[11px] text-slate-500"
                                >
                                  Cancel
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                          {!isSelf && (
                            <button
                              type="button"
                              onClick={() =>
                                handleStartMessageTeammate(member.id)
                              }
                              disabled={messagingMemberId === member.id}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 cursor-pointer"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>
                                {messagingMemberId === member.id
                                  ? "Opening..."
                                  : "Message"}
                              </span>
                            </button>
                          )}

                          {!isGroupLocked && (
                            <>
                              {isSelf ? (
                                <button
                                  type="button"
                                  onClick={() => setShowLeaveModal(true)}
                                  className="px-2.5 py-1.5 text-xs font-medium text-red-600 hover:underline dark:text-red-400 cursor-pointer"
                                >
                                  Leave
                                </button>
                              ) : isCurrentUserLeader ? (
                                <button
                                  type="button"
                                  onClick={() => setMemberToRemove(member)}
                                  className="px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:text-red-600 dark:hover:text-red-400 cursor-pointer"
                                >
                                  Remove
                                </button>
                              ) : null}
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pending Outgoing Invitations with Resend Email & Withdraw */}
                {group.pendingInvites && group.pendingInvites.length > 0 && (
                  <div className="border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 px-5 py-3.5 space-y-2.5">
                    <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                      Pending Invitations ({group.pendingInvites.length})
                    </div>
                    <div className="divide-y divide-slate-200/60 dark:divide-slate-800/60">
                      {group.pendingInvites.map((inv) => (
                        <div
                          key={inv.requestId}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2.5 first:pt-0 last:pb-0"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-slate-900 dark:text-white">
                                {inv.name}
                              </span>
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                                Pending Acceptance
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500">
                              {inv.email} • {inv.department} (Sem {inv.semester}
                              )
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => resendInvite.mutate(inv.requestId)}
                              disabled={resendInvite.isPending}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 cursor-pointer"
                            >
                              <Mail className="w-3 h-3" />
                              Resend Email
                            </button>
                            <button
                              type="button"
                              onClick={() => cancelInvite.mutate(inv.requestId)}
                              disabled={cancelInvite.isPending}
                              className="px-2 py-1 rounded-md text-[11px] font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 disabled:opacity-50 cursor-pointer"
                            >
                              Withdraw
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Minimal Settings & Roster Lock Bar */}
              <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center justify-between sm:justify-start gap-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">
                      Show FYP Group on Public Profile
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Display your project title and teammates on Discovery.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      updateVisibility.mutate(!showGroupOnProfile)
                    }
                    disabled={updateVisibility.isPending}
                    className={`relative w-10 h-5.5 rounded-full transition-colors shrink-0 cursor-pointer ${
                      showGroupOnProfile
                        ? "bg-slate-900 dark:bg-white"
                        : "bg-slate-300 dark:bg-slate-700"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-4.5 h-4.5 rounded-full transition-transform ${
                        showGroupOnProfile
                          ? "translate-x-5 bg-white dark:bg-slate-900"
                          : "translate-x-0.5 bg-white dark:bg-slate-400"
                      }`}
                    />
                  </button>
                </div>

                {!isGroupLocked && (
                  <div className="flex items-center gap-2.5 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setShowLeaveModal(true)}
                      className="px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-900/50 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer"
                    >
                      Leave Group
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowLockModal(true)}
                      disabled={
                        group.members.length < 2 || lockGroup.isPending
                      }
                      title={
                        group.members.length < 2
                          ? "Requires at least 2 members to lock"
                          : "Finalize roster"
                      }
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      Finalize & Lock Roster
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ===================================================================== */
        /* NO GROUP YET — Clean 2-Column Setup & Direct Collaborator Invite      */
        /* ===================================================================== */
        <div className="space-y-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              FYP Workspace Setup
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-0.5">
              Start your project workspace immediately as Group Leader, or invite a classmate by name/email.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Left: Initialize Project Space */}
            <div className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 space-y-4">
              <div className="space-y-1">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                  1. Create Your Project Workspace
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Initialize your FYP workspace now to manage tasks, milestones, starter checklists, and GitHub links, then invite up to 2 teammates anytime.
                </p>
              </div>

              <form onSubmit={handleInitializeGroup} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Project Title
                  </label>
                  <input
                    type="text"
                    value={initialProjectTitle}
                    onChange={(e) => setInitialProjectTitle(e.target.value)}
                    placeholder="e.g. Autonomous Drone Delivery System"
                    maxLength={100}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Brief Summary (Optional)
                  </label>
                  <textarea
                    value={initialProjectDesc}
                    onChange={(e) => setInitialProjectDesc(e.target.value)}
                    placeholder="Short description of your project idea..."
                    rows={2}
                    maxLength={300}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={createInitialGroup.isPending}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 disabled:opacity-50 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {createInitialGroup.isPending
                    ? "Creating..."
                    : "Create Project Space"}
                </button>
              </form>
            </div>

            {/* Right: Direct Collaborator Search */}
            <div className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="space-y-1">
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                    2. Invite a Teammate by Name or Email
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Search same-semester students directly. Sending an invite dispatches an email to their inbox.
                  </p>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Type classmate name or email..."
                    className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                {isSearching && (
                  <p className="text-xs text-slate-400">Searching...</p>
                )}

                {searchResults.length > 0 && (
                  <div className="divide-y divide-slate-200/70 dark:divide-slate-800 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900 max-h-48 overflow-y-auto">
                    {searchResults.map((candidate) => (
                      <div
                        key={candidate.id}
                        className="flex items-center justify-between gap-2 px-3 py-2"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                            {candidate.name}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate">
                            {candidate.email} • {candidate.department}
                          </p>
                        </div>
                        {candidate.canInvite ? (
                          <button
                            type="button"
                            onClick={() => handleInviteStudent(candidate.id)}
                            disabled={inviteCollaborator.isPending}
                            className="px-2.5 py-1 rounded-md bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-[11px] font-semibold shrink-0 cursor-pointer"
                          >
                            Invite & Email
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {candidate.isPending ? "Pending" : "Unavailable"}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <Link
                  href="/dashboard/discovery"
                  className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:underline"
                >
                  Browse All Students in Discovery →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leave Group Confirmation Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-6 space-y-4 shadow-xl border border-slate-200/80 dark:border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {group && group.members.length <= 1
                  ? "Delete Solo FYP Workspace?"
                  : "Leave FYP Group?"}
              </h3>
              <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                {group && group.members.length <= 1
                  ? "Because you are currently the only member in this workspace, leaving will permanently delete this project workspace and its tasks."
                  : "You will be removed from this group, any tasks assigned to you will be marked Unassigned, and you can join or create another team anytime."}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowLeaveModal(false)}
                disabled={leaveGroup.isPending}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmLeave}
                disabled={leaveGroup.isPending}
                className="px-3.5 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 disabled:opacity-50"
              >
                {leaveGroup.isPending
                  ? "Processing..."
                  : group && group.members.length <= 1
                  ? "Delete Workspace"
                  : "Leave Group"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Member Confirmation Modal */}
      {memberToRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-6 space-y-4 shadow-xl border border-slate-200/80 dark:border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 flex items-center justify-center">
              <UserMinus className="w-5 h-5" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Remove {memberToRemove.name}?
              </h3>
              <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                Removing this member releases them from the team and unassigns their active tasks so your team can reassign them.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setMemberToRemove(null)}
                disabled={removeMember.isPending}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  removeMember.mutate(memberToRemove.id, {
                    onSuccess: () => setMemberToRemove(null),
                  });
                }}
                disabled={removeMember.isPending}
                className="px-3.5 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 disabled:opacity-50"
              >
                {removeMember.isPending ? "Removing..." : "Remove"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lock Group Confirmation Modal */}
      {showLockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-6 space-y-4 shadow-xl border border-slate-200/80 dark:border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-zinc-200 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Finalize & Lock FYP Group?
              </h3>
              <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                Locking your group finalizes your 2–3 member roster so members cannot leave without department approval.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowLockModal(false)}
                disabled={lockGroup.isPending}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmLock}
                disabled={lockGroup.isPending}
                className="px-3.5 py-1.5 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 disabled:opacity-50"
              >
                {lockGroup.isPending ? "Locking..." : "Confirm Lock"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
