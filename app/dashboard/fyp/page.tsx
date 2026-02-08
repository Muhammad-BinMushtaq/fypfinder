// app/dashboard/fyp/page.tsx
"use client";

import { useState } from "react";
import { useMyGroup, useUpdateGroupProject, useUpdateGroupVisibility } from "@/hooks/group/useMyGroup";
import { useMyProfile } from "@/hooks/student/useMyProfile";
import { Users, Lock, Unlock, Eye, EyeOff, Edit2, Save, X, AlertCircle } from "lucide-react";

export default function FYPManagementPage() {
  const { group, isLoading, isInGroup, isGroupLocked } = useMyGroup();
  const { profile } = useMyProfile();
  const updateProject = useUpdateGroupProject();
  const updateVisibility = useUpdateGroupVisibility();

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="animate-spin w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Not in a group
  if (!isInGroup || !group) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-lg w-full text-center">
          <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
            <Users className="w-16 h-16 text-indigo-500" />
          </div>
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sm:p-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              No FYP Group Yet
            </h1>
            <p className="text-gray-600 mb-8 leading-relaxed">
              You haven't joined or created an FYP group yet. Head over to the 
              Discovery page to find partners and form your team!
            </p>
            <a
              href="/dashboard/discovery"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
            >
              <Users className="w-5 h-5" />
              Find Partners
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Find current user in members list
  const currentMember = group.members.find((m) => m.id === profile?.id);
  const showGroupOnProfile = currentMember?.showGroupOnProfile ?? true;

  // Start editing
  const handleStartEdit = () => {
    setProjectName(group.projectName || "");
    setDescription(group.description || "");
    setIsEditing(true);
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setIsEditing(false);
    setProjectName("");
    setDescription("");
  };

  // Save project details
  const handleSaveProject = () => {
    if (!projectName.trim()) return;
    updateProject.mutate(
      { projectName: projectName.trim(), description: description.trim() || undefined },
      { onSuccess: () => setIsEditing(false) }
    );
  };

  // Toggle visibility
  const handleToggleVisibility = () => {
    updateVisibility.mutate(!showGroupOnProfile);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.1)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.1)_50%,rgba(255,255,255,0.1)_75%,transparent_75%)] bg-[length:60px_60px]"></div>
        <div className="max-w-4xl mx-auto px-4 py-12 sm:py-16 relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Users className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">FYP Group</h1>
              <p className="text-white/80 text-sm sm:text-base">Manage your team and project</p>
            </div>
          </div>
          {/* Status badges */}
          <div className="flex flex-wrap gap-3 mt-6">
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold ${
              isGroupLocked 
                ? "bg-gray-900/50 text-white" 
                : "bg-green-500/30 text-white"
            }`}>
              {isGroupLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
              {isGroupLocked ? "Team Locked" : "Team Open"}
            </span>
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-xl text-sm font-semibold text-white">
              <Users className="w-4 h-4" />
              {group.members.length} Members
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Project Details Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">🎯</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Project Details</h2>
                <p className="text-sm text-gray-500">Your FYP project information</p>
              </div>
            </div>
            {!isEditing && (
              <button
                onClick={handleStartEdit}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
            )}
          </div>
          <div className="p-6">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Enter your FYP project name"
                    maxLength={100}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  />
                  <p className="mt-1 text-xs text-gray-500">{projectName.length}/100 characters</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Briefly describe your project..."
                    maxLength={500}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none"
                  />
                  <p className="mt-1 text-xs text-gray-500">{description.length}/500 characters</p>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={handleSaveProject}
                    disabled={!projectName.trim() || updateProject.isPending}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-4 h-4" />
                    {updateProject.isPending ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {group.projectName || "Unnamed Project"}
                </h3>
                {group.description ? (
                  <p className="text-gray-600 leading-relaxed">{group.description}</p>
                ) : (
                  <p className="text-gray-400 italic">No description added yet</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Visibility Settings Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-teal-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                {showGroupOnProfile ? <Eye className="w-5 h-5 text-emerald-600" /> : <EyeOff className="w-5 h-5 text-gray-500" />}
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Profile Visibility</h2>
                <p className="text-sm text-gray-500">Control what others see on your public profile</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">Show group on public profile</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  When enabled, visitors to your public profile will see your FYP group, 
                  project details, and team members. When disabled, your group membership 
                  will be hidden from your public profile.
                </p>
                <div className="mt-3 p-3 bg-blue-50 rounded-xl">
                  <p className="text-xs text-blue-700">
                    <strong>Note:</strong> This only affects your public profile view. 
                    It doesn't affect group membership, messaging permissions, or partner requests.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end mt-4">
              <button
                onClick={handleToggleVisibility}
                disabled={updateVisibility.isPending}
                className={`relative flex-shrink-0 w-14 h-8 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                  showGroupOnProfile ? "bg-emerald-500" : "bg-gray-300"
                } ${updateVisibility.isPending ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              >
                <span
                  className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                    showGroupOnProfile ? "translate-x-7" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
            <div className={`mt-4 p-4 rounded-xl border ${
              showGroupOnProfile 
                ? "bg-emerald-50 border-emerald-200" 
                : "bg-gray-50 border-gray-200"
            }`}>
              <div className="flex items-center gap-3">
                {showGroupOnProfile ? (
                  <>
                    <Eye className="w-5 h-5 text-emerald-600" />
                    <p className="text-sm font-medium text-emerald-800">
                      Your group information is <strong>visible</strong> on your public profile
                    </p>
                  </>
                ) : (
                  <>
                    <EyeOff className="w-5 h-5 text-gray-500" />
                    <p className="text-sm font-medium text-gray-700">
                      Your group information is <strong>hidden</strong> from your public profile
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Team Members Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Team Members</h2>
                <p className="text-sm text-gray-500">{group.members.length} member{group.members.length !== 1 ? "s" : ""} in your group</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {group.members.map((member) => (
                <div
                  key={member.id}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                    member.id === profile?.id 
                      ? "bg-indigo-50 border-indigo-200" 
                      : "bg-gray-50 border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {member.profilePicture ? (
                      <img
                        src={member.profilePicture}
                        alt={member.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold border-2 border-white shadow-md">
                        {member.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{member.name}</h3>
                        {member.id === profile?.id && (
                          <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold">
                            You
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {member.department} • Semester {member.semester}
                      </p>
                    </div>
                  </div>
                  {/* Visibility indicator */}
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium ${
                    member.showGroupOnProfile 
                      ? "bg-emerald-100 text-emerald-700" 
                      : "bg-gray-200 text-gray-600"
                  }`}>
                    {member.showGroupOnProfile ? (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        Visible
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        Hidden
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Back to Profile */}
        <div className="text-center pt-4">
          <a
            href="/dashboard/profile"
            className="inline-flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-indigo-600 transition-colors font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Profile
          </a>
        </div>
      </div>
    </div>
  );
}
