"use client";

/**
 * PublicProfileView Component
 * ---------------------------
 * Clean, minimalist profile display.
 */

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, Github, Linkedin, ExternalLink, Mail } from "lucide-react";
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
        bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
        label: "Available",
        dot: "bg-emerald-500",
      },
      BUSY: {
        bg: "bg-amber-50 text-amber-700 border-amber-200",
        label: "Busy",
        dot: "bg-amber-500",
      },
      AWAY: {
        bg: "bg-slate-100 text-slate-700 border-slate-200",
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
        bg: "bg-slate-100 text-slate-700 border-slate-200",
      };
    }
    if (profile.availableForGroup && profile.groupInfo) {
      return {
        label: "Open to partners",
        bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
      };
    }
    return {
      label: "Team locked",
      bg: "bg-slate-100 text-slate-600 border-slate-200",
    };
  })();

  const getSkillLevelConfig = (level: string) => {
    const config: Record<string, { label: string; bg: string }> = {
      BEGINNER: {
        bg: "bg-slate-100 text-slate-700 border-slate-200",
        label: "Beginner",
      },
      INTERMEDIATE: {
        bg: "bg-slate-100 text-slate-700 border-slate-200",
        label: "Intermediate",
      },
      ADVANCED: {
        bg: "bg-slate-100 text-slate-700 border-slate-200",
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
        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
      >
        <span aria-hidden>←</span>
        Back to Discovery
      </Link>

      {/* Header */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <div className="flex-shrink-0">
            {profile.profilePicture ? (
              <img
                src={profile.profilePicture}
                alt={profile.name}
                className="h-24 w-24 rounded-2xl object-cover ring-1 ring-slate-200 sm:h-28 sm:w-28"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-slate-100 text-2xl font-semibold text-slate-700 sm:h-28 sm:w-28">
                {getInitials(profile.name)}
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">{profile.name}</h1>
              <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${availabilityConfig.bg}`}>
                <span className={`h-2 w-2 rounded-full ${availabilityConfig.dot}`}></span>
                {availabilityConfig.label}
              </span>
              <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${groupStatusConfig.bg}`}>
                {groupStatusConfig.label}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-600">
              <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                {getDepartmentLabel(profile.department)}
              </span>
              <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                Semester {profile.semester}
              </span>
            </div>

            {profile.email && (
              <a
                href={`mailto:${profile.email}`}
                className="mt-3 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800"
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
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
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
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
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
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">About</p>
          <p className="mt-2 text-sm text-slate-700">{profile.interests}</p>
        </section>
      )}

      {/* Group */}
      {profile.isGrouped && profile.groupInfo && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Current FYP Project</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">
            {profile.groupInfo.projectName || "Unnamed Project"}
          </p>
          {profile.groupInfo.description && (
            <p className="mt-2 text-sm text-slate-600">{profile.groupInfo.description}</p>
          )}
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
            <span className={`h-2 w-2 rounded-full ${profile.groupInfo.isLocked ? "bg-slate-400" : "bg-emerald-500"}`}></span>
            {profile.groupInfo.isLocked ? "Team finalized" : "Open for members"}
          </div>

          {profile.groupInfo.members && profile.groupInfo.members.length > 0 && (
            <div className="mt-4 border-t border-slate-200 pt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Team Members</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {profile.groupInfo.members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5"
                  >
                    {member.profilePicture ? (
                      <img
                        src={member.profilePicture}
                        alt={member.name}
                        className="h-6 w-6 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
                        {member.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                    )}
                    <span className="text-xs font-medium text-slate-700">{member.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Skills */}
      <section className="rounded-2xl border border-slate-200 bg-white">
        <button
          onClick={() => setIsSkillsOpen(!isSkillsOpen)}
          className="flex w-full items-center justify-between px-6 py-4"
        >
          <div className="text-left">
            <p className="text-sm font-semibold text-slate-900">Skills</p>
            <p className="text-xs text-slate-500">{profile.skills.length} listed</p>
          </div>
          {isSkillsOpen ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
        </button>

        {isSkillsOpen && (
          <div className="px-6 pb-6">
            {profile.skills.length === 0 ? (
              <p className="text-sm text-slate-500">No skills listed</p>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {profile.skills.map((skill) => {
                  const levelConfig = getSkillLevelConfig(skill.level);
                  return (
                    <div key={skill.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-sm font-medium text-slate-900">{skill.name}</p>
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
      <section className="rounded-2xl border border-slate-200 bg-white">
        <button
          onClick={() => setIsProjectsOpen(!isProjectsOpen)}
          className="flex w-full items-center justify-between px-6 py-4"
        >
          <div className="text-left">
            <p className="text-sm font-semibold text-slate-900">Projects</p>
            <p className="text-xs text-slate-500">{profile.projects.length} listed</p>
          </div>
          {isProjectsOpen ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
        </button>

        {isProjectsOpen && (
          <div className="px-6 pb-6">
            {profile.projects.length === 0 ? (
              <p className="text-sm text-slate-500">No projects listed</p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {profile.projects.map((project) => (
                  <div key={project.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-medium text-slate-900">{project.name}</p>
                    {project.description && (
                      <p className="mt-2 text-sm text-slate-600 line-clamp-2">{project.description}</p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {project.liveLink && (
                        <a
                          href={project.liveLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
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
                          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
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
    </div>
  );
}
