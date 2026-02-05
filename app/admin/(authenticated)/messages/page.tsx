// app/admin/(authenticated)/messages/page.tsx
"use client"

import { MessageSquare, Eye, Shield, Search } from "lucide-react"
import { ConversationList } from "@/components/admin/ConversationList"

export default function AdminMessagesPage() {
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-slate-200 bg-white p-6 lg:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg shadow-purple-500/30">
              <MessageSquare className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Message Viewer</h1>
              <p className="text-sm text-slate-500">
                Read-only access to all student conversations
              </p>
            </div>
          </div>

          {/* Read-only badge & Info */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm">
              <Eye className="h-4 w-4 text-amber-600" />
              <span className="font-medium text-amber-700">Read-only Mode</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm">
              <Shield className="h-4 w-4 text-slate-500" />
              <span className="font-medium text-slate-600">Admin View</span>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search conversations by participant name..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-hidden bg-slate-50 p-6 lg:p-8">
        <ConversationList />
      </div>
    </div>
  )
}
