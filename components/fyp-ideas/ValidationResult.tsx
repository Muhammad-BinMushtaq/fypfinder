"use client"

import { useState, type ReactNode } from "react"
import Link from "next/link"
import { ProposalDownloadButton } from "./ProposalDownloadButton"
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Copy,
  Cpu,
  GraduationCap,
  HelpCircle,
  Layers3,
  LayoutDashboard,
  Lightbulb,
  Lock,
  Map,
  ShieldCheck,
  Sparkles,
  Split,
  Target,
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

interface PillarData {
  id: string
  title: string
  score: number
  maxScore: number
  description: string
  subRubrics: {
    label: string
    score: number
    maxScore: number
    item: DetailedScore
  }[]
}

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

  const [activeTab, setActiveTab] = useState<"all" | "diagnosis" | "scope" | "defense">("all")
  const [copiedPitch, setCopiedPitch] = useState(false)
  const [expandedPillar, setExpandedPillar] = useState<string | null>(null)

  // Derived readiness semantics
  const readinessScore = report.finalScore ?? 0
  const readinessTier =
    report.readinessTier ??
    (readinessScore >= 85
      ? "defense_ready"
      : readinessScore >= 65
        ? "refinement_required"
        : "high_risk")

  const readinessTone = getReadinessTone(readinessScore, readinessTier)
  const recommendationTone = getRecommendationTone(result.recommendation || report.recommendation)
  const originalityTone = getOriginalityTone(report.originalityVerdict)

  // 3-Pillar Academic Matrix grouping
  const pillars: PillarData[] = [
    {
      id: "novelty",
      title: "Novelty & Problem Relevance",
      score:
        report.scoringBreakdown.problemClarityRelevance.score +
        report.scoringBreakdown.originalityNovelty.score,
      maxScore: 30,
      description: "Evaluation of problem authenticity, market gap, and uniqueness against PAF-IAST historical batches.",
      subRubrics: [
        {
          label: "Problem Clarity & Relevance",
          score: report.scoringBreakdown.problemClarityRelevance.score,
          maxScore: 20,
          item: report.scoringBreakdown.problemClarityRelevance,
        },
        {
          label: "Novelty & Originality",
          score: report.scoringBreakdown.originalityNovelty.score,
          maxScore: 10,
          item: report.scoringBreakdown.originalityNovelty,
        },
      ],
    },
    {
      id: "rigor",
      title: "Technical Rigor & Execution Viability",
      score:
        report.scoringBreakdown.ideaExplanationUsability.score +
        report.scoringBreakdown.keyFeaturesCompleteness.score +
        report.scoringBreakdown.feasibilityResources.score,
      maxScore: 45,
      description: "Architecture clarity, scope completeness, and ability for 2-3 undergraduates to ship in 6-8 months.",
      subRubrics: [
        {
          label: "Architecture & Usability",
          score: report.scoringBreakdown.ideaExplanationUsability.score,
          maxScore: 20,
          item: report.scoringBreakdown.ideaExplanationUsability,
        },
        {
          label: "Feature Completeness",
          score: report.scoringBreakdown.keyFeaturesCompleteness.score,
          maxScore: 15,
          item: report.scoringBreakdown.keyFeaturesCompleteness,
        },
        {
          label: "Resource & Execution Viability",
          score: report.scoringBreakdown.feasibilityResources.score,
          maxScore: 10,
          item: report.scoringBreakdown.feasibilityResources,
        },
      ],
    },
    {
      id: "impact",
      title: "Academic & Industry Impact",
      score:
        report.scoringBreakdown.impactUsefulness.score +
        report.scoringBreakdown.improvementPotential.score,
      maxScore: 25,
      description: "Real-world utility for campus or enterprise users and ceiling for academic capstone grading.",
      subRubrics: [
        {
          label: "Practical Industry Impact",
          score: report.scoringBreakdown.impactUsefulness.score,
          maxScore: 10,
          item: report.scoringBreakdown.impactUsefulness,
        },
        {
          label: "Expansion & Growth Potential",
          score: report.scoringBreakdown.improvementPotential.score,
          maxScore: 15,
          item: report.scoringBreakdown.improvementPotential,
        },
      ],
    },
  ]

  const handleCopyPitch = async () => {
    if (!report.elevatorPitch) return
    try {
      await navigator.clipboard.writeText(report.elevatorPitch)
      setCopiedPitch(true)
      setTimeout(() => setCopiedPitch(false), 2000)
    } catch {
      // Ignore clipboard write failures
    }
  }

  const primaryPastMatch = report.similarPastIdeas?.[0] ?? null

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

      {/* =========================================================================
          HERO VERDICT CARD: Proposal Defense Readiness
          ========================================================================= */}
      <section className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm">
        <div className="grid gap-6 lg:grid-cols-[220px_1fr] lg:items-center">
          {/* Radial Readiness Dial */}
          <div className="flex flex-col items-center justify-center p-5 border border-gray-100 dark:border-slate-800/80 rounded-2xl bg-gray-50/50 dark:bg-slate-800/30 text-center">
            <div className="relative flex items-center justify-center">
              <svg className="h-28 w-28 -rotate-90 transform" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="stroke-gray-200 dark:stroke-slate-800"
                  strokeWidth="8"
                  fill="transparent"
                />
                {/* Value Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className={`${readinessTone.ringStroke} transition-all duration-1000 ease-out`}
                  strokeWidth="8"
                  strokeDasharray="251.3"
                  strokeDashoffset={251.3 * (1 - readinessScore / 100)}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                  {readinessScore}%
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  Readiness
                </span>
              </div>
            </div>

            <div className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${readinessTone.pill}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${readinessTone.dot}`} />
              {readinessTone.label}
            </div>

            <p className="mt-2 text-[11px] font-medium text-gray-500 dark:text-gray-400 leading-snug">
              {readinessScore >= 85
                ? "Meets faculty submission threshold"
                : `+${85 - readinessScore}% to Defense Ready threshold`}
            </p>
          </div>

          {/* Verdict Narrative & Metadata */}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill tone={recommendationTone} />
              <StatusPill tone={originalityTone} />
            </div>

            <h2 className="mt-3 text-lg sm:text-xl font-bold tracking-tight text-gray-900 dark:text-white leading-snug">
              {result.title || "Academic Proposal Advisory Brief"}
            </h2>

            <p className="mt-2 text-xs sm:text-sm font-normal leading-relaxed text-gray-600 dark:text-gray-300">
              {report.plainSummary}
            </p>

            {/* The Golden Directive Box */}
            <div className="mt-3.5 rounded-xl border border-emerald-200/80 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 p-3.5 text-xs text-emerald-900 dark:text-emerald-200">
              <div className="flex items-start gap-2.5">
                <Target className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-semibold text-emerald-950 dark:text-emerald-100">
                    Supervisor Advisory Directive:{" "}
                  </span>
                  {report.goldenDirective || report.shouldBuild}
                </div>
              </div>
            </div>

            {/* 4 Metadata Badges */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
              <QuickStat
                icon={<Target className="h-3.5 w-3.5" />}
                label="Complexity"
                value={capitalize(report.difficultyLevel)}
              />
              <QuickStat
                icon={<Clock3 className="h-3.5 w-3.5" />}
                label="Duration"
                value={report.estimatedTimeline}
              />
              <QuickStat
                icon={<Users className="h-3.5 w-3.5" />}
                label="Team Capacity"
                value={report.teamFit}
              />
              <QuickStat
                icon={<Cpu className="h-3.5 w-3.5" />}
                label="Hardware / Cloud"
                value={report.hardwareRequirement?.isSoftwareOnly ? "Software Only" : "Hardware Req."}
                sub={report.hardwareRequirement?.estimatedCost || "$0 Cloud Tier"}
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

      {/* =========================================================================
          WORKFLOW NAVIGATOR: 4 Intent-Driven Perspectives
          ========================================================================= */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 p-1 rounded-2xl bg-gray-100 dark:bg-slate-800/80 border border-gray-200/60 dark:border-slate-700/60">
        <NavTabButton
          active={activeTab === "all"}
          onClick={() => setActiveTab("all")}
          icon={<LayoutDashboard className="h-3.5 w-3.5" />}
          label="All Insights"
        />
        <NavTabButton
          active={activeTab === "diagnosis"}
          onClick={() => setActiveTab("diagnosis")}
          icon={<Layers3 className="h-3.5 w-3.5" />}
          label="Diagnosis & Pillars"
          count={report.similarPastIdeas.length > 0 ? report.similarPastIdeas.length : undefined}
        />
        <NavTabButton
          active={activeTab === "scope"}
          onClick={() => setActiveTab("scope")}
          icon={<Split className="h-3.5 w-3.5" />}
          label="Scope & Roadmap"
          count={report.roadmap.length > 0 ? report.roadmap.length : undefined}
        />
        <NavTabButton
          active={activeTab === "defense"}
          onClick={() => setActiveTab("defense")}
          icon={<GraduationCap className="h-3.5 w-3.5" />}
          label="Defense Toolkit"
          count={report.defenseQuestions && report.defenseQuestions.length > 0 ? report.defenseQuestions.length : undefined}
        />
      </div>

      {/* =========================================================================
          SECTION 1: DIAGNOSIS & BENCHMARKING
          ========================================================================= */}
      {(activeTab === "all" || activeTab === "diagnosis") && (
        <>
          {/* Side-by-Side PAF-IAST Historical Matchup */}
          <section className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-gray-100 dark:border-slate-800 pb-5 mb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    PAF-IAST Historical Archive Matchup
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

            {primaryPastMatch ? (
              <div className="space-y-4">
                {/* Side-by-side comparison card */}
                <div className="rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/30 p-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    {/* Your Proposal */}
                    <div className="space-y-1.5 border-b md:border-b-0 md:border-r border-gray-200 dark:border-slate-700/80 pb-3 md:pb-0 md:pr-4">
                      <span className="inline-block rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                        Your Proposed Concept
                      </span>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white pt-1">
                        {result.title || "Your Submission"}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                        {report.plainSummary}
                      </p>
                    </div>

                    {/* Historical Match */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="inline-block rounded-md bg-slate-200 dark:bg-slate-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                          Closest Historical Submission
                        </span>
                        <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                          Similarity: {primaryPastMatch.similarityScore}/10
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white pt-1">
                        {primaryPastMatch.title}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Batch {primaryPastMatch.batch} • Group {primaryPastMatch.groupNumber}
                        {primaryPastMatch.supervisor ? ` • Supervisor: ${primaryPastMatch.supervisor}` : ""}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                        {primaryPastMatch.similarityReason}
                      </p>
                    </div>
                  </div>

                  {/* High-Contrast Differentiating Edge Banner */}
                  <div className="mt-4 rounded-lg bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 p-3 text-xs leading-relaxed">
                    <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                      Why Your Idea Stands Out (Differentiating Edge):{" "}
                    </span>
                    <span className="text-gray-800 dark:text-gray-200">
                      {primaryPastMatch.keyDifference}
                    </span>
                  </div>
                </div>

                {/* Additional past ideas if more than 1 */}
                {report.similarPastIdeas.length > 1 && (
                  <div className="space-y-2 pt-2">
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Other Secondary Archive Overlaps:
                    </span>
                    {report.similarPastIdeas.slice(1).map((idea, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg border border-gray-100 dark:border-slate-800 bg-gray-50/30 dark:bg-slate-800/20 p-2.5 text-xs"
                      >
                        <div>
                          <span className="font-medium text-gray-900 dark:text-white">{idea.title}</span>
                          <span className="ml-2 text-gray-400 text-[11px]">({idea.batch} • Grp {idea.groupNumber})</span>
                        </div>
                        <span className="text-gray-500 dark:text-gray-400 shrink-0 text-[11px]">
                          Similarity: {idea.similarityScore}/10
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/30 dark:bg-emerald-950/20 p-4 text-xs text-emerald-800 dark:text-emerald-300 text-center flex items-center justify-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                No direct past FYP overlaps detected in PAF-IAST historical submissions. Clean novelty profile!
              </div>
            )}
          </section>

          {/* 3-Pillar Academic Matrix Scorecard */}
          <section className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-4 mb-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Layers3 className="h-4 w-4 text-gray-500" />
                  3-Pillar Academic Evaluation Matrix
                </h3>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Consolidated university grading matrix benchmarked across 7 departmental rubrics.
                </p>
              </div>
              <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
                100 Total Pts
              </span>
            </div>

            <div className="space-y-4">
              {pillars.map((pillar) => {
                const percent = Math.round((pillar.score / pillar.maxScore) * 100)
                const tone = getScoreTone(pillar.score, pillar.maxScore)
                const isExpanded = expandedPillar === pillar.id

                return (
                  <div
                    key={pillar.id}
                    className="rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50/40 dark:bg-slate-800/20 p-4 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                            {pillar.title}
                          </h4>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${tone.pill}`}>
                            {pillar.score}/{pillar.maxScore} pts ({percent}%)
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                          {pillar.description}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setExpandedPillar(isExpanded ? null : pillar.id)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition shrink-0"
                      >
                        {isExpanded ? "Hide Breakdown" : "View Breakdown"}
                        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                      </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3 h-2 w-full rounded-full bg-gray-200 dark:bg-slate-800 overflow-hidden">
                      <div className={`h-full ${tone.bar} transition-all duration-700 ease-out`} style={{ width: `${percent}%` }} />
                    </div>

                    {/* Expanded Sub-Rubric Breakdown Drawer */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700/60 space-y-3">
                        {pillar.subRubrics.map((sub, idx) => (
                          <div
                            key={idx}
                            className="rounded-lg bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 p-3 space-y-2"
                          >
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-semibold text-gray-900 dark:text-white">{sub.label}</span>
                              <span className="font-bold text-gray-700 dark:text-gray-300">{sub.score}/{sub.maxScore} pts</span>
                            </div>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                              {sub.item.summary}
                            </p>
                            <BulletList items={sub.item.feedback} compact />
                            {sub.item.action && (
                              <div className="mt-2 rounded bg-gray-50 dark:bg-slate-800/60 p-2 text-[11px] font-medium text-gray-800 dark:text-gray-200">
                                <span className="font-semibold text-emerald-600 dark:text-emerald-400">Action: </span>
                                {sub.item.action}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>

          {/* Strengths & Panel Red Flags */}
          <div className="grid gap-4 sm:grid-cols-2">
            <ReportPanel
              title="Identified Project Strengths"
              icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />}
            >
              <BulletList items={report.strongPoints} />
            </ReportPanel>
            <ReportPanel
              title="Panel Red Flags & Scrutiny Points"
              icon={<AlertTriangle className="h-4 w-4 text-amber-500" />}
            >
              <BulletList items={report.concernPoints} />
            </ReportPanel>
          </div>
        </>
      )}

      {/* =========================================================================
          SECTION 2: PRESCRIPTION & TWO-TIER SCOPE
          ========================================================================= */}
      {(activeTab === "all" || activeTab === "scope") && (
        <>
          {/* Two-Tier Scope Architecture */}
          <section className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-4 mb-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Split className="h-4 w-4 text-gray-500" />
                  Two-Tier Project Scope Architecture
                </h3>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Separates non-negotiable deliverables for Proposal Defense from optional future features.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Semester 7: Core MVP */}
              <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-900/50 bg-emerald-50/20 dark:bg-emerald-950/10 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-200">
                    Semester 7: Midterm Scope (Must Have)
                  </span>
                  <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">Core MVP</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                  Deliverables required to pass internal faculty defense and establish proof-of-concept:
                </p>
                <BulletList items={report.mvpRecommendations} compact />
              </div>

              {/* Semester 8: Advanced Extensions */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/20 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-slate-200 dark:bg-slate-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    Semester 8: Final Polish (Nice to Have)
                  </span>
                  <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Extensions</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                  High-value additions to pursue only after the core pipeline is fully functioning:
                </p>
                <BulletList items={report.advancedFeatureSuggestions.slice(0, 5)} compact />
              </div>
            </div>
          </section>

          {/* 7-Day Action Checklist */}
          <section className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Immediate 7-Day Action Checklist
            </h3>
            <div className="grid gap-3 sm:grid-cols-3">
              {report.simpleNextSteps.map((step, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/30 p-3.5 space-y-2"
                >
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-900 dark:bg-white text-[10px] font-bold text-white dark:text-gray-900">
                    {idx + 1}
                  </div>
                  <p className="text-xs text-gray-700 dark:text-gray-200 leading-relaxed font-medium">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Phased Roadmap & Tech Stack */}
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
            </>
          ) : (
            <LockedPreview hiddenSections={result.hiddenSections} />
          )}
        </>
      )}

      {/* =========================================================================
          SECTION 3: SUPERVISOR DEFENSE TOOLKIT
          ========================================================================= */}
      {(activeTab === "all" || activeTab === "defense") && (
        <>
          {/* Professor Defense Simulator */}
          <section className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-4 mb-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-emerald-500" />
                  Jury Defense Simulator (Anticipated Committee Questions)
                </h3>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Top challenging questions professors will ask during proposal defense, paired with strategic answer formulas.
                </p>
              </div>
            </div>

            {!result.previewLocked && report.defenseQuestions && report.defenseQuestions.length > 0 ? (
              <div className="space-y-3.5">
                {report.defenseQuestions.map((q, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/30 p-4 space-y-2"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="rounded bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 shrink-0 mt-0.5">
                        Question 0{idx + 1}
                      </span>
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white leading-relaxed">
                        {q.question}
                      </h4>
                    </div>
                    <div className="rounded-lg bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 p-3 text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">Recommended Defense Strategy: </span>
                      {q.suggestedAnswerStrategy}
                    </div>
                  </div>
                ))}
              </div>
            ) : result.previewLocked ? (
              <div className="rounded-xl border border-dashed border-gray-300 dark:border-slate-700 p-6 text-center">
                <Lock className="mx-auto h-5 w-5 text-gray-400 mb-2" />
                <h4 className="text-xs font-semibold text-gray-900 dark:text-white">
                  Committee Defense Simulator Locked
                </h4>
                <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                  Sign up for a free student account to unlock anticipated supervisor questions and answer strategies.
                </p>
                <div className="mt-3 flex justify-center gap-2">
                  <Link
                    href="/signup"
                    className="rounded-lg bg-gray-900 dark:bg-white px-3 py-1.5 text-xs font-semibold text-white dark:text-gray-900"
                  >
                    Sign Up Free
                  </Link>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50/30 dark:bg-slate-800/20 p-4 text-xs text-gray-500 text-center">
                No committee questions generated for this assessment.
              </div>
            )}
          </section>

          {/* 30-Second Elevator Pitch Card */}
          <section className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-slate-800 pb-4 mb-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-amber-500" />
                  30-Second Supervisor Elevator Pitch
                </h3>
                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                  Spoken script for prospective faculty advisor meetings.
                </p>
              </div>

              {!result.previewLocked && report.elevatorPitch && (
                <button
                  type="button"
                  onClick={handleCopyPitch}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition"
                >
                  {copiedPitch ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Copy Pitch Script
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="rounded-xl bg-gray-50/60 dark:bg-slate-800/40 border border-gray-200/80 dark:border-slate-800 p-4 text-xs italic text-gray-800 dark:text-gray-200 leading-relaxed">
              "{report.elevatorPitch}"
            </div>

            {/* Supervisor Review Advice */}
            <div className="mt-4 space-y-2">
              <span className="text-xs font-semibold text-gray-900 dark:text-white">
                Faculty Review Panel Advice:
              </span>
              <BulletList items={report.plainLanguageAdvice} />
            </div>
          </section>
        </>
      )}
    </div>
  )
}

function NavTabButton({
  active,
  onClick,
  icon,
  label,
  count,
}: {
  active: boolean
  onClick: () => void
  icon: ReactNode
  label: string
  count?: number
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${
        active
          ? "bg-white dark:bg-slate-900 text-gray-900 dark:text-white shadow-xs"
          : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
      }`}
    >
      {icon}
      <span>{label}</span>
      {typeof count === "number" && (
        <span className="ml-0.5 rounded-full bg-slate-200 dark:bg-slate-700 px-1.5 py-0.2 text-[10px] font-bold text-slate-800 dark:text-slate-200">
          {count}
        </span>
      )}
    </button>
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
    <div className="rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/30 p-3.5">
      <div className="flex items-center justify-between text-xs mb-2">
        <span className="font-medium text-gray-700 dark:text-gray-300">Daily Validation Usage</span>
        <span className="text-gray-500 dark:text-gray-400">
          {remaining} of {total} remaining
        </span>
      </div>
      <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }}>
        {Array.from({ length: total }).map((_, index) => (
          <div
            key={index}
            className={`h-1.5 rounded-full ${
              index < used ? "bg-gray-900 dark:bg-white" : "bg-gray-200 dark:bg-slate-800"
            }`}
          />
        ))}
      </div>
    </div>
  )
}

function QuickStat({
  icon,
  label,
  value,
  sub,
}: {
  icon: ReactNode
  label: string
  value: string
  sub?: string
}) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/40 p-2.5 text-center sm:text-left">
      <div className="flex items-center justify-center sm:justify-start gap-1.5 text-[10px] font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
        {icon}
        {label}
      </div>
      <div className="mt-1 text-xs font-semibold text-gray-900 dark:text-white truncate">{value}</div>
      {sub && <div className="text-[10px] text-gray-500 dark:text-gray-400 truncate mt-0.5">{sub}</div>}
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

function LockedPreview({ hiddenSections }: { hiddenSections: string[] }) {
  return (
    <section className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/40 p-6 text-center">
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 mb-3">
        <Lock className="h-4 w-4" />
      </div>
      <h3 className="text-base font-semibold text-gray-900 dark:text-white tracking-tight">
        Sign In to Unlock Complete Implementation Roadmap & Defense Toolkit
      </h3>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto">
        Student authentication provides complete phased schedules, tech architecture, risk mitigations, defense questions, and saved history.
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
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500 dark:bg-emerald-400" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

function getReadinessTone(score: number, tier: "defense_ready" | "refinement_required" | "high_risk") {
  if (tier === "defense_ready" || score >= 85) {
    return {
      label: "Defense Ready",
      ringStroke: "stroke-emerald-500",
      pill: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/40",
      dot: "bg-emerald-500",
    }
  }

  if (tier === "refinement_required" || score >= 65) {
    return {
      label: "Refinement Required",
      ringStroke: "stroke-amber-500",
      pill: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-900/40",
      dot: "bg-amber-500",
    }
  }

  return {
    label: "High Rejection Risk",
    ringStroke: "stroke-rose-500",
    pill: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900/40",
    dot: "bg-rose-500",
  }
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
    }
  }

  if (percent >= 50) {
    return {
      label: "Moderate Viability",
      text: "text-amber-600 dark:text-amber-400",
      pill: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-900/40",
      dot: "bg-amber-500",
      bar: "bg-amber-500",
    }
  }

  return {
    label: "Revision Recommended",
    text: "text-rose-600 dark:text-rose-400",
    pill: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900/40",
    dot: "bg-rose-500",
    bar: "bg-rose-500",
  }
}

function getRecommendationTone(recommendation: string | null) {
  switch (recommendation) {
    case "STRONGLY_RECOMMENDED":
    case "Strongly Recommended":
      return {
        label: "Strong FYP Fit",
        pill: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-900/40",
        icon: <CheckCircle2 className="h-3 w-3 text-emerald-500" />,
      }
    case "RECOMMENDED_WITH_CHANGES":
    case "Recommended with Changes":
      return {
        label: "Approved with Refinements",
        pill: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700",
        icon: <Lightbulb className="h-3 w-3 text-slate-600 dark:text-slate-400" />,
      }
    case "NEEDS_MAJOR_REVISION":
    case "Needs Major Revision":
      return {
        label: "Major Revision Required",
        pill: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/80 dark:border-amber-900/40",
        icon: <AlertTriangle className="h-3 w-3 text-amber-500" />,
      }
    default:
      return {
        label: "Not Recommended",
        pill: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200/80 dark:border-rose-900/40",
        icon: <AlertTriangle className="h-3 w-3 text-rose-500" />,
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
        pill: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-900/40",
        icon: <Sparkles className="h-3 w-3 text-emerald-500" />,
      }
    case "some_overlap":
      return {
        label: "Partial Past Overlap",
        pill: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700",
        icon: <Lightbulb className="h-3 w-3 text-slate-600 dark:text-slate-400" />,
      }
    case "very_similar":
      return {
        label: "High Historic Overlap",
        pill: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/80 dark:border-amber-900/40",
        icon: <AlertTriangle className="h-3 w-3 text-amber-500" />,
      }
    default:
      return {
        label: "Duplicate Work",
        pill: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200/80 dark:border-rose-900/40",
        icon: <AlertTriangle className="h-3 w-3 text-rose-500" />,
      }
  }
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}
