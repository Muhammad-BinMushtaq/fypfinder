"use client"

import { useState } from "react"
import { AlertCircle, FileText, Loader2, RefreshCw, RotateCcw } from "lucide-react"
import type {
  ExtractedPdfIdeaConfidence,
  ExtractedPdfIdeaFields,
  IdeaInput,
  PdfIdeaExtractionResponse,
  ValidationResult as ValidationResultType,
} from "@/services/fypIdeas.service"
import { ValidationResult } from "./ValidationResult"

interface PdfIdeaReviewProps {
  result: PdfIdeaExtractionResponse
  validation: ValidationResultType | null
  isPending: boolean
  remainingToday?: number
  onValidateEdited: (input: IdeaInput) => void
  onUploadAnother: () => void
}

const FIELD_LIMITS = {
  title: { min: 5, max: 200 },
  problemStatement: { min: 20, max: 500 },
  ideaDescription: { min: 50, max: 2000 },
  coreFeatures: { min: 20, max: 1000 },
} as const

export function PdfIdeaReview({
  result,
  validation,
  isPending,
  remainingToday,
  onValidateEdited,
  onUploadAnother,
}: PdfIdeaReviewProps) {
  const initial = result.draft ?? buildDraftFromExtracted(result.extracted)
  const [title, setTitle] = useState(initial.title)
  const [problemStatement, setProblemStatement] = useState(initial.problemStatement)
  const [ideaDescription, setIdeaDescription] = useState(initial.ideaDescription)
  const [coreFeatures, setCoreFeatures] = useState(initial.coreFeatures)
  const [teamSize, setTeamSize] = useState(initial.teamSize ? String(initial.teamSize) : "")
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const nextErrors: Record<string, string> = {}

    if (title.trim().length < FIELD_LIMITS.title.min) {
      nextErrors.title = `Title must be at least ${FIELD_LIMITS.title.min} characters`
    }
    if (problemStatement.trim().length < FIELD_LIMITS.problemStatement.min) {
      nextErrors.problemStatement = `Problem statement must be at least ${FIELD_LIMITS.problemStatement.min} characters`
    }
    if (ideaDescription.trim().length < FIELD_LIMITS.ideaDescription.min) {
      nextErrors.ideaDescription = `Description must be at least ${FIELD_LIMITS.ideaDescription.min} characters`
    }
    if (coreFeatures.trim().length < FIELD_LIMITS.coreFeatures.min) {
      nextErrors.coreFeatures = `Core features must be at least ${FIELD_LIMITS.coreFeatures.min} characters`
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

  const handleValidateEdited = () => {
    if (!validateForm()) {
      return
    }

    onValidateEdited({
      title: title.trim(),
      problemStatement: problemStatement.trim(),
      ideaDescription: ideaDescription.trim(),
      coreFeatures: coreFeatures.trim(),
      teamSize: teamSize ? Number(teamSize) : null,
    })
  }

  const lowConfidenceItems = getLowConfidenceItems(result.confidence)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={onUploadAnother}
          className="inline-flex w-fit items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          <RotateCcw className="h-4 w-4" />
          Upload another PDF
        </button>

        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-200">
          <FileText className="h-3.5 w-3.5" />
          {result.pdf.pageCount} pages processed
        </div>
      </div>

      {lowConfidenceItems.length > 0 && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Please verify low-confidence fields: {lowConfidenceItems.join(", ")}.
          </p>
        </div>
      )}

      <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-950 dark:text-white">
          <FileText className="h-4 w-4 text-blue-600 dark:text-blue-300" />
          Editable extracted idea
        </div>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          AI filled these fields from the PDF. You can change everything before running the final review again.
        </p>

        <div className="mt-5 space-y-4">
          <ReviewField
            label="Project title"
            confidence={result.confidence.title}
            error={errors.title}
            counter={`${title.length}/${FIELD_LIMITS.title.max}`}
          >
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={FIELD_LIMITS.title.max}
              className={inputClasses}
            />
          </ReviewField>

          <ReviewField
            label="Problem statement"
            confidence={result.confidence.problemStatement}
            error={errors.problemStatement}
            counter={`${problemStatement.length}/${FIELD_LIMITS.problemStatement.max}`}
          >
            <textarea
              value={problemStatement}
              onChange={(event) => setProblemStatement(event.target.value)}
              maxLength={FIELD_LIMITS.problemStatement.max}
              rows={3}
              className={textareaClasses}
            />
          </ReviewField>

          <ReviewField
            label="Description"
            confidence={result.confidence.description}
            error={errors.ideaDescription}
            counter={`${ideaDescription.length}/${FIELD_LIMITS.ideaDescription.max}`}
          >
            <textarea
              value={ideaDescription}
              onChange={(event) => setIdeaDescription(event.target.value)}
              maxLength={FIELD_LIMITS.ideaDescription.max}
              rows={5}
              className={textareaClasses}
            />
          </ReviewField>

          <ReviewField
            label="Tech stack and main features"
            confidence={Math.max(
              result.confidence.techStack,
              result.confidence.technologies,
              result.confidence.proposedSolution
            )}
            error={errors.coreFeatures}
            counter={`${coreFeatures.length}/${FIELD_LIMITS.coreFeatures.max}`}
          >
            <textarea
              value={coreFeatures}
              onChange={(event) => setCoreFeatures(event.target.value)}
              maxLength={FIELD_LIMITS.coreFeatures.max}
              rows={4}
              className={textareaClasses}
            />
          </ReviewField>

          <ReviewField label="Team size" confidence={1} error={errors.teamSize}>
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
          </ReviewField>
        </div>

        <ExtractedDetails extracted={result.extracted} confidence={result.confidence} />

        <button
          type="button"
          onClick={handleValidateEdited}
          disabled={isPending}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gray-900 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Checking edited idea...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              Re-check Edited Idea
            </>
          )}
        </button>
      </section>

      {validation ? (
        <ValidationResult
          result={validation}
          onReset={onUploadAnother}
          remainingToday={remainingToday}
        />
      ) : (
        <div className="rounded-2xl border border-dashed border-amber-300 bg-amber-50 p-5 text-sm text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/10 dark:text-amber-200">
          The PDF was extracted, but it did not contain enough structured detail to run validation. Complete the fields above and re-check the idea.
        </div>
      )}
    </div>
  )
}

