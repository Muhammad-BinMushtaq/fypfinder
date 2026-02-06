// hooks/messaging/useMessages.ts
import { useEffect } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"

export interface MessageSender {
  id: string
  name: string
  profilePicture: string | null
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  content: string
  isRead: boolean
  createdAt: string
  sender: MessageSender
  isOptimistic?: boolean // For optimistic updates
}

async function fetchMessages(conversationId: string): Promise<Message[]> {
  const response = await fetch(
    `/api/messaging/get-messages?conversationId=${conversationId}`
  )
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch messages")
  }

  return data.messages
}

export function useMessages(conversationId: string | null) {
  const queryClient = useQueryClient()

  const query = useQuery<Message[], Error>({
    queryKey: ["messages", conversationId],
    queryFn: () => fetchMessages(conversationId!),
    enabled: !!conversationId,
    staleTime: 5 * 60 * 1000, // 5 minutes - messages are fresh, updated via realtime
    gcTime: 30 * 60 * 1000, // 30 minutes - keep in cache for a while
    refetchOnWindowFocus: false, // Don't refetch - we have realtime updates
    refetchOnMount: "always", // Always refetch on mount to mark messages as read
  })

  useEffect(() => {
    if (!conversationId || !query.isSuccess) return

    // Messages fetch marks messages as read on the server.
    // Keep conversation previews + unread badges in sync.
    queryClient.invalidateQueries({ queryKey: ["conversations"] })
    queryClient.invalidateQueries({ queryKey: ["unreadCount"] })
  }, [conversationId, query.isSuccess, query.dataUpdatedAt, queryClient])

  const invalidateMessages = () => {
    if (conversationId) {
      queryClient.invalidateQueries({ queryKey: ["messages", conversationId] })
    }
  }

  const addMessageToCache = (message: Message) => {
    queryClient.setQueryData<Message[]>(
      ["messages", conversationId],
      (old = []) => {
        // Prevent duplicates
        if (old.some(m => m.id === message.id)) {
          return old
        }
        return [...old, message]
      }
    )
  }

  const replaceOptimisticMessage = (tempId: string, realMessage: Message) => {
    queryClient.setQueryData<Message[]>(
      ["messages", conversationId],
      (old = []) => {
        return old.map(m => (m.id === tempId ? realMessage : m))
      }
    )
  }

  const removeOptimisticMessage = (tempId: string) => {
    queryClient.setQueryData<Message[]>(
      ["messages", conversationId],
      (old = []) => {
        return old.filter(m => m.id !== tempId)
      }
    )
  }

  return {
    messages: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    invalidateMessages,
    addMessageToCache,
    replaceOptimisticMessage,
    removeOptimisticMessage,
  }
}
