"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Github,
  Linkedin,
  ExternalLink,
  Mail,
  Building2,
  Briefcase,
  Calendar,
  Award,
  Code,
  Gamepad2,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  Users,
  FolderGit2,
} from "lucide-react";
import type { PublicStudentProfile } from "@/services/studentPublic.service";
import { SendRequestButtons } from "@/components/request/SendRequestButtons";
import { getDepartmentLabel } from "@/lib/departments";
import { getIndustryLabel } from "@/lib/industries";
import { PrimaryRoleBadges } from "./PrimaryRoleBadges";

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
  const [showAllSkills, setShowAllSkills] = useState(false);
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [showAllInternships, setShowAllInternships] = useState(false);

  const SKILLS_LIMIT = 8;
  const PROJECTS_LIMIT = 3;
  const INTERNSHIPS_LIMIT = 3;

  const visibleSkills = showAllSkills ? profile.skills : profile.skills.slice(0, SKILLS_LIMIT);
  const visibleProjects = showAllProjects ? profile.projects : profile.projects.slice(0, PROJECTS_LIMIT);
  const visibleInternships = showAllInternships ? profile.internships : profile.internships?.slice(0, INTERNSHIPS_LIMIT);

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const availabilityConfig = useMemo(() => {
    const config: Record<string, { label: string; dot: string; text: string; bg: string }> = {
      AVAILABLE: {
        label: "Available",
        dot: "bg-emerald-500",
        text: "text-emerald-700 dark:text-emerald-400",
        bg: "bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200/60 dark:border-emerald-800/60",
      },
      BUSY: {
        label: "Busy",
        dot: "bg-amber-500",
        text: "text-amber-700 dark:text-amber-400",
        bg: "bg-amber-50/80 dark:bg-amber-950/30 border-amber-200/60 dark:border-amber-800/60",
      },
      AWAY: {
        label: "Away",
        dot: "bg-slate-400",
        text: "text-slate-600 dark:text-slate-400",
        bg: "bg-slate-50 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60",
      },
    };
    return config[profile.availability] || config.AWAY;
  }, [profile.availability]);

  const groupStatusConfig = useMemo(() => {
    if (!profile.isGrouped) {
      return {
        label: "Looking for team",
        text: "text-slate-700 dark:text-slate-300",
        bg: "bg-slate-100/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60",
      };
    }
    if (profile.availableForGroup && profile.groupInfo) {
      return {
        label: "Open to partners",
        text: "text-emerald-700 dark:text-emerald-400",
        bg: "bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200/60 dark:border-emerald-800/60",
      };
    }
    return {
      label: "Team locked",
      text: "text-slate-600 dark:text-slate-400",
      bg: "bg-slate-100/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60",
    };
  }, [profile.isGrouped, profile.availableForGroup, profile.groupInfo]);

  // Preferred tech stack parsed into array
  const techStackList = useMemo(() => {
    if (!profile.preferredTechStack) return [];
    return profile.preferredTechStack
      .split(/[,+]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }, [profile.preferredTechStack]);

  const getSeekingStatusLabel = (status?: string | null) => {
    if (!status) return null;
    switch (status) {
      case "LOOKING_FOR_TEAM":
        return "Seeking FYP Team";
      case "LOOKING_FOR_MEMBERS":
        return "Recruiting FYP Partners";
      case "TEAM_FULL":
        return "Team Complete";
      default:
        return status.replace(/_/g, " ");
    }
  };

  const seekingStatusLabel = getSeekingStatusLabel(profile.seekingStatus);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 select-none">
      {/* Top Header / Breadcrumbs */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/dashboard/discovery"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-all shadow-xs active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Discovery</span>
        </Link>

        {/* Mutual Connection Badge */}
        {!isSameStudent && (
          <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60">
            <span className={`w-2 h-2 rounded-full ${availabilityConfig.dot}`} />
            <span>{availabilityConfig.label} for collaboration</span>
          </div>
        )}
      </div>

      {/* Main Grid: Left Identity Deck + Right Bento Portfolio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        
        {/* ========================================= */}
        {/* LEFT COLUMN: Sticky Identity & Quick Hub  */}
        {/* ========================================= */}
        <aside className="lg:col-span-4 lg:sticky lg:top-6 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-sm">
            {/* Avatar & Header */}
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-4 w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex-shrink-0 shadow-sm mx-auto">
                {profile.profilePicture ? (
                  <img
                    src={profile.profilePicture}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-2xl sm:text-3xl">
                    {getInitials(profile.name)}
                  </div>
                )}
              </div>

              {/* Name & Academic Title */}
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                {profile.name}
              </h1>

              {/* Status Badges */}
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs font-medium">
                <div
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${availabilityConfig.bg}`}
                >
                  <span className={`w-2 h-2 rounded-full ${availabilityConfig.dot}`} />
                  <span className={availabilityConfig.text}>{availabilityConfig.label}</span>
                </div>
                <div
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${groupStatusConfig.bg}`}
                >
                  <span className={groupStatusConfig.text}>{groupStatusConfig.label}</span>
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80 space-y-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2.5">
                <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="truncate">{getDepartmentLabel(profile.department)}</span>
              </div>
              <div className="flex items-center gap-2.5">
                {profile.isGraduated ? (
                  <>
                    <GraduationCap className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                      Graduated Alumni
                    </span>
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Semester {profile.semester}</span>
                  </>
                )}
              </div>
              {profile.email && (
                <a
                  href={`mailto:${profile.email}`}
                  className="flex items-center gap-2.5 hover:text-slate-900 dark:hover:text-white transition-colors truncate"
                  title="Contact via university email"
                >
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="truncate">{profile.email}</span>
                </a>
              )}
            </div>

            {/* Roles if defined */}
            {profile.primaryRoles && profile.primaryRoles.length > 0 && (
              <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-800/80 flex justify-center">
                <PrimaryRoleBadges roles={profile.primaryRoles} />
              </div>
            )}

            {/* Social Links */}
            {(profile.githubUrl || profile.linkedinUrl) && (
              <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-800/80 flex justify-center gap-2.5">
                {profile.githubUrl && (
                  <a
                    href={profile.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 transition-all active:scale-95 shadow-xs"
                    title="View GitHub Profile"
                  >
                    <Github className="w-4 h-4" />
                  </a>
                )}
                {profile.linkedinUrl && (
                  <a
                    href={profile.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 transition-all active:scale-95 shadow-xs"
                    title="View LinkedIn Profile"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                )}
              </div>
            )}

            {/* Primary Collaboration Action Hub */}
            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800/80">
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
                isTargetGraduated={profile.isGraduated}
              />
            </div>
          </div>
        </aside>

        {/* ========================================== */}
        {/* RIGHT COLUMN: Modern FYP Portfolio Bento   */}
        {/* ========================================== */}
        <main className="lg:col-span-8 space-y-6">
          
          {/* 1. Target FYP Industry & Technical Focus */}
          <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
              <div className="flex items-center gap-2.5">
                <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <span className="text-xs font-medium text-slate-400 dark:text-slate-500 block">
                    Target FYP Industry
                  </span>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                    {profile.fypIndustry ? getIndustryLabel(profile.fypIndustry) : "General / Open to Ideas"}
                  </h2>
                </div>
              </div>

              {seekingStatusLabel && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {seekingStatusLabel}
                </span>
              )}
            </div>

            {/* Preferred Tech Stack */}
            {techStackList.length > 0 && (
              <div>
                <span className="text-xs font-medium text-slate-400 dark:text-slate-500 flex items-center gap-2 mb-2.5">
                  <Code className="w-4 h-4 text-slate-400 shrink-0" /> Preferred Technologies for FYP
                </span>
                <div className="flex flex-wrap gap-2">
                  {techStackList.map((tech, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 text-xs font-medium"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Bio / About */}
            {profile.interests && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mb-1.5">
                  About & Collaboration Vision
                </p>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {profile.interests}
                </p>
              </div>
            )}

            {/* Hobbies if any */}
            {profile.hobbies && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <span className="text-xs font-medium text-slate-400 dark:text-slate-500 flex items-center gap-2 mb-1.5">
                  <Gamepad2 className="w-4 h-4 text-slate-400 shrink-0" /> Hobbies & Interests
                </span>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  {profile.hobbies}
                </p>
              </div>
            )}
          </section>

          {/* 2. Current FYP Team Section (if part of a group) */}
          {profile.isGrouped && profile.groupInfo && (
            <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-sm space-y-4">
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-3">
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                      Current FYP Team
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Team status and active members
                    </p>
                  </div>
                </div>

                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                    profile.groupInfo.isLocked
                      ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60"
                      : "bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      profile.groupInfo.isLocked ? "bg-slate-400" : "bg-emerald-500 animate-pulse"
                    }`}
                  />
                  {profile.groupInfo.isLocked ? "Team Finalized" : "Open for Members"}
                </span>
              </div>

              <div className="space-y-3 pt-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {profile.groupInfo.projectName || "Registered FYP Team"}
                </h3>
                {profile.groupInfo.description && (
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {profile.groupInfo.description}
                  </p>
                )}

                {/* Team Members List */}
                {profile.groupInfo.members && profile.groupInfo.members.length > 0 && (
                  <div className="pt-2">
                    <span className="text-xs font-medium text-slate-400 dark:text-slate-500 block mb-2">
                      Team Members ({profile.groupInfo.members.length})
                    </span>
                    <div className="flex flex-wrap gap-2.5">
                      {profile.groupInfo.members.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center gap-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 px-3 py-1.5 shadow-xs"
                        >
                          {member.profilePicture ? (
                            <img
                              src={member.profilePicture}
                              alt={member.name}
                              className="w-5 h-5 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-300">
                              {member.name.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                            {member.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* 3. Skills Matrix (Clean & Structured by Proficiency) */}
          <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-sm space-y-4">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <div className="flex items-center gap-2.5">
                <Code className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                    Skills
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Demonstrated technical strengths
                  </p>
                </div>
              </div>

              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {profile.skills.length} Skills
              </span>
            </div>

            {profile.skills.length === 0 ? (
              <p className="text-sm text-slate-500 italic py-2">No skills listed yet.</p>
            ) : (
              <div className="space-y-4 pt-1">
                <div className="flex flex-wrap gap-2">
                  {visibleSkills.map((skill) => {
                    const isAdvanced = skill.level === "ADVANCED";
                    return (
                      <div
                        key={skill.id}
                        className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                          isAdvanced
                            ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-xs"
                            : "bg-slate-50/80 dark:bg-slate-800/40 border-slate-200/70 dark:border-slate-700/70 text-slate-800 dark:text-slate-200"
                        }`}
                      >
                        <span>{skill.name}</span>
                        <span
                          className={`text-[10px] uppercase font-bold tracking-wider inline-flex items-center gap-1 ${
                            isAdvanced
                              ? "text-emerald-300 dark:text-emerald-600"
                              : "text-slate-400 dark:text-slate-500"
                          }`}
                        >
                          {isAdvanced && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 dark:bg-emerald-500 shrink-0" />}
                          {skill.level}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {profile.skills.length > SKILLS_LIMIT && (
                  <button
                    onClick={() => setShowAllSkills(!showAllSkills)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors pt-1"
                  >
                    {showAllSkills ? (
                      <>
                        <ChevronUp className="w-3.5 h-3.5" /> Show Fewer Skills
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-3.5 h-3.5" /> View All {profile.skills.length} Skills
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </section>

          {/* 4. Featured Portfolio Projects */}
          <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-sm space-y-4">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <div className="flex items-center gap-2.5">
                <FolderGit2 className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                    Featured Projects & Work
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Past projects demonstrating implementation ability
                  </p>
                </div>
              </div>

              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {profile.projects.length} Projects
              </span>
            </div>

            {profile.projects.length === 0 ? (
              <p className="text-sm text-slate-500 italic py-2">No projects showcased yet.</p>
            ) : (
              <div className="space-y-4 pt-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {visibleProjects.map((project) => (
                    <div
                      key={project.id}
                      className="bg-slate-50/60 dark:bg-slate-800/30 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800 flex flex-col justify-between hover:shadow-md transition-all"
                    >
                      <div className="space-y-2">
                        <h4 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                          {project.name}
                        </h4>
                        {project.description && (
                          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                            {project.description}
                          </p>
                        )}
                      </div>

                      {/* Action Links */}
                      {(project.liveLink || project.githubLink) && (
                        <div className="mt-4 pt-3 border-t border-slate-200/40 dark:border-slate-800 flex items-center gap-3">
                          {project.liveLink && (
                            <a
                              href={project.liveLink}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                              <ExternalLink className="w-3.5 h-3.5" /> Live Demo
                            </a>
                          )}
                          {project.githubLink && (
                            <a
                              href={project.githubLink}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                            >
                              <Github className="w-3.5 h-3.5" /> Source
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {profile.projects.length > PROJECTS_LIMIT && (
                  <button
                    onClick={() => setShowAllProjects(!showAllProjects)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors pt-1"
                  >
                    {showAllProjects ? (
                      <>
                        <ChevronUp className="w-3.5 h-3.5" /> Show Fewer Projects
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-3.5 h-3.5" /> View All {profile.projects.length} Projects
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </section>

          {/* 5. Experience & Internships (if any) */}
          {profile.internships && profile.internships.length > 0 && (
            <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-sm space-y-4">
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-3">
                <div className="flex items-center gap-2.5">
                  <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                      Experience & Internships
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Real-world organizational experience
                    </p>
                  </div>
                </div>

                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {profile.internships.length} Positions
                </span>
              </div>

              <div className="space-y-4 pt-1">
                {visibleInternships?.map((internship) => (
                  <div
                    key={internship.id}
                    className="p-4 rounded-2xl bg-slate-50/60 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-800 space-y-2"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div>
                        <h4 className="text-base font-bold text-slate-900 dark:text-white">
                          {internship.position}
                        </h4>
                        <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300">
                          {internship.companyName}
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500 font-medium">
                        <Calendar className="w-3.5 h-3.5" /> {internship.duration}
                      </span>
                    </div>

                    {internship.description && (
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed pt-1">
                        {internship.description}
                      </p>
                    )}

                    {internship.certificateLink && (
                      <a
                        href={internship.certificateLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline pt-1"
                      >
                        <Award className="w-3.5 h-3.5" /> View Certificate
                      </a>
                    )}
                  </div>
                ))}

                {profile.internships.length > INTERNSHIPS_LIMIT && (
                  <button
                    onClick={() => setShowAllInternships(!showAllInternships)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors pt-1"
                  >
                    {showAllInternships ? (
                      <>
                        <ChevronUp className="w-3.5 h-3.5" /> Show Fewer Experiences
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-3.5 h-3.5" /> View All {profile.internships.length} Experiences
                      </>
                    )}
                  </button>
                )}
              </div>
            </section>
          )}

        </main>
      </div>
    </div>
  );
}
