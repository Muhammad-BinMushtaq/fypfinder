// components/discovery/StudentCard.tsx
"use client";

/**
 * StudentCard Component
 * ---------------------
 * Minimalist student preview card for discovery grid.
 */

import { useRouter } from "next/navigation";
import Image from "next/image";
import { Github, Linkedin, Lock, ChevronRight } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { prefetchPublicProfile } from "@/hooks/student/usePublicProfile";
import type { MatchedStudent } from "@/services/discovery.service";

interface StudentCardProps {
  student: MatchedStudent;
}

export function StudentCard({ student }: StudentCardProps) {
  const queryClient = useQueryClient();
  const router = useRouter();

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

  const availabilityConfig = getAvailabilityConfig();  const availabilityConfig = getAvailabilityConfig();

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
              <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-slate-700">
                <Image
                  src={student.profilePicture}
                  alt={student.name}
                  fill
                  sizes="48px"
                  className="object-cover"
                  loading="lazy"
                />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-900 dark:bg-white flex items-center justify-center text-white dark:text-gray-900 font-semibold text-sm flex-shrink-0">
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
              
              {/* Availability */}
              <div className="flex items-center gap-1.5 mt-1.5">
                {availabilityConfig.icon || (
                  <span className={`w-1.5 h-1.5 rounded-full ${availabilityConfig.dotColor}`} />
                )}
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {availabilityConfig.label}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bio */}
        {student.interests && (
          <div className="px-4 pb-3">
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {student.interests}
            </p>
          </div>
        )}

        {/* Skills */}
        {student.skills.length > 0 && (
          <div className="px-4 pb-3">
            <div className="flex flex-wrap gap-1.5">
              {student.skills.slice(0, 3).map((skill, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 text-xs rounded-md"
                >
                  {skill}
                </span>
              ))}
              {student.skills.length > 3 && (
                <span className="px-2 py-0.5 text-gray-400 dark:text-gray-500 text-xs">
                  +{student.skills.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto border-t border-gray-100 dark:border-slate-700 px-4 py-3 flex items-center justify-between">
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
          </div>

          {/* View */}
          <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
            <span>View</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
}
