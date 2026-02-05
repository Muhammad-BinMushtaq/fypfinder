// components/admin/ConversationList.tsx
"use client"

import { useState } from "react"
import Link from "next/link"
import { MessageSquare, User, ChevronRight, Inbox, Loader2 } from "lucide-react"
import { useAdminConversations, type AdminConversation } from "@/hooks/admin"
import { formatDistanceToNow } from "date-fns"

export function ConversationList() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const { data, isLoading, isError } = useAdminConversations(page)

  const conversations = data?.data || []
  const totalPages = data?.totalPages || 1
  const totalCount = data?.total || 0

  // Client-side search filter
  const filteredConversations = search
    ? conversations.filter(
        (conv) =>
          conv.studentA.name.toLowerCase().includes(search.toLowerCase()) ||
          conv.studentB.name.toLowerCase().includes(search.toLowerCase()) ||
          conv.studentA.email.toLowerCase().includes(search.toLowerCase()) ||
          conv.studentB.email.toLowerCase().includes(search.toLowerCase())
      )
    : conversations

  return (
    <div className="flex h-full flex-col">
      {/* Stats Bar */}
      <div className="mb-4 flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
            <MessageSquare className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{totalCount}</p>
            <p className="text-sm text-slate-500">Total Conversations</p>
          </div>
        </div>
        <p className="text-sm text-slate-500">
          Showing {filteredConversations.length} {search && "matching"} conversation{filteredConversations.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto rounded-xl border border-slate-200 bg-white">
        {isLoading ? (
          <div className="flex h-full items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="mx-auto h-10 w-10 animate-spin text-purple-600" />
              <p className="mt-3 text-sm text-slate-500">Loading conversations...</p>
            </div>
          </div>
        ) : isError ? (
          <div className="flex h-full items-center justify-center py-20">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <MessageSquare className="h-8 w-8 text-red-400" />
              </div>
              <p className="mt-3 font-medium text-slate-700">Failed to load conversations</p>
              <p className="text-sm text-slate-500">Please try refreshing the page</p>
            </div>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex h-full items-center justify-center py-20">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <Inbox className="h-8 w-8 text-slate-400" />
              </div>
              <p className="mt-3 font-medium text-slate-700">
                {search ? "No conversations match your search" : "No conversations yet"}
              </p>
              <p className="text-sm text-slate-500">
                {search ? "Try a different search term" : "Conversations will appear here when students start chatting"}
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredConversations.map((conversation) => (
              <ConversationItem key={conversation.id} conversation={conversation} />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white p-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
          >
            Previous
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + 1
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`h-9 w-9 rounded-lg text-sm font-medium transition-colors ${
                    page === pageNum
                      ? "bg-purple-600 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {pageNum}
                </button>
              )
            })}
          </div>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

// Individual Conversation Item
interface ConversationItemProps {
  conversation: AdminConversation
}

function ConversationItem({ conversation }: ConversationItemProps) {
  const { studentA, studentB, lastMessage, messageCount, createdAt } = conversation

  return (
    <Link
      href={`/admin/messages/${conversation.id}`}
      className="group flex items-center gap-4 p-4 transition-all hover:bg-slate-50"
    >
      {/* Participants */}
      <div className="flex items-center">
        {/* Student A Avatar */}
        <div className="relative">
          {studentA.profilePicture ? (
            <img
              src={studentA.profilePicture}
              alt={studentA.name}
              className="h-11 w-11 rounded-full object-cover ring-2 ring-white shadow-sm"
            />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 ring-2 ring-white shadow-sm">
              <span className="text-sm font-bold text-white">{studentA.name.charAt(0)}</span>
            </div>
          )}
        </div>

        {/* Student B Avatar (overlapping) */}
        <div className="relative -ml-3">
          {studentB.profilePicture ? (
            <img
              src={studentB.profilePicture}
              alt={studentB.name}
              className="h-11 w-11 rounded-full object-cover ring-2 ring-white shadow-sm"
            />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 ring-2 ring-white shadow-sm">
              <span className="text-sm font-bold text-white">{studentB.name.charAt(0)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Conversation Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-slate-900 truncate">
            {studentA.name}
          </p>
          <span className="text-slate-300">•</span>
          <p className="font-semibold text-slate-900 truncate">
            {studentB.name}
          </p>
        </div>
        
        {lastMessage ? (
          <p className="mt-1 truncate text-sm text-slate-500">
            {lastMessage.content}
          </p>
        ) : (
          <p className="mt-1 text-sm text-slate-400 italic">No messages yet</p>
        )}
      </div>

      {/* Meta Info */}
      <div className="flex flex-col items-end gap-2 text-right">
        <span className="text-xs font-medium text-slate-400">
          {formatDistanceToNow(new Date(lastMessage?.createdAt || createdAt), { addSuffix: true })}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-2.5 py-1 text-xs font-medium text-purple-700">
          <MessageSquare className="h-3 w-3" />
          {messageCount}
        </span>
      </div>

      {/* Arrow */}
      <ChevronRight className="h-5 w-5 text-slate-300 transition-colors group-hover:text-purple-500" />
    </Link>
  )
}
