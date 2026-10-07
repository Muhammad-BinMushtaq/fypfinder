"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Github, Linkedin, ExternalLink, Mail, Building2, Briefcase, Calendar, Award, Target, Code, Gamepad2 } from "lucide-react";
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

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const availabilityConfig = (() => {
    const config: Record<string, { label: string; dot: string; text: string }> = {
      AVAILABLE: { label: "Available", dot: "bg-emerald-500", text: "text-emerald-700 dark:text-emerald-400" },
      BUSY: { label: "Busy", dot: "bg-amber-500", text: "text-amber-700 dark:text-amber-400" },
      AWAY: { label: "Away", dot: "bg-slate-400", text: "text-slate-600 dark:text-slate-400" },
    };
    return config[profile.availability] || config.AWAY;
  })();

  const groupStatusConfig = (() => {
    if (!profile.isGrouped) {
      return { label: "Looking for group", text: "text-slate-600 dark:text-slate-400" };
    }
    if (profile.availableForGroup && profile.groupInfo) {
      return { label: "Open to partners", text: "text-emerald-700 dark:text-emerald-400" };
    }
    return { label: "Team locked", text: "text-slate-600 dark:text-slate-400" };
  })();

  const getSkillLevelConfig = (level: string) => {
    const config: Record<string, { label: string }> = {
      BEGINNER: { label: "Beginner" },
      INTERMEDIATE: { label: "Intermediate" },
      ADVANCED: { label: "Advanced" },
    };
    return config[level] || config.BEGINNER;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Back Button */}
      <Link
        href="/dashboard/discovery"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Discovery
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Sticky Profile Card */}
        <div className="lg:col-span-4 lg:sticky lg:top-8 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-sm">
            {/* Avatar & Header */}
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-4 w-24 h-24 rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex-shrink-0 shadow-sm">
                {profile.profilePicture ? (
                  <img src={profile.profilePicture} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 font-semibold text-2xl">
                    {getInitials(profile.name)}
                  </div>
                )}
              </div>

              {/* Name & Availability Badges */}
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                {profile.name}
              </h1>
              
              <div className="mt-2.5 flex flex-wrap items-center justify-center gap-2 text-xs font-medium">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                  <span className={`w-2 h-2 rounded-full ${availabilityConfig.dot}`} />
                  <span className={availabilityConfig.text}>{availabilityConfig.label}</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                  <span className={groupStatusConfig.text}>{groupStatusConfig.label}</span>
                </div>
              </div>
            </div>

            {/* Academic Info */}
            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="truncate">{getDepartmentLabel(profile.department)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Semester {profile.semester}</span>
              </div>
              {profile.email && (
                <a href={`mailto:${profile.email}`} className="flex items-center gap-2 hover:text-slate-900 dark:hover:text-white transition-colors truncate">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="truncate">{profile.email}</span>
                </a>
              )}
            </div>

            {/* Roles */}
            {profile.primaryRoles && profile.primaryRoles.length > 0 && (
              <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-800 flex justify-center">
                <PrimaryRoleBadges roles={profile.primaryRoles} />
              </div>
            )}

            {/* Socials */}
            {(profile.githubUrl || profile.linkedinUrl) && (
              <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-800 flex justify-center gap-2.5">
                {profile.githubUrl && (
                  <a href={profile.githubUrl} target="_blank" rel="noreferrer" className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 transition-colors">
                    <Github className="w-4 h-4" />
                  </a>
                )}
                {profile.linkedinUrl && (
                  <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 transition-colors">
                    <Linkedin className="w-4 h-4" />
                  </a>
                )}
              </div>
            )}

            {/* Parallel Actions */}
            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
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

        {/* Right Column: Details */}
        <div className="lg:col-span-8 space-y-12 mt-8 lg:mt-0">
          
          {/* About / Professional Profile */}
          <section className="space-y-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white tracking-tight">Professional Profile</h2>
            {profile.interests && (
              <div>
                <p className="text-sm font-medium text-slate-500 mb-2">About Me</p>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {profile.interests}
                </p>
              </div>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
              {profile.careerGoal && (
                <div>
                  <p className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-2">
                    <Target className="w-4 h-4" /> Career Goal
                  </p>
                  <p className="text-sm text-slate-700 dark:text-slate-300">{profile.careerGoal}</p>
                </div>
              )}
              {profile.fypIndustry && (
                <div>
                  <p className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-2">
                    <Briefcase className="w-4 h-4" /> FYP Industry
                  </p>
                  <p className="text-sm text-slate-700 dark:text-slate-300">{getIndustryLabel(profile.fypIndustry)}</p>
                </div>
              )}
              {profile.preferredTechStack && (
                <div>
                  <p className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-2">
                    <Code className="w-4 h-4" /> Tech Stack
                  </p>
                  <p className="text-sm text-slate-700 dark:text-slate-300">{profile.preferredTechStack}</p>
                </div>
              )}
              {profile.hobbies && (
                <div>
                  <p className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-2">
                    <Gamepad2 className="w-4 h-4" /> Hobbies
                  </p>
                  <p className="text-sm text-slate-700 dark:text-slate-300">{profile.hobbies}</p>
                </div>
              )}
            </div>
          </section>

          {/* Group Info */}
          {profile.isGrouped && profile.groupInfo && (
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white tracking-tight">Current FYP Team</h2>
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-100 dark:border-white/5">
                <p className="text-lg font-semibold text-slate-900 dark:text-white">
                  {profile.groupInfo.projectName || "Unnamed Project"}
                </p>
                {profile.groupInfo.description && (
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-2xl">{profile.groupInfo.description}</p>
                )}
                <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium">
                  <span className={`w-2 h-2 rounded-full ${profile.groupInfo.isLocked ? "bg-slate-400" : "bg-emerald-500"}`} />
                  <span className="text-slate-600 dark:text-slate-300">
                    {profile.groupInfo.isLocked ? "Team finalized" : "Open for members"}
                  </span>
                </div>

                {profile.groupInfo.members && profile.groupInfo.members.length > 0 && (
                  <div className="mt-6 flex flex-wrap gap-3">
                    {profile.groupInfo.members.map((member) => (
                      <div key={member.id} className="flex items-center gap-2 rounded-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 px-3 py-1.5 shadow-sm">
                        {member.profilePicture ? (
                          <img src={member.profilePicture} alt={member.name} className="w-6 h-6 rounded-full object-cover" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-semibold text-slate-500">
                            {member.name.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{member.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Skills Grid */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white tracking-tight">Skills & Expertise</h2>
            {profile.skills.length === 0 ? (
              <p className="text-sm text-slate-500 italic">No skills listed</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <div key={skill.id} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-white/5">
                    <span className="text-sm font-medium text-slate-900 dark:text-white">{skill.name}</span>
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                      {getSkillLevelConfig(skill.level).label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Projects */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white tracking-tight">Projects</h2>
            {profile.projects.length === 0 ? (
              <p className="text-sm text-slate-500 italic">No projects listed</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.projects.map((project) => (
                  <div key={project.id} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow">
                    <p className="text-base font-semibold text-slate-900 dark:text-white">{project.name}</p>
                    {project.description && (
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{project.description}</p>
                    )}
                    <div className="mt-6 flex flex-wrap gap-3">
                      {project.liveLink && (
                        <a href={project.liveLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                          <ExternalLink className="w-3.5 h-3.5" /> Live Demo
                        </a>
                      )}
                      {project.githubLink && (
                        <a href={project.githubLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                          <Github className="w-3.5 h-3.5" /> Source Code
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Internships */}
          {profile.internships && profile.internships.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white tracking-tight">Experience</h2>
              <div className="space-y-4">
                {profile.internships.map((internship) => (
                  <div key={internship.id} className="flex gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-white/5">
                        <Building2 className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                    <div>
                      <p className="text-base font-semibold text-slate-900 dark:text-white">{internship.position}</p>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{internship.companyName}</p>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" /> {internship.duration}
                      </p>
                      {internship.description && (
                        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">{internship.description}</p>
                      )}
                      {internship.certificateLink && (
                        <a href={internship.certificateLink} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                          <Award className="w-3.5 h-3.5" /> View Certificate
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>
      </div>
    </div>
  );
}
