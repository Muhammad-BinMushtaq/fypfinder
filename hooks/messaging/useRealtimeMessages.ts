import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { getSupabaseClient } from "@/lib/supabaseClient"
import type { Conversation } from "./useConversations"

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
      .channel(`conversation-updates-${currentStudentId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "Message",
        },
        (payload: any) => {
          if (payload.eventType === "UPDATE") {
            const updatedRow = payload.new as {
              id: string
              conversationId?: string
              conversation_id?: string
              conversationid?: string
              content: string
              isRead?: boolean
              is_read?: boolean
              isread?: boolean
              createdAt: string
              senderId: string
            }

            const rowConversationId = updatedRow.conversationId || updatedRow.conversation_id || updatedRow.conversationid;
            const rowIsRead = updatedRow.isRead ?? updatedRow.is_read ?? updatedRow.isread ?? false;

            if (!rowConversationId) return;

            queryClient.setQueryData<Conversation[]>(
              ["conversations"],
              (old = []) => {
                return old.map((c) => {
                  if (c.id === rowConversationId && c.lastMessage?.id === updatedRow.id) {
                    return {
                      ...c,
                      lastMessage: {
                        ...c.lastMessage,
                        content: updatedRow.content,
                        isRead: rowIsRead,
                      },
                    }
                  }
                  return c
                })
              }
            )
            return
          }

          if (payload.eventType === "INSERT") {
            const newRow = payload.new as {
              id: string
              conversationId?: string
              conversation_id?: string
              conversationid?: string
              content: string
              createdAt?: string
              created_at?: string
              createdat?: string
              senderId?: string
              sender_id?: string
              senderid?: string
              isRead?: boolean
              is_read?: boolean
              isread?: boolean
            }

            const rowConversationId = newRow.conversationId || newRow.conversation_id || newRow.conversationid;
            const rowSenderId = newRow.senderId || newRow.sender_id || newRow.senderid;
            const rowIsRead = newRow.isRead ?? newRow.is_read ?? newRow.isread ?? false;
            const rowCreatedAt = newRow.createdAt || newRow.created_at || newRow.createdat || new Date().toISOString();

            if (!rowConversationId) {
              queryClient.invalidateQueries({ queryKey: ["conversations"] })
              queryClient.invalidateQueries({ queryKey: ["unreadCount"] })
              return
            }

            // Ignore our own messages (optimistic updates already handle them)
            if (rowSenderId === currentStudentId) return

            const conversations =
              queryClient.getQueryData<Conversation[]>(["conversations"]) || []
            const existing = conversations.find(
              (c) => c.id === rowConversationId
            )

            if (!existing) {
              // Conversation not in cache; refetch to avoid stale list/unread count
              queryClient.invalidateQueries({ queryKey: ["conversations"] })
              queryClient.invalidateQueries({ queryKey: ["unreadCount"] })
              return
            }

            // Check if user is actively viewing this conversation in a visible tab
            const isCurrentlyViewing =
              typeof window !== "undefined" &&
              window.location.pathname.startsWith(`/dashboard/messages/${rowConversationId}`) &&
              document.visibilityState === "visible"

            // Update conversation preview + unread count locally
            queryClient.setQueryData<Conversation[]>(
              ["conversations"],
              (old = []) => {
                const updated = old.map((c) =>
                  c.id === rowConversationId
                    ? {
                        ...c,
                        lastMessage: {
                          id: newRow.id,
                          content: newRow.content,
                          senderId: rowSenderId || "",
                          isRead: isCurrentlyViewing ? true : rowIsRead,
                          createdAt: rowCreatedAt,
                        },
                        unreadCount: isCurrentlyViewing ? 0 : (c.unreadCount || 0) + 1,
                        updatedAt: rowCreatedAt,
                      }
                    : c
                )

                // Move updated conversation to the top
                const moved = updated.filter(
                  (c) => c.id === rowConversationId
                )
                const rest = updated.filter(
                  (c) => c.id !== rowConversationId
                )
                return [...moved, ...rest]
              }
            )

            // Update unread badge total only if not actively looking at this chat
            if (!isCurrentlyViewing) {
              queryClient.setQueryData<number>(
                ["unreadCount"],
                (old = 0) => old + 1
              )
            } else {
              // User is actively looking at this conversation: ensure messages stay synced
              queryClient.invalidateQueries({ queryKey: ["messages", rowConversationId] })
            }
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentStudentId, queryClient])
}
