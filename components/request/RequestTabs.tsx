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
    <div className="inline-flex items-center bg-slate-100 dark:bg-slate-800/80 rounded-xl p-1 border border-slate-200/80 dark:border-slate-700">
      {/* Received Tab */}
      <button
        onClick={() => onTabChange("received")}
        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
          activeTab === "received"
            ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs border border-slate-200/60 dark:border-slate-800"
            : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
        }`}
      >
        <ArrowDownLeft className="w-3.5 h-3.5" />
        <span>Incoming</span>
        {typeof receivedCount === "number" && (
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
              activeTab === "received"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
            }`}
          >
            {receivedCount}
          </span>
        )}
      </button>

      {/* Sent Tab */}
      <button
        onClick={() => onTabChange("sent")}
        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
          activeTab === "sent"
            ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs border border-slate-200/60 dark:border-slate-800"
            : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
        }`}
      >
        <ArrowUpRight className="w-3.5 h-3.5" />
        <span>Outgoing</span>
        {typeof sentCount === "number" && (
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
              activeTab === "sent"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
            }`}
          >
            {sentCount}
          </span>
        )}
      </button>
    </div>
  );
}
