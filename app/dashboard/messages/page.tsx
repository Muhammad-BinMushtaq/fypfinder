"use client"

import { ConversationList } from "@/components/messaging/ConversationList"
import { useMyProfile } from "@/hooks/student/useMyProfile"

export default function MessagesPage() {
  const { profile, isLoading: profileLoading } = useMyProfile()

  if (profileLoading) {
    return (
      <div className="h-[calc(100vh-4rem)] bg-white">
        <div className="h-full flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 text-sm">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-4rem)] bg-white flex">
      {/* Conversation List */}
      <div className="w-full lg:w-80 xl:w-96 border-r border-gray-200 bg-white">
        <ConversationList />
      </div>

      {/* Empty state (desktop only) */}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-10 h-10 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Your Messages
          </h2>
          <p className="text-gray-500 max-w-sm">
            Select a conversation from the list to start chatting, or send a
            message request to a student you’d like to connect with.
          </p>
        </div>
      </div>
    </div>
  )
}
