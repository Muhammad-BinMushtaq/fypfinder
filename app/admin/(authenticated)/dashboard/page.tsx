// app/admin/(authenticated)/dashboard/page.tsx
"use client"

import { useAdminSession } from "@/hooks/admin"
import { StatsCards, RecentActivity } from "@/components/admin/StatsCards"
import { AIMonitoringCard } from "@/components/admin/AIMonitoringCard"
import { Shield, Calendar, Clock, CheckCircle2 } from "lucide-react"

export default function AdminDashboardPage() {
  const { admin } = useAdminSession()

  const currentDate = new Date()
  const greeting =
    currentDate.getHours() < 12
      ? "Good morning"
      : currentDate.getHours() < 18
      ? "Good afternoon"
      : "Good evening"

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Modern Minimal Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 dark:border-slate-800/80 pb-6">
        <div>
          <p className="text-xs font-semibold tracking-wider uppercase text-slate-400 dark:text-slate-500">
            {greeting}
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white lg:text-3xl">
            {admin?.name || "Administrator"}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Platform performance and management overview for FYPMate.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 shadow-2xs dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <span>
              {currentDate.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-emerald-200/70 bg-emerald-50/50 px-3.5 py-2 text-xs font-medium text-emerald-800 shadow-2xs dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Operational</span>
          </div>
        </div>
      </div>

      {/* Platform Overview */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Platform Metrics
          </h2>
        </div>
        <StatsCards />
      </section>

      {/* AI Provider Telemetry & Monitoring */}
      <section className="space-y-3">
        <AIMonitoringCard />
      </section>

      {/* Quick Actions & System Info */}
      <section className="grid gap-6 lg:grid-cols-2">
        <RecentActivity />

        {/* System & Session Card */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs dark:border-slate-800/80 dark:bg-slate-900">
          <div>
            <h3 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
              System Status
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Security context and session metadata
            </p>
          </div>

          <div className="mt-5 space-y-3">
            <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 dark:border-slate-800/60 dark:bg-slate-800/40">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-200/70 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">Active Session</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Authenticated via Supabase Auth</p>
                </div>
              </div>
              <span className="text-xs font-mono text-slate-600 dark:text-slate-400">
                {currentDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 dark:border-slate-800/60 dark:bg-slate-800/40">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-200/70 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                  <Shield className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">Privilege Level</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Role-Based Access Control</p>
                </div>
              </div>
              <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                Full Admin
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-emerald-200/60 bg-emerald-50/40 p-3.5 dark:border-emerald-900/30 dark:bg-emerald-950/20">
              <div className="flex items-center gap-2 text-xs font-medium text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Database & Services
              </div>
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                Online
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
