// components/student/ProjectsSection.tsx
"use client";

import { useState } from "react";
import { useMyProfile } from "@/hooks/student/useMyProfile";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { Project } from "@/services/student.service";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface ProjectsSectionProps {
  projects: Project[];
}

export function ProjectsSection({ projects }: ProjectsSectionProps) {
  const { addProjectAsync, updateProjectAsync, removeProjectAsync, isAddingProject, isUpdatingProject, isRemovingProject } = useMyProfile();
  const [isOpen, setIsOpen] = useState(true); // Collapsible state
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    liveLink: "",
    githubLink: "",
  });
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const resetForm = () => {
    setFormData({ name: "", description: "", liveLink: "", githubLink: "" });
    setEditingProject(null);
    setShowModal(false);
    setError("");
    setSuccess("");
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      description: project.description || "",
      liveLink: project.liveLink || "",
      githubLink: project.githubLink || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (projectId: string) => {
    if (confirm("Are you sure you want to delete this project?")) {
      try {
        setError("");
        setSuccess("");
        await removeProjectAsync(projectId);
        setSuccess("Project deleted successfully! ✅");
        setTimeout(() => setSuccess(""), 2000);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Failed to delete project");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Project name is required");
      return;
    }

    // GitHub link is required for new projects
    if (!editingProject && !formData.githubLink.trim()) {
      setError("GitHub repository URL is required");
      return;
    }

    // Validate GitHub URL format if provided
    if (formData.githubLink.trim() && !isValidUrl(formData.githubLink)) {
      setError("Please enter a valid GitHub URL");
      return;
    }

    // Validate live link format if provided
    if (formData.liveLink.trim() && !isValidUrl(formData.liveLink)) {
      setError("Please enter a valid live link URL");
      return;
    }

    try {
      setError("");
      setSuccess("");
      if (editingProject) {
        await updateProjectAsync({
          projectId: editingProject.id,
          data: formData,
        });
      } else {
        await addProjectAsync(formData);
      }
      setSuccess(editingProject ? "Project updated successfully! ✅" : "Project added successfully! ✅");
      resetForm();
      setTimeout(() => setSuccess(""), 2000);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to save project");
    }
  };

  const isBusy = isAddingProject || isUpdatingProject || isRemovingProject;

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden">
      {/* Header - Clickable for collapse */}
      <div 
        className="px-4 sm:px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">🚀</span>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Personal Projects</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {projects.length > 0 ? `${projects.length} projects added` : "Showcase your previous work"}
            </p>
          </div>
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-gray-400 ml-2" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400 ml-2" />
          )}
        </div>
        {isOpen && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowModal(true);
          }}
          className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium text-sm rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
        >
          + Add Project
        </button>
        )}
      </div>

      {/* Helper Text */}
      {isOpen && (
        <div className="px-4 sm:px-6 pb-2">
          <p className="text-xs text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-slate-700/30 px-3 py-2 rounded-lg">
            📁 These are your past or personal projects — not your FYP idea. Add projects that demonstrate your skills and experience.
          </p>
        </div>
      )}

      {/* Collapsible Content */}
      {isOpen && (
      <>
      {/* Success/Error Messages */}
      <div className="px-4 sm:px-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400 text-sm">
            {success}
          </div>
        )}
      </div>

      {/* Projects List */}
      <div className="p-4 sm:p-6 pt-0">
        {projects.length === 0 ? (
          <div className="text-center py-10">
            <div className="text-5xl mb-3 opacity-50">🚀</div>
            <p className="text-gray-600 dark:text-gray-400 text-base font-medium">No projects added yet</p>
            <p className="text-gray-500 dark:text-gray-500 mt-2 text-sm">Add your first project to showcase your work</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <div
                key={project.id}
                className="group relative bg-gray-50 dark:bg-slate-700/50 rounded-xl p-4 border border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500 transition-all duration-300 overflow-hidden"
              >
                {/* Background gradient on hover */}
                <div className="absolute inset-0 bg-gray-100/50 dark:bg-slate-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-base flex-1 pr-2">{project.name}</h3>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEdit(project)}
                        disabled={isBusy}
                        className="p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-colors duration-200 disabled:opacity-50"
                        title="Edit project"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(project.id)}
                        disabled={isBusy}
                        className="p-1.5 text-gray-600 dark:text-gray-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors duration-200 disabled:opacity-50"
                        title="Delete project"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  {/* Description */}
                  {project.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3 line-clamp-3">{project.description}</p>
                  )}

                  {/* Links */}
                  <div className="flex gap-2 flex-wrap">
                    {project.liveLink && isValidUrl(project.liveLink) && (
                      <a
                        href={project.liveLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200"
                      >
                        🌐 Live Demo
                      </a>
                    )}
                    {project.githubLink && isValidUrl(project.githubLink) && (
                      <a
                        href={project.githubLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200"
                      >
                        💻 GitHub
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </>
      )}

      {/* Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
          onClick={(e) => e.target === e.currentTarget && resetForm()}
        >
          <div className="bg-white dark:bg-slate-800 rounded-t-2xl sm:rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-4 sm:px-6 py-4 bg-gray-100 dark:bg-slate-700 border-b border-gray-200 dark:border-slate-600 flex items-center justify-between flex-shrink-0">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingProject ? "Edit Project" : "Add New Project"}
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-600 p-1.5 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., E-commerce Platform"
                  className="w-full px-3 py-2.5 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-gray-400 dark:focus:ring-slate-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your project and key features..."
                  rows={3}
                  className="w-full px-3 py-2.5 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-gray-400 dark:focus:ring-slate-500 focus:border-transparent outline-none transition-all resize-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>

              {/* Live Link */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Live Demo Link
                </label>
                <input
                  type="url"
                  value={formData.liveLink}
                  onChange={(e) => setFormData({ ...formData, liveLink: e.target.value })}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2.5 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-gray-400 dark:focus:ring-slate-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>

              {/* GitHub Link */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  GitHub Repository
                </label>
                <input
                  type="url"
                  value={formData.githubLink}
                  onChange={(e) => setFormData({ ...formData, githubLink: e.target.value })}
                  placeholder="https://github.com/username/repo"
                  className="w-full px-3 py-2.5 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-gray-400 dark:focus:ring-slate-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>

              {/* Actions */}
              <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={isBusy}
                  className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isBusy || !formData.name.trim()}
                  className="flex-1 px-4 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isBusy ? "Saving..." : editingProject ? "Update Project" : "Add Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
