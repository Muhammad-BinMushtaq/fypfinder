"use client";

/**
 * PublicProfileView Component
 * ---------------------------
 * Clean, minimalist profile display with dark mode support.
 */

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, Github, Linkedin, ExternalLink, Mail, Building2, Briefcase, Calendar, Award, Target, Code, Gamepad2 } from "lucide-react";
import type { PublicStudentProfile } from "@/services/studentPublic.service";
import { SendRequestButtons } from "@/components/request/SendRequestButtons";
import { getDepartmentLabel } from "@/lib/departments";

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
  const [isInternshipsOpen, setIsInternshipsOpen] = useState(true);

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const availabilityConfig = (() => {
    const config: Record<string, { label: string; dot: string; bg: string }> = {
      AVAILABLE: {
        bg: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
        label: "Available",
        dot: "bg-emerald-500",
      },
      BUSY: {
        bg: "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
        label: "Busy",
        dot: "bg-amber-500",
      },
      AWAY: {
        bg: "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600",
        label: "Away",
        dot: "bg-slate-400",
      },
    };
    return config[profile.availability] || config.AWAY;
  })();

  const groupStatusConfig = (() => {
    if (!profile.isGrouped) {
      return {
        label: "Looking for group",
        bg: "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600",
      };
    }
    if (profile.availableForGroup && profile.groupInfo) {
      return {
        label: "Open to partners",
        bg: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
      };
    }
    return {
      label: "Team locked",
      bg: "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-600",
    };
  })();

  const getSkillLevelConfig = (level: string) => {
    const config: Record<string, { label: string; bg: string }> = {
      BEGINNER: {
        bg: "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600",
        label: "Beginner",
      },
      INTERMEDIATE: {
        bg: "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600",
        label: "Intermediate",
      },
      ADVANCED: {
        bg: "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600",
        label: "Advanced",
      },
    };
    return config[level] || config.BEGINNER;
  };

  return (
    <div className="space-y-8">
      {/* Back */}
      <Link
        href="/dashboard/discovery"
        className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
      >
        <span aria-hidden>←</span>
        Back to Discovery
      </Link>

      {/* Header */}
      <section className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <div className="flex-shrink-0">
            {profile.profilePicture ? (
              <img
                src={profile.profilePicture}
                alt={profile.name}
                className="h-24 w-24 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-700 sm:h-28 sm:w-28"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 text-2xl font-semibold text-slate-700 dark:text-slate-300 sm:h-28 sm:w-28">
                {getInitials(profile.name)}
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold text-slate-900 dark:text-white sm:text-3xl">{profile.name}</h1>
              <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${availabilityConfig.bg}`}>
                <span className={`h-2 w-2 rounded-full ${availabilityConfig.dot}`}></span>
                {availabilityConfig.label}
              </span>
              <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${groupStatusConfig.bg}`}>
                {groupStatusConfig.label}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-600 dark:text-slate-400">
              <span className="rounded-md bg-slate-100 dark:bg-slate-700 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300">
                {getDepartmentLabel(profile.department)}
              </span>
              <span className="rounded-md bg-slate-100 dark:bg-slate-700 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300">
                Semester {profile.semester}
              </span>
            </div>

            {profile.email && (
              <a
                href={`mailto:${profile.email}`}
                className="mt-3 inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
              >
                <Mail className="h-4 w-4" />
                {profile.email}
              </a>
            )}

            {(profile.githubUrl || profile.linkedinUrl) && (
              <div className="mt-4 flex flex-wrap gap-2">
                {profile.githubUrl && (
                  <a
                    href={profile.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600"
                  >
                    <Github className="h-4 w-4" />
                    GitHub
                  </a>
                )}
                {profile.linkedinUrl && (
                  <a
                    href={profile.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600"
                  >
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                  </a>
                )}
              </div>
            )}

            <div className="mt-5">
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
      </section>

      {/* About */}
      {profile.interests && (
        <section className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">About</p>
          <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{profile.interests}</p>
        </section>
      )}

      {/* Career & Professional Info */}
      {(profile.careerGoal || profile.hobbies || profile.preferredTechStack || profile.fypIndustry) && (
        <section className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Professional Profile</p>
          
          {profile.careerGoal && (
            <div className="mt-4">
              <p className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                <Target className="h-3.5 w-3.5" /> Career Goal
              </p>
              <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{profile.careerGoal}</p>
            </div>
          )}

          {profile.fypIndustry && (
            <div className="mt-4">
              <p className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                <Briefcase className="h-3.5 w-3.5" /> FYP Industry
              </p>
              <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{profile.fypIndustry}</p>
            </div>
          )}

          {profile.preferredTechStack && (
            <div className="mt-4">
              <p className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                <Code className="h-3.5 w-3.5" /> Preferred Tech Stack
              </p>
              <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{profile.preferredTechStack}</p>
            </div>
          )}

          {profile.hobbies && (
            <div className="mt-4">
              <p className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                <Gamepad2 className="h-3.5 w-3.5" /> Hobbies
              </p>
              <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{profile.hobbies}</p>
            </div>
          )}
        </section>
      )}

      {/* Group */}
      {profile.isGrouped && profile.groupInfo && (
        <section className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Current FYP Project</p>
          <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
            {profile.groupInfo.projectName || "Unnamed Project"}
          </p>
          {profile.groupInfo.description && (
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{profile.groupInfo.description}</p>
          )}
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-slate-100 dark:bg-slate-700 px-3 py-1 text-xs font-medium text-slate-700 dark:text-slate-300">
            <span className={`h-2 w-2 rounded-full ${profile.groupInfo.isLocked ? "bg-slate-400" : "bg-emerald-500"}`}></span>
            {profile.groupInfo.isLocked ? "Team finalized" : "Open for members"}
          </div>

          {profile.groupInfo.members && profile.groupInfo.members.length > 0 && (
            <div className="mt-4 border-t border-slate-200 dark:border-slate-700 pt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Team Members</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {profile.groupInfo.members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-1.5"
                  >
                    {member.profilePicture ? (
                      <img
                        src={member.profilePicture}
                        alt={member.name}
                        className="h-6 w-6 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-600 text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {member.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                    )}
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{member.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Skills */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <button
          onClick={() => setIsSkillsOpen(!isSkillsOpen)}
          className="flex w-full items-center justify-between px-6 py-4"
        >
          <div className="text-left">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Skills</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{profile.skills.length} listed</p>
          </div>
          {isSkillsOpen ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
        </button>

        {isSkillsOpen && (
          <div className="px-6 pb-6">
            {profile.skills.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">No skills listed</p>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {profile.skills.map((skill) => {
                  const levelConfig = getSkillLevelConfig(skill.level);
                  return (
                    <div key={skill.id} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 p-4">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{skill.name}</p>
                      <span className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${levelConfig.bg}`}>
                        {levelConfig.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Projects */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <button
          onClick={() => setIsProjectsOpen(!isProjectsOpen)}
          className="flex w-full items-center justify-between px-6 py-4"
        >
          <div className="text-left">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Projects</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{profile.projects.length} listed</p>
          </div>
          {isProjectsOpen ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
        </button>

        {isProjectsOpen && (
          <div className="px-6 pb-6">
            {profile.projects.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">No projects listed</p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {profile.projects.map((project) => (
                  <div key={project.id} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 p-4">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{project.name}</p>
                    {project.description && (
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{project.description}</p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {project.liveLink && (
                        <a
                          href={project.liveLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Live
                        </a>
                      )}
                      {project.githubLink && (
                        <a
                          href={project.githubLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600"
                        >
                          <Github className="h-3 w-3" />
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
      </section>

      {/* Internships */}
      {profile.internships && profile.internships.length > 0 && (
        <section className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <button
            onClick={() => setIsInternshipsOpen(!isInternshipsOpen)}
            className="flex w-full items-center justify-between px-6 py-4"
          >
            <div className="text-left">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Internship Experience</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{profile.internships.length} listed</p>
            </div>
            {isInternshipsOpen ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
          </button>

          {isInternshipsOpen && (
            <div className="px-6 pb-6">
              <div className="space-y-4">
                {profile.internships.map((internship) => (
                  <div key={internship.id} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-200 dark:bg-slate-600 flex-shrink-0">
                        <Building2 className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{internship.companyName}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                          <Briefcase className="h-3 w-3" />
                          {internship.position}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-500 flex items-center gap-1 mt-1">
                          <Calendar className="h-3 w-3" />
                          {internship.duration}
                        </p>
                        {internship.description && (
                          <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{internship.description}</p>
                        )}
                        {internship.certificateLink && (
                          <a
                            href={internship.certificateLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            <Award className="h-3 w-3" />
                            View Certificate
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
