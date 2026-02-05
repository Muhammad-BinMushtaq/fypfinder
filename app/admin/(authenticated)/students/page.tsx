// app/admin/(authenticated)/students/page.tsx
"use client"

import { Suspense } from "react"
import { Users, Download, Loader2 } from "lucide-react"
import { StudentTable } from "@/components/admin/StudentTable"
import { useAdminStats } from "@/hooks/admin"

function StatsBar() {
  const { data: stats, isLoading } = useAdminStats()

  if (isLoading) {
    return (
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-200" />
        ))}
      </div>
    )
  }

  return (
    <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-sm font-medium text-slate-500">Total Students</p>
        <p className="mt-1 text-2xl font-bold text-slate-900">{stats?.totalStudents || 0}</p>
      </div>
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
        <p className="text-sm font-medium text-emerald-600">Active</p>
        <p className="mt-1 text-2xl font-bold text-emerald-700">{stats?.activeStudents || 0}</p>
      </div>
      <div className="rounded-xl border border-red-200 bg-red-50 p-4">
        <p className="text-sm font-medium text-red-600">Suspended</p>
        <p className="mt-1 text-2xl font-bold text-red-700">{stats?.suspendedStudents || 0}</p>
      </div>
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm font-medium text-amber-600">Deletion Pending</p>
        <p className="mt-1 text-2xl font-bold text-amber-700">{stats?.deletionRequestedStudents || 0}</p>
      </div>
    </div>
  )
}

export default function AdminStudentsPage() {
  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30">
            <Users className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Student Management</h1>
            <p className="text-sm text-slate-500">
              View, manage, and moderate all registered students
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Quick Stats Bar */}
      <StatsBar />

      {/* Student Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <Suspense
          fallback={
            <div className="flex h-96 items-center justify-center">
              <div className="text-center">
                <Loader2 className="h-10 w-10 mx-auto animate-spin text-indigo-600" />
                <p className="mt-3 text-sm text-slate-500">Loading students...</p>
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
