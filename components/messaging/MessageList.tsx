// components/messaging/MessageList.tsx
"use client"

import { useEffect, useRef, useLayoutEffect } from "react"
import { MessageBubble } from "./MessageBubble"
import type { Message } from "@/hooks/messaging/useMessages"

interface MessageListProps {
  messages: Message[]
  currentStudentId: string
  isLoading: boolean
}

export function MessageList({
  messages,
  currentStudentId,
  isLoading,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const prevMessagesLengthRef = useRef(0)
  const isNearBottomRef = useRef(true)

  // Check if user is near bottom (within 150px)
  const checkIfNearBottom = () => {
    if (!containerRef.current) return true
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current
    return scrollHeight - scrollTop - clientHeight < 150
  }

  // Track scroll position
  const handleScroll = () => {
    isNearBottomRef.current = checkIfNearBottom()
  }

  // Auto-scroll to bottom when new messages arrive (only if user is near bottom)
  useLayoutEffect(() => {
    const newMessagesCount = messages.length - prevMessagesLengthRef.current
    
    // Only auto-scroll if:
    // 1. New messages were added (not initial load)
    // 2. User is near the bottom
    // 3. OR the new message is from current user (always scroll for own messages)
    const shouldScroll = newMessagesCount > 0 && (
      isNearBottomRef.current ||
      (messages.length > 0 && messages[messages.length - 1]?.senderId === currentStudentId)
    )

    if (shouldScroll && bottomRef.current) {
      // Use requestAnimationFrame for smoother scrolling
      requestAnimationFrame(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" })
      })
    }

    prevMessagesLengthRef.current = messages.length
  }, [messages, currentStudentId])

  // Scroll to bottom on initial load
  useEffect(() => {
    if (!isLoading && messages.length > 0 && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "instant" })
    }
  }, [isLoading]) // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading messages...</p>
        </div>
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-gray-400"
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
          <h3 className="text-gray-700 font-medium mb-1">No messages yet</h3>
          <p className="text-gray-500 text-sm">
            Send a message to start the conversation!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto px-4 py-4"
    >
      {messages.map((message, index) => (
        <MessageBubble
          key={message.id || `msg-${index}`}
          message={message}
          isOwn={message.senderId === currentStudentId}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  )
}
