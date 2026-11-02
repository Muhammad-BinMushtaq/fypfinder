// app/dashboard/fyp/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { WorkspaceTab } from "@/components/workspace/WorkspaceTab";
import {
  useMyGroup,
  useUpdateGroupProject,
  useUpdateGroupVisibility,
  useLeaveGroup,
  useRemoveMember,
  useLockGroup,
  useCreateInitialGroup,
  useInviteCollaborator,
  searchCollaboratorsApi,
  type InviteSearchCandidate,
} from "@/hooks/group/useMyGroup";
import { useWorkspaceMeta, useUpdateWorkspaceMeta } from "@/services/workspace.service";
import { useMyProfile } from "@/hooks/student/useMyProfile";
import {
  Users,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Edit2,
  Save,
  X,
  ArrowLeft,
  FolderKanban,
  AlertTriangle,
  Search,
  CheckCircle2,
  FileCheck2,
  Crown,
  LogOut,
  UserMinus,
  UserPlus,
  ExternalLink,
  GitBranch,
  FileText,
  Globe,
  GraduationCap,
  Clock,
  Plus,
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

  const { data: workspaceMeta } = useWorkspaceMeta(group?.id || "", isInGroup);
  const updateWorkspaceMeta = useUpdateWorkspaceMeta(group?.id || "");

  // Tab & edit state
  const [activeTab, setActiveTab] = useState<"group" | "workspace">("group");
  const [isEditing, setIsEditing] = useState(false);
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
  const [showInviteBox, setShowInviteBox] = useState(false);
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
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin w-8 h-8 border-2 border-slate-900 dark:border-white border-t-transparent rounded-full" />
          <p className="text-xs text-slate-500 dark:text-zinc-400">Loading FYP details...</p>
        </div>
      </div>
    );
  }

  // Find current user in members list
  const currentUserId = group?.currentStudentId || profile?.id;
  const currentMember = group?.members.find((m) => m.id === currentUserId || (profile && m.id === profile.id));
  const showGroupOnProfile = currentMember?.showGroupOnProfile ?? true;

  // Group leadership determination (earliest joinedAt is leader)
  const sortedMembers = group?.members
    ? [...group.members].sort((a, b) => {
        if (!a.joinedAt || !b.joinedAt) return 0;
        return new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime();
      })
    : [];
  const leaderId = sortedMembers[0]?.id;
  const isCurrentUserLeader = leaderId === currentUserId || (!!profile?.id && leaderId === profile.id);

  const meta = workspaceMeta || group?.workspaceMeta;

  // Edit actions
  const handleStartEdit = () => {
    if (!group) return;
    setProjectName(group.projectName || "");
    setDescription(group.description || "");
    setRepoUrl(meta?.repoUrl || "");
    setDocsUrl(meta?.docsUrl || "");
    setDemoUrl(meta?.demoUrl || "");
    setSupervisorName(meta?.supervisorName || "");
    setSupervisorStatus(meta?.supervisorStatus || "NOT_DECIDED");
    setDomainTrack(meta?.domainTrack || "");
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveProject = async () => {
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
              onSuccess: () => setIsEditing(false),
            }
          );
        },
      }
    );
  };

  const handleToggleVisibility = () => {
    updateVisibility.mutate(!showGroupOnProfile);
  };

  const handleConfirmLeave = () => {
    const targetId = currentMember?.id || currentUserId || profile?.id || "self";
    leaveGroup.mutate(targetId, {
      onSuccess: () => {
        setShowLeaveModal(false);
      },
    });
  };

  const handleConfirmLock = () => {
    lockGroup.mutate(undefined, {
      onSuccess: () => {
        setShowLockModal(false);
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
              item.id === toStudentId ? { ...item, isPending: true, canInvite: false } : item
            )
          );
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

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <Link
            href="/dashboard/profile"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Profile
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex items-center justify-center shrink-0 shadow-xs">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                FYP Management
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-0.5">
                Manage your group roster, project links, academic milestones, and team task assignments.
              </p>
            </div>
          </div>
        </div>

        {/* Status Badge & Actions */}
        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-center">
          {isInGroup && group ? (
            <>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                  isGroupLocked
                    ? "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                    : "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/50"
                }`}
              >
                {isGroupLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                {isGroupLocked ? "Group Finalized & Locked" : `Active Team (${group.members.length}/3)`}
              </span>

              {!isGroupLocked ? (
                <button
                  type="button"
                  onClick={() => setShowLeaveModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/30 border border-red-200/80 dark:border-red-900/50 transition-colors shadow-xs"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Leave Group
                </button>
              ) : (
                <span
                  title="Group is locked and finalized. Members cannot leave without supervisor or administrator unlock."
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 cursor-not-allowed"
                >
                  <Lock className="w-3 h-3" />
                  Locked
                </span>
              )}
            </>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              No Active Group
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1.5 rounded-xl bg-slate-100/80 p-1 dark:bg-slate-800/60 max-w-md">
        <button
          onClick={() => setActiveTab("group")}
          className={`flex-1 rounded-lg py-2 px-3 text-xs sm:text-sm font-semibold transition-all ${
            activeTab === "group"
              ? "bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white"
              : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          Group & Project Hub
        </button>
        <button
          onClick={() => setActiveTab("workspace")}
          className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg py-2 px-3 text-xs sm:text-sm font-semibold transition-all ${
            activeTab === "workspace"
              ? "bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white"
              : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          <span>Tasks & Milestones</span>
          {!isInGroup && (
            <span className="px-1.5 py-0.2 rounded text-[10px] uppercase font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
              Preview
            </span>
          )}
        </button>
      </div>

      {/* Tab 1: Group Details & Project Hub */}
      {activeTab === "group" && (
        <div className="space-y-6">
          {isInGroup && group ? (
            <>
              {/* Project Overview & Resource Links Card */}
              <section className="rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900/60 p-6 shadow-xs space-y-5">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-2.5">
                    <FileCheck2 className="w-5 h-5 text-slate-500 dark:text-zinc-400" />
                    <div>
                      <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                        Project Details & Repository Links
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">
                        Proposal title, supervisor status, GitHub repository, and documentation links
                      </p>
                    </div>
                  </div>
                  {!isEditing && (
                    <button
                      onClick={handleStartEdit}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Edit Project
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-4 pt-1">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Project Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={projectName}
                          onChange={(e) => setProjectName(e.target.value)}
                          placeholder="e.g. AI-Powered Autonomous Campus Navigation"
                          maxLength={100}
                          className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Domain / Track
                        </label>
                        <input
                          type="text"
                          value={domainTrack}
                          onChange={(e) => setDomainTrack(e.target.value)}
                          placeholder="e.g. AI / Web / Embedded"
                          maxLength={80}
                          className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Project Scope & Description
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Summarize the core technical objective, methodology, and expected outcomes..."
                        maxLength={500}
                        rows={3}
                        className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:border-transparent resize-none"
                      />
                    </div>

                    {/* Supervisor Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Supervisor Name
                        </label>
                        <input
                          type="text"
                          value={supervisorName}
                          onChange={(e) => setSupervisorName(e.target.value)}
                          placeholder="e.g. Dr. Muhammad Bilal"
                          maxLength={120}
                          className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Supervisor Status
                        </label>
                        <select
                          value={supervisorStatus}
                          onChange={(e) => setSupervisorStatus(e.target.value as any)}
                          className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                        >
                          <option value="NOT_DECIDED">Not Decided Yet</option>
                          <option value="APPROACHED">Approached / Under Discussion</option>
                          <option value="CONFIRMED">Confirmed Supervisor</option>
                        </select>
                      </div>
                    </div>

                    {/* Project Resource Links */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          GitHub Repository URL
                        </label>
                        <input
                          type="url"
                          value={repoUrl}
                          onChange={(e) => setRepoUrl(e.target.value)}
                          placeholder="https://github.com/org/repo"
                          className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          SRS / Google Drive / Docs URL
                        </label>
                        <input
                          type="url"
                          value={docsUrl}
                          onChange={(e) => setDocsUrl(e.target.value)}
                          placeholder="https://docs.google.com/..."
                          className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Figma / Live Prototype URL
                        </label>
                        <input
                          type="url"
                          value={demoUrl}
                          onChange={(e) => setDemoUrl(e.target.value)}
                          placeholder="https://figma.com/..."
                          className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-xs"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={handleSaveProject}
                        disabled={!projectName.trim() || updateProject.isPending || updateWorkspaceMeta.isPending}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors disabled:opacity-50"
                      >
                        <Save className="w-3.5 h-3.5" />
                        {updateProject.isPending || updateWorkspaceMeta.isPending ? "Saving..." : "Save Project Details"}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-slate-600 dark:text-slate-400 rounded-xl text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 pt-1">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                          {group.projectName || "Unnamed FYP Project"}
                        </h3>
                        {meta?.domainTrack && (
                          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700">
                            {meta.domainTrack}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed mt-1.5">
                        {group.description || "No project description provided yet. Click Edit Project to add your scope, repository links, and supervisor details."}
                      </p>
                    </div>

                    {/* Supervisor & Resource Links Strip */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                      {/* Supervisor Box */}
                      <div className="p-3 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 flex items-start gap-2.5">
                        <GraduationCap className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Supervisor</div>
                          <div className="text-xs font-semibold text-slate-900 dark:text-white truncate mt-0.5">
                            {meta?.supervisorName || "Not assigned"}
                          </div>
                          <span
                            className={`inline-block mt-1 px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                              meta?.supervisorStatus === "CONFIRMED"
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                                : meta?.supervisorStatus === "APPROACHED"
                                ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                                : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                            }`}
                          >
                            {meta?.supervisorStatus === "CONFIRMED"
                              ? "Confirmed"
                              : meta?.supervisorStatus === "APPROACHED"
                              ? "Approached"
                              : "Not Decided"}
                          </span>
                        </div>
                      </div>

                      {/* GitHub Repo Link */}
                      <div className="p-3 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 flex items-start gap-2.5">
                        <GitBranch className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">GitHub Repository</div>
                          {meta?.repoUrl ? (
                            <a
                              href={meta.repoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-900 dark:text-white hover:underline truncate max-w-full mt-1"
                            >
                              <span className="truncate">{meta.repoUrl.replace(/^https?:\/\/(www\.)?/, "")}</span>
                              <ExternalLink className="w-3 h-3 shrink-0" />
                            </a>
                          ) : (
                            <button
                              type="button"
                              onClick={handleStartEdit}
                              className="text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 mt-1"
                            >
                              + Add repository link
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Docs / SRS Link */}
                      <div className="p-3 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 flex items-start gap-2.5">
                        <FileText className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Documentation / SRS</div>
                          {meta?.docsUrl ? (
                            <a
                              href={meta.docsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-900 dark:text-white hover:underline truncate max-w-full mt-1"
                            >
                              <span className="truncate">Open Docs / Drive</span>
                              <ExternalLink className="w-3 h-3 shrink-0" />
                            </a>
                          ) : (
                            <button
                              type="button"
                              onClick={handleStartEdit}
                              className="text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 mt-1"
                            >
                              + Add SRS / Drive link
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Prototype / Demo Link */}
                      <div className="p-3 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 flex items-start gap-2.5">
                        <Globe className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Demo / Figma</div>
                          {meta?.demoUrl ? (
                            <a
                              href={meta.demoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-900 dark:text-white hover:underline truncate max-w-full mt-1"
                            >
                              <span className="truncate">Open Prototype</span>
                              <ExternalLink className="w-3 h-3 shrink-0" />
                            </a>
                          ) : (
                            <button
                              type="button"
                              onClick={handleStartEdit}
                              className="text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 mt-1"
                            >
                              + Add demo / Figma
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </section>

              {/* Team Members & GitHub-Style Direct Collaborator Invite Card */}
              <section className="rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900/60 p-6 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-2.5">
                    <Users className="w-5 h-5 text-slate-500 dark:text-zinc-400" />
                    <div>
                      <h2 className="text-base font-semibold text-slate-900 dark:text-white">Team Roster & Collaborators</h2>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">
                        {group.members.length} of 3 maximum members registered
                      </p>
                    </div>
                  </div>
                  {!isGroupLocked && group.members.length < 3 && (
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowInviteBox((v) => !v)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        {showInviteBox ? "Close Invite Search" : "Add Collaborator"}
                      </button>
                      <Link
                        href="/dashboard/discovery"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors"
                      >
                        <Search className="w-3.5 h-3.5" />
                        Browse Discovery
                      </Link>
                    </div>
                  )}
                </div>

                {/* GitHub-Style Direct Collaborator Search Panel */}
                {showInviteBox && !isGroupLocked && group.members.length < 3 && (
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xs font-semibold text-slate-900 dark:text-white">
                          Invite a Classmate by Name or Email
                        </h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Search same-semester students directly and send a group invitation. Once they accept, they join your team automatically.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div className="sm:col-span-2 relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search student by full name, email, or department..."
                          className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                        />
                      </div>
                      <input
                        type="text"
                        value={inviteNote}
                        onChange={(e) => setInviteNote(e.target.value)}
                        placeholder="Optional short note..."
                        maxLength={140}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                      />
                    </div>

                    {isSearching && (
                      <p className="text-xs text-slate-500 py-2">Searching students...</p>
                    )}

                    {!isSearching && searchQuery.trim().length >= 2 && searchResults.length === 0 && (
                      <p className="text-xs text-slate-500 py-2">
                        No matching same-semester students found.
                      </p>
                    )}

                    {searchResults.length > 0 && (
                      <div className="divide-y divide-slate-200/70 dark:divide-slate-800 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 max-h-60 overflow-y-auto">
                        {searchResults.map((candidate) => (
                          <div
                            key={candidate.id}
                            className="flex items-center justify-between gap-3 px-3.5 py-2.5"
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                                  {candidate.name}
                                </span>
                                <span className="text-[11px] text-slate-500 dark:text-slate-400">
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
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-[11px] font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors disabled:opacity-50"
                                >
                                  <UserPlus className="w-3 h-3" />
                                  Invite
                                </button>
                              ) : candidate.isPending ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/50">
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

                {/* Registered Members Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
                  {group.members.map((member) => (
                    <div
                      key={member.id}
                      className="p-4 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {member.profilePicture ? (
                          <img
                            src={member.profilePicture}
                            alt={member.name}
                            className="w-10 h-10 rounded-full object-cover shrink-0 ring-1 ring-slate-200 dark:ring-slate-700"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex items-center justify-center font-bold text-xs shrink-0">
                            {member.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                              {member.name}
                            </span>
                            {(member.id === currentUserId || (!!profile?.id && member.id === profile.id)) && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                                You
                              </span>
                            )}
                            {member.id === leaderId ? (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/50">
                                <Crown className="w-2.5 h-2.5" />
                                Leader
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                Member
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-zinc-400 truncate mt-0.5">
                            {member.department} • Sem {member.semester}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div title={member.showGroupOnProfile ? "Visible on public profile" : "Hidden from profile"}>
                          {member.showGroupOnProfile ? (
                            <Eye className="w-4 h-4 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200" />
                          ) : (
                            <EyeOff className="w-4 h-4 text-slate-400" />
                          )}
                        </div>

                        {!isGroupLocked && (
                          <>
                            {(member.id === currentUserId || (!!profile?.id && member.id === profile.id)) ? (
                              <button
                                type="button"
                                onClick={() => setShowLeaveModal(true)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 transition-colors border border-red-200/60 dark:border-red-900/40"
                                title="Leave this group"
                              >
                                <LogOut className="w-3 h-3" />
                                <span>Leave</span>
                              </button>
                            ) : isCurrentUserLeader ? (
                              <button
                                type="button"
                                onClick={() => setMemberToRemove(member)}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 dark:text-slate-400 dark:hover:red-400 dark:hover:bg-red-950/30 transition-colors border border-slate-200/60 dark:border-slate-700/60"
                                title="Remove member from group"
                              >
                                <UserMinus className="w-3 h-3" />
                                <span>Remove</span>
                              </button>
                            ) : null}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pending Outgoing Invitations */}
                {group.pendingInvites && group.pendingInvites.length > 0 && (
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Pending Outgoing Invitations ({group.pendingInvites.length})</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {group.pendingInvites.map((inv) => (
                        <div
                          key={inv.requestId}
                          className="flex items-center justify-between px-3 py-2 rounded-lg border border-slate-200/70 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/20 text-xs"
                        >
                          <div className="min-w-0">
                            <span className="font-semibold text-slate-900 dark:text-white truncate block">
                              {inv.name}
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400">
                              {inv.department} • Sem {inv.semester}
                            </span>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/50 shrink-0">
                            Awaiting Acceptance
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>

              {/* Preferences & Team Actions */}
              <section className="rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900/60 p-6 shadow-xs space-y-6">
                <div>
                  <h2 className="text-base font-semibold text-slate-900 dark:text-white">Settings & Group Actions</h2>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">Manage profile visibility and membership status</p>
                </div>

                {/* Profile Visibility Switch */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      Show FYP Team on Public Profile
                    </p>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      When enabled, classmates browsing Discovery can view your project title and registered partners.
                    </p>
                  </div>
                  <button
                    onClick={handleToggleVisibility}
                    disabled={updateVisibility.isPending}
                    className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 dark:focus:ring-white shrink-0 ${
                      showGroupOnProfile ? "bg-slate-900 dark:bg-white" : "bg-slate-300 dark:bg-slate-700"
                    } ${updateVisibility.isPending ? "opacity-50" : ""}`}
                  >
                    <span
                      className={`absolute top-0.5 w-5 h-5 rounded-full shadow-xs transition-transform ${
                        showGroupOnProfile
                          ? "translate-x-5.5 bg-white dark:bg-slate-900"
                          : "translate-x-0.5 bg-white dark:bg-slate-400"
                      }`}
                    />
                  </button>
                </div>

                {/* Lock & Leave Actions */}
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-t border-slate-100 dark:border-slate-800/80">
                  {!isGroupLocked ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setShowLeaveModal(true)}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 hover:bg-red-50 text-red-700 dark:border-red-900/50 dark:hover:bg-red-950/20 dark:text-red-400 text-xs font-semibold transition-colors"
                      >
                        <LogOut className="w-4 h-4 text-red-500" />
                        Leave FYP Group
                      </button>

                      <button
                        onClick={() => setShowLockModal(true)}
                        disabled={group.members.length < 2 || lockGroup.isPending}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
                      >
                        <Lock className="w-4 h-4" />
                        {lockGroup.isPending ? "Locking..." : "Finalize & Lock Roster"}
                      </button>
                    </>
                  ) : (
                    <div className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-600 dark:text-zinc-300">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>This FYP group is locked and finalized. Members cannot be removed without department approval.</span>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            </>
          ) : (
            /* State: No Group Yet — Initialize Project Workspace OR Direct Invite */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Option 1: Initialize Project Workspace Immediately */}
              <div className="rounded-2xl border border-slate-200/90 bg-white dark:border-slate-800 dark:bg-slate-900/60 p-6 sm:p-7 space-y-5 shadow-xs">
                <div className="w-11 h-11 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex items-center justify-center">
                  <FolderKanban className="w-5 h-5" />
                </div>

                <div className="space-y-1.5">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Initialize Your FYP Project Space
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                    Start your FYP workspace as Group Leader right now. Set your project title, add your GitHub repository, plan milestones, and invite up to 2 teammates.
                  </p>
                </div>

                <form onSubmit={handleInitializeGroup} className="space-y-3.5 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Proposed Project Title
                    </label>
                    <input
                      type="text"
                      value={initialProjectTitle}
                      onChange={(e) => setInitialProjectTitle(e.target.value)}
                      placeholder="e.g. Smart Grid Load Forecasting System"
                      maxLength={100}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Short Summary (Optional)
                    </label>
                    <textarea
                      value={initialProjectDesc}
                      onChange={(e) => setInitialProjectDesc(e.target.value)}
                      placeholder="Brief scope or domain focus..."
                      rows={2}
                      maxLength={300}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={createInitialGroup.isPending}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                    {createInitialGroup.isPending ? "Initializing..." : "Create Project Space"}
                  </button>
                </form>
              </div>

              {/* Option 2: Direct Collaborator Search & Invite */}
              <div className="rounded-2xl border border-slate-200/90 bg-white dark:border-slate-800 dark:bg-slate-900/60 p-6 sm:p-7 space-y-5 shadow-xs flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center justify-center">
                    <UserPlus className="w-5 h-5" />
                  </div>

                  <div className="space-y-1.5">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      Direct Teammate Invite
                    </h2>
                    <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                      Already know who you want to work with? Search classmates by name or email to send a direct partner invitation, or browse all profiles in Discovery.
                    </p>
                  </div>

                  <div className="space-y-2.5 pt-1">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search classmate by full name or email..."
                        className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white"
                      />
                    </div>

                    {isSearching && (
                      <p className="text-xs text-slate-500">Searching students...</p>
                    )}

                    {searchResults.length > 0 && (
                      <div className="divide-y divide-slate-200/70 dark:divide-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 max-h-48 overflow-y-auto">
                        {searchResults.map((candidate) => (
                          <div key={candidate.id} className="flex items-center justify-between gap-2 px-3 py-2">
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                                {candidate.name}
                              </p>
                              <p className="text-[11px] text-slate-500 truncate">
                                {candidate.department} • Sem {candidate.semester}
                              </p>
                            </div>
                            {candidate.canInvite ? (
                              <button
                                type="button"
                                onClick={() => handleInviteStudent(candidate.id)}
                                disabled={inviteCollaborator.isPending}
                                className="px-2.5 py-1 rounded-md bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-[11px] font-semibold shrink-0"
                              >
                                Invite
                              </button>
                            ) : (
                              <span className="text-[10px] font-medium text-slate-400 shrink-0">
                                {candidate.isPending ? "Pending Invite" : "Unavailable"}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                  <Link
                    href="/dashboard/discovery"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                  >
                    <Search className="w-3.5 h-3.5" />
                    Browse All Students in Discovery
                  </Link>
                  <button
                    type="button"
                    onClick={() => setActiveTab("workspace")}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  >
                    Preview Workspace →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Workspace Tab (Unlocked for all active groups!) */}
      {activeTab === "workspace" && (
        <div className="space-y-6">
          {isInGroup && group ? (
            <WorkspaceTab
              groupId={group.id}
              members={group.members.map((m) => ({
                id: m.id,
                name: m.name,
                profilePicture: m.profilePicture,
              }))}
              previewMode={false}
            />
          ) : (
            <WorkspaceTab
              previewMode={true}
              previewReason="You are viewing the FYP Workspace in preview mode. Initialize your project space or invite a partner in the Group & Project Hub tab to activate live tasks and milestones."
              previewAction={
                <button
                  onClick={() => setActiveTab("group")}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Initialize Project Space
                </button>
              }
            />
          )}
        </div>
      )}

      {/* Leave Group Confirmation Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-6 space-y-4 shadow-xl border border-slate-200/80 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Leave FYP Group?
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                You will be removed from this group and will no longer have access to its project data.
                You will be eligible to create or join another team on Discovery.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowLeaveModal(false)}
                disabled={leaveGroup.isPending}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmLeave}
                disabled={leaveGroup.isPending}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {leaveGroup.isPending ? "Leaving..." : "Yes, Leave Group"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Member Confirmation Modal (Leader Only) */}
      {memberToRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-6 space-y-4 shadow-xl border border-slate-200/80 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 flex items-center justify-center">
              <UserMinus className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Remove {memberToRemove.name}?
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                As group leader, removing this member will release them from the team and allow both you and them to find new partners.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setMemberToRemove(null)}
                disabled={removeMember.isPending}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {removeMember.isPending ? "Removing..." : "Remove Member"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lock Group Confirmation Modal */}
      {showLockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-6 space-y-4 shadow-xl border border-slate-200/80 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-zinc-200 flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Finalize & Lock FYP Group?
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                Locking your group finalizes your 2–3 member roster according to university policy so no new members can join or leave without department approval.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowLockModal(false)}
                disabled={lockGroup.isPending}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmLock}
                disabled={lockGroup.isPending}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors disabled:opacity-50 shadow-xs"
              >
                {lockGroup.isPending ? "Locking..." : "Confirm & Lock Group"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
