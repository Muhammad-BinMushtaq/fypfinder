import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { getSupabaseClient } from "@/lib/supabaseClient"

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

export function useRealtimeConversationUpdates(currentStudentId: string | null) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!currentStudentId) return

    const supabase = getSupabaseClient()

    const channel = supabase
      .channel("conversation-updates")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Message",
          filter: `receiverId=eq.${currentStudentId}`,
        },
        (payload: RealtimePayload) => {
          const newRow = payload.new as {
            conversationId: string
            content: string
            createdAt: string
            senderId: string
          }

          // update conversation preview
          queryClient.setQueryData<any[]>(
            ["conversations"],
            (old = []) =>
              old.map((c) =>
                c.id === newRow.conversationId
                  ? {
                      ...c,
                      lastMessage: newRow.content,
                      lastMessageAt: newRow.createdAt,
                      unreadCount: (c.unreadCount || 0) + 1,
                    }
                  : c
              )
          )

          // update unread badge
          queryClient.setQueryData<number>(
            ["unreadCount"],
            (old = 0) => old + 1
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentStudentId, queryClient])
}
