// hooks/messaging/useConversations.ts
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "react-toastify"

export interface ConversationParticipant {
  id: string
  name: string
  profilePicture: string | null
}

export interface LastMessage {
  id: string
  content: string
  senderId: string
  isRead: boolean
  createdAt: string
}

export interface Conversation {
  id: string
  otherStudent: ConversationParticipant
  lastMessage: LastMessage | null
  unreadCount: number
  updatedAt: string
}

async function fetchConversations(): Promise<Conversation[]> {
  const response = await fetch("/api/messaging/get-conversations")
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch conversations")
  }

  return data.conversations
}

export function useConversations() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ["conversations"],
    queryFn: fetchConversations,
    staleTime: 2 * 60 * 1000, // 2 minutes - data is considered fresh
    gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache
    refetchOnWindowFocus: false, // Don't refetch on window focus - we have real-time updates
    refetchOnMount: false, // Don't refetch on mount if data exists
  })

  const invalidateConversations = () => {
    queryClient.invalidateQueries({ queryKey: ["conversations"] })
  }

  return {
    conversations: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    invalidateConversations,
  }
}
