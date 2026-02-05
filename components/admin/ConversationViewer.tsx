// components/admin/ConversationViewer.tsx
"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { 
  ArrowLeft, 
  User, 
  MessageSquare,
  Calendar,
  Eye
} from "lucide-react"
import Link from "next/link"
import { useAdminMessages, type AdminMessage } from "@/hooks/admin"
import { formatDistanceToNow } from "date-fns"

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
  const { data, isLoading, isError } = useAdminMessages(conversationId, page)

  const messages = data?.data || []
  const totalPages = data?.totalPages || 1

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white p-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/messages"
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          
          <div className="flex flex-1 items-center gap-4">
            {/* Student A */}
            <div className="flex items-center gap-2">
              {studentA.profilePicture ? (
                <img
                  src={studentA.profilePicture}
                  alt={studentA.name}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
              )}
              <div>
                <p className="font-medium text-gray-900">{studentA.name}</p>
                <p className="text-xs text-gray-500">{studentA.email}</p>
              </div>
            </div>

            <MessageSquare className="h-5 w-5 text-gray-400" />

            {/* Student B */}
            <div className="flex items-center gap-2">
              {studentB.profilePicture ? (
                <img
                  src={studentB.profilePicture}
                  alt={studentB.name}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                  <User className="h-5 w-5 text-purple-600" />
                </div>
              )}
              <div>
                <p className="font-medium text-gray-900">{studentB.name}</p>
                <p className="text-xs text-gray-500">{studentB.email}</p>
              </div>
            </div>
          </div>

          {/* Read-only badge */}
          <div className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-sm text-gray-600">
            <Eye className="h-4 w-4" />
            Read-only
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          </div>
        ) : isError ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-gray-500">Failed to load messages</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-2 text-gray-500">No messages in this conversation</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 border-t border-gray-200 bg-white p-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Admin Notice */}
      <div className="border-t border-gray-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-700">
        <strong>Admin View:</strong> This is a read-only view of the conversation. You cannot send messages.
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
    <div className={`flex gap-3 ${isFromStudentA ? "" : "flex-row-reverse"}`}>
      {/* Avatar */}
      {sender.profilePicture ? (
        <img
          src={sender.profilePicture}
          alt={sender.name}
          className="h-8 w-8 rounded-full object-cover"
        />
      ) : (
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full ${
            isFromStudentA ? "bg-blue-100" : "bg-purple-100"
          }`}
        >
          <User className={`h-4 w-4 ${isFromStudentA ? "text-blue-600" : "text-purple-600"}`} />
        </div>
      )}

      {/* Message */}
      <div className={`max-w-[70%] ${isFromStudentA ? "" : "text-right"}`}>
        <div
          className={`inline-block rounded-2xl px-4 py-2 ${
            isFromStudentA
              ? "rounded-tl-none bg-white shadow-sm"
              : "rounded-tr-none bg-indigo-600 text-white"
          }`}
        >
          <p className="text-sm">{message.content}</p>
        </div>
        <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
          <span>{sender.name}</span>
          <span>•</span>
          <span>{formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}</span>
        </div>
      </div>
    </div>
  )
}
