// hooks/admin/useAdminStats.ts
/**
 * Admin Statistics Hook
 * ---------------------
 * Fetches dashboard statistics for admin.
 */

import { useQuery } from "@tanstack/react-query"
import { getAdminStats, type AdminStats } from "@/services/admin.service"
import { adminKeys } from "./useAdminSession"

export function useAdminStats() {
  return useQuery({
    queryKey: adminKeys.stats(),
    queryFn: getAdminStats,
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  })
}

export type { AdminStats }
