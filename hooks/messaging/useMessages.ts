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
  isEdited?: boolean
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
    throw new Error(data.message || "Failed to fetch messages")
  }

  return data.data?.messages || []
}

export function useMessages(conversationId: string | null) {
  const queryClient = useQueryClient()
  const queryKey = ["messages", conversationId] as const

  const query = useQuery<Message[], Error>({
    queryKey,
    queryFn: async () => {
      const fetched = await fetchMessages(conversationId!)
      const cached = queryClient.getQueryData<Message[]>(queryKey) || []

      // If no cached data, just return fetched
      if (cached.length === 0) return fetched

      // Merge fetched data with any realtime/optimistic messages already in cache
      // Prioritize server data over cached, except for optimistic messages
      const byId = new Map<string, Message>()
      
      // First add fetched messages (server truth)
      for (const msg of fetched) {
        byId.set(msg.id, msg)
      }
      
      // Then add any cached messages (realtime or optimistic) that aren't yet in server response
      for (const msg of cached) {
        if (!byId.has(msg.id)) {
          byId.set(msg.id, msg)
        }
      }

      // Sort by creation time
      return Array.from(byId.values()).sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
    },
    enabled: !!conversationId,
    staleTime: 5 * 60 * 1000, // 5 minutes - messages are fresh, updated via realtime
    gcTime: 30 * 60 * 1000, // 30 minutes - keep in cache for a while
    refetchOnWindowFocus: false, // Don't refetch - we have realtime updates
    refetchOnMount: "always", // Always refetch on mount
    retry: 2, // Retry failed requests twice
  })

  const invalidateMessages = () => {
    if (conversationId) {
      queryClient.invalidateQueries({ queryKey })
    }
  }

  const addMessageToCache = (message: Message) => {
    queryClient.setQueryData<Message[]>(
      queryKey,
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
      queryKey,
      (old = []) => {
        return old.map(m => (m.id === tempId ? realMessage : m))
      }
    )
  }

  const removeOptimisticMessage = (tempId: string) => {
    queryClient.setQueryData<Message[]>(
      queryKey,
      (old = []) => {
        return old.filter(m => m.id !== tempId)
      }
    )
  }

  const updateMessageInCache = (messageId: string, updatedMessage: Message) => {
    queryClient.setQueryData<Message[]>(
      queryKey,
      (old = []) => old.map(m => (m.id === messageId ? updatedMessage : m))
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
    updateMessageInCache,
  }
}
