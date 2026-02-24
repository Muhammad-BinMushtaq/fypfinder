// components/student/ProfileCompletionProgress.tsx
"use client";

import { Check } from "lucide-react";
import type { StudentProfile } from "@/services/student.service";

interface ProfileCompletionProgressProps {
  profile: StudentProfile;
}

interface CompletionStep {
  label: string;
  shortLabel: string;
  completed: boolean;
}

export function ProfileCompletionProgress({ profile }: ProfileCompletionProgressProps) {
  // Define completion steps
  const steps: CompletionStep[] = [
    {
      label: "Profile Picture",
      shortLabel: "Photo",
      completed: !!profile.profilePicture,
    },
    {
      label: "Bio",
      shortLabel: "Bio",
      completed: !!profile.interests && profile.interests.trim().length > 0,
    },
    {
      label: "Skills",
      shortLabel: "Skills",
      completed: (profile.skills?.length || 0) >= 1,
    },
    {
      label: "Projects",
      shortLabel: "Projects",
      completed: (profile.projects?.length || 0) >= 1,
    },
    {
      label: "Social Links",
      shortLabel: "Links",
      completed: !!profile.linkedinUrl || !!profile.githubUrl,
    },
  ];

  const completedCount = steps.filter((s) => s.completed).length;
  const percentage = Math.round((completedCount / steps.length) * 100);

  // Don't show if profile is 100% complete
  if (percentage === 100) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Complete Your Profile
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {completedCount} of {steps.length} completed
          </p>
        </div>
        <div className="text-lg font-bold text-gray-900 dark:text-white">
          {percentage}%
        </div>
      </div>

      {/* Progress Steps - Connected Bubbles */}
      <div className="relative">
        {/* Connection Line */}
        <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-200 dark:bg-slate-700" />
        <div 
          className="absolute top-4 left-4 h-0.5 bg-gray-900 dark:bg-white transition-all duration-500"
          style={{ width: `calc(${((completedCount - 1) / (steps.length - 1)) * 100}% - 2rem)` }}
        />

        {/* Steps */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center">
              {/* Circle */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                  step.completed
                    ? "bg-gray-900 dark:bg-white border-gray-900 dark:border-white"
                    : "bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600"
                }`}
              >
                {step.completed ? (
                  <Check className="w-4 h-4 text-white dark:text-gray-900" />
                ) : (
                  <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
                    {index + 1}
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                className={`mt-2 text-xs font-medium text-center ${
                  step.completed
                    ? "text-gray-900 dark:text-white"
                    : "text-gray-400 dark:text-gray-500"
                }`}
              >
                <span className="hidden sm:inline">{step.label}</span>
                <span className="sm:hidden">{step.shortLabel}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
