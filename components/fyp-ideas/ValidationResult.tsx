"use client"

import { useState, type ReactNode } from "react"
import Link from "next/link"
import { RadarChart } from "./RadarChart"
import { ProposalDownloadButton } from "./ProposalDownloadButton"
import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Gauge,
  Layers3,
  Lightbulb,
  Lock,
  Map,
  MonitorCog,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  Users,
  Wrench,
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

const SCORE_SECTIONS: {
  key: keyof ScoringBreakdown
  title: string
  maxLabel: string
}[] = [
  { key: "problemClarityRelevance", title: "Problem Clarity & Relevance", maxLabel: "20 pts" },
  { key: "ideaExplanationUsability", title: "Architecture & Feasibility", maxLabel: "20 pts" },
  { key: "keyFeaturesCompleteness", title: "Feature Completeness", maxLabel: "15 pts" },
  { key: "feasibilityResources", title: "Resource & Execution Viability", maxLabel: "10 pts" },
  { key: "originalityNovelty", title: "Novelty & Originality", maxLabel: "10 pts" },
  { key: "impactUsefulness", title: "Practical Industry Impact", maxLabel: "10 pts" },
  { key: "improvementPotential", title: "Expansion & Growth Potential", maxLabel: "15 pts" },
]

export function ValidationResult({
  result,
  onReset,
  remainingToday,
}: ValidationResultProps) {
  const report = result.report

  if (!report) {
    return (
      <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center shadow-sm">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Unable to parse validation results. Please re-run the assessment.
        </p>
        <button
          onClick={onReset}
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-gray-900 dark:bg-white px-4 py-2 text-xs font-semibold text-white dark:text-gray-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Test Another Idea
        </button>
      </div>
    )
  }

  const [activeTab, setActiveTab] = useState<"all" | "rubrics" | "benchmarks" | "roadmap">("all")

  const finalTone = getScoreTone(report.finalScore, 100)
  const recommendationTone = getRecommendationTone(result.recommendation)
  const originalityTone = getOriginalityTone(report.originalityVerdict)

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Top action bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={onReset}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Validate another concept
        </button>

        {result.status === "completed" && (
          <ProposalDownloadButton validation={result} />
        )}
      </div>

      {/* Primary Score Hero Card */}
      <section className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm">
        <div className="grid gap-6 lg:grid-cols-[200px_1fr] lg:items-center">
          <div className="flex flex-col items-center justify-center p-4 border border-gray-100 dark:border-slate-800/80 rounded-2xl bg-gray-50/40 dark:bg-slate-800/20">
            <div className="text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              {report.finalScore}
            </div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mt-1">
              Out of 100
            </div>
            <div className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${finalTone.pill}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${finalTone.dot}`} />
              {finalTone.label}
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill tone={recommendationTone} />
              <StatusPill tone={originalityTone} />
            </div>
            <h2 className="mt-3 text-lg sm:text-xl font-bold tracking-tight text-gray-900 dark:text-white leading-snug">
              {result.title || "Executive Idea Assessment"}
            </h2>
            <p className="mt-2 text-xs sm:text-sm font-normal leading-relaxed text-gray-600 dark:text-gray-300">
              {report.plainSummary}
            </p>

            {report.shouldBuild && (
              <div className="mt-3.5 flex items-start gap-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 px-3.5 py-2.5 text-xs text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-semibold text-slate-900 dark:text-white">Recommendation: </span>
                  {report.shouldBuild}
                </div>
              </div>
            )}

            <div className="mt-5 grid grid-cols-3 gap-2.5">
              <QuickStat
                icon={<Gauge className="h-3.5 w-3.5" />}
                label="Difficulty"
                value={capitalize(report.difficultyLevel)}
              />
              <QuickStat
                icon={<Clock3 className="h-3.5 w-3.5" />}
                label="Timeline"
                value={report.estimatedTimeline}
              />
              <QuickStat
                icon={<Users className="h-3.5 w-3.5" />}
                label="Team Capacity"
                value={report.teamFit}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Quota Progress */}
      <ProgressTracker
        accessMode={result.accessMode}
        previewLocked={result.previewLocked}
        remainingToday={remainingToday}
      />

      {/* Interactive Assessment Navigator */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 p-1 rounded-2xl bg-gray-100 dark:bg-slate-800/80 border border-gray-200/60 dark:border-slate-700/60">
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${
            activeTab === "all"
              ? "bg-white dark:bg-slate-900 text-gray-900 dark:text-white shadow-xs"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          All Insights
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("rubrics")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${
            activeTab === "rubrics"
              ? "bg-white dark:bg-slate-900 text-gray-900 dark:text-white shadow-xs"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          <BarChart3 className="h-3.5 w-3.5" />
          Evaluation Matrix
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("benchmarks")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${
            activeTab === "benchmarks"
              ? "bg-white dark:bg-slate-900 text-gray-900 dark:text-white shadow-xs"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          <Layers3 className="h-3.5 w-3.5" />
          PAF-IAST Historical Matchups
          {report.similarPastIdeas.length > 0 && (
            <span className="ml-0.5 rounded-full bg-slate-200 dark:bg-slate-700 px-1.5 py-0.2 text-[10px] font-bold text-slate-800 dark:text-slate-200">
              {report.similarPastIdeas.length}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("roadmap")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${
            activeTab === "roadmap"
              ? "bg-white dark:bg-slate-900 text-gray-900 dark:text-white shadow-xs"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          <Map className="h-3.5 w-3.5" />
          Action Roadmap
        </button>
      </div>

      {/* 1. Evaluation Matrix & Rubrics */}
      {(activeTab === "all" || activeTab === "rubrics") && (
        <>
          <section className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-4 mb-6">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                <BarChart3 className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                Evaluation Matrix & Factor Breakdown
              </div>
              <span className="text-xs text-gray-400 dark:text-gray-500">7 Core Rubrics</span>
            </div>

            <div className="mb-8">
              <RadarChart
                scores={{
                  feasibility: report.scoringBreakdown.feasibilityResources.score * (100 / report.scoringBreakdown.feasibilityResources.maxScore),
                  originality: report.scoringBreakdown.originalityNovelty.score * (100 / report.scoringBreakdown.originalityNovelty.maxScore),
                  complexity: report.scoringBreakdown.problemClarityRelevance.score * (100 / report.scoringBreakdown.problemClarityRelevance.maxScore),
                  marketRelevance: report.scoringBreakdown.impactUsefulness.score * (100 / report.scoringBreakdown.impactUsefulness.maxScore),
                  timelineRealism: report.scoringBreakdown.improvementPotential.score * (100 / report.scoringBreakdown.improvementPotential.maxScore),
                }}
              />
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-2.5">
                {SCORE_SECTIONS.map((section) => {
                  const item = report.scoringBreakdown[section.key]
                  return (
                    <ScorePanel
                      key={section.key}
                      title={section.title}
                      maxLabel={section.maxLabel}
                      item={item}
                    />
                  )
                })}
              </div>

              <div className="space-y-3">
                <VisualMetric
                  label="Originality & Novelty"
                  score={report.scoringBreakdown.originalityNovelty.score}
                  max={report.scoringBreakdown.originalityNovelty.maxScore}
                />
                <VisualMetric
                  label="Impact & Relevance"
                  score={report.scoringBreakdown.impactUsefulness.score}
                  max={report.scoringBreakdown.impactUsefulness.maxScore}
                />
                <VisualMetric
                  label="Feasibility & Resource Scope"
                  score={report.scoringBreakdown.feasibilityResources.score}
                  max={report.scoringBreakdown.feasibilityResources.maxScore}
                />
                <VisualMetric
                  label="Growth Potential"
                  score={report.scoringBreakdown.improvementPotential.score}
                  max={report.scoringBreakdown.improvementPotential.maxScore}
                />
              </div>
            </div>
          </section>

          {/* Strengths & Potential Concerns */}
          <div className="grid gap-4 sm:grid-cols-2">
            <ReportPanel title="Strengths & Advantages" icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />}>
              <BulletList items={report.strongPoints} />
            </ReportPanel>
            <ReportPanel title="Potential Concerns & Pitfalls" icon={<AlertTriangle className="h-4 w-4 text-amber-500" />}>
              <BulletList items={report.concernPoints} />
            </ReportPanel>
          </div>
        </>
      )}

      {/* 2. Past FYP Similarity Comparison & Differentiators */}
      {(activeTab === "all" || activeTab === "benchmarks") && (
        <>
          <section className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-gray-100 dark:border-slate-800 pb-5 mb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    Historical FYP Comparison Check
                  </span>
                  <StatusPill tone={originalityTone} />
                </div>
                <p className="mt-1.5 text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                  {report.originalityReason}
                </p>
                {report.pastIdeaComparisonSummary && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {report.pastIdeaComparisonSummary}
                  </p>
                )}
              </div>
              <div className="shrink-0 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 p-3 text-center sm:w-32">
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  {report.originalityScore}/10
                </div>
                <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Novelty Rating</div>
              </div>
            </div>

            <div className="space-y-3">
              {report.similarPastIdeas.length > 0 ? (
                report.similarPastIdeas.map((idea, index) => (
                  <div
                    key={`${idea.title}-${index}`}
                    className="rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/30 p-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                          {idea.title}
                        </h4>
                        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                          {idea.batch} • Group {idea.groupNumber}
                          {idea.supervisor ? ` • Supervisor: ${idea.supervisor}` : ""}
                        </p>
                      </div>
                      <span className="w-fit rounded-md bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 px-2.5 py-1 text-[11px] font-medium text-gray-700 dark:text-gray-300">
                        Similarity: {idea.similarityScore}/10
                      </span>
                    </div>
                    <p className="mt-2.5 text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                      {idea.similarityReason}
                    </p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Key difference:</span> {idea.keyDifference}
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/20 p-4 text-xs text-gray-500 dark:text-gray-400 text-center">
                  No direct past FYP overlaps detected in PAF-IAST historical submissions.
                </div>
              )}
            </div>
          </section>

          <div className="grid gap-4 sm:grid-cols-2">
            <ReportPanel title="Target Stakeholders" icon={<Users className="h-4 w-4 text-gray-500" />}>
              <p className="text-xs text-gray-700 dark:text-gray-300">{report.whoWillUseIt}</p>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{report.whyItMatters}</p>
            </ReportPanel>
            <ReportPanel title="Differentiation Strategy" icon={<Sparkles className="h-4 w-4 text-gray-500" />}>
              <BulletList items={report.uniquenessImprovements} />
            </ReportPanel>
          </div>
        </>
      )}

      {/* 3. Action Roadmap & Implementation */}
      {(activeTab === "all" || activeTab === "roadmap") && (
        <>
          <section className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white mb-5">
              <Layers3 className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              MVP Boundary & Action Priorities
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <ActionColumn title="Core MVP Scope" items={report.mvpRecommendations} />
              <ActionColumn title="Immediate Next Steps" items={report.simpleNextSteps} />
              <ActionColumn title="Implementation Priorities" items={report.roadmapPriorities} />
            </div>
          </section>

          {/* Advanced Features */}
          {report.advancedFeatureSuggestions.length > 0 && (
            <ReportPanel title="Suggested Advanced Features" icon={<MonitorCog className="h-4 w-4 text-gray-500" />}>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {report.advancedFeatureSuggestions.map((item, index) => (
                  <FeatureSuggestion key={`${item}-${index}`} text={item} index={index} />
                ))}
              </div>
            </ReportPanel>
          )}

          {/* Roadmap & Guidance */}
          {!result.previewLocked ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <ReportPanel title="Technical Stack Direction" icon={<Wrench className="h-4 w-4 text-gray-500" />}>
                  <BulletList items={report.simpleTechDirection} />
                </ReportPanel>
                <ReportPanel title="Risk Mitigation Tactics" icon={<ShieldCheck className="h-4 w-4 text-gray-500" />}>
                  <BulletList items={report.riskReductionSteps} />
                </ReportPanel>
              </div>

              <ReportPanel title="Implementation Timeline & Phasing" icon={<Map className="h-4 w-4 text-gray-500" />}>
                <div className="space-y-4 pt-1">
                  {report.roadmap.map((phase, index) => (
                    <div
                      key={`${phase.phase}-${index}`}
                      className="rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/30 p-4"
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <h4 className="text-xs font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-900 dark:bg-white text-[10px] font-bold text-white dark:text-gray-900">
                            {index + 1}
                          </span>
                          {phase.phase}
                        </h4>
                        <span className="inline-flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500">
                          <Clock3 className="h-3 w-3" />
                          {phase.duration}
                        </span>
                      </div>
                      <BulletList items={phase.tasks} compact />
                    </div>
                  ))}
                </div>
              </ReportPanel>

              <div className="grid gap-4 sm:grid-cols-2">
                <ReportPanel title="Elevator Pitch" icon={<Lightbulb className="h-4 w-4 text-gray-500" />}>
                  <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{report.elevatorPitch}</p>
                </ReportPanel>
                <ReportPanel title="Supervisor Review Advice" icon={<Target className="h-4 w-4 text-gray-500" />}>
                  <BulletList items={report.plainLanguageAdvice} />
                </ReportPanel>
              </div>
            </>
          ) : (
            <LockedPreview hiddenSections={result.hiddenSections} />
          )}
        </>
      )}
    </div>
  )
}

function ScorePanel({
  title,
  maxLabel,
  item,
}: {
  title: string
  maxLabel: string
  item: DetailedScore
}) {
  const tone = getScoreTone(item.score, item.maxScore)
  const percent = Math.round((item.score / item.maxScore) * 100)

  return (
    <details className="group rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50/40 dark:bg-slate-800/30 p-3.5 transition">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-semibold text-gray-900 dark:text-white">{title}</h4>
            <span className={`inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-medium ${tone.pill}`}>
              {item.score}/{item.maxScore}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1">{item.summary}</p>
        </div>
        <ChevronDown className="h-4 w-4 text-gray-400 transition group-open:rotate-180" />
      </summary>
      <div className="mt-3 pt-3 border-t border-gray-200/70 dark:border-slate-700/60 text-xs text-gray-600 dark:text-gray-300">
        <BulletList items={item.feedback} compact />
        {item.action && (
          <div className="mt-2.5 rounded-lg bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-2 text-[11px] font-medium text-gray-800 dark:text-gray-200">
            Suggested Action: {item.action}
          </div>
        )}
      </div>
    </details>
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
  const total = accessMode === "student" ? 3 : 1
  const remaining = accessMode === "student" && typeof remainingToday === "number"
    ? remainingToday
    : previewLocked
      ? 0
      : 1
  const used = Math.max(0, Math.min(total, total - remaining))

  return (
    <div className="rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/30 p-3.5">
      <div className="flex items-center justify-between text-xs mb-2">
        <span className="font-medium text-gray-700 dark:text-gray-300">Daily Validation Usage</span>
        <span className="text-gray-500 dark:text-gray-400">{remaining} of {total} remaining</span>
      </div>
      <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }}>
        {Array.from({ length: total }).map((_, index) => (
          <div
            key={index}
            className={`h-1.5 rounded-full ${
              index < used
                ? "bg-gray-900 dark:bg-white"
                : "bg-gray-200 dark:bg-slate-800"
            }`}
          />
        ))}
      </div>
    </div>
  )
}

function VisualMetric({ label, score, max }: { label: string; score: number; max: number }) {
  const percent = Math.round((score / max) * 100)
  const tone = getScoreTone(score, max)

  return (
    <div className="rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50/40 dark:bg-slate-800/30 p-3.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-gray-900 dark:text-white">{label}</span>
        <span className="font-semibold text-gray-900 dark:text-white">{score}/{max}</span>
      </div>
      <div className="mt-2 h-1.5 w-full rounded-full bg-gray-200 dark:bg-slate-800 overflow-hidden">
        <div className={`h-full ${tone.bar}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}

