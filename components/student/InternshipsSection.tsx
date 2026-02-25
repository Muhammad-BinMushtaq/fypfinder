// components/student/InternshipsSection.tsx
"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Plus, Pencil, Trash2, ExternalLink, Building2, Briefcase, Calendar } from "lucide-react";
import type { Internship } from "@/services/student.service";
import * as studentService from "@/services/student.service";

interface InternshipsSectionProps {
  internships: Internship[];
  onUpdate?: () => void;
}

export function InternshipsSection({ internships, onUpdate }: InternshipsSectionProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    companyName: "",
    position: "",
    duration: "",
    description: "",
    certificateLink: "",
  });

  const resetForm = () => {
    setFormData({
      companyName: "",
      position: "",
      duration: "",
      description: "",
      certificateLink: "",
    });
    setIsAdding(false);
    setEditingId(null);
    setError("");
  };

  const handleAdd = async () => {
    if (!formData.companyName || !formData.position || !formData.duration) {
      setError("Company name, position, and duration are required");
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      await studentService.addInternship(formData);
      resetForm();
      onUpdate?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add internship");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    if (!formData.companyName || !formData.position || !formData.duration) {
      setError("Company name, position, and duration are required");
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      await studentService.updateInternship(editingId, formData);
      resetForm();
      onUpdate?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update internship");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this internship?")) return;

    setIsLoading(true);
    try {
      await studentService.removeInternship(id);
      onUpdate?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete internship");
    } finally {
      setIsLoading(false);
    }
  };

  const startEdit = (internship: Internship) => {
    setFormData({
      companyName: internship.companyName,
      position: internship.position,
      duration: internship.duration,
      description: internship.description || "",
      certificateLink: internship.certificateLink || "",
    });
    setEditingId(internship.id);
    setIsAdding(false);
  };

  const renderForm = () => (
    <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg space-y-4">
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-xs sm:text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
            Company Name *
          </label>
          <input
            type="text"
            value={formData.companyName}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            placeholder="e.g., Google"
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
            Position *
          </label>
          <input
            type="text"
            value={formData.position}
            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
            placeholder="e.g., Software Engineer Intern"
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
            Duration *
          </label>
          <input
            type="text"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            placeholder="e.g., Jun 2025 - Aug 2025"
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
            Certificate Link
          </label>
          <input
            type="url"
            value={formData.certificateLink}
            onChange={(e) => setFormData({ ...formData, certificateLink: e.target.value })}
            placeholder="https://..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe your responsibilities and achievements..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white resize-none"
        />
      </div>

      <div className="flex gap-3 justify-end">
        <button
          onClick={resetForm}
          disabled={isLoading}
          className="px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 text-sm font-medium"
        >
          Cancel
        </button>
        <button
          onClick={editingId ? handleUpdate : handleAdd}
          disabled={isLoading}
          className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 text-sm font-medium disabled:opacity-50"
        >
          {isLoading ? "Saving..." : editingId ? "Update" : "Add"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden">
      {/* Header */}
      <div
        className="px-4 sm:px-6 py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
        onClick={() => !isAdding && !editingId && setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-lg flex-shrink-0">💼</span>
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Internship Experience</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {internships.length} internship{internships.length !== 1 ? "s" : ""} added
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {!isAdding && !editingId && isOpen && internships.length < 10 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsAdding(true);
                }}
                className="p-1.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
            {!isAdding && !editingId && (isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />)}
          </div>
        </div>
      </div>

      {/* Content */}
      {isOpen && (
        <div className="p-4 sm:p-6 border-t border-gray-100 dark:border-slate-700 space-y-4">
          {(isAdding || editingId) && renderForm()}

          {!isAdding && !editingId && internships.length === 0 && (
            <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
              No internships added yet. Click + to add your experience.
            </p>
          )}

          {!isAdding && internships.map((internship) => (
            editingId === internship.id ? null : (
              <div
                key={internship.id}
                className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                        {internship.companyName}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <Briefcase className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <p className="text-gray-700 dark:text-gray-300 text-sm">{internship.position}</p>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <p className="text-gray-500 dark:text-gray-400 text-xs">{internship.duration}</p>
                    </div>
                    {internship.description && (
                      <p className="text-gray-600 dark:text-gray-400 text-xs mt-2 line-clamp-2">
                        {internship.description}
                      </p>
                    )}
                    {internship.certificateLink && (
                      <a
                        href={internship.certificateLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-2 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        <ExternalLink className="w-3 h-3" />
                        View Certificate
                      </a>
                    )}
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => startEdit(internship)}
                      className="p-1.5 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-slate-600 rounded"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(internship.id)}
                      className="p-1.5 text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-200 dark:hover:bg-slate-600 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          ))}
        </div>
      )}
    </div>
  );
}
