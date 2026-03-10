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
} from "lucide-react"
import { useAdminReports } from "@/hooks/admin"

export default function AdminReportsPage() {
  const [period, setPeriod] = useState<"week" | "month">("week")
  const { data: report, isLoading, isError } = useAdminReports(period)

  const periodLabel = period === "week" ? "This Week" : "This Month"

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30">
            <BarChart3 className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Reports</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Weekly and monthly platform analytics
            </p>
          </div>
        </div>

        {/* Period Toggle */}
        <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-800">
          <button
            onClick={() => setPeriod("week")}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              period === "week"
                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
            }`}
          >
            <Calendar className="h-4 w-4" />
            Weekly
          </button>
          <button
            onClick={() => setPeriod("month")}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              period === "month"
                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
            }`}
          >
            <Calendar className="h-4 w-4" />
            Monthly
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-indigo-600" />
            <p className="mt-3 text-sm text-slate-500">Generating report...</p>
          </div>
        </div>
      ) : isError || !report ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-800 dark:bg-red-900/20">
          <AlertTriangle className="mx-auto h-10 w-10 text-red-400" />
          <p className="mt-3 font-medium text-red-700 dark:text-red-300">Failed to load reports</p>
          <p className="text-sm text-red-500">Please try refreshing the page</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Date Range Indicator */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Reporting period: {" "}
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {new Date(report.dateRange.start).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  {" — "}
                  {new Date(report.dateRange.end).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </p>
              <div className="flex gap-4 text-sm">
                <span className="text-slate-500 dark:text-slate-400">
                  Total Students: <strong className="text-slate-900 dark:text-white">{report.overview.totalStudents}</strong>
                </span>
                <span className="text-slate-500 dark:text-slate-400">
                  Active: <strong className="text-emerald-600">{report.overview.activeStudents}</strong>
                </span>
                <span className="text-slate-500 dark:text-slate-400">
                  Groups: <strong className="text-indigo-600">{report.overview.totalGroups}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Metric Cards with Trends */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <MetricCard
              label={`New Students (${periodLabel})`}
              value={report.currentPeriod.newStudents}
              trend={report.trends.students}
              icon={UserPlus}
              gradient="from-blue-500 to-cyan-500"
              shadowColor="shadow-blue-500/20"
            />
            <MetricCard
              label={`Messages Sent (${periodLabel})`}
              value={report.currentPeriod.newMessages}
              trend={report.trends.messages}
              icon={MessageSquare}
              gradient="from-purple-500 to-violet-500"
              shadowColor="shadow-purple-500/20"
            />
            <MetricCard
              label={`New Conversations (${periodLabel})`}
              value={report.currentPeriod.newConversations}
              trend={report.trends.conversations}
              icon={Users}
              gradient="from-indigo-500 to-blue-500"
              shadowColor="shadow-indigo-500/20"
            />
            <MetricCard
              label={`Requests Sent (${periodLabel})`}
              value={report.currentPeriod.newRequests}
              trend={report.trends.requests}
              icon={GitPullRequest}
              gradient="from-amber-500 to-orange-500"
              shadowColor="shadow-amber-500/20"
            />
            <MetricCard
              label={`Requests Accepted (${periodLabel})`}
              value={report.currentPeriod.acceptedRequests}
              trend={null}
              icon={GitPullRequest}
              gradient="from-emerald-500 to-green-500"
              shadowColor="shadow-emerald-500/20"
            />
            <MetricCard
              label={`Groups Formed (${periodLabel})`}
              value={report.currentPeriod.newGroups}
              trend={null}
              icon={UsersRound}
              gradient="from-rose-500 to-pink-500"
              shadowColor="shadow-rose-500/20"
            />
          </div>

          {/* Breakdown Section */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Department Breakdown */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
                <Users className="h-5 w-5 text-slate-500" />
                Students by Department
              </h3>
              {report.breakdown.departments.length === 0 ? (
                <p className="text-sm text-slate-500">No department data available</p>
              ) : (
                <div className="space-y-3">
                  {report.breakdown.departments.map((dept) => {
                    const percentage = report.overview.totalStudents > 0
                      ? Math.round((dept.count / report.overview.totalStudents) * 100)
                      : 0
                    return (
                      <div key={dept.department}>
                        <div className="mb-1 flex items-center justify-between text-sm">
                          <span className="font-medium text-slate-700 dark:text-slate-300">{dept.department}</span>
                          <span className="text-slate-500">{dept.count} ({percentage}%)</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
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
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
                <Calendar className="h-5 w-5 text-slate-500" />
                Students by Semester
              </h3>
              {report.breakdown.semesters.length === 0 ? (
                <p className="text-sm text-slate-500">No semester data available</p>
              ) : (
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                  {report.breakdown.semesters.map((sem) => (
                    <div
                      key={sem.semester}
                      className="rounded-xl border border-slate-200 p-3 text-center dark:border-slate-700"
                    >
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Sem {sem.semester}</p>
                      <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{sem.count}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Status Breakdown */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800 lg:col-span-2">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
                <BarChart3 className="h-5 w-5 text-slate-500" />
                Account Status Distribution
              </h3>
              <div className="flex flex-wrap gap-4">
                {report.breakdown.statuses.map((s) => {
                  const config: Record<string, { bg: string; label: string }> = {
                    ACTIVE: { bg: "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20", label: "Active" },
                    SUSPENDED: { bg: "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20", label: "Suspended" },
                    DELETION_REQUESTED: { bg: "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20", label: "Deletion Requested" },
                  }
                  const c = config[s.status] || { bg: "border-slate-200 bg-slate-50", label: s.status }
                  return (
                    <div
                      key={s.status}
                      className={`flex-1 min-w-[120px] rounded-xl border p-4 ${c.bg}`}
                    >
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{c.label}</p>
                      <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{s.count}</p>
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
  gradient,
  shadowColor,
}: {
  label: string
  value: number
  trend: number | null
  icon: React.ComponentType<{ className?: string }>
  gradient: string
  shadowColor: string
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-start justify-between">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shadow-lg ${shadowColor}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        {trend !== null && (
          <div
            className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold ${
              trend > 0
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                : trend < 0
                ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
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
      <p className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">{value.toLocaleString()}</p>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  )
}
