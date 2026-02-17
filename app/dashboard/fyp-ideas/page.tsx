// app/dashboard/fyp-ideas/page.tsx
"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Search, Filter, User, Users, BookOpen, ChevronDown, Loader2 } from "lucide-react";

// Import real FYP data
import fypProjectsRaw from "@/data/fyp-projects-f22.json";

/**
 * FYP Project Raw Data Interface (from JSON)
 */
interface FYPProjectRaw {
  "Group#": number;
  "Student Name": string;
  "Registration No": string;
  "Internal Supervisor": string;
  "FYP Title": string;
  "Abstract": string;
  "Thematic Area": string;
}

/**
 * Transformed FYP Project Interface
 */
interface FYPProject {
  id: string;
  groupNumber: number;
  title: string;
  abstract: string;
  supervisor: string;
  students: string[];
  registrationNumbers: string[];
  thematicAreas: string[];
  batch: string;
  year: string;
}

/**
 * Transform raw JSON data to structured format
 */
function transformFYPData(raw: FYPProjectRaw[]): FYPProject[] {
  return raw.map((item) => {
    // Parse students (comma or comma-space separated)
    const students = item["Student Name"]
      .split(/,\s*/)
      .map((s) => s.trim())
      .filter((s) => s && s !== "]" && s.length > 1);

    // Parse registration numbers
    const registrationNumbers = item["Registration No"]
      .split(/,\s*/)
      .map((r) => r.trim())
      .filter((r) => r && r.length > 3);

    // Parse thematic areas (can be newline or comma separated)
    const thematicAreas = item["Thematic Area"]
      .split(/[\n,]/)
      .map((t) => t.trim())
      .filter((t) => t && t !== "\u00a0" && t.length > 1);

    // Clean abstract
    const abstract = item["Abstract"]?.trim() === "\u00a0" || !item["Abstract"]
      ? "Abstract not available yet."
      : item["Abstract"].replace(/\n/g, " ").trim();

    // Clean title
    const title = item["FYP Title"]?.replace(/\n/g, " ").trim() || "Untitled Project";

    return {
      id: String(item["Group#"]),
      groupNumber: item["Group#"],
      title,
      abstract,
      supervisor: item["Internal Supervisor"]?.trim() || "Not Assigned",
      students,
      registrationNumbers,
      thematicAreas,
      batch: "Fall 2022 (F22)", // Based on filename
      year: "2025-2026", // Current academic year for F22 batch FYPs
    };
  });
}

// Transform data once
const FYP_PROJECTS = transformFYPData(fypProjectsRaw as FYPProjectRaw[]);

// Get unique supervisors for filtering
const SUPERVISORS = [
  "All Supervisors",
  ...Array.from(new Set(FYP_PROJECTS.map((p) => p.supervisor))).sort(),
];

// Items per page for lazy loading
const ITEMS_PER_PAGE = 20;

