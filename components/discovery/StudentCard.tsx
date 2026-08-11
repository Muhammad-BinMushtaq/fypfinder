// components/discovery/StudentCard.tsx
"use client";

/**
 * StudentCard Component
 * ---------------------
 * Content-rich student preview card for discovery grid.
 */

import { useRouter } from "next/navigation";
import Image from "next/image";
import { Github, Linkedin, Lock, ChevronRight, FolderGit2, Heart } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { prefetchPublicProfile } from "@/hooks/student/usePublicProfile";
import type { MatchedStudent } from "@/services/discovery.service";
import { useState } from "react";
import { sendPartnerRequest } from "@/services/requestPartner.service";
import { toast } from "react-toastify";

interface StudentCardProps {
  student: MatchedStudent;
}

export function StudentCard({ student }: StudentCardProps) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [showInvite, setShowInvite] = useState(false);
  const [inviteNote, setInviteNote] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleCardClick = () => {
    router.push(`/dashboard/discovery/profile/${student.id}`);
  };

  const handleMouseEnter = () => {
    prefetchPublicProfile(queryClient, student.id);
  };

  const getAvailabilityConfig = () => {
    if (student.isGroupLocked) {
      return {
        label: "Locked",
        icon: <Lock className="w-3 h-3" />,
        dotColor: "bg-gray-400",
      };
    }
    
    switch (student.availability) {
      case "AVAILABLE":
        return { label: "Available", dotColor: "bg-emerald-500" };
      case "BUSY":
        return { label: "Busy", dotColor: "bg-amber-500" };
      case "AWAY":
        return { label: "Away", dotColor: "bg-gray-400" };
      default:
        return { label: "Unknown", dotColor: "bg-gray-400" };
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const availabilityConfig = getAvailabilityConfig();

  return (
    <div
      onClick={handleCardClick}
      onMouseEnter={handleMouseEnter}
      className="group cursor-pointer"
    >
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 transition-all duration-200 overflow-hidden h-full flex flex-col">
        {/* Header */}
        <div className="p-4 pb-3">
          <div className="flex items-start gap-3">
            {/* Avatar */}
            {student.profilePicture ? (
              <div className="relative w-14 h-14 rounded-full overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-slate-700 ring-2 ring-gray-100 dark:ring-slate-700">
                <Image
                  src={student.profilePicture}
                  alt={student.name}
                  fill
                  sizes="56px"
                  className="object-cover"
                  loading="lazy"
                />
              </div>
            ) : (
              <div className="w-14 h-14 rounded-full bg-gray-900 dark:bg-white flex items-center justify-center text-white dark:text-gray-900 font-semibold text-base flex-shrink-0 ring-2 ring-gray-100 dark:ring-slate-700">
                {getInitials(student.name)}
              </div>
            )}

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white text-base truncate">
                {student.name}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {student.department} · Sem {student.semester}
              </p>
              
              {/* Availability & Projects */}
              <div className="flex items-center gap-3 mt-1.5">
                <div className="flex items-center gap-1.5">
                  {availabilityConfig.icon || (
                    <span className={`w-1.5 h-1.5 rounded-full ${availabilityConfig.dotColor}`} />
                  )}
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {availabilityConfig.label}
                  </span>
                </div>
                {student.projectCount > 0 && (
                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <FolderGit2 className="w-3 h-3" />
                    <span>{student.projectCount} project{student.projectCount !== 1 ? "s" : ""}</span>
                  </div>
                )}
              </div>
              
              {/* Seeking Status & Role Gaps */}
              {student.seekingStatus === "HAS_TEAM_LOOKING_FOR_MEMBERS" && (
                <div className="mt-2 inline-flex items-center gap-1 text-xs font-medium bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800/50">
                  <span className="truncate">Team looking for: {student.primaryRoles?.length > 0 ? student.primaryRoles.join(', ') : "Members"}</span>
                </div>
              )}
              {student.seekingStatus === "LOOKING_FOR_TEAM" && student.primaryRoles?.length > 0 && (
                <div className="mt-2 inline-flex flex-wrap gap-1">
                  {student.primaryRoles.map(role => (
                    <span key={role} className="text-[10px] font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800/50">
                      {role}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bio */}
        {student.interests && (
          <div className="px-4 pb-3">
            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
              {student.interests}
            </p>
          </div>
        )}

        {/* Hobbies */}
        {student.hobbies && (
          <div className="px-4 pb-3">
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-1.5 font-medium flex items-center gap-1">
              <Heart className="w-3 h-3" /> Hobbies
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-1">
              {student.hobbies}
            </p>
          </div>
        )}

        {/* Projects */}
        {student.projectNames.length > 0 && (
          <div className="px-4 pb-3">
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-1.5 font-medium flex items-center gap-1">
              <FolderGit2 className="w-3 h-3" /> Projects
            </p>
            <div className="flex flex-wrap gap-1.5">
              {student.projectNames.slice(0, 3).map((name, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-xs rounded-md font-medium truncate max-w-[140px]"
                >
                  {name}
                </span>
              ))}
              {student.projectNames.length > 3 && (
                <span className="px-2 py-0.5 text-gray-400 dark:text-gray-500 text-xs font-medium">
                  +{student.projectNames.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Skills */}
        {student.skills.length > 0 && (
          <div className="px-4 pb-3">
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-1.5 font-medium">Skills</p>
            <div className="flex flex-wrap gap-1.5">
              {student.skills.slice(0, 5).map((skill, index) => (
                <span
                  key={index}
                  className="px-2.5 py-1 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 text-xs rounded-md font-medium"
                >
                  {skill}
                </span>
              ))}
              {student.skills.length > 5 && (
                <span className="px-2 py-1 text-gray-400 dark:text-gray-500 text-xs font-medium">
                  +{student.skills.length - 5} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Empty state if nothing to show */}
        {!student.interests && !student.hobbies && student.skills.length === 0 && student.projectNames.length === 0 && (
          <div className="px-4 pb-3">
            <p className="text-sm text-gray-400 dark:text-gray-500 italic">
              No bio or skills added yet
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto border-t border-gray-100 dark:border-slate-700 px-4 py-3 space-y-2">
          {/* Profile Completion */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  student.profileCompletion === 100
                    ? "bg-emerald-500"
                    : student.profileCompletion >= 70
                    ? "bg-blue-500"
                    : "bg-amber-500"
                }`}
                style={{ width: `${student.profileCompletion}%` }}
              />
            </div>
            <span className="text-xs text-gray-400 dark:text-gray-500 font-medium tabular-nums w-8 text-right">
              {student.profileCompletion}%
            </span>
          </div>

          <div className="flex items-center justify-between">
          {/* Social Links */}
          <div className="flex items-center gap-1.5">
            {student.githubUrl && (
              <a
                href={student.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="w-7 h-7 rounded-md bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 flex items-center justify-center transition-colors"
                title="GitHub"
              >
                <Github className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
              </a>
            )}
            {student.linkedinUrl && (
              <a
                href={student.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="w-7 h-7 rounded-md bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 flex items-center justify-center transition-colors"
                title="LinkedIn"
              >
                <Linkedin className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
              </a>
            )}
            {!student.githubUrl && !student.linkedinUrl && (
              <span className="text-xs text-gray-400 dark:text-gray-500">No links</span>
            )}
          </div>

          {/* View / Invite */}
          <div className="flex items-center gap-2">
            {!student.isGroupLocked && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowInvite(true);
                }}
                className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Quick Invite
              </button>
            )}
            <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
              <span>View</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
          </div>
        </div>
      </div>

      {showInvite && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={(e) => e.stopPropagation()}>
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-200 dark:border-slate-800">
              <h3 className="font-semibold text-gray-900 dark:text-white">Invite {student.name}</h3>
            </div>
            <div className="p-4 space-y-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Custom Note (Optional)</label>
              <textarea
                autoFocus
                value={inviteNote}
                onChange={(e) => setInviteNote(e.target.value)}
                placeholder="Hi! I saw your profile and..."
                className="w-full text-sm p-3 border border-gray-200 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:border-blue-500 resize-none h-24"
              />
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-slate-800 flex gap-2 justify-end">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowInvite(false);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                disabled={isSending}
                onClick={async (e) => {
                  e.stopPropagation();
                  setIsSending(true);
                  try {
                    await sendPartnerRequest({ toStudentId: student.id, reason: inviteNote });
                    toast.success("Invite sent!");
                    setShowInvite(false);
                  } catch (err: any) {
                    toast.error(err.message || "Failed to send invite");
                  } finally {
                    setIsSending(false);
                  }
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
              >
                {isSending ? "Sending..." : "Send Invite"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
