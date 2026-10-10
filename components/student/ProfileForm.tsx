"use client";

import { useState } from "react";
import { useMyProfile } from "@/hooks/student/useMyProfile";
import type { StudentProfile } from "@/services/student.service";
import { AVAILABLE_ROLES, PrimaryRoleBadges } from "./PrimaryRoleBadges";
import { getIndustriesByCategory, getIndustryLabel } from "@/lib/industries";
import {
  Pencil,
  Loader2,
  Check,
  User,
  Briefcase,
  Link as LinkIcon,
  Phone,
  Linkedin,
  Github,
  ExternalLink,
} from "lucide-react";
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

  const handleCancel = () => {
    setFormData({
      interests: profile.interests || "",
      careerGoal: profile.careerGoal || "",
      hobbies: profile.hobbies || "",
    });
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <section className="rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900/60 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <User className="w-5 h-5 text-slate-500 dark:text-zinc-400" />
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">About Me</h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">Personal bio, career goals, and hobbies</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </button>
        </div>

        <div className="space-y-3.5">
          <div className="p-4 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
            <p className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">
              Bio & Interests
            </p>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {profile.interests || (
                <span className="text-slate-400 dark:text-slate-500 italic font-normal">
                  No bio provided yet. Click Edit to introduce your technical interests and background to prospective partners.
                </span>
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="p-4 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              <p className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
                Career Goal
              </p>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                {profile.careerGoal || (
                  <span className="text-slate-400 dark:text-slate-500 italic font-normal">Not specified</span>
                )}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              <p className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
                Hobbies & Activities
              </p>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                {profile.hobbies || (
                  <span className="text-slate-400 dark:text-slate-500 italic font-normal">Not specified</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900/60 p-6 shadow-xs space-y-5">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <User className="w-5 h-5 text-slate-500 dark:text-zinc-400" />
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Edit About Me</h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400">Share your background and goals with peers</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Bio & Interests
          </label>
          <textarea
            value={formData.interests}
            onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
            placeholder="Describe your technical interests, project aspirations, and what you enjoy building..."
            rows={3}
            className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:border-transparent transition-all resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Career Goal
            </label>
            <input
              type="text"
              value={formData.careerGoal}
              onChange={(e) => setFormData({ ...formData, careerGoal: e.target.value })}
              placeholder="e.g. Full-Stack Engineer, AI Researcher"
              className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Hobbies & Activities
            </label>
            <input
              type="text"
              value={formData.hobbies}
              onChange={(e) => setFormData({ ...formData, hobbies: e.target.value })}
              placeholder="e.g. Open-source, Competitive Programming, Chess"
              className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSaving}
            className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </section>
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

  const handleCancel = () => {
    setFormData({
      preferredTechStack: profile.preferredTechStack || "",
      fypIndustry: profile.fypIndustry || "",
      primaryRoles: Array.isArray(profile.primaryRoles) ? profile.primaryRoles : [],
      seekingStatus: profile.seekingStatus || "LOOKING_FOR_TEAM",
    });
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <section className="rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900/60 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <Briefcase className="w-5 h-5 text-slate-500 dark:text-zinc-400" />
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">Professional Details</h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">Roles, tech stack, and FYP domain focus</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="p-4 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-1.5">
            <p className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
              Primary Roles (Max 2)
            </p>
            {profile.primaryRoles && profile.primaryRoles.length > 0 ? (
              <PrimaryRoleBadges roles={profile.primaryRoles} />
            ) : (
              <p className="text-sm font-normal italic text-slate-400 dark:text-slate-500">
                No primary roles selected
              </p>
            )}
          </div>

          <div className="p-4 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-1.5">
            <p className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
              Team Seeking Status
            </p>
            <div>
              {profile.seekingStatus === "LOOKING_FOR_TEAM" ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Looking for Team Members
                </span>
              ) : profile.seekingStatus === "HAS_TEAM_LOOKING_FOR_MEMBERS" ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  Have a Team, Seeking Members
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  Not Looking Right Now
                </span>
              )}
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-1">
            <p className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
              Preferred Tech Stack
            </p>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
              {profile.preferredTechStack || (
                <span className="text-slate-400 dark:text-slate-500 italic font-normal">Not specified</span>
              )}
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-1">
            <p className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
              Target FYP Industry
            </p>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
              {profile.fypIndustry ? (
                getIndustryLabel(profile.fypIndustry)
              ) : (
                <span className="text-slate-400 dark:text-slate-500 italic font-normal">Not specified</span>
              )}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900/60 p-6 shadow-xs space-y-5">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <Briefcase className="w-5 h-5 text-slate-500 dark:text-zinc-400" />
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Edit Professional Details</h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400">Configure your primary project roles and domain focus</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Primary Roles (Select up to 2)
          </label>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_ROLES.map((role) => {
              const isSelected = formData.primaryRoles.includes(role);
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => {
                    if (isSelected) {
                      setFormData({
                        ...formData,
                        primaryRoles: formData.primaryRoles.filter((r) => r !== role),
                      });
                    } else if (formData.primaryRoles.length < 2) {
                      setFormData({
                        ...formData,
                        primaryRoles: [...formData.primaryRoles, role],
                      });
                    }
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    isSelected
                      ? "bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white"
                      : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
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
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Preferred Tech Stack
            </label>
            <input
              type="text"
              value={formData.preferredTechStack}
              onChange={(e) => setFormData({ ...formData, preferredTechStack: e.target.value })}
              placeholder="e.g. Next.js, FastAPI, PostgreSQL, PyTorch"
              className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Seeking Status
            </label>
            <select
              value={formData.seekingStatus}
              onChange={(e) => setFormData({ ...formData, seekingStatus: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:border-transparent transition-all"
            >
              <option value="LOOKING_FOR_TEAM">Looking for Team Members</option>
              <option value="HAS_TEAM_LOOKING_FOR_MEMBERS">Have a Team, Seeking Members</option>
              <option value="NOT_LOOKING">Not Looking Right Now</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Target FYP Industry
            </label>
            <select
              value={formData.fypIndustry}
              onChange={(e) => setFormData({ ...formData, fypIndustry: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:border-transparent transition-all"
            >
              <option value="">Select target industry...</option>
              {Object.entries(getIndustriesByCategory()).map(([category, industries]) => (
                <optgroup key={category} label={category}>
                  {industries.map((ind) => (
                    <option key={ind.value} value={ind.value}>
                      {ind.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSaving}
            className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </section>
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

  const handleCancel = () => {
    setFormData({
      phone: profile.phone || "",
      linkedinUrl: profile.linkedinUrl || "",
      githubUrl: profile.githubUrl || "",
    });
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <section className="rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900/60 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <LinkIcon className="w-5 h-5 text-slate-500 dark:text-zinc-400" />
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">Contact & Links</h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">Communication channels and external portfolio profiles</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="p-4 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-1.5">
            <p className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
              Phone Number
            </p>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-800 dark:text-slate-200">
              <Phone className="w-4 h-4 text-slate-400 shrink-0" />
              <span>
                {profile.phone || (
                  <span className="text-slate-400 dark:text-slate-500 italic font-normal">Not provided</span>
                )}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-1.5">
            <p className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
              LinkedIn Profile
            </p>
            {profile.linkedinUrl ? (
              <a
                href={profile.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline truncate max-w-full"
              >
                <Linkedin className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span className="truncate">
                  {profile.linkedinUrl.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//i, "")}
                </span>
                <ExternalLink className="w-3 h-3 shrink-0 opacity-70" />
              </a>
            ) : (
              <div className="flex items-center gap-1.5 text-sm text-slate-400 dark:text-slate-500 italic font-normal">
                <Linkedin className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Not provided</span>
              </div>
            )}
          </div>

          <div className="p-4 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-1.5">
            <p className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
              GitHub Profile
            </p>
            {profile.githubUrl ? (
              <a
                href={profile.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-900 dark:text-white hover:underline truncate max-w-full"
              >
                <Github className="w-4 h-4 text-slate-900 dark:text-white shrink-0" />
                <span className="truncate">
                  {profile.githubUrl.replace(/^https?:\/\/(www\.)?github\.com\//i, "")}
                </span>
                <ExternalLink className="w-3 h-3 shrink-0 opacity-70" />
              </a>
            ) : (
              <div className="flex items-center gap-1.5 text-sm text-slate-400 dark:text-slate-500 italic font-normal">
                <Github className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Not provided</span>
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900/60 p-6 shadow-xs space-y-5">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <LinkIcon className="w-5 h-5 text-slate-500 dark:text-zinc-400" />
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Edit Contact & Links</h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400">Update your contact information and public developer profiles</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Phone Number
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+92 300 1234567"
            className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:border-transparent transition-all"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              LinkedIn URL
            </label>
            <input
              type="url"
              value={formData.linkedinUrl}
              onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
              placeholder="https://linkedin.com/in/username"
              className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              GitHub URL
            </label>
            <input
              type="url"
              value={formData.githubUrl}
              onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
              placeholder="https://github.com/username"
              className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSaving}
            className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </section>
  );
}
