// components/student/SkillsSection.tsx
"use client";

import { useState } from "react";
import { useMyProfile } from "@/hooks/student/useMyProfile";
import { ChevronDown, ChevronUp } from "lucide-react";
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
        setSuccess("Skill deleted successfully! ✅");
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
      setSuccess(editingSkill ? "Skill updated successfully! ✅" : "Skill added successfully! ✅");
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
        badge: "bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200",
        label: "Beginner",
        icon: "🌱",
      },
      INTERMEDIATE: {
        badge: "bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 border border-amber-200",
        label: "Intermediate",
        icon: "📈",
      },
      ADVANCED: {
        badge: "bg-gradient-to-r from-purple-50 to-violet-50 text-purple-700 border border-purple-200",
        label: "Advanced",
        icon: "⭐",
      },
    };
    return config[level];
  };

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header - Clickable for collapse */}
      <div 
        className="px-4 sm:px-8 py-4 sm:py-6 bg-gradient-to-r from-blue-600 to-indigo-600 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 cursor-pointer hover:from-blue-700 hover:to-indigo-700 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="text-white flex items-center">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-lg flex items-center justify-center text-lg sm:text-xl">💡</div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">Skills</h2>
              <p className="text-blue-100 text-xs sm:text-sm">Showcase your technical expertise</p>
            </div>
          </div>
          {isOpen ? (
            <ChevronUp className="w-5 h-5 sm:w-6 sm:h-6 text-white/80 ml-3" />
          ) : (
            <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6 text-white/80 ml-3" />
          )}
        </div>
        {isOpen && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowModal(true);
          }}
          className="w-full sm:w-auto px-4 sm:px-5 py-2 sm:py-2.5 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
        >
          <span className="text-lg">+</span> Add Skill
        </button>
        )}
      </div>

      {/* Collapsible Content */}
      {isOpen && (
      <>
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

      {/* Skills List */}
      <div className="p-4 sm:p-8 pt-0">
        {skills.length === 0 ? (
          <div className="text-center py-10 sm:py-16">
            <div className="text-5xl sm:text-6xl mb-3 sm:mb-4 opacity-50">🎯</div>
            <p className="text-gray-600 text-base sm:text-lg font-medium">No skills added yet</p>
            <p className="text-gray-500 mt-2 text-sm sm:text-base px-4">Start by adding your first skill to showcase your expertise</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {skills.map((skill) => {
              const config = getLevelConfig(skill.level);
              return (
                <div
                  key={skill.id}
                  className="group relative bg-white rounded-xl p-4 sm:p-5 border border-gray-200 hover:border-blue-400 hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  {/* Background gradient on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-3 sm:mb-4">
                      <h3 className="font-bold text-gray-900 text-base sm:text-lg flex-1 pr-2">{skill.name}</h3>
                      <div className="flex gap-1 sm:gap-2  md:group-hover:opacity-100 transition-opacity duration-300">
                        <button
                          onClick={() => handleEdit(skill)}
                          disabled={isBusy}
                          className="p-1.5 sm:p-2 text-blue-600  hover:bg-blue-100 rounded-lg transition-colors duration-200 disabled:opacity-50"
                          title="Edit skill"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(skill.id)}
                          disabled={isBusy}
                          className="p-1.5 sm:p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200 disabled:opacity-50"
                          title="Delete skill"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    {/* Level Badge */}
                    <div className={`inline-flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-semibold ${config.badge} mb-2 sm:mb-3`}>
                      <span>{config.icon}</span>
                      {config.label}
                    </div>

                    {/* Description */}
                    {skill.description && (
                      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed line-clamp-3">{skill.description}</p>
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
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] sm:max-h-[85vh] overflow-hidden flex flex-col">
            <div className="px-4 sm:px-6 py-4 sm:py-5 bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-between flex-shrink-0">
              <h3 className="text-lg sm:text-xl font-bold text-white">
                {editingSkill ? "Edit Skill" : "Add New Skill"}
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
                  Skill Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., React, Python, UI Design"
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm sm:text-base"
                  required
                />
              </div>

              {/* Level */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                  Experience Level *
                </label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value as ExperienceLevel })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm sm:text-base"
                >
                  <option value="BEGINNER">🌱 Beginner</option>
                  <option value="INTERMEDIATE">📈 Intermediate</option>
                  <option value="ADVANCED">⭐ Advanced</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of your experience..."
                  rows={3}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none text-sm sm:text-base"
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
                  className="flex-1 px-4 py-2.5 sm:py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 text-sm sm:text-base"
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
