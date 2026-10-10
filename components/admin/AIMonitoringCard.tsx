// components/admin/AIMonitoringCard.tsx
"use client"

import { useState, useEffect } from "react"
import { 
  Cpu, 
  CheckCircle2, 
  AlertTriangle, 
  Activity, 
  RotateCw, 
  Layers, 
  Zap, 
  Clock 
} from "lucide-react"

interface AIStatsData {
  summary: {
    totalAllTime: number
    totalToday: number
    totalLast30Days: number
    successRate: number
    fallbackRate: number
    rateLimitedRequests: number
    totalTokens: number
    promptTokens: number
    completionTokens: number
    estimatedSavings: string
  }
  providerBreakdown: Array<{ provider: string; count: number }>
  modelBreakdown: Array<{ model: string; count: number }>
  recentLogs: Array<{
    id: string
    operation: string
    provider: string
    modelId: string
    keyAlias: string
    status: string
    isFallback: boolean
    fallbackFrom: string | null
    totalTokens: number
    latencyMs: number
    createdAt: string
  }>
}

export function AIMonitoringCard() {
  const [data, setData] = useState<AIStatsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date())

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/ai-stats")
      if (res.ok) {
        const json = await res.json()
        setData(json.data)
        setLastRefreshed(new Date())
      }
    } catch {
      // Keep existing data on error
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 15000) // Auto-refresh every 15s
    return () => clearInterval(interval)
  }, [])

  if (isLoading && !data) {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs dark:border-slate-800/80 dark:bg-slate-900">
        <div className="h-48 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
      </div>
    )
  }

  const summary = data?.summary || {
    totalAllTime: 0,
    totalToday: 0,
    totalLast30Days: 0,
    successRate: 100,
    fallbackRate: 0,
    rateLimitedRequests: 0,
    totalTokens: 0,
    promptTokens: 0,
    completionTokens: 0,
    estimatedSavings: "$0.00",
  }

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs dark:border-slate-800/80 dark:bg-slate-900 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900">
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>AI Provider Resilience & Monitoring</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Multi-tier fallback across Groq (4 Keys), Gemini, OpenRouter & Mistral
            </p>
          </div>
        </div>

        <button
          onClick={fetchStats}
          className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
        >
          <RotateCw className="h-3 w-3" />
          <span>Refreshed {lastRefreshed.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-xl border border-slate-200/70 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/30 p-3.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Today Requests
          </p>
          <p className="mt-1 text-xl font-extrabold text-slate-900 dark:text-white">
            {summary.totalToday}
          </p>
          <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">
            {summary.totalLast30Days} last 30d
          </p>
        </div>

        <div className="rounded-xl border border-slate-200/70 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/30 p-3.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Success Rate
          </p>
          <p className="mt-1 text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {summary.successRate}%
          </p>
          <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">
            Zero fatal outages
          </p>
        </div>

        <div className="rounded-xl border border-slate-200/70 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/30 p-3.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Fallback Rate
          </p>
          <p className="mt-1 text-xl font-extrabold text-amber-600 dark:text-amber-400">
            {summary.fallbackRate}%
          </p>
          <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">
            {summary.rateLimitedRequests} rate-limits absorbed
          </p>
        </div>

        <div className="rounded-xl border border-slate-200/70 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/30 p-3.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Tokens Processed
          </p>
          <p className="mt-1 text-xl font-extrabold text-slate-900 dark:text-white">
            {(summary.totalTokens / 1000).toFixed(1)}k
          </p>
          <p className="mt-0.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
            $0.00 (100% Free Tiers)
          </p>
        </div>
      </div>

      {/* Provider Status Badges */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Provider Tier Status
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          <div className="flex items-center justify-between rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-2.5">
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Tier 1: Groq Pool</p>
              <p className="text-[10px] text-slate-500">4 Active Keys • 5 Models</p>
            </div>
            <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-3 w-3" />
              Active
            </span>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-2.5">
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Tier 2: Google Gemini</p>
              <p className="text-[10px] text-slate-500">3.5-Flash-Lite • 1M TPM</p>
            </div>
            <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-3 w-3" />
              Active
            </span>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-2.5">
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Tier 3: OpenRouter</p>
              <p className="text-[10px] text-slate-500">2 Keys • 14 Free Models</p>
            </div>
            <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-3 w-3" />
              Active
            </span>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-2.5">
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Tier 4: Mistral AI</p>
              <p className="text-[10px] text-slate-500">mistral-small-latest</p>
            </div>
            <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-3 w-3" />
              Active
            </span>
          </div>
        </div>
      </div>

      {/* Live Recent Stream Table */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Recent AI Invocations & Telemetry Log
        </h4>
        <div className="overflow-x-auto rounded-xl border border-slate-200/70 dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-[11px] font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200/70 dark:border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Time</th>
                <th className="py-2.5 px-3">Operation</th>
                <th className="py-2.5 px-3">Provider</th>
                <th className="py-2.5 px-3">Model</th>
                <th className="py-2.5 px-3">Key Alias</th>
                <th className="py-2.5 px-3">Tokens</th>
                <th className="py-2.5 px-3">Latency</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {!data?.recentLogs || data.recentLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-slate-400">
                    No AI requests logged yet. New validations will appear here in real time.
                  </td>
                </tr>
              ) : (
                data.recentLogs.slice(0, 8).map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-2 px-3 text-slate-500">
                      {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="py-2 px-3 font-medium text-slate-800 dark:text-zinc-200">
                      {log.operation === "idea_validation" ? "Idea Validation" : "PDF Extraction"}
                    </td>
                    <td className="py-2 px-3 font-semibold text-slate-900 dark:text-white">
                      {log.provider}
                    </td>
                    <td className="py-2 px-3 text-slate-600 dark:text-zinc-400 font-mono text-[10px]">
                      {log.modelId}
                    </td>
                    <td className="py-2 px-3 text-slate-500 text-[10px]">
                      {log.keyAlias}
                    </td>
                    <td className="py-2 px-3 text-slate-700 dark:text-zinc-300">
                      {log.totalTokens > 0 ? log.totalTokens.toLocaleString() : "—"}
                    </td>
                    <td className="py-2 px-3 text-slate-500">
                      {log.latencyMs}ms
                    </td>
                    <td className="py-2 px-3">
                      <span
                        className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                          log.status === "SUCCESS"
                            ? log.isFallback
                              ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/60"
                              : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/60"
                            : "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200/60"
                        }`}
                      >
                        {log.isFallback ? "FALLBACK" : log.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
