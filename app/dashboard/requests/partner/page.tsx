// app/dashboard/requests/partner/page.tsx
"use client";

/**
 * Partner Requests Page
 * ---------------------
 * Lists all partner requests (sent and received).
 * 
 * Uses:
 * - useSentPartnerRequests() for sent tab
 * - useReceivedPartnerRequests() for received tab
 * - useAcceptPartnerRequest() for accept action
 * - useRejectPartnerRequest() for reject action
 * - useRequestRealtime() for live updates
 * 
 * ⚠️ Partner requests are MORE consequential than message requests:
 * - Accepting creates/modifies FYP groups
 * - May lock group if full (3 members)
 * 
 * Follows "Backend is the Judge" pattern.
 */

import { useState } from "react";
import Link from "next/link";
import {
  useSentPartnerRequests,
  useReceivedPartnerRequests,
  useAcceptPartnerRequest,
  useRejectPartnerRequest,
} from "@/hooks/request/usePartnerRequests";
import { RequestTabs, RequestList } from "@/components/request";
import { Users, ArrowLeft, Sparkles, AlertTriangle } from "lucide-react";

export default function PartnerRequestsPage() {
  const [activeTab, setActiveTab] = useState<"sent" | "received">("received");
  const [loadingRequestId, setLoadingRequestId] = useState<string | null>(null);

  // Queries - will auto-refetch on mount due to staleTime:0
  const sentQuery = useSentPartnerRequests();
  const receivedQuery = useReceivedPartnerRequests();

  // Mutations
  const acceptMutation = useAcceptPartnerRequest();
  const rejectMutation = useRejectPartnerRequest();

  // Get current data based on active tab
  const currentQuery = activeTab === "sent" ? sentQuery : receivedQuery;
  const requests = currentQuery.data || [];

  // Filter to only show pending for received tab
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {/* Back Link */}
          <Link
            href="/dashboard/requests"
            className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-4 text-xs font-semibold transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Requests & Invitations</span>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-300">
                  <Users className="h-3 w-3" />
                  Capstone Groups
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  PAF-IAST Connections
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Partner Requests
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
                Manage partnership invitations and form your 3-member FYP team.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Important Notice */}
        <div className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 text-xs">
          <AlertTriangle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px] sm:text-xs">
            <strong>PAF-IAST Policy Note:</strong> Accepting a partner request will add the student to your FYP group. Groups are strictly capped at 3 members.
          </p>
        </div>

        {/* Pending Badge */}
        {pendingReceivedCount > 0 && activeTab === "received" && (
          <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
            <span className="font-medium">
              You have {pendingReceivedCount} pending partner request
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
            type="partner"
          />
        </div>

        {/* Request List */}
        <RequestList
          requests={requests}
          variant={activeTab}
          type="partner"
          onAccept={handleAccept}
          onReject={handleReject}
          isLoading={currentQuery.isLoading}
          loadingRequestId={loadingRequestId}
        />
      </div>
    </div>
  );
}
