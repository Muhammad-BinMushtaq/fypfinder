// components/admin/StudentTable.tsx
"use client"

import { useState } from "react"
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  User,
  Eye,
  MoreVertical,
  Users,
  Loader2,
  X,
} from "lucide-react"
import { useStudents, type StudentListItem, type StudentFilters } from "@/hooks/admin"
import { StudentActions } from "./StudentActions"
import { StudentProfileModal } from "./StudentProfileModal"

const STATUS_COLORS = {
  ACTIVE: "bg-emerald-100 text-emerald-700 border-emerald-200",
  SUSPENDED: "bg-red-100 text-red-700 border-red-200",
  DELETION_REQUESTED: "bg-amber-100 text-amber-700 border-amber-200",
}

const STATUS_LABELS = {
  ACTIVE: "Active",
  SUSPENDED: "Suspended",
  DELETION_REQUESTED: "Pending Deletion",
}

export function StudentTable() {
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

  const { data, isLoading, isError, error } = useStudents(filters)

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, search: e.target.value, page: 1 }))
  }

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-indigo-600" />
          <p className="mt-3 text-sm text-slate-500">Loading students...</p>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <Users className="h-8 w-8 text-red-400" />
          </div>
          <p className="mt-3 font-medium text-slate-700">Failed to load students</p>
          <p className="text-sm text-slate-500">
            {error instanceof Error ? error.message : "Please try refreshing the page"}
          </p>
        </div>
      </div>
    )
  }

  const students = data?.data || []
  const totalPages = data?.totalPages || 1
  const currentPage = data?.page || 1
  const total = data?.total || 0

  return (
    <div>
      {/* Filters */}
      <div className="border-b border-slate-200 p-4 lg:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={filters.search}
              onChange={handleSearch}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Status Filter */}
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={filters.status}
              onChange={(e) => handleStatusFilter(e.target.value as StudentFilters["status"])}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="DELETION_REQUESTED">Deletion Requested</option>
            </select>

            {/* Advanced Filters Toggle */}
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`relative flex items-center gap-1.5 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${
                showAdvancedFilters || activeFilterCount > 0
                  ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                  : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Filter className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showAdvancedFilters && (
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-700">Advanced Filters</p>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearAdvancedFilters}
                  className="flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700"
                >
                  <X className="h-3 w-3" />
                  Clear all
                </button>
              )}
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {/* Department */}
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Department</label>
                <input
                  type="text"
                  placeholder="e.g. Computer Science"
                  value={filters.department || ""}
                  onChange={(e) => setFilters((prev) => ({ ...prev, department: e.target.value, page: 1 }))}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Skill */}
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Skill</label>
                <input
                  type="text"
                  placeholder="e.g. React, Python"
                  value={filters.skill || ""}
                  onChange={(e) => setFilters((prev) => ({ ...prev, skill: e.target.value, page: 1 }))}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Availability */}
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Availability</label>
                <select
                  value={filters.availability || "ALL"}
                  onChange={(e) => setFilters((prev) => ({ ...prev, availability: e.target.value as StudentFilters["availability"], page: 1 }))}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="ALL">All</option>
                  <option value="AVAILABLE">Available</option>
                  <option value="BUSY">Busy</option>
                  <option value="AWAY">Away</option>
                </select>
              </div>

              {/* Group Membership */}
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Group Status</label>
                <select
                  value={filters.hasGroup || "ALL"}
                  onChange={(e) => setFilters((prev) => ({ ...prev, hasGroup: e.target.value as StudentFilters["hasGroup"], page: 1 }))}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                Student
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                Department
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                Joined
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                    <Users className="h-8 w-8 text-slate-400" />
                  </div>
                  <p className="mt-3 font-medium text-slate-700">No students found</p>
                  <p className="text-sm text-slate-500">Try adjusting your search or filter criteria</p>
                </td>
              </tr>
            ) : (
              students.map((student) => (
                <tr key={student.id} className="group transition-colors hover:bg-slate-50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-3">
                      {student.profilePicture ? (
                        <img
                          src={student.profilePicture}
                          alt={student.name}
                          className="h-11 w-11 rounded-full object-cover ring-2 ring-slate-100"
                        />
                      ) : (
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 ring-2 ring-slate-100">
                          <span className="text-sm font-bold text-white">{student.name.charAt(0)}</span>
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-slate-900">{student.name}</p>
                        <p className="text-sm text-slate-500">{student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700">
                      {student.department || "Not specified"}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${
                        STATUS_COLORS[student.status]
                      }`}
                    >
                      <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
                        student.status === "ACTIVE" ? "bg-emerald-500" :
                        student.status === "SUSPENDED" ? "bg-red-500" : "bg-amber-500"
                      }`} />
                      {STATUS_LABELS[student.status]}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
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
                        title="View Profile"
                        className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setSelectedStudent(student)}
                        title="Actions"
                        className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                      >
                        <MoreVertical className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
        <p className="text-sm text-slate-500">
          Showing <span className="font-medium text-slate-700">{students.length}</span> of{" "}
          <span className="font-medium text-slate-700">{total}</span> students
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + 1
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`h-9 w-9 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === pageNum
                      ? "bg-indigo-600 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {pageNum}
                </button>
              )
            })}
          </div>
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Actions Modal */}
      {selectedStudent && (
        <StudentActions
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      )}

      {/* Profile View Modal */}
      {viewingStudent && (
        <StudentProfileModal
          student={viewingStudent}
          onClose={() => setViewingStudent(null)}
        />
      )}
    </div>
  )
}
