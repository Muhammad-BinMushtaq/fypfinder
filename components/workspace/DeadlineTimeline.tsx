"use client";

import { Flag, CheckCircle2 } from "lucide-react";

const MILESTONES = [
  { id: 1, title: "Proposal Submission", duration: "Week 3", status: "past" },
  { id: 2, title: "Mid-term Evaluation", duration: "Week 8", status: "current" },
  { id: 3, title: "Final Defense", duration: "Week 15", status: "future" },
  { id: 4, title: "Documentation Deadline", duration: "Week 16", status: "future" },
];

export function DeadlineTimeline() {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">FYP Milestones</h3>
        <span className="rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 px-3 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
          Academic Year 2026-2027
        </span>
      </div>

      <div className="relative">
        {/* Continuous line */}
        <div className="absolute left-[15px] top-4 bottom-4 w-[2px] bg-slate-200 dark:bg-slate-800 sm:left-1/2 sm:-ml-[1px]" />
        
        <div className="space-y-8">
          {MILESTONES.map((milestone, i) => {
            const isLeft = i % 2 === 0;
            return (
              <div key={milestone.id} className="relative flex items-center sm:justify-between">
                
                {/* Desktop Left Content */}
                <div className={`hidden sm:block w-1/2 ${isLeft ? "pr-10 text-right" : "pl-10 opacity-0"}`}>
                  {isLeft && (
                    <>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{milestone.title}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{milestone.duration}</p>
                    </>
                  )}
                </div>

                {/* Node */}
                <div className="absolute left-0 sm:left-1/2 -ml-0 sm:-ml-4 flex h-8 w-8 items-center justify-center rounded-full bg-white dark:bg-slate-900 z-10 border-4 border-white dark:border-slate-900">
                  {milestone.status === "past" ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : milestone.status === "current" ? (
                    <div className="h-4 w-4 rounded-full bg-amber-500 ring-4 ring-amber-100 dark:ring-amber-900/40" />
                  ) : (
                    <div className="h-3 w-3 rounded-full bg-gray-300 dark:bg-slate-600" />
                  )}
                </div>

                {/* Mobile Content & Desktop Right Content */}
                <div className={`ml-12 w-full sm:ml-0 sm:w-1/2 ${!isLeft ? "sm:pl-10" : "sm:pr-10 sm:opacity-0"}`}>
                  <h4 className={`font-semibold text-gray-900 dark:text-white ${milestone.status === 'past' ? 'text-gray-500' : ''}`}>
                    {milestone.title}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{milestone.duration}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
