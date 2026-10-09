// app/admin/(authenticated)/reports/page.tsx
"use client"

import { useState } from "react"
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  MessageSquare,
  GitPullRequest,
  UserPlus,
  UsersRound,
  Loader2,
  AlertTriangle,
  Calendar,
  Code2,
  ShieldCheck,
  UserCheck,
  Zap,
} from "lucide-react"
import { useAdminReports } from "@/hooks/admin"

export default function AdminReportsPage() {
  const [period, setPeriod] = useState<"week" | "month">("week")
  const { data: report, isLoading, isError } = useAdminReports(period)

  const periodLabel = period === "week" ? "This Week" : "This Month"

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Platform Analytics & Reports
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Weekly and monthly growth metrics, engagement, and platform health
            </p>
          </div>
        </div>

        {/* Period Segmented Toggle */}
        <div className="inline-flex items-center rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/60 p-1 self-start sm:self-auto">
          <button
            onClick={() => setPeriod("week")}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
              period === "week"
                ? "bg-white text-slate-900 dark:bg-slate-900 dark:text-white shadow-xs"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            Weekly
          </button>
          <button
            onClick={() => setPeriod("month")}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
              period === "month"
                ? "bg-white text-slate-900 dark:bg-slate-900 dark:text-white shadow-xs"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            Monthly
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-slate-400 dark:text-slate-500" />
            <p className="mt-3 text-xs font-medium text-slate-500 dark:text-slate-400">Generating analytics report...</p>
          </div>
        </div>
      ) : isError || !report ? (
        <div className="rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 p-8 text-center">
          <AlertTriangle className="mx-auto h-8 w-8 text-rose-500" />
          <p className="mt-2 text-sm font-semibold text-rose-700 dark:text-rose-300">Failed to load platform reports</p>
          <p className="text-xs text-rose-500 mt-0.5">Please check your network and refresh</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Date Range & Overview Indicator */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Reporting window:{" "}
              <span className="font-semibold text-slate-900 dark:text-white">
                {new Date(report.dateRange.start).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                {" — "}
                {new Date(report.dateRange.end).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="text-slate-500 dark:text-slate-400">
                Total Students: <strong className="font-semibold text-slate-900 dark:text-white">{report.overview.totalStudents}</strong>
              </span>
              <span className="text-slate-500 dark:text-slate-400">
                Active: <strong className="font-semibold text-emerald-600 dark:text-emerald-400">{report.overview.activeStudents}</strong>
              </span>
              <span className="text-slate-500 dark:text-slate-400">
                Groups: <strong className="font-semibold text-slate-900 dark:text-white">{report.overview.totalGroups}</strong>
              </span>
            </div>
          </div>

          {/* Metric Cards with Clean Trends */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <MetricCard
              label={`New Students (${periodLabel})`}
              value={report.currentPeriod.newStudents}
              trend={report.trends.students}
              icon={UserPlus}
            />
            <MetricCard
              label={`Messages Sent (${periodLabel})`}
              value={report.currentPeriod.newMessages}
              trend={report.trends.messages}
              icon={MessageSquare}
            />
            <MetricCard
              label={`New Conversations (${periodLabel})`}
              value={report.currentPeriod.newConversations}
              trend={report.trends.conversations}
              icon={Users}
            />
            <MetricCard
              label={`Requests Sent (${periodLabel})`}
              value={report.currentPeriod.newRequests}
              trend={report.trends.requests}
              icon={GitPullRequest}
            />
            <MetricCard
              label={`Requests Accepted (${periodLabel})`}
              value={report.currentPeriod.acceptedRequests}
              trend={null}
              icon={GitPullRequest}
            />
            <MetricCard
              label={`Groups Formed (${periodLabel})`}
              value={report.currentPeriod.newGroups}
              trend={null}
              icon={UsersRound}
            />
          </div>

          {/* Skills Analytics Section */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Top Skills */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
              <div className="mb-4">
                <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-white">
                  <Code2 className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                  Most Common Skills
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {report.skills.totalSkills} skills indexed across all student profiles
                </p>
              </div>

              {report.skills.topSkills.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No skills data available</p>
              ) : (
                <div className="space-y-3">
                  {report.skills.topSkills.map((skill, i) => {
                    const maxCount = report.skills.topSkills[0]?.count || 1
                    const percentage = Math.round((skill.count / maxCount) * 100)
                    return (
                      <div key={skill.name}>
                        <div className="mb-1.5 flex items-center justify-between text-xs">
                          <span className="flex items-center gap-2 font-medium text-slate-800 dark:text-slate-200">
                            <span className="flex h-4 w-4 items-center justify-center rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                              {i + 1}
                            </span>
                            {skill.name}
                          </span>
                          <span className="text-slate-500 dark:text-slate-400">{skill.count} students</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                          <div
                            className="h-full rounded-full bg-slate-900 dark:bg-white transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Skill Level Distribution */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
              <div className="mb-4">
                <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-white">
                  <Zap className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                  Skill Level Distribution
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Student self-assessment categorization
                </p>
              </div>

              {report.skills.levelDistribution.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No skill level distribution data</p>
              ) : (
                <div className="space-y-4">
                  {report.skills.levelDistribution.map((level) => {
                    const totalInLevels = report.skills.levelDistribution.reduce((s, l) => s + l.count, 0)
                    const pct = totalInLevels > 0 ? Math.round((level.count / totalInLevels) * 100) : 0
                    return (
                      <div key={level.level}>
                        <div className="mb-1.5 flex items-center justify-between text-xs">
                          <span className="inline-flex items-center rounded-md border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:text-slate-300">
                            {level.level}
                          </span>
                          <span className="font-medium text-slate-600 dark:text-slate-400">
                            {level.count} ({pct}%)
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                          <div
                            className="h-full rounded-full bg-slate-700 dark:bg-slate-300 transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Profile Completion & Group Stats */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Profile Completion */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
              <div className="mb-4">
                <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-white">
                  <UserCheck className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                  Profile Completeness Audit
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Missing information hindering peer matching
                </p>
              </div>

              <div className="space-y-3">
                {[
                  { label: "Missing Phone Number", value: report.profileCompletion.missingPhone },
                  { label: "Missing Academic Interests", value: report.profileCompletion.missingInterests },
                  { label: "Missing Career Goals", value: report.profileCompletion.missingCareerGoal },
                  { label: "No Skills Added", value: report.profileCompletion.noSkills },
                  { label: "No Projects Listed", value: report.profileCompletion.noProjects },
                ].map((item) => {
                  const pct = report.profileCompletion.totalStudents > 0
                    ? Math.round((item.value / report.profileCompletion.totalStudents) * 100)
                    : 0
                  return (
                    <div key={item.label} className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60 last:border-0">
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{item.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{item.value}</span>
                        <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                          {pct}%
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Group & Availability Breakdown */}
            <div className="space-y-6">
              {/* Group Membership */}
              <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
                <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-white">
                  <UsersRound className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                  Group Membership Status
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-4 text-center">
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{report.groupStats.studentsInGroups}</p>
                    <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-0.5">In a Group</p>
                  </div>
                  <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-4 text-center">
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{report.groupStats.studentsWithoutGroup}</p>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">Looking for Group</p>
                  </div>
                </div>
              </div>

              {/* Availability Status */}
              <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
                <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-white">
                  <ShieldCheck className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                  Student Availability
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {report.breakdown.availability.map((a) => (
                    <div key={a.status} className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-3 text-center">
                      <p className="text-xl font-bold text-slate-900 dark:text-white">{a.count}</p>
                      <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">{a.status}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Department, Semester, Status Distribution */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Department Breakdown */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
              <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-white">
                <Users className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                Students by Department
              </h3>
              {report.breakdown.departments.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No department data available</p>
              ) : (
                <div className="space-y-3">
                  {report.breakdown.departments.map((dept) => {
                    const percentage = report.overview.totalStudents > 0
                      ? Math.round((dept.count / report.overview.totalStudents) * 100)
                      : 0
                    return (
                      <div key={dept.department}>
                        <div className="mb-1 flex items-center justify-between text-xs">
                          <span className="font-medium text-slate-800 dark:text-slate-200">{dept.department}</span>
                          <span className="text-slate-500 dark:text-slate-400">{dept.count} ({percentage}%)</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                          <div
                            className="h-full rounded-full bg-slate-800 dark:bg-slate-200 transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Semester Breakdown */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
              <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-white">
                <Calendar className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                Students by Semester
              </h3>
              {report.breakdown.semesters.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No semester data available</p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {report.breakdown.semesters.map((sem) => (
                    <div
                      key={sem.semester}
                      className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-3 text-center"
                    >
                      <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Sem {sem.semester}</p>
                      <p className="mt-0.5 text-lg font-bold text-slate-900 dark:text-white">{sem.count}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Account Status Distribution */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs lg:col-span-2">
              <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-white">
                <BarChart3 className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                Account Status Distribution
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {report.breakdown.statuses.map((s) => {
                  const config: Record<string, { label: string; text: string }> = {
                    ACTIVE: { label: "Active Accounts", text: "text-emerald-600 dark:text-emerald-400" },
                    SUSPENDED: { label: "Suspended Accounts", text: "text-rose-600 dark:text-rose-400" },
                    DELETION_REQUESTED: { label: "Deletion Requested", text: "text-amber-600 dark:text-amber-400" },
                  }
                  const c = config[s.status] || { label: s.status, text: "text-slate-700 dark:text-slate-300" }
                  return (
                    <div
                      key={s.status}
                      className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-4 text-center"
                    >
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{c.label}</p>
                      <p className={`mt-1 text-2xl font-bold ${c.text}`}>{s.count}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Metric Card Component
function MetricCard({
  label,
  value,
  trend,
  icon: Icon,
}: {
  label: string
  value: number
  trend: number | null
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
          <Icon className="h-5 w-5" />
        </div>
        {trend !== null && (
          <div
            className={`flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold ${
              trend > 0
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                : trend < 0
                ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
            }`}
          >
            {trend > 0 ? (
              <TrendingUp className="h-3 w-3" />
            ) : trend < 0 ? (
              <TrendingDown className="h-3 w-3" />
            ) : (
              <Minus className="h-3 w-3" />
            )}
            {trend > 0 ? "+" : ""}{trend}%
          </div>
        )}
      </div>
      <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">{value.toLocaleString()}</p>
      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  )
}

