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

import { useRouter } from "next/navigation";
import Image from "next/image";
import { Github, Linkedin, Lock, Sparkles } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { prefetchPublicProfile } from "@/hooks/student/usePublicProfile";
import type { MatchedStudent } from "@/services/discovery.service";

interface StudentCardProps {
  student: MatchedStudent;
}

export function StudentCard({ student }: StudentCardProps) {
  const queryClient = useQueryClient();
  const router = useRouter();

  // Navigate to profile on card click
  const handleCardClick = () => {
    router.push(`/dashboard/discovery/profile/${student.id}`);
  };

  // Prefetch profile on hover for instant navigation
  const handleMouseEnter = () => {
    prefetchPublicProfile(queryClient, student.id);
  };

  // Get availability badge config
  const getAvailabilityConfig = () => {
    if (student.isGroupLocked) {
      return {
        label: "Group Locked",
        icon: <Lock className="w-3 h-3" />,
        bg: "bg-gray-100",
        text: "text-gray-600",
        dot: "bg-gray-400",
      };
    }
    
    switch (student.availability) {
      case "AVAILABLE":
        return {
          label: "Available",
          icon: null,
          bg: "bg-emerald-50",
          text: "text-emerald-700",
          dot: "bg-emerald-500",
        };
      case "BUSY":
        return {
          label: "Busy",
          icon: null,
          bg: "bg-amber-50",
          text: "text-amber-700",
          dot: "bg-amber-500",
        };
      case "AWAY":
        return {
          label: "Away",
          icon: null,
          bg: "bg-red-50",
          text: "text-red-600",
          dot: "bg-red-500",
        };
      default:
        return {
          label: "Unknown",
          icon: null,
          bg: "bg-gray-50",
          text: "text-gray-600",
          dot: "bg-gray-400",
        };
    }
  };

  // Get match score config
  const getMatchScoreConfig = (score: number) => {
    if (score >= 80) return { bg: "from-emerald-500 to-green-500", label: "Excellent" };
    if (score >= 60) return { bg: "from-blue-500 to-indigo-500", label: "Great" };
    if (score >= 40) return { bg: "from-amber-500 to-orange-500", label: "Good" };
    return { bg: "from-gray-400 to-gray-500", label: "Fair" };
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

  const availabilityConfig = getAvailabilityConfig();
  const matchConfig = getMatchScoreConfig(student.matchScore);

  return (
    <div
      onClick={handleCardClick}
      onMouseEnter={handleMouseEnter}
      className="group block h-full cursor-pointer"
    >
      <div className="relative bg-white rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 overflow-hidden h-full flex flex-col">
        {/* Top Section - Match Score & Availability */}
        <div className="relative bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/50 p-4 pb-12">
          {/* Match Score Badge */}
          <div className="flex items-center justify-between mb-3">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r ${matchConfig.bg} text-white shadow-lg`}>
              <Sparkles className="w-3 h-3" />
              {student.matchScore}% Match
            </div>
            
            {/* Availability Badge */}
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${availabilityConfig.bg} ${availabilityConfig.text}`}>
              {availabilityConfig.icon || (
                <span className={`w-2 h-2 rounded-full ${availabilityConfig.dot} ${student.availability === "AVAILABLE" ? "animate-pulse" : ""}`}></span>
              )}
              {availabilityConfig.label}
            </div>
          </div>

          {/* Avatar - Positioned to overlap sections */}
          <div className="absolute -bottom-10 left-4">
            {student.profilePicture ? (
              <div className="relative w-20 h-20 rounded-xl overflow-hidden border-4 border-white shadow-lg group-hover:shadow-xl transition-shadow">
                <Image
                  src={student.profilePicture}
                  alt={student.name}
                  fill
                  sizes="80px"
                  className="object-cover"
                  loading="lazy"
                />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl border-4 border-white shadow-lg group-hover:shadow-xl transition-shadow">
                {getInitials(student.name)}
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 pt-12 flex flex-col">
          {/* Name & Department Row */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-gray-900 text-lg truncate group-hover:text-blue-600 transition-colors">
                {student.name}
              </h3>
              <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full flex-shrink-0"></span>
                <span className="truncate">{student.department}</span>
                <span className="text-gray-300 flex-shrink-0">•</span>
                <span className="flex-shrink-0">Sem {student.semester}</span>
              </p>
            </div>
            
            {/* Social Links */}
            {(student.githubUrl || student.linkedinUrl) && (
              <div className="flex items-center gap-1 flex-shrink-0">
                {student.githubUrl && (
                  <a
                    href={student.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-900 flex items-center justify-center transition-colors"
                    title="GitHub"
                  >
                    <Github className="w-4 h-4 text-gray-600 hover:text-white" />
                  </a>
                )}
                {student.linkedinUrl && (
                  <a
                    href={student.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-blue-600 flex items-center justify-center transition-colors"
                    title="LinkedIn"
                  >
                    <Linkedin className="w-4 h-4 text-gray-600 hover:text-white" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Bio snippet */}
          {student.interests && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-3 leading-relaxed">
              {student.interests}
            </p>
          )}

          {/* Skills */}
          {student.skills.length > 0 && (
            <div className="mt-auto">
              <div className="flex flex-wrap gap-1.5">
                {student.skills.slice(0, 3).map((skill, index) => (
                  <span
                    key={index}
                    className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg group-hover:bg-blue-50 group-hover:text-blue-700 transition-colors"
                  >
                    {skill}
                  </span>
                ))}
                {student.skills.length > 3 && (
                  <span className="px-2.5 py-1 bg-gray-50 text-gray-500 text-xs font-medium rounded-lg">
                    +{student.skills.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* View Profile CTA */}
          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-400 group-hover:text-blue-600 transition-colors">
                View Profile
              </span>
              <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-gradient-to-r group-hover:from-blue-500 group-hover:to-indigo-500 flex items-center justify-center transition-all">
                <svg
                  className="w-4 h-4 text-gray-400 group-hover:text-white group-hover:translate-x-0.5 transition-all"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
