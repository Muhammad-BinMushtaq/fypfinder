// hooks/messaging/useUnreadCount.ts
import { useQuery, useQueryClient } from "@tanstack/react-query"

async function fetchUnreadCount(): Promise<number> {
  const response = await fetch("/api/messaging/unread-count")
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch unread count")
  }

  return data.unreadCount
}

export function useUnreadCount() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ["unreadCount"],
    queryFn: fetchUnreadCount,
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  })

  const invalidateUnreadCount = () => {
    queryClient.invalidateQueries({ queryKey: ["unreadCount"] })
  }

  return {
    unreadCount: query.data || 0,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    invalidateUnreadCount,
  }
}
