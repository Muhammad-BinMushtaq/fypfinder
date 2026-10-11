// components/landing/WorkspaceMockup.tsx
"use client";

import { Lock, Users, CheckCircle2, Clock, Calendar } from "lucide-react";

export function WorkspaceMockup() {
  return (
    <div className="w-full max-w-lg mx-auto bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xl overflow-hidden transition-all duration-300">
      {/* Top Lock Status Header */}
      <div className="px-4 py-3 bg-slate-50/80 dark:bg-slate-850/80 border-b border-slate-200/70 dark:border-slate-800/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
          <Lock className="w-3.5 h-3.5 text-slate-500" />
          <span>Team Roster: Finalized (3/3 Students)</span>
        </div>
        <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200/60 dark:border-slate-700/60">
          Locked under Academic Rules
        </span>
      </div>

      <div className="p-5 sm:p-6 space-y-5">
        {/* Project Header Info */}
        <div className="space-y-1">
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono uppercase tracking-wider block">
            Approved FYP Group
          </span>
          <h4 className="font-bold text-base text-slate-900 dark:text-white">
            Smart Grid Telemetry & Load Balancer
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Supervisor: Dr. M. S. Qureshi • Final Year Project 2026
          </p>
        </div>

        {/* Member Badges */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
            Official Team Roster
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              { name: "Ahmed K.", role: "Lead / Backend", initials: "AK" },
              { name: "Sara M.", role: "ML Specialist", initials: "SM" },
              { name: "Zain T.", role: "IoT Hardware", initials: "ZT" },
            ].map((member) => (
              <div
                key={member.name}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-2"
              >
                <div className="w-7 h-7 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-[10px] flex items-center justify-center shrink-0">
                  {member.initials}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                    {member.name}
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                    {member.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Milestone Task Board Preview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              Active Milestone Roadmap
            </span>
            <span className="text-[11px] text-slate-400">Semester 7 Defense</span>
          </div>

          <div className="space-y-2">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="font-medium text-slate-700 dark:text-slate-300 truncate">
                  1. Comprehensive Literature Review & Defense Proposal
                </span>
              </div>
              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
                Approved
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <Clock className="w-4 h-4 text-blue-500 shrink-0 animate-spin" />
                <span className="font-medium text-slate-900 dark:text-white truncate">
                  2. Telemetry Hardware Integration & Sensor Calibration
                </span>
              </div>
              <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 shrink-0">
                In Progress
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
