// hooks/group/useMyGroup.ts
/**
 * My Group Hook
 * -------------
 * React Query hook for fetching user's FYP group.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

interface GroupMember {
  id: string;
  name: string;
  department: string;
  semester: number;
  profilePicture: string | null;
  showGroupOnProfile: boolean;
}

interface MyGroup {
  id: string;
  projectName: string | null;
  description: string | null;
  isLocked: boolean;
  createdAt: string;
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

// 🆕 Update group project details
async function updateGroupProjectApi(payload: { projectName: string; description?: string }) {
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

// 🆕 Update visibility preference
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

export const groupKeys = {
  all: ["group"] as const,
  myGroup: () => [...groupKeys.all, "my-group"] as const,
};

export function useMyGroup() {
  const query = useQuery({
    queryKey: groupKeys.myGroup(),
    queryFn: fetchMyGroup,
    staleTime: 5 * 60 * 1000, // 5 minutes
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

// 🆕 Hook for updating group project details
export function useUpdateGroupProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateGroupProjectApi,
    onSuccess: () => {
      toast.success("Project details updated successfully");
      queryClient.invalidateQueries({ queryKey: groupKeys.myGroup() });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update project");
    },
  });
}

// 🆕 Hook for updating visibility preference
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
