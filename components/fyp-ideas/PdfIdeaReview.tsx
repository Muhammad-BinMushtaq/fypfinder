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
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <button
          type="button"
          onClick={onUploadAnother}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Upload a different document
        </button>

        <div className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-slate-800 bg-gray-50/70 dark:bg-slate-800/50 px-2.5 py-1 text-xs text-gray-600 dark:text-gray-300">
          <FileText className="h-3.5 w-3.5" />
          {result.pdf.pageCount} pages parsed
        </div>
      </div>

      {lowConfidenceItems.length > 0 && (
        <div className="flex items-start gap-2.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50/60 dark:bg-slate-800/40 p-3.5 text-xs text-gray-600 dark:text-gray-300">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
          <p>
            Please inspect low-confidence parsed fields: <span className="font-semibold text-gray-900 dark:text-white">{lowConfidenceItems.join(", ")}</span>.
          </p>
        </div>
      )}

      {/* Review Box */}
      <section className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-4 mb-6">
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white tracking-tight">
              Review Synthesized Proposal
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Verify or adapt the AI-extracted details before running formal validation
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <ReviewField
            label="Project Title"
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
            label="Problem Statement"
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
            label="Proposed Architecture & Description"
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
            label="Key Deliverables & Technology Stack"
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

          <ReviewField label="Estimated Team Capacity" confidence={1} error={errors.teamSize}>
            <select
              value={teamSize}
              onChange={(event) => setTeamSize(event.target.value)}
              className={inputClasses}
            >
              <option value="">Unspecified</option>
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

        <div className="mt-8 pt-5 border-t border-gray-100 dark:border-slate-800">
          <button
            type="button"
            onClick={handleValidateEdited}
            disabled={isPending}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 dark:bg-white px-5 py-2.5 text-xs font-semibold text-white dark:text-gray-900 transition hover:bg-gray-800 dark:hover:bg-gray-100 shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Validating Edited Proposal...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Validate Synthesized Proposal
              </>
            )}
          </button>
        </div>
      </section>

      {validation ? (
        <ValidationResult
          result={validation}
          onReset={onUploadAnother}
          remainingToday={remainingToday}
        />
      ) : (
        <div className="rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/40 p-4 text-xs text-gray-500 dark:text-gray-400 text-center">
          Document parsed. Complete missing fields above to trigger full scoring and novelty checks.
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
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-gray-900 dark:text-white">{label}</label>
          <span
            className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${
              isLow
                ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                : "bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-gray-400"
            }`}
          >
            {Math.round(confidence * 100)}% Match
          </span>
        </div>
        {counter && <span className="text-[11px] text-gray-400 dark:text-gray-500">{counter}</span>}
      </div>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
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
    <details className="mt-5 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/30 p-3.5">
      <summary className="cursor-pointer text-xs font-medium text-gray-700 dark:text-gray-300">
        Additional Extracted Metadata ({items.length} fields)
      </summary>
      <div className="mt-3 grid gap-2.5 sm:grid-cols-2 text-xs">
        {items.map(([label, value, itemConfidence]) => (
          <div key={label} className="rounded-lg border border-gray-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5">
            <div className="flex items-center justify-between text-gray-400 dark:text-gray-500 mb-1">
              <span className="font-medium text-gray-700 dark:text-gray-300">{label}</span>
              <span className="text-[10px]">{Math.round(Number(itemConfidence) * 100)}%</span>
            </div>
            <p className="text-gray-900 dark:text-white leading-relaxed">{value}</p>
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
  "w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50/40 dark:bg-slate-800/40 px-3.5 py-2.5 text-sm text-gray-900 dark:text-white outline-none transition focus:border-gray-900 dark:focus:border-white focus:bg-white dark:focus:bg-slate-900 placeholder:text-gray-400 dark:placeholder:text-gray-500"

const textareaClasses = `${inputClasses} resize-none`
