// components/student/ProfileForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useMyProfile } from "@/hooks/student/useMyProfile";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { StudentProfile, AvailabilityStatus } from "@/services/student.service";

interface ProfileFormProps {
  profile: StudentProfile;
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const { updateProfileAsync, isUpdating } = useMyProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [isOpen, setIsOpen] = useState(true); // Collapsible state
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [formData, setFormData] = useState({
    interests: "",
    phone: "",
    linkedinUrl: "",
    githubUrl: "",
    availability: "AVAILABLE" as AvailabilityStatus,
    currentSemester: 5,
    // New professional fields
    careerGoal: "",
    hobbies: "",
    preferredTechStack: "",
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        interests: profile.interests || "",
        phone: profile.phone || "",
        linkedinUrl: profile.linkedinUrl || "",
        githubUrl: profile.githubUrl || "",
        availability: profile.availability || "AVAILABLE",
        currentSemester: profile.semester || 5,
        // New professional fields
        careerGoal: profile.careerGoal || "",
        hobbies: profile.hobbies || "",
        preferredTechStack: profile.preferredTechStack || "",
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError("");
      setSuccess("");
      await updateProfileAsync(formData);
      setSuccess("Profile updated successfully! ✅");
      setIsEditing(false);
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to update profile";
      setError(errorMsg);
    }
  };

  const handleCancel = () => {
    setFormData({
      interests: profile.interests || "",
      phone: profile.phone || "",
      linkedinUrl: profile.linkedinUrl || "",
      githubUrl: profile.githubUrl || "",
      availability: profile.availability || "AVAILABLE",
      currentSemester: profile.semester || 5,
      // New professional fields
      careerGoal: profile.careerGoal || "",
      hobbies: profile.hobbies || "",
      preferredTechStack: profile.preferredTechStack || "",
    });
    setIsEditing(false);
    setError("");
    setSuccess("");
  };

  const getAvailabilityColor = (status: AvailabilityStatus) => {
    const colors = {
      AVAILABLE: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800",
      BUSY: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800",
      AWAY: "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-600",
    };
    return colors[status];
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden">
      {/* Header - Clickable for collapse */}
      <div 
        className="px-4 sm:px-6 py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
        onClick={() => !isEditing && setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-lg flex-shrink-0">👤</span>
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Personal Information</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Manage your profile and preferences</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {!isEditing && isOpen && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
                className="px-3 py-1.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium text-xs rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
              >
                Edit
              </button>
            )}
            {!isEditing && (
              isOpen ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )
            )}
          </div>
        </div>
      </div>

