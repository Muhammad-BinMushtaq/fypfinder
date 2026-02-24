"use client"

import { ConversationList } from "@/components/messaging/ConversationList"
import { useMyProfile } from "@/hooks/student/useMyProfile"
import { MessageSquare } from "lucide-react"

export default function MessagesPage() {
  const { isLoading: profileLoading } = useMyProfile()

  if (profileLoading) {
    return (
      <div className="h-[calc(100dvh-4rem)] bg-white dark:bg-slate-900">
        <div className="h-full flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-gray-900 dark:border-white border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100dvh-4rem)] bg-white dark:bg-slate-900 flex">
      {/* Conversation List */}
      <div className="w-full lg:w-80 xl:w-96 border-r border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-y-auto">
        <ConversationList />
      </div>

      {/* Empty state (desktop only) */}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-gray-50 dark:bg-slate-800">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-10 h-10 text-gray-400 dark:text-gray-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">
            Your Messages
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-sm">
            Select a conversation from the list to start chatting
          </p>
        </div>
      </div>
    </div>
  )
}
