// components/landing/ValidatorMockup.tsx
"use client";

import { CheckCircle2, ShieldCheck, FileText, Check } from "lucide-react";

export function ValidatorMockup() {
  return (
    <div className="w-full max-w-md mx-auto">
      {/* Clean, minimal Idea Validation Card without gauge lines or clutter */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden p-5 sm:p-6 transition-all space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-700 dark:text-slate-300" />
            <span className="font-bold text-slate-900 dark:text-white text-xs">
              FYP Idea Validator
            </span>
          </div>
          <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-200/60 dark:border-slate-700/60">
            Validated
          </span>
        </div>

        {/* Tested Concept & Score */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider block">
              Tested Proposal
            </span>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate mt-0.5">
              AI Doctor Assistant for Rural Clinics
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Computer Science & IT
            </p>
          </div>

          <div className="text-right shrink-0">
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              88<span className="text-xs text-slate-400 font-normal">/100</span>
            </div>
            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center justify-end gap-1 mt-0.5">
              <CheckCircle2 className="w-3 h-3" /> Defense Ready
            </span>
          </div>
        </div>

        {/* 3 Clean Assessment Parameters (No ugly horizontal progress lines) */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-0.5">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Defense Criteria</span>
            <span className="text-[11px]">3 Evaluated Checks</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              { label: "Problem Need", status: "High Practical Value" },
              { label: "Technical Scope", status: "Software ($0 Tier)" },
              { label: "Defense Timeline", status: "2 Semesters (Safe)" },
            ].map((item) => (
              <div
                key={item.label}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850/40 border border-slate-200/60 dark:border-slate-700/60 text-left"
              >
                <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-900 dark:text-white mb-0.5">
                  <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{item.label}</span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  {item.status}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Past FYP Archive Duplicate Check Badge */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850/40 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-white">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Past FYP Duplicate Check</span>
            </span>
            <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/60">
              0 Duplicate Conflicts
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            Safe to submit. Cross-checked with 40+ past university FYPs.
          </p>
        </div>
      </div>
    </div>
  );
}
