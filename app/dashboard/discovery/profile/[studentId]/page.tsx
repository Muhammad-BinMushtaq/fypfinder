// app/dashboard/discovery/profile/[studentId]/page.tsx
"use client";

/**
 * Public Student Profile Page
 * ---------------------------
 * Displays a student's PUBLIC profile (read-only).
 * Path: /dashboard/discovery/profile/[studentId]
 * 
 * Responsibilities:
 * - Auth enforcement via useRequireAuth()
 * - Layout composition
 * - Pass current user info for request buttons
 * 
 * Data Flow:
 * Page → useRequireAuth() → usePublicProfile() → studentPublic.service.ts → Backend
 */

import { useParams } from "next/navigation";
import { useRequireAuth } from "@/hooks/auth/useRequireAuth";
import { usePublicProfile } from "@/hooks/student/usePublicProfile";
import { useMyProfile } from "@/hooks/student/useMyProfile";
import { PublicProfileView } from "@/components/student/PublicProfileView";
import Link from "next/link";

export default function PublicProfilePage() {
  // Get studentId from URL params
  const params = useParams();
  const studentId = params?.studentId as string;

  // 🔐 Auth enforcement - redirects if not logged in
  const { user, isLoading: authLoading } = useRequireAuth();

  // 📊 Current user's profile (for request buttons)
  const { profile: myProfile } = useMyProfile();

  // 📊 Public profile data
  const { profile, isLoading, isError, error } = usePublicProfile(studentId, {
    enabled: !!user && !!studentId, // Only fetch if authenticated
  });

  // Auth loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 rounded-full"></div>
            <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <p className="text-gray-600 mt-6 font-medium">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-blue-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <p className="text-gray-600 font-medium">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // No studentId provided
  if (!studentId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-yellow-100 rounded-full flex items-center justify-center">
              <span className="text-5xl">❓</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              Invalid Profile URL
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              No student ID was provided in the URL. Please go back to discovery.
            </p>
            <Link
              href="/dashboard/discovery"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30"
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

  // Loading state with beautiful skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Back button skeleton */}
          <div className="mb-6">
            <div className="h-6 w-40 bg-gray-200/80 rounded-lg animate-pulse"></div>
          </div>

          {/* Profile header skeleton */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 overflow-hidden mb-6">
            <div className="h-32 sm:h-40 bg-gradient-to-r from-blue-400/50 to-indigo-400/50 animate-pulse"></div>
            <div className="px-6 sm:px-8 pb-6 sm:pb-8 -mt-16">
              <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6">
                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl bg-gray-200/80 animate-pulse border-4 border-white shadow-lg"></div>
                <div className="flex-1 pb-2 space-y-3">
                  <div className="h-8 w-56 bg-gray-200/80 rounded-lg animate-pulse"></div>
                  <div className="h-5 w-40 bg-gray-200/80 rounded-lg animate-pulse"></div>
                  <div className="flex gap-3">
                    <div className="h-8 w-24 bg-gray-200/80 rounded-full animate-pulse"></div>
                    <div className="h-8 w-32 bg-gray-200/80 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Skills skeleton */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 overflow-hidden mb-6">
            <div className="h-20 bg-gradient-to-r from-blue-400/50 to-indigo-400/50 animate-pulse"></div>
            <div className="p-6 sm:p-8">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-20 bg-gray-100/80 rounded-xl animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>

          {/* Projects skeleton */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 overflow-hidden">
            <div className="h-20 bg-gradient-to-r from-emerald-400/50 to-teal-400/50 animate-pulse"></div>
            <div className="p-6 sm:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2].map((i) => (
                  <div key={i} className="h-32 bg-gray-100/80 rounded-xl animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>

          {/* Pulsing loader overlay */}
          <div className="fixed bottom-8 right-8 z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-4 flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 border-4 border-blue-200 rounded-full"></div>
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
              </div>
              <span className="text-sm font-medium text-gray-700">Loading profile...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Back button */}
          <Link
            href="/dashboard/discovery"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors mb-6 group"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">Back to Discovery</span>
          </Link>

          {/* Error message */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-8 sm:p-12 text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-5xl">😕</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              {error instanceof Error && error.message.includes("not found")
                ? "Student Not Found"
                : "Failed to Load Profile"}
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {error instanceof Error
                ? error.message
                : "We couldn't load this student's profile. Please try again."}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/dashboard/discovery"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25"
              >
                Back to Discovery
              </Link>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <Link
            href="/dashboard/discovery"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors mb-6 group"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">Back to Discovery</span>
          </Link>

          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-8 sm:p-12 text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-amber-100 rounded-full flex items-center justify-center">
              <span className="text-5xl">🔍</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              Student Not Found
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              This student profile doesn't exist or is no longer available.
            </p>
            <Link
              href="/dashboard/discovery"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25"
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <PublicProfileView 
          profile={profile} 
          currentStudentId={myProfile?.id}
          currentSemester={myProfile?.semester}
        />
      </div>
    </div>
  );
}
