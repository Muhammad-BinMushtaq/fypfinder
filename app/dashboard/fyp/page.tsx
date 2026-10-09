// app/dashboard/fyp/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { WorkspaceTab } from "@/components/workspace/WorkspaceTab";
import { 
  useMyGroup, 
  useUpdateGroupProject, 
  useUpdateGroupVisibility,
  useLeaveGroup,
  useLockGroup
} from "@/hooks/group/useMyGroup";
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
  ArrowRight,
  Sparkles,
  Search,
  CheckCircle2,
  FileCheck2
} from "lucide-react";

export default function FYPManagementPage() {
  const { group, isLoading, isInGroup, isGroupLocked } = useMyGroup();
  const { profile } = useMyProfile();
  const updateProject = useUpdateGroupProject();
  const updateVisibility = useUpdateGroupVisibility();
  const leaveGroup = useLeaveGroup();
  const lockGroup = useLockGroup();

  // Tab & edit state
  const [activeTab, setActiveTab] = useState<"group" | "workspace">("group");
  const [isEditing, setIsEditing] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");

  // Modals state
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showLockModal, setShowLockModal] = useState(false);

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
  const currentMember = group?.members.find((m) => m.id === profile?.id);
  const showGroupOnProfile = currentMember?.showGroupOnProfile ?? true;

  // Edit actions
  const handleStartEdit = () => {
    if (!group) return;
    setProjectName(group.projectName || "");
    setDescription(group.description || "");
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setProjectName("");
    setDescription("");
  };

  const handleSaveProject = () => {
    if (!projectName.trim()) return;
    updateProject.mutate(
      { projectName: projectName.trim(), description: description.trim() || undefined },
      { onSuccess: () => setIsEditing(false) }
    );
  };

  const handleToggleVisibility = () => {
    updateVisibility.mutate(!showGroupOnProfile);
  };

  const handleConfirmLeave = () => {
    if (!profile?.id) return;
    leaveGroup.mutate(profile.id, {
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
                Manage your group, track academic milestones, and organize project tasks.
              </p>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className="self-start sm:self-center">
          {isInGroup && group ? (
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                isGroupLocked
                  ? "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                  : "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/50"
              }`}
            >
              {isGroupLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
              {isGroupLocked ? "Group Finalized & Locked" : `Open Team (${group.members.length}/3)`}
            </span>
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
          Group Details
        </button>
        <button
          onClick={() => setActiveTab("workspace")}
          className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg py-2 px-3 text-xs sm:text-sm font-semibold transition-all ${
            activeTab === "workspace"
              ? "bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white"
              : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          <span>Workspace</span>
          {(!isInGroup || !isGroupLocked) && (
            <span className="px-1.5 py-0.2 rounded text-[10px] uppercase font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
              Preview
            </span>
          )}
        </button>
      </div>

      {/* Tab 1: Group Details */}
      {activeTab === "group" && (
        <div className="space-y-6">
          {isInGroup && group ? (
            <>
              {/* Project Overview Card */}
              <section className="rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900/60 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-2.5">
                    <FileCheck2 className="w-5 h-5 text-slate-500 dark:text-zinc-400" />
                    <div>
                      <h2 className="text-base font-semibold text-slate-900 dark:text-white">Project Details</h2>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">Proposal title and description for your FYP committee</p>
                    </div>
                  </div>
                  {!isEditing && (
                    <button
                      onClick={handleStartEdit}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Edit
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-4 pt-1">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Project Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        placeholder="e.g. AI-Powered Autonomous Campus Navigation"
                        maxLength={100}
                        className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:border-transparent transition-all"
                      />
                      <p className="mt-1 text-right text-[11px] text-slate-400">{projectName.length}/100</p>
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
                        className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:border-transparent transition-all resize-none"
                      />
                      <p className="mt-1 text-right text-[11px] text-slate-400">{description.length}/500</p>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={handleSaveProject}
                        disabled={!projectName.trim() || updateProject.isPending}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors disabled:opacity-50"
                      >
                        <Save className="w-3.5 h-3.5" />
                        {updateProject.isPending ? "Saving..." : "Save Details"}
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
                  <div className="space-y-2 pt-1">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {group.projectName || "Unnamed FYP Project"}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                      {group.description || "No project description provided yet. Click Edit to add a project overview for your team."}
                    </p>
                  </div>
                )}
              </section>

              {/* Team Members Card */}
              <section className="rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900/60 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-2.5">
                    <Users className="w-5 h-5 text-slate-500 dark:text-zinc-400" />
                    <div>
                      <h2 className="text-base font-semibold text-slate-900 dark:text-white">Team Members</h2>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">
                        {group.members.length} of 3 maximum members registered
                      </p>
                    </div>
                  </div>
                  {!isGroupLocked && (
                    <Link
                      href="/dashboard/discovery"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      <Search className="w-3.5 h-3.5" />
                      Invite Partner
                    </Link>
                  )}
                </div>

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
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                              {member.name}
                            </span>
                            {member.id === profile?.id && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                                You
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">
                            {member.department} • Sem {member.semester}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0" title={member.showGroupOnProfile ? "Visible on public profile" : "Hidden from profile"}>
                        {member.showGroupOnProfile ? (
                          <Eye className="w-4 h-4 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
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
                      {/* Leave Group Button */}
                      <button
                        onClick={() => setShowLeaveModal(true)}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 hover:bg-red-50 text-red-700 dark:border-red-900/50 dark:hover:bg-red-950/20 dark:text-red-400 text-xs font-semibold transition-colors"
                      >
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        Leave FYP Group
                      </button>

                      {/* Lock Group Button */}
                      <button
                        onClick={() => setShowLockModal(true)}
                        disabled={group.members.length < 2 || lockGroup.isPending}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
                      >
                        <Lock className="w-4 h-4" />
                        {lockGroup.isPending ? "Locking..." : "Finalize & Lock Team"}
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
            /* State: No Group Yet */
            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-200/90 bg-white dark:border-slate-800 dark:bg-slate-900/60 p-8 sm:p-12 text-center space-y-6 shadow-xs">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-zinc-300">
                  <Users className="w-8 h-8" />
                </div>

                <div className="max-w-xl mx-auto space-y-2">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    You haven’t formed an FYP group yet
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                    Undergraduate and graduate Final Year Projects at PAF-IAST are completed in teams of 2 to 3 students. 
                    Discover peers with complementary skills, send requests, and formalize your team.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <Link
                    href="/dashboard/discovery"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs sm:text-sm font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-xs"
                  >
                    <Search className="w-4 h-4" />
                    <span>Find Partners on Discovery</span>
                  </Link>

                  <button
                    onClick={() => setActiveTab("workspace")}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-semibold transition-colors"
                  >
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Explore Workspace Preview</span>
                  </button>
                </div>
              </div>

              {/* How Groups Work Step Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900/40 space-y-2 shadow-2xs">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-zinc-200 flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Discover Peers</h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                    Filter students by programming languages, hardware experience, and target FYP industry.
                  </p>
                </div>

                <div className="p-5 rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900/40 space-y-2 shadow-2xs">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-zinc-200 flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Send Partner Requests</h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                    Chat in real-time, align on project scopes, and send formal partner invitations.
                  </p>
                </div>

                <div className="p-5 rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900/40 space-y-2 shadow-2xs">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-zinc-200 flex items-center justify-center font-bold text-xs">
                    3
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Lock & Collaborate</h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                    Once 2 or 3 members join, lock your group to unlock the full collaborative Workspace task board.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Workspace Tab */}
      {activeTab === "workspace" && (
        <div className="space-y-6">
          {isInGroup && isGroupLocked && group ? (
            /* Live Workspace */
            <WorkspaceTab
              groupId={group.id}
              members={group.members.map((m) => ({
                id: m.id,
                name: m.name,
                profilePicture: m.profilePicture,
              }))}
              previewMode={false}
            />
          ) : isInGroup && !isGroupLocked && group ? (
            /* In-group but Unlocked Preview */
            <WorkspaceTab
              groupId={group.id}
              members={group.members.map((m) => ({
                id: m.id,
                name: m.name,
                profilePicture: m.profilePicture,
              }))}
              previewMode={true}
              previewReason={`Your FYP group has ${group.members.length} member(s). Lock your team (requires 2 or 3 members) to activate live collaborative task assignments.`}
              previewAction={
                group.members.length >= 2 ? (
                  <button
                    onClick={() => {
                      setActiveTab("group");
                      setShowLockModal(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-xs"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    Lock Team Now
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveTab("group")}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors"
                  >
                    View Group Details
                  </button>
                )
              }
            />
          ) : (
            /* No Group Preview */
            <WorkspaceTab
              previewMode={true}
              previewReason="You are viewing the FYP Workspace in interactive preview mode. Form an FYP team with classmates to assign live tasks and manage your sprint milestones."
              previewAction={
                <Link
                  href="/dashboard/discovery"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-xs"
                >
                  <Search className="w-3.5 h-3.5" />
                  Find Partners
                </Link>
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
                Locking your group finalizes your 2–3 member roster according to university policy and permanently enables the live collaborative FYP workspace.
              </p>
              <p className="text-[11px] text-amber-600 dark:text-amber-400 pt-1">
                Notice: Once locked, group members cannot leave without supervisor or admin assistance.
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
