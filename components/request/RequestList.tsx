// components/request/RequestList.tsx
"use client";

/**
 * RequestList Component
 * ---------------------
 * Renders a grid of request cards or an empty state.
 * 
 * Props:
 * - requests: Array of request objects
 * - variant: "sent" | "received"
 * - type: "message" | "partner"
 * - onAccept: Callback for accept action
 * - onReject: Callback for reject action
 * - isLoading: Shows skeleton if true
 * - loadingRequestId: ID of request being processed
 */

import { RequestCard, BaseRequest } from "./RequestCard";
import { RequestEmptyState } from "./RequestEmptyState";
import { Loader2 } from "lucide-react";

interface RequestListProps {
  requests: BaseRequest[];
  variant: "sent" | "received";
  type: "message" | "partner";
  onAccept?: (requestId: string) => void;
  onReject?: (requestId: string) => void;
  isLoading?: boolean;
  loadingRequestId?: string | null;
}

export function RequestList({
  requests,
  variant,
  type,
  onAccept,
  onReject,
  isLoading = false,
  loadingRequestId = null,
}: RequestListProps) {
  // Loading skeleton
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-5 animate-pulse"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 w-24 bg-gray-200 dark:bg-slate-700 rounded" />
              <div className="h-6 w-20 bg-gray-200 dark:bg-slate-700 rounded-full" />
            </div>
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-gray-200 dark:bg-slate-700 rounded-xl" />
              <div className="flex-1">
                <div className="h-5 w-32 bg-gray-200 dark:bg-slate-700 rounded mb-2" />
                <div className="h-4 w-24 bg-gray-200 dark:bg-slate-700 rounded mb-2" />
                <div className="h-3 w-16 bg-gray-200 dark:bg-slate-700 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (requests.length === 0) {
    return <RequestEmptyState variant={variant} type={type} />;
  }

  // Request grid
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {requests.map((request) => (
        <RequestCard
          key={request.id}
          request={request}
          variant={variant}
          type={type}
          onAccept={onAccept}
          onReject={onReject}
          isLoading={loadingRequestId === request.id}
        />
      ))}
    </div>
  );
}
