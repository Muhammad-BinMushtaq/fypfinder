// components/request/RequestTabs.tsx
"use client";

/**
 * RequestTabs Component
 * ---------------------
 * Minimalist segmented tab navigation for switching between Sent and Received requests.
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
}: RequestTabsProps) {
  return (
    <div className="inline-flex items-center bg-black/5 dark:bg-white/5 backdrop-blur-md rounded-2xl p-1.5 border border-white/20 dark:border-white/5">
      {/* Received Tab */}
      <button
        onClick={() => onTabChange("received")}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
          activeTab === "received"
            ? "bg-white/80 dark:bg-white/10 text-slate-900 dark:text-white shadow-sm border border-white/40 dark:border-white/10"
            : "text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
        }`}
      >
        <ArrowDownLeft className="w-4 h-4" />
        <span>Incoming</span>
        {typeof receivedCount === "number" && (
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              activeTab === "received"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                : "bg-slate-200 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300"
            }`}
          >
            {receivedCount}
          </span>
        )}
      </button>

      {/* Sent Tab */}
      <button
        onClick={() => onTabChange("sent")}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
          activeTab === "sent"
            ? "bg-white/80 dark:bg-white/10 text-slate-900 dark:text-white shadow-sm border border-white/40 dark:border-white/10"
            : "text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
        }`}
      >
        <ArrowUpRight className="w-4 h-4" />
        <span>Outgoing</span>
        {typeof sentCount === "number" && (
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              activeTab === "sent"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                : "bg-slate-200 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300"
            }`}
          >
            {sentCount}
          </span>
        )}
      </button>
    </div>
  );
}
