// components/landing/DiscoveryMockup.tsx
"use client";

import { MessageSquare, UserPlus, Sparkles, CheckCircle2 } from "lucide-react";

export function DiscoveryMockup() {
  return (
    <div className="w-full max-w-lg mx-auto bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xl overflow-hidden transition-all duration-300">
      {/* Top Browser Bar / Status Header */}
      <div className="px-4 py-3 bg-slate-50/80 dark:bg-slate-850/80 border-b border-slate-200/70 dark:border-slate-800/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>discovery / student_match_score: 96%</span>
        </div>
        <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 bg-slate-200/60 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-300/40 dark:border-slate-700/50">
          Verified Student
        </span>
      </div>

      <div className="p-5 sm:p-6 space-y-5">
        {/* Profile Card Header */}
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 text-white dark:text-slate-900 flex items-center justify-center font-bold text-lg shadow-sm">
              HT
            </div>
            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h4 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white truncate">
                Hamza Tariq
              </h4>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Available for FYP
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              BS Computer Science • Semester 7 • PAF-IAST
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-2 leading-relaxed">
              Seeking 2 teammates for an edge computer vision & distributed IoT tracking FYP. Strong backend & systems architecture background.
            </p>
          </div>
        </div>

        {/* Technical Stack Badges */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
            Demonstrated Tech Stack
          </span>
          <div className="flex flex-wrap gap-1.5">
            {[
              { name: "Next.js 15", level: "Advanced" },
              { name: "Python / FastAPI", level: "Advanced" },
              { name: "PostgreSQL", level: "Intermediate" },
              { name: "PyTorch", level: "Intermediate" },
              { name: "Docker", level: "Intermediate" },
            ].map((skill) => (
              <span
                key={skill.name}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 text-xs font-medium text-slate-700 dark:text-slate-300"
              >
                <span>{skill.name}</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500">• {skill.level}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Target FYP Industry & Focus */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs">
          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider">
              Target FYP Domain
            </span>
            <p className="font-semibold text-slate-900 dark:text-white">
              AI & Intelligent Autonomous Systems
            </p>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400">
            <Sparkles className="w-3.5 h-3.5" /> Open to Ideas
          </span>
        </div>

        {/* Action Buttons */}
        <div className="pt-1 flex items-center gap-2.5">
          <button
            type="button"
            className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors flex items-center justify-center gap-1.5 shadow-xs"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Send Partner Request</span>
          </button>
          <button
            type="button"
            className="py-2 px-3.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200/70 dark:border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Message</span>
          </button>
        </div>
      </div>
    </div>
  );
}
