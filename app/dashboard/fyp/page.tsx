// app/dashboard/fyp/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { KanbanBoard } from "@/components/workspace/KanbanBoard";
import { DeadlineTimeline } from "@/components/workspace/DeadlineTimeline";
import {
  useMyGroup,
  useUpdateGroupProject,
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
import { useWorkspaceMeta, useUpdateWorkspaceMeta } from "@/services/workspace.service";
import { useMyProfile } from "@/hooks/student/useMyProfile";
import {
  Users,
  Lock,
  Unlock,
  Edit2,
  Save,
  X,
  ArrowLeft,
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
} from "lucide-react";

export default function FYPManagementPage() {
  const { group, isLoading, isInGroup, isGroupLocked } = useMyGroup();
  const { profile } = useMyProfile();
  const updateProject = useUpdateGroupProject();
  const updateVisibility = useUpdateGroupVisibility();
  const leaveGroup = useLeaveGroup();
  const removeMember = useRemoveMember();
  const lockGroup = useLockGroup();
  const createInitialGroup = useCreateInitialGroup();
  const inviteCollaborator = useInviteCollaborator();
  const resendInvite = useResendCollaboratorInvite();
  const cancelInvite = useCancelCollaboratorInvite();

  const { data: workspaceMeta } = useWorkspaceMeta(group?.id || "", isInGroup);
  const updateWorkspaceMeta = useUpdateWorkspaceMeta(group?.id || "");

  // Clean 2-Tab Navigation:
  // 1. "workspace" (Visual Editable Milestones + Sticky-Note Task Board together!)
  // 2. "team" (Team Members, GitHub-Style Collaborator Invite & Email, and Settings)
  const [activeTab, setActiveTab] = useState<"workspace" | "team">("workspace");
  const [isEditingProject, setIsEditingProject] = useState(false);

  // Project & Links edit state
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [docsUrl, setDocsUrl] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [supervisorName, setSupervisorName] = useState("");
  const [supervisorStatus, setSupervisorStatus] = useState<"NOT_DECIDED" | "APPROACHED" | "CONFIRMED">("NOT_DECIDED");
  const [domainTrack, setDomainTrack] = useState("");

  // Initial group setup state (for students without a group yet)
  const [initialProjectTitle, setInitialProjectTitle] = useState("");
  const [initialProjectDesc, setInitialProjectDesc] = useState("");

  // GitHub-style Collaborator Search & Direct Invite state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<InviteSearchCandidate[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [inviteNote, setInviteNote] = useState("");

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
          <p className="text-xs text-slate-500 dark:text-zinc-400">Loading workspace...</p>
        </div>
      </div>
    );
  }

  // Current user & leader check
  const currentUserId = group?.currentStudentId || profile?.id;
  const currentMember = group?.members.find((m) => m.id === currentUserId || (profile && m.id === profile.id));
  const showGroupOnProfile = currentMember?.showGroupOnProfile ?? true;

  const sortedMembers = group?.members
    ? [...group.members].sort((a, b) => {
        if (!a.joinedAt || !b.joinedAt) return 0;
        return new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime();
      })
    : [];
  const leaderId = sortedMembers[0]?.id;
  const isCurrentUserLeader = leaderId === currentUserId || (!!profile?.id && leaderId === profile.id);

  const meta = workspaceMeta || group?.workspaceMeta;

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
    setIsEditingProject(true);
  };

  const handleSaveProject = () => {
    if (!projectName.trim()) return;
    updateProject.mutate(
      { projectName: projectName.trim(), description: description.trim() || undefined },
      {
        onSuccess: () => {
          updateWorkspaceMeta.mutate(
            {
              repoUrl: repoUrl.trim() || null,
              docsUrl: docsUrl.trim() || null,
              demoUrl: demoUrl.trim() || null,
              supervisorName: supervisorName.trim() || null,
              supervisorStatus,
              domainTrack: domainTrack.trim() || null,
            },
            {
              onSuccess: () => setIsEditingProject(false),
            }
          );
        },
      }
    );
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
              item.id === toStudentId ? { ...item, isPending: true, canInvite: false } : item
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
    const targetId = currentMember?.id || currentUserId || profile?.id || "self";
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/profile"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Profile
        </Link>

        {isInGroup && group && (
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${
                isGroupLocked
                  ? "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                  : "bg-emerald-50/80 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900/50"
              }`}
            >
              {isGroupLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
              {isGroupLocked ? "Locked Roster" : `Team ${group.members.length}/3`}
            </span>
          </div>
        )}
      </div>

      {/* ===================================================================== */}
      {/* ACTIVE GROUP WORKSPACE                                                */}
      {/* ===================================================================== */}
      {isInGroup && group ? (
        <div className="space-y-6">
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
                    </div>
                    {group.description && (
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 max-w-3xl leading-relaxed">
                        {group.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
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

                {/* Compact Single-Line Resource & Supervisor Strip */}
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                  <div className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
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
                  </div>

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
                      <GitBranch className="w-3.5 h-3.5" />
                      + Add GitHub Repo
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
                      <FileText className="w-3.5 h-3.5" />
                      + Add Docs / Drive
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
                      <Globe className="w-3.5 h-3.5" />
                      + Add Demo Link
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* Clean Inline Project & Links Editor */
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Edit Project Details & Links
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
                      onChange={(e) => setSupervisorStatus(e.target.value as any)}
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

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleSaveProject}
                    disabled={!projectName.trim() || updateProject.isPending || updateWorkspaceMeta.isPending}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {updateProject.isPending || updateWorkspaceMeta.isPending ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingProject(false)}
                    className="px-3 py-2 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 2. Clean 2-Tab Navigation: Workspace (Milestones + Task Board) & Team/Collaborators */}
          <div className="flex items-center gap-6 border-b border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab("workspace")}
              className={`inline-flex items-center gap-2 pb-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
                activeTab === "workspace"
                  ? "border-slate-900 text-slate-900 dark:border-white dark:text-white"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <FolderKanban className="w-4 h-4" />
              Workspace (Milestones & Task Board)
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("team")}
              className={`inline-flex items-center gap-2 pb-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
                activeTab === "team"
                  ? "border-slate-900 text-slate-900 dark:border-white dark:text-white"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <Users className="w-4 h-4" />
              Team & Collaborators
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {group.members.length}/3
              </span>
            </button>
          </div>

          {/* TAB 1: WORKSPACE (Visual Editable Milestones + Sticky-Note Task Board) */}
          {activeTab === "workspace" && (
            <div className="space-y-6">
              <DeadlineTimeline groupId={group.id} previewMode={false} />

              <KanbanBoard
                groupId={group.id}
                members={group.members.map((m) => ({
                  id: m.id,
                  name: m.name,
                  profilePicture: m.profilePicture,
                }))}
                previewMode={false}
              />
            </div>
          )}

          {/* TAB 2: TEAM, COLLABORATORS & SETTINGS */}
          {activeTab === "team" && (
            <div className="space-y-6">
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
                    <p className="text-xs text-slate-400">Searching students...</p>
                  )}

                  {!isSearching && searchQuery.trim().length >= 2 && searchResults.length === 0 && (
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
                                {candidate.department} • Sem {candidate.semester}
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
                                onClick={() => handleInviteStudent(candidate.id)}
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
                              <span className="text-[11px] text-slate-400">Group Full</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Current Team Roster & Pending Invitations Table */}
              <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden">
                <div className="px-5 py-3.5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Team Members ({group.members.length}/3)
                  </h3>
                </div>

                <div className="divide-y divide-slate-200/60 dark:divide-slate-800/60">
                  {group.members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between gap-3 px-5 py-3.5"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex items-center justify-center font-bold text-xs shrink-0">
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
                              {member.name}
                            </span>
                            {(member.id === currentUserId || (!!profile?.id && member.id === profile.id)) && (
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
                              <span className="text-[11px] text-slate-400">Member</span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {member.department} • Semester {member.semester}
                          </p>
                        </div>
                      </div>

                      {!isGroupLocked && (
                        <div>
                          {(member.id === currentUserId || (!!profile?.id && member.id === profile.id)) ? (
                            <button
                              type="button"
                              onClick={() => setShowLeaveModal(true)}
                              className="text-xs font-medium text-red-600 hover:underline dark:text-red-400"
                            >
                              Leave
                            </button>
                          ) : isCurrentUserLeader ? (
                            <button
                              type="button"
                              onClick={() => setMemberToRemove(member)}
                              className="text-xs font-medium text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                            >
                              Remove
                            </button>
                          ) : null}
                        </div>
                      )}
                    </div>
                  ))}
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
                              {inv.email} • {inv.department} (Sem {inv.semester})
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
                    onClick={() => updateVisibility.mutate(!showGroupOnProfile)}
                    disabled={updateVisibility.isPending}
                    className={`relative w-10 h-5.5 rounded-full transition-colors shrink-0 ${
                      showGroupOnProfile ? "bg-slate-900 dark:bg-white" : "bg-slate-300 dark:bg-slate-700"
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
                      className="px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-900/50 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20"
                    >
                      Leave Group
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowLockModal(true)}
                      disabled={group.members.length < 2 || lockGroup.isPending}
                      title={group.members.length < 2 ? "Requires at least 2 members to lock" : "Finalize roster"}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 disabled:opacity-40"
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
                  Initialize your FYP workspace now to manage tasks, milestones, and GitHub links, then invite up to 2 teammates anytime.
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
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 disabled:opacity-50"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {createInitialGroup.isPending ? "Creating..." : "Create Project Space"}
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

                {isSearching && <p className="text-xs text-slate-400">Searching...</p>}

                {searchResults.length > 0 && (
                  <div className="divide-y divide-slate-200/70 dark:divide-slate-800 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900 max-h-48 overflow-y-auto">
                    {searchResults.map((candidate) => (
                      <div key={candidate.id} className="flex items-center justify-between gap-2 px-3 py-2">
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
                            className="px-2.5 py-1 rounded-md bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-[11px] font-semibold shrink-0"
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
                Leave FYP Group?
              </h3>
              <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                You will be removed from this group and can join or create another team anytime.
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
                {leaveGroup.isPending ? "Leaving..." : "Leave Group"}
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
                Removing this member releases them from the team so both of you can invite new partners.
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
