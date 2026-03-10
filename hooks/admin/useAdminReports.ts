// hooks/admin/useAdminReports.ts
/**
 * Admin Reports Hook
 * ------------------
 * Fetches weekly/monthly platform reports.
 */

import { useQuery } from "@tanstack/react-query"
import { getAdminReports, type AdminReports } from "@/services/admin.service"
import { adminKeys } from "./useAdminSession"

export function useAdminReports(period: "week" | "month" = "week") {
  return useQuery({
    queryKey: [...adminKeys.all, "reports", period] as const,
    queryFn: () => getAdminReports(period),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
  })
}

export type { AdminReports }
