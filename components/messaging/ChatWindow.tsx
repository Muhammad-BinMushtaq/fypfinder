"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { MessageList } from "./MessageList"
import { ChatInput } from "./ChatInput"
import { useMessages, type Message } from "@/hooks/messaging/useMessages"
import { useSendMessage } from "@/hooks/messaging/useSendMessage"
import { getSupabaseClient } from "@/lib/supabaseClient"

interface ChatParticipant {
  id: string
  name: string
  profilePicture: string | null
}

interface ChatWindowProps {
  conversationId: string
  currentStudent: {
    id: string
    name: string
  }
  otherStudent: ChatParticipant
}

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

export function ChatWindow({
  conversationId,
  currentStudent,
  otherStudent,
}: ChatWindowProps) {
  const router = useRouter()
  const queryClient = useQueryClient()

  const { messages, isLoading, isError, error } =
    useMessages(conversationId)

  const { sendMessage, isPending } = useSendMessage()

  // 🔔 REALTIME: listen to messages for THIS conversation only
  useEffect(() => {
    if (!conversationId || !currentStudent.id) return

    const supabase = getSupabaseClient()

    const channel = supabase
      .channel(`chat:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Message",
          filter: `conversationId=eq.${conversationId}`,
        },
        (payload: RealtimePayload) => {
          if (process.env.NODE_ENV !== "production") {
            console.log("🔥 REALTIME EVENT RECEIVED", payload)
          }
          const newRow = payload.new as {
            id: string
            conversationId: string
            senderId: string
            content: string
            isRead: boolean
            createdAt: string
          }

          // Skip own messages (handled optimistically)
          if (newRow.senderId === currentStudent.id) return

          // Prevent in-flight fetch from overwriting realtime update
          queryClient.cancelQueries({ queryKey: ["messages", conversationId] })

          const newMessage: Message = {
            id: newRow.id,
            conversationId: newRow.conversationId,
            senderId: newRow.senderId,
            content: newRow.content,
            isRead: newRow.isRead,
            createdAt: newRow.createdAt,
            sender: {
              id: newRow.senderId,
              name: otherStudent.name,
              profilePicture: otherStudent.profilePicture,
            },
          }

          // ✅ SINGLE SOURCE OF TRUTH: React Query cache
          queryClient.setQueryData<Message[]>(
            ["messages", conversationId],
            (old = []) => {
              if (old.some((m) => m.id === newMessage.id)) return old
              return [...old, newMessage]
            }
          )
        }
      )
      .subscribe((status: any) => {
        if (process.env.NODE_ENV !== "production") {
          console.log("[Realtime] chat channel status:", status)
        }
      })

    console.log(
      "AFTER REALTIME",
      queryClient.getQueryData(["messages", conversationId])
    )
    return () => {
      supabase.removeChannel(channel)
    }
  }, [
    conversationId,
    currentStudent.id,
    otherStudent.name,
    otherStudent.profilePicture,
    queryClient,
  ])

  const handleSendMessage = (content: string) => {
    sendMessage({
      conversationId,
      content,
      currentStudentId: currentStudent.id,
      currentStudentName: currentStudent.name,
    })
  }

  if (isError) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">
            {error?.message || "Failed to load chat"}
          </p>
          <button
            onClick={() => router.push("/dashboard/messages")}
            className="text-indigo-600 text-sm mt-3"
          >
            ← Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-white">
      <MessageList
        messages={messages}
        currentStudentId={currentStudent.id}
        isLoading={isLoading}
      />
      <ChatInput onSend={handleSendMessage} isPending={isPending} />
    </div>
  )
}
