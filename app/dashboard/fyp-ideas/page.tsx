// app/dashboard/fyp-ideas/page.tsx
"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { 
  Search, 
  ChevronDown, 
  Loader2, 
  LayoutGrid, 
  List, 
  X, 
  Sparkles, 
  Lock, 
  Layers,
  GraduationCap
} from "lucide-react";
import Link from "next/link";

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
      ? "Abstract not available for this project archive."
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

const CATEGORIES = {
  all: { label: "All Projects", keywords: [] },
  ai: { label: "AI & Machine Learning", keywords: ["ai", "artificial intelligence", "machine learning", "deep learning", "neural", "nlp", "computer vision", "recognition", "detection", "lstm", "gru", "cnn", "resnet"] },
  web: { label: "Web Applications", keywords: ["web", "react", "next", "django", "node", "frontend", "backend", "firebase", "api", "cloud", "portal"] },
  mobile: { label: "Mobile Development", keywords: ["mobile", "flutter", "android", "ios", "react native", "app", "application"] },
  iot: { label: "IoT & Embedded", keywords: ["iot", "embedded", "arduino", "sensor", "edge", "tinyml", "smart", "robotics", "hardware"] },
  data: { label: "Data Science & Analytics", keywords: ["data", "analytics", "visualization", "prediction", "analysis", "mining", "statistics"] },
  health: { label: "Healthcare & Biotech", keywords: ["health", "medical", "clinical", "patient", "hospital", "pathology", "diagnosis", "disease", "biomedical"] },
} as const;

type CategoryKey = keyof typeof CATEGORIES;

// Compute category counts
function computeCategoryCounts(projects: FYPProject[]) {
  const counts: Record<CategoryKey, number> = {
    all: projects.length,
    ai: 0,
    web: 0,
    mobile: 0,
    iot: 0,
    data: 0,
    health: 0,
  };

  projects.forEach((project) => {
    const searchText = `${project.title} ${project.abstract} ${project.keywords.join(" ")}`.toLowerCase();
    
    (Object.keys(CATEGORIES) as CategoryKey[]).forEach((key) => {
      if (key === "all") return;
      const cat = CATEGORIES[key];
      if (cat.keywords.some((kw) => searchText.includes(kw))) {
        counts[key]++;
      }
    });
  });

  return counts;
}

const CATEGORY_COUNTS = computeCategoryCounts(ALL_PROJECTS);

// Unique supervisors and batches
const SUPERVISORS = ["All", ...Array.from(new Set(ALL_PROJECTS.map((p) => p.supervisor).filter((s) => s && s !== "Not Assigned"))).sort()];
const BATCHES = ["All", "F22", "F21"];

const ITEMS_PER_PAGE = 18;

