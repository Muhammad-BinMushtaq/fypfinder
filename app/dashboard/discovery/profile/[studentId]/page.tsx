// app/dashboard/discovery/profile/[studentId]/page.tsx
"use client";

/**
 * Public Student Profile Page
 * ---------------------------
 * Displays a student's PUBLIC profile (read-only).
 * Path: /dashboard/discovery/profile/[studentId]
 * 
 * Responsibilities:
 * - Layout composition
 * - Pass current user info for request buttons
 * 
 * Note: Auth is enforced by DashboardLayout (parent)
 * 
 * Data Flow:
 * Page → usePublicProfile() → studentPublic.service.ts → Backend
 */

import { useParams } from "next/navigation";
import { usePublicProfile } from "@/hooks/student/usePublicProfile";
import { useMyProfile } from "@/hooks/student/useMyProfile";
import { useMyGroup } from "@/hooks/group/useMyGroup";
import { PublicProfileView } from "@/components/student/PublicProfileView";
import Link from "next/link";

export default function PublicProfilePage() {
  // Get studentId from URL params
  const params = useParams();
  const studentId = params?.studentId as string;

  // 📊 Current user's profile (for request buttons)
  const { profile: myProfile } = useMyProfile();

  // 📊 Current user's group status
  const { isInGroup, isGroupLocked } = useMyGroup();

  // 📊 Public profile data
  const { profile, isLoading, isError, error } = usePublicProfile(studentId, {
    enabled: !!studentId,
  });

  // No studentId provided
  if (!studentId) {
    return (
      <div className="min-h-screen bg-transparent text-slate-900 dark:text-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
              <span className="text-4xl">❓</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-3">
              Invalid Profile URL
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
              No student ID was provided in the URL. Please go back to discovery.
            </p>
            <Link
              href="/dashboard/discovery"
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Discovery
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-transparent text-slate-900 dark:text-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="space-y-8 pb-16">
            {/* Back button skeleton */}
            <div className="h-5 w-36 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Sticky Profile Card Skeleton */}
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-sm">
                  {/* Avatar */}
                  <div className="w-24 h-24 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse mb-4 mx-auto sm:mx-0" />
                  
                  {/* Name */}
                  <div className="h-7 w-44 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse mx-auto sm:mx-0" />

                  {/* Status Badges */}
                  <div className="mt-3 flex gap-2 justify-center sm:justify-start">
                    <div className="h-6 w-24 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse" />
                    <div className="h-6 w-28 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse" />
                  </div>

                  {/* Academic Info */}
                  <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3">
                    <div className="h-4 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                    <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                    <div className="h-4 w-40 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                  </div>

                  {/* Role Badges */}
                  <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                    <div className="h-6 w-20 bg-slate-200 dark:bg-slate-800 rounded-md animate-pulse" />
                    <div className="h-6 w-24 bg-slate-200 dark:bg-slate-800 rounded-md animate-pulse" />
                  </div>

                  {/* Social links */}
                  <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                    <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
                    <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
                  </div>

                  {/* Parallel Action Buttons (50/50) */}
                  <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
                      <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Details Skeleton */}
              <div className="lg:col-span-8 space-y-8">
                {/* Professional Profile Skeleton */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-sm space-y-4">
                  <div className="h-6 w-44 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
                  <div className="space-y-2 pt-2">
                    <div className="h-4 w-full bg-slate-100 dark:bg-slate-800/60 rounded animate-pulse" />
                    <div className="h-4 w-5/6 bg-slate-100 dark:bg-slate-800/60 rounded animate-pulse" />
                    <div className="h-4 w-3/4 bg-slate-100 dark:bg-slate-800/60 rounded animate-pulse" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="h-14 bg-slate-100 dark:bg-slate-800/60 rounded-xl animate-pulse" />
                    <div className="h-14 bg-slate-100 dark:bg-slate-800/60 rounded-xl animate-pulse" />
                  </div>
                </div>

                {/* Skills Skeleton */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-sm space-y-4">
                  <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800/60 rounded-xl animate-pulse" />
                    ))}
                  </div>
                </div>

                {/* Projects Skeleton */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-sm space-y-4">
                  <div className="h-6 w-36 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="h-28 bg-slate-100 dark:bg-slate-800/60 rounded-xl animate-pulse" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="min-h-screen bg-transparent text-slate-900 dark:text-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Back button */}
          <Link
            href="/dashboard/discovery"
            className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors mb-6"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium">Back to Discovery</span>
          </Link>

          {/* Error message */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 sm:p-12 text-center shadow-sm">
            <div className="w-20 h-20 mx-auto mb-6 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
              <span className="text-4xl">😕</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-3">
              {error instanceof Error && error.message.includes("not found")
                ? "Student Not Found"
                : "Failed to Load Profile"}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
              {error instanceof Error
                ? error.message
                : "We couldn't load this student's profile. Please try again."}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/dashboard/discovery"
                className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
              >
                Back to Discovery
              </Link>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Profile not found
  if (!profile) {
    return (
      <div className="min-h-screen bg-transparent text-slate-900 dark:text-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <Link
            href="/dashboard/discovery"
            className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors mb-6"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium">Back to Discovery</span>
          </Link>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 sm:p-12 text-center shadow-sm">
            <div className="w-20 h-20 mx-auto mb-6 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
              <span className="text-4xl">🔍</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-3">
              Student Not Found
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
              This student profile doesn't exist or is no longer available.
            </p>
            <Link
              href="/dashboard/discovery"
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
            >
              Browse Students
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Success - render profile
  return (
    <div className="min-h-screen bg-transparent text-slate-900 dark:text-slate-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <PublicProfileView 
          profile={profile} 
          currentStudentId={myProfile?.id}
          currentSemester={myProfile?.semester}
          isUserInGroup={isInGroup}
          isUserGroupLocked={isGroupLocked}
        />
      </div>
    </div>
  );
}
