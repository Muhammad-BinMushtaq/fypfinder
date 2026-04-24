"use client"

import type { ReactNode } from "react"
import Link from "next/link"
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
  { key: "problemClarityRelevance", title: "Problem clarity & relevance", maxLabel: "20 pts" },
  { key: "ideaExplanationUsability", title: "Idea explanation & usability", maxLabel: "20 pts" },
  { key: "keyFeaturesCompleteness", title: "Key features completeness", maxLabel: "15 pts" },
  { key: "feasibilityResources", title: "Feasibility & resources", maxLabel: "10 pts" },
  { key: "originalityNovelty", title: "Originality/novelty", maxLabel: "10 pts" },
  { key: "impactUsefulness", title: "Impact & usefulness", maxLabel: "10 pts" },
  { key: "improvementPotential", title: "Improvement potential", maxLabel: "15 pts" },
]

export function ValidationResult({
  result,
  onReset,
  remainingToday,
}: ValidationResultProps) {
  const report = result.report

  if (!report) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          This validation could not be displayed properly. Please try again.
        </p>
        <button
          onClick={onReset}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Try another idea
        </button>
      </div>
    )
  }

  const finalTone = getScoreTone(report.finalScore, 100)
  const recommendationTone = getRecommendationTone(result.recommendation)
  const originalityTone = getOriginalityTone(report.originalityVerdict)

  return (
    <div className="space-y-5">
      <button
        onClick={onReset}
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Check another idea
      </button>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="grid gap-6 lg:grid-cols-[220px_1fr] lg:items-center">
          <div className="flex flex-col items-center justify-center">
            <ScoreRing value={report.finalScore} max={100} label="Final Score" />
            <div className={`mt-3 rounded-full px-3 py-1 text-xs font-semibold ${finalTone.pill}`}>
              {finalTone.label}
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill tone={recommendationTone} />
              <StatusPill tone={originalityTone} />
            </div>
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-gray-950 dark:text-white sm:text-3xl">
              {report.plainSummary}
            </h2>
            <p className="mt-3 text-sm leading-6 text-gray-700 dark:text-gray-300">
              {report.shouldBuild}
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <QuickStat
                icon={<Gauge className="h-4 w-4" />}
                label="Difficulty"
                value={capitalize(report.difficultyLevel)}
              />
              <QuickStat
                icon={<Clock3 className="h-4 w-4" />}
                label="Timeline"
                value={report.estimatedTimeline}
              />
              <QuickStat
                icon={<Users className="h-4 w-4" />}
                label="Team fit"
                value={report.teamFit}
              />
            </div>
          </div>
        </div>
      </section>

      <ProgressTracker
        accessMode={result.accessMode}
        previewLocked={result.previewLocked}
        remainingToday={remainingToday}
      />

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-950 dark:text-white">
          <BarChart3 className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
          Score dashboard
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-3">
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

          <div className="space-y-4">
            <VisualMetric
              label="Originality"
              score={report.scoringBreakdown.originalityNovelty.score}
              max={report.scoringBreakdown.originalityNovelty.maxScore}
            />
            <VisualMetric
              label="Impact"
              score={report.scoringBreakdown.impactUsefulness.score}
              max={report.scoringBreakdown.impactUsefulness.maxScore}
            />
            <VisualMetric
              label="Feasibility"
              score={report.scoringBreakdown.feasibilityResources.score}
              max={report.scoringBreakdown.feasibilityResources.maxScore}
            />
            <VisualMetric
              label="Improvement potential"
              score={report.scoringBreakdown.improvementPotential.score}
              max={report.scoringBreakdown.improvementPotential.maxScore}
            />
          </div>
        </div>
      </section>

      <section className={`rounded-2xl border p-5 shadow-sm ${originalityTone.shell}`}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <StatusPill tone={originalityTone} />
            <h3 className="mt-3 text-lg font-semibold text-gray-950 dark:text-white">
              Similarity check against past FYP ideas
            </h3>
            <p className="mt-2 text-sm leading-6 text-gray-700 dark:text-gray-300">
              {report.originalityReason}
            </p>
            <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
              {report.pastIdeaComparisonSummary}
            </p>
          </div>
          <MiniScore label="Freshness" value={report.originalityScore} max={10} />
        </div>

        <div className="mt-4 grid gap-3">
          {report.similarPastIdeas.length > 0 ? (
            report.similarPastIdeas.map((idea, index) => (
              <div
                key={`${idea.title}-${index}`}
                className="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/50"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {idea.title}
                    </h4>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                      {idea.batch} - Group {idea.groupNumber}
                      {idea.supervisor ? ` - ${idea.supervisor}` : ""}
                    </p>
                  </div>
                  <span className="w-fit rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-950/50 dark:text-amber-200">
                    Similarity {idea.similarityScore}/10
                  </span>
                </div>
                <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">
                  {idea.similarityReason}
                </p>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Key difference: {idea.keyDifference}
                </p>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-emerald-200 bg-white/80 p-4 text-sm text-emerald-800 dark:border-emerald-900/40 dark:bg-slate-950/40 dark:text-emerald-200">
              No strong match was found in the past FYP idea list.
            </div>
          )}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <ReportPanel title="Strengths" icon={<CheckCircle2 className="h-4 w-4" />}>
          <BulletList items={report.strongPoints} />
        </ReportPanel>
        <ReportPanel title="Repeated or weak areas" icon={<AlertTriangle className="h-4 w-4" />}>
          <BulletList items={report.concernPoints} />
        </ReportPanel>
        <ReportPanel title="Who benefits" icon={<Users className="h-4 w-4" />}>
          <p>{report.whoWillUseIt}</p>
          <p className="mt-3">{report.whyItMatters}</p>
        </ReportPanel>
        <ReportPanel title="Make it stand out" icon={<Sparkles className="h-4 w-4" />}>
          <BulletList items={report.uniquenessImprovements} />
        </ReportPanel>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-950 dark:text-white">
          <Layers3 className="h-4 w-4 text-blue-600 dark:text-blue-300" />
          MVP and next actions
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <ActionColumn title="MVP scope" items={report.mvpRecommendations} />
          <ActionColumn title="Next steps" items={report.simpleNextSteps} />
          <ActionColumn title="Roadmap priorities" items={report.roadmapPriorities} />
        </div>
      </section>

      <ReportPanel title="Advanced feature suggestions" icon={<MonitorCog className="h-4 w-4" />}>
        <div className="grid gap-3 sm:grid-cols-2">
          {report.advancedFeatureSuggestions.map((item, index) => (
            <FeatureSuggestion key={`${item}-${index}`} text={item} index={index} />
          ))}
        </div>
      </ReportPanel>

      {!result.previewLocked ? (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            <ReportPanel title="Build direction" icon={<Wrench className="h-4 w-4" />}>
              <BulletList items={report.simpleTechDirection} />
            </ReportPanel>
            <ReportPanel title="Risk reduction" icon={<ShieldCheck className="h-4 w-4" />}>
              <BulletList items={report.riskReductionSteps} />
            </ReportPanel>
          </div>

          <ReportPanel title="Project roadmap" icon={<Map className="h-4 w-4" />}>
            <div className="space-y-3">
              {report.roadmap.map((phase, index) => (
                <div
                  key={`${phase.phase}-${index}`}
                  className="grid gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-slate-800 dark:bg-slate-950/40 sm:grid-cols-[36px_1fr]"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-800 dark:bg-blue-950/60 dark:text-blue-200">
                    {index + 1}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {phase.phase}
                      </h4>
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <Clock3 className="h-3.5 w-3.5" />
                        {phase.duration}
                      </span>
                    </div>
                    <BulletList items={phase.tasks} compact />
                  </div>
                </div>
              ))}
            </div>
          </ReportPanel>

          <div className="grid gap-4 lg:grid-cols-2">
            <ReportPanel title="Simple pitch" icon={<Lightbulb className="h-4 w-4" />}>
              <p>{report.elevatorPitch}</p>
            </ReportPanel>
            <ReportPanel title="Student-friendly advice" icon={<Target className="h-4 w-4" />}>
              <BulletList items={report.plainLanguageAdvice} />
            </ReportPanel>
          </div>
        </>
      ) : (
        <LockedPreview hiddenSections={result.hiddenSections} />
      )}
    </div>
  )
}

function ScoreRing({ value, max, label }: { value: number; max: number; label: string }) {
  const percent = Math.round((value / max) * 100)
  const tone = getScoreTone(value, max)

  return (
    <div
      className="flex h-40 w-40 items-center justify-center rounded-full p-3"
      style={{
        background: `conic-gradient(${tone.chartColor} ${percent * 3.6}deg, #e5e7eb 0deg)`,
      }}
      aria-label={`${label}: ${value} out of ${max}`}
    >
      <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-white text-center dark:bg-slate-900">
        <div className={`text-4xl font-bold ${tone.text}`}>{value}</div>
        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">
          / {max}
        </div>
        <div className="mt-1 text-xs font-medium text-gray-600 dark:text-gray-300">{label}</div>
      </div>
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
    <details className="group rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
      <summary className="flex cursor-pointer list-none items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-sm font-semibold text-gray-950 dark:text-white">{title}</h4>
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${tone.pill}`}>
              {tone.label}
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{item.summary}</p>
          <div className="mt-3 h-2 rounded-full bg-gray-200 dark:bg-slate-800">
            <div
              className={`h-full rounded-full ${tone.bar}`}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <div className="text-right">
            <div className={`text-lg font-bold ${tone.text}`}>
              {item.score}/{item.maxScore}
            </div>
            <div className="text-[11px] text-gray-500 dark:text-gray-400">{maxLabel}</div>
          </div>
          <ChevronDown className="mt-1 h-4 w-4 text-gray-400 transition group-open:rotate-180" />
        </div>
      </summary>
      <div className="mt-4 border-t border-gray-200 pt-4 text-sm leading-6 text-gray-700 dark:border-slate-800 dark:text-gray-300">
        <BulletList items={item.feedback} compact />
        <div className="mt-3 rounded-xl bg-white px-3 py-2 text-sm font-medium text-gray-800 dark:bg-slate-900 dark:text-gray-200">
          Action: {item.action}
        </div>
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
    <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-950 dark:text-white">
          <Target className="h-4 w-4 text-blue-600 dark:text-blue-300" />
          Validation usage
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-300">
          {remaining} of {total} validations remaining today
        </div>
      </div>
      <div className="mt-3 grid gap-2" style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }}>
        {Array.from({ length: total }).map((_, index) => (
          <div
            key={index}
            className={`h-2 rounded-full ${
              index < used
                ? "bg-blue-600 dark:bg-blue-400"
                : "bg-gray-200 dark:bg-slate-800"
            }`}
          />
        ))}
      </div>
    </section>
  )
}

function VisualMetric({ label, score, max }: { label: string; score: number; max: number }) {
  const percent = Math.round((score / max) * 100)
  const tone = getScoreTone(score, max)

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-semibold text-gray-900 dark:text-white">{label}</div>
        <div className={`text-sm font-bold ${tone.text}`}>{score}/{max}</div>
      </div>
      <div className="mt-3 h-3 rounded-full bg-gray-200 dark:bg-slate-800">
        <div className={`h-full rounded-full ${tone.bar}`} style={{ width: `${percent}%` }} />
      </div>
      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">{percent}% of target</div>
    </div>
  )
}

function QuickStat({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-3 dark:border-slate-800 dark:bg-slate-950/40">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
        <span className="text-blue-600 dark:text-blue-300">{icon}</span>
        {label}
      </div>
      <div className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">{value}</div>
    </div>
  )
}

function MiniScore({ label, value, max }: { label: string; value: number; max: number }) {
  const tone = getScoreTone(value, max)

  return (
    <div className="w-full rounded-2xl bg-white/85 p-4 text-center shadow-sm dark:bg-slate-950/50 sm:w-36">
      <div className={`text-2xl font-bold ${tone.text}`}>{value}/{max}</div>
      <div className="mt-1 text-xs font-medium text-gray-500 dark:text-gray-400">{label}</div>
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
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
        <span className="text-blue-600 dark:text-blue-300">{icon}</span>
        <h3>{title}</h3>
      </div>
      <div className="mt-4 text-sm leading-6 text-gray-700 dark:text-gray-300">{children}</div>
    </section>
  )
}

function ActionColumn({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
      <h4 className="text-sm font-semibold text-gray-950 dark:text-white">{title}</h4>
      <BulletList items={items} compact />
    </div>
  )
}

function FeatureSuggestion({ text, index }: { text: string; index: number }) {
  const icons = [
    <Sparkles key="sparkles" className="h-4 w-4" />,
    <CalendarDays key="calendar" className="h-4 w-4" />,
    <Layers3 key="layers" className="h-4 w-4" />,
    <MonitorCog key="monitor" className="h-4 w-4" />,
    <ShieldCheck key="shield" className="h-4 w-4" />,
    <Trophy key="trophy" className="h-4 w-4" />,
    <Users key="users" className="h-4 w-4" />,
  ]

  return (
    <div className="flex gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-3 dark:border-slate-800 dark:bg-slate-950/40">
      <span className="mt-0.5 text-blue-600 dark:text-blue-300">{icons[index % icons.length]}</span>
      <span>{text}</span>
    </div>
  )
}

function LockedPreview({ hiddenSections }: { hiddenSections: string[] }) {
  return (
    <section className="rounded-2xl border border-dashed border-amber-300 bg-amber-50 p-6 shadow-sm dark:border-amber-900/40 dark:bg-amber-950/10">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-amber-700 dark:border-amber-900/40 dark:bg-slate-900 dark:text-amber-300">
            <Lock className="h-3.5 w-3.5" />
            Guest preview
          </div>
          <h3 className="mt-3 text-xl font-semibold text-gray-950 dark:text-white">
            Sign up to unlock the full dashboard report
          </h3>
          <p className="mt-2 text-sm leading-6 text-gray-700 dark:text-gray-300">
            The preview keeps the high-level scoring and similarity check visible. Student accounts unlock deeper build guidance.
          </p>
          <BulletList items={hiddenSections} compact />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
          >
            Sign Up Free
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-slate-700 dark:text-gray-200 dark:hover:bg-slate-900"
          >
            Log In
          </Link>
        </div>
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
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${tone.pill}`}>
      {tone.icon}
      {tone.label}
    </span>
  )
}

