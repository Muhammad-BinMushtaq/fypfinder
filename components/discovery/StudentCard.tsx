// components/discovery/StudentCard.tsx
"use client";

/**
 * StudentCard Component
 * ---------------------
 * Displays a student's preview in the discovery grid.
 * 
 * Responsibilities:
 * - Render student preview data
 * - Handle navigation on click
 * - Prefetch profile on hover for instant navigation
 * 
 * ⚠️ NO API calls, NO business logic here.
 * All data comes via props.
 */

import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { prefetchPublicProfile } from "@/hooks/student/usePublicProfile";
import type { MatchedStudent } from "@/services/discovery.service";

interface StudentCardProps {
  student: MatchedStudent;
}

export function StudentCard({ student }: StudentCardProps) {
  const queryClient = useQueryClient();

  // Prefetch profile on hover for instant navigation
  const handleMouseEnter = () => {
    prefetchPublicProfile(queryClient, student.id);
  };

  // Get availability badge style
  const getAvailabilityBadge = () => {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200/50 shadow-sm">
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
        Available
      </span>
    );
  };

  // Generate initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Link
      href={`/dashboard/discovery/profile/${student.id}`}
      onMouseEnter={handleMouseEnter}
      className="group block"
    >
      <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-4 sm:p-5 hover:border-blue-400/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 overflow-hidden h-full">
        {/* Background gradient on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="relative z-10">
          {/* Header: Avatar + Name + Department */}
          <div className="flex items-start gap-3 sm:gap-4 mb-4">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {student.profilePicture ? (
                <img
                  src={student.profilePicture}
                  alt={student.name}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-gray-100 group-hover:border-blue-200 transition-all shadow-lg group-hover:shadow-xl"
                />
              ) : (
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg sm:text-xl border-2 border-transparent group-hover:border-blue-200 transition-all shadow-lg group-hover:shadow-xl">
                  {getInitials(student.name)}
                </div>
              )}
            </div>

            {/* Name & Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 text-base sm:text-lg truncate group-hover:text-blue-600 transition-colors">
                {student.name}
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5 flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 bg-indigo-400 rounded-full"></span>
                {student.department}
                <span className="text-gray-300">•</span>
                Sem {student.semester}
              </p>
              <div className="mt-2.5">
                {getAvailabilityBadge()}
              </div>
            </div>
          </div>

          {/* Skills */}
          {student.skills.length > 0 && (
            <div className="mt-4">
              <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Skills
              </p>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {student.skills.slice(0, 4).map((skill, index) => (
                  <span
                    key={index}
                    className="px-2.5 sm:px-3 py-1 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 text-[10px] sm:text-xs font-medium rounded-lg border border-gray-200/50 group-hover:from-blue-50 group-hover:to-indigo-50 group-hover:text-blue-700 group-hover:border-blue-200/50 transition-all"
                  >
                    {skill}
                  </span>
                ))}
                {student.skills.length > 4 && (
                  <span className="px-2.5 sm:px-3 py-1 bg-gray-50 text-gray-500 text-[10px] sm:text-xs font-medium rounded-lg border border-gray-100">
                    +{student.skills.length - 4}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* View Profile CTA */}
          <div className="mt-4 pt-4 border-t border-gray-100/80">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-medium text-gray-400 group-hover:text-blue-600 transition-colors">
                View Full Profile
              </span>
              <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-gradient-to-r group-hover:from-blue-500 group-hover:to-indigo-500 flex items-center justify-center transition-all">
                <svg
                  className="w-4 h-4 text-gray-400 group-hover:text-white group-hover:translate-x-0.5 transition-all duration-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
