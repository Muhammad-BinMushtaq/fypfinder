"use client";

import { useState, useEffect } from "react";
import { useMyProfile } from "@/hooks/student/useMyProfile";
import type { StudentProfile } from "@/services/student.service";
import { AVAILABLE_ROLES, PrimaryRoleBadges } from "./PrimaryRoleBadges";
import { getIndustriesByCategory, getIndustryLabel } from "@/lib/industries";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";

interface ProfileFormProps {
  profile: StudentProfile;
}

export function ProfileForm({ profile }: ProfileFormProps) {
  return (
    <div className="space-y-6">
      <AboutCard profile={profile} />
      <ProfessionalCard profile={profile} />
      <ContactLinksCard profile={profile} />
    </div>
  );
}

function AboutCard({ profile }: { profile: StudentProfile }) {
  const { updateProfileAsync } = useMyProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    interests: profile.interests || "",
    careerGoal: profile.careerGoal || "",
    hobbies: profile.hobbies || "",
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfileAsync(formData);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (e: any) {
      toast.error(e.message || "Failed to update profile");
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isEditing) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-sm">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">About Me</h2>
          <button onClick={() => setIsEditing(true)} className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">Edit</button>
        </div>
        <div className="space-y-4 text-sm">
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Bio & Interests</h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{profile.interests || "Not provided"}</p>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Career Goal</h3>
            <p className="text-slate-700 dark:text-slate-300">{profile.careerGoal || "Not provided"}</p>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Hobbies</h3>
            <p className="text-slate-700 dark:text-slate-300">{profile.hobbies || "Not provided"}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 sm:p-7 shadow-inner">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Edit About Me</h2>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Bio & Interests</label>
          <textarea
            value={formData.interests}
            onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
            placeholder="Tell us about yourself..."
            rows={3}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm outline-none focus:border-slate-400 dark:focus:border-slate-500 resize-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Career Goal</label>
          <input
            type="text"
            value={formData.careerGoal}
            onChange={(e) => setFormData({ ...formData, careerGoal: e.target.value })}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm outline-none focus:border-slate-400 dark:focus:border-slate-500 transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Hobbies</label>
          <input
            type="text"
            value={formData.hobbies}
            onChange={(e) => setFormData({ ...formData, hobbies: e.target.value })}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm outline-none focus:border-slate-400 dark:focus:border-slate-500 transition-colors"
          />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setIsEditing(false)} disabled={isSaving} className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors inline-flex items-center gap-2">
            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />} Save
          </button>
        </div>
      </div>
    </div>
  );
}

