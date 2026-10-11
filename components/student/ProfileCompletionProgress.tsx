// components/student/ProfileCompletionProgress.tsx
"use client";

import { Check, Camera, FileText, Lightbulb, FolderGit2, Link2, ArrowRight } from "lucide-react";
import type { StudentProfile } from "@/services/student.service";

interface ProfileCompletionProgressProps {
  profile: StudentProfile;
}

interface CompletionItem {
  id: string;
  label: string;
  description: string;
  completed: boolean;
  icon: React.ElementType;
  priority: number;
}

export function ProfileCompletionProgress({ profile }: ProfileCompletionProgressProps) {
  const items: CompletionItem[] = [
    {
      id: "photo",
      label: "Profile Picture",
      description: "Profiles with photos get 3x more collaboration requests",
      completed: !!profile.profilePicture,
      icon: Camera,
      priority: 1,
    },
    {
      id: "bio",
      label: "About You",
      description: "Introduce your interests, FYP goals, and working style",
      completed: !!profile.interests && profile.interests.trim().length > 0,
      icon: FileText,
      priority: 2,
    },
    {
      id: "skills",
      label: "Skills (3+)",
      description: "List at least 3 skills to improve automated partner matching",
      completed: (profile.skills?.length || 0) >= 3,
      icon: Lightbulb,
      priority: 3,
    },
    {
      id: "projects",
      label: "Projects",
      description: "Showcase your work and implementation skills",
      completed: (profile.projects?.length || 0) >= 1,
      icon: FolderGit2,
      priority: 4,
    },
    {
      id: "links",
      label: "GitHub / LinkedIn",
      description: "Add links to verify your code and professional background",
      completed: !!profile.linkedinUrl || !!profile.githubUrl,
      icon: Link2,
      priority: 5,
    },
  ];

  // Calculate completion percentage
  let percentage = 15; // Base 15% for Department + Semester
  if (profile.profilePicture) percentage += 15;
  if (profile.interests && profile.interests.trim().length > 0) percentage += 15;
  if ((profile.skills?.length || 0) >= 3) percentage += 20;
  if ((profile.projects?.length || 0) >= 1) percentage += 20;
  if (profile.linkedinUrl || profile.githubUrl) percentage += 15;

  const completedCount = items.filter((i) => i.completed).length;

  const incompleteItems = items
    .filter((i) => !i.completed)
    .sort((a, b) => a.priority - b.priority);

  const nextAction = incompleteItems[0];

  // Don't show banner if profile is 100% complete
  if (percentage === 100) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900/60 p-5 sm:p-6 shadow-xs space-y-4">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Profile Completion
            </h2>
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
              • {completedCount} of {items.length} tasks complete
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            A complete profile helps potential teammates evaluate your technical fit.
          </p>
        </div>

        {/* Minimal Score Badge */}
        <div className="self-start sm:self-auto flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700/70 text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="font-bold">{percentage}%</span>
            <span className="text-slate-400 dark:text-slate-500 font-normal">Score</span>
          </div>
        </div>
      </div>

      {/* Sleek Linear Progress Bar */}
      <div className="space-y-1.5">
        <div className="relative h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${
              percentage >= 80
                ? "bg-emerald-500"
                : percentage >= 50
                ? "bg-slate-900 dark:bg-white"
                : "bg-slate-700 dark:bg-slate-300"
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Checklist Badges */}
      <div className="flex flex-wrap gap-2 pt-1">
        {items.map((item) => {
          const ItemIcon = item.icon;
          return (
            <div
              key={item.id}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                item.completed
                  ? "bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 border border-slate-200/70 dark:border-slate-700/70"
                  : "bg-transparent text-slate-400 dark:text-slate-500 border border-dashed border-slate-300 dark:border-slate-700"
              }`}
            >
              {item.completed ? (
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <ItemIcon className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
              )}
              <span>{item.label}</span>
            </div>
          );
        })}
      </div>

      {/* Recommended Next Action Banner */}
      {nextAction && (
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 shrink-0">
              Recommended:
            </span>
            <p className="text-slate-700 dark:text-slate-300 truncate">
              <span className="font-semibold text-slate-900 dark:text-white">Add {nextAction.label}</span> — {nextAction.description}
            </p>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0 hidden sm:block" />
        </div>
      )}
    </div>
  );
}
