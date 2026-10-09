// components/admin/StudentTable.tsx
"use client"

import { useState, useEffect } from "react"
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  Eye, 
  MoreVertical,
  Users, 
  Loader2, 
  X,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react"
import { useStudents, type StudentListItem, type StudentFilters } from "@/hooks/admin"
import { StudentActions } from "./StudentActions"
import { StudentProfileModal } from "./StudentProfileModal"

const STATUS_CONFIG = {
  ACTIVE: {
    label: "Active",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200/70 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/40",
    dot: "bg-emerald-500",
  },
  SUSPENDED: {
    label: "Suspended",
    badge: "bg-red-50 text-red-700 border-red-200/70 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900/40",
    dot: "bg-red-500",
  },
  DELETION_REQUESTED: {
    label: "Pending Deletion",
    badge: "bg-amber-50 text-amber-700 border-amber-200/70 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/40",
    dot: "bg-amber-500",
  },
}

export function StudentTable() {
  const [searchInput, setSearchInput] = useState("")
  const [filters, setFilters] = useState<StudentFilters>({
    page: 1,
    pageSize: 10,
    status: "ALL",
    search: "",
    department: "",
    skill: "",
    availability: "ALL",
    hasGroup: "ALL",
  })
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<StudentListItem | null>(null)
  const [viewingStudent, setViewingStudent] = useState<StudentListItem | null>(null)

  // Debounce search input by 350ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setFilters((prev) => {
        if (prev.search === searchInput) return prev
        return { ...prev, search: searchInput, page: 1 }
      })
    }, 350)

    return () => clearTimeout(handler)
  }, [searchInput])

  const { data, isLoading, isError, error } = useStudents(filters)

  const handleStatusFilter = (status: StudentFilters["status"]) => {
    setFilters((prev) => ({ ...prev, status, page: 1 }))
  }

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }))
  }

  const activeFilterCount = [
    filters.department,
    filters.skill,
    filters.availability !== "ALL" ? filters.availability : "",
    filters.hasGroup !== "ALL" ? filters.hasGroup : "",
  ].filter(Boolean).length

  const clearAdvancedFilters = () => {
    setFilters((prev) => ({
      ...prev,
      department: "",
      skill: "",
      availability: "ALL",
      hasGroup: "ALL",
      page: 1,
    }))
  }

  const students = data?.data || []
  const totalPages = data?.totalPages || 1
  const currentPage = data?.page || 1
  const total = data?.total || 0

  // Calculate sliding pagination page numbers
  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    if (currentPage <= 3) {
      return [1, 2, 3, 4, "...", totalPages]
    }

    if (currentPage >= totalPages - 2) {
      return [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
    }

    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages]
  }

  return (
    <div className="w-full text-slate-900 dark:text-slate-100">
      {/* Search & Filter Header */}
      <div className="border-b border-slate-200/80 dark:border-slate-800/80 p-4 lg:p-6 bg-white dark:bg-slate-900">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search by student name or email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 py-2 pl-10 pr-4 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-slate-400 dark:focus:border-slate-600 focus:bg-white dark:focus:bg-slate-800 focus:outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Status Select */}
            <select
              value={filters.status}
              onChange={(e) => handleStatusFilter(e.target.value as StudentFilters["status"])}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer transition-colors"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="DELETION_REQUESTED">Deletion Requested</option>
            </select>

            {/* Advanced Filters Button */}
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`relative flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                showAdvancedFilters || activeFilterCount > 0
                  ? "border-slate-900 dark:border-slate-100 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900"
                  : "border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Filter className="h-3.5 w-3.5" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-[10px] font-bold text-slate-900 dark:text-white ml-0.5">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Collapsible Advanced Filters */}
        {showAdvancedFilters && (
          <div className="mt-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850 p-4 animate-in fade-in duration-150">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Detailed Filters
              </p>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearAdvancedFilters}
                  className="flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400 hover:underline cursor-pointer"
                >
                  <X className="h-3 w-3" />
                  Reset filters
                </button>
              )}
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Department</label>
                <input
                  type="text"
                  placeholder="e.g. Computer Science"
                  value={filters.department || ""}
                  onChange={(e) => setFilters((prev) => ({ ...prev, department: e.target.value, page: 1 }))}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Skill</label>
                <input
                  type="text"
                  placeholder="e.g. React, Python"
                  value={filters.skill || ""}
                  onChange={(e) => setFilters((prev) => ({ ...prev, skill: e.target.value, page: 1 }))}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Availability</label>
                <select
                  value={filters.availability || "ALL"}
                  onChange={(e) => setFilters((prev) => ({ ...prev, availability: e.target.value as StudentFilters["availability"], page: 1 }))}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="ALL">All</option>
                  <option value="AVAILABLE">Available</option>
                  <option value="BUSY">Busy</option>
                  <option value="AWAY">Away</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Group Status</label>
                <select
                  value={filters.hasGroup || "ALL"}
                  onChange={(e) => setFilters((prev) => ({ ...prev, hasGroup: e.target.value as StudentFilters["hasGroup"], page: 1 }))}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="ALL">All</option>
                  <option value="true">In a Group</option>
                  <option value="false">No Group</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-850/50">
              <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Student
              </th>
              <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Department
              </th>
              <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Status
              </th>
              <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Joined
              </th>
              <th className="px-6 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-slate-900">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center">
                  <Loader2 className="mx-auto h-7 w-7 animate-spin text-slate-500" />
                  <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Loading students...</p>
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/40 text-red-500">
                    <Users className="h-6 w-6" />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">Failed to load students</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {error instanceof Error ? error.message : "Error loading records"}
                  </p>
                </td>
              </tr>
            ) : students.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
                    <Users className="h-6 w-6" />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-slate-800 dark:text-slate-200">No students found</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Try adjusting your filters or search query</p>
                </td>
              </tr>
            ) : (
              students.map((student) => {
                const statusInfo = STATUS_CONFIG[student.status] || STATUS_CONFIG.ACTIVE
                return (
                  <tr 
                    key={student.id} 
                    className="group transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                  >
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-3">
                        {student.profilePicture ? (
                          <img
                            src={student.profilePicture}
                            alt={student.name}
                            className="h-10 w-10 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs ring-1 ring-slate-200 dark:ring-slate-700">
                            {student.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">
                            {student.name}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                            {student.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="inline-flex items-center rounded-md bg-slate-100/80 dark:bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300">
                        {student.department || "General"}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium ${statusInfo.badge}`}>
                        <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${statusInfo.dot}`} />
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-xs text-slate-500 dark:text-slate-400">
                      {new Date(student.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewingStudent(student)}
                          title="View Profile Details"
                          className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setSelectedStudent(student)}
                          title="Manage Status"
                          className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-200/80 dark:border-slate-800/80 px-6 py-4 bg-white dark:bg-slate-900 gap-3">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Showing <span className="font-semibold text-slate-800 dark:text-slate-200">{students.length}</span> of{" "}
          <span className="font-semibold text-slate-800 dark:text-slate-200">{total}</span> student accounts
        </p>

        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage <= 1}
              title="First Page"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              title="Previous Page"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {getPageNumbers().map((pageNum, idx) => {
              if (pageNum === "...") {
                return (
                  <span key={`dots-${idx}`} className="px-2 text-xs text-slate-400">
                    ...
                  </span>
                )
              }

              const num = Number(pageNum)
              const isActive = currentPage === num
              return (
                <button
                  key={num}
                  onClick={() => handlePageChange(num)}
                  className={`h-8 w-8 rounded-lg text-xs font-semibold transition-colors ${
                    isActive
                      ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  {num}
                </button>
              )
            })}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              title="Next Page"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage >= totalPages}
              title="Last Page"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedStudent && (
        <StudentActions
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      )}

      {viewingStudent && (
        <StudentProfileModal
          student={viewingStudent}
          onClose={() => setViewingStudent(null)}
        />
      )}
    </div>
  )
}
