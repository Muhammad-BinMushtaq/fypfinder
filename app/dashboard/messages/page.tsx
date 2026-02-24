"use client"

import { useState } from "react"
import { ConversationList } from "@/components/messaging/ConversationList"
import { useMyProfile } from "@/hooks/student/useMyProfile"
import { MessageSquare, Users, Mail, UserPlus } from "lucide-react"
import {
  useSentMessageRequests,
  useReceivedMessageRequests,
  useAcceptMessageRequest,
  useRejectMessageRequest,
} from "@/hooks/request/useMessageRequests"
import {
  useSentPartnerRequests,
  useReceivedPartnerRequests,
  useAcceptPartnerRequest,
  useRejectPartnerRequest,
} from "@/hooks/request/usePartnerRequests"
import { RequestList } from "@/components/request"
import Link from "next/link"

type MainTab = "chats" | "requests"
type RequestSubTab = "messages" | "partners"
type DirectionTab = "received" | "sent"

export default function MessagesPage() {
  const { profile, isLoading: profileLoading } = useMyProfile()
  const [mainTab, setMainTab] = useState<MainTab>("chats")
  const [requestSubTab, setRequestSubTab] = useState<RequestSubTab>("messages")
  const [directionTab, setDirectionTab] = useState<DirectionTab>("received")
  const [loadingRequestId, setLoadingRequestId] = useState<string | null>(null)

  // Message request queries
  const sentMessageQuery = useSentMessageRequests()
  const receivedMessageQuery = useReceivedMessageRequests()
  const acceptMessageMutation = useAcceptMessageRequest()
  const rejectMessageMutation = useRejectMessageRequest()

  // Partner request queries
  const sentPartnerQuery = useSentPartnerRequests()
  const receivedPartnerQuery = useReceivedPartnerRequests()
  const acceptPartnerMutation = useAcceptPartnerRequest()
  const rejectPartnerMutation = useRejectPartnerRequest()

  // Get pending counts
  const pendingMessageCount = receivedMessageQuery.data?.filter((r) => r.status === "PENDING").length || 0
  const pendingPartnerCount = receivedPartnerQuery.data?.filter((r) => r.status === "PENDING").length || 0
  const totalPendingRequests = pendingMessageCount + pendingPartnerCount

  // Handle accept/reject
  const handleAccept = async (requestId: string) => {
    setLoadingRequestId(requestId)
    try {
      if (requestSubTab === "messages") {
        await acceptMessageMutation.mutateAsync({ requestId })
      } else {
        await acceptPartnerMutation.mutateAsync({ requestId })
      }
    } finally {
      setLoadingRequestId(null)
    }
  }

  const handleReject = async (requestId: string) => {
    setLoadingRequestId(requestId)
    try {
      if (requestSubTab === "messages") {
        await rejectMessageMutation.mutateAsync({ requestId })
      } else {
        await rejectPartnerMutation.mutateAsync({ requestId })
      }
    } finally {
      setLoadingRequestId(null)
    }
  }

  // Current requests based on selection
  const currentRequests = requestSubTab === "messages"
    ? (directionTab === "sent" ? sentMessageQuery.data : receivedMessageQuery.data) || []
    : (directionTab === "sent" ? sentPartnerQuery.data : receivedPartnerQuery.data) || []

  const isLoadingRequests = requestSubTab === "messages"
    ? (directionTab === "sent" ? sentMessageQuery.isLoading : receivedMessageQuery.isLoading)
    : (directionTab === "sent" ? sentPartnerQuery.isLoading : receivedPartnerQuery.isLoading)

  if (profileLoading) {
    return (
      <div className="h-[calc(100dvh-4rem)] bg-white dark:bg-slate-900">
        <div className="h-full flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-gray-900 dark:border-white border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100dvh-4rem)] bg-white dark:bg-slate-900 flex flex-col">
      {/* Top Tabs */}
      <div className="border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4">
        <div className="flex gap-0">
          <button
            onClick={() => setMainTab("chats")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              mainTab === "chats"
                ? "border-gray-900 dark:border-white text-gray-900 dark:text-white"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Chats
          </button>
          <button
            onClick={() => setMainTab("requests")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              mainTab === "requests"
                ? "border-gray-900 dark:border-white text-gray-900 dark:text-white"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            <Users className="w-4 h-4" />
            Requests
            {totalPendingRequests > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full">
                {totalPendingRequests}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      {mainTab === "chats" ? (
        <div className="flex-1 flex overflow-hidden">
          {/* Conversation List */}
          <div className="w-full lg:w-80 xl:w-96 border-r border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-y-auto">
            <ConversationList />
          </div>

          {/* Empty state (desktop only) */}
          <div className="hidden lg:flex flex-1 items-center justify-center bg-gray-50 dark:bg-slate-800">
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-10 h-10 text-gray-400 dark:text-gray-500" />
              </div>
              <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Your Messages
              </h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                Select a conversation from the list to start chatting
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Request Sub-tabs */}
          <div className="border-b border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50 px-4">
            <div className="flex gap-4 py-2">
              <button
                onClick={() => setRequestSubTab("messages")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                  requestSubTab === "messages"
                    ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                    : "bg-white dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-600"
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                Message Requests
                {pendingMessageCount > 0 && (
                  <span className="px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full">
                    {pendingMessageCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setRequestSubTab("partners")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                  requestSubTab === "partners"
                    ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                    : "bg-white dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-600"
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                Partner Requests
                {pendingPartnerCount > 0 && (
                  <span className="px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full">
                    {pendingPartnerCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Direction Tabs (Received/Sent) */}
          <div className="border-b border-gray-100 dark:border-slate-800 px-4">
            <div className="flex gap-4 py-2">
              <button
                onClick={() => setDirectionTab("received")}
                className={`text-sm font-medium transition-colors ${
                  directionTab === "received"
                    ? "text-gray-900 dark:text-white"
                    : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"
                }`}
              >
                Received
              </button>
              <button
                onClick={() => setDirectionTab("sent")}
                className={`text-sm font-medium transition-colors ${
                  directionTab === "sent"
                    ? "text-gray-900 dark:text-white"
                    : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"
                }`}
              >
                Sent
              </button>
            </div>
          </div>

          {/* Request List */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {isLoadingRequests ? (
              <div className="flex items-center justify-center h-32">
                <div className="w-6 h-6 border-2 border-gray-900 dark:border-white border-t-transparent rounded-full animate-spin" />
              </div>
            ) : currentRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-center">
                <div className="w-12 h-12 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
                  {requestSubTab === "messages" ? (
                    <Mail className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                  ) : (
                    <UserPlus className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                  )}
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  No {directionTab} {requestSubTab === "messages" ? "message" : "partner"} requests
                </p>
              </div>
            ) : (
              <RequestList
                requests={currentRequests}
                activeTab={directionTab}
                onAccept={handleAccept}
                onReject={handleReject}
                loadingRequestId={loadingRequestId}
                type={requestSubTab === "messages" ? "message" : "partner"}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
