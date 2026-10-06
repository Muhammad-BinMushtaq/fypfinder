"use client";

/**
 * StudentCard Component
 * ---------------------
 * Clean, minimalist student preview card for discovery grid.
 */

import { useRouter } from "next/navigation";
import Image from "next/image";
import { FolderGit2, ArrowUpRight } from "lucide-react";
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
      return { label: "Locked", dotColor: "bg-slate-400" };
    }
    switch (student.availability) {
      case "AVAILABLE":
        return { label: "Available", dotColor: "bg-emerald-500" };
      case "BUSY":
        return { label: "Busy", dotColor: "bg-amber-500" };
      case "AWAY":
        return { label: "Away", dotColor: "bg-slate-400" };
      default:
        return { label: "Unknown", dotColor: "bg-slate-400" };
    }
  };

  const getInitials = (name: string) => {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const availabilityConfig = getAvailabilityConfig();

  return (
    <div
      onClick={handleCardClick}
      onMouseEnter={handleMouseEnter}
      className="group cursor-pointer block h-full"
    >
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-white/5 transition-all duration-300 overflow-hidden h-full flex flex-col hover:-translate-y-1 hover:shadow-xl relative">
        {/* Click Affordance Indicator (Option 1: Minimal Top-Right Arrow) */}
        <div className="absolute top-4 right-4 w-7 h-7 rounded-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white group-hover:border-slate-300 dark:group-hover:border-slate-600 transition-all duration-200">
          <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </div>

        {/* Header Section */}
        <div className="p-6 flex flex-col items-center text-center space-y-4">
          
          {/* Avatar */}
          <div className="relative w-20 h-20 rounded-full overflow-hidden flex-shrink-0 bg-slate-50 dark:bg-slate-800 ring-4 ring-white dark:ring-slate-900 shadow-sm">
            {student.profilePicture ? (
              <Image
                src={student.profilePicture}
                alt={student.name}
                fill
                sizes="80px"
                className="object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-500 font-medium text-xl">
                {getInitials(student.name)}
              </div>
            )}
          </div>

          {/* Core Info */}
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white text-lg tracking-tight truncate px-2">
              {student.name}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 truncate mt-0.5">
              {student.department} · Sem {student.semester}
            </p>
          </div>

          {/* Status & Project Count */}
          <div className="flex items-center justify-center gap-4 text-xs font-medium w-full">
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${availabilityConfig.dotColor} shadow-sm`} />
              <span className="text-slate-600 dark:text-slate-300">{availabilityConfig.label}</span>
            </div>
            {student.projectCount > 0 && (
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <FolderGit2 className="w-3.5 h-3.5 text-slate-400" />
                <span>{student.projectCount} Project{student.projectCount !== 1 ? "s" : ""}</span>
              </div>
            )}
          </div>
        </div>

        {/* Skills - Minimal Pill Layout */}
        <div className="px-6 pb-6 mt-auto">
          {student.skills && student.skills.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-1.5">
              {student.skills.slice(0, 3).map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 text-[11px] rounded-full font-medium truncate max-w-[120px]"
                >
                  {skill}
                </span>
              ))}
              {student.skills.length > 3 && (
                <span className="px-2 py-1 text-slate-400 dark:text-slate-500 text-[11px] font-medium">
                  +{student.skills.length - 3}
                </span>
              )}
            </div>
          ) : (
            <div className="h-[26px]"></div>
          )}
        </div>
      </div>
    </div>
  );
}
