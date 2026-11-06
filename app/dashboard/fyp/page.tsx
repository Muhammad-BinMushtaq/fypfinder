// app/dashboard/fyp/page.tsx
"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { KanbanBoard } from "@/components/workspace/KanbanBoard";
import {
  DeadlineTimeline,
  PREVIEW_MILESTONES,
} from "@/components/workspace/DeadlineTimeline";
import { StageSummary } from "@/components/workspace/StageSummary";
import { ProjectHeader } from "@/components/workspace/ProjectHeader";
import { EditProjectModal } from "@/components/workspace/EditProjectModal";
import { SupervisorLog } from "@/components/workspace/SupervisorLog";
import { TeamPanel } from "@/components/workspace/TeamPanel";
import { CollaboratorSearch } from "@/components/workspace/CollaboratorSearch";
import {
  Sheet,
  btnPrimary,
  inputCls,
  textareaCls,
  labelCls,
} from "@/components/workspace/workspaceUi";
import { useMyGroup, useCreateInitialGroup } from "@/hooks/group/useMyGroup";
import { useWorkspaceMeta, useUpdateWorkspaceMeta } from "@/services/workspace.service";
import { useMyProfile } from "@/hooks/student/useMyProfile";

type TabId = "workspace" | "supervisor" | "team";

const TABS: Array<{ id: TabId; label: string }> = [
  { id: "workspace", label: "Workspace" },
  { id: "supervisor", label: "Supervisor" },
  { id: "team", label: "Team" },
];

