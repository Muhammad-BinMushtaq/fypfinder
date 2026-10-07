// components/student/SkillsSection.tsx
"use client";

import { useState } from "react";
import { useMyProfile } from "@/hooks/student/useMyProfile";
import { Plus, Pencil, Trash2, Sprout, TrendingUp, Award, Loader2 } from "lucide-react";
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
  const [formData, setFormData] = useState({
    name: "",
    level: "BEGINNER" as ExperienceLevel,
    description: "",
  });

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
      BEGINNER: {
        badge: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700",
        label: "Beginner",
        Icon: Sprout,
      },
      INTERMEDIATE: {
        badge: "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60",
        label: "Intermediate",
        Icon: TrendingUp,
      },
      ADVANCED: {
        badge: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60",
        label: "Advanced",
        Icon: Award,
      },
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {skills.map((skill) => {
              const config = getLevelConfig(skill.level);
              return (
                <div
                  key={skill.id}
                  className="group relative bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 sm:p-5 border border-slate-100 dark:border-slate-700/50 hover:border-slate-200 dark:hover:border-slate-600 transition-colors flex flex-col h-full"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-slate-900 dark:text-white text-base truncate pr-2">{skill.name}</h3>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 -mr-2 -mt-2">
                      <button
                        onClick={() => handleEdit(skill)}
                        disabled={isBusy}
                        className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors disabled:opacity-50"
                        title="Edit skill"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(skill.id)}
                        disabled={isBusy}
                        className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-50"
                        title="Delete skill"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase self-start mb-3 ${config.badge}`}>
                    <config.Icon className="w-3 h-3" />
                    {config.label}
                  </div>

                  {skill.description && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mt-auto">
                      {skill.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0 bg-slate-900/50 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && resetForm()}>
          <div className="bg-white dark:bg-slate-900 w-full max-w-[425px] rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl">
            <form onSubmit={handleSubmit} className="flex flex-col">
              <div className="p-6 sm:p-8 space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    {editingSkill ? "Edit Skill" : "Add New Skill"}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Add a technical skill and your proficiency level.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-900 dark:text-white">Skill Name</label>
                    <SkillCombobox
                      value={formData.name}
                      onChange={(name) => setFormData({ ...formData, name })}
                      existingSkills={skills.map(s => s.name)}
                      placeholder="e.g. React, Python, UI Design"
                      autoFocus={!editingSkill}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-900 dark:text-white">Proficiency</label>
                    <select
                      value={formData.level}
                      onChange={(e) => setFormData({ ...formData, level: e.target.value as ExperienceLevel })}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm outline-none focus:border-slate-400 dark:focus:border-slate-500 transition-colors"
                    >
                      <option value="BEGINNER">Beginner</option>
                      <option value="INTERMEDIATE">Intermediate</option>
                      <option value="ADVANCED">Advanced</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-900 dark:text-white">Description (Optional)</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Briefly describe your experience..."
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-sm outline-none focus:border-slate-400 dark:focus:border-slate-500 transition-colors resize-none min-h-[100px]"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 sm:px-8 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
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
