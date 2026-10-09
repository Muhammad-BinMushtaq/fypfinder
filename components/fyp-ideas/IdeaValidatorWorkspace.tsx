"use client"

import { useEffect, useState } from "react"
import { CheckCircle2, ChevronDown, ChevronUp, Clock3, FileText, History, Loader2, PencilLine, Sparkles, XCircle, Trash2 } from "lucide-react"
import { useExtractPdfIdea, useMyValidations, useValidateIdea, useDeleteValidation } from "@/hooks/fyp-ideas"
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
  "Analyzing your project idea",
  "Benchmarking against past PAF-IAST projects",
  "Synthesizing recommendations & feasibility report",
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
  const [restoredDraft, setRestoredDraft] = useState<IdeaInput | null>(null)

  useEffect(() => {
    if (mode === "student") {
      try {
        const saved = sessionStorage.getItem("pending_fyp_idea")
        if (saved) {
          const parsed = JSON.parse(saved) as IdeaInput
          if (parsed && parsed.title && parsed.problemStatement) {
            sessionStorage.removeItem("pending_fyp_idea")
            setRestoredDraft(parsed)
          }
        }
      } catch {
        // ignore storage errors
      }
    }
  }, [mode])

  const { validate, isPending } = useValidateIdea()
  const { extractPdf, isPending: isExtractingPdf } = useExtractPdfIdea()
  const {
    validations,
    remainingToday,
    isLoading: historyLoading,
  } = useMyValidations(10, 0, mode === "student")

  const handleSubmit = (input: IdeaInput) => {
    if (mode === "public") {
      try {
        sessionStorage.setItem("pending_fyp_idea", JSON.stringify(input))
      } catch {
        // ignore storage errors
      }
    }

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
    <div className="min-h-screen bg-white dark:bg-slate-900 relative text-gray-900 dark:text-white">
      {/* Subtle Grid Background - identical to homepage */}
      <div 
        className="fixed inset-0 bg-[linear-gradient(to_right,#e5e5e5_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e5_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:64px_64px] opacity-40 dark:opacity-100 pointer-events-none" 
        style={{ zIndex: 0 }} 
      />

      <div className="relative z-10 mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        <Hero mode={mode} />

        {/* Loading state */}
        <div className={isBusy ? "block" : "hidden"}>
          <LoadingState />
        </div>

        {/* Completed manual result */}
        <div className={!isBusy && activeResult ? "block" : "hidden"}>
          {activeResult && (
            <ValidationResult
              result={activeResult}
              onReset={() => setActiveResult(null)}
              remainingToday={mode === "student" ? remainingToday : undefined}
            />
          )}
        </div>

        {/* Completed or extracted PDF result */}
        <div className={!isBusy && !activeResult && pdfResult ? "block" : "hidden"}>
          {pdfResult && (
            <PdfIdeaReview
              result={pdfResult}
              validation={pdfValidation}
              isPending={isPending}
              remainingToday={mode === "student" ? remainingToday : undefined}
              onValidateEdited={handlePdfEditedSubmit}
              onUploadAnother={resetPdfFlow}
            />
          )}
        </div>

        {/* Main interactive form container - preserved via hidden to prevent reset */}
        <div className={isBusy || activeResult || pdfResult ? "hidden" : "block"}>
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
              initialValues={restoredDraft ?? undefined}
            />
          )}
        </div>

        {/* History drawer */}
        {mode === "student" && !isBusy && !activeResult && !pdfResult && validations.length > 0 && (
          <div className="mt-10 rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 p-5 shadow-sm">
            <button
              onClick={() => setHistoryOpen((value) => !value)}
              className="flex w-full items-center justify-between gap-3 text-left"
            >
              <div className="flex items-center gap-2.5 text-sm font-semibold text-gray-900 dark:text-white">
                <History className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                Previous Validations
                <span className="ml-1 text-xs font-normal text-gray-500 dark:text-gray-400">
                  ({validations.length})
                </span>
              </div>
              {historyOpen ? (
                <ChevronUp className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              )}
            </button>

            {historyOpen && (
              <div className="mt-4 space-y-2.5 pt-3 border-t border-gray-100 dark:border-slate-700/60">
                {historyLoading ? (
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 py-3">
                    <Clock3 className="h-4 w-4 animate-spin text-gray-400" />
                    Loading previous checks...
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
    <div className="mb-6 flex justify-center">
      <div className="inline-flex p-1 bg-gray-100 dark:bg-slate-800 rounded-xl border border-gray-200/60 dark:border-slate-700/60">
        <button
          type="button"
          onClick={() => onChange("manual")}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
            value === "manual"
              ? "bg-white dark:bg-slate-900 text-gray-900 dark:text-white shadow-sm"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          <PencilLine className="h-3.5 w-3.5" />
          Form
        </button>
        <button
          type="button"
          onClick={() => onChange("pdf")}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
            value === "pdf"
              ? "bg-white dark:bg-slate-900 text-gray-900 dark:text-white shadow-sm"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          <FileText className="h-3.5 w-3.5" />
          Upload PDF
        </button>
      </div>
    </div>
  )
}

function Hero({ mode }: { mode: "student" | "public" }) {
  return (
    <div className="mb-8 text-center">
      {/* Minimalist Badge matching Homepage */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-full mb-4">
        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
        <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
          {mode === "student" ? "AI Idea Validation Engine" : "Free Public Preview"}
        </span>
      </div>

      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
        {mode === "student"
          ? "Validate & Refine Your FYP Idea"
          : "Test Your FYP Idea Instantly"}
      </h1>

      <p className="mt-3 text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-xl mx-auto leading-relaxed">
        {mode === "student"
          ? "Benchmark against past PAF-IAST repositories, detect overlap, and obtain an actionable implementation roadmap."
          : "Describe your concept in plain terms for an instantaneous analysis and feasibility preview."}
      </p>
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
    <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-10 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white">
        <Loader2 className="h-6 w-6 animate-spin text-gray-900 dark:text-white" />
      </div>
      <h2 className="mt-5 text-lg font-semibold text-gray-900 dark:text-white tracking-tight">
        {STAGE_LABELS[stageIndex]}
      </h2>
      <p className="mt-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
        Comparing historical abstracts, architecture novelty, and feasibility metrics...
      </p>

      {/* Clean stage indicators */}
      <div className="mt-6 flex items-center justify-center gap-2">
        {STAGE_LABELS.map((_, index) => (
          <span
            key={index}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === stageIndex
                ? "w-8 bg-gray-900 dark:bg-white"
                : index < stageIndex
                ? "w-2 bg-emerald-500"
                : "w-2 bg-gray-200 dark:bg-slate-700"
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
  const deleteMutation = useDeleteValidation()

  return (
    <div
      onClick={() => isCompleted && onSelect(item)}
      className={`group w-full rounded-xl border p-3.5 text-left transition-all ${
        isCompleted
          ? "border-gray-200 dark:border-slate-700/80 bg-gray-50/50 dark:bg-slate-900/40 hover:bg-gray-100/70 dark:hover:bg-slate-800/80 cursor-pointer"
          : "border-red-200 dark:border-red-900/40 bg-red-50/30 dark:bg-red-950/20 text-red-800 dark:text-red-300 opacity-70"
      }`}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {isCompleted ? (
            <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
          ) : (
            <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
          )}
          <div className="flex-1 min-w-0 pr-2">
            <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
              {item.report?.plainSummary || (isCompleted ? "Idea validation result" : "Validation failed")}
            </p>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              {date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
          {isCompleted && item.originalityScore != null && (
            <div className="rounded-md bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 px-2.5 py-1 text-xs font-medium text-gray-700 dark:text-gray-300">
              Freshness: {item.originalityScore}/10
            </div>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation()
              if (confirm("Are you sure you want to delete this validation?")) {
                deleteMutation.mutate(item.id)
              }
            }}
            disabled={deleteMutation.isPending}
            className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50"
            title="Delete Validation"
          >
            {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  )
}
