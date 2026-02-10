// components/request/RequestActions.tsx
"use client";

/**
 * RequestActions Component
 * ------------------------
 * Accept/Reject buttons for incoming requests.
 * 
 * Props:
 * - onAccept: Callback when accept is clicked
 * - onReject: Callback when reject is clicked
 * - isLoading: Disables buttons during mutation
 * - type: "message" | "partner" - affects button styling
 * 
 * ⚠️ NO API calls here. Just triggers parent callbacks.
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
    <div className="flex items-center gap-3">
      {/* Accept Button */}
      <button
        onClick={onAccept}
        disabled={isLoading}
        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-white bg-gray-900 dark:bg-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <Check className="w-4 h-4" />
            Accept
          </>
        )}
      </button>

      {/* Reject Button */}
      <button
        onClick={onReject}
        disabled={isLoading}
        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <X className="w-4 h-4" />
            Reject
          </>
        )}
      </button>
    </div>
  );
}
