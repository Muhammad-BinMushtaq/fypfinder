// components/student/PublicProfileView.tsx
"use client";

/**
 * PublicProfileView Component
 * ---------------------------
 * Displays a student's PUBLIC profile (read-only).
 * Minimalist Design with Dark Mode Support
 */

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, Github, Linkedin, ArrowLeft, ExternalLink } from "lucide-react";
import type { PublicStudentProfile } from "@/services/studentPublic.service";
import { SendRequestButtons } from "@/components/request/SendRequestButtons";

interface PublicProfileViewProps {
  profile: PublicStudentProfile;
  currentStudentId?: string;
  currentSemester?: number;
  isUserInGroup?: boolean;
  isUserGroupLocked?: boolean;
}

export function PublicProfileView({ 
  profile, 
  currentStudentId,
  currentSemester,
  isUserInGroup = false,
  isUserGroupLocked = false,
}: PublicProfileViewProps) {
  const isSameStudent = currentStudentId === profile.id;
  const [isSkillsOpen, setIsSkillsOpen] = useState(true);
  const [isProjectsOpen, setIsProjectsOpen] = useState(true);
  
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvailabilityConfig = (status: string) => {
    const config: Record<string, { label: string; dot: string; bg: string }> = {
      AVAILABLE: {
        bg: "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800",
        label: "Available",
        dot: "bg-green-500",
      },
      BUSY: {
        bg: "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
        label: "Busy",
        dot: "bg-amber-500",
      },
      AWAY: {
        bg: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700",
        label: "Away",
        dot: "bg-gray-400",
      },
    };
    return config[status] || config.AWAY;
  };

  const getSkillLevelConfig = (level: string) => {
    const config: Record<string, { label: string; bg: string }> = {
      BEGINNER: {
        bg: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700",
        label: "Beginner",
      },
      INTERMEDIATE: {
        bg: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700",
        label: "Intermediate",
      },
      ADVANCED: {
        bg: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700",
        label: "Advanced",
      },
    };
    return config[level] || config.BEGINNER;
  };

  const getGroupStatusConfig = () => {
    if (!profile.isGrouped) {
      return {
        label: "Looking for Group",
        icon: "👋",
        bg: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700",
      };
    }
    if (profile.availableForGroup && profile.groupInfo) {
      return {
        label: "Open for Partners",
        icon: "👥",
        bg: "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800",
      };
    }
    return {
      label: "Team Locked",
      icon: "🔒",
      bg: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700",
    };
  };

  const availabilityConfig = getAvailabilityConfig(profile.availability);
  const groupStatusConfig = getGroupStatusConfig();

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        href="/dashboard/discovery"
        className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Back to Discovery</span>
      </Link>

      {/* Main Profile Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden">
        {/* Profile Header */}
        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0 mx-auto sm:mx-0">
              {profile.profilePicture ? (
                <img
                  src={profile.profilePicture}
                  alt={profile.name}
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-xl object-cover border border-gray-200 dark:border-slate-600"
                />
              ) : (
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-xl bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold text-4xl">
                  {getInitials(profile.name)}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                {profile.name}
              </h1>
              
              {/* Meta Info */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-4">
                <span className="px-3 py-1.5 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium border border-gray-200 dark:border-slate-600">
                  {profile.department}
                </span>
                <span className="px-3 py-1.5 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium border border-gray-200 dark:border-slate-600">
                  Semester {profile.semester}
                </span>
              </div>

              {/* Status Badges */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-4">
                <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border ${availabilityConfig.bg}`}>
                  <span className={`w-2 h-2 rounded-full ${availabilityConfig.dot}`}></span>
                  {availabilityConfig.label}
                </span>
                <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border ${groupStatusConfig.bg}`}>
                  {groupStatusConfig.icon} {groupStatusConfig.label}
                </span>
              </div>

              {/* Social Links */}
              {(profile.githubUrl || profile.linkedinUrl) && (
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-4">
                  {profile.githubUrl && (
                    <a
                      href={profile.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                    >
                      <Github className="w-4 h-4" />
                      GitHub
                    </a>
                  )}
                  {profile.linkedinUrl && (
                    <a
                      href={profile.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                    >
                      <Linkedin className="w-4 h-4" />
                      LinkedIn
                    </a>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <SendRequestButtons
                targetStudentId={profile.id}
                targetName={profile.name}
                isSameStudent={isSameStudent}
                targetSemester={profile.semester}
                currentSemester={currentSemester}
                isUserInGroup={isUserInGroup}
                isTargetGroupLocked={!profile.availableForGroup}
                isUserGroupLocked={isUserGroupLocked}
                targetAvailability={profile.availability}
              />
            </div>
          </div>
        </div>

        {/* About Section */}
        {profile.interests && (
          <div className="px-6 sm:px-8 pb-6">
            <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-4 border border-gray-100 dark:border-slate-600">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                About
              </h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                {profile.interests}
              </p>
            </div>
          </div>
        )}

        {/* Group Info */}
        {profile.isGrouped && profile.groupInfo && (
          <div className="px-6 sm:px-8 pb-6">
            <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-4 border border-gray-100 dark:border-slate-600">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Current FYP Project
              </h3>
              <p className="text-gray-900 dark:text-white font-semibold text-lg mb-1">
                {profile.groupInfo.projectName || "Unnamed Project"}
              </p>
              {profile.groupInfo.description && (
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                  {profile.groupInfo.description}
                </p>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <span className={`w-2 h-2 rounded-full ${profile.groupInfo.isLocked ? 'bg-gray-400' : 'bg-green-500'}`}></span>
                {profile.groupInfo.isLocked ? "Team finalized" : "Open for members"}
              </div>
              
              {/* Team Members */}
              {profile.groupInfo.members && profile.groupInfo.members.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-600">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                    Team Members
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {profile.groupInfo.members.map((member) => (
                      <div key={member.id} className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600">
                        {member.profilePicture ? (
                          <img
                            src={member.profilePicture}
                            alt={member.name}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-slate-600 flex items-center justify-center text-gray-600 dark:text-gray-300 text-xs font-medium">
                            {member.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                          </div>
                        )}
                        <span className="text-sm text-gray-700 dark:text-gray-300">{member.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Skills Section */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden">
        <button
          onClick={() => setIsSkillsOpen(!isSkillsOpen)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">💡</span>
            <div className="text-left">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Skills</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{profile.skills.length} skills listed</p>
            </div>
          </div>
          {isSkillsOpen ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {isSkillsOpen && (
          <div className="px-6 pb-6">
            {profile.skills.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">No skills listed</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {profile.skills.map((skill) => {
                  const levelConfig = getSkillLevelConfig(skill.level);
                  return (
                    <div
                      key={skill.id}
                      className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-4 border border-gray-100 dark:border-slate-600"
                    >
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2">{skill.name}</h3>
                      <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-medium border ${levelConfig.bg}`}>
                        {levelConfig.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Projects Section */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden">
        <button
          onClick={() => setIsProjectsOpen(!isProjectsOpen)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">🚀</span>
            <div className="text-left">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Projects</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{profile.projects.length} projects</p>
            </div>
          </div>
          {isProjectsOpen ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {isProjectsOpen && (
          <div className="px-6 pb-6">
            {profile.projects.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">No projects listed</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {profile.projects.map((project) => (
                  <div
                    key={project.id}
                    className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-4 border border-gray-100 dark:border-slate-600"
                  >
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">{project.name}</h3>
                    {project.description && (
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                        {project.description}
                      </p>
                    )}
                    <div className="flex gap-2">
                      {project.liveLink && (
                        <a
                          href={project.liveLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors font-medium"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Live
                        </a>
                      )}
                      {project.githubLink && (
                        <a
                          href={project.githubLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-500 transition-colors font-medium"
                        >
                          <Github className="w-3 h-3" />
                          Code
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
