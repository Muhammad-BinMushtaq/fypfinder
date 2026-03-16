// components/fyp-ideas/IdeaForm.tsx
"use client"

import { useState } from "react"
import { Sparkles, Loader2, AlertCircle } from "lucide-react"
import type { IdeaInput } from "@/services/fypIdeas.service"

interface IdeaFormProps {
  onSubmit: (input: IdeaInput) => void
  isPending: boolean
  remainingToday: number
}

const FIELD_LIMITS = {
  title: { min: 5, max: 200 },
  problemStatement: { min: 20, max: 500 },
  ideaDescription: { min: 50, max: 2000 },
  coreFeatures: { min: 20, max: 1000 },
} as const

export function IdeaForm({ onSubmit, isPending, remainingToday }: IdeaFormProps) {
  const [title, setTitle] = useState("")
  const [problemStatement, setProblemStatement] = useState("")
  const [ideaDescription, setIdeaDescription] = useState("")
  const [coreFeatures, setCoreFeatures] = useState("")
  const [teamSize, setTeamSize] = useState<string>("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (title.trim().length < FIELD_LIMITS.title.min)
      newErrors.title = `Title must be at least ${FIELD_LIMITS.title.min} characters`
    if (title.trim().length > FIELD_LIMITS.title.max)
      newErrors.title = `Title must be at most ${FIELD_LIMITS.title.max} characters`

    if (problemStatement.trim().length < FIELD_LIMITS.problemStatement.min)
      newErrors.problemStatement = `Problem statement must be at least ${FIELD_LIMITS.problemStatement.min} characters`
    if (problemStatement.trim().length > FIELD_LIMITS.problemStatement.max)
      newErrors.problemStatement = `Problem statement must be at most ${FIELD_LIMITS.problemStatement.max} characters`

    if (ideaDescription.trim().length < FIELD_LIMITS.ideaDescription.min)
      newErrors.ideaDescription = `Description must be at least ${FIELD_LIMITS.ideaDescription.min} characters`
    if (ideaDescription.trim().length > FIELD_LIMITS.ideaDescription.max)
      newErrors.ideaDescription = `Description must be at most ${FIELD_LIMITS.ideaDescription.max} characters`

    if (coreFeatures.trim().length < FIELD_LIMITS.coreFeatures.min)
      newErrors.coreFeatures = `Core features must be at least ${FIELD_LIMITS.coreFeatures.min} characters`
    if (coreFeatures.trim().length > FIELD_LIMITS.coreFeatures.max)
      newErrors.coreFeatures = `Core features must be at most ${FIELD_LIMITS.coreFeatures.max} characters`

    if (teamSize && (Number(teamSize) < 1 || Number(teamSize) > 6 || !Number.isInteger(Number(teamSize))))
      newErrors.teamSize = "Team size must be 1-6"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    onSubmit({
      title: title.trim(),
      problemStatement: problemStatement.trim(),
      ideaDescription: ideaDescription.trim(),
      coreFeatures: coreFeatures.trim(),
      teamSize: teamSize ? Number(teamSize) : null,
    })
  }

  const canSubmit = remainingToday > 0 && !isPending

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Remaining count */}
      <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-sm text-blue-700 dark:text-blue-300">
            AI Validations Today
          </span>
        </div>
        <span className="text-sm font-bold text-blue-800 dark:text-blue-200">
          {remainingToday} of 3 remaining
        </span>
      </div>

      {remainingToday === 0 && (
        <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-amber-700 dark:text-amber-300">
            You&apos;ve used all validations for today. Come back tomorrow!
          </p>
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          FYP Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Smart Campus Navigation System"
          maxLength={FIELD_LIMITS.title.max}
          className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        />
        <div className="flex justify-between mt-1">
          {errors.title && (
            <p className="text-xs text-red-500">{errors.title}</p>
          )}
          <p className="text-xs text-gray-400 dark:text-gray-500 ml-auto">
            {title.length}/{FIELD_LIMITS.title.max}
          </p>
        </div>
      </div>

      {/* Problem Statement */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Problem Statement <span className="text-red-500">*</span>
        </label>
        <textarea
          value={problemStatement}
          onChange={(e) => setProblemStatement(e.target.value)}
          placeholder="What problem does your project solve? Who faces this problem?"
          maxLength={FIELD_LIMITS.problemStatement.max}
          rows={3}
          className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
        />
        <div className="flex justify-between mt-1">
          {errors.problemStatement && (
            <p className="text-xs text-red-500">{errors.problemStatement}</p>
          )}
          <p className="text-xs text-gray-400 dark:text-gray-500 ml-auto">
            {problemStatement.length}/{FIELD_LIMITS.problemStatement.max}
          </p>
        </div>
      </div>

      {/* Idea Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Idea Description <span className="text-red-500">*</span>
        </label>
        <textarea
          value={ideaDescription}
          onChange={(e) => setIdeaDescription(e.target.value)}
          placeholder="Describe your system in detail. What does it do? How does it work? What are the main components?"
          maxLength={FIELD_LIMITS.ideaDescription.max}
          rows={5}
          className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
        />
        <div className="flex justify-between mt-1">
          {errors.ideaDescription && (
            <p className="text-xs text-red-500">{errors.ideaDescription}</p>
          )}
          <p className="text-xs text-gray-400 dark:text-gray-500 ml-auto">
            {ideaDescription.length}/{FIELD_LIMITS.ideaDescription.max}
          </p>
        </div>
      </div>

      {/* Core Features */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Core Features <span className="text-red-500">*</span>
        </label>
        <textarea
          value={coreFeatures}
          onChange={(e) => setCoreFeatures(e.target.value)}
          placeholder="List the key functionalities. e.g., Real-time location tracking, Indoor navigation with AR, Room booking system, Smart notifications"
          maxLength={FIELD_LIMITS.coreFeatures.max}
          rows={4}
          className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
        />
        <div className="flex justify-between mt-1">
          {errors.coreFeatures && (
            <p className="text-xs text-red-500">{errors.coreFeatures}</p>
          )}
          <p className="text-xs text-gray-400 dark:text-gray-500 ml-auto">
            {coreFeatures.length}/{FIELD_LIMITS.coreFeatures.max}
          </p>
        </div>
      </div>

      {/* Team Size (Optional) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Team Size <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <select
          value={teamSize}
          onChange={(e) => setTeamSize(e.target.value)}
          className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        >
          <option value="">Not specified</option>
          <option value="1">1 student</option>
          <option value="2">2 students</option>
          <option value="3">3 students</option>
          <option value="4">4 students</option>
          <option value="5">5 students</option>
          <option value="6">6 students</option>
        </select>
        {errors.teamSize && (
          <p className="text-xs text-red-500 mt-1">{errors.teamSize}</p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
      >
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Analyzing your idea...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            Validate My Idea
          </>
        )}
      </button>
    </form>
  )
}
