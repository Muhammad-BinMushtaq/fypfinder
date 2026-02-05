// app/dashboard/messages/[conversationId]/page.tsx
"use client"

import { useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { ConversationList } from "@/components/messaging/ConversationList"
import { ChatWindow } from "@/components/messaging/ChatWindow"
import { useMyProfile } from "@/hooks/student/useMyProfile"
import { useConversations } from "@/hooks/messaging/useConversations"
import { useRealtimeConversationUpdates } from "@/hooks/messaging/useRealtimeMessages"

export default function ConversationPage() {
  const params = useParams()
  const router = useRouter()
  const conversationId = params.conversationId as string

  const { profile, isLoading: profileLoading } = useMyProfile()
  
  // Use the cached conversations hook instead of manual fetch
  // This prevents the list from reloading on every navigation
  const { conversations, isLoading: conversationsLoading, isError } = useConversations()

  // Subscribe to realtime updates for conversation list
  useRealtimeConversationUpdates(profile?.id || null)

  // Find the current conversation from the cached list
  const currentConversation = useMemo(() => {
    if (!conversations || !conversationId) return null
    return conversations.find((c) => c.id === conversationId)
  }, [conversations, conversationId])

  // Only show loading if profile is loading (conversations will show their own skeleton)
  if (profileLoading) {
    return (
      <div className="h-[calc(100vh-4rem)] bg-white flex">
        {/* Conversation List - show the real component, it handles its own loading */}
        <div className="hidden lg:block w-80 xl:w-96 border-r border-gray-200">
          <ConversationList activeConversationId={conversationId} />
        </div>

        {/* Chat area loading */}
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 text-sm">Loading profile...</p>
          </div>
        </div>
      </div>
    )
  }

  // Show chat loading only while we're fetching conversations for the first time
  // AND we don't have the current conversation data yet
  if (conversationsLoading && !currentConversation) {
    return (
      <div className="h-[calc(100vh-4rem)] bg-white flex">
        {/* Conversation List - let it handle its own loading state */}
        <div className="hidden lg:block w-80 xl:w-96 border-r border-gray-200">
          <ConversationList activeConversationId={conversationId} />
        </div>

        {/* Chat area loading */}
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 text-sm">Loading conversation...</p>
          </div>
        </div>
      </div>
    )
  }

  if (isError || (!conversationsLoading && !currentConversation)) {
    return (
      <div className="h-[calc(100vh-4rem)] bg-white flex">
        {/* Conversation List */}
        <div className="hidden lg:block w-80 xl:w-96 border-r border-gray-200">
          <ConversationList activeConversationId={conversationId} />
        </div>

        {/* Error state */}
        <div className="flex-1 flex items-center justify-center">
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
            <h3 className="text-gray-700 font-medium mb-1">
              Couldn&apos;t load conversation
            </h3>
            <p className="text-gray-500 text-sm mb-4">
              {isError ? "Failed to load conversations" : "Conversation not found"}
            </p>
            <button
              onClick={() => router.push("/dashboard/messages")}
              className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
            >
              ← Back to messages
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!profile || !currentConversation) {
    return null
  }

  // Get the other student from the conversation
  const otherStudent = currentConversation.otherStudent

  return (
    <div className="h-[calc(100vh-4rem)] bg-white flex">
      {/* Conversation List (hidden on mobile when viewing chat) */}
      <div className="hidden lg:block w-80 xl:w-96 border-r border-gray-200">
        <ConversationList activeConversationId={conversationId} />
      </div>

      {/* Chat Window */}
      <div className="flex-1">
        <ChatWindow
          conversationId={conversationId}
          currentStudent={{
            id: profile.id,
            name: profile.name,
          }}
          otherStudent={otherStudent}
        />
      </div>
    </div>
  )
}
