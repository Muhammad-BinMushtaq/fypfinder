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
import { Github, Linkedin, Lock, Sparkles, Code, Briefcase } from "lucide-react";
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
        label: "Locked",
        icon: <Lock className="w-3 h-3" />,
        bg: "bg-gray-100 dark:bg-slate-700",
        text: "text-gray-600 dark:text-gray-300",
        dot: "bg-gray-400",
      };
    }
    
    switch (student.availability) {
      case "AVAILABLE":
        return {
          label: "Available",
          icon: null,
          bg: "bg-emerald-50 dark:bg-emerald-900/30",
          text: "text-emerald-700 dark:text-emerald-400",
          dot: "bg-emerald-500",
        };
      case "BUSY":
        return {
          label: "Busy",
          icon: null,
          bg: "bg-amber-50 dark:bg-amber-900/30",
          text: "text-amber-700 dark:text-amber-400",
          dot: "bg-amber-500",
        };
      case "AWAY":
        return {
          label: "Away",
          icon: null,
          bg: "bg-red-50 dark:bg-red-900/30",
          text: "text-red-600 dark:text-red-400",
          dot: "bg-red-500",
        };
      default:
        return {
          label: "Unknown",
          icon: null,
          bg: "bg-gray-50 dark:bg-slate-700",
          text: "text-gray-600 dark:text-gray-300",
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
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 overflow-hidden h-full p-5">
        {/* Top Row - Avatar + Name + Badges */}
        <div className="flex items-start gap-4 mb-4">
          {/* Circular Avatar */}
          <div className="flex-shrink-0">
            {student.profilePicture ? (
              <div className="relative w-16 h-16 rounded-full overflow-hidden ring-2 ring-indigo-100 dark:ring-indigo-900/50 group-hover:ring-indigo-300 dark:group-hover:ring-indigo-600 transition-all">
                <Image
                  src={student.profilePicture}
                  alt={student.name}
                  fill
                  sizes="64px"
                  className="object-cover"
                  loading="lazy"
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl ring-2 ring-indigo-100 dark:ring-indigo-900/50 group-hover:ring-indigo-300 dark:group-hover:ring-indigo-600 transition-all">
                {getInitials(student.name)}
              </div>
            )}
          </div>

          {/* Name, Department & Badges */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-bold text-gray-900 dark:text-white text-lg truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {student.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {student.department} • Sem {student.semester}
                </p>
              </div>
              
              {/* Match Score */}
              <div className={`flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${matchConfig.bg} text-white shadow-sm`}>
                <Sparkles className="w-3 h-3" />
                {student.matchScore}%
              </div>
            </div>

            {/* Availability Badge */}
            <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 mt-2 rounded-full text-xs font-medium ${availabilityConfig.bg} ${availabilityConfig.text}`}>
              {availabilityConfig.icon || (
                <span className={`w-1.5 h-1.5 rounded-full ${availabilityConfig.dot} ${student.availability === "AVAILABLE" ? "animate-pulse" : ""}`}></span>
              )}
              {availabilityConfig.label}
            </div>
          </div>
        </div>

        {/* Bio */}
        {student.interests && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4 leading-relaxed">
            {student.interests}
          </p>
        )}

        {/* Skills Section */}
        {student.skills.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-1.5 mb-2">
              <Code className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Skills</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {student.skills.slice(0, 4).map((skill, index) => (
                <span
                  key={index}
                  className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-medium rounded-lg"
                >
                  {skill}
                </span>
              ))}
              {student.skills.length > 4 && (
                <span className="px-2.5 py-1 bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400 text-xs font-medium rounded-lg">
                  +{student.skills.length - 4}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Projects indicator */}
        {student.projectCount > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-1.5 mb-2">
              <Briefcase className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Projects</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {student.projectCount} project{student.projectCount > 1 ? 's' : ''} showcased
            </p>
          </div>
        )}

        {/* Footer - Social Links & CTA */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-slate-700 mt-auto">
          {/* Social Links */}
          <div className="flex items-center gap-2">
            {student.githubUrl && (
              <a
                href={student.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-slate-700 hover:bg-gray-900 dark:hover:bg-white flex items-center justify-center transition-colors"
                title="GitHub"
              >
                <Github className="w-4 h-4 text-gray-600 dark:text-gray-300 hover:text-white dark:hover:text-gray-900" />
              </a>
            )}
            {student.linkedinUrl && (
              <a
                href={student.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-slate-700 hover:bg-blue-600 flex items-center justify-center transition-colors"
                title="LinkedIn"
              >
                <Linkedin className="w-4 h-4 text-gray-600 dark:text-gray-300 hover:text-white" />
              </a>
            )}
          </div>

          {/* View Profile */}
          <div className="flex items-center gap-2 text-sm font-medium text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            <span>View Profile</span>
            <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
