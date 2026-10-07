// components/student/InternshipsSection.tsx
"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, ExternalLink, Building2, Briefcase, Calendar, Loader2 } from "lucide-react";
import type { Internship } from "@/services/student.service";
import * as studentService from "@/services/student.service";
import { toast } from "react-toastify";

interface InternshipsSectionProps {
  internships: Internship[];
  onUpdate?: () => void;
}

export function InternshipsSection({ internships, onUpdate }: InternshipsSectionProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
    setEditingId(null);
    setShowModal(false);
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
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this internship?")) return;

    setIsLoading(true);
    try {
      await studentService.removeInternship(id);
      toast.success("Experience deleted successfully!");
      onUpdate?.();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete internship");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName || !formData.position || !formData.duration) {
      toast.error("Company name, position, and duration are required");
      return;
    }

    setIsLoading(true);
    try {
      if (editingId) {
        await studentService.updateInternship(editingId, formData);
        toast.success("Experience updated successfully!");
      } else {
        await studentService.addInternship(formData);
        toast.success("Experience added successfully!");
      }
      resetForm();
      onUpdate?.();
    } catch (err: any) {
      toast.error(err.message || "Failed to save internship");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Experience</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Internships and professional work</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>

        {internships.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-500 dark:text-slate-400 text-sm">No experience added yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {internships.map((internship) => (
              <div
                key={internship.id}
                className="group relative bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-700/50 hover:border-slate-200 dark:hover:border-slate-600 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-4 h-4 text-slate-400" />
                      </div>
                      <h3 className="font-semibold text-slate-900 dark:text-white text-base truncate">
                        {internship.position}
                      </h3>
                    </div>
                    
                    <div className="pl-10.5 sm:pl-11">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-sm mb-3">
                        <p className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 sm:hidden" />
                          {internship.companyName}
                        </p>
                        <span className="hidden sm:inline text-slate-300 dark:text-slate-600">•</span>
                        <p className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 text-xs sm:text-sm">
                          <Calendar className="w-3.5 h-3.5" />
                          {internship.duration}
                        </p>
                      </div>
                      
                      {internship.description && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                          {internship.description}
                        </p>
                      )}
                      
                      {internship.certificateLink && (
                        <a
                          href={internship.certificateLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          View Certificate
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 -mr-2 -mt-2 flex-shrink-0">
                    <button
                      onClick={() => startEdit(internship)}
                      disabled={isLoading}
                      className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors disabled:opacity-50"
                      title="Edit experience"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(internship.id)}
                      disabled={isLoading}
                      className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-50"
                      title="Delete experience"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0 bg-slate-900/50 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && resetForm()}>
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl">
            <form onSubmit={handleSubmit} className="flex flex-col">
              <div className="p-6 sm:p-8 space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    {editingId ? "Edit Experience" : "Add Experience"}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Include details about your internships or previous jobs.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-900 dark:text-white">Company Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        placeholder="e.g. Google"
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm outline-none focus:border-slate-400 dark:focus:border-slate-500 transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-900 dark:text-white">Position *</label>
                      <input
                        type="text"
                        required
                        value={formData.position}
                        onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                        placeholder="e.g. Frontend Engineer"
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm outline-none focus:border-slate-400 dark:focus:border-slate-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-900 dark:text-white">Duration *</label>
                      <select
                        required
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm outline-none focus:border-slate-400 dark:focus:border-slate-500 transition-colors"
                      >
                        <option value="" disabled>Select duration</option>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                          <option key={m} value={`${m} month${m > 1 ? 's' : ''}`}>{`${m} month${m > 1 ? 's' : ''}`}</option>
                        ))}
                        <option value="12+ months">12+ months</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-900 dark:text-white">Certificate URL</label>
                      <input
                        type="url"
                        value={formData.certificateLink}
                        onChange={(e) => setFormData({ ...formData, certificateLink: e.target.value })}
                        placeholder="https://..."
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm outline-none focus:border-slate-400 dark:focus:border-slate-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-900 dark:text-white">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="What were your responsibilities and achievements?"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-sm outline-none focus:border-slate-400 dark:focus:border-slate-500 transition-colors resize-none min-h-[100px]"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 sm:px-8 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={isLoading}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !formData.companyName.trim() || !formData.position.trim() || !formData.duration}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isLoading ? "Saving..." : "Save Experience"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
