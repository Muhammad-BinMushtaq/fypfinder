"use client"

import { forwardRef } from "react"
import type { ValidationResult, DetailedScore, ScoringBreakdown } from "@/services/fypIdeas.service"

interface ProposalPrintTemplateProps {
  validation: ValidationResult & {
    problemStatement?: string
    ideaDescription?: string
    coreFeatures?: string
    teamSize?: number | null
  }
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

export const ProposalPrintTemplate = forwardRef<HTMLDivElement, ProposalPrintTemplateProps>(
  ({ validation }, ref) => {
    const { report, title } = validation

    if (!report) return null

    const rawTitle = title || report.plainSummary || "FYP Capstone Project Proposal"
    const cleanTitle = rawTitle.replace(/^\[[^\]]+\]\s*/, "")

    const recommendationLabel = formatRecommendation(validation.recommendation || report.recommendation)
    const originalityLabel = formatOriginality(report.originalityVerdict)

    return (
      <div
        ref={ref}
        className="w-[820px] bg-white p-10 text-slate-900 leading-relaxed space-y-6"
        style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
      >
        {/* HEADER */}
        <header className="border-b-2 border-slate-900 pb-4 flex items-end justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Pak-Austria Fachhochschule (PAF-IAST) · FYPMate Evaluation Summary
            </p>
            <h1 className="text-xl font-black text-slate-900 mt-1">
              {cleanTitle}
            </h1>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Overall Score</span>
            <span className="text-2xl font-black text-slate-900">{report.finalScore} / 100</span>
          </div>
        </header>

        {/* 1. VERDICT & KEY METRICS */}
        <section className="space-y-3">
          <div className="grid grid-cols-4 gap-3 text-xs border border-slate-200 rounded-lg p-3 bg-slate-50">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Verdict</span>
              <strong className="text-slate-900">{recommendationLabel}</strong>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Novelty</span>
              <strong className="text-slate-900">{report.originalityScore}/10 ({originalityLabel})</strong>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Complexity</span>
              <strong className="capitalize text-slate-900">{report.difficultyLevel}</strong>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Team Fit</span>
              <strong className="text-slate-900">{report.teamFit}</strong>
            </div>
          </div>

          <p className="text-xs text-slate-700 leading-relaxed">
            <strong>Summary: </strong>{report.plainSummary}
          </p>

          {(report.goldenDirective || report.shouldBuild) && (
            <p className="text-xs text-slate-900 bg-slate-100 p-3 rounded-lg border border-slate-200">
              <strong>Key Recommendation: </strong>{report.goldenDirective || report.shouldBuild}
            </p>
          )}
        </section>

        {/* 2. PAST PAF-IAST PROJECTS MATCH */}
        <section className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
            PAF-IAST Past Submissions Check
          </h2>
          <p className="text-xs text-slate-700">{report.originalityReason}</p>
          {report.similarPastIdeas && report.similarPastIdeas.length > 0 && (
            <div className="grid grid-cols-2 gap-3 pt-1">
              {report.similarPastIdeas.slice(0, 4).map((past, idx) => (
                <div key={idx} className="border border-slate-200 rounded p-2.5 text-xs space-y-1">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>{past.title}</span>
                    <span>{past.similarityScore}/10</span>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Batch {past.batch} · Group {past.groupNumber}
                  </div>
                  <p className="text-[11px] text-slate-700">
                    <strong>Difference needed: </strong>{past.keyDifference}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 3. MVP BLUEPRINT & RISKS (2 COLUMNS) */}
        <section className="grid grid-cols-2 gap-5">
          <div className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
              Core MVP Scope & Tech Stack
            </h2>
            <ul className="space-y-1 pl-4 text-xs text-slate-700">
              {report.mvpRecommendations.slice(0, 5).map((rec, idx) => (
                <li key={idx} className="list-disc">{rec.replace(/\*\*/g, "")}</li>
              ))}
            </ul>
            {report.simpleTechDirection && report.simpleTechDirection.length > 0 && (
              <div className="pt-1">
                <strong className="text-xs text-slate-900 block mb-1">Tech Stack:</strong>
                <ul className="space-y-1 pl-4 text-xs text-slate-700">
                  {report.simpleTechDirection.slice(0, 3).map((t, idx) => (
                    <li key={idx} className="list-disc">{t.replace(/\*\*/g, "")}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
              Key Risks & Immediate Actions
            </h2>
            <ul className="space-y-1 pl-4 text-xs text-slate-700">
              {report.concernPoints.slice(0, 4).map((pt, idx) => (
                <li key={idx} className="list-disc">{pt.replace(/\*\*/g, "")}</li>
              ))}
            </ul>
            {report.simpleNextSteps && report.simpleNextSteps.length > 0 && (
              <div className="pt-1">
                <strong className="text-xs text-slate-900 block mb-1">Next Steps:</strong>
                <ul className="space-y-1 pl-4 text-xs text-slate-700">
                  {report.simpleNextSteps.slice(0, 3).map((s, idx) => (
                    <li key={idx} className="list-disc">{s.replace(/\*\*/g, "")}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>

        {/* 4. COMPACT RUBRIC SCORECARD & DEFENSE QUESTIONS */}
        <section className="grid grid-cols-2 gap-5 pt-1">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2">
              Rubric Scorecard
            </h2>
            <table className="w-full text-xs border-collapse">
              <tbody>
                {RUBRICS.map((r) => {
                  const item = report.scoringBreakdown[r.key] as DetailedScore
                  return (
                    <tr key={r.key} className="border-b border-slate-100">
                      <td className="py-1 font-medium text-slate-800">{r.title}</td>
                      <td className="py-1 text-right font-bold text-slate-900">
                        {item ? item.score : 0} / {r.maxScore}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {report.defenseQuestions && report.defenseQuestions.length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2">
                Defense Panel Questions
              </h2>
              <div className="space-y-2 text-xs">
                {report.defenseQuestions.slice(0, 3).map((q, idx) => (
                  <div key={idx}>
                    <p className="font-bold text-slate-900">Q{idx + 1}: {q.question}</p>
                    <p className="text-slate-600 text-[11px]">Answer: {q.suggestedAnswerStrategy}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    )
  }
)

ProposalPrintTemplate.displayName = "ProposalPrintTemplate"

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
