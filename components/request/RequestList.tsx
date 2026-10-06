// components/request/RequestList.tsx
"use client";

/**
 * RequestList Component
 * ---------------------
 * Renders a grid of request cards or an empty state with modern minimalist skeleton.
 */

import { RequestCard, BaseRequest } from "./RequestCard";
import { RequestEmptyState } from "./RequestEmptyState";

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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 animate-pulse space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 w-28 bg-slate-100 dark:bg-slate-800 rounded" />
              <div className="h-5 w-20 bg-slate-100 dark:bg-slate-800 rounded-full" />
            </div>
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 bg-slate-100 dark:bg-slate-800 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-36 bg-slate-100 dark:bg-slate-800 rounded" />
                <div className="h-3 w-48 bg-slate-100 dark:bg-slate-800 rounded" />
              </div>
            </div>
            <div className="h-8 w-full bg-slate-50 dark:bg-slate-800/60 rounded-lg" />
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
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
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
