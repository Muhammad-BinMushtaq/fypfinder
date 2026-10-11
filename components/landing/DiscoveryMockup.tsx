// components/landing/DiscoveryMockup.tsx
"use client";

import { Building2, Calendar, MessageSquare, Users, ArrowUpRight } from "lucide-react";

export function DiscoveryMockup() {
  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Exact representation of the real StudentCard in Discovery */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden p-5 sm:p-6 transition-all">
        {/* Avatar & Header */}
        <div className="flex flex-col items-center text-center">
          {/* Centered Circular Avatar */}
          <div className="relative mb-3.5 w-20 h-20 rounded-full border-2 border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-xs mx-auto text-slate-500 dark:text-slate-400 font-bold text-xl">
            HT
          </div>

          {/* Name */}
          <h3 className="font-bold text-slate-900 dark:text-white text-lg tracking-tight truncate px-1 w-full">
            Hamza Tariq
          </h3>

          {/* Availability & Group Status Pills */}
          <div className="mt-2.5 flex flex-wrap items-center justify-center gap-1.5 text-xs font-medium">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-emerald-700 dark:text-emerald-400 font-medium">Available</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-emerald-700 dark:text-emerald-400 font-medium">Looking for team</span>
            </div>
          </div>
        </div>

        {/* Academic Info */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-2 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">Computer Science & IT</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Semester 7</span>
          </div>
        </div>

        {/* Action Section */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 space-y-2.5">
          <div className="grid grid-cols-2 gap-2">
            {/* 1. Message Button */}
            <div className="h-8 inline-flex items-center justify-center gap-1.5 px-2 text-xs bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium rounded-xl shadow-xs">
              <MessageSquare className="w-3 h-3 shrink-0" />
              <span>Message</span>
            </div>

            {/* 2. Partner Button */}
            <div className="h-8 inline-flex items-center justify-center gap-1.5 px-2 text-xs bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 font-medium rounded-xl border border-slate-200/70 dark:border-slate-700/70">
              <Users className="w-3 h-3 shrink-0" />
              <span>Partner</span>
            </div>
          </div>

          {/* View Profile Action */}
          <div className="w-full pt-1.5 pb-0.5 flex justify-center items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>View Profile</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>
      </div>
    </div>
  );
}
