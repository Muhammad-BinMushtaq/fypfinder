// app/dashboard/requests/page.tsx
"use client";

/**
 * Unified Requests Page
 * ---------------------
 * Combines Message Requests and Partner Requests in one clean interface.
 * 
 * Structure:
 * - Top tabs: Message Requests | Partner Requests
 * - Sub tabs: Received | Sent
 */

import { useState } from "react";
import {
  useSentMessageRequests,
  useReceivedMessageRequests,
  useAcceptMessageRequest,
  useRejectMessageRequest,
} from "@/hooks/request/useMessageRequests";
import {
  useSentPartnerRequests,
  useReceivedPartnerRequests,
  useAcceptPartnerRequest,
  useRejectPartnerRequest,
} from "@/hooks/request/usePartnerRequests";
import { RequestList } from "@/components/request";
import { MessageSquare, Users, Mail, UserPlus, AlertTriangle } from "lucide-react";

type RequestType = "messages" | "partners";
type DirectionTab = "received" | "sent";

export default function RequestsPage() {
  const [requestType, setRequestType] = useState<RequestType>("partners");
  const [directionTab, setDirectionTab] = useState<DirectionTab>("received");
  const [loadingRequestId, setLoadingRequestId] = useState<string | null>(null);

  // Message request queries & mutations
  const sentMessageQuery = useSentMessageRequests();
  const receivedMessageQuery = useReceivedMessageRequests();
  const acceptMessageMutation = useAcceptMessageRequest();
  const rejectMessageMutation = useRejectMessageRequest();

  // Partner request queries & mutations
  const sentPartnerQuery = useSentPartnerRequests();
  const receivedPartnerQuery = useReceivedPartnerRequests();
  const acceptPartnerMutation = useAcceptPartnerRequest();
  const rejectPartnerMutation = useRejectPartnerRequest();

  // Pending counts
  const pendingMessageCount = receivedMessageQuery.data?.filter((r) => r.status === "PENDING").length || 0;
  const pendingPartnerCount = receivedPartnerQuery.data?.filter((r) => r.status === "PENDING").length || 0;

  // Handle accept/reject
  const handleAccept = async (requestId: string) => {
    setLoadingRequestId(requestId);
    try {
      if (requestType === "messages") {
        await acceptMessageMutation.mutateAsync({ requestId });
      } else {
        await acceptPartnerMutation.mutateAsync({ requestId });
      }
    } finally {
      setLoadingRequestId(null);
    }
  };

  const handleReject = async (requestId: string) => {
    setLoadingRequestId(requestId);
    try {
      if (requestType === "messages") {
        await rejectMessageMutation.mutateAsync({ requestId });
      } else {
        await rejectPartnerMutation.mutateAsync({ requestId });
      }
    } finally {
      setLoadingRequestId(null);
    }
  };

  // Current requests based on selection
  const currentRequests = requestType === "messages"
    ? (directionTab === "sent" ? sentMessageQuery.data : receivedMessageQuery.data) || []
    : (directionTab === "sent" ? sentPartnerQuery.data : receivedPartnerQuery.data) || [];

  const isLoading = requestType === "messages"
    ? (directionTab === "sent" ? sentMessageQuery.isLoading : receivedMessageQuery.isLoading)
    : (directionTab === "sent" ? sentPartnerQuery.isLoading : receivedPartnerQuery.isLoading);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Requests
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your message and partner requests
          </p>
        </div>

        {/* Request Type Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setRequestType("partners")}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
              requestType === "partners"
                ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                : "bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700"
            }`}
          >
            <UserPlus className="w-4 h-4" />
            Partner Requests
            {pendingPartnerCount > 0 && (
              <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                requestType === "partners" 
                  ? "bg-white/20 text-white dark:bg-gray-900/20 dark:text-gray-900" 
                  : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
              }`}>
                {pendingPartnerCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setRequestType("messages")}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
              requestType === "messages"
                ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                : "bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700"
            }`}
          >
            <Mail className="w-4 h-4" />
            Message Requests
            {pendingMessageCount > 0 && (
              <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                requestType === "messages" 
                  ? "bg-white/20 text-white dark:bg-gray-900/20 dark:text-gray-900" 
                  : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
              }`}>
                {pendingMessageCount}
              </span>
            )}
          </button>
        </div>

        {/* Partner Request Warning */}
        {requestType === "partners" && (
          <div className="mb-6 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 dark:text-amber-300">
              Accepting a partner request adds them to your FYP group (max 3 members).
            </p>
          </div>
        )}

        {/* Direction Tabs */}
        <div className="flex gap-1 mb-6 p-1 bg-gray-100 dark:bg-slate-800 rounded-lg w-fit">
          <button
            onClick={() => setDirectionTab("received")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              directionTab === "received"
                ? "bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            Received
          </button>
          <button
            onClick={() => setDirectionTab("sent")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              directionTab === "sent"
                ? "bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            Sent
          </button>
        </div>

        {/* Request List */}
        <RequestList
          requests={currentRequests}
          variant={directionTab}
          type={requestType === "messages" ? "message" : "partner"}
          onAccept={handleAccept}
          onReject={handleReject}
          isLoading={isLoading}
          loadingRequestId={loadingRequestId}
        />
      </div>
    </div>
  );
}
