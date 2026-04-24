"use client"

import Link from "next/link"
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Lightbulb,
  Lock,
  Map,
  ShieldAlert,
  Sparkles,
  Target,
  Users,
  Wrench,
} from "lucide-react"
import type { ValidationResult as ValidationResultType } from "@/services/fypIdeas.service"

interface ValidationResultProps {
  result: ValidationResultType
  onReset: () => void
}

export function ValidationResult({ result, onReset }: ValidationResultProps) {
  const report = result.report

  if (!report) {
    return (
      <div className="rounded-3xl border border-gray-200 bg-white p-6 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
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

      <div className={`rounded-[28px] border p-5 shadow-sm ${recommendationTone.shell}`}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]">
              {recommendationTone.icon}
              {recommendationTone.label}
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-gray-950 dark:text-white">
                {report.plainSummary}
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-700 dark:text-gray-300">
                {report.shouldBuild}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 lg:w-[320px]">
            <ScoreCard label="Can it work?" value={report.feasibilityScore} />
            <ScoreCard label="How fresh?" value={report.originalityScore} />
            <ScoreCard label="How useful?" value={report.usefulnessScore} />
          </div>
        </div>
      </div>

      <div className={`rounded-3xl border p-5 shadow-sm ${originalityTone.shell}`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]">
              {originalityTone.icon}
              {originalityTone.label}
            </div>
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

          <div className="rounded-2xl bg-white/80 px-4 py-3 text-sm shadow-sm backdrop-blur dark:bg-slate-950/40">
            <div className="font-semibold text-gray-900 dark:text-white">
              Difficulty: <span className="capitalize">{report.difficultyLevel}</span>
            </div>
            <div className="mt-1 text-gray-600 dark:text-gray-300">{report.estimatedTimeline}</div>
            <div className="mt-1 text-gray-600 dark:text-gray-300">{report.teamFit}</div>
          </div>
        </div>

        <div className="mt-4 grid gap-3">
          {report.similarPastIdeas.length > 0 ? (
            report.similarPastIdeas.map((idea, index) => (
              <div
                key={`${idea.title}-${index}`}
                className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/50"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {idea.title}
                    </h4>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                      {idea.batch} • Group {idea.groupNumber}
                      {idea.supervisor ? ` • ${idea.supervisor}` : ""}
                    </p>
                  </div>
                  <div className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-950/50 dark:text-amber-200">
                    Similarity {idea.similarityScore}/10
                  </div>
                </div>
                <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">{idea.similarityReason}</p>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  How yours can differ: {idea.keyDifference}
                </p>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-emerald-200 bg-white/80 p-4 text-sm text-emerald-800 dark:border-emerald-900/40 dark:bg-slate-950/40 dark:text-emerald-200">
              No strong match was found in the past FYP idea list.
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <InfoCard title="Who would use it?" icon={<Users className="h-4 w-4" />}>
          <p>{report.whoWillUseIt}</p>
          <p className="mt-3">{report.whyItMatters}</p>
        </InfoCard>

        <InfoCard title="How to make it stand out" icon={<Sparkles className="h-4 w-4" />}>
          <BulletList items={report.uniquenessImprovements} />
        </InfoCard>

        <InfoCard title="What already looks strong" icon={<CheckCircle2 className="h-4 w-4" />}>
          <BulletList items={report.strongPoints} />
        </InfoCard>

        <InfoCard title="What needs work" icon={<AlertTriangle className="h-4 w-4" />}>
          <BulletList items={report.concernPoints} />
        </InfoCard>

        <InfoCard title="What to do next" icon={<Target className="h-4 w-4" />}>
          <BulletList items={report.simpleNextSteps} />
        </InfoCard>

        {!result.previewLocked ? (
          <InfoCard title="Simple build direction" icon={<Wrench className="h-4 w-4" />}>
            <BulletList items={report.simpleTechDirection} />
          </InfoCard>
        ) : (
          <LockedCard />
        )}
      </div>

      {!result.previewLocked ? (
        <>
          <InfoCard title="Ways to reduce the risk" icon={<ShieldAlert className="h-4 w-4" />}>
            <BulletList items={report.riskReductionSteps} />
          </InfoCard>

          <InfoCard title="Simple project roadmap" icon={<Map className="h-4 w-4" />}>
            <div className="space-y-4">
              {report.roadmap.map((phase, index) => (
                <div key={`${phase.phase}-${index}`} className="flex gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-semibold text-amber-800 dark:bg-amber-950/60 dark:text-amber-200">
                    {index + 1}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white">{phase.phase}</h4>
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <Clock3 className="h-3.5 w-3.5" />
                        {phase.duration}
                      </span>
                    </div>
                    <ul className="mt-3 space-y-2">
                      {phase.tasks.map((task, taskIndex) => (
                        <li key={taskIndex} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-500" />
                          <span>{task}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </InfoCard>

          <div className="grid gap-4 lg:grid-cols-2">
            <InfoCard title="Pitch it simply" icon={<Lightbulb className="h-4 w-4" />}>
              <p>{report.elevatorPitch}</p>
            </InfoCard>

            <InfoCard title="Extra plain-language advice" icon={<Sparkles className="h-4 w-4" />}>
              <BulletList items={report.plainLanguageAdvice} />
            </InfoCard>
          </div>
        </>
      ) : (
        <div className="rounded-[28px] border border-dashed border-amber-300 bg-gradient-to-br from-amber-50 via-white to-white p-6 shadow-sm dark:border-amber-900/40 dark:from-slate-900 dark:via-slate-900 dark:to-amber-950/20">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-700 dark:border-amber-900/40 dark:bg-slate-900 dark:text-amber-300">
                <Lock className="h-3.5 w-3.5" />
                Preview Limit Reached
              </div>
              <h3 className="mt-3 text-xl font-semibold text-gray-950 dark:text-white">
                Sign up to unlock the full report
              </h3>
              <p className="mt-2 text-sm leading-6 text-gray-700 dark:text-gray-300">
                The free preview hides a few deeper sections like the roadmap, the build direction, and the full improvement plan.
              </p>
              <ul className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                {result.hiddenSections.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-2xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
              >
                Sign Up Free
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-2xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-slate-700 dark:text-gray-200 dark:hover:bg-slate-900"
              >
                Log In
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        <MetaCard label="Model used" value={result.modelUsed ?? "Not recorded"} />
        <MetaCard label="Tokens used" value={result.tokensUsed.toLocaleString()} />
        <MetaCard
          label="Response time"
          value={result.latencyMs != null ? `${(result.latencyMs / 1000).toFixed(1)}s` : "Not recorded"}
        />
      </div>
    </div>
  )
}

function ScoreCard({ label, value }: { label: string; value: number }) {
  const tone =
    value >= 8 ? "text-emerald-700 dark:text-emerald-300" :
    value >= 6 ? "text-blue-700 dark:text-blue-300" :
    value >= 4 ? "text-amber-700 dark:text-amber-300" :
    "text-red-700 dark:text-red-300"

  return (
    <div className="rounded-2xl border border-white/60 bg-white/80 p-4 text-center shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/50">
      <div className={`text-2xl font-bold ${tone}`}>{value}/10</div>
      <div className="mt-1 text-xs font-medium text-gray-500 dark:text-gray-400">{label}</div>
    </div>
  )
}

function InfoCard({
  title,
  icon,
  children,
}: {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="rounded-[26px] border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
        <span className="text-amber-500">{icon}</span>
        <h3>{title}</h3>
      </div>
      <div className="mt-4 text-sm leading-6 text-gray-700 dark:text-gray-300">{children}</div>
    </section>
  )
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item, index) => (
        <li key={`${item}-${index}`} className="flex items-start gap-2">
          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-amber-500" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

function LockedCard() {
  return (
    <div className="rounded-[26px] border border-dashed border-amber-300 bg-amber-50/70 p-5 shadow-sm dark:border-amber-900/40 dark:bg-amber-950/10">
      <div className="flex items-center gap-2 text-sm font-semibold text-amber-800 dark:text-amber-200">
        <Lock className="h-4 w-4" />
        Full section hidden in guest preview
      </div>
      <p className="mt-3 text-sm leading-6 text-amber-900/80 dark:text-amber-100/80">
        Sign up to unlock the deeper build direction, full roadmap, and full improvement plan.
      </p>
    </div>
  )
}

function MetaCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500">
        {label}
      </div>
      <div className="mt-2 text-sm text-gray-800 dark:text-gray-200">{value}</div>
    </div>
  )
}

function getRecommendationTone(recommendation: string | null) {
  switch (recommendation) {
    case "STRONGLY_RECOMMENDED":
      return {
        label: "Strong match for an FYP",
        shell: "border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-white dark:border-emerald-900/40 dark:from-emerald-950/20 dark:via-slate-900 dark:to-slate-900",
        icon: <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />,
      }
    case "RECOMMENDED_WITH_CHANGES":
      return {
        label: "Good idea with changes",
        shell: "border-blue-200 bg-gradient-to-br from-blue-50 via-white to-white dark:border-blue-900/40 dark:from-blue-950/20 dark:via-slate-900 dark:to-slate-900",
        icon: <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-300" />,
      }
    case "NEEDS_MAJOR_REVISION":
      return {
        label: "Needs a stronger shape",
        shell: "border-amber-200 bg-gradient-to-br from-amber-50 via-white to-white dark:border-amber-900/40 dark:from-amber-950/20 dark:via-slate-900 dark:to-slate-900",
        icon: <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-300" />,
      }
    default:
      return {
        label: "Not ready yet",
        shell: "border-red-200 bg-gradient-to-br from-red-50 via-white to-white dark:border-red-900/40 dark:from-red-950/20 dark:via-slate-900 dark:to-slate-900",
        icon: <ShieldAlert className="h-4 w-4 text-red-600 dark:text-red-300" />,
      }
  }
}

function getOriginalityTone(verdict: "appears_unique" | "some_overlap" | "very_similar" | "already_done") {
  switch (verdict) {
    case "appears_unique":
      return {
        label: "Looks fresh",
        shell: "border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-white dark:border-emerald-900/40 dark:from-emerald-950/20 dark:via-slate-900 dark:to-slate-900",
        icon: <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />,
      }
    case "some_overlap":
      return {
        label: "Some overlap found",
        shell: "border-blue-200 bg-gradient-to-br from-blue-50 via-white to-white dark:border-blue-900/40 dark:from-blue-950/20 dark:via-slate-900 dark:to-slate-900",
        icon: <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-300" />,
      }
    case "very_similar":
      return {
        label: "Very close to past work",
        shell: "border-amber-200 bg-gradient-to-br from-amber-50 via-white to-white dark:border-amber-900/40 dark:from-amber-950/20 dark:via-slate-900 dark:to-slate-900",
        icon: <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-300" />,
      }
    default:
      return {
        label: "Already done before",
        shell: "border-red-200 bg-gradient-to-br from-red-50 via-white to-white dark:border-red-900/40 dark:from-red-950/20 dark:via-slate-900 dark:to-slate-900",
        icon: <ShieldAlert className="h-4 w-4 text-red-600 dark:text-red-300" />,
      }
  }
}
