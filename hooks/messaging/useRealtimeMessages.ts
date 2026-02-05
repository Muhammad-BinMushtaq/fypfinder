// hooks/messaging/useRealtimeMessages.ts
/**
 * Real-time messaging hooks
 * 
 * Note: The main real-time message handling is now done directly in ChatWindow.tsx
 * to ensure proper state updates and re-renders.
 * 
 * This file contains:
 * - useRealtimeConversationUpdates: Updates conversation list when new messages arrive
 */

import { useEffect, useRef } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { getSupabaseClient } from "@/lib/supabaseClient"
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

// Hook to subscribe to all conversations for notification updates
export function useRealtimeConversationUpdates(currentStudentId: string | null) {
  const queryClient = useQueryClient()
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    if (!currentStudentId) {
      console.log("[RealtimeConversations] No student ID, skipping subscription")
      return
    }

    console.log("[RealtimeConversations] Setting up subscription for:", currentStudentId)
    
    const supabase = getSupabaseClient()

    // Subscribe to all new messages to update conversation list
    const channel = supabase
      .channel("all-messages-for-conversations")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Message",
        },
        (payload: RealtimePayload) => {
          console.log("[RealtimeConversations] New message received:", payload.new?.id)
          
          // Skip our own messages
          if (payload.new.senderId === currentStudentId) {
            console.log("[RealtimeConversations] Own message, skipping")
            return
          }

          // Invalidate conversations to update the list
          console.log("[RealtimeConversations] Invalidating conversations")
          queryClient.invalidateQueries({ queryKey: ["conversations"] })
          queryClient.invalidateQueries({ queryKey: ["unreadCount"] })
        }
      )
      .subscribe((status: RealtimeChannel['state']) => {
        console.log("[RealtimeConversations] Subscription status:", status)
      })

    channelRef.current = channel

    return () => {
      console.log("[RealtimeConversations] Cleaning up subscription")
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [currentStudentId, queryClient])
}
