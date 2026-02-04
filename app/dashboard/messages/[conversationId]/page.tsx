// app/dashboard/messages/[conversationId]/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ConversationList } from "@/components/messaging/ConversationList"
import { ChatWindow } from "@/components/messaging/ChatWindow"
import { useMyProfile } from "@/hooks/student/useMyProfile"
import { useRealtimeConversationUpdates } from "@/hooks/messaging/useRealtimeMessages"

interface ConversationData {
  id: string
  studentAId: string
  studentBId: string
  studentA: {
    id: string
    name: string
    profilePicture: string | null
  }
  studentB: {
    id: string
    name: string
    profilePicture: string | null
  }
}

export default function ConversationPage() {
  const params = useParams()
  const router = useRouter()
  const conversationId = params.conversationId as string

  const { profile, isLoading: profileLoading } = useMyProfile()
  const [conversation, setConversation] = useState<ConversationData | null>(null)
  const [isLoadingConversation, setIsLoadingConversation] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Subscribe to realtime updates for conversation list
  useRealtimeConversationUpdates(profile?.id || null)

  // Fetch conversation details
  useEffect(() => {
    async function fetchConversation() {
      try {
        setIsLoadingConversation(true)
        setError(null)

        const response = await fetch(
          `/api/messaging/get-messages?conversationId=${conversationId}&limit=1`
        )

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || "Failed to fetch conversation")
        }

        // We need to get conversation details - let's make another call
        const convResponse = await fetch("/api/messaging/get-conversations")
        if (!convResponse.ok) {
          throw new Error("Failed to fetch conversation details")
        }

        const convData = await convResponse.json()
        const conv = convData.conversations.find(
          (c: { id: string }) => c.id === conversationId
        )

        if (!conv) {
          throw new Error("Conversation not found")
        }

        // Reconstruct conversation data from the list format
        setConversation({
          id: conv.id,
          studentAId: profile?.id === conv.otherStudent.id ? "other" : profile?.id || "",
          studentBId: conv.otherStudent.id,
          studentA: {
            id: profile?.id || "",
            name: profile?.name || "",
            profilePicture: profile?.profilePicture || null,
          },
          studentB: conv.otherStudent,
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong")
      } finally {
        setIsLoadingConversation(false)
      }
    }

    if (conversationId && profile) {
      fetchConversation()
    }
  }, [conversationId, profile])

  if (profileLoading || isLoadingConversation) {
    return (
      <div className="h-[calc(100vh-4rem)] bg-white flex">
        {/* Conversation List skeleton */}
        <div className="hidden lg:block w-80 xl:w-96 border-r border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="p-4 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse" />
                <div className="flex-1">
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-3 w-32 bg-gray-100 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
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

  if (error) {
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
            <p className="text-gray-500 text-sm mb-4">{error}</p>
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

  if (!conversation || !profile) {
    return null
  }

  // Determine the other student in the conversation
  const otherStudent = conversation.studentB

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
