// app/admin/(authenticated)/messages/page.tsx
"use client"

import { MessageSquare, Shield, Eye } from "lucide-react"
import { ConversationList } from "@/components/admin/ConversationList"

export default function AdminMessagesPage() {
  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Student Conversations
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Read-only administrative audit of student peer-to-peer communications
            </p>
          </div>
        </div>

        {/* Security & Audit Badges */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-700 dark:text-amber-400">
            <Eye className="h-3.5 w-3.5" />
            <span>Read-Only</span>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 shadow-xs">
            <Shield className="h-3.5 w-3.5 text-slate-400" />
            <span>Audit Logged</span>
          </div>
        </div>
      </div>

      {/* Main Conversation List */}
      <ConversationList />
    </div>
  )
}

