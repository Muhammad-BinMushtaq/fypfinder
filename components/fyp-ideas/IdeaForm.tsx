"use client"

import { useState } from "react"
import { AlertCircle, Loader2, Sparkles } from "lucide-react"
import type { IdeaInput } from "@/services/fypIdeas.service"

interface IdeaFormProps {
  onSubmit: (input: IdeaInput) => void
  isPending: boolean
  mode: "student" | "public"
  remainingToday?: number
}

const FIELD_LIMITS = {
  title: { min: 5, max: 200 },
  problemStatement: { min: 20, max: 500 },
  ideaDescription: { min: 50, max: 2000 },
  coreFeatures: { min: 20, max: 1000 },
} as const

export function IdeaForm({
  onSubmit,
  isPending,
  mode,
  remainingToday,
}: IdeaFormProps) {
  const [title, setTitle] = useState("")
  const [problemStatement, setProblemStatement] = useState("")
  const [ideaDescription, setIdeaDescription] = useState("")
  const [coreFeatures, setCoreFeatures] = useState("")
  const [teamSize, setTeamSize] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const nextErrors: Record<string, string> = {}

    if (title.trim().length < FIELD_LIMITS.title.min) {
      nextErrors.title = `Title must be at least ${FIELD_LIMITS.title.min} characters`
    } else if (title.trim().length > FIELD_LIMITS.title.max) {
      nextErrors.title = `Title must be at most ${FIELD_LIMITS.title.max} characters`
    }

    if (problemStatement.trim().length < FIELD_LIMITS.problemStatement.min) {
      nextErrors.problemStatement = `Problem statement must be at least ${FIELD_LIMITS.problemStatement.min} characters`
    } else if (problemStatement.trim().length > FIELD_LIMITS.problemStatement.max) {
      nextErrors.problemStatement = `Problem statement must be at most ${FIELD_LIMITS.problemStatement.max} characters`
    }

    if (ideaDescription.trim().length < FIELD_LIMITS.ideaDescription.min) {
      nextErrors.ideaDescription = `Description must be at least ${FIELD_LIMITS.ideaDescription.min} characters`
    } else if (ideaDescription.trim().length > FIELD_LIMITS.ideaDescription.max) {
      nextErrors.ideaDescription = `Description must be at most ${FIELD_LIMITS.ideaDescription.max} characters`
    }

    if (coreFeatures.trim().length < FIELD_LIMITS.coreFeatures.min) {
      nextErrors.coreFeatures = `Core features must be at least ${FIELD_LIMITS.coreFeatures.min} characters`
    } else if (coreFeatures.trim().length > FIELD_LIMITS.coreFeatures.max) {
      nextErrors.coreFeatures = `Core features must be at most ${FIELD_LIMITS.coreFeatures.max} characters`
    }

    if (
      teamSize &&
      (Number(teamSize) < 1 || Number(teamSize) > 6 || !Number.isInteger(Number(teamSize)))
    ) {
      nextErrors.teamSize = "Team size must be between 1 and 6"
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!validate()) {
      return
    }

    onSubmit({
      title: title.trim(),
      problemStatement: problemStatement.trim(),
      ideaDescription: ideaDescription.trim(),
      coreFeatures: coreFeatures.trim(),
      teamSize: teamSize ? Number(teamSize) : null,
    })
  }

  const studentLimitReached = mode === "student" && remainingToday === 0
  const canSubmit = !isPending && !studentLimitReached

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-orange-50 p-5 shadow-sm dark:border-amber-900/40 dark:from-slate-900 dark:via-slate-900 dark:to-amber-950/30">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-700 dark:border-amber-900/40 dark:bg-slate-900 dark:text-amber-300">
              <Sparkles className="h-3.5 w-3.5" />
              {mode === "student" ? "Full Student Report" : "Free Guest Preview"}
            </div>
            <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">
              {mode === "student"
                ? "You’ll get the full report, similarity check, and practical improvement plan."
                : "Guests can try one free preview per day. Sign up to unlock the full report and save your history."}
            </p>
          </div>

          {mode === "student" && typeof remainingToday === "number" && (
            <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-200">
              <div className="font-semibold">Remaining today</div>
              <div className="mt-0.5">{remainingToday} of 3 validations left</div>
            </div>
          )}
        </div>
      </div>

      {studentLimitReached && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>You’ve used all student validations for today. Come back tomorrow for another full check.</p>
        </div>
      )}

      <FieldBlock
        label="Project title"
        helper="A short name for your idea"
        error={errors.title}
        counter={`${title.length}/${FIELD_LIMITS.title.max}`}
      >
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Example: Smart campus bus tracking"
          maxLength={FIELD_LIMITS.title.max}
          className={inputClasses}
        />
      </FieldBlock>

      <FieldBlock
        label="What problem are you solving?"
        helper="Say what is frustrating or missing today"
        error={errors.problemStatement}
        counter={`${problemStatement.length}/${FIELD_LIMITS.problemStatement.max}`}
      >
        <textarea
          value={problemStatement}
          onChange={(event) => setProblemStatement(event.target.value)}
          placeholder="Students miss the bus because they do not know where it is right now."
          maxLength={FIELD_LIMITS.problemStatement.max}
          rows={3}
          className={textareaClasses}
        />
      </FieldBlock>

      <FieldBlock
        label="Explain the idea in simple words"
        helper="Describe what the system does and how people will use it"
        error={errors.ideaDescription}
        counter={`${ideaDescription.length}/${FIELD_LIMITS.ideaDescription.max}`}
      >
        <textarea
          value={ideaDescription}
          onChange={(event) => setIdeaDescription(event.target.value)}
          placeholder="It shows bus locations on a map, lets students set alerts, and helps the transport office manage routes."
          maxLength={FIELD_LIMITS.ideaDescription.max}
          rows={5}
          className={textareaClasses}
        />
      </FieldBlock>

      <FieldBlock
        label="Main features"
        helper="List the most important things the project should do"
        error={errors.coreFeatures}
        counter={`${coreFeatures.length}/${FIELD_LIMITS.coreFeatures.max}`}
      >
        <textarea
          value={coreFeatures}
          onChange={(event) => setCoreFeatures(event.target.value)}
          placeholder="Live bus map, ETA alerts, admin dashboard, route updates, delay notices"
          maxLength={FIELD_LIMITS.coreFeatures.max}
          rows={4}
          className={textareaClasses}
        />
      </FieldBlock>

      <FieldBlock
        label="Team size"
        helper="Optional, but helpful for judging the scope"
        error={errors.teamSize}
      >
        <select
          value={teamSize}
          onChange={(event) => setTeamSize(event.target.value)}
          className={inputClasses}
        >
          <option value="">Not sure yet</option>
          <option value="1">1 student</option>
          <option value="2">2 students</option>
          <option value="3">3 students</option>
          <option value="4">4 students</option>
          <option value="5">5 students</option>
          <option value="6">6 students</option>
        </select>
      </FieldBlock>

      <button
        type="submit"
        disabled={!canSubmit}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gray-900 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Checking your idea...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            {mode === "student" ? "Get Full Idea Review" : "Try Free Idea Preview"}
          </>
        )}
      </button>
    </form>
  )
}

function FieldBlock({
  label,
  helper,
  error,
  counter,
  children,
}: {
  label: string
  helper: string
  error?: string
  counter?: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <label className="text-sm font-semibold text-gray-900 dark:text-white">{label}</label>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{helper}</p>
        </div>
        {counter && <span className="text-xs text-gray-400 dark:text-gray-500">{counter}</span>}
      </div>
      {children}
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
    </div>
  )
}

const inputClasses =
  "w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-transparent focus:ring-2 focus:ring-amber-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"

const textareaClasses = `${inputClasses} resize-none`
