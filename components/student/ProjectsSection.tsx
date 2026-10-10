// components/student/ProjectsSection.tsx
"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useMyProfile } from "@/hooks/student/useMyProfile";
import { Plus, Pencil, Trash2, Github, ExternalLink, Loader2, ChevronDown, ChevronUp, X, Star, GitFork, Sparkles } from "lucide-react";
import type { Project } from "@/services/student.service";
import { ProjectEmbedCard } from "./ProjectEmbedCard";
import { toast } from "react-toastify";

interface ProjectsSectionProps {
  projects: Project[];
}

export function ProjectsSection({ projects }: ProjectsSectionProps) {
  const { addProjectAsync, updateProjectAsync, removeProjectAsync, isAddingProject, isUpdatingProject, isRemovingProject } = useMyProfile();
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isFetchingGithub, setIsFetchingGithub] = useState(false);
  
  const PROJECTS_LIMIT = 2;
  const visibleProjects = showAllProjects ? projects : projects.slice(0, PROJECTS_LIMIT);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    githubLink: "",
    liveLink: "",
    embedType: "" as string | null | undefined,
    embedUrl: "" as string | null | undefined,
    mediaMetadata: null as any,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll and hide mobile bottom nav when modal is open
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
      document.body.classList.add("modal-open");
    } else {
      document.body.style.overflow = "unset";
      document.body.classList.remove("modal-open");
    }
    return () => {
      document.body.style.overflow = "unset";
      document.body.classList.remove("modal-open");
    };
  }, [showModal]);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showModal) {
        resetForm();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showModal]);

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      githubLink: "",
      liveLink: "",
      embedType: null,
      embedUrl: null,
      mediaMetadata: null,
    });
    setEditingProject(null);
    setIsFetchingGithub(false);
    setShowModal(false);
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      description: project.description || "",
      githubLink: project.githubLink || "",
      liveLink: project.liveLink || "",
      embedType: project.embedType,
      embedUrl: project.embedUrl,
      mediaMetadata: project.mediaMetadata,
    });
    setShowModal(true);
  };

  const handleFetchGithubMeta = async () => {
    const rawUrl = formData.githubLink.trim();
    if (!rawUrl) {
      toast.error("Please enter a GitHub repository URL first");
      return;
    }

    if (!rawUrl.includes("github.com/")) {
      toast.error("Please enter a valid GitHub repository URL (e.g. https://github.com/owner/repo)");
      return;
    }

    setIsFetchingGithub(true);
    try {
      const res = await fetch(`/api/student/github-meta?url=${encodeURIComponent(rawUrl)}`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to fetch repository metadata");
      }

      const meta = json.data;
      const repoNameFromUrl = rawUrl.split("/").filter(Boolean).pop()?.replace(/\.git$/, "") || "";

      setFormData((prev) => ({
        ...prev,
        name: prev.name.trim() ? prev.name : repoNameFromUrl,
        description: prev.description.trim() ? prev.description : (meta.description || prev.description),
        embedType: "GITHUB",
        embedUrl: rawUrl,
        mediaMetadata: meta,
      }));

      toast.success("GitHub repository details fetched successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch GitHub info");
    } finally {
      setIsFetchingGithub(false);
    }
  };

  const handleDelete = async (projectId: string) => {
    if (confirm("Are you sure you want to delete this project?")) {
      try {
        await removeProjectAsync(projectId);
        toast.success("Project deleted successfully!");
      } catch (error: any) {
        toast.error(error.message || "Failed to delete project");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Project name is required");
      return;
    }

    const payload = {
      ...formData,
      embedType: formData.githubLink.trim() ? "GITHUB" : formData.embedType || null,
      embedUrl: formData.githubLink.trim() ? formData.githubLink.trim() : formData.embedUrl || null,
    };

    try {
      if (editingProject) {
        await updateProjectAsync({
          projectId: editingProject.id,
          data: payload,
        });
        toast.success("Project updated successfully!");
      } else {
        await addProjectAsync(payload);
        toast.success("Project added successfully!");
      }
      resetForm();
    } catch (error: any) {
      toast.error(error.message || "Failed to save project");
    }
  };

  const isBusy = isAddingProject || isUpdatingProject || isRemovingProject;

  return (
    <>
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Personal Projects</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Showcase your previous work</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-500 dark:text-slate-400 text-sm">No projects added yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {visibleProjects.map((project) => (
                <div
                  key={project.id}
                  className="group relative bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-700/50 hover:border-slate-200 dark:hover:border-slate-600 transition-colors flex flex-col h-full"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-slate-900 dark:text-white text-base truncate pr-2">{project.name}</h3>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 -mr-2 -mt-2 flex-shrink-0">
                      <button
                        onClick={() => handleEdit(project)}
                        disabled={isBusy}
                        className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors disabled:opacity-50"
                        title="Edit project"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(project.id)}
                        disabled={isBusy}
                        className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-50"
                        title="Delete project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {project.description && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                      {project.description}
                    </p>
                  )}

                  <div className="mb-4">
                    <ProjectEmbedCard 
                      embedType={project.embedType} 
                      embedUrl={project.embedUrl} 
                      mediaMetadata={project.mediaMetadata} 
                    />
                  </div>

                  <div className="mt-auto flex flex-wrap gap-3 pt-2">
                    {project.liveLink && (
                      <a
                        href={project.liveLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Live Demo
                      </a>
                    )}
                    {project.githubLink && (
                      <a
                        href={project.githubLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        <Github className="w-3.5 h-3.5" /> Source Code
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {projects.length > PROJECTS_LIMIT && (
              <button
                onClick={() => setShowAllProjects(!showAllProjects)}
                className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 self-start"
              >
                {showAllProjects ? (
                  <><ChevronUp className="w-4 h-4" /> Show Less</>
                ) : (
                  <><ChevronDown className="w-4 h-4" /> See All {projects.length} Projects</>
                )}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {mounted && showModal && createPortal(
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
          onClick={resetForm}
        >
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            aria-hidden="true"
          />

          <div 
            className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col max-h-[min(90vh,620px)] animate-in zoom-in-95 duration-200 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 sm:p-6 pb-3 sm:pb-4 flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 shrink-0">
              <div className="min-w-0">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {editingProject ? "Edit Project" : "Add New Project"}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                  Add details about a project you've built.
                </p>
              </div>
              <button
                type="button"
                onClick={resetForm}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              {/* Scrollable Form Body */}
              <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 min-h-0">
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-medium text-slate-900 dark:text-white">Project Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. E-Commerce Website"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-base sm:text-sm outline-none focus:border-slate-400 dark:focus:border-slate-500 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-medium text-slate-900 dark:text-white">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="What did you build and what technologies did you use?"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-base sm:text-sm outline-none focus:border-slate-400 dark:focus:border-slate-500 transition-colors resize-none min-h-[90px] max-h-[140px]"
                  />
                </div>

                <div className="space-y-3.5">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs sm:text-sm font-medium text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Github className="w-4 h-4" /> Source Code URL
                      </label>
                      {formData.githubLink.trim().includes("github.com/") && (
                        <button
                          type="button"
                          onClick={handleFetchGithubMeta}
                          disabled={isFetchingGithub}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:underline disabled:opacity-50"
                        >
                          {isFetchingGithub ? (
                            <>
                              <Loader2 className="w-3 h-3 animate-spin" />
                              <span>Fetching...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3 h-3 text-amber-500" />
                              <span>Fetch Repo Info</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                    <input
                      type="url"
                      value={formData.githubLink}
                      onChange={(e) => setFormData({ ...formData, githubLink: e.target.value })}
                      placeholder="https://github.com/..."
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-base sm:text-sm outline-none focus:border-slate-400 dark:focus:border-slate-500 transition-colors"
                    />

                    {/* Fetched GitHub Metadata Preview */}
                    {formData.mediaMetadata && (
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5 animate-in fade-in duration-150">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 truncate pr-2">
                            <Github className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{formData.githubLink.replace(/https?:\/\/github\.com\//, "")}</span>
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-medium shrink-0">
                            Verified Repo
                          </span>
                        </div>
                        {formData.mediaMetadata.description && (
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">
                            {formData.mediaMetadata.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 pt-0.5 flex-wrap">
                          {formData.mediaMetadata.language && (
                            <span className="flex items-center gap-1 font-medium">
                              <span className="w-2 h-2 rounded-full bg-blue-500" />
                              {formData.mediaMetadata.language}
                            </span>
                          )}
                          {formData.mediaMetadata.stars !== undefined && (
                            <span className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-amber-500" />
                              {formData.mediaMetadata.stars} stars
                            </span>
                          )}
                          {formData.mediaMetadata.forks !== undefined && (
                            <span className="flex items-center gap-1">
                              <GitFork className="w-3 h-3" />
                              {formData.mediaMetadata.forks} forks
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs sm:text-sm font-medium text-slate-900 dark:text-white flex items-center gap-1.5">
                      <ExternalLink className="w-4 h-4" /> Live Demo URL
                    </label>
                    <input
                      type="url"
                      value={formData.liveLink}
                      onChange={(e) => setFormData({ ...formData, liveLink: e.target.value })}
                      placeholder="https://..."
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-base sm:text-sm outline-none focus:border-slate-400 dark:focus:border-slate-500 transition-colors"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  <strong>Tip:</strong> Paste a YouTube, Figma, or Loom URL above to automatically embed it!
                </p>
              </div>

              {/* Footer Actions */}
              <div className="p-4 sm:p-6 pt-3 sm:pt-4 border-t border-slate-100 dark:border-slate-800/80 flex gap-3 bg-slate-50/50 dark:bg-slate-900/40 shrink-0">
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={isBusy}
                  className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-xs sm:text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isBusy || !formData.name.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-sm disabled:opacity-50 text-xs sm:text-sm"
                >
                  {isBusy && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isBusy ? "Saving..." : "Save Project"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
