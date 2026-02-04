// components/student/PublicProfileView.tsx
"use client";

/**
 * PublicProfileView Component
 * ---------------------------
 * Displays a student's PUBLIC profile (read-only).
 * Includes action buttons to send message/partner requests.
 * 
 * Responsibilities:
 * - Render public profile data
 * - Display skills and projects
 * - Show group status
 * - Provide request buttons
 * 
 * ⚠️ NO API calls, NO business logic here.
 * All data comes via props.
 */

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, ChevronUp, Github, Linkedin } from "lucide-react";
import type { PublicStudentProfile, PublicSkill, PublicProject } from "@/services/studentPublic.service";
import { SendRequestButtons } from "@/components/request/SendRequestButtons";

interface PublicProfileViewProps {
  profile: PublicStudentProfile;
  /** Current user's student ID to detect self-viewing */
  currentStudentId?: string;
  /** Current user's semester for partner eligibility hint */
  currentSemester?: number;
  /** Is current user in an FYP group? */
  isUserInGroup?: boolean;
  /** Is current user's group locked? */
  isUserGroupLocked?: boolean;
}

export function PublicProfileView({ 
  profile, 
  currentStudentId,
  currentSemester,
  isUserInGroup = false,
  isUserGroupLocked = false,
}: PublicProfileViewProps) {
  // Check if viewing own profile
  const isSameStudent = currentStudentId === profile.id;

  // Collapsible section states
  const [isSkillsOpen, setIsSkillsOpen] = useState(true);
  const [isProjectsOpen, setIsProjectsOpen] = useState(true);
  
  // Generate initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Get availability badge config
  const getAvailabilityConfig = (status: string) => {
    const config: Record<string, { color: string; label: string; dot: string; bg: string }> = {
      AVAILABLE: {
        color: "text-green-700",
        bg: "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200/50",
        label: "Available",
        dot: "bg-green-500",
      },
      BUSY: {
        color: "text-amber-700",
        bg: "bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200/50",
        label: "Busy",
        dot: "bg-amber-500",
      },
      AWAY: {
        color: "text-gray-700",
        bg: "bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200/50",
        label: "Away",
        dot: "bg-gray-500",
      },
    };
    return config[status] || config.AWAY;
  };

  // Get skill level config
  const getSkillLevelConfig = (level: string) => {
    const config: Record<string, { color: string; label: string; icon: string; bg: string }> = {
      BEGINNER: {
        color: "text-emerald-700",
        bg: "bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200/50",
        label: "Beginner",
        icon: "🌱",
      },
      INTERMEDIATE: {
        color: "text-amber-700",
        bg: "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200/50",
        label: "Intermediate",
        icon: "📈",
      },
      ADVANCED: {
        color: "text-purple-700",
        bg: "bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200/50",
        label: "Advanced",
        icon: "⭐",
      },
    };
    return config[level] || config.BEGINNER;
  };

  // Get group status config
  const getGroupStatusConfig = () => {
    if (!profile.isGrouped) {
      return {
        label: "Looking for a Group",
        icon: "👋",
        color: "text-blue-700",
        bg: "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200/50",
        description: "Open to joining FYP groups",
      };
    }
    if (profile.availableForGroup && profile.groupInfo) {
      return {
        label: "In a Group (Open)",
        icon: "👥",
        color: "text-emerald-700",
        bg: "bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200/50",
        description: `Working on: ${profile.groupInfo.projectName}`,
      };
    }
    return {
      label: "Group Locked",
      icon: "🔒",
      color: "text-gray-700",
      bg: "bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200/50",
      description: profile.groupInfo ? `Team: ${profile.groupInfo.projectName}` : "Team is finalized",
    };
  };

  const availabilityConfig = getAvailabilityConfig(profile.availability);
  const groupStatusConfig = getGroupStatusConfig();

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        href="/dashboard/discovery"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors group"
      >
        <div className="w-8 h-8 rounded-lg bg-white shadow-sm border border-gray-200 flex items-center justify-center group-hover:bg-blue-50 group-hover:border-blue-200 transition-all">
          <svg
            className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </div>
        <span className="font-medium">Back to Discovery</span>
      </Link>

      {/* Profile Header Card - Clean Design */}
      <div className="bg-white rounded-3xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Decorative Header Bar */}
        <div className="h-3 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
        
        {/* Profile Content */}
        <div className="p-6 sm:p-8">
          {/* Avatar & Basic Info Row */}
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {profile.profilePicture ? (
                <img
                  src={profile.profilePicture}
                  alt={profile.name}
                  className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl object-cover border-4 border-gray-100 shadow-lg"
                />
              ) : (
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-5xl sm:text-6xl border-4 border-gray-100 shadow-lg">
                  {getInitials(profile.name)}
                </div>
              )}
            </div>

            {/* Info Section */}
            <div className="flex-1 space-y-4">
              {/* Name */}
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                  {profile.name}
                </h1>
                <div className="flex items-center gap-3 text-gray-600">
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium">
                    🎓 {profile.department}
                  </span>
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                    📚 Semester {profile.semester}
                  </span>
                </div>
              </div>

              {/* Status Badges */}
              <div className="flex flex-wrap gap-3">
                {/* Availability Badge */}
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border-2 ${availabilityConfig.bg} ${availabilityConfig.color}`}>
                  <span className={`w-2.5 h-2.5 rounded-full ${availabilityConfig.dot} animate-pulse`}></span>
                  {availabilityConfig.label}
                </div>
                {/* Group Status Badge */}
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border-2 ${groupStatusConfig.bg} ${groupStatusConfig.color}`}>
                  <span className="text-base">{groupStatusConfig.icon}</span>
                  {groupStatusConfig.label}
                </div>
                {/* Social Links */}
                {(profile.githubUrl || profile.linkedinUrl) && (
                  <div className="flex items-center gap-2">
                    {profile.githubUrl && (
                      <a
                        href={profile.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/20"
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
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
                      >
                        <Linkedin className="w-4 h-4" />
                        LinkedIn
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons - Send Requests */}
              <div className="mt-4">
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

          {/* Divider */}
          <div className="my-6 border-t border-gray-200"></div>

          {/* About Section */}
          {profile.interests && (
            <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-2xl p-5 border border-gray-200">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-lg">💡</span>
                About Me
              </h3>
              <p className="text-gray-700 leading-relaxed text-base">{profile.interests}</p>
            </div>
          )}

          {/* Group Info (if in a group and visible) */}
          {profile.isGrouped && profile.groupInfo && (
            <div className="mt-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-5 border border-indigo-200">
              <h3 className="text-sm font-bold text-indigo-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-lg">🎯</span>
                Current FYP Project
              </h3>
              <p className="text-indigo-900 font-bold text-xl">{profile.groupInfo.projectName || "Unnamed Project"}</p>
              {profile.groupInfo.description && (
                <p className="text-indigo-700/80 text-sm mt-2 leading-relaxed">{profile.groupInfo.description}</p>
              )}
              <div className="flex items-center gap-2 text-indigo-600 text-sm mt-3">
                {profile.groupInfo.isLocked ? (
                  <>
                    <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                    Team is finalized
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Team is open for new members
                  </>
                )}
              </div>
              
              {/* Team Members */}
              {profile.groupInfo.members && profile.groupInfo.members.length > 0 && (
                <div className="mt-4 pt-4 border-t border-indigo-200/50">
                  <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-3">Team Members</p>
                  <div className="flex flex-wrap gap-3">
                    {profile.groupInfo.members.map((member) => (
                      <div key={member.id} className="flex items-center gap-2 bg-white/70 px-3 py-2 rounded-lg border border-indigo-100">
                        {member.profilePicture ? (
                          <img
                            src={member.profilePicture}
                            alt={member.name}
                            className="w-8 h-8 rounded-full object-cover border border-indigo-200"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold border border-indigo-200">
                            {member.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-indigo-900">{member.name}</span>
                          <span className="text-xs text-indigo-500">{member.department}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Skills Section - Collapsible */}
      <div className="bg-white rounded-3xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Section Header - Clickable */}
        <button
          onClick={() => setIsSkillsOpen(!isSkillsOpen)}
          className="w-full px-6 sm:px-8 py-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 flex items-center justify-between cursor-pointer hover:from-blue-100 hover:to-indigo-100 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-2xl shadow-lg">
              💡
            </div>
            <div className="text-left">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Skills</h2>
              <p className="text-blue-600 text-sm font-medium">Technical expertise & capabilities</p>
            </div>
          </div>
          {isSkillsOpen ? (
            <ChevronUp className="w-6 h-6 text-gray-500" />
          ) : (
            <ChevronDown className="w-6 h-6 text-gray-500" />
          )}
        </button>

        {/* Collapsible Content */}
        {isSkillsOpen && (
          <div className="p-6 sm:p-8">
          {profile.skills.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-4xl opacity-50">🎯</span>
              </div>
              <p className="text-gray-500 font-medium text-lg">No skills listed yet</p>
              <p className="text-gray-400 text-sm mt-1">This student hasn't added any skills</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {profile.skills.map((skill) => {
                const levelConfig = getSkillLevelConfig(skill.level);
                return (
                  <div
                    key={skill.id}
                    className="bg-white rounded-xl p-4 border-2 border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">{skill.name}</h3>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold border ${levelConfig.bg} ${levelConfig.color}`}
                    >
                      <span>{levelConfig.icon}</span>
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

      {/* Projects Section - Collapsible */}
      <div className="bg-white rounded-3xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Section Header - Clickable */}
        <button
          onClick={() => setIsProjectsOpen(!isProjectsOpen)}
          className="w-full px-6 sm:px-8 py-5 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100 flex items-center justify-between cursor-pointer hover:from-emerald-100 hover:to-teal-100 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-2xl shadow-lg">
              🚀
            </div>
            <div className="text-left">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Projects</h2>
              <p className="text-emerald-600 text-sm font-medium">Portfolio & achievements</p>
            </div>
          </div>
          {isProjectsOpen ? (
            <ChevronUp className="w-6 h-6 text-gray-500" />
          ) : (
            <ChevronDown className="w-6 h-6 text-gray-500" />
          )}
        </button>

        {/* Collapsible Content */}
        {isProjectsOpen && (
        <div className="p-6 sm:p-8">
          {profile.projects.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-4xl opacity-50">🚀</span>
              </div>
              <p className="text-gray-500 font-medium text-lg">No projects listed yet</p>
              <p className="text-gray-400 text-sm mt-1">This student hasn't added any projects</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {profile.projects.map((project) => (
                <div
                  key={project.id}
                  className="bg-white rounded-xl p-5 border-2 border-gray-100 hover:border-emerald-200 hover:shadow-lg transition-all group"
                >
                  <h3 className="font-bold text-gray-900 text-xl mb-2 group-hover:text-emerald-600 transition-colors">{project.name}</h3>
                  
                  {project.description && (
                    <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                      {project.description}
                    </p>
                  )}

                  {/* Links */}
                  <div className="flex gap-3 flex-wrap">
                    {project.liveLink && (
                      <a
                        href={project.liveLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm px-4 py-2.5 bg-green-50 text-green-700 border-2 border-green-200 rounded-xl hover:bg-green-100 hover:shadow-md transition-all font-semibold"
                      >
                        🌐 Live Demo
                      </a>
                    )}
                    {project.githubLink && (
                      <a
                        href={project.githubLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm px-4 py-2.5 bg-gray-50 text-gray-700 border-2 border-gray-200 rounded-xl hover:bg-gray-100 hover:shadow-md transition-all font-semibold"
                      >
                        💻 GitHub
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

      {/* Contact/Action Section */}
      <div className="bg-white rounded-3xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
        <div className="p-6 sm:p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center">
            <span className="text-3xl">🤝</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            Interested in collaborating?
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Send a partner request to connect with <span className="font-semibold text-gray-900">{profile.name.split(" ")[0]}</span> for your FYP project.
          </p>
          <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl hover:scale-105">
            Send Partner Request
          </button>
        </div>
      </div>
    </div>
  );
}
