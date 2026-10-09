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
              conversationId: string
              content: string
              isRead: boolean
              createdAt: string
              senderId: string
            }

            queryClient.setQueryData<Conversation[]>(
              ["conversations"],
              (old = []) => {
                return old.map((c) => {
                  if (c.id === updatedRow.conversationId && c.lastMessage?.id === updatedRow.id) {
                    return {
                      ...c,
                      lastMessage: {
                        ...c.lastMessage,
                        content: updatedRow.content,
                        isRead: updatedRow.isRead,
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
              conversationId: string
              content: string
              createdAt: string
              senderId: string
              isRead: boolean
            }

            // Ignore our own messages (optimistic updates already handle them)
            if (newRow.senderId === currentStudentId) return

            const conversations =
              queryClient.getQueryData<Conversation[]>(["conversations"]) || []
            const existing = conversations.find(
              (c) => c.id === newRow.conversationId
            )

            if (!existing) {
              // Conversation not in cache; refetch to avoid stale list/unread count
              queryClient.invalidateQueries({ queryKey: ["conversations"] })
              queryClient.invalidateQueries({ queryKey: ["unreadCount"] })
              return
            }

            // Check if user is actively viewing this conversation
            const isCurrentlyViewing =
              typeof window !== "undefined" &&
              window.location.pathname.startsWith(`/dashboard/messages/${newRow.conversationId}`)

            // Update conversation preview + unread count locally
            queryClient.setQueryData<Conversation[]>(
              ["conversations"],
              (old = []) => {
                const updated = old.map((c) =>
                  c.id === newRow.conversationId
                    ? {
                        ...c,
                        lastMessage: {
                          id: newRow.id,
                          content: newRow.content,
                          senderId: newRow.senderId,
                          isRead: isCurrentlyViewing ? true : newRow.isRead,
                          createdAt: newRow.createdAt,
                        },
                        unreadCount: isCurrentlyViewing ? 0 : (c.unreadCount || 0) + 1,
                        updatedAt: newRow.createdAt,
                      }
                    : c
                )

                // Move updated conversation to the top
                const moved = updated.filter(
                  (c) => c.id === newRow.conversationId
                )
                const rest = updated.filter(
                  (c) => c.id !== newRow.conversationId
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
