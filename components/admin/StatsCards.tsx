// components/admin/StatsCards.tsx
"use client"

import { Users, UserCheck, UserX, Clock, MessageSquare, AlertTriangle, TrendingUp, Mail } from "lucide-react"
import { useAdminStats } from "@/hooks/admin"
import Link from "next/link"

export function StatsCards() {
  const { data: stats, isLoading, isError } = useAdminStats()

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-200" />
        ))}
      </div>
    )
  }

  if (isError || !stats) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
        <AlertTriangle className="mx-auto h-8 w-8 text-red-400" />
        <p className="mt-2 font-medium text-red-600">Failed to load statistics</p>
        <p className="text-sm text-red-500">Please try refreshing the page</p>
      </div>
    )
  }

  const cards = [
    {
      label: "Total Students",
      value: stats.totalStudents,
      icon: Users,
      gradient: "from-blue-500 to-cyan-500",
      shadowColor: "shadow-blue-500/20",
      bgLight: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      label: "Active Students",
      value: stats.activeStudents,
      icon: UserCheck,
      gradient: "from-emerald-500 to-green-500",
      shadowColor: "shadow-emerald-500/20",
      bgLight: "bg-emerald-50",
      textColor: "text-emerald-600",
    },
    {
      label: "Suspended",
      value: stats.suspendedStudents,
      icon: UserX,
      gradient: "from-red-500 to-rose-500",
      shadowColor: "shadow-red-500/20",
      bgLight: "bg-red-50",
      textColor: "text-red-600",
    },
    {
      label: "Deletion Pending",
      value: stats.deletionRequestedStudents,
      icon: Clock,
      gradient: "from-amber-500 to-orange-500",
      shadowColor: "shadow-amber-500/20",
      bgLight: "bg-amber-50",
      textColor: "text-amber-600",
    },
    {
      label: "Conversations",
      value: stats.totalConversations,
      icon: MessageSquare,
      gradient: "from-purple-500 to-violet-500",
      shadowColor: "shadow-purple-500/20",
      bgLight: "bg-purple-50",
      textColor: "text-purple-600",
    },
    {
      label: "Total Messages",
      value: stats.totalMessages,
      icon: Mail,
      gradient: "from-indigo-500 to-blue-500",
      shadowColor: "shadow-indigo-500/20",
      bgLight: "bg-indigo-50",
      textColor: "text-indigo-600",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
  gradient: string
  shadowColor: string
  bgLight: string
  textColor: string
}

function StatCard({ label, value, icon: Icon, gradient, shadowColor, bgLight, textColor }: StatCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{value.toLocaleString()}</p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shadow-lg ${shadowColor}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
      {/* Decorative gradient line */}
      <div className={`absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r ${gradient} opacity-0 transition-opacity group-hover:opacity-100`} />
    </div>
  )
}

// Recent Activity Section for Dashboard
export function RecentActivity() {
  const { data: stats, isLoading } = useAdminStats()

  if (isLoading) {
    return (
      <div className="h-64 animate-pulse rounded-2xl bg-slate-200" />
    )
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
          <TrendingUp className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">Quick Actions</h3>
          <p className="text-sm text-slate-500">Common admin tasks</p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {stats && stats.deletionRequestedStudents > 0 && (
          <Link
            href="/admin/students?status=DELETION_REQUESTED"
            className="group flex items-center gap-3 rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-4 transition-all hover:shadow-md hover:shadow-amber-100"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 shadow-md shadow-amber-500/30">
              <AlertTriangle className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-amber-900">
                {stats.deletionRequestedStudents} Deletion Request{stats.deletionRequestedStudents !== 1 ? "s" : ""}
              </p>
              <p className="text-sm text-amber-700">Review pending requests</p>
            </div>
          </Link>
        )}

        <Link
          href="/admin/students"
          className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 transition-all hover:border-blue-200 hover:bg-blue-50 hover:shadow-md hover:shadow-blue-100"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 shadow-md shadow-blue-500/30">
            <Users className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-medium text-slate-900 group-hover:text-blue-900">Manage Students</p>
            <p className="text-sm text-slate-500 group-hover:text-blue-700">View and manage all students</p>
          </div>
        </Link>

        <Link
          href="/admin/messages"
          className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 transition-all hover:border-purple-200 hover:bg-purple-50 hover:shadow-md hover:shadow-purple-100"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 shadow-md shadow-purple-500/30">
            <MessageSquare className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-medium text-slate-900 group-hover:text-purple-900">View Conversations</p>
            <p className="text-sm text-slate-500 group-hover:text-purple-700">Read-only message access</p>
          </div>
        </Link>

        {stats && stats.suspendedStudents > 0 && (
          <Link
            href="/admin/students?status=SUSPENDED"
            className="group flex items-center gap-3 rounded-xl border border-red-200 bg-gradient-to-r from-red-50 to-rose-50 p-4 transition-all hover:shadow-md hover:shadow-red-100"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-rose-500 shadow-md shadow-red-500/30">
              <UserX className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-red-900">
                {stats.suspendedStudents} Suspended
              </p>
              <p className="text-sm text-red-700">Review suspended accounts</p>
            </div>
          </Link>
        )}
      </div>
    </div>
  )
}
