// components/student/IndustriesSection.tsx
"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, X, Plus, Check } from "lucide-react";
import type { Industry } from "@/services/student.service";
import * as studentService from "@/services/student.service";

interface IndustriesSectionProps {
  industries: Industry[];
  onUpdate?: () => void;
}

export function IndustriesSection({ industries, onUpdate }: IndustriesSectionProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [allIndustries, setAllIndustries] = useState<Industry[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  // Fetch all available industries when editing starts
  useEffect(() => {
    if (isEditing) {
      setIsLoading(true);
      studentService.getAllIndustries()
        .then((data) => {
          setAllIndustries(data);
          setSelectedIds(industries.map((i) => i.id));
        })
        .catch((err) => setError(err.message))
        .finally(() => setIsLoading(false));
    }
  }, [isEditing, industries]);

  const handleToggle = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((i) => i !== id);
      }
      if (prev.length >= 5) {
        setError("Maximum 5 industries allowed");
        return prev;
      }
      setError("");
      return [...prev, id];
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError("");
    try {
      await studentService.setIndustryPreferences(selectedIds);
      setIsEditing(false);
      onUpdate?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setSelectedIds(industries.map((i) => i.id));
    setIsEditing(false);
    setError("");
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden">
      {/* Header */}
      <div
        className="px-4 sm:px-6 py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
        onClick={() => !isEditing && setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-lg flex-shrink-0">🏢</span>
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Industry Preferences</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {industries.length} industries selected
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {!isEditing && isOpen && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
                className="px-3 py-1.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium text-xs rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
              >
                Edit
              </button>
            )}
            {!isEditing && (isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />)}
          </div>
        </div>
      </div>

      {/* Content */}
      {isOpen && (
        <div className="p-4 sm:p-6 border-t border-gray-100 dark:border-slate-700">
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-xs sm:text-sm">
              {error}
            </div>
          )}

          {isEditing ? (
            <>
              {isLoading ? (
                <div className="text-center py-8 text-gray-500">Loading industries...</div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {allIndustries.map((industry) => {
                    const isSelected = selectedIds.includes(industry.id);
                    return (
                      <button
                        key={industry.id}
                        onClick={() => handleToggle(industry.id)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                          isSelected
                            ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                            : "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                        {industry.name}
                      </button>
                    );
                  })}
                </div>
              )}
              <div className="mt-4 flex gap-3 justify-end">
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 text-sm font-medium disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Save"}
                </button>
              </div>
            </>
          ) : industries.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {industries.map((industry) => (
                <span
                  key={industry.id}
                  className="px-3 py-1.5 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium"
                >
                  {industry.name}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
              No industries selected. Click Edit to add your preferences.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
