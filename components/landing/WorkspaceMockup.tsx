// components/landing/WorkspaceMockup.tsx
"use client";

import { Lock, CheckCircle2, Clock } from "lucide-react";

export function WorkspaceMockup() {
  return (
    <div className="w-full max-w-md mx-auto">
      {/* Minimal Team Workspace Mockup */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden p-5 sm:p-6 transition-all space-y-5">
        {/* Top Lock Status Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium text-xs">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Team Roster (3/3 Students)</span>
          </div>
          <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200/60 dark:border-slate-700/60">
            Locked
          </span>
        </div>

        {/* Project Header Info */}
        <div className="space-y-0.5">
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider block">
            Approved FYP Project
          </span>
          <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
            Smart Campus Shuttle Tracking & Dispatch
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Computer Science & IT • Supervisor: Dr. M. S. Qureshi
          </p>
        </div>

        {/* Official Team Roster */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
            Team Members
          </span>
          <div className="grid grid-cols-3 gap-2">
            {[
              { name: "Ahmed K.", role: "Lead / Backend", initials: "AK" },
              { name: "Sara M.", role: "Frontend UI", initials: "SM" },
              { name: "Zain T.", role: "Mobile App", initials: "ZT" },
            ].map((member) => (
              <div
                key={member.name}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex flex-col items-center text-center"
              >
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center mb-1.5">
                  {member.initials}
                </div>
                <p className="text-xs font-semibold text-slate-900 dark:text-white truncate w-full">
                  {member.name}
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate w-full">
                  {member.role}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Milestone Tracker */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Deliverables</span>
            <span className="text-[11px]">Semester 7</span>
          </div>

          <div className="space-y-1.5">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="text-slate-700 dark:text-slate-300 truncate">
                  Literature Review & Defense Proposal
                </span>
              </div>
              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
                Passed
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-slate-700 dark:text-slate-300 truncate">
                  Prototype Demo & Sensor Integration
                </span>
              </div>
              <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 shrink-0">
                In Progress
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
