"use client"

import { useEffect, useRef, useState, useCallback } from "react"
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
  errors?: string[]
}

type ConnectionStatus = "connecting" | "connected" | "disconnected" | "error"

export function ChatWindow({
  conversationId,
  currentStudent,
  otherStudent,
}: ChatWindowProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("connecting")
  const channelRef = useRef<ReturnType<ReturnType<typeof getSupabaseClient>["channel"]> | null>(null)
  const fallbackIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const { messages, isLoading, isError, error, refetch } = useMessages(conversationId)
  const { sendMessage, isPending } = useSendMessage()

  // Fallback polling when realtime is not connected
  const startFallbackPolling = useCallback(() => {
    if (fallbackIntervalRef.current) return // Already polling
    
    fallbackIntervalRef.current = setInterval(() => {
      refetch()
    }, 5000) // Poll every 5 seconds
  }, [refetch])

  const stopFallbackPolling = useCallback(() => {
    if (fallbackIntervalRef.current) {
      clearInterval(fallbackIntervalRef.current)
      fallbackIntervalRef.current = null
    }
  }, [])

  // 🔔 REALTIME: listen to messages for THIS conversation
  useEffect(() => {
    if (!conversationId || !currentStudent.id) return

    const supabase = getSupabaseClient()
    setConnectionStatus("connecting")

    const channel = supabase
      .channel(`chat:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Message",
          // NOTE: Do NOT use filter here! Supabase Realtime filters require
          // the column to be in the table's replica identity. Instead, we
          // listen to all INSERTs and manually check conversationId below.
        },
        (payload: RealtimePayload) => {
          // Handle errors in payload
          if (payload?.errors?.length) {
            console.warn("[Chat] Realtime payload errors:", payload.errors)
            // Fallback: refetch from server
            queryClient.invalidateQueries({
              queryKey: ["messages", conversationId],
            })
            return
          }
          
          // If RLS blocks payload or invalid data, refetch from server
          if (!payload?.new || !payload.new.id || !payload.new.conversationId) {
            console.warn("[Chat] Invalid realtime payload, refetching")
            queryClient.invalidateQueries({
              queryKey: ["messages", conversationId],
            })
            return
          }
          
          const newRow = payload.new

          // ✅ MANUAL FILTER: Only process messages for THIS conversation
          if (newRow.conversationId !== conversationId) {
            return
          }

          // Skip own messages (handled optimistically by useSendMessage)
          if (newRow.senderId === currentStudent.id) return

          // Prevent in-flight fetch from overwriting realtime update
          queryClient.cancelQueries({ queryKey: ["messages", conversationId] })

          const newMessage: Message = {
            id: newRow.id,
            conversationId: newRow.conversationId,
            senderId: newRow.senderId,
            content: newRow.content || "",
            isRead: newRow.isRead ?? false,
            createdAt: newRow.createdAt || new Date().toISOString(),
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
              // Prevent duplicates
              if (old.some((m) => m.id === newMessage.id)) return old
              return [...old, newMessage]
            }
          )
        }
      )
      .subscribe((status: string, err?: Error) => {
        if (status === "SUBSCRIBED") {
          setConnectionStatus("connected")
          stopFallbackPolling() // Stop polling when connected
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          setConnectionStatus("error")
          startFallbackPolling() // Start polling as fallback
        } else if (status === "CLOSED") {
          setConnectionStatus("disconnected")
          startFallbackPolling()
        }
      })

    channelRef.current = channel

    // Cleanup on unmount or dependency change
    return () => {
      stopFallbackPolling()
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [
    conversationId,
    currentStudent.id,
    otherStudent.name,
    otherStudent.profilePicture,
    queryClient,
    startFallbackPolling,
    stopFallbackPolling,
  ])

  const handleSendMessage = (content: string) => {
    if (!content.trim()) return
    
    sendMessage({
      conversationId,
      content: content.trim(),
      currentStudentId: currentStudent.id,
      currentStudentName: currentStudent.name,
    })
  }

  if (isError) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-gray-700 dark:text-gray-200 font-medium mb-1">Failed to load messages</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
            {error?.message || "Something went wrong"}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => refetch()}
              className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => router.push("/dashboard/messages")}
              className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              ← Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900">
      {/* Connection status indicator (only show when not connected) */}
      {connectionStatus !== "connected" && (
        <div className={`px-3 py-1.5 text-xs font-medium text-center ${
          connectionStatus === "connecting" 
            ? "bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
            : connectionStatus === "error"
            ? "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400"
            : "bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-gray-400"
        }`}>
          {connectionStatus === "connecting" && "Connecting to live updates..."}
          {connectionStatus === "error" && "Live updates unavailable - refreshing periodically"}
          {connectionStatus === "disconnected" && "Reconnecting..."}
        </div>
      )}
      
      <MessageList
        messages={messages}
        currentStudentId={currentStudent.id}
        isLoading={isLoading}
      />
      <ChatInput onSend={handleSendMessage} isPending={isPending} />
    </div>
  )
}
