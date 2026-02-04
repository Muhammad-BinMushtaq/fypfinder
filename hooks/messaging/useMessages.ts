// hooks/messaging/useMessages.ts
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

  const query = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => fetchMessages(conversationId!),
    enabled: !!conversationId,
    staleTime: 10 * 1000, // 10 seconds
    refetchOnWindowFocus: false,
  })

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
