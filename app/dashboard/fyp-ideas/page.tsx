// app/dashboard/fyp-ideas/page.tsx
"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Search, ChevronDown, Loader2 } from "lucide-react";

// Import real FYP data
import fypProjectsF22Raw from "@/data/fyp-projects-f22.json";
import fypProjectsF21Raw from "@/data/fyp-projects-f21.json";

/**
 * Unified Raw Data Interface (same format for both F21 and F22)
 */
interface FYPProjectRaw {
  "Group#": number;
  "Student Name": string;
  "Registration No": string;
  "Internal Supervisor": string;
  "FYP Title": string;
  "Abstract": string;
  "Thematic Area": string;
  "Batch"?: string; // F21 has this, F22 doesn't
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
  keywords: string[];
  batch: string;
}

/**
 * Transform raw data to unified format
 */
function transformFYPData(raw: FYPProjectRaw[], defaultBatch: string): FYPProject[] {
  return raw.map((item) => {
    const students = (item["Student Name"] || "")
      .split(/,\s*/)
      .map((s) => s.trim())
      .filter((s) => s && s !== "]" && s.length > 1);

    const keywords = (item["Thematic Area"] || "")
      .split(/[\n,]/)
      .map((t) => t.trim())
      .filter((t) => t && t !== "\u00a0" && t.length > 1);

    const abstract = item["Abstract"]?.trim() === "\u00a0" || !item["Abstract"]
      ? "Abstract not available."
      : item["Abstract"].replace(/\n/g, " ").trim();

    const title = item["FYP Title"]?.replace(/\n/g, " ").trim() || "Untitled Project";
    const batch = item["Batch"] || defaultBatch;

    return {
      id: `${batch.toLowerCase()}-${item["Group#"]}`,
      groupNumber: item["Group#"],
      title,
      abstract,
      supervisor: item["Internal Supervisor"]?.trim() || "Not Assigned",
      students,
      keywords,
      batch,
    };
  });
}

// Transform and combine data
const F22_PROJECTS = transformFYPData(fypProjectsF22Raw as FYPProjectRaw[], "F22");
const F21_PROJECTS = transformFYPData(fypProjectsF21Raw as FYPProjectRaw[], "F21");
const ALL_PROJECTS = [...F22_PROJECTS, ...F21_PROJECTS];

// Get unique supervisors and batches
const SUPERVISORS = ["All", ...Array.from(new Set(ALL_PROJECTS.map((p) => p.supervisor).filter((s) => s && s !== "Not Assigned"))).sort()];
const BATCHES = ["All", "F22", "F21"];

// Items per page for lazy loading
const ITEMS_PER_PAGE = 20;

export default function FYPIdeasPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSupervisor, setSelectedSupervisor] = useState("All");
  const [selectedBatch, setSelectedBatch] = useState("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  const observerRef = useRef<HTMLDivElement>(null);

  // Filter the data based on search and filters
  const filteredProjects = useMemo(() => {
    return ALL_PROJECTS.filter((project) => {
      const matchesSearch =
        searchQuery === "" ||
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.abstract.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.supervisor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.students.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
        project.keywords.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesSupervisor =
        selectedSupervisor === "All" || project.supervisor === selectedSupervisor;

      const matchesBatch =
        selectedBatch === "All" || project.batch === selectedBatch;

      return matchesSearch && matchesSupervisor && matchesBatch;
    });
  }, [searchQuery, selectedSupervisor, selectedBatch]);

  // Reset display count when filters change
  useEffect(() => {
    setDisplayCount(ITEMS_PER_PAGE);
  }, [searchQuery, selectedSupervisor, selectedBatch]);

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
      <div className="border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Already Taken FYPs</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {ALL_PROJECTS.length} projects • {F22_PROJECTS.length} F22 • {F21_PROJECTS.length} F21
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-5xl mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white text-sm placeholder-gray-400 focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent outline-none"
            />
          </div>

          {/* Batch Filter */}
          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="px-3 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-gray-900 dark:focus:ring-white outline-none cursor-pointer"
          >
            {BATCHES.map((batch) => (
              <option key={batch} value={batch}>{batch === "All" ? "All Batches" : batch}</option>
            ))}
          </select>

          {/* Supervisor Filter */}
          <select
            value={selectedSupervisor}
            onChange={(e) => setSelectedSupervisor(e.target.value)}
            className="px-3 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-gray-900 dark:focus:ring-white outline-none cursor-pointer sm:max-w-[200px] truncate"
          >
            {SUPERVISORS.map((sup) => (
              <option key={sup} value={sup}>{sup === "All" ? "All Supervisors" : sup}</option>
            ))}
          </select>
        </div>

        {/* Results count */}
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
          Showing {visibleProjects.length} of {filteredProjects.length} projects
        </p>
      </div>

      {/* Projects List */}
      <div className="max-w-5xl mx-auto px-4 pb-8">
        <div className="space-y-3">
          {visibleProjects.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-8 text-center">
              <Search className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400 text-sm">No projects found</p>
            </div>
          ) : (
            visibleProjects.map((project) => (
              <div
                key={project.id}
                className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden"
              >
                <div
                  className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                  onClick={() => setExpandedId(expandedId === project.id ? null : project.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                          project.batch === "F22" 
                            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                            : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                        }`}>
                          {project.batch} #{project.groupNumber}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-gray-500">•</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{project.supervisor}</span>
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-snug">
                        {project.title}
                      </h3>
                      {expandedId !== project.id && (
                        <p className="text-gray-500 dark:text-gray-400 text-xs mt-1 line-clamp-1">
                          {project.abstract}
                        </p>
                      )}
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${
                        expandedId === project.id ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </div>

                {/* Expanded */}
                {expandedId === project.id && (
                  <div className="px-4 pb-4 pt-0 border-t border-gray-100 dark:border-slate-700">
                    <p className="text-gray-600 dark:text-gray-300 text-sm mt-3 leading-relaxed">
                      {project.abstract}
                    </p>
                    
                    {/* Students */}
                    {project.students.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1.5">Team</p>
                        <div className="flex flex-wrap gap-1.5">
                          {project.students.map((student, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 text-xs rounded"
                            >
                              {student}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Keywords */}
                    {project.keywords.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1.5">Keywords</p>
                        <div className="flex flex-wrap gap-1.5">
                          {project.keywords.map((keyword, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-gray-50 dark:bg-slate-700/50 text-gray-600 dark:text-gray-400 text-xs rounded border border-gray-200 dark:border-slate-600"
                            >
                              {keyword}
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

        {/* Load More */}
        {hasMore && (
          <div ref={observerRef} className="py-6 flex justify-center">
            {isLoadingMore ? (
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading...</span>
              </div>
            ) : (
              <button
                onClick={loadMore}
                className="px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
              >
                Load More ({filteredProjects.length - displayCount} remaining)
              </button>
            )}
          </div>
        )}

        {!hasMore && visibleProjects.length > 0 && (
          <p className="py-6 text-center text-gray-400 dark:text-gray-500 text-xs">
            End of list • {filteredProjects.length} projects
          </p>
        )}
      </div>
    </div>
  );
}
