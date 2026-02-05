// components/messaging/ChatWindow.tsx
"use client"

import { useEffect, useState } from "react"
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

export function ChatWindow({
  conversationId,
  currentStudent,
  otherStudent,
}: ChatWindowProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { messages, isLoading, isError, error, refetch } = useMessages(conversationId)
  const { sendMessage, isPending } = useSendMessage()
  
  // Local state to force re-render when realtime messages arrive
  const [realtimeMessages, setRealtimeMessages] = useState<Message[]>([])

  // Subscribe to realtime messages directly in this component
  useEffect(() => {
    if (!conversationId || !currentStudent.id) {
      console.log("[ChatWindow] Missing params for realtime:", { conversationId, currentStudentId: currentStudent.id })
      return
    }

    console.log("[ChatWindow] Setting up realtime subscription for:", conversationId)
    
    const supabase = getSupabaseClient()

    const channel = supabase
      .channel(`chat-messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Message",
        },
        async (payload: { new: Record<string, unknown> }) => {
          console.log("[ChatWindow] 🔔 Received realtime message:", payload)
          
          const newMessageData = payload.new as {
            id: string
            conversationId: string
            senderId: string
            content: string
            isRead: boolean
            createdAt: string
          }

          // Skip if not for this conversation
          if (newMessageData.conversationId !== conversationId) {
            console.log("[ChatWindow] Message for different conversation, skipping")
            return
          }

          // Skip own messages (handled by optimistic update)
          if (newMessageData.senderId === currentStudent.id) {
            console.log("[ChatWindow] Own message, skipping")
            return
          }

          console.log("[ChatWindow] ✅ Processing incoming message:", newMessageData.id)

          // Create the message object
          const newMessage: Message = {
            id: newMessageData.id,
            conversationId: newMessageData.conversationId,
            senderId: newMessageData.senderId,
            content: newMessageData.content || "",
            isRead: newMessageData.isRead ?? false,
            createdAt: newMessageData.createdAt || new Date().toISOString(),
            sender: {
              id: newMessageData.senderId,
              name: otherStudent.name, // Use the known other student name
              profilePicture: otherStudent.profilePicture,
            },
          }

          // Add to local state to force re-render
          setRealtimeMessages(prev => {
            if (prev.some(m => m.id === newMessage.id)) return prev
            return [...prev, newMessage]
          })

          // Also update React Query cache
          queryClient.setQueryData<Message[]>(
            ["messages", conversationId],
            (old = []) => {
              if (old.some(m => m.id === newMessage.id)) return old
              return [...old, newMessage]
            }
          )

          // Invalidate conversations to update sidebar
          queryClient.invalidateQueries({ queryKey: ["conversations"] })
        }
      )
      .subscribe((status: string) => {
        console.log("[ChatWindow] Subscription status:", status)
      })

    return () => {
      console.log("[ChatWindow] Cleaning up realtime subscription")
      supabase.removeChannel(channel)
    }
  }, [conversationId, currentStudent.id, otherStudent, queryClient])

  // Combine messages from React Query with realtime messages
  const allMessages = [...messages]
  
  // Add any realtime messages not already in the main list
  realtimeMessages.forEach(rtMsg => {
    if (!allMessages.some(m => m.id === rtMsg.id)) {
      allMessages.push(rtMsg)
    }
  })
  
  // Sort by createdAt
  allMessages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

  const handleSendMessage = (content: string) => {
    sendMessage({
      conversationId,
      content,
      currentStudentId: currentStudent.id,
      currentStudentName: currentStudent.name,
    })
  }

  // Get initials for avatar
  const initials = otherStudent.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  if (isError) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="text-gray-700 font-medium mb-1">Failed to load chat</h3>
          <p className="text-gray-500 text-sm mb-4">
            {error?.message || "Something went wrong"}
          </p>
          <button
            onClick={() => router.push("/dashboard/messages")}
            className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
          >
            ← Back to messages
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Chat Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-white">
        {/* Back button (mobile) */}
        <button
          onClick={() => router.push("/dashboard/messages")}
          className="lg:hidden p-2 -ml-2 text-gray-500 hover:text-gray-700"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        {/* Avatar */}
        {otherStudent.profilePicture ? (
          <img
            src={otherStudent.profilePicture}
            alt={otherStudent.name}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
            {initials}
          </div>
        )}

        {/* Name and status */}
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold text-gray-900 truncate">
            {otherStudent.name}
          </h2>
          <p className="text-xs text-gray-500">Click to view profile</p>
        </div>

        {/* Actions */}
        <button
          onClick={() => router.push(`/dashboard/discovery/profile/${otherStudent.id}`)}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          title="View profile"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </button>
      </div>

      {/* Messages - use allMessages which combines React Query + realtime */}
      <MessageList
        messages={allMessages}
        currentStudentId={currentStudent.id}
        isLoading={isLoading}
      />

      {/* Input */}
      <ChatInput onSend={handleSendMessage} isPending={isPending} />
    </div>
  )
}
