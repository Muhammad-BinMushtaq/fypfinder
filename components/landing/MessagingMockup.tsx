// components/landing/MessagingMockup.tsx
"use client";

import { CheckCircle2, UserPlus, Send, ShieldCheck } from "lucide-react";

export function MessagingMockup() {
  return (
    <div className="w-full max-w-lg mx-auto bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xl overflow-hidden transition-all duration-300 flex flex-col">
      {/* Top Request Approval Header Banner */}
      <div className="px-4 py-2.5 bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="truncate">Message Request Accepted • Collaboration Active</span>
        </div>
        <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full shrink-0">
          Peer Verified
        </span>
      </div>

      {/* Chat Participant Header */}
      <div className="p-4 bg-slate-50/70 dark:bg-slate-850/70 border-b border-slate-200/70 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs flex items-center justify-center shadow-xs">
              ZB
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              Zainab Bilal
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              BS Software Engineering • Available for Team
            </p>
          </div>
        </div>

        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-xs active:scale-95"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Invite Partner</span>
        </button>
      </div>

      {/* Conversation Thread */}
      <div className="p-4 sm:p-5 space-y-3.5 bg-white dark:bg-slate-900 flex-1">
        {/* Timestamp */}
        <div className="text-center">
          <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-slate-100 dark:bg-slate-800/80 px-2.5 py-0.5 rounded-full">
            Today • 2:45 PM
          </span>
        </div>

        {/* Incoming Message */}
        <div className="flex items-start gap-2.5 max-w-[85%]">
          <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
            ZB
          </div>
          <div className="p-3.5 rounded-2xl rounded-tl-sm bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs leading-relaxed space-y-1">
            <p>
              Hi! Saw your profile on the FYP Discovery directory. Are you interested in collaborating on an AI healthcare diagnostic platform for our final year project?
            </p>
            <span className="text-[10px] text-slate-400 block text-right">2:46 PM</span>
          </div>
        </div>

        {/* Outgoing Message */}
        <div className="flex items-start gap-2.5 max-w-[85%] ml-auto justify-end">
          <div className="p-3.5 rounded-2xl rounded-tr-sm bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs leading-relaxed space-y-1 shadow-xs">
            <p>
              Hey Zainab! That matches my computer vision focus. Did you test the proposal on the AI Idea Validator yet?
            </p>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 block text-right">2:48 PM</span>
          </div>
        </div>

        {/* Incoming Message with Validator Confirmation */}
        <div className="flex items-start gap-2.5 max-w-[85%]">
          <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
            ZB
          </div>
          <div className="p-3.5 rounded-2xl rounded-tl-sm bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs leading-relaxed space-y-2">
            <p>
              Yes! Scored <strong>88/100 (Defense Ready)</strong> with low duplicate overlap against past university archives. Sending you the official partner invitation!
            </p>
            <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between text-[11px]">
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Proposal Benchmark: 88/100
              </span>
              <span className="text-slate-400 text-[10px]">Defense Score</span>
            </div>
            <span className="text-[10px] text-slate-400 block text-right">2:50 PM</span>
          </div>
        </div>
      </div>

      {/* Input Bar Mockup */}
      <div className="p-3 bg-slate-50/80 dark:bg-slate-850/80 border-t border-slate-200/70 dark:border-slate-800 flex items-center gap-2">
        <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-400 flex items-center justify-between">
          <span>Type your collaboration response...</span>
          <span className="text-[10px] text-slate-300 dark:text-slate-600 font-mono">Enter ↵</span>
        </div>
        <div className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shrink-0 shadow-2xs">
          <Send className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
}
