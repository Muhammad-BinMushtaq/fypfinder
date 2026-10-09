// components/admin/ConversationViewer.tsx
"use client"

import { useState } from "react"
import { MessageSquare, ArrowLeft, ArrowRight, Loader2, Info } from "lucide-react"
import { useAdminMessages, type AdminMessage } from "@/hooks/admin"
import { formatDistanceToNow, format } from "date-fns"

interface ConversationViewerProps {
  conversationId: string
  studentA: {
    id: string
    name: string
    email: string
    profilePicture: string | null
  }
  studentB: {
    id: string
    name: string
    email: string
    profilePicture: string | null
  }
}

export function ConversationViewer({ 
  conversationId, 
  studentA, 
  studentB 
}: ConversationViewerProps) {
  const [page, setPage] = useState(1)
  const { data, isLoading, isError } = useAdminMessages(conversationId, page, 50)

  const messages = data?.data || []
  const totalPages = data?.totalPages || 1

  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
      {/* Scrollable Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50 dark:bg-slate-950/40">
        {isLoading ? (
          <div className="flex h-full min-h-[350px] items-center justify-center">
            <div className="text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-slate-400 dark:text-slate-500" />
              <p className="mt-3 text-xs font-medium text-slate-500 dark:text-slate-400">Loading conversation thread...</p>
            </div>
          </div>
        ) : isError ? (
          <div className="flex h-full min-h-[350px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 dark:bg-rose-950/30 text-rose-500">
                <MessageSquare className="h-6 w-6" />
              </div>
              <p className="mt-3 text-sm font-semibold text-slate-800 dark:text-slate-200">Failed to load messages</p>
              <p className="mt-1 text-xs text-slate-400">Please try refreshing the page</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full min-h-[350px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400">
                <MessageSquare className="h-6 w-6" />
              </div>
              <p className="mt-3 text-sm font-semibold text-slate-800 dark:text-slate-200">No messages in this conversation</p>
              <p className="mt-1 text-xs text-slate-400">Students have not exchanged messages yet</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 max-w-3xl mx-auto">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isFromStudentA={message.senderId === studentA.id}
                studentA={studentA}
                studentB={studentB}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2.5">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Page <span className="font-semibold text-slate-900 dark:text-white">{page}</span> of{" "}
            <span className="font-semibold text-slate-900 dark:text-white">{totalPages}</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-800 px-2.5 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Previous</span>
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-800 px-2.5 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40"
            >
              <span>Next</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Administrative Read-only Disclaimer */}
      <div className="flex items-center justify-center gap-2 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 px-4 py-2 text-center text-xs text-slate-500 dark:text-slate-400">
        <Info className="h-3.5 w-3.5 text-slate-400" />
        <span>Read-only administrative monitor. In compliance with student data privacy policies.</span>
      </div>
    </div>
  )
}

// Message Bubble Component
interface MessageBubbleProps {
  message: AdminMessage
  isFromStudentA: boolean
  studentA: { name: string; profilePicture: string | null }
  studentB: { name: string; profilePicture: string | null }
}

function MessageBubble({ message, isFromStudentA, studentA, studentB }: MessageBubbleProps) {
  const sender = isFromStudentA ? studentA : studentB

  return (
    <div className={`flex gap-3 ${isFromStudentA ? "justify-start" : "justify-end"}`}>
      {/* Student A Avatar (Left) */}
      {isFromStudentA && (
        <div className="shrink-0 mt-0.5">
          {sender.profilePicture ? (
            <img
              src={sender.profilePicture}
              alt={sender.name}
              className="h-8 w-8 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold ring-1 ring-slate-200 dark:ring-slate-700">
              {sender.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      )}

      {/* Bubble Content */}
      <div className={`max-w-[75%] sm:max-w-[65%] space-y-1 ${isFromStudentA ? "text-left" : "text-right"}`}>
        <div className="flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500">
          <span className="font-medium text-slate-700 dark:text-slate-300">{sender.name}</span>
          <span>•</span>
          <span title={format(new Date(message.createdAt), "PPpp")}>
            {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
          </span>
        </div>

        <div
          className={`inline-block rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed text-left break-words shadow-xs ${
            isFromStudentA
              ? "rounded-tl-xs bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-800 dark:text-slate-100"
              : "rounded-tr-xs bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-medium"
          }`}
        >
          {message.content}
        </div>
      </div>

      {/* Student B Avatar (Right) */}
      {!isFromStudentA && (
        <div className="shrink-0 mt-0.5">
          {sender.profilePicture ? (
            <img
              src={sender.profilePicture}
              alt={sender.name}
              className="h-8 w-8 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs font-bold ring-1 ring-slate-200 dark:ring-slate-700">
              {sender.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

