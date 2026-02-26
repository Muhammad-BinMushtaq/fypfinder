// components/student/ProfileCompletionProgress.tsx
"use client";

import { Check, Camera, FileText, Lightbulb, FolderGit2, Link2, ChevronRight, Sparkles } from "lucide-react";
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
  priority: number; // Lower = higher priority
}

export function ProfileCompletionProgress({ profile }: ProfileCompletionProgressProps) {
  // Define completion items with weights
  const items: CompletionItem[] = [
    {
      id: "photo",
      label: "Profile Picture",
      description: "Profiles with photos get 3x more requests",
      completed: !!profile.profilePicture,
      icon: Camera,
      priority: 1,
    },
    {
      id: "bio",
      label: "About You",
      description: "Tell others about your interests and goals",
      completed: !!profile.interests && profile.interests.trim().length > 0,
      icon: FileText,
      priority: 2,
    },
    {
      id: "skills",
      label: "Skills",
      description: "Add at least 3 skills to improve matching",
      completed: (profile.skills?.length || 0) >= 3,
      icon: Lightbulb,
      priority: 3,
    },
    {
      id: "projects",
      label: "Projects",
      description: "Showcase your work to potential partners",
      completed: (profile.projects?.length || 0) >= 1,
      icon: FolderGit2,
      priority: 4,
    },
    {
      id: "links",
      label: "Social Links",
      description: "Add GitHub or LinkedIn for credibility",
      completed: !!profile.linkedinUrl || !!profile.githubUrl,
      icon: Link2,
      priority: 5,
    },
  ];

  const completedCount = items.filter((i) => i.completed).length;
  const percentage = Math.round((completedCount / items.length) * 100);
  
  // Get the highest priority incomplete item
  const incompleteItems = items
    .filter((i) => !i.completed)
    .sort((a, b) => a.priority - b.priority);
  
  const nextAction = incompleteItems[0];

  // Don't show if profile is 100% complete
  if (percentage === 100) {
    return null;
  }

  // Calculate stroke dasharray for circular progress
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-800/80 border border-gray-200 dark:border-slate-700 rounded-xl p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
        {/* Progress Ring */}
        <div className="flex items-center gap-4 sm:gap-0">
          <div className="relative w-24 h-24 flex-shrink-0">
            <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-gray-200 dark:text-slate-700"
              />
              {/* Progress circle */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="text-gray-900 dark:text-white transition-all duration-500"
              />
            </svg>
            {/* Percentage in center */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{percentage}%</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">complete</span>
            </div>
          </div>

          {/* Mobile: Show quick stats */}
          <div className="sm:hidden flex-1">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
              Complete Your Profile
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {completedCount} of {items.length} items done
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Desktop Header */}
          <div className="hidden sm:flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Complete Your Profile
            </h3>
          </div>

          {/* Next Action Card */}
          {nextAction && (
            <div className="bg-white dark:bg-slate-700/50 rounded-lg p-3 border border-gray-200 dark:border-slate-600">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-600 flex items-center justify-center flex-shrink-0">
                  <nextAction.icon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Add {nextAction.label}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {nextAction.description}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
              </div>
            </div>
          )}

          {/* Completion Checklist */}
          <div className="mt-3 flex flex-wrap gap-2">
            {items.map((item) => (
              <div
                key={item.id}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                  item.completed
                    ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                    : "bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-gray-400"
                }`}
              >
                {item.completed ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <item.icon className="w-3 h-3" />
                )}
                <span className="hidden xs:inline">{item.label}</span>
                <span className="xs:hidden">{item.label.split(" ")[0]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
