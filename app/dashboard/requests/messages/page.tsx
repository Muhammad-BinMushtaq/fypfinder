// app/dashboard/requests/messages/page.tsx
"use client";

/**
 * Message Requests Page
 * ---------------------
 * Lists all message requests (sent and received).
 * 
 * Uses:
 * - useSentMessageRequests() for sent tab
 * - useReceivedMessageRequests() for received tab
 * - useAcceptMessageRequest() for accept action
 * - useRejectMessageRequest() for reject action
 * - useRequestRealtime() for live updates
 * 
 * Follows "Backend is the Judge" pattern:
 * - UI only displays data from backend
 * - All validation happens server-side
 */

import { useState } from "react";
import Link from "next/link";
import {
  useSentMessageRequests,
  useReceivedMessageRequests,
  useAcceptMessageRequest,
  useRejectMessageRequest,
} from "@/hooks/request/useMessageRequests";
import { useRequestRealtime } from "@/hooks/request/useRequestRealtime";
import { useMyProfile } from "@/hooks/student/useMyProfile";
import { RequestTabs, RequestList } from "@/components/request";
import { MessageSquare, ArrowLeft, Sparkles } from "lucide-react";

export default function MessageRequestsPage() {
  const [activeTab, setActiveTab] = useState<"sent" | "received">("received");
  const [loadingRequestId, setLoadingRequestId] = useState<string | null>(null);

  // Get current student ID for realtime
  const { profile } = useMyProfile();

  // Subscribe to realtime updates
  useRequestRealtime({
    studentId: profile?.id || null,
    enabled: !!profile?.id,
  });

  // Queries
  const sentQuery = useSentMessageRequests();
  const receivedQuery = useReceivedMessageRequests();

  // Mutations
  const acceptMutation = useAcceptMessageRequest();
  const rejectMutation = useRejectMessageRequest();

  // Get current data based on active tab
  const currentQuery = activeTab === "sent" ? sentQuery : receivedQuery;
  const requests = currentQuery.data || [];

  // Filter to only show pending for received tab actions
  const pendingReceivedCount =
    receivedQuery.data?.filter((r) => r.status === "PENDING").length || 0;

  // Handle accept
  const handleAccept = async (requestId: string) => {
    setLoadingRequestId(requestId);
    try {
      await acceptMutation.mutateAsync({ requestId });
    } finally {
      setLoadingRequestId(null);
    }
  };

  // Handle reject
  const handleReject = async (requestId: string) => {
    setLoadingRequestId(requestId);
    try {
      await rejectMutation.mutateAsync({ requestId });
    } finally {
      setLoadingRequestId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Back Link */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Dashboard</span>
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/25">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Message Requests
            </h1>
          </div>
          <p className="text-gray-600 ml-14">
            Connect with other students through messages
          </p>
        </div>

        {/* Pending Badge */}
        {pendingReceivedCount > 0 && activeTab === "received" && (
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-sky-50 rounded-xl border border-blue-200/50 flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-medium text-blue-700">
              You have {pendingReceivedCount} pending request
              {pendingReceivedCount > 1 ? "s" : ""}!
            </span>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6">
          <RequestTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            sentCount={sentQuery.data?.length}
            receivedCount={receivedQuery.data?.length}
            type="message"
          />
        </div>

        {/* Request List */}
        <RequestList
          requests={requests}
          variant={activeTab}
          type="message"
          onAccept={handleAccept}
          onReject={handleReject}
          isLoading={currentQuery.isLoading}
          loadingRequestId={loadingRequestId}
        />

        {/* CTA for empty sent */}
        {activeTab === "sent" && requests.length === 0 && !sentQuery.isLoading && (
          <div className="mt-6 text-center">
            <Link
              href="/dashboard/discovery"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
            >
              <Sparkles className="w-4 h-4" />
              Discover Students
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
