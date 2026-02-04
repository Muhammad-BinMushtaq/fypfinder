// hooks/student/usePublicProfile.ts
"use client";

/**
 * usePublicProfile Hook
 * ---------------------
 * React Query hook for viewing OTHER students' public profiles.
 * 
 * ⚠️ This is SEPARATE from useMyProfile which handles
 *    the CURRENT user's own profile.
 * 
 * Responsibilities:
 * - Fetch and cache public profile data
 * - Each student profile cached separately
 * - Handle loading and error states
 * 
 * ⚠️ NO JSX, NO routing, NO API URLs here.
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as studentPublicService from "@/services/studentPublic.service";

/* ---------- QUERY KEYS ---------- */

// Factory pattern for query keys
export const publicProfileKeys = {
  all: ["student", "public-profile"] as const,
  detail: (studentId: string) => [...publicProfileKeys.all, studentId] as const,
};

/* ---------- HOOK ---------- */

interface UsePublicProfileOptions {
  enabled?: boolean;
}

export function usePublicProfile(
  studentId: string,
  options: UsePublicProfileOptions = {}
) {
  const { enabled = true } = options;
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: publicProfileKeys.detail(studentId),
    queryFn: () => studentPublicService.getPublicProfile(studentId),
    enabled: enabled && !!studentId, // Don't fetch if no studentId
    staleTime: 10 * 60 * 1000, // 10 minutes - profile data is fairly static
    gcTime: 30 * 60 * 1000, // 30 minutes - keep cache for back navigation
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1, // Only retry once on failure
  });

  /* ---------- PREFETCH ---------- */

  /**
   * Prefetch a student's profile
   * Call this on StudentCard hover for instant navigation
   */
  const prefetchProfile = (id: string) => {
    if (id) {
      queryClient.prefetchQuery({
        queryKey: publicProfileKeys.detail(id),
        queryFn: () => studentPublicService.getPublicProfile(id),
        staleTime: 10 * 60 * 1000,
      });
    }
  };

  /* ---------- RETURN ---------- */

  return {
    // Data
    profile: profileQuery.data,
    
    // Query state
    isLoading: profileQuery.isLoading,
    isFetching: profileQuery.isFetching,
    isError: profileQuery.isError,
    error: profileQuery.error,
    
    // Actions
    refetch: profileQuery.refetch,
    prefetchProfile,
  };
}

/* ---------- STANDALONE PREFETCH ---------- */

/**
 * Prefetch a public profile outside of a component
 * Useful for prefetching on hover in lists
 */
export function prefetchPublicProfile(
  queryClient: ReturnType<typeof useQueryClient>,
  studentId: string
) {
  return queryClient.prefetchQuery({
    queryKey: publicProfileKeys.detail(studentId),
    queryFn: () => studentPublicService.getPublicProfile(studentId),
    staleTime: 10 * 60 * 1000,
  });
}
