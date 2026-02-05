// hooks/messaging/useCheckMessagePermission.ts
/**
 * Hook to check if the current user can message another student
 * Uses the check-permission API which checks:
 * 1. If they are partners in the same group
 * 2. If either has an accepted message request from the other
 */

import { useQuery } from "@tanstack/react-query"

interface CheckPermissionResponse {
  success: boolean
  data?: {
    allowed: boolean
  }
  message?: string
}

async function checkMessagePermission(targetStudentId: string): Promise<boolean> {
  const response = await fetch(`/api/messaging/check-permission?targetStudentId=${targetStudentId}`)
  const data: CheckPermissionResponse = await response.json()

  if (!response.ok) {
    console.error("Check permission error:", data.message)
    return false
  }

  return data.data?.allowed ?? false
}

export function useCheckMessagePermission(targetStudentId: string | null | undefined) {
  const query = useQuery({
    queryKey: ["messagePermission", targetStudentId],
    queryFn: () => checkMessagePermission(targetStudentId!),
    enabled: !!targetStudentId,
    staleTime: 5 * 60 * 1000, // 5 minutes - permission doesn't change often
    gcTime: 10 * 60 * 1000, // 10 minutes cache
    retry: 1,
  })

  return {
    canMessage: query.data ?? false,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}
