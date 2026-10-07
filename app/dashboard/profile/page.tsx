// app/dashboard/profile/page.tsx
"use client";

import { useMyProfile } from "@/hooks/student/useMyProfile";
import { SkillsSection } from "@/components/student/SkillsSection";
import { ProjectsSection } from "@/components/student/ProjectsSection";
import { ProfileForm } from "@/components/student/ProfileForm";
import { ProfileCompletionProgress } from "@/components/student/ProfileCompletionProgress";
import { InternshipsSection } from "@/components/student/InternshipsSection";
import { IdentityCard } from "@/components/student/IdentityCard";
import { AlertTriangle } from "lucide-react";

export default function ProfilePage() {
  const { profile, isLoading, error, refetch } = useMyProfile();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-transparent text-slate-900 dark:text-slate-100 px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="h-28 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-800 animate-pulse" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 space-y-6">
              <div className="h-96 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-800 animate-pulse" />
            </div>
            <div className="lg:col-span-8 space-y-6">
              <div className="h-64 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-800 animate-pulse" />
              <div className="h-64 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-800 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <div className="text-center bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-sm w-full border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="w-14 h-14 mx-auto mb-4 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-7 h-7 text-red-600 dark:text-red-400" />
          </div>
          <p className="text-base font-semibold text-slate-900 dark:text-white mb-1">
            Failed to load profile
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            {error?.message || "Please try refreshing the page"}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full px-4 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors text-sm shadow-sm"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-slate-900 dark:text-slate-100 px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="max-w-5xl mx-auto space-y-8">
        <ProfileCompletionProgress profile={profile} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-4">
            <IdentityCard profile={profile} />
          </div>

          <div className="lg:col-span-8 space-y-6">
            <ProfileForm profile={profile} />
            <SkillsSection skills={profile.skills || []} />
            <ProjectsSection projects={profile.projects || []} />
            <InternshipsSection internships={profile.internships || []} onUpdate={() => refetch()} />
          </div>
        </div>
      </div>
    </div>
  );
}
