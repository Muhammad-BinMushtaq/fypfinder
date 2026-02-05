// app/admin/(authenticated)/messages/[conversationId]/page.tsx
"use client"

import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { MessageSquare, Loader2, AlertCircle, ArrowLeft, Eye } from "lucide-react"
import Link from "next/link"
import { ConversationViewer } from "@/components/admin/ConversationViewer"
import { getAdminConversations, type AdminConversation } from "@/services/admin.service"

export default function AdminConversationViewPage() {
  const params = useParams()
  const conversationId = params.conversationId as string

  // Get the conversation details
  // This is a workaround - we fetch all conversations and find the one we need
  // In a real app, you'd have a dedicated endpoint for single conversation details
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "conversation", conversationId],
    queryFn: async () => {
      // Fetch conversations to find the one matching our ID
      const result = await getAdminConversations(1, 100)
      const conversation = result.data.find((c: AdminConversation) => c.id === conversationId)
      if (!conversation) {
        throw new Error("Conversation not found")
      }
      return conversation
    },
    enabled: !!conversationId,
  })

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-lg">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
          <p className="mt-4 text-sm font-medium text-slate-600">Loading conversation...</p>
        </div>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-10 w-10 text-red-500" />
          </div>
          <h2 className="mt-4 text-xl font-semibold text-slate-900">Conversation Not Found</h2>
          <p className="mt-2 text-sm text-slate-500">
            This conversation may have been deleted or you don&apos;t have access to view it.
          </p>
          <Link
            href="/admin/messages"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-500/30 transition-all hover:shadow-xl"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Messages
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Header Bar */}
      <div className="flex-shrink-0 border-b border-slate-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/messages"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-md">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-slate-900">
                  {data.studentA.name} & {data.studentB.name}
                </h1>
                <p className="text-sm text-slate-500">
                  Conversation • {data.messageCount || 0} messages
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm">
            <Eye className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-amber-700">Read-only</span>
          </div>
        </div>
      </div>

      {/* Conversation Viewer */}
      <div className="flex-1 overflow-hidden">
        <ConversationViewer
          conversationId={conversationId}
          studentA={data.studentA}
          studentB={data.studentB}
        />
      </div>
    </div>
  )
}
