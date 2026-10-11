// components/landing/MessagingMockup.tsx
"use client";

import { Users, Check, Send } from "lucide-react";

export function MessagingMockup() {
  return (
    <div className="w-full max-w-md mx-auto space-y-3">
      {/* 1. Request State: Partner Request Accepted */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-3.5 shadow-sm flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-800 dark:text-slate-200 font-bold text-xs shrink-0">
            ZB
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h4 className="font-bold text-slate-900 dark:text-white text-xs truncate">
                Zainab Bilal
              </h4>
              <span className="text-[10px] text-slate-400">• Sem 7</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              Partner Request Accepted
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60 shrink-0">
          <Check className="w-3 h-3" /> Connected
        </span>
      </div>

      {/* 2. Conversation State: Real-Time Chat Screen */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden transition-all flex flex-col">
        {/* Chat Participant Header */}
        <div className="px-4 py-3 bg-slate-50/80 dark:bg-slate-850/80 border-b border-slate-200/70 dark:border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-[11px] flex items-center justify-center">
                ZB
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
            </div>
            <div>
              <p className="font-bold text-xs text-slate-900 dark:text-white leading-tight">
                Zainab Bilal
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Software Engineering • Online
              </p>
            </div>
          </div>
          <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200/60 dark:border-slate-700">
            Direct Chat
          </span>
        </div>

        {/* Conversation Thread */}
        <div className="p-4 space-y-3 bg-white dark:bg-slate-900 text-xs">
          {/* Timestamp */}
          <div className="text-center">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
              Today • 2:45 PM
            </span>
          </div>

          {/* Incoming Message from Zainab */}
          <div className="flex items-start gap-2 max-w-[88%]">
            <div className="p-3 rounded-2xl rounded-tl-xs bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 leading-relaxed">
              Hi Hamza! Thanks for accepting the partner invite. Are you interested in collaborating on an AI clinic diagnostic FYP?
            </div>
          </div>

          {/* Outgoing Message from Hamza */}
          <div className="flex items-start gap-2 max-w-[88%] ml-auto justify-end">
            <div className="p-3 rounded-2xl rounded-tr-xs bg-slate-900 dark:bg-white text-white dark:text-slate-900 leading-relaxed shadow-xs">
              Hey Zainab! That matches my backend and ML focus. I can build the FastAPI model services if you handle the frontend dashboard.
            </div>
          </div>

          {/* Incoming Reply from Zainab */}
          <div className="flex items-start gap-2 max-w-[88%]">
            <div className="p-3 rounded-2xl rounded-tl-xs bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 leading-relaxed">
              That sounds perfect! Let's lock in our 2-person group on FYPMate and submit the proposal.
            </div>
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-slate-50/70 dark:bg-slate-850/70 border-t border-slate-200/70 dark:border-slate-800 flex items-center gap-2">
          <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-400">
            <span>Type a message...</span>
          </div>
          <div className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shrink-0 shadow-2xs">
            <Send className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
}
