"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useQueryClient } from "@tanstack/react-query"
import { ArrowLeft, User } from "lucide-react"
import { MessageList } from "./MessageList"
import { ChatInput } from "./ChatInput"
import { useMessages, type Message } from "@/hooks/messaging/useMessages"
import { useSendMessage } from "@/hooks/messaging/useSendMessage"
import { useEditMessage } from "@/hooks/messaging/useEditMessage"
import { getSupabaseClient } from "@/lib/supabaseClient"
import clientLogger from "@/lib/client-logger"

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

// Polling interval in milliseconds
const POLLING_INTERVAL = 3000 // 3 seconds

export function ChatWindow({
  conversationId,
  currentStudent,
  otherStudent,
}: ChatWindowProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("connecting")
  const channelRef = useRef<ReturnType<ReturnType<typeof getSupabaseClient>["channel"]> | null>(null)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const { messages, isLoading, isError, error, refetch } = useMessages(conversationId)
  const { sendMessage, isPending } = useSendMessage()
  const { editMessage } = useEditMessage()

  // Always-on polling as the primary message update mechanism
  // This ensures messages update even if Supabase Realtime isn't working
  useEffect(() => {
    if (!conversationId) return

    // Start polling immediately
    pollingIntervalRef.current = setInterval(() => {
      refetch()
    }, POLLING_INTERVAL)

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }
    }
  }, [conversationId, refetch])

  // 🔔 REALTIME: Enhanced real-time subscription (supplements polling)
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
        },
        (payload: RealtimePayload) => {
          // Handle errors in payload
          if (payload?.errors?.length) {
            clientLogger.warn("[Chat] Realtime payload errors:", payload.errors)
            return
          }
          
          // If RLS blocks payload or invalid data, skip
          if (!payload?.new || !payload.new.id || !payload.new.conversationId) {
            return
          }
          
          const newRow = payload.new

          // Only process messages for THIS conversation
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

          // Add to cache (prevents duplicates)
          queryClient.setQueryData<Message[]>(
            ["messages", conversationId],
            (old = []) => {
              if (old.some((m) => m.id === newMessage.id)) return old
              return [...old, newMessage]
            }
          )
        }
      )
      .subscribe((status: string, err?: Error) => {
        if (status === "SUBSCRIBED") {
          setConnectionStatus("connected")
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          setConnectionStatus("error")
        } else if (status === "CLOSED") {
          setConnectionStatus("disconnected")
        }
      })

    channelRef.current = channel

    return () => {
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

  const handleEditMessage = (messageId: string, newContent: string) => {
    editMessage({
      messageId,
      conversationId,
      content: newContent,
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
    <div className="h-full flex flex-col bg-white dark:bg-slate-900 overflow-hidden">
      {/* Chat Header with Profile Link */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <button
          onClick={() => router.push("/dashboard/messages")}
          className="lg:hidden p-1.5 -ml-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        
        <Link
          href={`/dashboard/discovery/profile/${otherStudent.id}`}
          className="flex items-center gap-3 flex-1 min-w-0 group"
        >
          {otherStudent.profilePicture ? (
            <img
              src={otherStudent.profilePicture}
              alt={otherStudent.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-transparent group-hover:ring-gray-200 dark:group-hover:ring-slate-600 transition-all"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-gray-600 dark:text-gray-300 font-medium text-sm ring-2 ring-transparent group-hover:ring-gray-200 dark:group-hover:ring-slate-600 transition-all">
              {otherStudent.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="font-medium text-gray-900 dark:text-white truncate group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">
              {otherStudent.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
              View profile
            </p>
          </div>
        </Link>
        
        <Link
          href={`/dashboard/discovery/profile/${otherStudent.id}`}
          className="hidden sm:flex p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
          title="View Profile"
        >
          <User className="w-5 h-5" />
        </Link>
      </div>

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
        onEditMessage={handleEditMessage}
      />
      <ChatInput onSend={handleSendMessage} isPending={isPending} />
    </div>
  )
}
