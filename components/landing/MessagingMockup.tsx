// components/landing/MessagingMockup.tsx
"use client";

import { Users, Check, X, Clock, ArrowDownLeft } from "lucide-react";

export function MessagingMockup() {
  return (
    <div className="w-full max-w-md mx-auto">
      {/* Authentic representation of an Incoming Partner Request */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden p-5 sm:p-6 transition-all">
        {/* Card Header: Type Badge, Direction & Status */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700">
              <Users className="w-3.5 h-3.5 text-slate-500" />
              <span>Partner Invite</span>
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span>Incoming</span>
            </span>
          </div>

          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
            Pending Decision
          </span>
        </div>

        {/* Student Profile Info */}
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-900 dark:text-white font-bold text-sm shrink-0">
            ZB
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-slate-900 dark:text-white text-base truncate">
              Zainab Bilal
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
              Software Engineering
            </p>
            <div className="mt-1">
              <span className="inline-block text-[11px] font-medium text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                Semester 7
              </span>
            </div>
          </div>
        </div>

        {/* Reason / Accompanying Message */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/80">
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed border-l-2 border-slate-300 dark:border-slate-700 pl-3">
            "Hey! Saw your profile on the discovery feed. I am working on an AI healthcare diagnostic idea for our final year project and need a backend partner. Would love to team up!"
          </p>
        </div>

        {/* Card Footer: Timestamp & Actions */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>10 minutes ago</span>
            </span>
            <span>Sent to you</span>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <div className="h-9 inline-flex items-center justify-center gap-1.5 px-3 text-xs font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-xl shadow-xs">
              <Check className="w-3.5 h-3.5" />
              <span>Accept Request</span>
            </div>
            <div className="h-9 inline-flex items-center justify-center gap-1.5 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl border border-slate-200/70 dark:border-slate-700">
              <X className="w-3.5 h-3.5 text-slate-400" />
              <span>Decline</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
