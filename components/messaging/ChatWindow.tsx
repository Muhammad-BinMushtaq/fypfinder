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
import { useVisualViewport } from "@/hooks/useVisualViewport"
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
  eventType?: "INSERT" | "UPDATE" | "DELETE"
  new: {
    id: string
    conversationId: string
    senderId: string
    content: string
    isRead: boolean
    isEdited?: boolean
    createdAt: string
  }
  errors?: string[]
}

type ConnectionStatus = "connecting" | "connected" | "disconnected" | "error"

// Gentle fallback polling interval when WebSocket is not connected
const FALLBACK_POLLING_INTERVAL = 25000 // 25 seconds

export function ChatWindow({
  conversationId,
  currentStudent,
  otherStudent,
}: ChatWindowProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("connecting")
  const [isPermissionDenied, setIsPermissionDenied] = useState(false)
  const channelRef = useRef<ReturnType<ReturnType<typeof getSupabaseClient>["channel"]> | null>(null)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const { messages, isLoading, isError, error, refetch } = useMessages(conversationId)
  const { sendMessage, isPending } = useSendMessage()
  const { editMessage } = useEditMessage()
  const viewportHeight = useVisualViewport(true)

  // Explicitly mark incoming messages as read when opening this conversation
  useEffect(() => {
    if (!conversationId) return
    fetch("/api/messaging/mark-read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId }),
    }).catch(() => {})
  }, [conversationId])

  // Check whether messaging is permitted with peer student
  useEffect(() => {
    if (!otherStudent?.id) return
    let isMounted = true
    fetch(`/api/messaging/check-permission?targetStudentId=${otherStudent.id}`)
      .then((res) => res.json())
      .then((json) => {
        if (isMounted && json.success && json.data?.allowed === false) {
          setIsPermissionDenied(true)
        }
      })
      .catch(() => {})

    return () => {
      isMounted = false
    }
  }, [otherStudent?.id])

  // Connection-aware fallback polling (only runs when Realtime WebSocket is NOT connected)
  useEffect(() => {
    if (!conversationId) return

    // If connected via Realtime WebSocket, skip polling to preserve battery & server resources
    if (connectionStatus === "connected") {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }
      return
    }

    // Gentle fallback polling only when disconnected/connecting/error
    pollingIntervalRef.current = setInterval(() => {
      refetch()
    }, FALLBACK_POLLING_INTERVAL)

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }
    }
  }, [conversationId, connectionStatus, refetch])

  // 🔔 REALTIME: Filtered conversation subscription for INSERT and UPDATE events
  useEffect(() => {
    if (!conversationId || !currentStudent.id) return

    const supabase = getSupabaseClient()
    setConnectionStatus("connecting")

    const channel = supabase
      .channel(`chat:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "Message",
          filter: `conversationId=eq.${conversationId}`,
        },
        (payload: RealtimePayload) => {
          if (payload?.errors?.length) {
            clientLogger.warn("[Chat] Realtime payload errors:", payload.errors)
            return
          }

          if (!payload?.new || !payload.new.id || !payload.new.conversationId) {
            return
          }

          const newRow = payload.new

          if (newRow.conversationId !== conversationId) {
            return
          }

          // Handle UPDATE: edits and read receipts (✓ -> ✓✓)
          if (payload.eventType === "UPDATE") {
            queryClient.setQueryData<Message[]>(
              ["messages", conversationId],
              (old = []) =>
                old.map((m) =>
                  m.id === newRow.id
                    ? {
                        ...m,
                        content: newRow.content ?? m.content,
                        isEdited: newRow.isEdited ?? m.isEdited,
                        isRead: newRow.isRead ?? m.isRead,
                      }
                    : m
                )
            )
            return
          }

          // Handle INSERT:
          if (newRow.senderId !== currentStudent.id) {
            const newMessage: Message = {
              id: newRow.id,
              conversationId: newRow.conversationId,
              senderId: newRow.senderId,
              content: newRow.content || "",
              isRead: newRow.isRead ?? false,
              isEdited: newRow.isEdited ?? false,
              createdAt: newRow.createdAt || new Date().toISOString(),
              sender: {
                id: newRow.senderId,
                name: otherStudent.name,
                profilePicture: otherStudent.profilePicture,
              },
            }

            queryClient.setQueryData<Message[]>(
              ["messages", conversationId],
              (old = []) => {
                if (old.some((m) => m.id === newMessage.id)) return old
                return [...old, newMessage]
              }
            )

            // Mark received message as read since user is actively viewing this chat
            fetch("/api/messaging/mark-read", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ conversationId }),
            }).catch(() => {})
          } else {
            // Own message synced from another tab/device
            queryClient.setQueryData<Message[]>(
              ["messages", conversationId],
              (old = []) => {
                if (old.some((m) => m.id === newRow.id || (m.isOptimistic && m.content === newRow.content))) {
                  return old
                }
                const ownMessage: Message = {
                  id: newRow.id,
                  conversationId: newRow.conversationId,
                  senderId: newRow.senderId,
                  content: newRow.content || "",
                  isRead: newRow.isRead ?? false,
                  isEdited: newRow.isEdited ?? false,
                  createdAt: newRow.createdAt || new Date().toISOString(),
                  sender: {
                    id: currentStudent.id,
                    name: currentStudent.name,
                    profilePicture: null,
                  },
                }
                return [...old, ownMessage]
              }
            )
          }
        }
      )
      .subscribe((status: string) => {
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
    currentStudent.name,
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
    <div
      style={viewportHeight ? { height: `${viewportHeight}px` } : undefined}
      className="h-full w-full flex flex-col bg-white dark:bg-slate-900 overflow-hidden"
    >
      {/* Chat Header with Profile Link (Instagram Style - Locked at Top) */}
      <div className="shrink-0 sticky top-0 z-30 flex items-center gap-3 px-4 pt-[calc(0.75rem+env(safe-area-inset-top))] pb-3 border-b border-gray-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
        <button
          onClick={() => router.push("/dashboard/messages")}
          className="lg:hidden p-2 -ml-2 text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Back to messages"
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
              className="w-10 h-10 rounded-full object-cover ring-2 ring-transparent group-hover:ring-gray-300 dark:group-hover:ring-slate-600 transition-all shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 font-semibold text-sm ring-2 ring-transparent group-hover:ring-gray-300 dark:group-hover:ring-slate-600 transition-all shrink-0">
              {otherStudent.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-gray-900 dark:text-white truncate group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors text-sm sm:text-base">
              {otherStudent.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
              View profile
            </p>
          </div>
        </Link>
        
        <Link
          href={`/dashboard/discovery/profile/${otherStudent.id}`}
          className="hidden sm:flex p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors shrink-0"
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
      {isPermissionDenied ? (
        <div className="shrink-0 p-3.5 text-center bg-amber-50 dark:bg-amber-950/40 border-t border-amber-200 dark:border-amber-800 text-xs font-medium text-amber-800 dark:text-amber-300">
          Messaging is closed between these accounts. Send a new connection request to chat.
        </div>
      ) : (
        <ChatInput onSend={handleSendMessage} isPending={isPending} />
      )}
    </div>
  )
}