function ProfessionalCard({ profile }: { profile: StudentProfile }) {
  const { updateProfileAsync } = useMyProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    preferredTechStack: profile.preferredTechStack || "",
    fypIndustry: profile.fypIndustry || "",
    primaryRoles: Array.isArray(profile.primaryRoles) ? profile.primaryRoles : [],
    seekingStatus: profile.seekingStatus || "LOOKING_FOR_TEAM",
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfileAsync(formData);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (e: any) {
      toast.error(e.message || "Failed to update profile");
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isEditing) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-sm">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Professional</h2>
          <button onClick={() => setIsEditing(true)} className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">Edit</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Primary Roles</h3>
            {profile.primaryRoles && profile.primaryRoles.length > 0 ? (
              <PrimaryRoleBadges roles={profile.primaryRoles} />
            ) : (
              <p className="text-slate-700 dark:text-slate-300">Not provided</p>
            )}
          </div>
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Preferred Tech Stack</h3>
            <p className="text-slate-700 dark:text-slate-300">{profile.preferredTechStack || "Not provided"}</p>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">FYP Industry</h3>
            <p className="text-slate-700 dark:text-slate-300">{profile.fypIndustry ? getIndustryLabel(profile.fypIndustry) : "Not provided"}</p>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Seeking Status</h3>
            <p className="text-slate-700 dark:text-slate-300">
              {profile.seekingStatus === "LOOKING_FOR_TEAM" ? "Looking for Team Members"
                 : profile.seekingStatus === "HAS_TEAM_LOOKING_FOR_MEMBERS" ? "Have a Team, Looking for Members"
                 : "Not Looking Right Now"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 sm:p-7 shadow-inner">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Edit Professional Details</h2>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Primary Roles (Max 2)</label>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_ROLES.map((role) => {
              const isSelected = formData.primaryRoles.includes(role);
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => {
                    if (isSelected) {
                      setFormData({ ...formData, primaryRoles: formData.primaryRoles.filter((r) => r !== role) });
                    } else if (formData.primaryRoles.length < 2) {
                      setFormData({ ...formData, primaryRoles: [...formData.primaryRoles, role] });
                    }
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    isSelected
                      ? "bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white"
                      : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                  } ${!isSelected && formData.primaryRoles.length >= 2 ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {role}
                </button>
              );
            })}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Preferred Tech Stack</label>
            <input
              type="text"
              value={formData.preferredTechStack}
              onChange={(e) => setFormData({ ...formData, preferredTechStack: e.target.value })}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm outline-none focus:border-slate-400 dark:focus:border-slate-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Seeking Status</label>
            <select
              value={formData.seekingStatus}
              onChange={(e) => setFormData({ ...formData, seekingStatus: e.target.value })}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm outline-none focus:border-slate-400 dark:focus:border-slate-500 transition-colors"
            >
              <option value="LOOKING_FOR_TEAM">Looking for Team</option>
              <option value="HAS_TEAM_LOOKING_FOR_MEMBERS">Have a Team</option>
              <option value="NOT_LOOKING">Not Looking</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">FYP Industry</label>
            <select
              value={formData.fypIndustry}
              onChange={(e) => setFormData({ ...formData, fypIndustry: e.target.value })}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm outline-none focus:border-slate-400 dark:focus:border-slate-500 transition-colors"
            >
              <option value="">Select an industry...</option>
              {Object.entries(getIndustriesByCategory()).map(([category, industries]) => (
                <optgroup key={category} label={category}>
                  {industries.map((ind) => (
                    <option key={ind.value} value={ind.value}>{ind.label}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setIsEditing(false)} disabled={isSaving} className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors inline-flex items-center gap-2">
            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />} Save
          </button>
        </div>
      </div>
    </div>
  );
}

function ContactLinksCard({ profile }: { profile: StudentProfile }) {
  const { updateProfileAsync } = useMyProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    phone: profile.phone || "",
    linkedinUrl: profile.linkedinUrl || "",
    githubUrl: profile.githubUrl || "",
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfileAsync(formData);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (e: any) {
      toast.error(e.message || "Failed to update profile");
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isEditing) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-sm">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Contact & Links</h2>
          <button onClick={() => setIsEditing(true)} className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">Edit</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Phone</h3>
            <p className="text-slate-700 dark:text-slate-300">{profile.phone || "Not provided"}</p>
          </div>
          <div className="space-y-3 sm:space-y-0 sm:col-span-2 sm:grid sm:grid-cols-2 sm:gap-4">
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">LinkedIn</h3>
              {profile.linkedinUrl ? (
                <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline break-all">
                  {profile.linkedinUrl}
                </a>
              ) : (
                <p className="text-slate-700 dark:text-slate-300">Not provided</p>
              )}
            </div>
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">GitHub</h3>
              {profile.githubUrl ? (
                <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline break-all">
                  {profile.githubUrl}
                </a>
              ) : (
                <p className="text-slate-700 dark:text-slate-300">Not provided</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 sm:p-7 shadow-inner">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Edit Contact & Links</h2>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Phone Number</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm outline-none focus:border-slate-400 dark:focus:border-slate-500 transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">LinkedIn URL</label>
          <input
            type="url"
            value={formData.linkedinUrl}
            onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm outline-none focus:border-slate-400 dark:focus:border-slate-500 transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">GitHub URL</label>
          <input
            type="url"
            value={formData.githubUrl}
            onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm outline-none focus:border-slate-400 dark:focus:border-slate-500 transition-colors"
          />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setIsEditing(false)} disabled={isSaving} className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors inline-flex items-center gap-2">
            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />} Save
          </button>
        </div>
      </div>
    </div>
  );
}