export default function FYPIdeasPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSupervisor, setSelectedSupervisor] = useState("All");
  const [selectedBatch, setSelectedBatch] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const observerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement !== searchInputRef.current && (e.target as HTMLElement).tagName !== "INPUT" && (e.target as HTMLElement).tagName !== "TEXTAREA") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Filter projects
  const filteredProjects = useMemo(() => {
    return ALL_PROJECTS.filter((project) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === "" ||
        project.title.toLowerCase().includes(q) ||
        project.abstract.toLowerCase().includes(q) ||
        project.supervisor.toLowerCase().includes(q) ||
        project.students.some((s) => s.toLowerCase().includes(q)) ||
        project.keywords.some((k) => k.toLowerCase().includes(q));

      const matchesSupervisor =
        selectedSupervisor === "All" || project.supervisor === selectedSupervisor;

      const matchesBatch =
        selectedBatch === "All" || project.batch === selectedBatch;

      let matchesCategory = true;
      if (selectedCategory !== "all") {
        const cat = CATEGORIES[selectedCategory];
        const searchCorpus = `${project.title} ${project.abstract} ${project.keywords.join(" ")}`.toLowerCase();
        matchesCategory = cat.keywords.some((kw) => searchCorpus.includes(kw));
      }

      return matchesSearch && matchesSupervisor && matchesBatch && matchesCategory;
    });
  }, [searchQuery, selectedSupervisor, selectedBatch, selectedCategory]);

  // Reset pagination on filter change
  useEffect(() => {
    setDisplayCount(ITEMS_PER_PAGE);
  }, [searchQuery, selectedSupervisor, selectedBatch, selectedCategory]);

  const visibleProjects = useMemo(() => {
    return filteredProjects.slice(0, displayCount);
  }, [filteredProjects, displayCount]);

  const hasMore = displayCount < filteredProjects.length;

  const loadMore = useCallback(() => {
    if (hasMore && !isLoadingMore) {
      setIsLoadingMore(true);
      setTimeout(() => {
        setDisplayCount((prev) => Math.min(prev + ITEMS_PER_PAGE, filteredProjects.length));
        setIsLoadingMore(false);
      }, 250);
    }
  }, [hasMore, isLoadingMore, filteredProjects.length]);

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

  const hasActiveFilters = searchQuery !== "" || selectedSupervisor !== "All" || selectedBatch !== "All" || selectedCategory !== "all";

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedSupervisor("All");
    setSelectedBatch("All");
    setSelectedCategory("all");
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans pb-16">
      {/* Top Banner / Hero */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-300">
                  <GraduationCap className="h-3.5 w-3.5" />
                  PAF-IAST Repository
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {ALL_PROJECTS.length} Historical Projects
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                FYP Ideas Archive
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1 max-w-xl">
                Explore past senior capstone projects from batches F21 & F22. Benchmark your novel concepts, discover faculty research domains, and avoid duplicate submissions.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/dashboard/fyp-ideas/validate"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold shadow-sm hover:bg-slate-800 dark:hover:bg-slate-100 transition"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Validate My Own Idea
              </Link>
            </div>
          </div>

          {/* Interactive Category Filter Pills */}
          <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800/80">
            <div className="flex items-center gap-1.5 mb-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <Layers className="h-3.5 w-3.5" />
              <span>Browse by Thematic Area</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(CATEGORIES) as CategoryKey[]).map((key) => {
                const cat = CATEGORIES[key];
                const count = CATEGORY_COUNTS[key];
                const isSelected = selectedCategory === key;
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedCategory(isSelected && key !== "all" ? "all" : key)}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isSelected
                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                        : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-600"
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isSelected
                          ? "bg-slate-800 text-slate-200 dark:bg-slate-100 dark:text-slate-800"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar: Search, Filters & View Toggle */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search title, keywords, abstract, supervisor... (Press / to focus)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-9 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs sm:text-sm placeholder-slate-400 focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:border-transparent outline-none transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns & View Toggle */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Batch Filter */}
            <div className="relative">
              <select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-slate-900 dark:focus:ring-white outline-none cursor-pointer"
              >
                {BATCHES.map((batch) => (
                  <option key={batch} value={batch}>
                    {batch === "All" ? "All Batches" : `Batch ${batch}`}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>

            {/* Supervisor Filter */}
            <div className="relative">
              <select
                value={selectedSupervisor}
                onChange={(e) => setSelectedSupervisor(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-slate-900 dark:focus:ring-white outline-none cursor-pointer max-w-[190px] truncate"
              >
                {SUPERVISORS.map((sup) => (
                  <option key={sup} value={sup}>
                    {sup === "All" ? "All Supervisors" : sup}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg p-0.5 bg-slate-50 dark:bg-slate-800/60">
              <button
                onClick={() => setViewMode("grid")}
                title="Grid View"
                className={`p-1.5 rounded text-xs transition ${
                  viewMode === "grid"
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold"
                    : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                title="List View"
                className={`p-1.5 rounded text-xs transition ${
                  viewMode === "list"
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold"
                    : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Active Filter Chips Row */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
            <span className="text-slate-500 font-medium">Active Filters:</span>
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs">
                Query: "{searchQuery}"
                <button onClick={() => setSearchQuery("")} className="hover:text-red-500 ml-1">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedCategory !== "all" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs">
                Category: {CATEGORIES[selectedCategory].label}
                <button onClick={() => setSelectedCategory("all")} className="hover:text-red-500 ml-1">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedBatch !== "All" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs">
                Batch: {selectedBatch}
                <button onClick={() => setSelectedBatch("All")} className="hover:text-red-500 ml-1">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedSupervisor !== "All" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs">
                Supervisor: {selectedSupervisor}
                <button onClick={() => setSelectedSupervisor("All")} className="hover:text-red-500 ml-1">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              onClick={clearAllFilters}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white underline ml-1"
            >
              Reset all
            </button>
          </div>
        )}

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-4 mb-2">
          <span>
            Showing <strong className="text-slate-900 dark:text-white">{visibleProjects.length}</strong> of {filteredProjects.length} projects
          </span>
          <span className="text-[11px] text-slate-400 italic flex items-center gap-1">
            <Lock className="w-3 h-3" /> Student names are confidential
          </span>
        </div>
      </div>

      {/* Projects Feed */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {visibleProjects.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center shadow-sm">
            <Search className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No matching FYP ideas found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
              Try refining your search keyword, selecting a different thematic area, or resetting the supervisor filter.
            </p>
            <button
              onClick={clearAllFilters}
              className="mt-4 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition"
            >
              Clear All Filters
            </button>
          </div>
        ) : viewMode === "grid" ? (
          /* ================= GRID VIEW ================= */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {visibleProjects.map((project) => {
              const isExpanded = expandedId === project.id;
              return (
                <div
                  key={project.id}
                  className={`bg-white dark:bg-slate-900 rounded-xl border transition-all duration-200 ${
                    isExpanded
                      ? "border-slate-900 dark:border-slate-400 shadow-md ring-1 ring-slate-900/5 dark:ring-white/10"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 shadow-xs"
                  } flex flex-col justify-between overflow-hidden`}
                >
                  <div className="p-5">
                    {/* Header Badges */}
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700">
                          {project.batch} • Group #{project.groupNumber}
                        </span>
                      </div>
                      <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate max-w-[180px]">
                        Supervisor: <strong>{project.supervisor}</strong>
                      </span>
                    </div>

                    {/* Title */}
                    <h3 
                      onClick={() => setExpandedId(isExpanded ? null : project.id)}
                      className="font-bold text-slate-900 dark:text-white text-sm sm:text-base leading-snug cursor-pointer hover:text-slate-700 dark:hover:text-slate-200 transition"
                    >
                      {project.title}
                    </h3>

                    {/* Abstract / Snippet */}
                    <p 
                      onClick={() => setExpandedId(isExpanded ? null : project.id)}
                      className={`text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-2 cursor-pointer ${
                        isExpanded ? "" : "line-clamp-2"
                      }`}
                    >
                      {project.abstract}
                    </p>

                    {/* Expanded Metadata */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                        {/* Confidential Team Members */}
                        {project.students.length > 0 && (
                          <div>
                            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                              <Lock className="w-3 h-3 text-slate-400" />
                              Team Members (Confidential)
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {project.students.map((student, idx) => (
                                <span
                                  key={idx}
                                  className="px-2.5 py-1 rounded text-xs font-medium border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 select-none blur-[5px] opacity-75 pointer-events-none"
                                >
                                  {student}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Keyword Chips */}
                        {project.keywords.length > 0 && (
                          <div>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                              Thematic Domain Tags
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {project.keywords.map((kw, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 rounded text-[11px] bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                                >
                                  {kw}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Bottom Expand Trigger Footer */}
                  <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between text-xs">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : project.id)}
                      className="inline-flex items-center gap-1 font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition text-[11px]"
                    >
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                      {isExpanded ? "Show Less" : "Read Full Abstract"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ================= COMPACT LIST VIEW ================= */
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden shadow-xs">
            {visibleProjects.map((project) => {
              const isExpanded = expandedId === project.id;
              return (
                <div key={project.id} className="p-4 transition hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <div 
                    onClick={() => setExpandedId(isExpanded ? null : project.id)}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer"
                  >
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {project.batch} #{project.groupNumber}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          Supervisor: <strong>{project.supervisor}</strong>
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                        {project.title}
                      </h3>
                      {!isExpanded && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                          {project.abstract}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <span className="text-[11px] font-medium text-slate-400">
                        {isExpanded ? "Collapse" : "Expand"}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                    </div>
                  </div>

                  {/* Expanded Abstract & Details in List View */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                        {project.abstract}
                      </p>

                      {project.students.length > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Team:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {project.students.map((student, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded text-[11px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 select-none blur-[5px] pointer-events-none opacity-75"
                              >
                                {student}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Load More Trigger */}
        {hasMore && (
          <div ref={observerRef} className="py-8 flex justify-center">
            {isLoadingMore ? (
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-medium">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading more past projects...</span>
              </div>
            ) : (
              <button
                onClick={loadMore}
                className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                Load More ({filteredProjects.length - displayCount} remaining)
              </button>
            )}
          </div>
        )}

        {!hasMore && visibleProjects.length > 0 && (
          <p className="py-8 text-center text-slate-400 dark:text-slate-600 text-xs">
            End of archive • {filteredProjects.length} projects cataloged
          </p>
        )}
      </div>
    </div>
  );
}
