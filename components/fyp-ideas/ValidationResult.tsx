"use client"

import { useState } from "react"
import Link from "next/link"
import { ProposalDownloadButton } from "./ProposalDownloadButton"
import {
  ArrowLeft,
  Check,
  Copy,
  Lock,
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
  { key: "problemClarityRelevance", title: "Problem Clarity & Practical Relevance", maxScore: 20 },
  { key: "ideaExplanationUsability", title: "Architecture, Usability & User Flow", maxScore: 20 },
  { key: "keyFeaturesCompleteness", title: "Core Feature Completeness & Scope", maxScore: 15 },
  { key: "feasibilityResources", title: "Technical Feasibility & Team Resources", maxScore: 10 },
  { key: "originalityNovelty", title: "Novelty & Differentiating Value", maxScore: 10 },
  { key: "impactUsefulness", title: "Industry Relevance & Practical Impact", maxScore: 10 },
  { key: "improvementPotential", title: "Expansion, Scaling & Growth Potential", maxScore: 15 },
]

export function ValidationResult({
  result,
  onReset,
  remainingToday,
}: ValidationResultProps) {
  const report = result.report
  const [copiedPitch, setCopiedPitch] = useState(false)

  if (!report) {
    return (
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center shadow-sm">
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
    if (!report.elevatorPitch) return
    try {
      await navigator.clipboard.writeText(report.elevatorPitch)
      setCopiedPitch(true)
      setTimeout(() => setCopiedPitch(false), 2000)
    } catch {
      // Ignore copy error
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Top action bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={onReset}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Validate another concept
        </button>

        {result.status === "completed" && (
          <ProposalDownloadButton validation={result} />
        )}
      </div>

      {/* Quota Progress */}
      <ProgressTracker
        accessMode={result.accessMode}
        previewLocked={result.previewLocked}
        remainingToday={remainingToday}
      />

      {/* =========================================================================
          MAIN ACADEMIC REPORT DOCUMENT CONTAINER (Matches PDF ProposalPrintTemplate)
          ========================================================================= */}
      <article className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-12 text-slate-900 dark:text-slate-100 shadow-sm leading-relaxed space-y-10">
        
        {/* ================= REPORT HEADER & PROJECT TITLE ================= */}
        <header className="border-b-2 border-slate-900 dark:border-white pb-6 space-y-5">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-3 gap-2">
            <span>AI Evaluation Engine v2.4</span>
            <span>Ref: {result.id ? result.id.slice(0, 8).toUpperCase() : "VAL-PAF"}</span>
          </div>

          <div className="space-y-3.5">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 block mb-1">
                Project Title:
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                {cleanTitle}
              </h1>
            </div>

            {result.problemStatement ? (
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-0.5">
                  Problem Statement:
                </span>
                <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed text-justify">
                  {result.problemStatement}
                </p>
              </div>
            ) : (
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-0.5">
                  Identified Problem Context:
                </span>
                <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed text-justify">
                  {report.whyItMatters || report.plainSummary}
                </p>
              </div>
            )}

            {result.ideaDescription ? (
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-0.5">
                  Proposed Solution:
                </span>
                <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed text-justify">
                  {result.ideaDescription}
                </p>
              </div>
            ) : report.elevatorPitch ? (
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-0.5">
                  Proposed Solution Overview:
                </span>
                <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed text-justify">
                  {report.elevatorPitch}
                </p>
              </div>
            ) : null}

            {result.coreFeatures && (
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-0.5">
                  Submitted Core Features:
                </span>
                <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed text-justify">
                  {result.coreFeatures}
                </p>
              </div>
            )}
          </div>
        </header>

        {/* ================= 02. EVALUATION SCORECARD & MATRIX ================= */}
        <section className="space-y-4">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-2 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 block">
                Section 02
              </span>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                Executive Evaluation Matrix
              </h3>
            </div>
            <div className="sm:text-right">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Composite Score: </span>
              <span className="text-2xl font-black text-slate-900 dark:text-white">{report.finalScore} / 100</span>
            </div>
          </div>

          {/* Executive Evaluation Core Metrics - Minimal Editorial Layout */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 py-3.5 border-y border-slate-200 dark:border-slate-800 text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                Recommendation
              </span>
              <span className="font-extrabold text-slate-900 dark:text-white mt-1 block">
                {recommendationLabel}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                Novelty
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 mt-1 block">
                {originalityLabel} ({report.originalityScore}/10)
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                Difficulty
              </span>
              <span className="font-semibold capitalize text-slate-800 dark:text-slate-200 mt-1 block">
                {report.difficultyLevel}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                Team Fit
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 mt-1 block">
                {report.teamFit}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                Hardware
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 mt-1 block">
                {report.hardwareRequirement?.isSoftwareOnly ? "Software Only ($0 Tier)" : "Hardware Required"}
              </span>
            </div>
          </div>

          {/* Timeline in bullet points */}
          <div className="pt-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-1.5">
              Project Timeline & Milestone Targets:
            </span>
            <ul className="space-y-1 pl-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              <li className="list-disc leading-relaxed">
                <strong>Estimated Overall Duration:</strong> {report.estimatedTimeline}
              </li>
              <li className="list-disc leading-relaxed">
                <strong>Midterm Defense Milestone:</strong> Core MVP prototype & functional evaluation (Semester 7)
              </li>
              <li className="list-disc leading-relaxed">
                <strong>Final Defense Milestone:</strong> Full system integration, testing & capstone documentation (Semester 8)
              </li>
            </ul>
          </div>

          {/* Evaluation Matrix Table */}
          <div className="pt-2 overflow-x-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-2">
              Multi-Criteria Rubric Scorecard:
            </span>
            <table className="w-full border-collapse text-xs min-w-[500px]">
              <thead>
                <tr className="border-b-2 border-slate-300 dark:border-slate-700 text-left text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase">
                  <th className="py-2 pr-4">Evaluation Dimension</th>
                  <th className="py-2 px-3 text-center w-24">Max Pts</th>
                  <th className="py-2 px-3 text-center w-24">Awarded</th>
                  <th className="py-2 pl-4 w-48">Score Gauge</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {RUBRICS.map((rubric) => {
                  const item = report.scoringBreakdown[rubric.key] as DetailedScore
                  const score = item ? item.score : 0
                  const percent = Math.round((score / rubric.maxScore) * 100)
                  return (
                    <tr key={rubric.key} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="py-2.5 pr-4 font-semibold text-slate-800 dark:text-slate-200">
                        {rubric.title}
                      </td>
                      <td className="py-2.5 px-3 text-center text-slate-500 dark:text-slate-400 font-medium">
                        {rubric.maxScore}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-slate-900 dark:text-white">
                        {score}
                      </td>
                      <td className="py-2.5 pl-4">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-slate-800 dark:bg-slate-200 rounded-full"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 w-8 text-right">
                            {percent}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                <tr className="border-t-2 border-slate-900 dark:border-white font-bold bg-slate-50 dark:bg-slate-800/60">
                  <td className="py-2.5 pr-4 uppercase text-slate-900 dark:text-white">
                    Total Calculated Score
                  </td>
                  <td className="py-2.5 px-3 text-center text-slate-700 dark:text-slate-300">100</td>
                  <td className="py-2.5 px-3 text-center text-slate-900 dark:text-white text-sm">
                    {report.finalScore}
                  </td>
                  <td className="py-2.5 pl-4">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-slate-900 dark:bg-white rounded-full"
                          style={{ width: `${report.finalScore}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-black text-slate-900 dark:text-white w-8 text-right">
                        {report.finalScore}%
                      </span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Strategic Summary note */}
          <div className="pt-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300 space-y-2">
            <p className="leading-relaxed">
              <strong className="text-slate-900 dark:text-white">Executive Summary: </strong>
              {report.plainSummary}
            </p>
            {report.goldenDirective && (
              <p className="leading-relaxed">
                <strong className="text-slate-900 dark:text-white">Supervisor Directive: </strong>
                {report.goldenDirective}
              </p>
            )}
            {report.shouldBuild && (
              <p className="leading-relaxed">
                <strong className="text-slate-900 dark:text-white">Viability Assessment: </strong>
                {report.shouldBuild}
              </p>
            )}
          </div>
        </section>

        {/* ================= 03. DETAILED RUBRIC FEEDBACK & ACTION ITEMS ================= */}
        <section className="space-y-4">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 block">
              Section 03
            </span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">
              Granular Rubric Feedback & Actions
            </h3>
          </div>

          <div className="space-y-4">
            {RUBRICS.map((rubric, idx) => {
              const item = report.scoringBreakdown[rubric.key] as DetailedScore
              if (!item) return null
              return (
                <div key={rubric.key} className="space-y-1.5 text-xs sm:text-sm">
                  <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                    <span>3.{idx + 1} {rubric.title}</span>
                    <span className="text-[11px] font-extrabold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                      {item.score}/{item.maxScore}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-xs italic pl-2 border-l-2 border-slate-300 dark:border-slate-700">
                    {item.summary}
                  </p>
                  {item.feedback && item.feedback.length > 0 && (
                    <ul className="space-y-1 pl-4 text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
                      {item.feedback.map((point, fIdx) => (
                        <li key={fIdx} className="list-disc leading-relaxed">
                          {point.replace(/\*\*/g, "")}
                        </li>
                      ))}
                    </ul>
                  )}
                  {item.action && (
                    <p className="text-xs font-medium text-slate-900 dark:text-white pl-4 pt-0.5">
                      <strong>Recommended Action:</strong> {item.action}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        {/* ================= 04. BENCHMARKED PREVIOUS FYP SUBMISSIONS & NOVELTY ANALYSIS ================= */}
        <section className="space-y-4">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-2 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 block">
                Section 04
              </span>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                Benchmarked Previous FYP Submissions & Novelty Analysis
              </h3>
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Novelty: {report.originalityScore} / 10
            </span>
          </div>

          <div className="space-y-2 text-xs sm:text-sm">
            <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
              <strong>Novelty Verdict: </strong>{report.originalityReason}
            </p>
            {report.pastIdeaComparisonSummary && (
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                <strong>Benchmarking Summary: </strong>{report.pastIdeaComparisonSummary}
              </p>
            )}
          </div>

          <div className="space-y-3 pt-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block">
              Matching Previous FYP Submissions:
            </span>
            {report.similarPastIdeas && report.similarPastIdeas.length > 0 ? (
              <div className="space-y-3">
                {report.similarPastIdeas.map((past, idx) => (
                  <div key={idx} className="border-l-2 border-slate-400 dark:border-slate-600 pl-3 space-y-1 text-xs sm:text-sm">
                    <div className="flex items-center justify-between">
                      <strong className="text-slate-900 dark:text-white text-sm">{past.title}</strong>
                      <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">
                        Similarity: {past.similarityScore} / 10
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      Batch: {past.batch} • Group {past.groupNumber} {past.supervisor ? `• Supervisor: ${past.supervisor}` : ""}
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 text-xs">
                      • <strong>Matching Context:</strong> {past.similarityReason}
                    </p>
                    <p className="text-slate-900 dark:text-white text-xs font-medium">
                      • <strong>Key Technical Difference:</strong> {past.keyDifference}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400 italic pl-2">
                No direct duplicate projects identified in PAF-IAST previous submissions.
              </p>
            )}
          </div>
        </section>

        {/* ================= 05. STRENGTHS & CONCERNS ================= */}
        <section className="space-y-4">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 block">
              Section 05
            </span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">
              Strengths & Critical Risk Points
            </h3>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 text-xs sm:text-sm">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-2">
                Key Strengths & Project Advantages:
              </h4>
              <ul className="space-y-1.5 pl-4 text-slate-700 dark:text-slate-300">
                {report.strongPoints.map((pt, idx) => (
                  <li key={idx} className="list-disc leading-relaxed">
                    {pt.replace(/\*\*/g, "")}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-2">
                Potential Concerns & Technical Pitfalls:
              </h4>
              <ul className="space-y-1.5 pl-4 text-slate-700 dark:text-slate-300">
                {report.concernPoints.map((pt, idx) => (
                  <li key={idx} className="list-disc leading-relaxed">
                    {pt.replace(/\*\*/g, "")}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ================= 06. TARGET STAKEHOLDERS & DIFFERENTIATION ================= */}
        <section className="space-y-4">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 block">
              Section 06
            </span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">
              Stakeholders & Differentiation Strategy
            </h3>
          </div>

          <div className="space-y-3 text-xs sm:text-sm">
            <div>
              <span className="font-bold text-slate-900 dark:text-white block mb-0.5">Primary Target Audience:</span>
              <p className="text-slate-700 dark:text-slate-300">{report.whoWillUseIt}</p>
            </div>

            <div>
              <span className="font-bold text-slate-900 dark:text-white block mb-0.5">Industry Relevance & Practical Value:</span>
              <p className="text-slate-700 dark:text-slate-300">{report.whyItMatters}</p>
            </div>

            {report.uniquenessImprovements && report.uniquenessImprovements.length > 0 && (
              <div>
                <span className="font-bold text-slate-900 dark:text-white block mb-1">Recommended Differentiation Strategies:</span>
                <ul className="space-y-1 pl-4 text-slate-700 dark:text-slate-300">
                  {report.uniquenessImprovements.map((item, idx) => (
                    <li key={idx} className="list-disc leading-relaxed">
                      {item.replace(/\*\*/g, "")}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>

        {/* ================= 07. MVP SCOPE & ACTION PRIORITIES ================= */}
        <section className="space-y-4">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 block">
              Section 07
            </span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">
              MVP Boundary & Action Priorities
            </h3>
          </div>

          <div className="space-y-3 text-xs sm:text-sm">
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-1">Core MVP Deliverables (Midterm Defense Scope):</h4>
              <ul className="space-y-1 pl-4 text-slate-700 dark:text-slate-300">
                {report.mvpRecommendations.map((rec, idx) => (
                  <li key={idx} className="list-disc leading-relaxed">{rec.replace(/\*\*/g, "")}</li>
                ))}
              </ul>
            </div>

            {report.simpleNextSteps && report.simpleNextSteps.length > 0 && (
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-1">Immediate 7-Day Next Steps:</h4>
                <ul className="space-y-1 pl-4 text-slate-700 dark:text-slate-300">
                  {report.simpleNextSteps.map((step, idx) => (
                    <li key={idx} className="list-disc leading-relaxed">{step.replace(/\*\*/g, "")}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>

        {/* ================= 08. TECHNICAL ARCHITECTURE & RISK PROTOCOLS ================= */}
        {!result.previewLocked ? (
          <>
            <section className="space-y-4">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 block">
                  Section 08
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                  Technical Architecture & Risk Protocols
                </h3>
              </div>

              <div className="space-y-3 text-xs sm:text-sm">
                {report.simpleTechDirection && report.simpleTechDirection.length > 0 && (
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white mb-1">Recommended Tech Stack & Architecture:</h4>
                    <ul className="space-y-1 pl-4 text-slate-700 dark:text-slate-300">
                      {report.simpleTechDirection.map((tech, idx) => (
                        <li key={idx} className="list-disc leading-relaxed">{tech.replace(/\*\*/g, "")}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {report.riskReductionSteps && report.riskReductionSteps.length > 0 && (
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white mb-1">Risk Mitigation Protocol:</h4>
                    <ul className="space-y-1 pl-4 text-slate-700 dark:text-slate-300">
                      {report.riskReductionSteps.map((risk, idx) => (
                        <li key={idx} className="list-disc leading-relaxed">{risk.replace(/\*\*/g, "")}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </section>

            {/* ================= 09. PHASED IMPLEMENTATION TIMELINE ================= */}
            {report.roadmap && report.roadmap.length > 0 && (
              <section className="space-y-4">
                <div className="border-b border-slate-200 dark:border-slate-800 pb-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 block">
                    Section 09
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                    Phased Implementation Roadmap
                  </h3>
                </div>

                <div className="space-y-3 text-xs sm:text-sm">
                  {report.roadmap.map((phase, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                        <span>Phase {idx + 1}: {phase.phase}</span>
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Duration: {phase.duration}</span>
                      </div>
                      <ul className="space-y-1 pl-4 text-slate-700 dark:text-slate-300">
                        {phase.tasks.map((task, taskIdx) => (
                          <li key={taskIdx} className="list-disc leading-relaxed">{task.replace(/\*\*/g, "")}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ================= 10. ELEVATOR PITCH & SUPERVISOR DEFENSE ================= */}
            <section className="space-y-4">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 block">
                  Section 10
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                  Pitch, Defense Guidance & Future Enhancements
                </h3>
              </div>

              <div className="space-y-3 text-xs sm:text-sm">
                {report.elevatorPitch && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-slate-900 dark:text-white">Executive Elevator Pitch:</h4>
                      <button
                        type="button"
                        onClick={handleCopyPitch}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
                      >
                        {copiedPitch ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-500" />
                            <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            <span>Copy Script</span>
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-justify pl-2 border-l-2 border-slate-300 dark:border-slate-700 italic">
                      "{report.elevatorPitch}"
                    </p>
                  </div>
                )}

                {report.plainLanguageAdvice && report.plainLanguageAdvice.length > 0 && (
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white mb-1">Supervisor & Panel Defense Advice:</h4>
                    <ul className="space-y-1 pl-4 text-slate-700 dark:text-slate-300">
                      {report.plainLanguageAdvice.map((adv, idx) => (
                        <li key={idx} className="list-disc leading-relaxed">{adv.replace(/\*\*/g, "")}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {report.defenseQuestions && report.defenseQuestions.length > 0 && (
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white mb-1">
                      Anticipated Committee Defense Questions & Strategy:
                    </h4>
                    <div className="space-y-2.5 pl-2 border-l-2 border-slate-300 dark:border-slate-700">
                      {report.defenseQuestions.map((item, idx) => (
                        <div key={idx} className="space-y-0.5">
                          <p className="font-semibold text-slate-900 dark:text-white">
                            Q{idx + 1}: {item.question}
                          </p>
                          <p className="text-slate-600 dark:text-slate-400 italic text-xs">
                            Defense Strategy: {item.suggestedAnswerStrategy}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {report.advancedFeatureSuggestions && report.advancedFeatureSuggestions.length > 0 && (
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white mb-1">Suggested Long-Term Extensions:</h4>
                    <ul className="space-y-1 pl-4 text-slate-700 dark:text-slate-300">
                      {report.advancedFeatureSuggestions.map((feat, idx) => (
                        <li key={idx} className="list-disc leading-relaxed">{feat.replace(/\*\*/g, "")}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </section>
          </>
        ) : (
          <LockedPreview hiddenSections={result.hiddenSections} />
        )}

        {/* ================= OFFICIAL ACADEMIC FOOTER ================= */}
        <footer className="pt-8 border-t-2 border-slate-900 dark:border-white mt-12 text-center text-xs space-y-1">
          <p className="font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            Pak-Austria Fachhochschule: Institute of Applied Sciences and Technology (PAF-IAST)
          </p>
          <p className="text-slate-500 dark:text-slate-400 text-[11px]">
            This validation assessment report is generated via the PAF-IAST FYP Evaluation Platform.
          </p>
          <p className="text-slate-400 dark:text-slate-500 text-[10px]">
            Confidential • Prepared for Academic & Capstone Project Review
          </p>
        </footer>
      </article>
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
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 p-3.5">
      <div className="flex items-center justify-between text-xs mb-2">
        <span className="font-medium text-slate-700 dark:text-slate-300">Daily Validation Usage</span>
        <span className="text-slate-500 dark:text-slate-400">
          {remaining} of {total} remaining
        </span>
      </div>
      <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }}>
        {Array.from({ length: total }).map((_, index) => (
          <div
            key={index}
            className={`h-1.5 rounded-full ${
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
    <section className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center space-y-3">
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
        <Lock className="h-4 w-4" />
      </div>
      <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
        Sign In to Unlock Full Implementation Roadmap & Defense Protocols
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
        Student authentication provides complete phased schedules, tech architecture, risk mitigations, defense question strategies, and saved history.
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
          className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
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
      return "Major Revision Required"
    case "NOT_RECOMMENDED":
    case "Not Recommended":
      return "Not Recommended"
    default:
      return rec || "Evaluation Completed"
  }
}

function formatOriginality(verdict: string | null | undefined): string {
  switch (verdict) {
    case "appears_unique":
      return "Novel & Differentiated"
    case "some_overlap":
      return "Partial Past Overlap"
    case "very_similar":
      return "High Historical Overlap"
    case "already_done":
      return "Duplicate Work"
    default:
      return "Novelty Verified"
  }
}
