// components/student/SkillsSection.tsx
"use client";

import { useState, useEffect } from "react";
import { useMyProfile } from "@/hooks/student/useMyProfile";
import { Plus, Pencil, Trash2, Sprout, TrendingUp, Award, Loader2, ChevronDown, ChevronUp } from "lucide-react";
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
  
  const SKILLS_LIMIT = 4;
  const visibleSkills = showAllSkills ? skills : skills.slice(0, SKILLS_LIMIT);

  const [formData, setFormData] = useState({
    name: "",
    level: "BEGINNER" as ExperienceLevel,
    description: "",
  });

  // Lock body scroll when modal is open
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
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
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={resetForm}
          />

          <div 
            className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[calc(100dvh-2rem)] my-auto animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
              <div className="p-5 sm:p-7 space-y-5 overflow-y-auto">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-1">
                    {editingSkill ? "Edit Skill" : "Add New Skill"}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    Add a technical skill and your proficiency level.
                  </p>
                </div>

                <div className="space-y-4">
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
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 sm:px-7 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={isBusy}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isBusy || !formData.name.trim()}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                >
                  {isBusy && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isBusy ? "Saving..." : "Save Skill"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
