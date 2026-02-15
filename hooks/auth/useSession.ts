// hooks/auth/useSession.ts

/**
 * useSession
 * ----------------
 * Fetches the current authenticated session from the backend.
 * Uses React Query for caching and global consistency.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { apiClient } from "@/services/apiClient";

export type UserRole = "STUDENT" | "ADMIN";
export type UserStatus = "ACTIVE" | "SUSPENDED";

export interface SessionUser {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
}

// Backend returns: { success: boolean, data: { user: SessionUser } }
interface SessionResponse {
  success: boolean;
  message: string;
  data: {
    user: SessionUser;
  } | null;
}

export function useSession() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const query = useQuery<SessionResponse>({
    queryKey: ["session"],
    queryFn: () =>
      apiClient.get<SessionResponse>("/api/auth/session"),
    staleTime: 1 * 60 * 1000, // 1 minute - shorter to catch auth changes
    gcTime: 5 * 60 * 1000, // 5 minutes  
    refetchOnWindowFocus: true, // Refetch when user returns to tab
    refetchOnMount: true, // Always check on mount
    retry: false, // auth failures should not retry
  });

  const logoutMutation = useMutation({
    mutationFn: () => apiClient.post("/api/auth/logout", {}),
    onSuccess: () => {
      queryClient.clear(); // Clear all cached data
      router.push("/login");
    },
  });

  return {
    user: query.data?.data?.user ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
}
