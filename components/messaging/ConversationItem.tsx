// components/messaging/ConversationItem.tsx
"use client"

import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import type { Conversation } from "@/hooks/messaging/useConversations"

interface ConversationItemProps {
  conversation: Conversation
  isActive: boolean
}

export function ConversationItem({ conversation, isActive }: ConversationItemProps) {
  const { otherStudent, lastMessage, unreadCount, updatedAt } = conversation

  const formattedTime = formatDistanceToNow(new Date(updatedAt), {
    addSuffix: false,
  })

  // Get initials for avatar
  const initials = otherStudent.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <Link href={`/dashboard/messages/${conversation.id}`}>
      <div
        className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer transition-colors ${
          isActive ? "bg-gray-100 dark:bg-slate-700 border-l-4 border-gray-900 dark:border-white" : ""
        }`}
      >
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {otherStudent.profilePicture ? (
            <img
              src={otherStudent.profilePicture}
              alt={otherStudent.name}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-900 dark:bg-white flex items-center justify-center text-white dark:text-gray-900 font-semibold text-sm">
              {initials}
            </div>
          )}

          {/* Unread indicator dot */}
          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
              {unreadCount > 9 ? "9+" : unreadCount}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3
              className={`text-sm font-semibold truncate ${
                unreadCount > 0 ? "text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300"
              }`}
            >
              {otherStudent.name}
            </h3>
            <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0 ml-2">
              {formattedTime}
            </span>
          </div>

          {/* Last message preview */}
          {lastMessage ? (
            <p
              className={`text-sm truncate ${
                unreadCount > 0 ? "text-gray-800 dark:text-gray-200 font-medium" : "text-gray-500 dark:text-gray-400"
              }`}
            >
              {lastMessage.content}
            </p>
          ) : (
            <p className="text-sm text-gray-400 dark:text-gray-500 italic">No messages yet</p>
          )}
        </div>
      </div>
    </Link>
  )
}
