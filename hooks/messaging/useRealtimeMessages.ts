// hooks/messaging/useRealtimeMessages.ts
import { useEffect, useRef } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { getSupabaseClient } from "@/lib/supabaseClient"
import type { Message } from "./useMessages"
import type { RealtimeChannel } from "@supabase/supabase-js"

interface RealtimePayload {
  new: {
    id: string
    conversationId: string
    senderId: string
    content: string
    isRead: boolean
    createdAt: string
  }
}

export function useRealtimeMessages(
  conversationId: string | null,
  currentStudentId: string | null
) {
  const queryClient = useQueryClient()
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    if (!conversationId || !currentStudentId) return

    const supabase = getSupabaseClient()

    // Subscribe to new messages in this conversation
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Message",
          filter: `conversationId=eq.${conversationId}`,
        },
        async (payload: RealtimePayload) => {
          const newMessageData = payload.new

          // Skip if this is our own message (already added via optimistic update)
          if (newMessageData.senderId === currentStudentId) {
            return
          }

          // Fetch sender info for the message
          // We'll construct the message with minimal info, then refetch for full data
          const newMessage: Message = {
            id: newMessageData.id,
            conversationId: newMessageData.conversationId,
            senderId: newMessageData.senderId,
            content: newMessageData.content,
            isRead: newMessageData.isRead,
            createdAt: newMessageData.createdAt,
            sender: {
              id: newMessageData.senderId,
              name: "Loading...", // Will be updated on refetch
              profilePicture: null,
            },
          }

          // Add to cache immediately
          queryClient.setQueryData<Message[]>(
            ["messages", conversationId],
            (old = []) => {
              // Prevent duplicates
              if (old.some((m) => m.id === newMessage.id)) {
                return old
              }
              return [...old, newMessage]
            }
          )

          // Invalidate conversations to update last message and unread count
          queryClient.invalidateQueries({ queryKey: ["conversations"] })
          queryClient.invalidateQueries({ queryKey: ["unreadCount"] })

          // Refetch messages to get full sender info
          queryClient.invalidateQueries({ queryKey: ["messages", conversationId] })
        }
      )
      .subscribe((status) => {
        console.log(`Realtime subscription status for ${conversationId}:`, status)
      })

    channelRef.current = channel

    // Cleanup on unmount or when conversationId changes
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [conversationId, currentStudentId, queryClient])

  return null
}

// Hook to subscribe to all conversations for notification updates
export function useRealtimeConversationUpdates(currentStudentId: string | null) {
  const queryClient = useQueryClient()
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    if (!currentStudentId) return

    const supabase = getSupabaseClient()

    // Subscribe to all new messages to update conversation list
    const channel = supabase
      .channel("all-messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Message",
        },
        (payload: RealtimePayload) => {
          // Skip our own messages
          if (payload.new.senderId === currentStudentId) {
            return
          }

          // Invalidate conversations to update the list
          queryClient.invalidateQueries({ queryKey: ["conversations"] })
          queryClient.invalidateQueries({ queryKey: ["unreadCount"] })
        }
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [currentStudentId, queryClient])
}