function BulletList({ items, compact = false }: { items: string[]; compact?: boolean }) {
  return (
    <ul className={compact ? "mt-3 space-y-2" : "space-y-2"}>
      {items.map((item, index) => (
        <li key={`${item}-${index}`} className="flex items-start gap-2">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
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
      label: "Green",
      text: "text-emerald-700 dark:text-emerald-300",
      pill: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200",
      bar: "bg-emerald-500",
      chartColor: "#10b981",
    }
  }

  if (percent >= 50) {
    return {
      label: "Yellow",
      text: "text-amber-700 dark:text-amber-300",
      pill: "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-200",
      bar: "bg-amber-500",
      chartColor: "#f59e0b",
    }
  }

  return {
    label: "Red",
    text: "text-red-700 dark:text-red-300",
    pill: "bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-200",
    bar: "bg-red-500",
    chartColor: "#ef4444",
  }
}

function getRecommendationTone(recommendation: string | null) {
  switch (recommendation) {
    case "STRONGLY_RECOMMENDED":
      return {
        label: "Strong match for an FYP",
        shell: "border-emerald-200 bg-emerald-50 dark:border-emerald-900/40 dark:bg-emerald-950/20",
        pill: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200",
        icon: <CheckCircle2 className="h-4 w-4" />,
      }
    case "RECOMMENDED_WITH_CHANGES":
      return {
        label: "Good idea with changes",
        shell: "border-blue-200 bg-blue-50 dark:border-blue-900/40 dark:bg-blue-950/20",
        pill: "bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-200",
        icon: <Lightbulb className="h-4 w-4" />,
      }
    case "NEEDS_MAJOR_REVISION":
      return {
        label: "Needs major revision",
        shell: "border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-950/20",
        pill: "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-200",
        icon: <AlertTriangle className="h-4 w-4" />,
      }
    default:
      return {
        label: "Not ready yet",
        shell: "border-red-200 bg-red-50 dark:border-red-900/40 dark:bg-red-950/20",
        pill: "bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-200",
        icon: <AlertTriangle className="h-4 w-4" />,
      }
  }
}

function getOriginalityTone(
  verdict: "appears_unique" | "some_overlap" | "very_similar" | "already_done"
) {
  switch (verdict) {
    case "appears_unique":
      return {
        label: "Looks fresh",
        shell: "border-emerald-200 bg-emerald-50 dark:border-emerald-900/40 dark:bg-emerald-950/20",
        pill: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200",
        icon: <Sparkles className="h-4 w-4" />,
      }
    case "some_overlap":
      return {
        label: "Some overlap found",
        shell: "border-blue-200 bg-blue-50 dark:border-blue-900/40 dark:bg-blue-950/20",
        pill: "bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-200",
        icon: <Lightbulb className="h-4 w-4" />,
      }
    case "very_similar":
      return {
        label: "Very close to past work",
        shell: "border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-950/20",
        pill: "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-200",
        icon: <AlertTriangle className="h-4 w-4" />,
      }
    default:
      return {
        label: "Already done before",
        shell: "border-red-200 bg-red-50 dark:border-red-900/40 dark:bg-red-950/20",
        pill: "bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-200",
        icon: <AlertTriangle className="h-4 w-4" />,
      }
  }
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}
