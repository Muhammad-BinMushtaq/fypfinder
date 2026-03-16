// app/dashboard/fyp-ideas/validate/page.tsx
"use client"

import { useState } from "react"
import { Sparkles, History, ChevronDown, ChevronUp, Clock, CheckCircle, XCircle } from "lucide-react"
import { useValidateIdea, useMyValidations } from "@/hooks/fyp-ideas"
import { IdeaForm } from "@/components/fyp-ideas/IdeaForm"
import { ValidationResult } from "@/components/fyp-ideas/ValidationResult"
import type { IdeaInput, ValidationResult as ValidationResultType } from "@/services/fypIdeas.service"

const STAGE_LABELS = [
  "Analyzing your idea...",
  "Running multi-perspective evaluation...",
  "Synthesizing final report...",
]

function LoadingOverlay() {
  const [stageIndex, setStageIndex] = useState(0)

  // Cycle through stages
  useState(() => {
    const timers = [
      setTimeout(() => setStageIndex(1), 4000),
      setTimeout(() => setStageIndex(2), 10000),
    ]
    return () => timers.forEach(clearTimeout)
  })

  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-6">
      {/* Animated spinner */}
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-4 border-gray-200 dark:border-slate-700" />
        <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-t-blue-500 dark:border-t-blue-400 animate-spin" />
        <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-blue-500 dark:text-blue-400" />
      </div>

      {/* Stage labels */}
      <div className="text-center space-y-2">
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          {STAGE_LABELS[stageIndex]}
        </p>
        <div className="flex items-center justify-center gap-1.5">
          {STAGE_LABELS.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                i <= stageIndex
                  ? "bg-blue-500 dark:bg-blue-400"
                  : "bg-gray-200 dark:bg-slate-700"
              }`}
            />
          ))}
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          This may take 10-20 seconds
        </p>
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
  const date = new Date(item.createdAt)
  const isCompleted = item.status === "completed"

  return (
    <button
      onClick={() => isCompleted && onSelect(item)}
      disabled={!isCompleted}
      className={`w-full text-left p-3 rounded-lg border transition-colors ${
        isCompleted
          ? "border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer"
          : "border-red-200 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10 cursor-not-allowed opacity-60"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {isCompleted ? (
            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
          ) : (
            <XCircle className="w-4 h-4 text-red-500 shrink-0" />
          )}
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {item.finalResult?.summaryEvaluation?.slice(0, 60) || "Validation " + item.id.slice(0, 8)}
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {isCompleted && item.feasibilityScore != null && (
            <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
              {item.feasibilityScore}/10
            </span>
          )}
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {date.toLocaleDateString()}
          </span>
        </div>
      </div>
    </button>
  )
}

export default function IdeaValidatePage() {
  const [activeResult, setActiveResult] = useState<ValidationResultType | null>(null)
  const [historyOpen, setHistoryOpen] = useState(false)

  const { validate, isPending } = useValidateIdea()
  const { validations, remainingToday, isLoading: historyLoading } = useMyValidations()

  const handleSubmit = (input: IdeaInput) => {
    validate(input, {
      onSuccess: (result) => setActiveResult(result),
    })
  }

  const handleReset = () => setActiveResult(null)

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-blue-500" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              FYP Idea Validator
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
              AI
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Get AI-powered multi-perspective evaluation of your FYP idea from 5 expert viewpoints.
          </p>
        </div>

        {/* Main Content */}
        {isPending ? (
          <LoadingOverlay />
        ) : activeResult ? (
          <ValidationResult result={activeResult} onReset={handleReset} />
        ) : (
          <IdeaForm
            onSubmit={handleSubmit}
            isPending={isPending}
            remainingToday={remainingToday}
          />
        )}

        {/* History Section */}
        {!isPending && !activeResult && validations.length > 0 && (
          <div className="mt-10 border-t border-gray-200 dark:border-slate-700 pt-6">
            <button
              onClick={() => setHistoryOpen(!historyOpen)}
              className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <History className="w-4 h-4" />
              Previous Validations ({validations.length})
              {historyOpen ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>

            {historyOpen && (
              <div className="mt-3 space-y-2">
                {historyLoading ? (
                  <div className="flex items-center gap-2 p-3 text-sm text-gray-400 dark:text-gray-500">
                    <Clock className="w-4 h-4 animate-spin" />
                    Loading...
                  </div>
                ) : (
                  validations.map((item) => (
                    <HistoryItem
                      key={item.id}
                      item={item}
                      onSelect={(v) => setActiveResult(v)}
                    />
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
