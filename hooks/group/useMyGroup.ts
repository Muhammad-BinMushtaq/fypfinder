// hooks/group/useMyGroup.ts
/**
 * My Group Hook
 * -------------
 * React Query hook for fetching user's FYP group.
 */

import { useQuery } from "@tanstack/react-query";

interface GroupMember {
  id: string;
  name: string;
  department: string;
  semester: number;
  profilePicture: string | null;
}

interface MyGroup {
  id: string;
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
  };
}
