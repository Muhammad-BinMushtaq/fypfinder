"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "react-toastify"
import { ProposalDownloadButton } from "./ProposalDownloadButton"
import {
  ArrowLeft,
  Check,
  Copy,
  Lock,
  FolderKanban,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import type {
  DetailedScore,
  ScoringBreakdown,
  ValidationResult as ValidationResultType,
} from "@/services/fypIdeas.service"

interface ValidationResultProps {
  result: ValidationResultType
  onReset: () => void
  remainingToday?: number
}

const RUBRICS: {
  key: keyof ScoringBreakdown
  title: string
  maxScore: number
}[] = [
  { key: "problemClarityRelevance", title: "Problem Clarity & Relevance", maxScore: 20 },
  { key: "ideaExplanationUsability", title: "Architecture & User Flow", maxScore: 20 },
  { key: "keyFeaturesCompleteness", title: "Core Feature Scope", maxScore: 15 },
  { key: "feasibilityResources", title: "Technical Feasibility", maxScore: 10 },
  { key: "originalityNovelty", title: "Novelty & Differentiation", maxScore: 10 },
  { key: "impactUsefulness", title: "Practical Impact", maxScore: 10 },
  { key: "improvementPotential", title: "Scaling Potential", maxScore: 15 },
]

export function ValidationResult({
  result,
  onReset,
  remainingToday,
}: ValidationResultProps) {
  const router = useRouter()
  const report = result.report
  const [copiedPitch, setCopiedPitch] = useState(false)
  const [isApplying, setIsApplying] = useState(false)
  const [activeDeepDive, setActiveDeepDive] = useState<"rubric" | "defense" | "roadmap" | null>(null)

  if (!report) {
    return (
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center shadow-xs">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Unable to parse validation results. Please re-run the assessment.
        </p>
        <button
          onClick={onReset}
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-slate-900 dark:bg-white px-4 py-2 text-xs font-semibold text-white dark:text-slate-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Test Another Idea
        </button>
      </div>
    )
  }

  const rawTitle = result.title || report.plainSummary || "FYP Capstone Project Proposal"
  const cleanTitle = rawTitle.replace(/^\[[^\]]+\]\s*/, "")

  const recommendationLabel = formatRecommendation(result.recommendation || report.recommendation)
  const originalityLabel = formatOriginality(report.originalityVerdict)

  const handleCopyPitch = async () => {
    const textToCopy = report.elevatorPitch || report.plainSummary
    if (!textToCopy) return
    try {
      await navigator.clipboard.writeText(textToCopy)
      setCopiedPitch(true)
      setTimeout(() => setCopiedPitch(false), 2000)
    } catch {
      // Ignore copy error
    }
  }

  const handleApplyToWorkspace = async () => {
    if (isApplying) return
    setIsApplying(true)
    try {
      const groupRes = await fetch("/api/group/get-my-group")
      const groupJson = await groupRes.json()
      const summaryDesc = (report.plainSummary || result.ideaDescription || "").slice(0, 480)

      if (groupJson?.data?.id) {
        const updateRes = await fetch("/api/group/update-project", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectName: cleanTitle.slice(0, 100),
            description: summaryDesc,
          }),
        })
        if (!updateRes.ok) throw new Error("Could not update project details")
      } else {
        const createRes = await fetch("/api/group/invite-search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "CREATE_GROUP",
            projectName: cleanTitle.slice(0, 100),
            description: summaryDesc,
          }),
        })
        if (!createRes.ok) throw new Error("Could not initialize workspace")
      }

      toast.success("Project applied to your FYP Workspace")
      router.push("/dashboard/fyp")
    } catch (err: any) {
      toast.error(err?.message || "Failed to apply project to workspace")
    } finally {
      setIsApplying(false)
    }
  }

  const scoreTone =
    report.finalScore >= 75
      ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/50"
      : report.finalScore >= 55
      ? "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/50"
      : "bg-red-50 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900/50"

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onReset}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Validate another idea
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {result.accessMode === "student" && (
            <button
              type="button"
              onClick={handleApplyToWorkspace}
              disabled={isApplying}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer disabled:opacity-50"
            >
              <FolderKanban className="h-3.5 w-3.5" />
              {isApplying ? "Applying..." : "Use in FYP Workspace"}
            </button>
          )}
          {result.status === "completed" && (
            <ProposalDownloadButton validation={result} />
          )}
        </div>
      </div>

      {/* Quota Bar */}
      <ProgressTracker
        accessMode={result.accessMode}
        previewLocked={result.previewLocked}
        remainingToday={remainingToday}
      />

      {/* ===================================================================== */}
      {/* BLOCK 1: EXECUTIVE VERDICT & AT-A-GLANCE SCORECARD                    */}
      {/* ===================================================================== */}
      <section className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold border ${scoreTone}`}>
                {recommendationLabel}
              </span>
              <span className="text-xs text-slate-400">
                Ref #{result.id ? result.id.slice(0, 6).toUpperCase() : "PAF"}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight leading-snug">
              {cleanTitle}
            </h1>
          </div>

          <div className="flex items-baseline gap-1 shrink-0 bg-slate-50 dark:bg-slate-800/60 px-4 py-2.5 rounded-xl border border-slate-200/70 dark:border-slate-800">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {report.finalScore}
            </span>
            <span className="text-xs font-semibold text-slate-400">/ 100</span>
          </div>
        </div>

        {/* Single Clean Summary + Copy Pitch */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Summary & Evaluation Verdict
            </span>
            <button
              type="button"
              onClick={handleCopyPitch}
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              {copiedPitch ? (
                <>
                  <Check className="h-3 w-3 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  <span>Copy Summary</span>
                </>
              )}
            </button>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {report.plainSummary}
          </p>
        </div>

        {/* Key Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="rounded-xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 p-3">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
              Novelty Score
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-0.5 block">
              {report.originalityScore}/10 · {originalityLabel}
            </span>
          </div>
          <div className="rounded-xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 p-3">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
              Complexity
            </span>
            <span className="text-xs sm:text-sm font-bold capitalize text-slate-900 dark:text-white mt-0.5 block">
              {report.difficultyLevel}
            </span>
          </div>
          <div className="rounded-xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 p-3">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
              Team Fit
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-0.5 block">
              {report.teamFit}
            </span>
          </div>
          <div className="rounded-xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 p-3">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
              Timeline
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-0.5 block">
              {report.estimatedTimeline || "2 Semesters"}
            </span>
          </div>
        </div>

        {/* #1 Primary Supervisor Directive Box */}
        {(report.goldenDirective || report.shouldBuild) && (
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-900 dark:text-white block mb-1">
              Key Supervisor Recommendation
            </span>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {report.goldenDirective || report.shouldBuild}
            </p>
          </div>
        )}
      </section>

      {/* ===================================================================== */}
      {/* BLOCK 2: PAST PAF-IAST SUBMISSIONS COMPARISON                         */}
      {/* ===================================================================== */}
      <section className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              PAF-IAST Past Projects Check
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {report.originalityReason}
            </p>
          </div>
        </div>

        {report.similarPastIdeas && report.similarPastIdeas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {report.similarPastIdeas.slice(0, 4).map((past, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/20 p-4 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-snug">
                    {past.title}
                  </h3>
                  <span className="shrink-0 rounded px-2 py-0.5 text-[10px] font-bold bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {past.similarityScore}/10 match
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Batch {past.batch} · Group {past.groupNumber}
                  {past.supervisor ? ` · ${past.supervisor}` : ""}
                </p>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  <strong className="text-slate-900 dark:text-white">How to differentiate: </strong>
                  {past.keyDifference}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
            No duplicate projects found in PAF-IAST F21/F22 archives.
          </p>
        )}
      </section>

      {/* ===================================================================== */}
      {/* BLOCK 3: PRACTICAL BLUEPRINT (2 CLEAN COLUMNS: BUILD vs FIX)          */}
      {/* ===================================================================== */}
      {!result.previewLocked ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Left Column: MVP Scope & Tech Stack */}
            <section className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  What to Build (MVP Scope)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Core deliverables for Midterm & Final Defense
                </p>
              </div>

              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                {report.mvpRecommendations.slice(0, 5).map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2 leading-relaxed">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <span>{rec.replace(/\*\*/g, "")}</span>
                  </li>
                ))}
              </ul>

              {report.simpleTechDirection && report.simpleTechDirection.length > 0 && (
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    Recommended Tech Stack
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                    {report.simpleTechDirection.slice(0, 4).map((tech, idx) => (
                      <li key={idx} className="flex items-start gap-2 leading-relaxed">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0" />
                        <span>{tech.replace(/\*\*/g, "")}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>

            {/* Right Column: Risks & What to Fix */}
            <section className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  Weak Points & How to Fix Them
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Address these before your proposal defense
                </p>
              </div>

              <div className="space-y-2.5">
                <span className="text-xs font-bold text-amber-700 dark:text-amber-400 block">
                  Key Risks to Watch
                </span>
                <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                  {report.concernPoints.slice(0, 4).map((pt, idx) => (
                    <li key={idx} className="flex items-start gap-2 leading-relaxed">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                      <span>{pt.replace(/\*\*/g, "")}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {report.simpleNextSteps && report.simpleNextSteps.length > 0 && (
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    Next Steps This Week
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                    {report.simpleNextSteps.slice(0, 3).map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2 leading-relaxed">
                        <span className="font-bold text-slate-900 dark:text-white">{idx + 1}.</span>
                        <span>{step.replace(/\*\*/g, "")}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          </div>

          {/* ===================================================================== */}
          {/* BLOCK 4: COLLAPSIBLE DEEP-DIVE (RUBRIC SCORES, DEFENSE Q&A, ROADMAP)  */}
          {/* ===================================================================== */}
          <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs divide-y divide-slate-100 dark:divide-slate-800">
            {/* 1. Rubric Scorecard Accordion */}
            <div>
              <button
                type="button"
                onClick={() =>
                  setActiveDeepDive(activeDeepDive === "rubric" ? null : "rubric")
                }
                className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition cursor-pointer"
              >
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    7-Criteria Rubric Breakdown ({report.finalScore}/100)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    View individual scores and specific improvement actions per category
                  </p>
                </div>
                {activeDeepDive === "rubric" ? (
                  <ChevronUp className="h-4 w-4 text-slate-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                )}
              </button>

              {activeDeepDive === "rubric" && (
                <div className="px-6 pb-6 pt-2 space-y-3">
                  {RUBRICS.map((rubric) => {
                    const item = report.scoringBreakdown[rubric.key] as DetailedScore
                    if (!item) return null
                    const percent = Math.round((item.score / rubric.maxScore) * 100)
                    return (
                      <div
                        key={rubric.key}
                        className="rounded-xl border border-slate-200/70 dark:border-slate-800 p-3.5 space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                          <span>{rubric.title}</span>
                          <span>
                            {item.score} / {rubric.maxScore} ({percent}%)
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          {item.summary}
                        </p>
                        {item.action && (
                          <p className="text-xs font-medium text-slate-900 dark:text-white pt-0.5">
                            Fix: {item.action}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* 2. Defense Questions & Answers Accordion */}
            {report.defenseQuestions && report.defenseQuestions.length > 0 && (
              <div>
                <button
                  type="button"
                  onClick={() =>
                    setActiveDeepDive(activeDeepDive === "defense" ? null : "defense")
                  }
                  className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition cursor-pointer"
                >
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Expected Defense Questions & Answers ({report.defenseQuestions.length})
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Questions the PAF-IAST evaluation panel is likely to ask your team
                    </p>
                  </div>
                  {activeDeepDive === "defense" ? (
                    <ChevronUp className="h-4 w-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  )}
                </button>

                {activeDeepDive === "defense" && (
                  <div className="px-6 pb-6 pt-2 space-y-3">
                    {report.defenseQuestions.map((item, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-slate-200/70 dark:border-slate-800 p-3.5 space-y-1"
                      >
                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                          Q{idx + 1}: {item.question}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                          <strong className="text-slate-800 dark:text-slate-200">How to answer: </strong>
                          {item.suggestedAnswerStrategy}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 3. Phased Roadmap Accordion */}
            {report.roadmap && report.roadmap.length > 0 && (
              <div>
                <button
                  type="button"
                  onClick={() =>
                    setActiveDeepDive(activeDeepDive === "roadmap" ? null : "roadmap")
                  }
                  className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition cursor-pointer"
                >
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Suggested Semester Roadmap ({report.roadmap.length} Phases)
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Step-by-step execution plan across your FYP semesters
                    </p>
                  </div>
                  {activeDeepDive === "roadmap" ? (
                    <ChevronUp className="h-4 w-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  )}
                </button>

                {activeDeepDive === "roadmap" && (
                  <div className="px-6 pb-6 pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {report.roadmap.map((phase, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-slate-200/70 dark:border-slate-800 p-3.5 space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                          <span>
                            Phase {idx + 1}: {phase.phase}
                          </span>
                          <span className="text-[11px] font-normal text-slate-400">
                            {phase.duration}
                          </span>
                        </div>
                        <ul className="space-y-1 pl-3.5 text-xs text-slate-600 dark:text-slate-400">
                          {phase.tasks.slice(0, 3).map((t, tIdx) => (
                            <li key={tIdx} className="list-disc">
                              {t.replace(/\*\*/g, "")}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      ) : (
        <LockedPreview hiddenSections={result.hiddenSections} />
      )}
    </div>
  )
}

function ProgressTracker({
  accessMode,
  previewLocked,
  remainingToday,
}: {
  accessMode: "student" | "guest"
  previewLocked: boolean
  remainingToday?: number
}) {
  const total = accessMode === "student" ? 5 : 1
  const remaining =
    accessMode === "student" && typeof remainingToday === "number"
      ? remainingToday
      : previewLocked
      ? 0
      : 1
  const used = Math.max(0, Math.min(total, total - remaining))

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 px-4 py-3 flex items-center justify-between gap-4">
      <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
        Daily Validations: <strong className="text-slate-900 dark:text-white">{remaining}/{total}</strong> left today
      </span>
      <div className="flex items-center gap-1.5 w-32">
        {Array.from({ length: total }).map((_, index) => (
          <div
            key={index}
            className={`h-1.5 flex-1 rounded-full ${
              index < used ? "bg-slate-900 dark:bg-white" : "bg-slate-200 dark:bg-slate-800"
            }`}
          />
        ))}
      </div>
    </div>
  )
}

function LockedPreview({ hiddenSections }: { hiddenSections: string[] }) {
  return (
    <section className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center space-y-3">
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
        <Lock className="h-4 w-4" />
      </div>
      <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
        Sign In to Unlock Full MVP Blueprint & Defense Strategy
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
        Sign in with your PAF-IAST student account to view the full MVP scope, tech stack, defense Q&A, and apply this project to your FYP Workspace.
      </p>
      <div className="pt-2 flex justify-center gap-2">
        <Link
          href="/signup"
          className="rounded-lg bg-slate-900 dark:bg-white px-4 py-2 text-xs font-semibold text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition"
        >
          Sign Up Free
        </Link>
        <Link
          href="/login"
          className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
        >
          Log In
        </Link>
      </div>
    </section>
  )
}

function formatRecommendation(rec: string | null | undefined): string {
  switch (rec) {
    case "STRONGLY_RECOMMENDED":
    case "Strongly Recommended":
      return "Strong FYP Fit"
    case "RECOMMENDED_WITH_CHANGES":
    case "Recommended with Changes":
      return "Approved with Refinements"
    case "NEEDS_MAJOR_REVISION":
    case "Needs Major Revision":
      return "Needs Revision"
    case "NOT_RECOMMENDED":
    case "Not Recommended":
      return "Not Recommended"
    default:
      return rec || "Evaluated"
  }
}

function formatOriginality(verdict: string | null | undefined): string {
  switch (verdict) {
    case "appears_unique":
      return "Novel"
    case "some_overlap":
      return "Partial Overlap"
    case "very_similar":
      return "High Overlap"
    case "already_done":
      return "Duplicate"
    default:
      return "Verified"
  }
}
