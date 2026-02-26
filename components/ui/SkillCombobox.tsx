// components/ui/SkillCombobox.tsx
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Search, X, Plus, Check } from "lucide-react";
import { searchSkills, POPULAR_SKILLS, isPreDefinedSkill, normalizeSkillName, SKILLS_BY_CATEGORY, type SkillOption } from "@/lib/skills";

interface SkillComboboxProps {
  value: string;
  onChange: (value: string) => void;
  existingSkills?: string[];
  placeholder?: string;
  autoFocus?: boolean;
}

export function SkillCombobox({
  value,
  onChange,
  existingSkills = [],
  placeholder = "Search for a skill...",
  autoFocus = false,
}: SkillComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Get suggestions based on query
  const suggestions = query.trim()
    ? searchSkills(query, 8).filter(
        (s) => !existingSkills.some((e) => e.toLowerCase() === s.label.toLowerCase())
      )
    : [];

  // Popular skills not already added
  const availablePopular = POPULAR_SKILLS.filter(
    (s) => !existingSkills.some((e) => e.toLowerCase() === s.toLowerCase())
  ).slice(0, 6);

  // Check if query is a custom skill (not in predefined list)
  const isCustomSkill = query.trim() && !isPreDefinedSkill(query) && 
    !existingSkills.some((e) => e.toLowerCase() === query.toLowerCase().trim());

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQuery(newValue);
    onChange(newValue);
    setIsOpen(true);
    setHighlightedIndex(0);
  };

  // Handle skill selection
  const handleSelect = useCallback((skillName: string) => {
    const normalized = normalizeSkillName(skillName);
    setQuery(normalized);
    onChange(normalized);
    setIsOpen(false);
  }, [onChange]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const totalItems = suggestions.length + (isCustomSkill ? 1 : 0);

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev + 1) % Math.max(totalItems, 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev - 1 + Math.max(totalItems, 1)) % Math.max(totalItems, 1));
        break;
      case "Enter":
        e.preventDefault();
        if (suggestions.length > 0 && highlightedIndex < suggestions.length) {
          handleSelect(suggestions[highlightedIndex].label);
        } else if (isCustomSkill) {
          handleSelect(query.trim());
        }
        break;
      case "Escape":
        setIsOpen(false);
        break;
    }
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(e.target as Node) &&
        listRef.current &&
        !listRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Scroll highlighted item into view
  useEffect(() => {
    if (isOpen && listRef.current) {
      const highlighted = listRef.current.querySelector('[data-highlighted="true"]');
      highlighted?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIndex, isOpen]);

  return (
    <div className="relative">
      {/* Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-gray-400 dark:focus:ring-slate-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              onChange("");
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={listRef}
          className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg shadow-lg max-h-72 overflow-y-auto"
        >
          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="p-2">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 mb-1">
                Suggestions
              </p>
              {suggestions.map((skill, index) => (
                <button
                  key={skill.value}
                  type="button"
                  data-highlighted={index === highlightedIndex}
                  onClick={() => handleSelect(skill.label)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-left text-sm transition-colors ${
                    index === highlightedIndex
                      ? "bg-gray-100 dark:bg-slate-700"
                      : "hover:bg-gray-50 dark:hover:bg-slate-700/50"
                  }`}
                >
                  <span className="text-gray-900 dark:text-white">{skill.label}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {skill.category}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Custom skill option */}
          {isCustomSkill && (
            <div className="p-2 border-t border-gray-100 dark:border-slate-700">
              <button
                type="button"
                data-highlighted={highlightedIndex === suggestions.length}
                onClick={() => handleSelect(query.trim())}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-left text-sm transition-colors ${
                  highlightedIndex === suggestions.length
                    ? "bg-gray-100 dark:bg-slate-700"
                    : "hover:bg-gray-50 dark:hover:bg-slate-700/50"
                }`}
              >
                <Plus className="w-4 h-4 text-gray-500" />
                <span className="text-gray-900 dark:text-white">
                  Add &quot;{query.trim()}&quot; as custom skill
                </span>
              </button>
            </div>
          )}

          {/* Popular skills (when no query) */}
          {!query.trim() && availablePopular.length > 0 && (
            <div className="p-2">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 mb-2">
                Popular Skills
              </p>
              <div className="flex flex-wrap gap-2 px-2">
                {availablePopular.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => handleSelect(skill)}
                    className="px-3 py-1.5 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 text-sm rounded-full hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* No results */}
          {query.trim() && suggestions.length === 0 && !isCustomSkill && (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
              Skill already added or no matches found
            </div>
          )}

          {/* Empty state - encourage typing */}
          {!query.trim() && availablePopular.length === 0 && (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
              Start typing to search skills
            </div>
          )}
        </div>
      )}
    </div>
  );
}
