// components/discovery/DiscoveryFilters.tsx
"use client";

/**
 * DiscoveryFilters Component
 * --------------------------
 * Filter controls for student discovery with Apply button.
 * 
 * Responsibilities:
 * - Render filter UI
 * - Handle filter state changes
 * - Display active filter badges
 * - Apply filters on button click
 * 
 * ⚠️ NO API calls, NO business logic here.
 * All state management is handled by parent via callbacks.
 */

import { useState } from "react";
import type { DiscoveryFilters as Filters } from "@/services/discovery.service";

interface DiscoveryFiltersProps {
  pendingFilters: Filters;
  appliedFilters: Filters;
  hasUnappliedChanges: boolean;
  onDepartmentChange: (department: string | undefined) => void;
  onSemesterChange: (semester: number | undefined) => void;
  onSkillsChange: (skills: string[] | undefined) => void;
  onAvailabilityChange: (availability: "AVAILABLE" | "BUSY" | "AWAY" | undefined) => void;
  onApply: () => void;
  onClear: () => void;
  isLoading?: boolean;
  isFetching?: boolean;
}

// Available departments (could be fetched from backend in future)
const DEPARTMENTS = [
  { value: "CS", label: "Computer Science" },
  { value: "SE", label: "Software Engineering" },
  { value: "AI", label: "Artificial Intelligence" },
  { value: "DS", label: "Data Science" },
  { value: "IT", label: "Information Technology" },
  { value: "CY", label: "Cyber Security" },
];

// Available semesters for FYP students
const SEMESTERS = [
  { value: 5, label: "Semester 5" },
  { value: 6, label: "Semester 6" },
  { value: 7, label: "Semester 7" },
];

// Availability statuses
const AVAILABILITY_OPTIONS = [
  { value: "AVAILABLE", label: "Available", color: "text-emerald-600", dot: "bg-emerald-500" },
  { value: "BUSY", label: "Busy", color: "text-amber-600", dot: "bg-amber-500" },
  { value: "AWAY", label: "Away", color: "text-red-600", dot: "bg-red-500" },
];

// Common skills (could be fetched from backend in future)
const COMMON_SKILLS = [
  "React",
  "Next.js",
  "Node.js",
  "Python",
  "TypeScript",
  "JavaScript",
  "Machine Learning",
  "Flutter",
  "React Native",
  "MongoDB",
  "PostgreSQL",
  "AWS",
  "Docker",
  "Figma",
  "UI/UX",
];

