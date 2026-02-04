// app/dashboard/profile/page.tsx
"use client";

import { useMyProfile } from "@/hooks/student/useMyProfile";
import { SkillsSection } from "@/components/student/SkillsSection";
import { ProjectsSection } from "@/components/student/ProjectsSection";
import { ProfileForm } from "@/components/student/ProfileForm";
import { ProfilePictureUpload } from "@/components/student/ProfilePictureUpload";

export default function ProfilePage() {
  const { profile, isLoading, error } = useMyProfile();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
        {/* Skeleton Header */}
        <div className="relative overflow-hidden">
          <div className="h-48 sm:h-56 bg-gradient-to-r from-indigo-400 to-purple-400 animate-pulse"></div>
          <div className="max-w-5xl mx-auto px-4 relative">
            <div className="flex flex-col items-center -mt-20">
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gray-300 animate-pulse border-4 border-white shadow-xl"></div>
              <div className="mt-4 w-48 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="mt-2 w-32 h-5 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
        {/* Skeleton Content */}
        <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
          <div className="h-64 bg-white rounded-2xl shadow animate-pulse"></div>
          <div className="h-48 bg-white rounded-2xl shadow animate-pulse"></div>
          <div className="h-48 bg-white rounded-2xl shadow animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
        <div className="text-center bg-white rounded-3xl p-10 shadow-xl border border-gray-100 max-w-md mx-4">
          <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-4xl">⚠️</span>
          </div>
          <p className="text-xl font-bold text-gray-900 mb-2">Failed to load profile</p>
          <p className="text-gray-600">
            {error?.message || "Please try refreshing the page"}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  const getAvailabilityConfig = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return { label: "Available for FYP", color: "bg-green-100 text-green-700 border-green-200", icon: "🟢" };
      case "BUSY":
        return { label: "Busy", color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: "🟡" };
      case "AWAY":
        return { label: "Away", color: "bg-gray-100 text-gray-700 border-gray-200", icon: "⚫" };
      default:
        return { label: status, color: "bg-gray-100 text-gray-700 border-gray-200", icon: "⚫" };
    }
  };

  const availability = getAvailabilityConfig(profile.availability);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Clean Header Section */}
      <div className="relative">
        {/* Gradient Cover - Clean & Simple */}
        <div className="h-32 sm:h-40 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 relative overflow-hidden">
          {/* Subtle Pattern Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.1)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.1)_50%,rgba(255,255,255,0.1)_75%,transparent_75%)] bg-[length:60px_60px]"></div>
        </div>

        {/* Profile Card - Overlapping the cover */}
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 -mt-16 sm:-mt-20 relative z-10 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {/* Profile Picture Upload Component */}
              <div className="flex-shrink-0">
                <ProfilePictureUpload 
                  currentPicture={profile.profilePicture}
                  studentId={profile.id}
                  name={profile.name}
                />
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center sm:text-left sm:pt-4">
                {/* Quick Info Badges */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-4">
                  {/* Department Badge */}
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 rounded-lg text-sm font-medium text-indigo-700 border border-indigo-100">
                    🎓 {profile.department}
                  </span>
                  
                  {/* Semester Badge */}
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 rounded-lg text-sm font-medium text-purple-700 border border-purple-100">
                    📚 Semester {profile.semester}
                  </span>
                  
                  {/* Availability Badge */}
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold border ${availability.color}`}>
                    {availability.icon} {availability.label}
                  </span>
                </div>

                {/* Bio/Interests Preview */}
                {profile.interests && (
                  <p className="text-gray-600 text-sm line-clamp-2 mb-4 max-w-xl">
                    {profile.interests}
                  </p>
                )}

                {/* Stats Row */}
                <div className="flex items-center justify-center sm:justify-start gap-8">
                  <div className="text-center sm:text-left">
                    <div className="text-2xl font-bold text-gray-900">{profile.skills?.length || 0}</div>
                    <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Skills</div>
                  </div>
                  <div className="w-px h-10 bg-gray-200"></div>
                  <div className="text-center sm:text-left">
                    <div className="text-2xl font-bold text-gray-900">{profile.projects?.length || 0}</div>
                    <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Projects</div>
                  </div>
                  <div className="w-px h-10 bg-gray-200 hidden sm:block"></div>
                  <div className="text-center sm:text-left hidden sm:block">
                    <div className="text-2xl font-bold text-gray-900">
                      {profile.linkedinUrl || profile.githubUrl ? "2" : "0"}
                    </div>
                    <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Links</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Profile Form */}
        <ProfileForm profile={profile} />

        {/* Skills Section */}
        <SkillsSection skills={profile.skills || []} />

        {/* Projects Section */}
        <ProjectsSection projects={profile.projects || []} />
      </div>
    </div>
  );
}
