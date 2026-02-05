// app/admin/(authenticated)/dashboard/page.tsx
"use client"

import { useAdminSession } from "@/hooks/admin"
import { StatsCards, RecentActivity } from "@/components/admin/StatsCards"
import { Shield, Calendar, Clock, TrendingUp } from "lucide-react"

export default function AdminDashboardPage() {
  const { admin } = useAdminSession()

  const currentDate = new Date()
  const greeting = currentDate.getHours() < 12 ? "Good morning" : currentDate.getHours() < 18 ? "Good afternoon" : "Good evening"

  return (
    <div className="p-6 lg:p-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <div className="rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 p-6 text-white shadow-xl shadow-indigo-500/20 lg:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-indigo-200">{greeting}</p>
              <h1 className="mt-1 text-2xl font-bold lg:text-3xl">
                {admin?.name || "Administrator"}
              </h1>
              <p className="mt-2 text-sm text-indigo-200">
                Here&apos;s what&apos;s happening with FYP Finder today.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm">
              <Calendar className="h-5 w-5 text-indigo-200" />
              <div className="text-sm">
                <p className="font-medium">
                  {currentDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
                <p className="text-indigo-200">
                  {currentDate.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <section className="mb-8">
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-slate-600" />
          <h2 className="text-lg font-semibold text-slate-900">Platform Overview</h2>
        </div>
        <StatsCards />
      </section>

      {/* Quick Actions / Recent Activity */}
      <section className="grid gap-6 lg:grid-cols-2">
        <RecentActivity />

        {/* System Info Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
              <Shield className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">System Information</h3>
              <p className="text-sm text-slate-500">Current session details</p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-4 rounded-xl bg-slate-50 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100">
                <Clock className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">Session Started</p>
                <p className="text-sm text-slate-500">
                  {currentDate.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })} today
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-xl bg-slate-50 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">Access Level</p>
                <p className="text-sm text-slate-500">Full Administrator Privileges</p>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
                <p className="text-sm font-medium text-green-800">All systems operational</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
