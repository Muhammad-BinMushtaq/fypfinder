// components/request/RequestActions.tsx
"use client";

/**
 * RequestActions Component
 * ------------------------
 * Accept/Reject buttons for incoming requests with modern minimalist styling.
 * 
 * Props:
 * - onAccept: Callback when accept is clicked
 * - onReject: Callback when reject is clicked
 * - isLoading: Disables buttons during mutation
 * - type: "message" | "partner" - affects button styling
 */

import { Check, X, Loader2 } from "lucide-react";

interface RequestActionsProps {
  onAccept: () => void;
  onReject: () => void;
  isLoading?: boolean;
  type?: "message" | "partner";
}

export function RequestActions({
  onAccept,
  onReject,
  isLoading = false,
  type = "message",
}: RequestActionsProps) {
  return (
    <div className="flex items-center gap-2 pt-1">
      {/* Accept Button */}
      <button
        onClick={onAccept}
        disabled={isLoading}
        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold text-white bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Check className="w-4 h-4" />
        )}
        <span>{type === "partner" ? "Accept Invitation" : "Accept Request"}</span>
      </button>

      {/* Reject Button */}
      <button
        onClick={onReject}
        disabled={isLoading}
        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 hover:border-red-300 dark:hover:border-red-900/60 hover:text-red-600 dark:hover:text-red-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <X className="w-4 h-4" />
        )}
        <span>Decline</span>
      </button>
    </div>
  );
}
