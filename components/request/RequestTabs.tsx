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
  return (
    <div className="flex items-center bg-gray-100 dark:bg-slate-800 rounded-xl p-1.5 border border-gray-200 dark:border-slate-700">
      {/* Received Tab */}
      <button
        onClick={() => onTabChange("received")}
        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${
          activeTab === "received"
            ? "bg-white dark:bg-slate-700 shadow-md text-gray-900 dark:text-white"
            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-white/50 dark:hover:bg-slate-700/50"
        }`}
      >
        <ArrowDownLeft className="w-4 h-4" />
        Received
        {typeof receivedCount === "number" && (
          <span
            className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
              activeTab === "received"
                ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                : "bg-gray-200 dark:bg-slate-600 text-gray-600 dark:text-gray-300"
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
            ? "bg-white dark:bg-slate-700 shadow-md text-gray-900 dark:text-white"
            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-white/50 dark:hover:bg-slate-700/50"
        }`}
      >
        <ArrowUpRight className="w-4 h-4" />
        Sent
        {typeof sentCount === "number" && (
          <span
            className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
              activeTab === "sent"
                ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                : "bg-gray-200 dark:bg-slate-600 text-gray-600 dark:text-gray-300"
            }`}
          >
            {sentCount}
          </span>
        )}
      </button>
    </div>
  );
}