function QuickStat({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/40 p-2.5 text-center sm:text-left">
      <div className="flex items-center justify-center sm:justify-start gap-1.5 text-[10px] font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
        {icon}
        {label}
      </div>
      <div className="mt-1 text-xs font-semibold text-gray-900 dark:text-white truncate">{value}</div>
    </div>
  )
}

function ReportPanel({
  title,
  icon,
  children,
}: {
  title: string
  icon: ReactNode
  children: ReactNode
}) {
  return (
    <section className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-semibold text-gray-900 dark:text-white mb-3">
        {icon}
        <h3>{title}</h3>
      </div>
      <div className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{children}</div>
    </section>
  )
}

function ActionColumn({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/30 p-3.5">
      <h4 className="text-xs font-semibold text-gray-900 dark:text-white mb-2">{title}</h4>
      <BulletList items={items} compact />
    </div>
  )
}

function FeatureSuggestion({ text, index }: { text: string; index: number }) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-gray-200/80 dark:border-slate-800 bg-gray-50/40 dark:bg-slate-800/30 p-2.5 text-xs text-gray-700 dark:text-gray-300">
      <span className="mt-0.5 text-gray-400 dark:text-gray-500">•</span>
      <span>{text}</span>
    </div>
  )
}

function LockedPreview({ hiddenSections }: { hiddenSections: string[] }) {
  return (
    <section className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/40 p-6 text-center">
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 mb-3">
        <Lock className="h-4 w-4" />
      </div>
      <h3 className="text-base font-semibold text-gray-900 dark:text-white tracking-tight">
        Sign In to Unlock Complete Implementation Roadmap
      </h3>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto">
        Student authentication provides complete phased schedules, tech architecture, risk mitigations, and saved history.
      </p>
      <div className="mt-5 flex justify-center gap-2">
        <Link
          href="/signup"
          className="rounded-lg bg-gray-900 dark:bg-white px-4 py-2 text-xs font-semibold text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 transition"
        >
          Sign Up Free
        </Link>
        <Link
          href="/login"
          className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition"
        >
          Log In
        </Link>
      </div>
    </section>
  )
}

