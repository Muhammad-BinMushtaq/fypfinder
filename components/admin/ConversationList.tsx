// components/admin/ConversationList.tsx
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { MessageSquare, ChevronRight, Inbox, Loader2, Search, ArrowLeft, ArrowRight } from "lucide-react"
import { useAdminConversations, type AdminConversation } from "@/hooks/admin"
import { formatDistanceToNow } from "date-fns"

interface ConversationListProps {
  externalSearch?: string
}

export function ConversationList({ externalSearch }: ConversationListProps) {
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")

  // Sync external search if provided
  useEffect(() => {
    if (externalSearch !== undefined) {
      setSearchInput(externalSearch)
    }
  }, [externalSearch])

  // Debounce search query by 350ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput.trim())
      setPage(1)
    }, 350)
    return () => clearTimeout(handler)
  }, [searchInput])

  const { data, isLoading, isError } = useAdminConversations(page, 15, debouncedSearch)

  const conversations = data?.data || []
  const totalPages = data?.totalPages || 1
  const totalCount = data?.total || 0

  // Sliding window pagination numbers
  const getPageNumbers = () => {
    const pages: (number | "...")[] = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (page > 3) pages.push("...")
      const start = Math.max(2, page - 1)
      const end = Math.min(totalPages - 1, page + 1)
      for (let i = start; i <= end; i++) pages.push(i)
      if (page < totalPages - 2) pages.push("...")
      pages.push(totalPages)
    }
    return pages
  }

  return (
    <div className="flex h-full flex-col space-y-4">
      {/* Control / Stats Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by student name or email..."
            className="h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 pl-10 pr-4 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-slate-400 dark:focus:border-slate-600 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-400 transition-all"
          />
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            <span>
              Total: <strong className="font-semibold text-slate-900 dark:text-white">{totalCount}</strong>
            </span>
          </div>
          {debouncedSearch && (
            <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-slate-600 dark:text-slate-300">
              Filtered
            </span>
          )}
        </div>
      </div>

      {/* Conversation List Surface */}
      <div className="flex-1 overflow-y-auto rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        {isLoading ? (
          <div className="flex h-full min-h-[300px] items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-slate-400 dark:text-slate-500" />
              <p className="mt-3 text-xs font-medium text-slate-500 dark:text-slate-400">Loading conversations...</p>
            </div>
          </div>
        ) : isError ? (
          <div className="flex h-full min-h-[300px] items-center justify-center py-20">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 dark:bg-rose-950/30 text-rose-500">
                <MessageSquare className="h-6 w-6" />
              </div>
              <p className="mt-3 text-sm font-semibold text-slate-800 dark:text-slate-200">Failed to load conversations</p>
              <p className="mt-1 text-xs text-slate-400">Please check your network and refresh the page</p>
            </div>
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex h-full min-h-[300px] items-center justify-center py-20">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400">
                <Inbox className="h-6 w-6" />
              </div>
              <p className="mt-3 text-sm font-semibold text-slate-800 dark:text-slate-200">
                {debouncedSearch ? "No matching conversations" : "No conversations recorded yet"}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                {debouncedSearch ? "Try adjusting your search criteria" : "Conversations between students will appear here"}
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {conversations.map((conversation) => (
              <ConversationItem key={conversation.id} conversation={conversation} />
            ))}
          </div>
        )}
      </div>

      {/* Sliding Window Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 shadow-xs">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Page <span className="font-semibold text-slate-900 dark:text-white">{page}</span> of{" "}
            <span className="font-semibold text-slate-900 dark:text-white">{totalPages}</span>
          </p>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-800 px-2.5 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Previous</span>
            </button>

            <div className="flex items-center gap-1">
              {getPageNumbers().map((pageNum, idx) =>
                pageNum === "..." ? (
                  <span key={`ellipsis-${idx}`} className="px-2 text-xs text-slate-400">
                    ...
                  </span>
                ) : (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`h-8 min-w-[32px] rounded-lg px-2 text-xs font-medium transition-colors ${
                      page === pageNum
                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              )}
            </div>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-800 px-2.5 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40"
            >
              <span className="hidden sm:inline">Next</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
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
      className="group flex items-center gap-4 p-4 transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/50"
    >
      {/* Participant Avatars */}
      <div className="flex items-center shrink-0">
        <div className="relative">
          {studentA.profilePicture ? (
            <img
              src={studentA.profilePicture}
              alt={studentA.name}
              className="h-10 w-10 rounded-full object-cover ring-2 ring-white dark:ring-slate-900"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs ring-2 ring-white dark:ring-slate-900">
              {studentA.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="relative -ml-3">
          {studentB.profilePicture ? (
            <img
              src={studentB.profilePicture}
              alt={studentB.name}
              className="h-10 w-10 rounded-full object-cover ring-2 ring-white dark:ring-slate-900"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold text-xs ring-2 ring-white dark:ring-slate-900">
              {studentB.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </div>

      {/* Conversation Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">
            {studentA.name}
          </p>
          <span className="text-slate-300 dark:text-slate-600 text-xs">&</span>
          <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">
            {studentB.name}
          </p>
        </div>

        {lastMessage ? (
          <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
            {lastMessage.content}
          </p>
        ) : (
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500 italic">No messages sent yet</p>
        )}
      </div>

      {/* Meta Info */}
      <div className="flex flex-col items-end gap-1.5 shrink-0 text-right">
        <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
          {formatDistanceToNow(new Date(lastMessage?.createdAt || createdAt), { addSuffix: true })}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:text-slate-300">
          <MessageSquare className="h-3 w-3" />
          {messageCount}
        </span>
      </div>

      {/* Arrow */}
      <ChevronRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-0.5" />
    </Link>
  )
}

