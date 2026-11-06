"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, MessageSquare } from "lucide-react";
import { toast } from "react-toastify";
import {
  useUpdateGroupVisibility,
  useLeaveGroup,
  useRemoveMember,
  useLockGroup,
  useResendCollaboratorInvite,
  useCancelCollaboratorInvite,
  type MyGroup,
} from "@/hooks/group/useMyGroup";
import {
  useUpdateWorkspaceMeta,
  type GroupWorkspaceMeta,
} from "@/services/workspace.service";
import { CollaboratorSearch } from "./CollaboratorSearch";
import {
  Sheet,
  btnPrimary,
  btnSecondary,
  btnGhost,
  btnDangerText,
  inputCls,
  cardSurface,
} from "./workspaceUi";

interface TeamPanelProps {
  group: MyGroup;
  meta?: GroupWorkspaceMeta;
  currentUserId?: string;
  profileId?: string;
  /** Increment to open the "Add member" modal from elsewhere on the page. */
  addMemberSignal?: number;
}

export function TeamPanel({
  group,
  meta,
  currentUserId,
  profileId,
  addMemberSignal = 0,
}: TeamPanelProps) {
  const router = useRouter();
  const updateVisibility = useUpdateGroupVisibility();
  const leaveGroup = useLeaveGroup();
  const removeMember = useRemoveMember();
  const lockGroup = useLockGroup();
  const resendInvite = useResendCollaboratorInvite();
  const cancelInvite = useCancelCollaboratorInvite();
  const updateMeta = useUpdateWorkspaceMeta(group.id);

  const [showAdd, setShowAdd] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [roleDraft, setRoleDraft] = useState("");
  const [messagingId, setMessagingId] = useState<string | null>(null);
  const [showLeave, setShowLeave] = useState(false);
  const [showLock, setShowLock] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<
    MyGroup["members"][number] | null
  >(null);

  useEffect(() => {
    if (addMemberSignal > 0) setShowAdd(true);
  }, [addMemberSignal]);

  const isLocked = group.isLocked;
  const memberRoles = meta?.memberRoles || {};

  const sorted = [...group.members].sort((a, b) => {
    if (!a.joinedAt || !b.joinedAt) return 0;
    return new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime();
  });
  const leaderId = sorted[0]?.id;

  const isSelfId = (id: string) =>
    id === currentUserId || (!!profileId && id === profileId);
  const isCurrentUserLeader = !!leaderId && isSelfId(leaderId);
  const currentMember = group.members.find((m) => isSelfId(m.id));
  const showGroupOnProfile = currentMember?.showGroupOnProfile ?? true;
  const canAdd = !isLocked && group.members.length < 3;
  const isSolo = group.members.length <= 1;

  const saveRole = (memberId: string) => {
    const next = { ...memberRoles };
    if (roleDraft.trim()) next[memberId] = roleDraft.trim();
    else delete next[memberId];

    updateMeta.mutate(
      { memberRoles: next },
      {
        onSuccess: () => {
          setEditingRoleId(null);
          toast.success("Responsibility updated");
        },
        onError: (err: any) =>
          toast.error(err?.message || "Failed to update responsibility"),
      }
    );
  };

  const messageMember = async (targetStudentId: string) => {
    try {
      setMessagingId(targetStudentId);
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
      setMessagingId(null);
    }
  };

  const confirmLeave = () => {
    const targetId = currentMember?.id || currentUserId || profileId || "self";
    leaveGroup.mutate(targetId, { onSuccess: () => setShowLeave(false) });
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Members Card */}
      <section className={`${cardSurface} p-4 sm:p-5 space-y-4`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Team members
            </h2>
            <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-600 dark:text-slate-300">
              {group.members.length}/3
            </span>
          </div>
          {canAdd && (
            <button
              type="button"
              onClick={() => setShowAdd(true)}
              className={`${btnPrimary} !h-9 !px-3 text-xs sm:text-sm`}
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>Add member</span>
            </button>
          )}
        </div>

        <ul className="divide-y divide-slate-100 dark:divide-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
          {group.members.map((member) => {
            const self = isSelfId(member.id);
            const role = memberRoles[member.id] || "";
            const canEditRole = self || isCurrentUserLeader;
            const initials = member.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();

            return (
              <li
                key={member.id}
                className="flex flex-col gap-3 p-3.5 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200">
                    {initials}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {member.name}
                      </p>
                      {(self || member.id === leaderId) && (
                        <span className="inline-flex items-center rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:text-slate-300">
                          {[
                            self ? "You" : null,
                            member.id === leaderId ? "Leader" : null,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                      )}
                    </div>

                    <p className="mt-0.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                      {member.department} · Semester {member.semester}
                    </p>

                    {editingRoleId === member.id ? (
                      <div className="mt-2.5 flex flex-col gap-2 sm:flex-row sm:items-center">
                        <input
                          value={roleDraft}
                          onChange={(e) => setRoleDraft(e.target.value)}
                          placeholder="e.g. Backend & Database"
                          aria-label="Responsibility"
                          maxLength={50}
                          className={`${inputCls} sm:max-w-xs`}
                        />
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => saveRole(member.id)}
                            disabled={updateMeta.isPending}
                            className={`${btnPrimary} !h-9 !px-3.5 text-xs`}
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingRoleId(null)}
                            className={`${btnSecondary} !h-9 !px-3 text-xs`}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-1 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                        {role ? (
                          <span>
                            Role: <strong className="font-medium">{role}</strong>
                            {canEditRole && (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingRoleId(member.id);
                                  setRoleDraft(role);
                                }}
                                className="ml-2 text-xs text-slate-500 underline underline-offset-2 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                              >
                                Edit
                              </button>
                            )}
                          </span>
                        ) : (
                          canEditRole && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingRoleId(member.id);
                                setRoleDraft("");
                              }}
                              className="text-xs text-slate-500 underline underline-offset-2 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                            >
                              + Set responsibility
                            </button>
                          )
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {(!self || (!isLocked && isCurrentUserLeader && !self)) && (
                  <div className="flex items-center gap-1.5 pl-12 sm:pl-0 sm:shrink-0">
                    {!self && (
                      <button
                        type="button"
                        onClick={() => messageMember(member.id)}
                        disabled={messagingId === member.id}
                        className={`${btnSecondary} !h-8 !px-2.5 text-xs`}
                      >
                        <MessageSquare className="h-3.5 w-3.5 text-slate-400" />
                        <span>
                          {messagingId === member.id ? "Opening..." : "Message"}
                        </span>
                      </button>
                    )}
                    {!self && !isLocked && isCurrentUserLeader && (
                      <button
                        type="button"
                        onClick={() => setMemberToRemove(member)}
                        className={`${btnDangerText} !h-8 !px-2.5 text-xs`}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {/* Pending Invitations Card */}
      {group.pendingInvites && group.pendingInvites.length > 0 && (
        <section className={`${cardSurface} p-4 sm:p-5 space-y-3`}>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Pending invitations
            </h2>
            <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-600 dark:text-slate-300">
              {group.pendingInvites.length}
            </span>
          </div>

          <ul className="divide-y divide-slate-100 dark:divide-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
            {group.pendingInvites.map((inv) => (
              <li
                key={inv.requestId}
                className="flex flex-col gap-2 p-3.5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {inv.name}
                  </p>
                  <p className="truncate text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    {inv.email} · Waiting for reply
                  </p>
                </div>
                <div className="flex items-center gap-1.5 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => resendInvite.mutate(inv.requestId)}
                    disabled={resendInvite.isPending}
                    className={`${btnSecondary} !h-8 !px-2.5 text-xs`}
                  >
                    Resend email
                  </button>
                  <button
                    type="button"
                    onClick={() => cancelInvite.mutate(inv.requestId)}
                    disabled={cancelInvite.isPending}
                    className={`${btnDangerText} !h-8 !px-2.5 text-xs`}
                  >
                    Withdraw
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Settings Card */}
      <section className={`${cardSurface} p-4 sm:p-5 space-y-3`}>
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          Group settings
        </h2>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
          <div className="flex items-center justify-between gap-4 p-3.5">
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                Show group on my public profile
              </p>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Displays your project title and teammates in Find Partners.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={showGroupOnProfile}
              aria-label="Show my group on my public profile"
              onClick={() => updateVisibility.mutate(!showGroupOnProfile)}
              disabled={updateVisibility.isPending}
              className={`relative h-7 w-12 shrink-0 rounded-full transition-colors cursor-pointer ${
                showGroupOnProfile
                  ? "bg-slate-900 dark:bg-white"
                  : "bg-slate-300 dark:bg-slate-700"
              }`}
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white dark:bg-slate-900 transition-transform ${
                  showGroupOnProfile ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {!isLocked && (
            <div className="flex flex-col gap-2.5 p-3.5 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  Lock the team roster
                </p>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  {group.members.length < 2
                    ? "Requires at least 2 team members."
                    : "Finalizes your 2–3 member team."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowLock(true)}
                disabled={group.members.length < 2 || lockGroup.isPending}
                className={`${btnSecondary} self-start sm:self-auto !h-9 text-xs sm:text-sm`}
              >
                Lock roster
              </button>
            </div>
          )}

          {!isLocked && (
            <div className="flex flex-col gap-2.5 p-3.5 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {isSolo ? "Delete this workspace" : "Leave this group"}
                </p>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  {isSolo
                    ? "You are the only member, so this workspace and its tasks will be deleted."
                    : "Your assigned tasks will become unassigned."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowLeave(true)}
                className={`${btnDangerText} self-start sm:self-auto -ml-2.5 sm:ml-0`}
              >
                {isSolo ? "Delete workspace" : "Leave group"}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Invite Member Sheet */}
      {showAdd && canAdd && (
        <Sheet
          title="Invite a team member"
          description="Search classmates from your semester. They will receive an email invitation."
          onClose={() => setShowAdd(false)}
          footer={
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className={btnSecondary}
            >
              Done
            </button>
          }
        >
          <CollaboratorSearch />
        </Sheet>
      )}

      {showLeave && (
        <Sheet
          title={isSolo ? "Delete solo workspace?" : "Leave this group?"}
          description={
            isSolo
              ? "You are the only member. Leaving permanently deletes this workspace and its tasks."
              : "You will be removed from the group and your tasks become unassigned. You can join or create another team anytime."
          }
          onClose={() => setShowLeave(false)}
          footer={
            <>
              <button
                type="button"
                onClick={() => setShowLeave(false)}
                disabled={leaveGroup.isPending}
                className={btnSecondary}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmLeave}
                disabled={leaveGroup.isPending}
                className="inline-flex h-10 items-center justify-center rounded-xl bg-red-600 px-4 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 cursor-pointer"
              >
                {leaveGroup.isPending
                  ? "Working..."
                  : isSolo
                  ? "Delete workspace"
                  : "Leave group"}
              </button>
            </>
          }
        >
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Please confirm that you want to proceed.
          </p>
        </Sheet>
      )}

      {memberToRemove && (
        <Sheet
          title={`Remove ${memberToRemove.name}?`}
          description="They will leave the team and their tasks become unassigned so you can reassign them."
          onClose={() => setMemberToRemove(null)}
          footer={
            <>
              <button
                type="button"
                onClick={() => setMemberToRemove(null)}
                disabled={removeMember.isPending}
                className={btnSecondary}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() =>
                  removeMember.mutate(memberToRemove.id, {
                    onSuccess: () => setMemberToRemove(null),
                  })
                }
                disabled={removeMember.isPending}
                className="inline-flex h-10 items-center justify-center rounded-xl bg-red-600 px-4 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 cursor-pointer"
              >
                {removeMember.isPending ? "Removing..." : "Remove"}
              </button>
            </>
          }
        >
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            {memberToRemove.name} will be notified that they have been removed from the team.
          </p>
        </Sheet>
      )}

      {showLock && (
        <Sheet
          title="Lock the roster?"
          description="Locking finalizes your team. Members cannot leave afterwards without department approval."
          onClose={() => setShowLock(false)}
          footer={
            <>
              <button
                type="button"
                onClick={() => setShowLock(false)}
                disabled={lockGroup.isPending}
                className={btnSecondary}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() =>
                  lockGroup.mutate(undefined, {
                    onSuccess: () => setShowLock(false),
                  })
                }
                disabled={lockGroup.isPending}
                className={btnPrimary}
              >
                {lockGroup.isPending ? "Locking..." : "Lock roster"}
              </button>
            </>
          }
        >
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Make sure all teammates have joined before locking the roster.
          </p>
        </Sheet>
      )}
    </div>
  );
}
