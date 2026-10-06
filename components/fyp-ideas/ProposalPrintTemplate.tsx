"use client"

import { forwardRef } from "react"
import type { ValidationResult, DetailedScore, ScoringBreakdown } from "@/services/fypIdeas.service"

interface ProposalPrintTemplateProps {
  validation: ValidationResult
}

const SCORE_SECTIONS: {
  key: keyof ScoringBreakdown
  title: string
  maxLabel: string
}[] = [
  { key: "problemClarityRelevance", title: "Problem Clarity & Relevance", maxLabel: "20 pts" },
  { key: "ideaExplanationUsability", title: "Architecture & Usability", maxLabel: "20 pts" },
  { key: "keyFeaturesCompleteness", title: "Feature Completeness", maxLabel: "15 pts" },
  { key: "feasibilityResources", title: "Resource & Execution Viability", maxLabel: "10 pts" },
  { key: "originalityNovelty", title: "Novelty & Originality", maxLabel: "10 pts" },
  { key: "impactUsefulness", title: "Practical Industry Impact", maxLabel: "10 pts" },
  { key: "improvementPotential", title: "Expansion & Growth Potential", maxLabel: "15 pts" },
]

export const ProposalPrintTemplate = forwardRef<HTMLDivElement, ProposalPrintTemplateProps>(
  ({ validation }, ref) => {
    const { report, title } = validation
    
    if (!report) return null

    const recommendationLabel = formatRecommendation(validation.recommendation || report.recommendation)
    const originalityLabel = formatOriginality(report.originalityVerdict)

    return (
      <div 
        ref={ref}
        className="w-[800px] bg-white p-10 text-slate-900 space-y-8"
        style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}
      >
        {/* Header Branding */}
        <div className="border-b-2 border-slate-900 pb-6 text-center">
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-3">
            <span>PAF-IAST AI Evaluation Engine</span>
            <span>Report ID: {validation.id ? validation.id.slice(0, 8).toUpperCase() : "FYP-VAL"}</span>
            <span>{new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
          </div>
          <h1 className="text-2xl font-black uppercase tracking-wider text-slate-900">
            Pak-Austria Fachhochschule
          </h1>
          <h2 className="text-base font-semibold text-slate-700 mt-0.5">
            Institute of Applied Sciences and Technology
          </h2>
          <div className="mt-3 inline-block bg-slate-900 text-white text-xs font-bold uppercase tracking-widest px-4 py-1 rounded-full">
            FYP Idea Validation & Feasibility Report
          </div>
        </div>

        {/* Project Title & Score Overview */}
        <div className="space-y-4">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Evaluated Concept
            </div>
            <h3 className="text-2xl font-bold text-slate-900 leading-tight">
              {title || report.plainSummary || "FYP Project Concept"}
            </h3>
          </div>

          <div className="grid grid-cols-[160px_1fr] gap-4 bg-slate-50 p-5 rounded-xl border border-slate-200">
            {/* Score Box */}
            <div className="flex flex-col items-center justify-center p-3 bg-white rounded-lg border border-slate-200 text-center">
              <div className="text-4xl font-extrabold text-slate-900">
                {report.finalScore}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-0.5">
                Score / 100
              </div>
              <div className="mt-2 text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                {report.finalScore >= 75 ? "Strong Candidate" : report.finalScore >= 50 ? "Moderate Viability" : "Needs Revision"}
              </div>
            </div>

            {/* Core Findings */}
            <div className="flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-bold bg-slate-900 text-white">
                    {recommendationLabel}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-bold bg-slate-200 text-slate-800">
                    {originalityLabel}
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {report.plainSummary}
                </p>
                {report.shouldBuild && (
                  <p className="text-xs text-slate-600 leading-relaxed mt-1.5">
                    {report.shouldBuild}
                  </p>
                )}
              </div>

              {/* Quick Metadata */}
              <div className="grid grid-cols-3 gap-2 mt-3 pt-2 border-t border-slate-200/80 text-[11px]">
                <div>
                  <span className="text-slate-500 font-medium">Difficulty: </span>
                  <span className="font-bold text-slate-800 capitalize">{report.difficultyLevel}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Timeline: </span>
                  <span className="font-bold text-slate-800">{report.estimatedTimeline}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Team Fit: </span>
                  <span className="font-bold text-slate-800">{report.teamFit}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 7-Factor Rubrics Breakdown */}
        <div className="space-y-3">
          <div className="border-b border-slate-300 pb-1.5 flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              1. Multi-Factor Rubric Assessment
            </h4>
            <span className="text-[10px] font-medium text-slate-500">7 Evaluated Dimensions</span>
          </div>

          <div className="space-y-2.5">
            {SCORE_SECTIONS.map((sec) => {
              const item = report.scoringBreakdown[sec.key] as DetailedScore
              if (!item) return null
              return (
                <div key={sec.key} className="bg-slate-50/70 p-3 rounded-lg border border-slate-200 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900">{sec.title}</span>
                    <span className="font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                      {item.score} / {item.maxScore}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] mb-1.5">{item.summary}</p>
                  {item.feedback && item.feedback.length > 0 && (
                    <ul className="space-y-0.5 text-[11px] text-slate-700 pl-3">
                      {item.feedback.map((point, idx) => (
                        <li key={idx} className="list-disc leading-tight">
                          {point.replace(/\*\*/g, '')}
                        </li>
                      ))}
                    </ul>
                  )}
                  {item.action && (
                    <div className="mt-1.5 text-[10px] font-medium text-slate-800 bg-slate-100 p-1.5 rounded">
                      <span className="font-bold text-slate-900">Action: </span>{item.action}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Historical FYP Comparison & Similarity Analysis */}
        <div className="space-y-3">
          <div className="border-b border-slate-300 pb-1.5 flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              2. Historical FYP Overlap & Novelty Check
            </h4>
            <span className="text-[11px] font-bold text-slate-800">
              Novelty: {report.originalityScore}/10
            </span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs">
            <p className="text-slate-800 font-medium mb-1">
              {report.originalityReason}
            </p>
            {report.pastIdeaComparisonSummary && (
              <p className="text-slate-600 text-[11px]">
                {report.pastIdeaComparisonSummary}
              </p>
            )}
          </div>

          {report.similarPastIdeas && report.similarPastIdeas.length > 0 ? (
            <div className="space-y-2">
              {report.similarPastIdeas.map((idea, idx) => (
                <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900">{idea.title}</span>
                    <span className="text-[10px] font-semibold bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                      Similarity: {idea.similarityScore}/10
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 mb-1">
                    Batch: {idea.batch} • Group {idea.groupNumber} {idea.supervisor ? `• Supervisor: ${idea.supervisor}` : ""}
                  </div>
                  <p className="text-slate-700 text-[11px] mb-1">{idea.similarityReason}</p>
                  <p className="text-slate-800 text-[11px] font-medium">
                    <span className="text-slate-500">Key Difference: </span>{idea.keyDifference}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-slate-500 italic p-2 bg-slate-50 rounded text-center">
              No direct past FYP overlaps detected in PAF-IAST historical submissions.
            </div>
          )}
        </div>

        {/* Strengths & Potential Concerns */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2">
              Strengths & Advantages
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {report.strongPoints.map((pt, idx) => (
                <li key={idx} className="flex gap-2">
                  <span className="font-bold text-slate-900">•</span>
                  <span>{pt.replace(/\*\*/g, '')}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2">
              Potential Concerns & Pitfalls
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {report.concernPoints.map((pt, idx) => (
                <li key={idx} className="flex gap-2">
                  <span className="font-bold text-slate-900">•</span>
                  <span>{pt.replace(/\*\*/g, '')}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Stakeholders & Value Proposition */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            3. Stakeholder Impact & Value Proposition
          </h4>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="font-bold text-slate-800 block mb-0.5">Target Users:</span>
              <p className="text-slate-600">{report.whoWillUseIt}</p>
            </div>
            <div>
              <span className="font-bold text-slate-800 block mb-0.5">Why It Matters:</span>
              <p className="text-slate-600">{report.whyItMatters}</p>
            </div>
          </div>
          {report.uniquenessImprovements && report.uniquenessImprovements.length > 0 && (
            <div className="pt-2 border-t border-slate-200">
              <span className="font-bold text-slate-800 block mb-1 text-xs">Differentiation Recommendations:</span>
              <ul className="space-y-1 text-xs text-slate-700 pl-3">
                {report.uniquenessImprovements.map((item, idx) => (
                  <li key={idx} className="list-disc leading-tight">
                    {item.replace(/\*\*/g, '')}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* MVP Scope & Action Priorities */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1.5">
            4. MVP Boundary & Next Steps
          </h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
              <span className="font-bold text-slate-900 block mb-1.5">Core MVP Scope</span>
              <ul className="space-y-1 text-[11px] text-slate-700 pl-3">
                {report.mvpRecommendations.map((rec, idx) => (
                  <li key={idx} className="list-disc">{rec.replace(/\*\*/g, '')}</li>
                ))}
              </ul>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
              <span className="font-bold text-slate-900 block mb-1.5">Immediate Actions</span>
              <ul className="space-y-1 text-[11px] text-slate-700 pl-3">
                {report.simpleNextSteps.map((step, idx) => (
                  <li key={idx} className="list-disc">{step.replace(/\*\*/g, '')}</li>
                ))}
              </ul>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
              <span className="font-bold text-slate-900 block mb-1.5">Roadmap Priorities</span>
              <ul className="space-y-1 text-[11px] text-slate-700 pl-3">
                {report.roadmapPriorities.map((prio, idx) => (
                  <li key={idx} className="list-disc">{prio.replace(/\*\*/g, '')}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Technical Architecture & Risk Management */}
        <div className="grid grid-cols-2 gap-4">
          {report.simpleTechDirection && report.simpleTechDirection.length > 0 && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2">
                Suggested Technical Direction
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {report.simpleTechDirection.map((tech, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span className="font-bold text-slate-900">•</span>
                    <span>{tech.replace(/\*\*/g, '')}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {report.riskReductionSteps && report.riskReductionSteps.length > 0 && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2">
                Risk Assessment & Mitigation
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {report.riskReductionSteps.map((risk, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span className="font-bold text-slate-900">•</span>
                    <span>{risk.replace(/\*\*/g, '')}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Implementation Phasing & Roadmap */}
        {report.roadmap && report.roadmap.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1.5">
              5. Implementation Timeline & Phasing
            </h4>
            <div className="space-y-2.5">
              {report.roadmap.map((phase, idx) => (
                <div key={idx} className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                  <div className="flex items-center justify-between mb-1.5 font-bold text-slate-900">
                    <span>Phase {idx + 1}: {phase.phase}</span>
                    <span className="text-[10px] font-medium bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600">
                      {phase.duration}
                    </span>
                  </div>
                  <ul className="space-y-1 text-[11px] text-slate-700 pl-3">
                    {phase.tasks.map((task, taskIdx) => (
                      <li key={taskIdx} className="list-disc">{task.replace(/\*\*/g, '')}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Strategic Elevator Pitch & Supervisor Guidance */}
        <div className="space-y-3">
          {report.elevatorPitch && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2">
                Executive Elevator Pitch
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed text-justify">
                {report.elevatorPitch}
              </p>
            </div>
          )}

          {report.plainLanguageAdvice && report.plainLanguageAdvice.length > 0 && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2">
                Supervisor & Defense Review Advice
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {report.plainLanguageAdvice.map((adv, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span className="font-bold text-slate-900">•</span>
                    <span>{adv.replace(/\*\*/g, '')}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Suggested Advanced Extensions */}
        {report.advancedFeatureSuggestions && report.advancedFeatureSuggestions.length > 0 && (
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2">
              Suggested Future Extensions
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-700">
              {report.advancedFeatureSuggestions.map((feat, idx) => (
                <div key={idx} className="bg-white p-2 rounded border border-slate-200 flex gap-2">
                  <span className="text-slate-400">•</span>
                  <span>{feat.replace(/\*\*/g, '')}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Official Footer */}
        <div className="pt-6 border-t-2 border-slate-200 text-center space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Pak-Austria Fachhochschule: Institute of Applied Sciences and Technology
          </p>
          <p className="text-[11px] text-slate-500">
            Automated Evaluation by FYP Finder AI Validation Engine • For Academic Use Only
          </p>
        </div>
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
