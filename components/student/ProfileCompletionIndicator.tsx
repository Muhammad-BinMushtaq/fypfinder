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
  // Calculate completion based on profile fields
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

  // Get status color and message
  const getStatusConfig = () => {
    if (percentage === 100) {
      return {
        color: "text-emerald-600 dark:text-emerald-400",
        bgColor: "bg-emerald-500",
        bgLight: "bg-emerald-100 dark:bg-emerald-900/30",
        message: "Profile complete!",
      };
    }
    if (percentage >= 70) {
      return {
        color: "text-blue-600 dark:text-blue-400",
        bgColor: "bg-blue-500",
        bgLight: "bg-blue-100 dark:bg-blue-900/30",
        message: "Almost there!",
      };
    }
    if (percentage >= 40) {
      return {
        color: "text-amber-600 dark:text-amber-400",
        bgColor: "bg-amber-500",
        bgLight: "bg-amber-100 dark:bg-amber-900/30",
        message: "Good progress",
      };
    }
    return {
      color: "text-gray-600 dark:text-gray-400",
      bgColor: "bg-gray-400 dark:bg-gray-500",
      bgLight: "bg-gray-100 dark:bg-gray-800",
      message: "Let's get started",
    };
  };

  const status = getStatusConfig();

  // Don't show if profile is 100% complete
  if (percentage === 100) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">Complete Your Profile</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{status.message}</p>
        </div>
        <div className={`text-2xl font-bold ${status.color}`}>{percentage}%</div>
      </div>

      {/* Progress bar */}
      <div className="relative h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden mb-4">
        <div
          className={`absolute left-0 top-0 h-full ${status.bgColor} rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Completion checklist */}
      <div className="space-y-2">
        {completionItems.map((item, index) => (
          <div
            key={index}
            className={`flex items-center gap-2.5 text-sm ${
              item.completed
                ? "text-gray-400 dark:text-gray-500"
                : "text-gray-700 dark:text-gray-300"
            }`}
          >
            {item.completed ? (
              <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            ) : (
              <Circle className="w-4 h-4 text-gray-300 dark:text-gray-600 flex-shrink-0" />
            )}
            <span className={item.completed ? "line-through" : ""}>{item.label}</span>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {completedCount} of {totalCount} items completed
        </p>
      </div>
    </div>
  );
}