export default function FYPManagementPage() {
  const { group, isLoading, isInGroup, isGroupLocked } = useMyGroup();
  const { profile } = useMyProfile();
  const createInitialGroup = useCreateInitialGroup();

  const { data: workspaceMeta } = useWorkspaceMeta(
    group?.id || "",
    isInGroup,
    group?.workspaceMeta
  );
  const updateWorkspaceMeta = useUpdateWorkspaceMeta(group?.id || "");

  const [activeTab, setActiveTab] = useState<TabId>("workspace");
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string>("ALL");
  const [showEditProject, setShowEditProject] = useState(false);
  const [showStages, setShowStages] = useState(false);
  const [addMemberSignal, setAddMemberSignal] = useState(0);

  // Supervisor action item to task bridge
  const [externalTaskPrefill, setExternalTaskPrefill] = useState<{
    title: string;
    description?: string;
    onCreated?: (taskId: string) => void;
  } | null>(null);

  // Initial workspace setup (students without a group yet)
  const [initialProjectTitle, setInitialProjectTitle] = useState("");
  const [initialProjectDesc, setInitialProjectDesc] = useState("");

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-2.5">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-900 dark:border-white border-t-transparent" />
          <p className="text-sm text-slate-500 dark:text-zinc-400">
            Loading workspace...
          </p>
        </div>
      </div>
    );
  }

  const meta = workspaceMeta || group?.workspaceMeta;
  const milestones = meta?.milestones || PREVIEW_MILESTONES;
  const currentUserId = group?.currentStudentId || profile?.id;
  const currentMember = group?.members.find(
    (m) => m.id === currentUserId || (profile && m.id === profile.id)
  );

  const handleInitializeGroup = (e: React.FormEvent) => {
    e.preventDefault();
    createInitialGroup.mutate({
      projectName: initialProjectTitle.trim() || "New FYP Project",
      description: initialProjectDesc.trim() || undefined,
    });
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
      description: `Action item from the supervisor meeting on ${new Date(
        action.meetingDate
      ).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}.`,
      onCreated: (createdTaskId: string) => {
        const meetings = meta?.supervisorMeetings || [];
        updateWorkspaceMeta.mutate({
          supervisorMeetings: meetings.map((m) =>
            m.id !== action.meetingId
              ? m
              : {
                  ...m,
                  actionItems: m.actionItems.map((a) =>
                    a.id === action.actionId
                      ? { ...a, linkedTaskId: createdTaskId }
                      : a
                  ),
                }
          ),
        });
      },
    });
  };

  const openAddMember = () => {
    setActiveTab("team");
    setAddMemberSignal((n) => n + 1);
  };

  // ---------------------------------------------------------------------
  // No group yet: create a workspace, or invite someone first
  // ---------------------------------------------------------------------
  if (!isInGroup || !group) {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6 space-y-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
            FYP workspace
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
            Start your project workspace as group leader, then invite up to two teammates
            whenever you are ready.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <section className="space-y-4">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Create your workspace
            </h2>
            <form onSubmit={handleInitializeGroup} className="space-y-4">
              <div>
                <label className={labelCls} htmlFor="init-title">
                  Project title
                </label>
                <input
                  id="init-title"
                  value={initialProjectTitle}
                  onChange={(e) => setInitialProjectTitle(e.target.value)}
                  placeholder="e.g. Autonomous Drone Delivery System"
                  maxLength={100}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls} htmlFor="init-desc">
                  Short summary (optional)
                </label>
                <textarea
                  id="init-desc"
                  value={initialProjectDesc}
                  onChange={(e) => setInitialProjectDesc(e.target.value)}
                  placeholder="What is your project about?"
                  rows={3}
                  maxLength={300}
                  className={textareaCls}
                />
              </div>
              <button
                type="submit"
                disabled={createInitialGroup.isPending}
                className={btnPrimary}
              >
                {createInitialGroup.isPending ? "Creating..." : "Create workspace"}
              </button>
            </form>
          </section>

          <section className="space-y-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Or invite a teammate
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
                Search students from your semester. They receive an email invitation.
              </p>
            </div>
            <CollaboratorSearch />
          </section>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------
  // Active workspace
  // ---------------------------------------------------------------------
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-5 sm:py-6 space-y-6">
      <ProjectHeader
        group={group}
        meta={meta}
        isLocked={isGroupLocked}
        onEdit={() => setShowEditProject(true)}
        onAddMember={openAddMember}
        onOpenSupervisor={() => setActiveTab("supervisor")}
      />

      {/* Navigation: three plain tabs, equal width on mobile */}
      <nav
        aria-label="Workspace sections"
        className="grid grid-cols-3 sm:flex sm:gap-8 border-b border-slate-200 dark:border-slate-800"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            aria-current={activeTab === tab.id ? "page" : undefined}
            className={`h-11 border-b-2 text-sm font-medium transition-colors cursor-pointer ${
              activeTab === tab.id
                ? "border-slate-900 text-slate-900 dark:border-white dark:text-white"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {activeTab === "workspace" && (
        <div className="space-y-8">
          <StageSummary
            groupId={group.id}
            milestones={milestones}
            onOpenStages={() => setShowStages(true)}
          />

          <KanbanBoard
            groupId={group.id}
            members={group.members.map((m) => ({
              id: m.id,
              name: m.name,
              profilePicture: m.profilePicture,
            }))}
            currentStudentId={currentMember?.id || currentUserId}
            milestones={milestones}
            selectedMilestoneId={selectedMilestoneId}
            onSelectMilestone={setSelectedMilestoneId}
            externalTaskPrefill={externalTaskPrefill}
            onClearExternalPrefill={() => setExternalTaskPrefill(null)}
          />
        </div>
      )}

      {activeTab === "supervisor" && (
        <SupervisorLog
          groupId={group.id}
          meta={meta}
          currentUserName={currentMember?.name || profile?.name}
          onConvertActionToTask={handleConvertSupervisorActionToTask}
        />
      )}

      {activeTab === "team" && (
        <TeamPanel
          group={group}
          meta={meta}
          currentUserId={currentUserId}
          profileId={profile?.id}
          addMemberSignal={addMemberSignal}
        />
      )}

      {showEditProject && (
        <EditProjectModal
          group={group}
          meta={meta}
          onClose={() => setShowEditProject(false)}
        />
      )}

      {showStages && (
        <Sheet
          title="Academic stages"
          description="Update dates and progress, or show only the tasks for one stage."
          onClose={() => setShowStages(false)}
          wide
        >
          <DeadlineTimeline
            groupId={group.id}
            initialMeta={meta}
            selectedMilestoneId={selectedMilestoneId}
            onSelectMilestone={(id) => {
              setSelectedMilestoneId(id);
              if (id !== "ALL") toast.info("Showing tasks for the selected stage");
            }}
            onDone={() => setShowStages(false)}
          />
        </Sheet>
      )}
    </div>
  );
}
