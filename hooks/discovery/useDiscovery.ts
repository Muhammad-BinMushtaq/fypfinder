// hooks/discovery/useDiscovery.ts
"use client";

/**
 * useDiscovery Hook
 * -----------------
 * React Query hook for student discovery.
 * 
 * Responsibilities:
 * - Manage discovery query state
 * - Handle pagination
 * - Cache discovery results
 * - Provide filter controls with manual apply
 * 
 * ⚠️ NO JSX, NO routing, NO API URLs here.
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback, useMemo } from "react";
import * as discoveryService from "@/services/discovery.service";
import type { DiscoveryFilters, MatchedStudent } from "@/services/discovery.service";

/* ---------- QUERY KEYS ---------- */

// Factory pattern for query keys
export const discoveryKeys = {
  all: ["discovery"] as const,
  list: (filters: DiscoveryFilters) => [...discoveryKeys.all, filters] as const,
};

/* ---------- HOOK ---------- */

interface UseDiscoveryOptions {
  initialLimit?: number;
}

export function useDiscovery(options: UseDiscoveryOptions = {}) {
  const { initialLimit = 12 } = options;
  const queryClient = useQueryClient();

  // Applied filters (server state) - triggers API calls
  const [appliedFilters, setAppliedFilters] = useState<DiscoveryFilters>({
    limit: initialLimit,
    offset: 0,
  });

  // Pending filters (UI state) - doesn't trigger API calls until applied
  const [pendingFilters, setPendingFilters] = useState<DiscoveryFilters>({
    limit: initialLimit,
    offset: 0,
  });

  // Track if there are unapplied filter changes
  const hasUnappliedChanges = useMemo(() => {
    return (
      pendingFilters.department !== appliedFilters.department ||
      pendingFilters.semester !== appliedFilters.semester ||
      JSON.stringify(pendingFilters.skills) !== JSON.stringify(appliedFilters.skills)
    );
  }, [pendingFilters, appliedFilters]);

  // Memoized query key
  const queryKey = useMemo(() => discoveryKeys.list(appliedFilters), [appliedFilters]);

  // Main discovery query
  const discoveryQuery = useQuery({
    queryKey,
    queryFn: () => discoveryService.getMatchedStudentsWithSkills(appliedFilters),
    staleTime: 5 * 60 * 1000, // 5 minutes - discovery data changes less frequently
    gcTime: 15 * 60 * 1000, // 15 minutes - keep cache longer for back navigation
    refetchOnWindowFocus: false, // Don't refetch on tab switch
    refetchOnReconnect: false, // Don't refetch on reconnect
    placeholderData: (previousData) => previousData, // Keep previous data while loading new
  });

  /* ---------- FILTER ACTIONS (Update pending, not applied) ---------- */

  const setDepartment = useCallback((department: string | undefined) => {
    setPendingFilters((prev) => ({
      ...prev,
      department,
    }));
  }, []);

  const setSemester = useCallback((semester: number | undefined) => {
    setPendingFilters((prev) => ({
      ...prev,
      semester,
    }));
  }, []);

  const setSkills = useCallback((skills: string[] | undefined) => {
    setPendingFilters((prev) => ({
      ...prev,
      skills,
    }));
  }, []);

  // Apply filters - this triggers the API call
  const applyFilters = useCallback(() => {
    setAppliedFilters({
      ...pendingFilters,
      offset: 0, // Reset to first page when applying new filters
    });
  }, [pendingFilters]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    const clearedFilters = {
      limit: initialLimit,
      offset: 0,
    };
    setPendingFilters(clearedFilters);
    setAppliedFilters(clearedFilters);
  }, [initialLimit]);

  /* ---------- PAGINATION ---------- */

  const pagination = discoveryQuery.data?.pagination;
  const totalPages = pagination
    ? Math.ceil(pagination.total / pagination.limit)
    : 0;
  const currentPage = pagination
    ? Math.floor(pagination.offset / pagination.limit) + 1
    : 1;
  const hasNextPage = pagination
    ? pagination.offset + pagination.limit < pagination.total
    : false;
  const hasPreviousPage = pagination ? pagination.offset > 0 : false;

  const goToPage = useCallback(
    (page: number) => {
      const newOffset = (page - 1) * (appliedFilters.limit ?? initialLimit);
      setAppliedFilters((prev) => ({
        ...prev,
        offset: newOffset,
      }));
      setPendingFilters((prev) => ({
        ...prev,
        offset: newOffset,
      }));
    },
    [appliedFilters.limit, initialLimit]
  );

  const nextPage = useCallback(() => {
    if (hasNextPage && pagination) {
      const newOffset = (appliedFilters.offset ?? 0) + (appliedFilters.limit ?? initialLimit);
      setAppliedFilters((prev) => ({
        ...prev,
        offset: newOffset,
      }));
      setPendingFilters((prev) => ({
        ...prev,
        offset: newOffset,
      }));
    }
  }, [hasNextPage, pagination, appliedFilters, initialLimit]);

  const previousPage = useCallback(() => {
    if (hasPreviousPage) {
      const newOffset = Math.max(0, (appliedFilters.offset ?? 0) - (appliedFilters.limit ?? initialLimit));
      setAppliedFilters((prev) => ({
        ...prev,
        offset: newOffset,
      }));
      setPendingFilters((prev) => ({
        ...prev,
        offset: newOffset,
      }));
    }
  }, [hasPreviousPage, appliedFilters, initialLimit]);

  /* ---------- PREFETCH ---------- */

  // Prefetch next page for instant navigation
  const prefetchNextPage = useCallback(() => {
    if (hasNextPage && pagination) {
      const nextFilters: DiscoveryFilters = {
        ...appliedFilters,
        offset: (appliedFilters.offset ?? 0) + (appliedFilters.limit ?? initialLimit),
      };
      queryClient.prefetchQuery({
        queryKey: discoveryKeys.list(nextFilters),
        queryFn: () => discoveryService.getMatchedStudentsWithSkills(nextFilters),
        staleTime: 5 * 60 * 1000,
      });
    }
  }, [hasNextPage, pagination, appliedFilters, initialLimit, queryClient]);

  /* ---------- RETURN ---------- */

  return {
    // Data
    students: discoveryQuery.data?.items ?? [],
    pagination: discoveryQuery.data?.pagination,
    
    // Query state
    isLoading: discoveryQuery.isLoading,
    isFetching: discoveryQuery.isFetching,
    isError: discoveryQuery.isError,
    error: discoveryQuery.error,
    
    // Filter state (pending = UI state, applied = server state)
    pendingFilters,
    appliedFilters,
    hasUnappliedChanges,
    
    // Filter actions
    setDepartment,
    setSemester,
    setSkills,
    applyFilters,
    clearFilters,
    
    // Pagination
    currentPage,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    goToPage,
    nextPage,
    previousPage,
    
    // Prefetch
    prefetchNextPage,
    
    // Refetch
    refetch: discoveryQuery.refetch,
  };
}
