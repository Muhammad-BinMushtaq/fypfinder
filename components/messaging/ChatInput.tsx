// components/messaging/ChatInput.tsx
"use client"

import { useState, useRef, useCallback } from "react"

interface ChatInputProps {
  onSend: (content: string) => void
  isPending: boolean
  disabled?: boolean
}

export function ChatInput({ onSend, isPending, disabled = false }: ChatInputProps) {
  const [content, setContent] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault()

      const trimmedContent = content.trim()
      if (!trimmedContent || isPending || disabled) return

      onSend(trimmedContent)
      setContent("")

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto"
      }
    },
    [content, isPending, disabled, onSend]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        handleSubmit()
      }
    },
    [handleSubmit]
  )

  const handleInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value)

    // Auto-resize textarea
    const textarea = e.target
    textarea.style.height = "auto"
    textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`
  }, [])

  const charactersLeft = 1000 - content.length
  const isOverLimit = charactersLeft < 0

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-gray-200 bg-white px-4 py-3"
    >
      <div className="flex items-end gap-3">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            disabled={isPending || disabled}
            rows={1}
            className={`w-full resize-none rounded-2xl border ${
              isOverLimit ? "border-red-300" : "border-gray-200"
            } bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 ${
              isOverLimit ? "focus:ring-red-500" : "focus:ring-indigo-500"
            } focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed`}
            style={{ maxHeight: "150px" }}
          />

          {/* Character count */}
          {content.length > 800 && (
            <span
              className={`absolute bottom-2 right-3 text-xs ${
                isOverLimit ? "text-red-500" : "text-gray-400"
              }`}
            >
              {charactersLeft}
            </span>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending || disabled || !content.trim() || isOverLimit}
          className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white flex items-center justify-center hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          )}
        </button>
      </div>
    </form>
  )
}
