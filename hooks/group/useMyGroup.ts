// hooks/group/useMyGroup.ts
/**
 * My Group Hook
 * -------------
 * React Query hooks for fetching & managing user's FYP group, workspace links,
 * and GitHub-style collaborator invitations.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import type { GroupWorkspaceMeta } from "@/services/workspace.service";

export interface GroupMember {
  id: string;
  name: string;
  department: string;
  semester: number;
  profilePicture: string | null;
  showGroupOnProfile: boolean;
  joinedAt?: string;
}

export interface PendingGroupInvite {
  requestId: string;
  toStudentId: string;
  name: string;
  email: string;
  department: string;
  semester: number;
  profilePicture: string | null;
  invitedByName: string;
  createdAt: string;
}

export interface InviteSearchCandidate {
  id: string;
  name: string;
  email: string;
  department: string;
  semester: number;
  profilePicture: string | null;
  memberCount: number;
  isPending: boolean;
  isFull: boolean;
  canInvite: boolean;
}

export interface MyGroup {
  id: string;
  projectName: string | null;
  description: string | null;
  isLocked: boolean;
  createdAt: string;
  currentStudentId?: string;
  workspaceMeta?: GroupWorkspaceMeta;
  pendingInvites?: PendingGroupInvite[];
  members: GroupMember[];
}

async function fetchMyGroup(): Promise<MyGroup | null> {
  const res = await fetch("/api/group/get-my-group");
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to fetch group");
  }

  return data.data;
}

async function updateGroupProjectApi(payload: {
  projectName: string;
  description?: string;
}) {
  const res = await fetch("/api/group/update-project", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to update project");
  }

  return data.data;
}

async function updateGroupVisibilityApi(showGroupOnProfile: boolean) {
  const res = await fetch("/api/group/update-visibility", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ showGroupOnProfile }),
  });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to update visibility");
  }

  return data.data;
}

async function removeGroupMemberApi(targetStudentId: string) {
  const res = await fetch("/api/group/remove-member", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ targetStudentId }),
  });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to leave group");
  }

  return data.data;
}

async function lockGroupApi() {
  const res = await fetch("/api/group/lock", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to lock group");
  }

  return data.data;
}

export async function searchCollaboratorsApi(
  query: string
): Promise<InviteSearchCandidate[]> {
  const res = await fetch(
    `/api/group/invite-search?q=${encodeURIComponent(query)}`
  );
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || "Failed to search students");
  }
  return data.data || [];
}

export const groupKeys = {
  all: ["group"] as const,
  myGroup: () => [...groupKeys.all, "my-group"] as const,
};

export function useMyGroup() {
  const query = useQuery({
    queryKey: groupKeys.myGroup(),
    queryFn: fetchMyGroup,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  return {
    group: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    isInGroup: !!query.data,
    isGroupLocked: query.data?.isLocked ?? false,
    refetch: query.refetch,
  };
}

export function useUpdateGroupProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateGroupProjectApi,
    onSuccess: () => {
      toast.success("Project details updated");
      queryClient.invalidateQueries({ queryKey: groupKeys.myGroup() });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update project");
    },
  });
}

export function useUpdateGroupVisibility() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateGroupVisibilityApi,
    onSuccess: (_, showGroupOnProfile) => {
      toast.success(
        showGroupOnProfile
          ? "Group is now visible on your public profile"
          : "Group is now hidden from your public profile"
      );
      queryClient.invalidateQueries({ queryKey: groupKeys.myGroup() });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update visibility");
    },
  });
}

export function useLeaveGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (targetStudentId: string) =>
      removeGroupMemberApi(targetStudentId),
    onSuccess: () => {
      toast.success("You have left the FYP group");
      queryClient.invalidateQueries({ queryKey: groupKeys.myGroup() });
      queryClient.invalidateQueries({ queryKey: ["student"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to leave group");
    },
  });
}

export function useRemoveMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (targetStudentId: string) =>
      removeGroupMemberApi(targetStudentId),
    onSuccess: () => {
      toast.success("Member removed from FYP group");
      queryClient.invalidateQueries({ queryKey: groupKeys.myGroup() });
      queryClient.invalidateQueries({ queryKey: ["student"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to remove member");
    },
  });
}

export function useLockGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: lockGroupApi,
    onSuccess: () => {
      toast.success("FYP group locked and finalized");
      queryClient.invalidateQueries({ queryKey: groupKeys.myGroup() });
      queryClient.invalidateQueries({ queryKey: ["student"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to lock group");
    },
  });
}

export function useCreateInitialGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      projectName: string;
      description?: string;
    }) => {
      const res = await fetch("/api/group/invite-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CREATE_GROUP",
          projectName: payload.projectName,
          description: payload.description,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to initialize project");
      }
      return data.data;
    },
    onSuccess: () => {
      toast.success("FYP project workspace initialized");
      queryClient.invalidateQueries({ queryKey: groupKeys.myGroup() });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to initialize project");
    },
  });
}

export function useInviteCollaborator() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { toStudentId: string; reason?: string }) => {
      const res = await fetch("/api/group/invite-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "INVITE",
          toStudentId: payload.toStudentId,
          reason: payload.reason,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to send invite");
      }
      return data.data;
    },
    onSuccess: () => {
      toast.success("Partner invitation sent");
      queryClient.invalidateQueries({ queryKey: groupKeys.myGroup() });
      queryClient.invalidateQueries({ queryKey: ["requests"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to send invite");
    },
  });
}
