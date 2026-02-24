// app/dashboard/profile/page.tsx
"use client";

import { useMyProfile } from "@/hooks/student/useMyProfile";
import { SkillsSection } from "@/components/student/SkillsSection";
import { ProjectsSection } from "@/components/student/ProjectsSection";
import { ProfileForm } from "@/components/student/ProfileForm";
import { ProfilePictureUpload } from "@/components/student/ProfilePictureUpload";
import { ProfileCompletionProgress } from "@/components/student/ProfileCompletionProgress";
import { getDepartmentLabel } from "@/lib/departments";
import { 
  AlertTriangle, 
  GraduationCap, 
  BookOpen,
  Github,
  Linkedin
} from "lucide-react";

export default function ProfilePage() {
  const { profile, isLoading, error } = useMyProfile();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Skeleton Progress */}
          <div className="h-28 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 animate-pulse" />
          
          {/* Skeleton Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-4 space-y-6">
              <div className="h-80 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 animate-pulse" />
            </div>
            {/* Right Column */}
            <div className="lg:col-span-8 space-y-6">
              <div className="h-64 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 animate-pulse" />
              <div className="h-48 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 animate-pulse" />
              <div className="h-48 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-slate-900 p-4">
        <div className="text-center bg-white dark:bg-slate-800 rounded-xl p-8 max-w-sm w-full border border-gray-100 dark:border-slate-700">
          <div className="w-14 h-14 mx-auto mb-4 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-7 h-7 text-red-600 dark:text-red-400" />
          </div>
          <p className="text-base font-semibold text-gray-900 dark:text-white mb-1">
            Failed to load profile
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
            {error?.message || "Please try refreshing the page"}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full px-4 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors text-sm"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  const getAvailabilityConfig = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return { 
          label: "Available", 
          dotColor: "bg-emerald-500",
          bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
          textColor: "text-emerald-700 dark:text-emerald-400"
        };
      case "BUSY":
        return { 
          label: "Busy", 
          dotColor: "bg-amber-500",
          bgColor: "bg-amber-50 dark:bg-amber-900/20",
          textColor: "text-amber-700 dark:text-amber-400"
        };
      case "AWAY":
        return { 
          label: "Away", 
          dotColor: "bg-gray-400",
          bgColor: "bg-gray-100 dark:bg-slate-700",
          textColor: "text-gray-600 dark:text-gray-400"
        };
      default:
        return { 
          label: status, 
          dotColor: "bg-gray-400",
          bgColor: "bg-gray-100 dark:bg-slate-700",
          textColor: "text-gray-600 dark:text-gray-400"
        };
    }
  };

  const availability = getAvailabilityConfig(profile.availability);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Progress Indicator - Top */}
        <ProfileCompletionProgress profile={profile} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden lg:sticky lg:top-6">
              {/* Profile Picture Section */}
              <div className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <ProfilePictureUpload 
                    currentPicture={profile.profilePicture}
                    studentId={profile.id}
                    name={profile.name}
                  />
                </div>

                {/* Name */}
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {profile.name}
                </h1>

                {/* Availability Badge */}
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 mt-2 rounded-full text-xs font-medium ${availability.bgColor} ${availability.textColor}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${availability.dotColor}`} />
                  {availability.label}
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-50 dark:border-slate-700/50" />

              {/* Info Section */
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <GraduationCap className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-300">
                    {getDepartmentLabel(profile.department)}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <BookOpen className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-300">
                    Semester {profile.semester}
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-50 dark:border-slate-700/50" />

              {/* Stats */}
              <div className="grid grid-cols-3 divide-x divide-gray-50 dark:divide-slate-700/50">
                <div className="p-4 text-center">
                  <div className="text-xl font-bold text-gray-900 dark:text-white">
                    {profile.skills?.length || 0}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Skills</div>
                </div>
                <div className="p-4 text-center">
                  <div className="text-xl font-bold text-gray-900 dark:text-white">
                    {profile.projects?.length || 0}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Projects</div>
                </div>
                <div className="p-4 text-center">
                  <div className="text-xl font-bold text-gray-900 dark:text-white">
                    {(profile.linkedinUrl ? 1 : 0) + (profile.githubUrl ? 1 : 0)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Links</div>
                </div>
              </div>

              {/* Social Links */}
              {(profile.linkedinUrl || profile.githubUrl) && (
                <>
                  <div className="border-t border-gray-50 dark:border-slate-700/50" />
                  <div className="p-4 flex gap-2">
                    {profile.githubUrl && (
                      <a
                        href={profile.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors"
                      >
                        <Github className="w-4 h-4" />
                        GitHub
                      </a>
                    )}
                    {profile.linkedinUrl && (
                      <a
                        href={profile.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors"
                      >
                        <Linkedin className="w-4 h-4" />
                        LinkedIn
                      </a>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right Column - Content Sections */}
          <div className="lg:col-span-8 space-y-6">
            {/* Bio Preview */}
            {profile.interests && (
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-5">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  About
                </h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                  {profile.interests}
                </p>
              </div>
            )}

            {/* Profile Form */}
            <ProfileForm profile={profile} />

            {/* Skills Section */}
            <SkillsSection skills={profile.skills || []} />

            {/* Projects Section */}
            <ProjectsSection projects={profile.projects || []} />
          </div>
        </div>
      </div>
    </div>
  );
}