export function DiscoveryFilters({
  pendingFilters,
  appliedFilters,
  hasUnappliedChanges,
  onDepartmentChange,
  onSemesterChange,
  onSkillsChange,
  onAvailabilityChange,
  onApply,
  onClear,
  isLoading = false,
  isFetching = false,
}: DiscoveryFiltersProps) {
  const [showSkillsDropdown, setShowSkillsDropdown] = useState(false);
  const [skillSearch, setSkillSearch] = useState("");

  // Check if any filters are active (applied)
  const hasActiveFilters = Boolean(
    appliedFilters.department || appliedFilters.semester || (appliedFilters.skills && appliedFilters.skills.length > 0) || appliedFilters.availability
  );

  // Filter skills by search
  const filteredSkills = COMMON_SKILLS.filter((skill) =>
    skill.toLowerCase().includes(skillSearch.toLowerCase())
  );

  // Toggle skill selection
  const toggleSkill = (skill: string) => {
    const currentSkills = pendingFilters.skills || [];
    const newSkills = currentSkills.includes(skill)
      ? currentSkills.filter((s) => s !== skill)
      : [...currentSkills, skill];
    onSkillsChange(newSkills.length > 0 ? newSkills : undefined);
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-4 sm:p-6 shadow-lg relative z-30">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-base sm:text-lg">Search Filters</h3>
            <p className="text-xs sm:text-sm text-gray-500">Find your ideal FYP partner</p>
          </div>
        </div>

        {hasActiveFilters && (
          <button
            onClick={onClear}
            disabled={isLoading || isFetching}
            className="text-xs sm:text-sm text-red-600 hover:text-red-700 font-medium transition-colors disabled:opacity-50 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear All
          </button>
        )}
      </div>

      {/* Filters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Department Filter */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
            Department
          </label>
          <select
            value={pendingFilters.department || ""}
            onChange={(e) => onDepartmentChange(e.target.value || undefined)}
            disabled={isLoading || isFetching}
            className="w-full px-3 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed bg-white shadow-sm hover:shadow-md"
          >
            <option value="">All Departments</option>
            {DEPARTMENTS.map((dept) => (
              <option key={dept.value} value={dept.value}>
                {dept.label}
              </option>
            ))}
          </select>
        </div>

        {/* Semester Filter */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
            Semester
          </label>
          <select
            value={pendingFilters.semester || ""}
            onChange={(e) =>
              onSemesterChange(e.target.value ? Number(e.target.value) : undefined)
            }
            disabled={isLoading || isFetching}
            className="w-full px-3 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed bg-white shadow-sm hover:shadow-md"
          >
            <option value="">All Semesters</option>
            {SEMESTERS.map((sem) => (
              <option key={sem.value} value={sem.value}>
                {sem.label}
              </option>
            ))}
          </select>
        </div>

        {/* Availability Filter */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
            Availability
          </label>
          <select
            value={pendingFilters.availability || ""}
            onChange={(e) => onAvailabilityChange(e.target.value as "AVAILABLE" | "BUSY" | "AWAY" || undefined)}
            disabled={isLoading || isFetching}
            className="w-full px-3 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed bg-white shadow-sm hover:shadow-md"
          >
            <option value="">Available (Default)</option>
            {AVAILABILITY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Skills Filter */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
            Skills
          </label>
          <div className="relative ">
            <button
              type="button"
              onClick={() => setShowSkillsDropdown(!showSkillsDropdown)}
              disabled={isLoading || isFetching}
              className="w-full px-3 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm text-left flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed bg-white shadow-sm hover:shadow-md"
            >
              <span className={pendingFilters.skills?.length ? "text-gray-900" : "text-gray-500"}>
                {pendingFilters.skills?.length
                  ? `${pendingFilters.skills.length} selected`
                  : "Select Skills"}
              </span>
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform ${
                  showSkillsDropdown ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Skills Dropdown */}
            {showSkillsDropdown && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowSkillsDropdown(false)}
                />
                
                {/* Dropdown */}
                <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-xl max-h-64 overflow-hidden">
                  {/* Search */}
                  <div className="p-3 border-b border-gray-100 bg-gray-50">
                    <input
                      type="text"
                      value={skillSearch}
                      onChange={(e) => setSkillSearch(e.target.value)}
                      placeholder="Search skills..."
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>

                  {/* Skills List */}
                  <div className="max-h-48 overflow-y-auto p-2">
                    {filteredSkills.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">
                        No skills found
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 gap-1">
                        {filteredSkills.map((skill) => (
                          <label
                            key={skill}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                              pendingFilters.skills?.includes(skill)
                                ? "bg-blue-50 text-blue-700"
                                : "hover:bg-gray-50"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={pendingFilters.skills?.includes(skill) || false}
                              onChange={() => toggleSkill(skill)}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium truncate">
                              {skill}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Apply Button */}
        <div className="flex items-end">
          <button
            onClick={onApply}
            disabled={isLoading || isFetching || !hasUnappliedChanges}
            className={`w-full px-4 py-2.5 sm:py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg ${
              hasUnappliedChanges && !isLoading && !isFetching
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/25 hover:shadow-blue-500/40"
                : "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
            }`}
          >
            {isFetching ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Searching...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Apply Filters
              </>
            )}
          </button>
        </div>
      </div>

      {/* Selected Skills Tags */}
      {pendingFilters.skills && pendingFilters.skills.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Selected Skills</p>
          <div className="flex flex-wrap gap-2">
            {pendingFilters.skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 text-xs sm:text-sm font-medium rounded-lg border border-blue-200/50"
              >
                {skill}
                <button
                  onClick={() => toggleSkill(skill)}
                  className="hover:text-blue-900 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Unapplied changes indicator */}
      {hasUnappliedChanges && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="flex items-center gap-2 text-amber-700">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-sm font-medium">
              You have unapplied filter changes. Click "Apply Filters" to see results.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
