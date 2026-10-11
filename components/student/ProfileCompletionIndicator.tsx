// components/student/ProfileCompletionIndicator.tsx
"use client";

import { CheckCircle, Circle } from "lucide-react";
import type { StudentProfile } from "@/services/student.service";

interface ProfileCompletionIndicatorProps {
  profile: StudentProfile;
}

interface CompletionItem {
  label: string;
  completed: boolean;
  weight: number;
}

export function ProfileCompletionIndicator({ profile }: ProfileCompletionIndicatorProps) {
  const completionItems: CompletionItem[] = [
    {
      label: "Profile picture",
      completed: !!profile.profilePicture,
      weight: 15,
    },
    {
      label: "Bio / Interests",
      completed: !!profile.interests && profile.interests.trim().length > 0,
      weight: 15,
    },
    {
      label: "Add at least 1 skill",
      completed: (profile.skills?.length || 0) >= 1,
      weight: 20,
    },
    {
      label: "Add at least 3 skills",
      completed: (profile.skills?.length || 0) >= 3,
      weight: 10,
    },
    {
      label: "Add at least 1 project",
      completed: (profile.projects?.length || 0) >= 1,
      weight: 20,
    },
    {
      label: "LinkedIn profile",
      completed: !!profile.linkedinUrl && profile.linkedinUrl.trim().length > 0,
      weight: 10,
    },
    {
      label: "GitHub profile",
      completed: !!profile.githubUrl && profile.githubUrl.trim().length > 0,
      weight: 10,
    },
  ];

  const totalWeight = completionItems.reduce((sum, item) => sum + item.weight, 0);
  const completedWeight = completionItems
    .filter((item) => item.completed)
    .reduce((sum, item) => sum + item.weight, 0);

  const percentage = Math.round((completedWeight / totalWeight) * 100);
  const completedCount = completionItems.filter((item) => item.completed).length;
  const totalCount = completionItems.length;

  const getStatusConfig = () => {
    if (percentage === 100) {
      return {
        color: "text-emerald-600 dark:text-emerald-400",
        bgColor: "bg-emerald-500",
        message: "Profile complete",
      };
    }
    if (percentage >= 70) {
      return {
        color: "text-slate-900 dark:text-white",
        bgColor: "bg-slate-900 dark:bg-white",
        message: "Almost complete",
      };
    }
    if (percentage >= 40) {
      return {
        color: "text-slate-700 dark:text-slate-300",
        bgColor: "bg-slate-700 dark:bg-slate-300",
        message: "In progress",
      };
    }
    return {
      color: "text-slate-500 dark:text-slate-400",
      bgColor: "bg-slate-400 dark:bg-slate-500",
      message: "Getting started",
    };
  };

  const status = getStatusConfig();

  if (percentage === 100) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Profile Completion</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">{status.message}</p>
        </div>
        <div className={`text-base font-bold ${status.color}`}>{percentage}%</div>
      </div>

      <div className="relative h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-4">
        <div
          className={`absolute left-0 top-0 h-full ${status.bgColor} rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="space-y-2">
        {completionItems.map((item, index) => (
          <div
            key={index}
            className={`flex items-center gap-2.5 text-xs ${
              item.completed
                ? "text-slate-400 dark:text-slate-500"
                : "text-slate-700 dark:text-slate-300"
            }`}
          >
            {item.completed ? (
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
            ) : (
              <Circle className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 flex-shrink-0" />
            )}
            <span className={item.completed ? "line-through opacity-80" : ""}>{item.label}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
        <p className="text-[11px] text-slate-400 dark:text-slate-500">
          {completedCount} of {totalCount} items completed
        </p>
      </div>
    </div>
  );
}
