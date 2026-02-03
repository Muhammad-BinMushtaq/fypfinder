// components/student/ProjectsSection.tsx
"use client";

import { useState } from "react";
import { useMyProfile } from "@/hooks/student/useMyProfile";
import type { Project } from "@/services/student.service";

interface ProjectsSectionProps {
  projects: Project[];
}

export function ProjectsSection({ projects }: ProjectsSectionProps) {
  const { addProjectAsync, updateProjectAsync, removeProjectAsync, isAddingProject, isUpdatingProject, isRemovingProject } = useMyProfile();
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
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 sm:px-8 py-4 sm:py-6 bg-gradient-to-r from-emerald-600 to-teal-600 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
        <div className="text-white">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-lg flex items-center justify-center text-lg sm:text-xl">🚀</div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">Projects</h2>
              <p className="text-emerald-100 text-xs sm:text-sm">Share your portfolio and achievements</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="w-full sm:w-auto px-4 sm:px-5 py-2 sm:py-2.5 bg-white text-emerald-600 font-semibold rounded-lg hover:bg-emerald-50 shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
        >
          <span className="text-lg">+</span> Add Project
        </button>
      </div>

      {/* Success/Error Messages */}
      <div className="px-4 sm:px-8 pt-4 sm:pt-6">
        {error && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs sm:text-sm font-medium">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-xs sm:text-sm font-medium">
            {success}
          </div>
        )}
      </div>

      {/* Projects List */}
      <div className="p-4 sm:p-8 pt-0">
        {projects.length === 0 ? (
          <div className="text-center py-10 sm:py-16">
            <div className="text-5xl sm:text-6xl mb-3 sm:mb-4 opacity-50">🚀</div>
            <p className="text-gray-600 text-base sm:text-lg font-medium">No projects added yet</p>
            <p className="text-gray-500 mt-2 text-sm sm:text-base px-4">Add your first project to showcase your work</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="group relative bg-white rounded-xl p-4 sm:p-5 border border-gray-200 hover:border-emerald-400 hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                {/* Background gradient on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <h3 className="font-bold text-gray-900 text-base sm:text-lg flex-1 pr-2">{project.name}</h3>
                    <div className="flex gap-1 sm:gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={() => handleEdit(project)}
                        disabled={isBusy}
                        className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-200 disabled:opacity-50"
                        title="Edit project"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(project.id)}
                        disabled={isBusy}
                        className="p-1.5 sm:p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200 disabled:opacity-50"
                        title="Delete project"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  {/* Description */}
                  {project.description && (
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-3 sm:mb-4 line-clamp-3">{project.description}</p>
                  )}

                  {/* Links */}
                  <div className="flex gap-2 sm:gap-3 flex-wrap">
                    {project.liveLink && isValidUrl(project.liveLink) && (
                      <a
                        href={project.liveLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] sm:text-xs px-2 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200 rounded-lg hover:shadow-md transition-all duration-200"
                      >
                        🌐 Live Demo
                      </a>
                    )}
                    {project.githubLink && isValidUrl(project.githubLink) && (
                      <a
                        href={project.githubLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] sm:text-xs px-2 sm:px-3 py-1 sm:py-1.5 bg-gray-100 text-gray-700 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200"
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

      {/* Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
          onClick={(e) => e.target === e.currentTarget && resetForm()}
        >
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] sm:max-h-[85vh] overflow-hidden flex flex-col">
            <div className="px-4 sm:px-6 py-4 sm:py-5 bg-gradient-to-r from-emerald-600 to-teal-600 flex items-center justify-between flex-shrink-0">
              <h3 className="text-lg sm:text-xl font-bold text-white">
                {editingProject ? "Edit Project" : "Add New Project"}
              </h3>
              <button
                onClick={resetForm}
                className="text-white hover:bg-white/20 p-1.5 sm:p-2 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
              {error && (
                <div className="p-2 sm:p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs sm:text-sm">
                  {error}
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., E-commerce Platform"
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-sm sm:text-base"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your project and key features..."
                  rows={3}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all resize-none text-sm sm:text-base"
                />
              </div>

              {/* Live Link */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                  Live Demo Link
                </label>
                <input
                  type="url"
                  value={formData.liveLink}
                  onChange={(e) => setFormData({ ...formData, liveLink: e.target.value })}
                  placeholder="https://example.com"
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-sm sm:text-base"
                />
              </div>

              {/* GitHub Link */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                  GitHub Repository
                </label>
                <input
                  type="url"
                  value={formData.githubLink}
                  onChange={(e) => setFormData({ ...formData, githubLink: e.target.value })}
                  placeholder="https://github.com/username/repo"
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-sm sm:text-base"
                />
              </div>

              {/* Actions */}
              <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-2 sm:pt-3">
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={isBusy}
                  className="flex-1 px-4 py-2.5 sm:py-2.5 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-all duration-300 text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isBusy || !formData.name.trim()}
                  className="flex-1 px-4 py-2.5 sm:py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 text-sm sm:text-base"
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
