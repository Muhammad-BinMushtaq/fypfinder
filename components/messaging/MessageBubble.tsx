// components/messaging/MessageBubble.tsx
"use client"

import { useState, useRef, useEffect } from "react"
import { formatDistanceToNow } from "date-fns"
import { Pencil, Check, X } from "lucide-react"
import type { Message } from "@/hooks/messaging/useMessages"
import clientLogger from "@/lib/client-logger"

/** Messages are editable only within 15 minutes of creation. */
const EDIT_WINDOW_MS = 15 * 60 * 1000

interface MessageBubbleProps {
  message: Message
  isOwn: boolean
  onEdit?: (messageId: string, newContent: string) => void
  isEditing?: boolean
}

export function MessageBubble({ message, isOwn, onEdit, isEditing: externalEditing }: MessageBubbleProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(message.content)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Check if message is still within the editable window
  const isWithinEditWindow = () => {
    if (message.isOptimistic) return false
    try {
      const created = new Date(message.createdAt).getTime()
      return Date.now() - created < EDIT_WINDOW_MS
    } catch {
      return false
    }
  }

  const canEdit = isOwn && !message.isOptimistic && isWithinEditWindow()

  // Focus textarea when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.setSelectionRange(editContent.length, editContent.length)
    }
  }, [isEditing]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleStartEdit = () => {
    setEditContent(message.content)
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditContent(message.content)
  }

  const handleSaveEdit = () => {
    const trimmed = editContent.trim()
    if (!trimmed || trimmed === message.content) {
      handleCancelEdit()
      return
    }
    onEdit?.(message.id, trimmed)
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSaveEdit()
    }
    if (e.key === "Escape") {
      handleCancelEdit()
    }
  }

  // Safely format time with fallback
  let formattedTime = "just now"
  try {
    const date = new Date(message.createdAt)
    if (!isNaN(date.getTime())) {
      formattedTime = formatDistanceToNow(date, { addSuffix: true })
    }
  } catch (error) {
    clientLogger.warn("Invalid date for message:", message.id)
  }

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-3 group/msg`}>
      <div
        className={`max-w-[70%] ${
          isOwn
            ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
            : "bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white"
        } rounded-2xl px-4 py-3 ${
          message.isOptimistic ? "opacity-70" : "opacity-100"
        } relative`}
      >
        {/* Sender name for received messages */}
        {!isOwn && (
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            {message.sender.name}
          </p>
        )}

        {/* Message content or edit form */}
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              ref={inputRef}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={1000}
              rows={2}
              className="w-full text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg px-3 py-2 resize-none border border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <div className="flex items-center gap-1.5 justify-end">
              <button
                onClick={handleCancelEdit}
                className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                title="Cancel (Esc)"
              >
                <X className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
              </button>
              <button
                onClick={handleSaveEdit}
                className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                title="Save (Enter)"
              >
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        )}

        {/* Timestamp, edited badge, and status */}
        {!isEditing && (
          <div
            className={`flex items-center gap-1 mt-1 ${
              isOwn ? "justify-end" : "justify-start"
            }`}
          >
            <span
              className={`text-xs ${
                isOwn ? "text-white/70 dark:text-gray-500" : "text-gray-400 dark:text-gray-500"
              }`}
            >
              {message.isOptimistic ? "Sending..." : formattedTime}
            </span>

            {message.isEdited && (
              <span
                className={`text-xs italic ${
                  isOwn ? "text-white/50 dark:text-gray-500" : "text-gray-400 dark:text-gray-500"
                }`}
              >
                · edited
              </span>
            )}

            {/* Read indicator for own messages */}
            {isOwn && !message.isOptimistic && (
              <span className="text-xs text-white/70 dark:text-gray-500">
                {message.isRead ? "✓✓" : "✓"}
              </span>
            )}
          </div>
        )}

        {/* Edit button (shown on hover for own editable messages) */}
        {canEdit && !isEditing && (
          <button
            onClick={handleStartEdit}
            className={`absolute -top-2 ${isOwn ? "-left-8" : "-right-8"} opacity-0 group-hover/msg:opacity-100 transition-opacity p-1.5 rounded-full bg-white dark:bg-slate-700 shadow-md border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600`}
            title="Edit message"
          >
            <Pencil className="w-3 h-3 text-gray-500 dark:text-gray-400" />
          </button>
        )}
      </div>
    </div>
  )
}
