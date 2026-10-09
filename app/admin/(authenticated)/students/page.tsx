// app/admin/(authenticated)/students/page.tsx
"use client"

import { useState, Suspense } from "react"
import { Users, Download, Loader2 } from "lucide-react"
import { StudentTable } from "@/components/admin/StudentTable"
import { useAdminStats } from "@/hooks/admin"
import { getAllStudents } from "@/services/admin.service"
import { toast } from "react-toastify"

function StatsBar() {
  const { data: stats, isLoading } = useAdminStats()

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-2xl bg-slate-200/60 dark:bg-slate-800/60" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs dark:border-slate-800/80 dark:bg-slate-900">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Students</p>
        <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {stats?.totalStudents || 0}
        </p>
      </div>
      <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50/40 p-4 shadow-2xs dark:border-emerald-900/30 dark:bg-emerald-950/20">
        <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Active</p>
        <p className="mt-1 text-2xl font-bold tracking-tight text-emerald-800 dark:text-emerald-300">
          {stats?.activeStudents || 0}
        </p>
      </div>
      <div className="rounded-2xl border border-red-200/60 bg-red-50/40 p-4 shadow-2xs dark:border-red-900/30 dark:bg-red-950/20">
        <p className="text-xs font-medium text-red-700 dark:text-red-400">Suspended</p>
        <p className="mt-1 text-2xl font-bold tracking-tight text-red-800 dark:text-red-300">
          {stats?.suspendedStudents || 0}
        </p>
      </div>
      <div className="rounded-2xl border border-amber-200/60 bg-amber-50/40 p-4 shadow-2xs dark:border-amber-900/30 dark:bg-amber-950/20">
        <p className="text-xs font-medium text-amber-700 dark:text-amber-400">Pending Deletion</p>
        <p className="mt-1 text-2xl font-bold tracking-tight text-amber-800 dark:text-amber-300">
          {stats?.deletionRequestedStudents || 0}
        </p>
      </div>
    </div>
  )
}

export default function AdminStudentsPage() {
  const [isExporting, setIsExporting] = useState(false)

  const handleExportCSV = async () => {
    try {
      setIsExporting(true)
      const res = await getAllStudents({ pageSize: 1000 })
      const students = res.data

      if (students.length === 0) {
        toast.info("No students to export")
        return
      }

      // Convert to CSV
      const headers = ["ID", "Name", "Email", "Department", "Semester", "Status", "Joined At"]
      const rows = students.map((s) => [
        `"${s.id}"`,
        `"${s.name.replace(/"/g, '""')}"`,
        `"${s.email}"`,
        `"${(s.department || "Not specified").replace(/"/g, '""')}"`,
        `"${s.currentSemester || ""}"`,
        `"${s.status}"`,
        `"${new Date(s.createdAt).toISOString()}"`,
      ])

      const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `fypfinder-students-${new Date().toISOString().slice(0, 10)}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success(`Exported ${students.length} student records`)
    } catch {
      toast.error("Failed to export students")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 dark:border-slate-800/80 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Student Directory
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            View profiles, moderate accounts, and manage student platform access
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            disabled={isExporting}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/70 disabled:opacity-50 cursor-pointer"
          >
            {isExporting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5 text-slate-500" />
            )}
            <span>{isExporting ? "Exporting..." : "Export CSV"}</span>
          </button>
        </div>
      </div>

      {/* Quick Stats Bar */}
      <StatsBar />

      {/* Student Table Container */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-2xs overflow-hidden">
        <Suspense
          fallback={
            <div className="flex h-96 items-center justify-center">
              <div className="text-center">
                <Loader2 className="h-8 w-8 mx-auto animate-spin text-slate-600 dark:text-slate-400" />
                <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Loading student directory...</p>
              </div>
            </div>
          }
        >
          <StudentTable />
        </Suspense>
      </div>
    </div>
  )
}
