// app/dashboard/requests/page.tsx
"use client";

/**
 * Unified Requests Page
 * ---------------------
 * Modern, minimalist interface for Message Requests and Partner Requests
 * matching the FYP Validator & Landing Page design system.
 */

import { useState, useMemo } from "react";
import Link from "next/link";
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
import { 
  Users, 
  Mail, 
  Info, 
  Search, 
  ArrowDownLeft, 
  ArrowUpRight,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  Inbox,
  ArrowLeft,
} from "lucide-react";

type RequestType = "partners" | "messages";
type DirectionTab = "received" | "sent";
type StatusFilter = "ALL" | "PENDING" | "ACCEPTED" | "REJECTED";

export default function RequestsPage() {
  const [requestType, setRequestType] = useState<RequestType>("partners");
  const [directionTab, setDirectionTab] = useState<DirectionTab>("received");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
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

  // Raw requests list based on type & direction
  const rawRequests = useMemo(() => {
    if (requestType === "messages") {
      return (directionTab === "sent" ? sentMessageQuery.data : receivedMessageQuery.data) || [];
    }
    return (directionTab === "sent" ? sentPartnerQuery.data : receivedPartnerQuery.data) || [];
  }, [requestType, directionTab, sentMessageQuery.data, receivedMessageQuery.data, sentPartnerQuery.data, receivedPartnerQuery.data]);

  // Filtered requests by status
  const currentRequests = useMemo(() => {
    if (statusFilter === "ALL") return rawRequests;
    return rawRequests.filter((r) => r.status === statusFilter);
  }, [rawRequests, statusFilter]);

  const isLoading = requestType === "messages"
    ? (directionTab === "sent" ? sentMessageQuery.isLoading : receivedMessageQuery.isLoading)
    : (directionTab === "sent" ? sentPartnerQuery.isLoading : receivedPartnerQuery.isLoading);

  // Counts for secondary filters
  const pendingCountInView = rawRequests.filter((r) => r.status === "PENDING").length;
  const acceptedCountInView = rawRequests.filter((r) => r.status === "ACCEPTED").length;
  const rejectedCountInView = rawRequests.filter((r) => r.status === "REJECTED").length;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans pb-16 overflow-x-hidden">
      {/* Top Header Banner */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-7">
          <div className="mb-4">
            <Link
              href="/dashboard/discovery"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Discovery
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium uppercase tracking-wider bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-300">
                  <Inbox className="h-3.5 w-3.5" />
                  Collaboration Hub
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Requests & Invitations
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1 max-w-xl">
                Review incoming invitations for Final Year Project teams and manage messaging connections.
              </p>
            </div>
          </div>

          {/* Primary Request Type Toggle Bar (Compact Segmented) */}
          <div className="flex items-center gap-2 mt-5 pt-4 border-t border-slate-200 dark:border-slate-800/80">
            <button
              onClick={() => {
                setRequestType("partners");
                setStatusFilter("ALL");
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                requestType === "partners"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                  : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-700"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Partner Requests</span>
              {pendingPartnerCount > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    requestType === "partners"
                      ? "bg-slate-800 text-slate-200 dark:bg-slate-100 dark:text-slate-800"
                      : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                  }`}
                >
                  {pendingPartnerCount}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setRequestType("messages");
                setStatusFilter("ALL");
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                requestType === "messages"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                  : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-700"
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Message Requests</span>
              {pendingMessageCount > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    requestType === "messages"
                      ? "bg-slate-800 text-slate-200 dark:bg-slate-100 dark:text-slate-800"
                      : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                  }`}
                >
                  {pendingMessageCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">

        {/* Control Row: Direction Segmented Tab & Status Filter Pills */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
          {/* Direction Segmented Control (Incoming vs Outgoing) */}
          <div className="inline-flex items-center bg-slate-100 dark:bg-slate-800/80 rounded-lg p-1 border border-slate-200/80 dark:border-slate-700 w-fit shrink-0">
            <button
              onClick={() => {
                setDirectionTab("received");
                setStatusFilter("ALL");
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                directionTab === "received"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs border border-slate-200/60 dark:border-slate-800"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span>Received</span>
            </button>

            <button
              onClick={() => {
                setDirectionTab("sent");
                setStatusFilter("ALL");
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                directionTab === "sent"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs border border-slate-200/60 dark:border-slate-800"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Sent</span>
            </button>
          </div>

          {/* Status Filter Badges (Compact) */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition shrink-0 ${
                statusFilter === "ALL"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              All ({rawRequests.length})
            </button>

            <button
              onClick={() => setStatusFilter("PENDING")}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition shrink-0 ${
                statusFilter === "PENDING"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Pending ({pendingCountInView})
            </button>

            <button
              onClick={() => setStatusFilter("ACCEPTED")}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition shrink-0 ${
                statusFilter === "ACCEPTED"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Accepted ({acceptedCountInView})
            </button>

            <button
              onClick={() => setStatusFilter("REJECTED")}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition shrink-0 ${
                statusFilter === "REJECTED"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
              Declined ({rejectedCountInView})
            </button>
          </div>
        </div>

        {/* Requests Feed / Empty State */}
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
