// hooks/admin/useAdminConversations.ts
/**
 * Admin Conversations Hook
 * ------------------------
 * Read-only access to all conversations for admin.
 */

import { useQuery } from "@tanstack/react-query"
import {
  getAdminConversations,
  getAdminMessages,
  type AdminConversation,
  type AdminMessage,
} from "@/services/admin.service"
import { adminKeys } from "./useAdminSession"

/**
 * Fetch paginated list of all conversations
 */
export function useAdminConversations(page: number = 1, pageSize: number = 20) {
  return useQuery({
    queryKey: adminKeys.conversationsList(page),
    queryFn: () => getAdminConversations(page, pageSize),
    staleTime: 60 * 1000, // 1 minute
    placeholderData: (previousData) => previousData,
  })
}

/**
 * Fetch messages for a specific conversation (read-only)
 */
export function useAdminMessages(conversationId: string | null, page: number = 1, pageSize: number = 50) {
  return useQuery({
    queryKey: [...adminKeys.messages(conversationId!), page],
    queryFn: () => getAdminMessages(conversationId!, page, pageSize),
    enabled: !!conversationId,
    staleTime: 60 * 1000, // 1 minute
  })
}

// Re-export types
export type { AdminConversation, AdminMessage }
