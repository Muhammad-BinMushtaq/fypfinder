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
  { key: "problemClarityRelevance", title: "Problem Clarity & Practical Relevance", maxScore: 20 },
  { key: "ideaExplanationUsability", title: "Architecture, Usability & User Flow", maxScore: 20 },
  { key: "keyFeaturesCompleteness", title: "Core Feature Completeness & Scope", maxScore: 15 },
  { key: "feasibilityResources", title: "Technical Feasibility & Team Resources", maxScore: 10 },
  { key: "originalityNovelty", title: "Novelty & Differentiating Value", maxScore: 10 },
  { key: "impactUsefulness", title: "Industry Relevance & Practical Impact", maxScore: 10 },
  { key: "improvementPotential", title: "Expansion, Scaling & Growth Potential", maxScore: 15 },
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
        className="w-[820px] bg-white p-12 text-slate-900 leading-relaxed"
        style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
      >
        {/* ================= HEADER & INSTITUTIONAL BRANDING ================= */}
        <header className="border-b-2 border-slate-900 pb-5 mb-8">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
            <span>Pak-Austria Fachhochschule (PAF-IAST)</span>
            <span>AI Evaluation Engine v2.4</span>
            <span>Ref: {validation.id ? validation.id.slice(0, 8).toUpperCase() : "VAL-PAF"}</span>
          </div>

          <div className="text-center my-3">
            <h1 className="text-2xl font-black uppercase tracking-wider text-slate-900">
              Pak-Austria Fachhochschule
            </h1>
            <h2 className="text-sm font-semibold text-slate-700 tracking-wide mt-0.5">
              Institute of Applied Sciences and Technology
            </h2>
            <div className="mt-3 inline-block bg-slate-900 text-white text-[11px] font-bold uppercase tracking-widest px-5 py-1 rounded-full">
              FYP Idea Validation & Feasibility Assessment Report
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200 mt-3 font-medium">
            <span>Assessment Date: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
            <span>Category: Final Year Project (BS Computing / Engineering)</span>
          </div>
        </header>

        <div className="space-y-8">
          {/* ================= 01. PROPOSAL TITLE & SUBMITTED DETAILS ================= */}
          <section className="space-y-4">
            <div className="border-b border-slate-200 pb-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 block">
                Section 01
              </span>
              <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">
                Project Overview & Submitted Concept
              </h3>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-0.5">Project Title:</span>
                <p className="text-xl font-black text-slate-900 leading-snug">
                  {title || report.plainSummary || "FYP Capstone Project Proposal"}
                </p>
              </div>

              {validation.problemStatement ? (
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-0.5">Problem Statement:</span>
                  <p className="text-xs text-slate-800 leading-relaxed text-justify">
                    {validation.problemStatement}
                  </p>
                </div>
              ) : (
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-0.5">Identified Problem Context:</span>
                  <p className="text-xs text-slate-800 leading-relaxed text-justify">
                    {report.whyItMatters || report.plainSummary}
                  </p>
                </div>
              )}

              {validation.ideaDescription ? (
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-0.5">Proposed Solution:</span>
                  <p className="text-xs text-slate-800 leading-relaxed text-justify">
                    {validation.ideaDescription}
                  </p>
                </div>
              ) : report.elevatorPitch ? (
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-0.5">Proposed Solution Overview:</span>
                  <p className="text-xs text-slate-800 leading-relaxed text-justify">
                    {report.elevatorPitch}
                  </p>
                </div>
              ) : null}

              {validation.coreFeatures && (
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-0.5">Submitted Core Features:</span>
                  <p className="text-xs text-slate-800 leading-relaxed text-justify">
                    {validation.coreFeatures}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* ================= 02. EVALUATION SCORECARD & MATRIX ================= */}
          <section className="space-y-4">
            <div className="border-b border-slate-200 pb-2 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 block">
                  Section 02
                </span>
                <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">
                  Executive Evaluation Matrix
                </h3>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-slate-500 uppercase">Composite Score: </span>
                <span className="text-2xl font-black text-slate-900">{report.finalScore} / 100</span>
              </div>
            </div>

            {/* Verdict summary line */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
              <span className="bg-slate-900 text-white font-bold px-3 py-1 rounded text-xs">
                Recommendation: {recommendationLabel}
              </span>
              <span className="bg-slate-100 text-slate-800 font-bold px-3 py-1 rounded border border-slate-300 text-xs">
                Novelty: {originalityLabel} ({report.originalityScore}/10)
              </span>
              <span className="bg-slate-50 text-slate-700 px-2.5 py-1 rounded border border-slate-200 text-xs">
                Difficulty: <strong className="capitalize text-slate-900">{report.difficultyLevel}</strong>
              </span>
              <span className="bg-slate-50 text-slate-700 px-2.5 py-1 rounded border border-slate-200 text-xs">
                Timeline: <strong className="text-slate-900">{report.estimatedTimeline}</strong>
              </span>
              <span className="bg-slate-50 text-slate-700 px-2.5 py-1 rounded border border-slate-200 text-xs">
                Team Fit: <strong className="text-slate-900">{report.teamFit}</strong>
              </span>
            </div>

            {/* Evaluation Matrix Table */}
            <div className="pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-2">
                Multi-Criteria Rubric Scorecard:
              </span>
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="border-b-2 border-slate-300 text-left text-[11px] font-bold text-slate-600 uppercase">
                    <th className="py-2 pr-4">Evaluation Dimension</th>
                    <th className="py-2 px-3 text-center w-24">Max Pts</th>
                    <th className="py-2 px-3 text-center w-24">Awarded</th>
                    <th className="py-2 pl-4 w-48">Score Gauge</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {RUBRICS.map((rubric) => {
                    const item = report.scoringBreakdown[rubric.key] as DetailedScore
                    const score = item ? item.score : 0
                    const percent = Math.round((score / rubric.maxScore) * 100)
                    return (
                      <tr key={rubric.key} className="hover:bg-slate-50">
                        <td className="py-2.5 pr-4 font-semibold text-slate-800">
                          {rubric.title}
                        </td>
                        <td className="py-2.5 px-3 text-center text-slate-500 font-medium">
                          {rubric.maxScore}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-slate-900">
                          {score}
                        </td>
                        <td className="py-2.5 pl-4">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-slate-800 rounded-full" 
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-bold text-slate-600 w-8 text-right">
                              {percent}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                  <tr className="border-t-2 border-slate-900 font-bold bg-slate-50">
                    <td className="py-2.5 pr-4 uppercase text-slate-900">
                      Total Calculated Score
                    </td>
                    <td className="py-2.5 px-3 text-center text-slate-700">100</td>
                    <td className="py-2.5 px-3 text-center text-slate-900 text-sm">
                      {report.finalScore}
                    </td>
                    <td className="py-2.5 pl-4">
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-slate-900 rounded-full" 
                            style={{ width: `${report.finalScore}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-black text-slate-900 w-8 text-right">
                          {report.finalScore}%
                        </span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Strategic Summary note */}
            <div className="pt-2 text-xs text-slate-700 space-y-1.5">
              <p className="leading-relaxed">
                <strong className="text-slate-900">Executive Summary: </strong>
                {report.plainSummary}
              </p>
              {report.shouldBuild && (
                <p className="leading-relaxed">
                  <strong className="text-slate-900">Viability Assessment: </strong>
                  {report.shouldBuild}
                </p>
              )}
            </div>
          </section>

          {/* ================= 03. DETAILED RUBRIC FEEDBACK & ACTION ITEMS ================= */}
          <section className="space-y-4">
            <div className="border-b border-slate-200 pb-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 block">
                Section 03
              </span>
              <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">
                Granular Rubric Feedback & Actions
              </h3>
            </div>

            <div className="space-y-4">
              {RUBRICS.map((rubric, idx) => {
                const item = report.scoringBreakdown[rubric.key] as DetailedScore
                if (!item) return null
                return (
                  <div key={rubric.key} className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span>3.{idx + 1} {rubric.title}</span>
                      <span className="text-[11px] font-extrabold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        Score: {item.score} / {item.maxScore}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px] italic pl-2 border-l-2 border-slate-300">
                      {item.summary}
                    </p>
                    {item.feedback && item.feedback.length > 0 && (
                      <ul className="space-y-1 pl-4 text-slate-700 text-xs">
                        {item.feedback.map((point, fIdx) => (
                          <li key={fIdx} className="list-disc leading-relaxed">
                            {point.replace(/\*\*/g, '')}
                          </li>
                        ))}
                      </ul>
                    )}
                    {item.action && (
                      <p className="text-[11px] font-medium text-slate-900 pl-4">
                        <strong>Recommended Action:</strong> {item.action}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </section>

          {/* ================= 04. HISTORICAL OVERLAP & PAST PAF-IAST PROJECTS ================= */}
          <section className="space-y-4">
            <div className="border-b border-slate-200 pb-2 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 block">
                  Section 04
                </span>
                <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">
                  Historical FYP Overlap & Novelty Analysis
                </h3>
              </div>
              <span className="text-xs font-bold text-slate-800">
                Originality: {report.originalityScore} / 10
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <p className="text-slate-800 leading-relaxed font-medium">
                <strong>Novelty Verdict: </strong>{report.originalityReason}
              </p>
              {report.pastIdeaComparisonSummary && (
                <p className="text-slate-600 leading-relaxed">
                  <strong>Benchmarking Summary: </strong>{report.pastIdeaComparisonSummary}
                </p>
              )}
            </div>

            <div className="space-y-3 pt-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                Benchmarked Past FYP Submissions:
              </span>
              {report.similarPastIdeas && report.similarPastIdeas.length > 0 ? (
                <div className="space-y-3">
                  {report.similarPastIdeas.map((past, idx) => (
                    <div key={idx} className="border-l-2 border-slate-400 pl-3 space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-900 text-sm">{past.title}</strong>
                        <span className="text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                          Similarity: {past.similarityScore} / 10
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        Batch: {past.batch} • Group {past.groupNumber} {past.supervisor ? `• Supervisor: ${past.supervisor}` : ""}
                      </div>
                      <p className="text-slate-700 text-xs">
                        • <strong>Overlap Rationale:</strong> {past.similarityReason}
                      </p>
                      <p className="text-slate-800 text-xs">
                        • <strong>Key Technical Difference:</strong> {past.keyDifference}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic pl-2">
                  No direct overlapping projects identified in PAF-IAST historical repository.
                </p>
              )}
            </div>
          </section>

          {/* ================= 05. STRENGTHS & CONCERNS ================= */}
          <section className="space-y-4">
            <div className="border-b border-slate-200 pb-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 block">
                Section 05
              </span>
              <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">
                Strengths & Critical Risk Points
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2">
                  Key Strengths & Project Advantages:
                </h4>
                <ul className="space-y-1.5 pl-4 text-xs text-slate-700">
                  {report.strongPoints.map((pt, idx) => (
                    <li key={idx} className="list-disc leading-relaxed">
                      {pt.replace(/\*\*/g, '')}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2">
                  Potential Concerns & Technical Pitfalls:
                </h4>
                <ul className="space-y-1.5 pl-4 text-xs text-slate-700">
                  {report.concernPoints.map((pt, idx) => (
                    <li key={idx} className="list-disc leading-relaxed">
                      {pt.replace(/\*\*/g, '')}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* ================= 06. TARGET STAKEHOLDERS & DIFFERENTIATION ================= */}
          <section className="space-y-4">
            <div className="border-b border-slate-200 pb-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 block">
                Section 06
              </span>
              <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">
                Stakeholders & Differentiation Strategy
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="font-bold text-slate-900 block mb-0.5">Primary Target Audience:</span>
                <p className="text-slate-700">{report.whoWillUseIt}</p>
              </div>

              <div>
                <span className="font-bold text-slate-900 block mb-0.5">Industry Relevance & Practical Value:</span>
                <p className="text-slate-700">{report.whyItMatters}</p>
              </div>

              {report.uniquenessImprovements && report.uniquenessImprovements.length > 0 && (
                <div>
                  <span className="font-bold text-slate-900 block mb-1">Recommended Differentiation Strategies:</span>
                  <ul className="space-y-1 pl-4 text-slate-700">
                    {report.uniquenessImprovements.map((item, idx) => (
                      <li key={idx} className="list-disc leading-relaxed">
                        {item.replace(/\*\*/g, '')}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>

          {/* ================= 07. MVP SCOPE & ACTION PRIORITIES ================= */}
          <section className="space-y-4">
            <div className="border-b border-slate-200 pb-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 block">
                Section 07
              </span>
              <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">
                MVP Boundary & Action Priorities
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <h4 className="font-bold text-slate-900 mb-1">1. Minimum Viable Product (MVP) Core Scope:</h4>
                <ul className="space-y-1 pl-4 text-slate-700">
                  {report.mvpRecommendations.map((rec, idx) => (
                    <li key={idx} className="list-disc leading-relaxed">{rec.replace(/\*\*/g, '')}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-1">2. Immediate Preparation Actions:</h4>
                <ul className="space-y-1 pl-4 text-slate-700">
                  {report.simpleNextSteps.map((step, idx) => (
                    <li key={idx} className="list-disc leading-relaxed">{step.replace(/\*\*/g, '')}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-1">3. Implementation Priorities:</h4>
                <ul className="space-y-1 pl-4 text-slate-700">
                  {report.roadmapPriorities.map((prio, idx) => (
                    <li key={idx} className="list-disc leading-relaxed">{prio.replace(/\*\*/g, '')}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* ================= 08. TECHNICAL STACK & RISK MITIGATION ================= */}
          <section className="space-y-4">
            <div className="border-b border-slate-200 pb-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 block">
                Section 08
              </span>
              <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">
                Technical Stack & Risk Management
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              {report.simpleTechDirection && report.simpleTechDirection.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Recommended Technology Stack:</h4>
                  <ul className="space-y-1 pl-4 text-slate-700">
                    {report.simpleTechDirection.map((tech, idx) => (
                      <li key={idx} className="list-disc leading-relaxed">{tech.replace(/\*\*/g, '')}</li>
                    ))}
                  </ul>
                </div>
              )}

              {report.riskReductionSteps && report.riskReductionSteps.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Risk Mitigation Protocol:</h4>
                  <ul className="space-y-1 pl-4 text-slate-700">
                    {report.riskReductionSteps.map((risk, idx) => (
                      <li key={idx} className="list-disc leading-relaxed">{risk.replace(/\*\*/g, '')}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>

          {/* ================= 09. PHASED IMPLEMENTATION TIMELINE ================= */}
          {report.roadmap && report.roadmap.length > 0 && (
            <section className="space-y-4">
              <div className="border-b border-slate-200 pb-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 block">
                  Section 09
                </span>
                <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">
                  Phased Implementation Roadmap
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                {report.roadmap.map((phase, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span>Phase {idx + 1}: {phase.phase}</span>
                      <span className="text-[11px] font-semibold text-slate-500">Duration: {phase.duration}</span>
                    </div>
                    <ul className="space-y-1 pl-4 text-slate-700">
                      {phase.tasks.map((task, taskIdx) => (
                        <li key={taskIdx} className="list-disc leading-relaxed">{task.replace(/\*\*/g, '')}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ================= 10. ELEVATOR PITCH & SUPERVISOR DEFENSE ================= */}
          <section className="space-y-4">
            <div className="border-b border-slate-200 pb-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 block">
                Section 10
              </span>
              <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">
                Pitch, Defense Guidance & Future Enhancements
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              {report.elevatorPitch && (
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Executive Elevator Pitch:</h4>
                  <p className="text-slate-700 leading-relaxed text-justify pl-2 border-l-2 border-slate-300 italic">
                    "{report.elevatorPitch}"
                  </p>
                </div>
              )}

              {report.plainLanguageAdvice && report.plainLanguageAdvice.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Supervisor & Panel Defense Advice:</h4>
                  <ul className="space-y-1 pl-4 text-slate-700">
                    {report.plainLanguageAdvice.map((adv, idx) => (
                      <li key={idx} className="list-disc leading-relaxed">{adv.replace(/\*\*/g, '')}</li>
                    ))}
                  </ul>
                </div>
              )}

              {report.advancedFeatureSuggestions && report.advancedFeatureSuggestions.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Suggested Long-Term Extensions:</h4>
                  <ul className="space-y-1 pl-4 text-slate-700">
                    {report.advancedFeatureSuggestions.map((feat, idx) => (
                      <li key={idx} className="list-disc leading-relaxed">{feat.replace(/\*\*/g, '')}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* ================= OFFICIAL ACADEMIC FOOTER ================= */}
        <footer className="pt-8 border-t-2 border-slate-900 mt-12 text-center text-xs space-y-1">
          <p className="font-bold uppercase tracking-wider text-slate-900">
            Pak-Austria Fachhochschule: Institute of Applied Sciences and Technology (PAF-IAST)
          </p>
          <p className="text-slate-500 text-[11px]">
            This validation assessment report is generated via the PAF-IAST FYP Evaluation Platform.
          </p>
          <p className="text-slate-400 text-[10px]">
            Confidential • Prepared for Academic & Capstone Project Review
          </p>
        </footer>
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
