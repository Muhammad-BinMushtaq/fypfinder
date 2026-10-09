// components/messaging/ConversationList.tsx
"use client"

import Link from "next/link"
import { useState } from "react"
import { UserPlus, Search, ArrowLeft } from "lucide-react"
import { ConversationItem } from "./ConversationItem"
import { useConversations } from "@/hooks/messaging/useConversations"
import { useReceivedPartnerRequests } from "@/hooks/request/usePartnerRequests"
import { useReceivedMessageRequests } from "@/hooks/request/useMessageRequests"

interface ConversationListProps {
  activeConversationId?: string
}

export function ConversationList({ activeConversationId }: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const { conversations, isLoading, isError } = useConversations()
  const { data: partnerReqs } = useReceivedPartnerRequests()
  const { data: messageReqs } = useReceivedMessageRequests()
  const pendingPartnerCount = partnerReqs?.filter((r) => r.status === "PENDING").length ?? 0
  const pendingMessageCount = messageReqs?.filter((r) => r.status === "PENDING").length ?? 0
  const totalPendingRequests = pendingPartnerCount + pendingMessageCount

  const filteredConversations = conversations.filter((c) =>
    (c.otherStudent?.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-slate-700">
          <div className="h-6 w-24 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
        </div>
        <div className="flex-1 overflow-y-auto">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-slate-700 animate-pulse" />
              <div className="flex-1">
                <div className="h-4 w-24 bg-gray-200 dark:bg-slate-700 rounded animate-pulse mb-2" />
                <div className="h-3 w-32 bg-gray-100 dark:bg-slate-600 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg
              className="w-6 h-6 text-red-500 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Failed to load conversations</p>
        </div>
      </div>
    )
  }

  if (conversations.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <div className="px-4 pt-3 pb-2 border-b border-gray-100 dark:border-slate-800">
          <Link
            href="/dashboard/discovery"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors py-0.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Discovery
          </Link>
        </div>
        <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Messages</h2>
          <Link
            href="/dashboard/requests"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50/90 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors text-xs font-semibold shadow-2xs"
            title="View partner and message requests"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Requests</span>
            {totalPendingRequests > 0 && (
              <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">
                {totalPendingRequests > 9 ? "9+" : totalPendingRequests}
              </span>
            )}
          </Link>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-400 dark:text-gray-500"
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
            <h3 className="text-gray-700 dark:text-gray-200 font-medium mb-1">No conversations</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Start chatting with other students!
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 pt-3 pb-2 border-b border-gray-100 dark:border-slate-800">
        <Link
          href="/dashboard/discovery"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors py-0.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Discovery
        </Link>
      </div>
      <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Messages</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {conversations.length} conversation{conversations.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/dashboard/requests"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50/90 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors text-xs font-semibold shadow-2xs"
          title="View partner and message requests"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Requests</span>
          {totalPendingRequests > 0 && (
            <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">
              {totalPendingRequests > 9 ? "9+" : totalPendingRequests}
            </span>
          )}
        </Link>
      </div>

      {conversations.length > 2 && (
        <div className="px-3 py-2 border-b border-gray-100 dark:border-slate-800">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Filter by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-xs text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white"
            />
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-6">No matching conversations</p>
        ) : (
          filteredConversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              isActive={conversation.id === activeConversationId}
            />
          ))
        )}
      </div>
    </div>
  )
}
