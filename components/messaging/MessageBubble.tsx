// components/messaging/MessageBubble.tsx
"use client"

import { formatDistanceToNow } from "date-fns"
import type { Message } from "@/hooks/messaging/useMessages"

interface MessageBubbleProps {
  message: Message
  isOwn: boolean
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  // Safely format time with fallback
  let formattedTime = "just now"
  try {
    const date = new Date(message.createdAt)
    if (!isNaN(date.getTime())) {
      formattedTime = formatDistanceToNow(date, { addSuffix: true })
    }
  } catch (error) {
    console.warn("Invalid date for message:", message.id)
  }

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-3`}>
      <div
        className={`max-w-[70%] ${
          isOwn
            ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
            : "bg-gray-100 text-gray-900"
        } rounded-2xl px-4 py-3 ${
          message.isOptimistic ? "opacity-70" : "opacity-100"
        }`}
      >
        {/* Sender name for received messages */}
        {!isOwn && (
          <p className="text-xs font-medium text-gray-500 mb-1">
            {message.sender.name}
          </p>
        )}

        {/* Message content */}
        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>

        {/* Timestamp and status */}
        <div
          className={`flex items-center gap-1 mt-1 ${
            isOwn ? "justify-end" : "justify-start"
          }`}
        >
          <span
            className={`text-xs ${
              isOwn ? "text-white/70" : "text-gray-400"
            }`}
          >
            {message.isOptimistic ? "Sending..." : formattedTime}
          </span>

          {/* Read indicator for own messages */}
          {isOwn && !message.isOptimistic && (
            <span className="text-xs text-white/70">
              {message.isRead ? "✓✓" : "✓"}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
