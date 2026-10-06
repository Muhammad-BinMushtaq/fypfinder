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
  Inbox
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
    <div className="min-h-screen bg-transparent text-slate-900 dark:text-slate-100 font-sans pb-16 overflow-x-hidden">
      {/* Top Header Banner */}
      <div className="border-b border-white/40 dark:border-white/10 bg-black/5 dark:bg-white/5 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium uppercase tracking-wider bg-black/5 dark:bg-white/10 text-slate-800 dark:text-slate-300 backdrop-blur-md">
                  <Inbox className="h-4 w-4" />
                  Collaboration Hub
                </span>
                <span className="text-sm text-slate-400">•</span>
                <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                  PAF-IAST Connections
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                Requests & Invitations
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base mt-2 max-w-xl leading-relaxed">
                Review incoming invitations to form Final Year Project teams and manage your direct messaging connections.
              </p>
            </div>
          </div>

          {/* Primary Request Type Toggle Bar */}
          <div className="flex items-center gap-3 mt-8 pt-6 border-t border-white/40 dark:border-white/10/80">
            <button
              onClick={() => {
                setRequestType("partners");
                setStatusFilter("ALL");
              }}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-medium transition-all ${
                requestType === "partners"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                  : "bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl border border-white/40 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-700"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Partner Requests</span>
              {pendingPartnerCount > 0 && (
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-bold ${
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
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-medium transition-all ${
                requestType === "messages"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                  : "bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl border border-white/40 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-700"
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>Message Requests</span>
              {pendingMessageCount > 0 && (
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-bold ${
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">

        {/* Control Row: Direction Segmented Tab & Status Filter Pills */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/40 dark:border-white/10 pb-5">
          {/* Direction Segmented Control (Incoming vs Outgoing) */}
          <div className="inline-flex items-center bg-black/5 dark:bg-white/5 backdrop-blur-md rounded-3xl p-1.5 border border-slate-200/80 dark:border-slate-700 w-fit shrink-0">
            <button
              onClick={() => {
                setDirectionTab("received");
                setStatusFilter("ALL");
              }}
              className={`inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-2xl text-sm font-medium transition-all ${
                directionTab === "received"
                  ? "bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl text-slate-900 dark:text-white shadow-xl border border-slate-200/60 dark:border-slate-800"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>Incoming (Received)</span>
            </button>

            <button
              onClick={() => {
                setDirectionTab("sent");
                setStatusFilter("ALL");
              }}
              className={`inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-2xl text-sm font-medium transition-all ${
                directionTab === "sent"
                  ? "bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl text-slate-900 dark:text-white shadow-xl border border-slate-200/60 dark:border-slate-800"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Outgoing (Sent)</span>
            </button>
          </div>

          {/* Status Filter Badges */}
          <div className="flex flex-wrap items-center gap-2 py-1">
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`px-3 py-1.5 rounded-2xl text-sm font-semibold transition shrink-0 ${
                statusFilter === "ALL"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                  : "bg-black/5 dark:bg-white/5 backdrop-blur-md text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              All ({rawRequests.length})
            </button>

            <button
              onClick={() => setStatusFilter("PENDING")}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl text-sm font-semibold transition shrink-0 ${
                statusFilter === "PENDING"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                  : "bg-black/5 dark:bg-white/5 backdrop-blur-md text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              Pending ({pendingCountInView})
            </button>

            <button
              onClick={() => setStatusFilter("ACCEPTED")}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl text-sm font-semibold transition shrink-0 ${
                statusFilter === "ACCEPTED"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                  : "bg-black/5 dark:bg-white/5 backdrop-blur-md text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Accepted ({acceptedCountInView})
            </button>

            <button
              onClick={() => setStatusFilter("REJECTED")}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl text-sm font-semibold transition shrink-0 ${
                statusFilter === "REJECTED"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                  : "bg-black/5 dark:bg-white/5 backdrop-blur-md text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-slate-400" />
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