function ReviewField({
  label,
  confidence,
  error,
  counter,
  children,
}: {
  label: string
  confidence: number
  error?: string
  counter?: string
  children: React.ReactNode
}) {
  const isLow = confidence < 0.7

  return (
    <div className={`rounded-2xl border p-4 ${isLow ? "border-amber-200 bg-amber-50/60 dark:border-amber-900/40 dark:bg-amber-950/10" : "border-gray-200 bg-gray-50 dark:border-slate-800 dark:bg-slate-950/40"}`}>
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <label className="text-sm font-semibold text-gray-900 dark:text-white">{label}</label>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${isLow ? "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-200" : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200"}`}>
              Confidence {Math.round(confidence * 100)}%
            </span>
            {isLow && (
              <span className="text-xs font-medium text-amber-700 dark:text-amber-200">
                Verify
              </span>
            )}
          </div>
        </div>
        {counter && <span className="text-xs text-gray-400 dark:text-gray-500">{counter}</span>}
      </div>
      {children}
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
    </div>
  )
}

function ExtractedDetails({
  extracted,
  confidence,
}: {
  extracted: ExtractedPdfIdeaFields
  confidence: ExtractedPdfIdeaConfidence
}) {
  const items = [
    ["Department", extracted.department, confidence.department],
    ["Domain", extracted.domain, confidence.domain],
    ["Category", extracted.category, confidence.category],
    ["AI usage", extracted.aiUsage, confidence.aiUsage],
    ["Novelty", extracted.novelty, confidence.novelty],
    ["Innovation", extracted.innovation, confidence.innovation],
    ["Market gap", extracted.marketGap, confidence.marketGap],
    ["Scope", extracted.scope, confidence.scope],
    ["Future expansion", extracted.futureExpansion, confidence.futureExpansion],
    ["Target users", extracted.targetUsers.join(", "), confidence.targetUsers],
    ["APIs", extracted.apis.join(", "), confidence.apis],
    ["Platforms", extracted.platforms.join(", "), confidence.platforms],
  ].filter(([, value]) => String(value).trim().length > 0)

  if (items.length === 0) {
    return null
  }

  return (
    <details className="mt-5 rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
      <summary className="cursor-pointer text-sm font-semibold text-gray-900 dark:text-white">
        Additional extracted fields
      </summary>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {items.map(([label, value, itemConfidence]) => (
          <div key={label} className="rounded-xl bg-white p-3 text-sm dark:bg-slate-900">
            <div className="flex items-start justify-between gap-3">
              <div className="font-semibold text-gray-900 dark:text-white">{label}</div>
              <div className="shrink-0 text-xs text-gray-500 dark:text-gray-400">
                {Math.round(Number(itemConfidence) * 100)}%
              </div>
            </div>
            <p className="mt-2 leading-6 text-gray-700 dark:text-gray-300">{value}</p>
          </div>
        ))}
      </div>
    </details>
  )
}

function getLowConfidenceItems(confidence: ExtractedPdfIdeaConfidence): string[] {
  return Object.entries(confidence)
    .filter(([, value]) => value > 0 && value < 0.7)
    .map(([key]) => fieldLabel(key))
    .slice(0, 6)
}

function fieldLabel(key: string): string {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase())
}

function buildDraftFromExtracted(extracted: ExtractedPdfIdeaFields): IdeaInput {
  return {
    title: extracted.title,
    problemStatement: extracted.problemStatement,
    ideaDescription: extracted.description || extracted.projectSummary,
    coreFeatures: [
      extracted.proposedSolution && `Solution: ${extracted.proposedSolution}`,
      extracted.techStack.length > 0 && `Tech stack: ${extracted.techStack.join(", ")}`,
      extracted.technologies.length > 0 && `Technologies: ${extracted.technologies.join(", ")}`,
      extracted.objectives.length > 0 && `Objectives: ${extracted.objectives.join(", ")}`,
    ]
      .filter(Boolean)
      .join("\n"),
    teamSize: null,
  }
}

const inputClasses =
  "w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-transparent focus:ring-2 focus:ring-amber-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"

const textareaClasses = `${inputClasses} resize-none`

