// components/landing/ValidatorMockup.tsx
"use client";

import { CheckCircle2, ShieldCheck, Sparkles, TrendingUp, AlertCircle } from "lucide-react";

export function ValidatorMockup() {
  return (
    <div className="w-full max-w-lg mx-auto bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xl overflow-hidden transition-all duration-300">
      {/* Top Header */}
      <div className="px-4 py-3 bg-slate-50/80 dark:bg-slate-850/80 border-b border-slate-200/70 dark:border-slate-800/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-slate-900 dark:text-white text-xs">
            AI Proposal Feasibility Engine
          </span>
        </div>
        <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/60">
          Defense Rubric: Passing
        </span>
      </div>

      <div className="p-5 sm:p-6 space-y-5">
        {/* Project Title & Score Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/70">
          <div className="space-y-1 min-w-0">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono uppercase tracking-wider block">
              Evaluated Concept
            </span>
            <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white leading-snug">
              Autonomous Edge Telemetry & Crop Health Drone
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Department of Electrical & Computer Engineering
            </p>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60 dark:border-slate-700">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-baseline gap-1">
              <span>88</span>
              <span className="text-xs text-slate-400 font-normal">/100</span>
            </div>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Defense Ready
            </span>
          </div>
        </div>

        {/* 4 Dimension Rubric Progress Bars */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              Institutional Rubric Breakdown
            </span>
            <span className="text-[11px] text-slate-400">5 Evaluated Parameters</span>
          </div>

          <div className="space-y-2.5">
            {[
              { label: "Novelty & Concept Originality", score: 92, color: "bg-blue-600" },
              { label: "Technical Complexity & Depth", score: 85, color: "bg-indigo-600" },
              { label: "2-Semester Timeline Feasibility", score: 88, color: "bg-emerald-600" },
              { label: "Team Skillset & Role Balance", score: 90, color: "bg-slate-900 dark:bg-white" },
            ].map((dim) => (
              <div key={dim.label} className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-600 dark:text-slate-400">{dim.label}</span>
                  <span className="font-bold text-slate-900 dark:text-white">{dim.score}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${dim.color}`}
                    style={{ width: `${dim.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Historical FYP Archive Duplicate Check Badge */}
        <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-800/50 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              University Archive Duplicate Analysis
            </span>
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
              12% Overlap (Safe)
            </span>
          </div>
          <p className="text-[11px] text-emerald-700/90 dark:text-emerald-400/90 leading-relaxed">
            Cross-referenced with 40+ approved university FYPs. Unique real-time edge processing methodology confirms zero risk of title or concept duplication.
          </p>
        </div>
      </div>
    </div>
  );
}