      {/* Collapsible Form */}
      {isOpen && (
      <form onSubmit={handleSubmit} className="p-4 sm:p-8">
        {error && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-xs sm:text-sm">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400 text-xs sm:text-sm font-medium">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-7">
          {/* Name (Read-only) */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2.5">
              Full Name
            </label>
            <div className="px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-100 dark:bg-slate-700/50 rounded-lg text-gray-700 dark:text-gray-400 font-medium border border-gray-200 dark:border-slate-600 cursor-not-allowed opacity-75 text-sm sm:text-base">
              {profile.name}
              <span className="ml-1 sm:ml-2 text-[10px] sm:text-xs text-gray-500 dark:text-gray-500">(Cannot be changed)</span>
            </div>
          </div>

          {/* Department (Read-only) */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2.5">
              Department
            </label>
            <div className="px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-100 dark:bg-slate-700/50 rounded-lg text-gray-700 dark:text-gray-400 font-medium border border-gray-200 dark:border-slate-600 cursor-not-allowed opacity-75 text-sm sm:text-base">
              {profile.department}
              <span className="ml-1 sm:ml-2 text-[10px] sm:text-xs text-gray-500 dark:text-gray-500">(Cannot be changed)</span>
            </div>
          </div>

          {/* Semester */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2.5">
              Current Semester
            </label>
            {isEditing ? (
              <select
                value={formData.currentSemester}
                onChange={(e) => setFormData({ ...formData, currentSemester: parseInt(e.target.value) })}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 focus:border-transparent outline-none transition-all text-sm sm:text-base bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
              >
                <option value={5}>Semester 5</option>
                <option value={6}>Semester 6</option>
                <option value={7}>Semester 7</option>
                <option value={8}>Semester 8</option>
              </select>
            ) : (
              <div className="px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-50 dark:bg-slate-700 rounded-lg text-gray-900 dark:text-white font-medium border border-gray-200 dark:border-slate-600 text-sm sm:text-base">
                Semester {profile.semester}
              </div>
            )}
          </div>

          {/* Availability */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2.5">
              Availability Status
            </label>
            {isEditing ? (
              <select
                value={formData.availability}
                onChange={(e) => setFormData({ ...formData, availability: e.target.value as AvailabilityStatus })}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 focus:border-transparent outline-none transition-all text-sm sm:text-base bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
              >
                <option value="AVAILABLE">🟢 Available</option>
                <option value="BUSY">🟡 Busy</option>
                <option value="AWAY">⚫ Away</option>
              </select>
            ) : (
              <div className={`inline-flex items-center px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-semibold text-xs sm:text-sm ${getAvailabilityColor(profile.availability)}`}>
                {profile.availability === "AVAILABLE" && "🟢 Available"}
                {profile.availability === "BUSY" && "🟡 Busy"}
                {profile.availability === "AWAY" && "⚫ Away"}
              </div>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2.5">
              Phone Number
            </label>
            {isEditing ? (
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1234567890"
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 focus:border-transparent outline-none transition-all text-sm sm:text-base bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
            ) : (
              <div className="px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-50 dark:bg-slate-700 rounded-lg text-gray-700 dark:text-gray-300 font-medium text-sm sm:text-base border border-gray-200 dark:border-slate-600">
                {profile.phone || "Not provided"}
              </div>
            )}
          </div>

          {/* LinkedIn */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2.5">
              LinkedIn URL
            </label>
            {isEditing ? (
              <input
                type="url"
                value={formData.linkedinUrl}
                onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                placeholder="https://linkedin.com/in/username"
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 focus:border-transparent outline-none transition-all text-sm sm:text-base bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
            ) : (
              <div className="px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-50 dark:bg-slate-700 rounded-lg text-gray-700 dark:text-gray-300 font-medium text-sm sm:text-base border border-gray-200 dark:border-slate-600">
                {profile.linkedinUrl ? (
                  <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-gray-900 dark:text-white hover:underline">
                    View Profile →
                  </a>
                ) : (
                  "Not provided"
                )}
              </div>
            )}
          </div>

          {/* GitHub */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2.5">
              GitHub URL
            </label>
            {isEditing ? (
              <input
                type="url"
                value={formData.githubUrl}
                onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                placeholder="https://github.com/username"
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 focus:border-transparent outline-none transition-all text-sm sm:text-base bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
            ) : (
              <div className="px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-50 dark:bg-slate-700 rounded-lg text-gray-700 dark:text-gray-300 font-medium text-sm sm:text-base border border-gray-200 dark:border-slate-600">
                {profile.githubUrl ? (
                  <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer" className="text-gray-900 dark:text-white hover:underline">
                    View Profile →
                  </a>
                ) : (
                  "Not provided"
                )}
              </div>
            )}
          </div>

          {/* Interests - Full Width */}
          <div className="md:col-span-2">
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2.5">
              Interests & Bio
            </label>
            {isEditing ? (
              <textarea
                value={formData.interests}
                onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                placeholder="Tell us about your interests and what you're looking for in a project..."
                rows={4}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 focus:border-transparent outline-none transition-all resize-none text-sm sm:text-base bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
            ) : (
              <div className="px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-50 dark:bg-slate-700 rounded-lg text-gray-700 dark:text-gray-300 font-medium min-h-20 sm:min-h-24 flex items-center text-sm sm:text-base border border-gray-200 dark:border-slate-600">
                {profile.interests || "Not provided"}
              </div>
            )}
          </div>

          {/* Career Goal - Full Width */}
          <div className="md:col-span-2">
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2.5">
              🎯 Career Goal
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.careerGoal}
                onChange={(e) => setFormData({ ...formData, careerGoal: e.target.value })}
                placeholder="e.g., Become AI/ML Engineer at a startup"
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 focus:border-transparent outline-none transition-all text-sm sm:text-base bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
            ) : (
              <div className="px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-50 dark:bg-slate-700 rounded-lg text-gray-700 dark:text-gray-300 font-medium text-sm sm:text-base border border-gray-200 dark:border-slate-600">
                {profile.careerGoal || "Not provided"}
              </div>
            )}
          </div>

          {/* Hobbies */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2.5">
              🎮 Hobbies
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.hobbies}
                onChange={(e) => setFormData({ ...formData, hobbies: e.target.value })}
                placeholder="e.g., Coding, Gaming, Open-source"
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 focus:border-transparent outline-none transition-all text-sm sm:text-base bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
            ) : (
              <div className="px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-50 dark:bg-slate-700 rounded-lg text-gray-700 dark:text-gray-300 font-medium text-sm sm:text-base border border-gray-200 dark:border-slate-600">
                {profile.hobbies || "Not provided"}
              </div>
            )}
          </div>

          {/* Preferred Tech Stack */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2.5">
              💻 Preferred Tech Stack
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.preferredTechStack}
                onChange={(e) => setFormData({ ...formData, preferredTechStack: e.target.value })}
                placeholder="e.g., React, Node.js, Python, MongoDB"
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 focus:border-transparent outline-none transition-all text-sm sm:text-base bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
            ) : (
              <div className="px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-50 dark:bg-slate-700 rounded-lg text-gray-700 dark:text-gray-300 font-medium text-sm sm:text-base border border-gray-200 dark:border-slate-600">
                {profile.preferredTechStack || "Not provided"}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="mt-6 sm:mt-8 flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 sm:justify-end">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isUpdating}
              className="w-full sm:w-auto px-5 sm:px-6 py-2.5 border-2 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 transition-all duration-300 text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="w-full sm:w-auto px-5 sm:px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 text-sm sm:text-base"
            >
              {isUpdating ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </form>
      )}
    </div>
  );
}
