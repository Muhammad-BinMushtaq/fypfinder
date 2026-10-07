// components/student/SkillsSection.tsx
"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useMyProfile } from "@/hooks/student/useMyProfile";
import { Plus, Pencil, Trash2, Sprout, TrendingUp, Award, Loader2, ChevronDown, ChevronUp, X } from "lucide-react";
import { SkillCombobox } from "@/components/ui/SkillCombobox";
import type { Skill, ExperienceLevel } from "@/services/student.service";
import { toast } from "react-toastify";

interface SkillsSectionProps {
  skills: Skill[];
}

export function SkillsSection({ skills }: SkillsSectionProps) {
  const { addSkillAsync, updateSkillAsync, removeSkillAsync, isAddingSkill, isUpdatingSkill, isRemovingSkill } = useMyProfile();
  const [showModal, setShowModal] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [showAllSkills, setShowAllSkills] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const SKILLS_LIMIT = 4;
  const visibleSkills = showAllSkills ? skills : skills.slice(0, SKILLS_LIMIT);

  const [formData, setFormData] = useState({
    name: "",
    level: "BEGINNER" as ExperienceLevel,
    description: "",
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
    setFormData({ name: "", level: "BEGINNER", description: "" });
    setEditingSkill(null);
    setShowModal(false);
  };

  const handleEdit = (skill: Skill) => {
    setEditingSkill(skill);
    setFormData({
      name: skill.name,
      level: skill.level,
      description: skill.description || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (skillId: string) => {
    if (confirm("Are you sure you want to delete this skill?")) {
      try {
        await removeSkillAsync(skillId);
        toast.success("Skill deleted successfully!");
      } catch (error: any) {
        toast.error(error.message || "Failed to delete skill");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Skill name is required");
      return;
    }

    try {
      if (editingSkill) {
        await updateSkillAsync({
          skillId: editingSkill.id,
          data: formData,
        });
        toast.success("Skill updated successfully!");
      } else {
        await addSkillAsync(formData);
        toast.success("Skill added successfully!");
      }
      resetForm();
    } catch (error: any) {
      toast.error(error.message || "Failed to save skill");
    } 
  };

  const isBusy = isAddingSkill || isUpdatingSkill || isRemovingSkill;

  const getLevelConfig = (level: ExperienceLevel) => {
    const config = {
      BEGINNER: { label: "Beginner" },
      INTERMEDIATE: { label: "Intermediate" },
      ADVANCED: { label: "Advanced" },
    };
    return config[level];
  };

  return (
    <>
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Skills & Expertise</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Tools and technologies you are proficient in</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>

        {/* Skills List */}
        {skills.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-500 dark:text-slate-400 text-sm">No skills added yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {visibleSkills.map((skill) => {
                const config = getLevelConfig(skill.level);
                return (
                  <div
                    key={skill.id}
                    className="group relative inline-flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 rounded-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600 transition-all pr-12"
                  >
                    <span className="text-sm font-medium text-slate-900 dark:text-white">{skill.name}</span>
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                      {config.label}
                    </span>

                    <div className="absolute right-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center bg-slate-50 dark:bg-slate-800/90 rounded-full px-1 py-1">
                      <button
                        onClick={() => handleEdit(skill)}
                        disabled={isBusy}
                        className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors disabled:opacity-50 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
                        title="Edit skill"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDelete(skill.id)}
                        disabled={isBusy}
                        className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-50 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
                        title="Delete skill"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {skills.length > SKILLS_LIMIT && (
              <button
                onClick={() => setShowAllSkills(!showAllSkills)}
                className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 self-start"
              >
                {showAllSkills ? (
                  <><ChevronUp className="w-4 h-4" /> Show Less</>
                ) : (
                  <><ChevronDown className="w-4 h-4" /> See All {skills.length} Skills</>
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
                  {editingSkill ? "Edit Skill" : "Add New Skill"}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                  Add a technical skill and your proficiency level.
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
                  <label className="text-xs sm:text-sm font-medium text-slate-900 dark:text-white">Skill Name</label>
                  <SkillCombobox
                    value={formData.name}
                    onChange={(name) => setFormData({ ...formData, name })}
                    existingSkills={skills.map(s => s.name)}
                    placeholder="e.g. React, Python, UI Design"
                    autoFocus={!editingSkill}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-medium text-slate-900 dark:text-white">Proficiency</label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value as ExperienceLevel })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-base sm:text-sm outline-none focus:border-slate-400 dark:focus:border-slate-500 transition-colors"
                  >
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-medium text-slate-900 dark:text-white">Description (Optional)</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Briefly describe your experience..."
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-base sm:text-sm outline-none focus:border-slate-400 dark:focus:border-slate-500 transition-colors resize-none min-h-[90px] max-h-[140px]"
                  />
                </div>
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
                  {isBusy ? "Saving..." : "Save Skill"}
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
