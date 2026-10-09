// app/admin/(authenticated)/messages/[conversationId]/page.tsx
"use client"

import { useParams } from "next/navigation"
import { MessageSquare, Loader2, AlertCircle, ArrowLeft, Eye, Shield } from "lucide-react"
import Link from "next/link"
import { ConversationViewer } from "@/components/admin/ConversationViewer"
import { useAdminConversationDetails } from "@/hooks/admin"

export default function AdminConversationViewPage() {
  const params = useParams()
  const conversationId = params.conversationId as string

  // Use dedicated single-conversation endpoint hook
  const { data: conversation, isLoading, isError } = useAdminConversationDetails(conversationId)

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center p-6">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-slate-400 dark:text-slate-500" />
          <p className="mt-3 text-xs font-medium text-slate-500 dark:text-slate-400">Loading conversation...</p>
        </div>
      </div>
    )
  }

  if (isError || !conversation) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center p-6">
        <div className="max-w-md text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 dark:bg-rose-950/30 text-rose-500">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h2 className="mt-3 text-base font-bold text-slate-900 dark:text-white">Conversation Not Found</h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            This conversation may have been deleted or is not accessible.
          </p>
          <Link
            href="/admin/messages"
            className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-slate-900 dark:bg-white px-4 py-2 text-xs font-semibold text-white dark:text-slate-900 shadow-xs hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Conversations
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-5rem)] flex-col p-4 sm:p-6 lg:p-8 space-y-4 max-w-7xl mx-auto">
      {/* Unified Minimal Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/messages"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            title="Back to conversations list"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>

          {/* Participant Information */}
          <div className="flex items-center gap-3">
            <div className="flex items-center shrink-0">
              {/* Student A Avatar */}
              <div className="relative">
                {conversation.studentA.profilePicture ? (
                  <img
                    src={conversation.studentA.profilePicture}
                    alt={conversation.studentA.name}
                    className="h-9 w-9 rounded-full object-cover ring-2 ring-white dark:ring-slate-900"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs ring-2 ring-white dark:ring-slate-900">
                    {conversation.studentA.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Student B Avatar */}
              <div className="relative -ml-2.5">
                {conversation.studentB.profilePicture ? (
                  <img
                    src={conversation.studentB.profilePicture}
                    alt={conversation.studentB.name}
                    className="h-9 w-9 rounded-full object-cover ring-2 ring-white dark:ring-slate-900"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold text-xs ring-2 ring-white dark:ring-slate-900">
                    {conversation.studentB.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-semibold text-sm text-slate-900 dark:text-white">
                  {conversation.studentA.name}
                </span>
                <span className="text-slate-400 text-xs">&</span>
                <span className="font-semibold text-sm text-slate-900 dark:text-white">
                  {conversation.studentB.name}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {conversation.messageCount || 0} messages exchanged
              </p>
            </div>
          </div>
        </div>

        {/* Status Badges */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-700 dark:text-amber-400">
            <Eye className="h-3.5 w-3.5" />
            <span>Read-Only Mode</span>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 shadow-xs">
            <Shield className="h-3.5 w-3.5 text-slate-400" />
            <span>Audit</span>
          </div>
        </div>
      </div>

      {/* Main Conversation Body */}
      <div className="flex-1 overflow-hidden">
        <ConversationViewer
          conversationId={conversationId}
          studentA={conversation.studentA}
          studentB={conversation.studentB}
        />
      </div>
    </div>
  )
}

