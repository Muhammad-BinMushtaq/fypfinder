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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-gray-50">
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
            <div className="p-2.5 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg shadow-purple-500/25">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Partner Requests
            </h1>
          </div>
          <p className="text-gray-600 ml-14">
            Manage partnership requests for your FYP team
          </p>
        </div>

        {/* Important Notice */}
        <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200/50 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <span className="font-medium text-amber-700">Important:</span>
            <span className="text-amber-600">
              {" "}
              Accepting a partner request will add them to your FYP group. Your
              group can have a maximum of 3 members.
            </span>
          </div>
        </div>

        {/* Pending Badge */}
        {pendingReceivedCount > 0 && activeTab === "received" && (
          <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl border border-purple-200/50 flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-purple-500" />
            <span className="text-sm font-medium text-purple-700">
              You have {pendingReceivedCount} pending partner request
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

        {/* CTA for empty sent */}
        {activeTab === "sent" && requests.length === 0 && !sentQuery.isLoading && (
          <div className="mt-6 text-center">
            <Link
              href="/dashboard/discovery"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
            >
              <Sparkles className="w-4 h-4" />
              Discover Partners
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
