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
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
              <span className="text-4xl">❓</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
              Invalid Profile URL
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
              No student ID was provided in the URL. Please go back to discovery.
            </p>
            <Link
              href="/dashboard/discovery"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
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
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Back button skeleton */}
          <div className="mb-6">
            <div className="h-5 w-32 bg-gray-200 dark:bg-slate-700 rounded animate-pulse"></div>
          </div>

          {/* Profile header skeleton */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 sm:p-8 mb-6">
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-xl bg-gray-200 dark:bg-slate-700 animate-pulse mx-auto sm:mx-0"></div>
              <div className="flex-1 space-y-4">
                <div className="h-8 w-48 bg-gray-200 dark:bg-slate-700 rounded animate-pulse mx-auto sm:mx-0"></div>
                <div className="flex gap-2 justify-center sm:justify-start">
                  <div className="h-8 w-24 bg-gray-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
                  <div className="h-8 w-28 bg-gray-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
                </div>
                <div className="flex gap-2 justify-center sm:justify-start">
                  <div className="h-8 w-24 bg-gray-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
                  <div className="h-8 w-32 bg-gray-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Skills skeleton */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 mb-6">
            <div className="h-6 w-24 bg-gray-200 dark:bg-slate-700 rounded animate-pulse mb-4"></div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-20 bg-gray-100 dark:bg-slate-700 rounded-xl animate-pulse"></div>
              ))}
            </div>
          </div>

          {/* Projects skeleton */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6">
            <div className="h-6 w-24 bg-gray-200 dark:bg-slate-700 rounded animate-pulse mb-4"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-28 bg-gray-100 dark:bg-slate-700 rounded-xl animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Back button */}
          <Link
            href="/dashboard/discovery"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-6"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium">Back to Discovery</span>
          </Link>

          {/* Error message */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-8 sm:p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
              <span className="text-4xl">😕</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
              {error instanceof Error && error.message.includes("not found")
                ? "Student Not Found"
                : "Failed to Load Profile"}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
              {error instanceof Error
                ? error.message
                : "We couldn't load this student's profile. Please try again."}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/dashboard/discovery"
                className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
              >
                Back to Discovery
              </Link>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
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
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <Link
            href="/dashboard/discovery"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-6"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium">Back to Discovery</span>
          </Link>

          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-8 sm:p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
              <span className="text-4xl">🔍</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
              Student Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
              This student profile doesn't exist or is no longer available.
            </p>
            <Link
              href="/dashboard/discovery"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
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
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
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
