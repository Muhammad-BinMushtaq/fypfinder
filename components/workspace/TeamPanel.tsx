"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
} from "./workspaceUi";

interface TeamPanelProps {
  group: MyGroup;
  meta?: GroupWorkspaceMeta;
  currentUserId?: string;
  profileId?: string;
  /** Increment to open the "Add member" panel from elsewhere on the page. */
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
    <div className="space-y-8">
      {/* Members */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            Members{" "}
            <span className="font-normal text-slate-500">
              {group.members.length} of 3
            </span>
          </h2>
          {canAdd && (
            <button
              type="button"
              onClick={() => setShowAdd((v) => !v)}
              aria-expanded={showAdd}
              className={showAdd ? btnSecondary : btnPrimary}
            >
              {showAdd ? "Close" : "Add member"}
            </button>
          )}
        </div>

        {showAdd && canAdd && (
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">
            <CollaboratorSearch autoFocus />
          </div>
        )}

        <ul className="divide-y divide-slate-100 dark:divide-slate-800 rounded-xl border border-slate-200 dark:border-slate-800">
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
                className="flex flex-col gap-2 p-3.5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-200">
                    {initials}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {member.name}
                      <span className="ml-2 font-normal text-slate-500 dark:text-slate-400">
                        {[self ? "You" : null, member.id === leaderId ? "Leader" : null]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {member.department} · Semester {member.semester}
                    </p>

                    {editingRoleId === member.id ? (
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <input
                          value={roleDraft}
                          onChange={(e) => setRoleDraft(e.target.value)}
                          placeholder="e.g. Backend and database"
                          aria-label="Responsibility"
                          maxLength={50}
                          className={`${inputCls} sm:w-60`}
                        />
                        <button
                          type="button"
                          onClick={() => saveRole(member.id)}
                          disabled={updateMeta.isPending}
                          className={btnPrimary}
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingRoleId(null)}
                          className={btnSecondary}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <p className="mt-0.5 text-sm text-slate-700 dark:text-slate-300">
                        {role ? (
                          <>
                            Responsible for: {role}
                            {canEditRole && (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingRoleId(member.id);
                                  setRoleDraft(role);
                                }}
                                className="ml-2 text-slate-500 underline underline-offset-2 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                              >
                                Edit
                              </button>
                            )}
                          </>
                        ) : (
                          canEditRole && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingRoleId(member.id);
                                setRoleDraft("");
                              }}
                              className="text-slate-500 underline underline-offset-2 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                            >
                              Set responsibility
                            </button>
                          )
                        )}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 sm:shrink-0 -ml-2.5 sm:ml-0 pl-12 sm:pl-0">
                  {!self && (
                    <button
                      type="button"
                      onClick={() => messageMember(member.id)}
                      disabled={messagingId === member.id}
                      className={btnGhost}
                    >
                      {messagingId === member.id ? "Opening..." : "Message"}
                    </button>
                  )}
                  {!self && !isLocked && isCurrentUserLeader && (
                    <button
                      type="button"
                      onClick={() => setMemberToRemove(member)}
                      className={btnDangerText}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Pending invitations */}
      {group.pendingInvites && group.pendingInvites.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            Pending invitations{" "}
            <span className="font-normal text-slate-500">
              {group.pendingInvites.length}
            </span>
          </h2>
          <ul className="divide-y divide-slate-100 dark:divide-slate-800 rounded-xl border border-slate-200 dark:border-slate-800">
            {group.pendingInvites.map((inv) => (
              <li
                key={inv.requestId}
                className="flex flex-col gap-1 p-3.5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {inv.name}
                  </p>
                  <p className="truncate text-sm text-slate-500 dark:text-slate-400">
                    {inv.email} · Waiting for a reply
                  </p>
                </div>
                <div className="flex items-center gap-1 -ml-2.5 sm:ml-0">
                  <button
                    type="button"
                    onClick={() => resendInvite.mutate(inv.requestId)}
                    disabled={resendInvite.isPending}
                    className={btnGhost}
                  >
                    Resend email
                  </button>
                  <button
                    type="button"
                    onClick={() => cancelInvite.mutate(inv.requestId)}
                    disabled={cancelInvite.isPending}
                    className={btnDangerText}
                  >
                    Withdraw
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Settings */}
      <section className="space-y-1">
        <h2 className="mb-2 text-base font-semibold text-slate-900 dark:text-white">
          Settings
        </h2>
        <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between gap-4 p-3.5">
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                Show my group on my public profile
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Shows your project title and teammates in Find Partners.
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
            <div className="flex flex-col gap-2 p-3.5 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  Lock the roster
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {group.members.length < 2
                    ? "Needs at least 2 members."
                    : "Finalizes your 2–3 member team."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowLock(true)}
                disabled={group.members.length < 2 || lockGroup.isPending}
                className={`${btnSecondary} self-start sm:self-auto`}
              >
                Lock roster
              </button>
            </div>
          )}

          {!isLocked && (
            <div className="flex flex-col gap-2 p-3.5 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {isSolo ? "Delete this workspace" : "Leave this group"}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {isSolo
                    ? "You are the only member, so the workspace and its tasks will be deleted."
                    : "Your tasks will become unassigned."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowLeave(true)}
                className={`${btnDangerText} self-start sm:self-auto`}
              >
                {isSolo ? "Delete workspace" : "Leave group"}
              </button>
            </div>
          )}
        </div>
      </section>

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
                className="inline-flex h-11 sm:h-10 items-center justify-center rounded-lg bg-red-600 px-4 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 cursor-pointer"
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
          <span />
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
                className="inline-flex h-11 sm:h-10 items-center justify-center rounded-lg bg-red-600 px-4 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 cursor-pointer"
              >
                {removeMember.isPending ? "Removing..." : "Remove"}
              </button>
            </>
          }
        >
          <span />
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
          <span />
        </Sheet>
      )}
    </div>
  );
}
