// components/admin/StatsCards.tsx
"use client"

import { Users, UserCheck, UserX, Clock, MessageSquare, AlertTriangle, ArrowRight } from "lucide-react"
import { useAdminStats } from "@/hooks/admin"
import Link from "next/link"

export function StatsCards() {
  const { data: stats, isLoading, isError } = useAdminStats()

  if (isLoading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-200/60 dark:bg-slate-800/60" />
        ))}
      </div>
    )
  }

  if (isError || !stats) {
    return (
      <div className="rounded-2xl border border-red-200/80 bg-red-50/50 p-6 text-center dark:border-red-900/40 dark:bg-red-950/20">
        <AlertTriangle className="mx-auto h-7 w-7 text-red-500" />
        <p className="mt-2 text-sm font-semibold text-red-700 dark:text-red-300">Failed to load platform statistics</p>
        <p className="text-xs text-red-600/80 dark:text-red-400/80">Please check your connection and refresh</p>
      </div>
    )
  }

  const cards = [
    {
      label: "Total Students",
      value: stats.totalStudents,
      icon: Users,
      badge: "Registered",
      badgeColor: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
      iconColor: "text-slate-700 dark:text-slate-200",
      iconBg: "bg-slate-100 dark:bg-slate-800",
    },
    {
      label: "Active Students",
      value: stats.activeStudents,
      icon: UserCheck,
      badge: "Normal",
      badgeColor: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      iconBg: "bg-emerald-50 dark:bg-emerald-950/40",
    },
    {
      label: "Suspended",
      value: stats.suspendedStudents,
      icon: UserX,
      badge: "Restricted",
      badgeColor: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300",
      iconColor: "text-red-600 dark:text-red-400",
      iconBg: "bg-red-50 dark:bg-red-950/40",
    },
    {
      label: "Deletion Pending",
      value: stats.deletionRequestedStudents,
      icon: Clock,
      badge: "Action Required",
      badgeColor: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
      iconColor: "text-amber-600 dark:text-amber-400",
      iconBg: "bg-amber-50 dark:bg-amber-950/40",
    },
    {
      label: "Conversations",
      value: stats.totalConversations,
      icon: MessageSquare,
      badge: "Active Threads",
      badgeColor: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300",
      iconColor: "text-indigo-600 dark:text-indigo-400",
      iconBg: "bg-indigo-50 dark:bg-indigo-950/40",
    },
    {
      label: "Total Messages",
      value: stats.totalMessages,
      icon: MessageSquare,
      badge: "Delivered",
      badgeColor: "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300",
      iconColor: "text-purple-600 dark:text-purple-400",
      iconBg: "bg-purple-50 dark:bg-purple-950/40",
    },
  ]

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <StatCard key={card.label} {...card} />
      ))}
    </div>
  )
}

interface StatCardProps {
  label: string
  value: number
  icon: React.ComponentType<{ className?: string }>
  badge: string
  badgeColor: string
  iconColor: string
  iconBg: string
}

function StatCard({ label, value, icon: Icon, badge, badgeColor, iconColor, iconBg }: StatCardProps) {
  return (
    <div className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs transition-all hover:border-slate-300 dark:border-slate-800/80 dark:bg-slate-900 dark:hover:border-slate-700">
      <div className="flex items-center justify-between">
        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold tracking-wide ${badgeColor}`}>
          {badge}
        </span>
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconBg} ${iconColor}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {value.toLocaleString()}
        </p>
        <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
      </div>
    </div>
  )
}

// Quick Actions Section for Dashboard
export function RecentActivity() {
  const { data: stats, isLoading } = useAdminStats()

  if (isLoading) {
    return (
      <div className="h-64 animate-pulse rounded-2xl bg-slate-200/60 dark:bg-slate-800/60" />
    )
  }

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs dark:border-slate-800/80 dark:bg-slate-900">
      <div>
        <h3 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
          Quick Actions
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Frequently accessed admin management shortcuts
        </p>
      </div>

      <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
        {stats && stats.deletionRequestedStudents > 0 && (
          <Link
            href="/admin/students?status=DELETION_REQUESTED"
            className="group flex items-center justify-between rounded-xl border border-amber-200/70 bg-amber-50/40 p-4 transition-all hover:bg-amber-50 hover:border-amber-300 dark:border-amber-900/30 dark:bg-amber-950/20 dark:hover:bg-amber-950/30"
          >
            <div>
              <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                {stats.deletionRequestedStudents} Deletion Request{stats.deletionRequestedStudents !== 1 ? "s" : ""}
              </p>
              <p className="text-xs text-amber-700/80 dark:text-amber-400/80">Pending review</p>
            </div>
            <ArrowRight className="h-4 w-4 text-amber-600 transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}

        <Link
          href="/admin/students"
          className="group flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 transition-all hover:bg-slate-100/70 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-800/40 dark:hover:bg-slate-800/70"
        >
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Student Directory</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Manage all student accounts</p>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-700 dark:group-hover:text-slate-200" />
        </Link>

        <Link
          href="/admin/feedback"
          className="group flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 transition-all hover:bg-slate-100/70 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-800/40 dark:hover:bg-slate-800/70"
        >
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Student Feedback</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Review tickets & send responses</p>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-700 dark:group-hover:text-slate-200" />
        </Link>

        <Link
          href="/admin/messages"
          className="group flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 transition-all hover:bg-slate-100/70 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-800/40 dark:hover:bg-slate-800/70"
        >
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Conversation Audit</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Read-only student chat logs</p>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-700 dark:group-hover:text-slate-200" />
        </Link>
      </div>
    </div>
  )
}