export default function FYPIdeasPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSupervisor, setSelectedSupervisor] = useState("All Supervisors");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  const observerRef = useRef<HTMLDivElement>(null);

  // Filter the data based on search and filters
  const filteredProjects = useMemo(() => {
    return FYP_PROJECTS.filter((project) => {
      const matchesSearch =
        searchQuery === "" ||
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.abstract.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.supervisor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.students.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
        project.thematicAreas.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesSupervisor =
        selectedSupervisor === "All Supervisors" || project.supervisor === selectedSupervisor;

      return matchesSearch && matchesSupervisor;
    });
  }, [searchQuery, selectedSupervisor]);

  // Reset display count when filters change
  useEffect(() => {
    setDisplayCount(ITEMS_PER_PAGE);
  }, [searchQuery, selectedSupervisor]);

  // Get currently visible items
  const visibleProjects = useMemo(() => {
    return filteredProjects.slice(0, displayCount);
  }, [filteredProjects, displayCount]);

  // Check if there are more items to load
  const hasMore = displayCount < filteredProjects.length;

  // Load more items
  const loadMore = useCallback(() => {
    if (hasMore && !isLoadingMore) {
      setIsLoadingMore(true);
      // Simulate a small delay for smooth UX
      setTimeout(() => {
        setDisplayCount((prev) => Math.min(prev + ITEMS_PER_PAGE, filteredProjects.length));
        setIsLoadingMore(false);
      }, 300);
    }
  }, [hasMore, isLoadingMore, filteredProjects.length]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: "100px" }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [loadMore, hasMore, isLoadingMore]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.05)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.05)_50%,rgba(255,255,255,0.05)_75%,transparent_75%)] bg-[length:60px_60px]"></div>
        <div className="max-w-6xl mx-auto px-4 py-12 sm:py-16 relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">Previous FYP Ideas</h1>
              <p className="text-gray-300 mt-1">Browse past final year projects for inspiration</p>
            </div>
          </div>
          
          {/* Stats */}
          <div className="flex flex-wrap gap-4 mt-6">
            <div className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg">
              <span className="text-white font-bold">{FYP_PROJECTS.length}</span>
              <span className="text-gray-300 ml-2">Total Projects</span>
            </div>
            <div className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg">
              <span className="text-white font-bold">{SUPERVISORS.length - 1}</span>
              <span className="text-gray-300 ml-2">Supervisors</span>
            </div>
            <div className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg">
              <span className="text-amber-400 font-bold">F22 Batch</span>
              <span className="text-gray-300 ml-2">2025-2026</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-4 sm:p-6 mb-6 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title, supervisor, students, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent outline-none transition-all"
              />
            </div>

            {/* Supervisor Filter */}
            <div className="relative">
              <select
                value={selectedSupervisor}
                onChange={(e) => setSelectedSupervisor(e.target.value)}
                className="appearance-none w-full lg:w-64 pl-4 pr-10 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent outline-none transition-all cursor-pointer"
              >
                {SUPERVISORS.map((supervisor) => (
                  <option key={supervisor} value={supervisor}>{supervisor}</option>
                ))}
              </select>
              <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Results count */}
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing <span className="font-semibold text-gray-900 dark:text-white">{visibleProjects.length}</span> of{" "}
              <span className="font-semibold text-gray-900 dark:text-white">{filteredProjects.length}</span> projects
              {filteredProjects.length !== FYP_PROJECTS.length && (
                <span className="ml-2 text-gray-500">(filtered from {FYP_PROJECTS.length})</span>
              )}
            </p>
          </div>
        </div>

        {/* FYP Ideas List */}
        <div className="space-y-4">
          {visibleProjects.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Projects Found</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try adjusting your search or filter criteria to find what you're looking for.
              </p>
            </div>
          ) : (
            visibleProjects.map((project) => (
              <div
                key={project.id}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden transition-shadow hover:shadow-lg"
              >
                {/* Project Header */}
                <div
                  className="p-4 sm:p-6 cursor-pointer"
                  onClick={() => setExpandedId(expandedId === project.id ? null : project.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span className="px-2.5 py-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-bold rounded-lg">
                          Group #{project.groupNumber}
                        </span>
                        <span className="px-2.5 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-medium rounded-lg">
                          {project.batch}
                        </span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {project.title}
                      </h3>
                      <p className={`text-gray-600 dark:text-gray-400 text-sm ${expandedId === project.id ? "" : "line-clamp-2"}`}>
                        {project.abstract}
                      </p>
                    </div>
                    <button className="flex-shrink-0 p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                      <ChevronDown
                        className={`w-5 h-5 text-gray-400 transition-transform ${expandedId === project.id ? "rotate-180" : ""}`}
                      />
                    </button>
                  </div>

                  {/* Thematic Areas */}
                  {project.thematicAreas.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {project.thematicAreas.slice(0, expandedId === project.id ? undefined : 3).map((area, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 bg-gray-50 dark:bg-slate-700 text-gray-600 dark:text-gray-400 text-xs font-medium rounded-lg border border-gray-200 dark:border-slate-600"
                        >
                          {area}
                        </span>
                      ))}
                      {expandedId !== project.id && project.thematicAreas.length > 3 && (
                        <span className="px-2.5 py-1 text-gray-500 dark:text-gray-400 text-xs">
                          +{project.thematicAreas.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Expanded Details */}
                {expandedId === project.id && (
                  <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-0 border-t border-gray-100 dark:border-slate-700">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                      {/* Supervisor */}
                      <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
                          <User className="w-4 h-4" />
                          Internal Supervisor
                        </div>
                        <p className="text-gray-900 dark:text-white font-medium">{project.supervisor}</p>
                      </div>

                      {/* Students */}
                      <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
                          <Users className="w-4 h-4" />
                          Team Members ({project.students.length})
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {project.students.map((student, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 bg-white dark:bg-slate-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg border border-gray-200 dark:border-slate-500"
                            >
                              {student}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Registration Numbers */}
                    {project.registrationNumbers.length > 0 && (
                      <div className="mt-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl p-4">
                        <div className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
                          Registration Numbers
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {project.registrationNumbers.map((regNo, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 bg-white dark:bg-slate-600 text-gray-600 dark:text-gray-400 text-xs font-mono rounded-lg border border-gray-200 dark:border-slate-500"
                            >
                              {regNo}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* All Thematic Areas (if more than shown) */}
                    {project.thematicAreas.length > 3 && (
                      <div className="mt-4">
                        <div className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
                          All Thematic Areas
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {project.thematicAreas.map((area, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium rounded-lg"
                            >
                              {area}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Infinite Scroll Trigger / Load More */}
        {hasMore && (
          <div ref={observerRef} className="py-8 flex justify-center">
            {isLoadingMore ? (
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Loading more projects...</span>
              </div>
            ) : (
              <button
                onClick={loadMore}
                className="px-6 py-3 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
              >
                Load More ({filteredProjects.length - displayCount} remaining)
              </button>
            )}
          </div>
        )}

        {/* End of List */}
        {!hasMore && visibleProjects.length > 0 && (
          <div className="py-8 text-center text-gray-500 dark:text-gray-400 text-sm">
            You've reached the end • {filteredProjects.length} projects total
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-8 bg-gray-100 dark:bg-slate-800 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white dark:bg-slate-700 rounded-xl flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-6 h-6 text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                About This Data
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                This page displays FYP projects from the <strong>Fall 2022 (F22) batch</strong> at PAF-IAST. 
                Browse through these projects to get inspiration for your own FYP and avoid duplicating existing ideas. 
                More batches will be added as data becomes available.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
