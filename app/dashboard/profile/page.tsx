// app/dashboard/profile/page.tsx
"use client";

import { useMyProfile } from "@/hooks/student/useMyProfile";
import { SkillsSection } from "@/components/student/SkillsSection";
import { ProjectsSection } from "@/components/student/ProjectsSection";
import { ProfileForm } from "@/components/student/ProfileForm";

export default function ProfilePage() {
  const { profile, isLoading, error } = useMyProfile();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mb-4">
            <div className="w-12 h-12 border-4 border-white border-t-blue-200 rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading your profile...</p>
          <p className="text-gray-500 text-sm mt-2">Just a moment</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center bg-white rounded-2xl p-8 shadow-lg">
          <div className="text-6xl mb-4">⚠️</div>
          <p className="text-lg font-bold text-gray-900">Failed to load profile</p>
          <p className="text-gray-600 mt-2">
            {error?.message || "Please try refreshing the page"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-10 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent mb-3">
            My Profile
          </h1>
          <p className="text-gray-600 text-lg">
            Manage your information, skills, and showcase your projects
          </p>
        </div>

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
