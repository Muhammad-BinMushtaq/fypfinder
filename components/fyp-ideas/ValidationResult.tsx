// components/fyp-ideas/ValidationResult.tsx
"use client"

import { useState } from "react"
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Star,
  Shield,
  TrendingUp,
  GraduationCap,
  AlertOctagon,
  ChevronDown,
  ChevronUp,
  Cpu,
  Globe,
  Clock,
  Users,
  Lightbulb,
  ArrowLeft,
} from "lucide-react"
import type { ValidationResult as ValidationResultType } from "@/services/fypIdeas.service"

interface ValidationResultProps {
  result: ValidationResultType
  onReset: () => void
}

type TabKey = "overview" | "technical" | "industry" | "academic" | "risks"

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: "overview", label: "Overview", icon: <Star className="w-4 h-4" /> },
  { key: "technical", label: "Technical", icon: <Cpu className="w-4 h-4" /> },
  { key: "industry", label: "Industry", icon: <Globe className="w-4 h-4" /> },
  { key: "academic", label: "Academic", icon: <GraduationCap className="w-4 h-4" /> },
  { key: "risks", label: "Risks", icon: <AlertOctagon className="w-4 h-4" /> },
]

function getRecommendationConfig(rec: string | null) {
  switch (rec) {
    case "STRONGLY_RECOMMENDED":
      return { label: "Strongly Recommended", color: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800", icon: <CheckCircle className="w-5 h-5" /> }
    case "RECOMMENDED_WITH_CHANGES":
      return { label: "Recommended with Changes", color: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800", icon: <Lightbulb className="w-5 h-5" /> }
    case "NEEDS_MAJOR_REVISION":
      return { label: "Needs Major Revision", color: "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800", icon: <AlertTriangle className="w-5 h-5" /> }
    case "NOT_RECOMMENDED":
      return { label: "Not Recommended", color: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800", icon: <XCircle className="w-5 h-5" /> }
    default:
      return { label: rec || "Unknown", color: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700", icon: <Star className="w-5 h-5" /> }
  }
}

function ScoreBadge({ score, label }: { score: number; label: string }) {
  const color =
    score >= 8 ? "text-emerald-600 dark:text-emerald-400" :
    score >= 6 ? "text-blue-600 dark:text-blue-400" :
    score >= 4 ? "text-amber-600 dark:text-amber-400" :
    "text-red-600 dark:text-red-400"

  return (
    <div className="text-center p-3 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
      <p className={`text-2xl font-bold ${color}`}>{score}/10</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
    </div>
  )
}

function TagList({ items, color = "gray" }: { items: string[]; color?: string }) {
  const colorMap: Record<string, string> = {
    gray: "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300",
    blue: "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
    violet: "bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300",
    red: "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300",
    emerald: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
    amber: "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item, i) => (
        <span key={i} className={`px-2.5 py-1 rounded-lg text-xs font-medium ${colorMap[color] ?? colorMap.gray}`}>
          {item}
        </span>
      ))}
    </div>
  )
}

function Section({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
        {icon} {title}
      </h4>
      {children}
    </div>
  )
}

export function ValidationResult({ result, onReset }: ValidationResultProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("overview")
  const [roadmapExpanded, setRoadmapExpanded] = useState(false)

  const panel = result.panelEvaluation
  const final_ = result.finalResult
  const rec = getRecommendationConfig(result.recommendation)

  if (!panel || !final_) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">Validation data is incomplete.</p>
        <button onClick={onReset} className="mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline">
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={onReset}
        className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Validate Another Idea
      </button>

      {/* Recommendation Banner */}
      <div className={`flex items-center gap-3 p-4 rounded-xl border ${rec.color}`}>
        {rec.icon}
        <div>
          <p className="font-semibold text-sm">{rec.label}</p>
          <p className="text-xs mt-0.5 opacity-80">{final_.summaryEvaluation}</p>
        </div>
      </div>

      {/* Score Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <ScoreBadge score={final_.feasibilityScore} label="Feasibility" />
        <ScoreBadge score={final_.innovationScore} label="Innovation" />
        <ScoreBadge score={final_.industryRelevanceScore} label="Industry Fit" />
        <ScoreBadge score={panel.academicEvaluator.fypSuitabilityScore} label="FYP Fit" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 border-b border-gray-200 dark:border-slate-700">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-lg transition-colors whitespace-nowrap ${
              activeTab === tab.key
                ? "bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-b-0 border-gray-200 dark:border-slate-700"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5 space-y-5">
        {activeTab === "overview" && (
          <>
            {/* Idea Interpretation */}
            <Section title="Project Domain" icon={<Globe className="w-4 h-4 text-blue-500" />}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Domain</p>
                  <p className="text-gray-900 dark:text-white font-medium">{panel.ideaInterpreter.domain}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Scope</p>
                  <p className="text-gray-900 dark:text-white font-medium capitalize">{panel.ideaInterpreter.systemScope}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Architecture</p>
                  <p className="text-gray-900 dark:text-white font-medium">{panel.ideaInterpreter.expectedArchitecture}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Target Users</p>
                  <p className="text-gray-900 dark:text-white font-medium">{panel.ideaInterpreter.targetUsers}</p>
                </div>
              </div>
              <div className="mt-2">
                <p className="text-xs text-gray-400 dark:text-gray-500">Core Problem</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">{panel.ideaInterpreter.coreProblemRestated}</p>
              </div>
            </Section>

            {/* Technology Suggestions */}
            <Section title="Suggested Technologies" icon={<Cpu className="w-4 h-4 text-violet-500" />}>
              <TagList items={final_.technologySuggestions} color="violet" />
            </Section>

            {/* Required Skills */}
            <Section title="Required Skills" icon={<Star className="w-4 h-4 text-blue-500" />}>
              <TagList items={final_.requiredSkills} color="blue" />
            </Section>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg text-center">
                <p className="text-xs text-gray-400 dark:text-gray-500">Difficulty</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white capitalize">{final_.difficultyLevel}</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg text-center">
                <p className="text-xs text-gray-400 dark:text-gray-500">Scope</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white capitalize">{final_.projectScopeRealism}</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg text-center sm:col-span-1 col-span-2">
                <p className="text-xs text-gray-400 dark:text-gray-500">Est. Time</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{panel.technicalEvaluator.estimatedWeeks} weeks</p>
              </div>
            </div>

            {/* Team Size Suitability */}
            <Section title="Team Size Assessment" icon={<Users className="w-4 h-4 text-gray-500" />}>
              <p className="text-sm text-gray-700 dark:text-gray-300">{final_.teamSizeSuitability}</p>
            </Section>

            {/* Implementation Roadmap */}
            <Section title="Implementation Roadmap" icon={<Clock className="w-4 h-4 text-emerald-500" />}>
              <button
                onClick={() => setRoadmapExpanded(!roadmapExpanded)}
                className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                {roadmapExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                {roadmapExpanded ? "Collapse" : "Show roadmap"}
              </button>

              {roadmapExpanded && (
                <div className="space-y-3 mt-2">
                  {final_.implementationRoadmap.map((phase, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-xs font-bold text-emerald-700 dark:text-emerald-300">
                          {i + 1}
                        </div>
                        {i < final_.implementationRoadmap.length - 1 && (
                          <div className="w-0.5 flex-1 bg-gray-200 dark:bg-slate-600 mt-1" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{phase.phase}</p>
                          <span className="text-xs text-gray-400 dark:text-gray-500">{phase.duration}</span>
                        </div>
                        <ul className="mt-1 space-y-0.5">
                          {phase.tasks.map((task, j) => (
                            <li key={j} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-1.5">
                              <span className="text-gray-300 dark:text-gray-600 mt-0.5">•</span>
                              {task}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Section>
          </>
        )}

        {activeTab === "technical" && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <ScoreBadge score={panel.technicalEvaluator.feasibilityScore} label="Feasibility" />
              <div className="text-center p-3 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
                <p className="text-2xl font-bold text-gray-900 dark:text-white capitalize">{panel.technicalEvaluator.difficultyLevel}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Difficulty</p>
              </div>
            </div>

            <Section title="Required Skills">
              <TagList items={panel.technicalEvaluator.requiredSkills} color="blue" />
            </Section>

            <Section title="Suggested Tech Stack">
              <TagList items={panel.technicalEvaluator.suggestedTechStack} color="violet" />
            </Section>

            <Section title="Technical Challenges" icon={<AlertTriangle className="w-4 h-4 text-amber-500" />}>
              <ul className="space-y-1.5">
                {panel.technicalEvaluator.technicalChallenges.map((c, i) => (
                  <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">⚠</span> {c}
                  </li>
                ))}
              </ul>
            </Section>

            <div className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
              <p className="text-xs text-gray-400 dark:text-gray-500">Estimated Development Time</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{panel.technicalEvaluator.estimatedWeeks} weeks</p>
            </div>
          </>
        )}

        {activeTab === "industry" && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <ScoreBadge score={panel.industryEvaluator.industryRelevanceScore} label="Relevance" />
              <div className="text-center p-3 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
                <p className="text-2xl font-bold text-gray-900 dark:text-white capitalize">{panel.industryEvaluator.trendAlignment}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Trend Alignment</p>
              </div>
            </div>

            <Section title="Real-World Applicability">
              <p className="text-sm text-gray-700 dark:text-gray-300 capitalize font-medium">
                {panel.industryEvaluator.realWorldApplicability}
              </p>
            </Section>

            <Section title="Similar Existing Products">
              <TagList items={panel.industryEvaluator.similarExistingProducts} />
            </Section>

            <Section title="Market Potential" icon={<TrendingUp className="w-4 h-4 text-emerald-500" />}>
              <p className="text-sm text-gray-700 dark:text-gray-300">{panel.industryEvaluator.marketPotential}</p>
            </Section>
          </>
        )}

        {activeTab === "academic" && (
          <>
            <div className="grid grid-cols-3 gap-3">
              <ScoreBadge score={panel.academicEvaluator.fypSuitabilityScore} label="FYP Fit" />
              <ScoreBadge score={panel.academicEvaluator.innovationScore} label="Innovation" />
              <div className="text-center p-3 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
                <p className="text-2xl font-bold text-gray-900 dark:text-white capitalize">{panel.academicEvaluator.researchDepth}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Research Depth</p>
              </div>
            </div>

            <Section title="Academic Strengths" icon={<CheckCircle className="w-4 h-4 text-emerald-500" />}>
              <ul className="space-y-1.5">
                {panel.academicEvaluator.academicStrengths.map((s, i) => (
                  <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                    <span className="text-emerald-500 mt-0.5">✓</span> {s}
                  </li>
                ))}
              </ul>
            </Section>

            <Section title="Academic Weaknesses" icon={<AlertTriangle className="w-4 h-4 text-amber-500" />}>
              <ul className="space-y-1.5">
                {panel.academicEvaluator.academicWeaknesses.map((w, i) => (
                  <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">⚠</span> {w}
                  </li>
                ))}
              </ul>
            </Section>
          </>
        )}

        {activeTab === "risks" && (
          <>
            <div className="flex items-center gap-2 p-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/50">
              <Shield className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500">Overall Risk Level</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white capitalize">{panel.riskCritic.riskLevel}</p>
              </div>
            </div>

            <Section title="Top Risk Factors">
              <ul className="space-y-1.5">
                {final_.riskFactors.map((r, i) => (
                  <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">●</span> {r}
                  </li>
                ))}
              </ul>
            </Section>

            <Section title="Hidden Challenges" icon={<AlertOctagon className="w-4 h-4 text-red-500" />}>
              <ul className="space-y-1.5">
                {panel.riskCritic.hiddenChallenges.map((c, i) => (
                  <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">!</span> {c}
                  </li>
                ))}
              </ul>
            </Section>

            <Section title="Unrealistic Assumptions">
              <ul className="space-y-1.5">
                {panel.riskCritic.unrealisticAssumptions.map((a, i) => (
                  <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">?</span> {a}
                  </li>
                ))}
              </ul>
            </Section>

            <Section title="Potential Failure Points">
              <ul className="space-y-1.5">
                {panel.riskCritic.potentialFailurePoints.map((f, i) => (
                  <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">✕</span> {f}
                  </li>
                ))}
              </ul>
            </Section>

            <Section title="Mitigation Suggestions" icon={<Lightbulb className="w-4 h-4 text-emerald-500" />}>
              <ul className="space-y-1.5">
                {panel.riskCritic.mitigationSuggestions.map((s, i) => (
                  <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                    <span className="text-emerald-500 mt-0.5">→</span> {s}
                  </li>
                ))}
              </ul>
            </Section>
          </>
        )}
      </div>
    </div>
  )
}
