// app/dashboard/fyp/page.tsx
"use client";

import { useState } from "react";
import { useMyGroup, useUpdateGroupProject, useUpdateGroupVisibility } from "@/hooks/group/useMyGroup";
import { useMyProfile } from "@/hooks/student/useMyProfile";
import { Users, Lock, Unlock, Eye, EyeOff, Edit2, Save, X, ArrowLeft, FileText } from "lucide-react";

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
      <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center p-4">
        <div className="animate-spin w-6 h-6 border-2 border-gray-900 dark:border-white border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Not in a group
  if (!isInGroup || !group) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
            <Users className="w-10 h-10 text-gray-400 dark:text-gray-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            No FYP Group Yet
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
            You haven't joined an FYP group yet. Find partners in the Discovery section.
          </p>
          <a
            href="/dashboard/discovery"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
          >
            <Users className="w-4 h-4" />
            Find Partners
          </a>
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
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <a
              href="/dashboard/profile"
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Profile
            </a>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">FYP Group</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
              isGroupLocked 
                ? "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400" 
                : "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
            }`}>
              {isGroupLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
              {isGroupLocked ? "Locked" : "Open"}
            </span>
          </div>
        </div>

        <div className="space-y-6">
          {/* Project Details */}
          <section className="border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-gray-400" />
                <h2 className="font-semibold text-gray-900 dark:text-white">Project Details</h2>
              </div>
              {!isEditing && (
                <button
                  onClick={handleStartEdit}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
              )}
            </div>
            <div className="p-5">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Project Name
                    </label>
                    <input
                      type="text"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      placeholder="Enter project name"
                      maxLength={100}
                      className="w-full px-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent transition-all"
                    />
                    <p className="mt-1 text-xs text-gray-400">{projectName.length}/100</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe your project..."
                      maxLength={500}
                      rows={3}
                      className="w-full px-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent transition-all resize-none"
                    />
                    <p className="mt-1 text-xs text-gray-400">{description.length}/500</p>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={handleSaveProject}
                      disabled={!projectName.trim() || updateProject.isPending}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {updateProject.isPending ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-gray-600 dark:text-gray-400 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {group.projectName || "Unnamed Project"}
                  </h3>
                  {group.description ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">{group.description}</p>
                  ) : (
                    <p className="text-sm text-gray-400 italic">No description</p>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Visibility Settings */}
          <section className="border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden">
            <div className="px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {showGroupOnProfile ? (
                  <Eye className="w-5 h-5 text-gray-900 dark:text-white" />
                ) : (
                  <EyeOff className="w-5 h-5 text-gray-400" />
                )}
                <div>
                  <h2 className="font-semibold text-gray-900 dark:text-white">Profile Visibility</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Show group on your public profile</p>
                </div>
              </div>
              <button
                onClick={handleToggleVisibility}
                disabled={updateVisibility.isPending}
                className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 dark:focus:ring-white ${
                  showGroupOnProfile ? "bg-gray-900 dark:bg-white" : "bg-gray-200 dark:bg-slate-700"
                } ${updateVisibility.isPending ? "opacity-50" : ""}`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 rounded-full shadow transition-transform ${
                    showGroupOnProfile 
                      ? "translate-x-5.5 bg-white dark:bg-gray-900" 
                      : "translate-x-0.5 bg-white dark:bg-slate-400"
                  }`}
                />
              </button>
            </div>
          </section>

          {/* Team Members */}
          <section className="border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 dark:border-slate-700 flex items-center gap-3">
              <Users className="w-5 h-5 text-gray-400" />
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-white">Team Members</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">{group.members.length} member{group.members.length !== 1 ? "s" : ""}</p>
              </div>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-slate-700">
              {group.members.map((member) => (
                <div
                  key={member.id}
                  className="px-5 py-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    {member.profilePicture ? (
                      <img
                        src={member.profilePicture}
                        alt={member.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-900 dark:bg-white flex items-center justify-center text-white dark:text-gray-900 text-sm font-medium">
                        {member.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-white text-sm">{member.name}</span>
                        {member.id === profile?.id && (
                          <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 rounded text-xs">
                            You
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {member.department} • Sem {member.semester}
                      </p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1 text-xs ${
                    member.showGroupOnProfile 
                      ? "text-gray-900 dark:text-white" 
                      : "text-gray-400"
                  }`}>
                    {member.showGroupOnProfile ? (
                      <><Eye className="w-3.5 h-3.5" /> Visible</>
                    ) : (
                      <><EyeOff className="w-3.5 h-3.5" /> Hidden</>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
