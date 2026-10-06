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
import { RequestTabs, RequestList } from "@/components/request";
import { MessageSquare, ArrowLeft, Sparkles } from "lucide-react";

export default function MessageRequestsPage() {
  const [activeTab, setActiveTab] = useState<"sent" | "received">("received");
  const [loadingRequestId, setLoadingRequestId] = useState<string | null>(null);

  // Queries - will auto-refetch on mount due to staleTime:0
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
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans pb-16 overflow-x-hidden">
      {/* Top Header Banner */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          {/* Back Link */}
          <Link
            href="/dashboard/requests"
            className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-6 text-sm font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All Requests & Invitations</span>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium uppercase tracking-wider bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-300">
                  <MessageSquare className="h-4 w-4" />
                  Direct Messages
                </span>
                <span className="text-sm text-slate-400">•</span>
                <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                  PAF-IAST Connections
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                Message Requests
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base mt-2 max-w-xl leading-relaxed">
                Connect and communicate directly with fellow students across departments.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
        {/* Pending Badge */}
        {pendingReceivedCount > 0 && activeTab === "received" && (
          <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
            <span className="font-medium">
              You have {pendingReceivedCount} pending message request
              {pendingReceivedCount > 1 ? "s" : ""} awaiting your response.
            </span>
          </div>
        )}

        {/* Tabs */}
        <div>
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
      </div>
    </div>
  );
}
