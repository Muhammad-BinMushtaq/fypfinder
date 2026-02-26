// components/student/SkillsSection.tsx
"use client";

import { useState } from "react";
import { useMyProfile } from "@/hooks/student/useMyProfile";
import { ChevronDown, ChevronUp, Pencil, Trash2, Lightbulb, Award, TrendingUp, Sprout } from "lucide-react";
import { SkillCombobox } from "@/components/ui/SkillCombobox";
import type { Skill, ExperienceLevel } from "@/services/student.service";

interface SkillsSectionProps {
  skills: Skill[];
}

export function SkillsSection({ skills }: SkillsSectionProps) {
  const { addSkillAsync, updateSkillAsync, removeSkillAsync, isAddingSkill, isUpdatingSkill, isRemovingSkill } = useMyProfile();
  const [isOpen, setIsOpen] = useState(true); // Collapsible state
  const [showModal, setShowModal] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    level: "BEGINNER" as ExperienceLevel,
    description: "",
  });
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const resetForm = () => {
    setFormData({ name: "", level: "BEGINNER", description: "" });
    setEditingSkill(null);
    setShowModal(false);
    setError("");
    setSuccess("");
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
        setError("");
        setSuccess("");
        await removeSkillAsync(skillId);
        setSuccess("Skill deleted successfully!");
        setTimeout(() => setSuccess(""), 2000);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Failed to delete skill");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Skill name is required");
      return;
    }

    try {
      setError("");
      setSuccess("");
      if (editingSkill) {
        await updateSkillAsync({
          skillId: editingSkill.id,
          data: formData,
        });
      } else {
        await addSkillAsync(formData);
      }
      setSuccess(editingSkill ? "Skill updated successfully!" : "Skill added successfully!");
      resetForm();
      setTimeout(() => setSuccess(""), 2000);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to save skill");
    } 
  };

  const isBusy = isAddingSkill || isUpdatingSkill || isRemovingSkill;

  const getLevelConfig = (level: ExperienceLevel) => {
    const config = {
      BEGINNER: {
        badge: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700",
        label: "Beginner",
        Icon: Sprout,
      },
      INTERMEDIATE: {
        badge: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700",
        label: "Intermediate",
        Icon: TrendingUp,
      },
      ADVANCED: {
        badge: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700",
        label: "Advanced",
        Icon: Award,
      },
    };
    return config[level];
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden">
      {/* Header - Clickable for collapse */}
      <div 
        className="px-4 sm:px-6 py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <Lightbulb className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Skills</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {skills.length > 0 ? `${skills.length} skills added` : "Add your technical skills"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {isOpen && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowModal(true);
                }}
                className="px-3 py-1.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium text-xs rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
              >
                + Add
              </button>
            )}
            {isOpen ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </div>
        </div>
      </div>

      {/* Helper Text */}
      {isOpen && (
        <div className="px-4 sm:px-6 pb-3">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Add programming languages, frameworks, or tools relevant to your FYP.
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

      {/* Skills List */}
      <div className="p-4 sm:p-6 pt-0">
        {skills.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
              <Lightbulb className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-base font-medium">No skills added yet</p>
            <p className="text-gray-500 dark:text-gray-500 mt-2 text-sm">Start by adding your first skill to showcase your expertise</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {skills.map((skill) => {
              const config = getLevelConfig(skill.level);
              return (
                <div
                  key={skill.id}
                  className="group relative bg-gray-50 dark:bg-slate-700/50 rounded-xl p-4 border border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500 transition-all duration-300 overflow-hidden"
                >
                  {/* Background gradient on hover */}
                  <div className="absolute inset-0 bg-gray-100/50 dark:bg-slate-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-base flex-1 pr-2">{skill.name}</h3>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEdit(skill)}
                          disabled={isBusy}
                          className="p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-colors duration-200 disabled:opacity-50"
                          title="Edit skill"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(skill.id)}
                          disabled={isBusy}
                          className="p-1.5 text-gray-600 dark:text-gray-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors duration-200 disabled:opacity-50"
                          title="Delete skill"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Level Badge */}
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.badge} mb-2`}>
                      <config.Icon className="w-3 h-3" />
                      {config.label}
                    </div>

                    {/* Description */}
                    {skill.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3">{skill.description}</p>
                    )}
                  </div>
                </div>
              );
            })}
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
                {editingSkill ? "Edit Skill" : "Add New Skill"}
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
                  Skill Name *
                </label>
                <SkillCombobox
                  value={formData.name}
                  onChange={(name) => setFormData({ ...formData, name })}
                  existingSkills={skills.map(s => s.name)}
                  placeholder="Search for a skill..."
                  autoFocus={!editingSkill}
                />
              </div>

              {/* Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Experience Level *
                </label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value as ExperienceLevel })}
                  className="w-full px-3 py-2.5 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-gray-400 dark:focus:ring-slate-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white"
                >
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of your experience..."
                  rows={3}
                  className="w-full px-3 py-2.5 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-gray-400 dark:focus:ring-slate-500 focus:border-transparent outline-none transition-all resize-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
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
                  {isBusy ? "Saving..." : editingSkill ? "Update Skill" : "Add Skill"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
