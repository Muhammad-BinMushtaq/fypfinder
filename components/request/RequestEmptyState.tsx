// components/request/RequestEmptyState.tsx
"use client";

/**
 * RequestEmptyState Component
 * ---------------------------
 * Minimalist empty state matching the FYP Validator design system.
 * 
 * Props:
 * - variant: "sent" | "received"
 * - type: "message" | "partner"
 */

import { Inbox, Send, ArrowRight, Search } from "lucide-react";
import Link from "next/link";

interface RequestEmptyStateProps {
  variant: "sent" | "received";
  type: "message" | "partner";
}

export function RequestEmptyState({ variant, type }: RequestEmptyStateProps) {
  const isReceived = variant === "received";
  const isPartner = type === "partner";

  const getTitle = () => {
    if (isReceived) {
      return isPartner
        ? "No Partner Requests Received"
        : "No Direct Message Requests";
    }
    return isPartner
      ? "No Outgoing Partner Requests"
      : "No Sent Message Requests";
  };

  const getDescription = () => {
    if (isReceived) {
      return isPartner
        ? "When another PAF-IAST student invites you to join their FYP capstone group, their proposal and team invitation will appear here."
        : "When students wish to connect and initiate a conversation with you, their incoming message requests will be listed here.";
    }
    return isPartner
      ? "You haven't invited any students to join your FYP team yet. Visit Discovery to find students matching your desired tech stack."
      : "You haven't reached out with any message requests yet. Browse student profiles in Discovery to connect.";
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 text-center">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-2xs">
        {isReceived ? (
          <Inbox className="w-6 h-6 stroke-[1.75]" />
        ) : (
          <Send className="w-6 h-6 stroke-[1.75]" />
        )}
      </div>

      <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2 tracking-tight">
        {getTitle()}
      </h3>

      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md leading-relaxed mb-6">
        {getDescription()}
      </p>

      <Link
        href="/dashboard/discovery"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-100 transition shadow-2xs"
      >
        <Search className="w-4 h-4" />
        <span>Explore Student Discovery</span>
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
