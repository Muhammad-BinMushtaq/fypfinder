"use client"

import { useEffect, useState } from "react"
import { CheckCircle2, ChevronDown, ChevronUp, Clock3, FileText, History, PencilLine, Sparkles, XCircle } from "lucide-react"
import { useExtractPdfIdea, useMyValidations, useValidateIdea } from "@/hooks/fyp-ideas"
import { ValidatorWizard } from "./ValidatorWizard"
import { PdfIdeaReview } from "./PdfIdeaReview"
import { PdfIdeaUpload } from "./PdfIdeaUpload"
import { ValidationResult } from "./ValidationResult"
import type {
  IdeaInput,
  PdfIdeaExtractionResponse,
  ValidationResult as ValidationResultType,
} from "@/services/fypIdeas.service"

const STAGE_LABELS = [
  "Reading your idea",
  "Comparing it with past FYP projects",
  "Writing your easy-to-read report",
] as const

interface IdeaValidatorWorkspaceProps {
  mode: "student" | "public"
}

export function IdeaValidatorWorkspace({ mode }: IdeaValidatorWorkspaceProps) {
  const [submissionMethod, setSubmissionMethod] = useState<"manual" | "pdf">("manual")
  const [activeResult, setActiveResult] = useState<ValidationResultType | null>(null)
  const [pdfResult, setPdfResult] = useState<PdfIdeaExtractionResponse | null>(null)
  const [pdfValidation, setPdfValidation] = useState<ValidationResultType | null>(null)
  const [historyOpen, setHistoryOpen] = useState(false)

  const { validate, isPending } = useValidateIdea()
  const { extractPdf, isPending: isExtractingPdf } = useExtractPdfIdea()
  const {
    validations,
    remainingToday,
    isLoading: historyLoading,
  } = useMyValidations(10, 0, mode === "student")

  const handleSubmit = (input: IdeaInput) => {
    validate(input, {
      onSuccess: (result) => {
        setActiveResult(result)
      },
    })
  }

  const handlePdfUpload = (file: File) => {
    extractPdf(file, {
      onSuccess: (result) => {
        setPdfResult(result)
        setPdfValidation(result.validation)
      },
    })
  }

  const handlePdfEditedSubmit = (input: IdeaInput) => {
    validate(input, {
      onSuccess: (result) => {
        setPdfValidation(result)
      },
    })
  }

  const resetPdfFlow = () => {
    setPdfResult(null)
    setPdfValidation(null)
  }

  const isBusy = isPending || isExtractingPdf

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.15),transparent_35%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_28%)] bg-white dark:bg-slate-950">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
        <Hero mode={mode} />

        {isBusy ? (
          <LoadingState />
        ) : activeResult ? (
          <ValidationResult
            result={activeResult}
            onReset={() => setActiveResult(null)}
            remainingToday={mode === "student" ? remainingToday : undefined}
          />
        ) : pdfResult ? (
          <PdfIdeaReview
            result={pdfResult}
            validation={pdfValidation}
            isPending={isPending}
            remainingToday={mode === "student" ? remainingToday : undefined}
            onValidateEdited={handlePdfEditedSubmit}
            onUploadAnother={resetPdfFlow}
          />
        ) : (
          <>
            {mode === "student" && (
              <SubmissionMethodSelector
                value={submissionMethod}
                onChange={setSubmissionMethod}
              />
            )}

            {submissionMethod === "pdf" && mode === "student" ? (
              <PdfIdeaUpload
                onUpload={handlePdfUpload}
                isPending={isExtractingPdf}
                remainingToday={remainingToday}
              />
            ) : (
          <ValidatorWizard
            onSubmit={handleSubmit}
            isPending={isPending}
            mode={mode}
            remainingToday={mode === "student" ? remainingToday : undefined}
          />
            )}
          </>
        )}

        {mode === "student" && !isBusy && !activeResult && !pdfResult && validations.length > 0 && (
          <div className="mt-8 rounded-[28px] border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <button
              onClick={() => setHistoryOpen((value) => !value)}
              className="flex w-full items-center justify-between gap-3 text-left"
            >
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                <History className="h-4 w-4 text-amber-500" />
                Previous idea checks
              </div>
              {historyOpen ? (
                <ChevronUp className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              )}
            </button>

            {historyOpen && (
              <div className="mt-4 space-y-3">
                {historyLoading ? (
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Clock3 className="h-4 w-4 animate-spin" />
                    Loading your previous checks...
                  </div>
                ) : (
                  validations.map((item) => (
                    <HistoryItem key={item.id} item={item} onSelect={setActiveResult} />
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function SubmissionMethodSelector({
  value,
  onChange,
}: {
  value: "manual" | "pdf"
  onChange: (value: "manual" | "pdf") => void
}) {
  return (
    <div className="mb-6 rounded-3xl border border-gray-200 bg-white p-2 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onChange("manual")}
          className={`flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
            value === "manual"
              ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
              : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-slate-800"
          }`}
        >
          <PencilLine className="h-4 w-4" />
          Manual Form
        </button>
        <button
          type="button"
          onClick={() => onChange("pdf")}
          className={`flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
            value === "pdf"
              ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
              : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-slate-800"
          }`}
        >
          <FileText className="h-4 w-4" />
          Upload PDF
        </button>
      </div>
    </div>
  )
}

function Hero({ mode }: { mode: "student" | "public" }) {
  return (
    <div className="mb-8 rounded-[32px] border border-gray-200 bg-white/85 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/85 sm:p-8">
      <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300">
        <Sparkles className="h-3.5 w-3.5" />
        AI Idea Validator
      </div>

      <div className="mt-4 max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-gray-950 dark:text-white sm:text-4xl">
          {mode === "student"
            ? "Check if your FYP idea is clear, useful, and still fresh"
            : "Try one free FYP idea check before you sign up"}
        </h1>
        <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300 sm:text-base">
          {mode === "student"
            ? "We compare your idea with past FYP projects, explain what feels strong, point out what feels repeated, and suggest simple ways to make the idea stand out."
            : "Write your idea in simple words and get a quick preview. If you sign up, you unlock the full roadmap, deeper suggestions, and saved history."}
        </p>
      </div>
    </div>
  )
}

function LoadingState() {
  const [stageIndex, setStageIndex] = useState(0)

  useEffect(() => {
    const timers = [
      setTimeout(() => setStageIndex(1), 3500),
      setTimeout(() => setStageIndex(2), 7500),
    ]

    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div className="rounded-[32px] border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-4 border-amber-100 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-950/30">
        <Sparkles className="h-8 w-8 animate-pulse text-amber-500" />
      </div>
      <h2 className="mt-5 text-xl font-semibold text-gray-950 dark:text-white">
        {STAGE_LABELS[stageIndex]}
      </h2>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        This usually takes around 10 to 20 seconds.
      </p>

      <div className="mt-6 flex items-center justify-center gap-2">
        {STAGE_LABELS.map((_, index) => (
          <span
            key={index}
            className={`h-2.5 w-2.5 rounded-full ${
              index <= stageIndex
                ? "bg-amber-500"
                : "bg-gray-200 dark:bg-slate-700"
            }`}
          />
        ))}
      </div>
    </div>
  )
}

function HistoryItem({
  item,
  onSelect,
}: {
  item: ValidationResultType
  onSelect: (item: ValidationResultType) => void
}) {
  const isCompleted = item.status === "completed"
  const date = new Date(item.createdAt)

  return (
    <button
      onClick={() => isCompleted && onSelect(item)}
      disabled={!isCompleted}
      className={`w-full rounded-2xl border p-4 text-left transition ${
        isCompleted
          ? "border-gray-200 bg-gray-50 hover:bg-gray-100 dark:border-slate-800 dark:bg-slate-950/40 dark:hover:bg-slate-950"
          : "border-red-200 bg-red-50 text-red-800 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-200"
      }`}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          {isCompleted ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
          ) : (
            <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
          )}
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {item.report?.plainSummary || "Idea validation result"}
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {date.toLocaleDateString()}
            </p>
          </div>
        </div>

        {isCompleted && item.originalityScore != null && (
          <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-700 shadow-sm dark:bg-slate-900 dark:text-gray-200">
            Freshness {item.originalityScore}/10
          </div>
        )}
      </div>
    </button>
  )
}
