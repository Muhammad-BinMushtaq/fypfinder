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
  const accentColor = type === "message" ? "blue" : "purple";

  return (
    <div className="flex items-center gap-3">
      {/* Accept Button */}
      <button
        onClick={onAccept}
        disabled={isLoading}
        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
          type === "message"
            ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
            : "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
        }`}
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
        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