function StatusPill({
  tone,
}: {
  tone: {
    label: string
    pill: string
    icon: ReactNode
  }
}) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${tone.pill}`}>
      {tone.icon}
      {tone.label}
    </span>
  )
}

function BulletList({ items, compact = false }: { items: string[]; compact?: boolean }) {
  return (
    <ul className={compact ? "space-y-1.5" : "space-y-2"}>
      {items.map((item, index) => (
        <li key={`${item}-${index}`} className="flex items-start gap-2">
          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gray-400 dark:bg-gray-500" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

function getScoreTone(value: number, max: number) {
  const percent = (value / max) * 100

  if (percent >= 75) {
    return {
      label: "Strong Score",
      text: "text-emerald-600 dark:text-emerald-400",
      pill: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/40",
      dot: "bg-emerald-500",
      bar: "bg-emerald-500",
      chartColor: "#10b981",
    }
  }

  if (percent >= 50) {
    return {
      label: "Moderate Viability",
      text: "text-amber-600 dark:text-amber-400",
      pill: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-900/40",
      dot: "bg-amber-500",
      bar: "bg-amber-500",
      chartColor: "#f59e0b",
    }
  }

  return {
    label: "Revision Recommended",
    text: "text-red-600 dark:text-red-400",
    pill: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-900/40",
    dot: "bg-red-500",
    bar: "bg-red-500",
    chartColor: "#ef4444",
  }
}

function getRecommendationTone(recommendation: string | null) {
  switch (recommendation) {
    case "STRONGLY_RECOMMENDED":
      return {
        label: "Strong FYP Fit",
        shell: "border-gray-200 dark:border-slate-800",
        pill: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-900/40",
        icon: <CheckCircle2 className="h-3 w-3 text-emerald-500" />,
      }
    case "RECOMMENDED_WITH_CHANGES":
      return {
        label: "Approved with Refinements",
        shell: "border-gray-200 dark:border-slate-800",
        pill: "bg-gray-100 text-gray-800 dark:bg-slate-800 dark:text-gray-200 border border-gray-200 dark:border-slate-700",
        icon: <Lightbulb className="h-3 w-3 text-gray-600 dark:text-gray-400" />,
      }
    case "NEEDS_MAJOR_REVISION":
      return {
        label: "Major Revision Required",
        shell: "border-gray-200 dark:border-slate-800",
        pill: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/80 dark:border-amber-900/40",
        icon: <AlertTriangle className="h-3 w-3 text-amber-500" />,
      }
    default:
      return {
        label: "Incomplete Formulation",
        shell: "border-gray-200 dark:border-slate-800",
        pill: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200/80 dark:border-red-900/40",
        icon: <AlertTriangle className="h-3 w-3 text-red-500" />,
      }
  }
}

function getOriginalityTone(
  verdict: "appears_unique" | "some_overlap" | "very_similar" | "already_done"
) {
  switch (verdict) {
    case "appears_unique":
      return {
        label: "Novel & Differentiated",
        shell: "border-gray-200 dark:border-slate-800",
        pill: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-900/40",
        icon: <Sparkles className="h-3 w-3 text-emerald-500" />,
      }
    case "some_overlap":
      return {
        label: "Partial Past Overlap",
        shell: "border-gray-200 dark:border-slate-800",
        pill: "bg-gray-100 text-gray-800 dark:bg-slate-800 dark:text-gray-200 border border-gray-200 dark:border-slate-700",
        icon: <Lightbulb className="h-3 w-3 text-gray-600 dark:text-gray-400" />,
      }
    case "very_similar":
      return {
        label: "High Historic Overlap",
        shell: "border-gray-200 dark:border-slate-800",
        pill: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/80 dark:border-amber-900/40",
        icon: <AlertTriangle className="h-3 w-3 text-amber-500" />,
      }
    default:
      return {
        label: "Duplicate Work",
        shell: "border-gray-200 dark:border-slate-800",
        pill: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200/80 dark:border-red-900/40",
        icon: <AlertTriangle className="h-3 w-3 text-red-500" />,
      }
  }
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}
