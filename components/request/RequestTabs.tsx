// components/request/RequestTabs.tsx
"use client";

/**
 * RequestTabs Component
 * ---------------------
 * Tab navigation for switching between Sent and Received requests.
 * 
 * Props:
 * - activeTab: "sent" | "received"
 * - onTabChange: Callback when tab is clicked
 * - sentCount: Number of sent requests (optional)
 * - receivedCount: Number of received requests (optional)
 * - type: "message" | "partner" - affects accent color
 * 
 * ⚠️ NO state management here. Parent controls the active tab.
 */

import { ArrowUpRight, ArrowDownLeft } from "lucide-react";

interface RequestTabsProps {
  activeTab: "sent" | "received";
  onTabChange: (tab: "sent" | "received") => void;
  sentCount?: number;
  receivedCount?: number;
  type?: "message" | "partner";
}

export function RequestTabs({
  activeTab,
  onTabChange,
  sentCount,
  receivedCount,
  type = "message",
}: RequestTabsProps) {
  const accentGradient =
    type === "message"
      ? "from-blue-500 to-blue-600"
      : "from-purple-500 to-purple-600";

  const accentBorder =
    type === "message" ? "border-blue-500" : "border-purple-500";

  const accentText = type === "message" ? "text-blue-600" : "text-purple-600";

  return (
    <div className="flex items-center bg-gray-50 rounded-xl p-1.5 border border-gray-200/50">
      {/* Received Tab */}
      <button
        onClick={() => onTabChange("received")}
        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${
          activeTab === "received"
            ? `bg-white shadow-md ${accentText}`
            : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
        }`}
      >
        <ArrowDownLeft className="w-4 h-4" />
        Received
        {typeof receivedCount === "number" && (
          <span
            className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
              activeTab === "received"
                ? `bg-gradient-to-r ${accentGradient} text-white`
                : "bg-gray-200 text-gray-600"
            }`}
          >
            {receivedCount}
          </span>
        )}
      </button>

      {/* Sent Tab */}
      <button
        onClick={() => onTabChange("sent")}
        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${
          activeTab === "sent"
            ? `bg-white shadow-md ${accentText}`
            : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
        }`}
      >
        <ArrowUpRight className="w-4 h-4" />
        Sent
        {typeof sentCount === "number" && (
          <span
            className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
              activeTab === "sent"
                ? `bg-gradient-to-r ${accentGradient} text-white`
                : "bg-gray-200 text-gray-600"
            }`}
          >
            {sentCount}
          </span>
        )}
      </button>
    </div>
  );
}
