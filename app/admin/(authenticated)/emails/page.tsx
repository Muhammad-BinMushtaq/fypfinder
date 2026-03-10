// app/admin/(authenticated)/emails/page.tsx
"use client"

import { useState, useCallback } from "react"
import {
  Mail,
  Send,
  Eye,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Users,
  UserX,
  Filter,
  ChevronDown,
  ChevronUp,
  X,
  Info,
} from "lucide-react"
import {
  useEmailPreview,
  useEmailSend,
  type EmailFilters,
  type EmailPreviewStudent,
} from "@/hooks/admin"

// ============ FILTER CHECKBOXES CONFIG ============

interface FilterOption {
  key: keyof Omit<EmailFilters, "selectAll" | "studentIds" | "limit">
  label: string
  description: string
}

const FILTER_OPTIONS: FilterOption[] = [
  { key: "noSkills", label: "No Skills", description: "Students who haven't added any skills" },
  { key: "noProjects", label: "No Projects", description: "Students who haven't added any projects" },
  { key: "noInternships", label: "No Internships", description: "Students who haven't added internship experience" },
  { key: "noHobbies", label: "No Hobbies", description: "Students who haven't added hobbies" },
  { key: "noPhone", label: "No Phone", description: "Students who haven't added their phone number" },
  { key: "noInterests", label: "No Interests", description: "Students who haven't added their interests" },
  { key: "noCareerGoal", label: "No Career Goal", description: "Students who haven't defined their career goal" },
  { key: "noPreferredTechStack", label: "No Tech Stack", description: "Students who haven't set preferred tech stack" },
  { key: "noLinkedinUrl", label: "No LinkedIn", description: "Students who haven't linked their LinkedIn profile" },
  { key: "noGithubUrl", label: "No GitHub", description: "Students who haven't linked their GitHub profile" },
]

const DEFAULT_FILTERS: EmailFilters = {
  noSkills: false,
  noProjects: false,
  noInternships: false,
  noHobbies: false,
  noPhone: false,
  noInterests: false,
  noCareerGoal: false,
  noPreferredTechStack: false,
  noLinkedinUrl: false,
  noGithubUrl: false,
  selectAll: false,
  limit: 100,
}

// Section labels for display
const SECTION_LABELS: Record<string, string> = {
  skills: "Skills",
  projects: "Projects",
  internships: "Internships",
  hobbies: "Hobbies",
  phone: "Phone Number",
  interests: "Interests",
  careerGoal: "Career Goal",
  preferredTechStack: "Tech Stack",
  linkedinUrl: "LinkedIn",
  githubUrl: "GitHub",
}

export default function AdminEmailsPage() {
  const [filters, setFilters] = useState<EmailFilters>(DEFAULT_FILTERS)
  const [previewStudents, setPreviewStudents] = useState<EmailPreviewStudent[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const [showStudentList, setShowStudentList] = useState(false)
  const [confirmSend, setConfirmSend] = useState(false)
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set())
  const [useManualSelection, setUseManualSelection] = useState(false)

  const preview = useEmailPreview()
  const send = useEmailSend()

  // Count active checkbox filters
  const activeFilterCount = FILTER_OPTIONS.filter((opt) => filters[opt.key]).length

  const handleFilterChange = useCallback((key: keyof EmailFilters, value: boolean) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setShowPreview(false)
    setConfirmSend(false)
  }, [])

  const handleSelectAll = useCallback((checked: boolean) => {
    setFilters((prev) => ({
      ...prev,
      selectAll: checked,
      // When selectAll is toggled on, clear individual filters
      ...(checked
        ? {
            noSkills: false,
            noProjects: false,
            noInternships: false,
            noHobbies: false,
            noPhone: false,
            noInterests: false,
            noCareerGoal: false,
            noPreferredTechStack: false,
            noLinkedinUrl: false,
            noGithubUrl: false,
          }
        : {}),
    }))
    setUseManualSelection(false)
    setShowPreview(false)
    setConfirmSend(false)
  }, [])

  const handleSelectAllIncomplete = useCallback(() => {
    setFilters((prev) => ({
      ...prev,
      selectAll: false,
      noSkills: true,
      noProjects: true,
      noInternships: true,
      noHobbies: true,
      noPhone: true,
      noInterests: true,
      noCareerGoal: true,
      noPreferredTechStack: true,
      noLinkedinUrl: true,
      noGithubUrl: true,
    }))
    setUseManualSelection(false)
    setShowPreview(false)
    setConfirmSend(false)
  }, [])

  const handleClearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS)
    setShowPreview(false)
    setPreviewStudents([])
    setConfirmSend(false)
    setSelectedStudentIds(new Set())
    setUseManualSelection(false)
  }, [])

  const handlePreview = useCallback(() => {
    const filtersToSend: EmailFilters = useManualSelection
      ? { ...DEFAULT_FILTERS, studentIds: Array.from(selectedStudentIds) }
      : filters

    preview.mutate(filtersToSend, {
      onSuccess: (data) => {
        setPreviewStudents(data.students)
        setShowPreview(true)
        setConfirmSend(false)
        // Auto-select all previewed students for manual mode
        if (!useManualSelection) {
          setSelectedStudentIds(new Set(data.students.map((s) => s.id)))
        }
      },
    })
  }, [filters, preview, selectedStudentIds, useManualSelection])

  const handleSend = useCallback(() => {
    // If manual selection, send only selected IDs
    const filtersToSend: EmailFilters = useManualSelection
      ? { ...DEFAULT_FILTERS, studentIds: Array.from(selectedStudentIds) }
      : { ...filters, studentIds: useManualSelection ? Array.from(selectedStudentIds) : undefined }

    send.mutate(filtersToSend, {
      onSuccess: () => {
        setConfirmSend(false)
        setShowPreview(false)
      },
    })
  }, [filters, send, selectedStudentIds, useManualSelection])

  const toggleStudentSelection = useCallback((id: string) => {
    setSelectedStudentIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const toggleAllStudents = useCallback(() => {
    if (selectedStudentIds.size === previewStudents.length) {
      setSelectedStudentIds(new Set())
    } else {
      setSelectedStudentIds(new Set(previewStudents.map((s) => s.id)))
    }
  }, [selectedStudentIds, previewStudents])

  const canPreview =
    filters.selectAll || activeFilterCount > 0 || (useManualSelection && selectedStudentIds.size > 0)

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30">
          <Mail className="h-7 w-7 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Email Notifications</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Send profile completion reminders to students
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Filters */}
        <div className="lg:col-span-1 space-y-4">
          {/* Quick Actions */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">Quick Select</h3>
            <div className="space-y-2">
              <button
                onClick={() => handleSelectAll(true)}
                className={`flex w-full items-center gap-2.5 rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all ${
                  filters.selectAll
                    ? "border-indigo-300 bg-indigo-50 text-indigo-700 dark:border-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300"
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                }`}
              >
                <Users className="h-4 w-4" />
                Select All Students
              </button>
              <button
                onClick={handleSelectAllIncomplete}
                className={`flex w-full items-center gap-2.5 rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all ${
                  activeFilterCount === FILTER_OPTIONS.length
                    ? "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-600 dark:bg-amber-900/30 dark:text-amber-300"
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                }`}
              >
                <UserX className="h-4 w-4" />
                All Incomplete Profiles
              </button>
            </div>
          </div>

          {/* Checkbox Filters */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                <Filter className="h-4 w-4 text-slate-500" />
                Profile Section Filters
                {activeFilterCount > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
                    {activeFilterCount}
                  </span>
                )}
              </h3>
              {(activeFilterCount > 0 || filters.selectAll) && (
                <button
                  onClick={handleClearFilters}
                  className="flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700"
                >
                  <X className="h-3 w-3" />
                  Clear
                </button>
              )}
            </div>

            <div className="space-y-1">
              {FILTER_OPTIONS.map((opt) => (
                <label
                  key={opt.key}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${
                    filters[opt.key]
                      ? "bg-indigo-50 dark:bg-indigo-900/20"
                      : "hover:bg-slate-50 dark:hover:bg-slate-700/50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={!!filters[opt.key]}
                    onChange={(e) => {
                      handleFilterChange(opt.key, e.target.checked)
                      if (e.target.checked) {
                        setFilters((prev) => ({ ...prev, selectAll: false }))
                      }
                    }}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{opt.label}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{opt.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Limit Control */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">Email Limit</h3>
            <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">
              Maximum number of emails to send at once
            </p>
            <select
              value={filters.limit || 100}
              onChange={(e) => setFilters((prev) => ({ ...prev, limit: Number(e.target.value) }))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
            >
              <option value={10}>10 emails</option>
              <option value={25}>25 emails</option>
              <option value={50}>50 emails</option>
              <option value={100}>100 emails</option>
              <option value={250}>250 emails</option>
              <option value={500}>500 emails</option>
            </select>
          </div>
        </div>

        {/* Right Column: Preview & Send */}
        <div className="lg:col-span-2 space-y-4">
          {/* Action Bar */}
          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {filters.selectAll
                  ? "All students selected"
                  : activeFilterCount > 0
                  ? `${activeFilterCount} filter(s) active`
                  : "No filters selected"}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {showPreview
                  ? `${previewStudents.length} student(s) matched`
                  : "Click preview to see matched students"}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handlePreview}
                disabled={!canPreview || preview.isPending}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
              >
                {preview.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                Preview
              </button>
              <button
                onClick={() => {
                  if (!showPreview) {
                    handlePreview()
                  } else {
                    setConfirmSend(true)
                  }
                }}
                disabled={!canPreview || send.isPending || (!showPreview && preview.isPending)}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:from-indigo-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {send.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Send Emails
              </button>
            </div>
          </div>

          {/* Send Result */}
          {send.isSuccess && send.data && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-800 dark:bg-emerald-900/20">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
                <div>
                  <p className="font-semibold text-emerald-800 dark:text-emerald-300">Emails Sent Successfully</p>
                  <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-400">
                    <strong>{send.data.totalSent}</strong> of {send.data.totalTargeted} emails delivered.
                    {send.data.totalFailed > 0 && (
                      <span className="text-red-600"> {send.data.totalFailed} failed.</span>
                    )}
                  </p>
                  {send.data.errors.length > 0 && (
                    <div className="mt-2 text-xs text-red-600">
                      {send.data.errors.map((e, i) => (
                        <p key={i}>• {e}</p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Confirmation Modal */}
          {confirmSend && (
            <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-5 dark:border-amber-600 dark:bg-amber-900/20">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-600" />
                <div className="flex-1">
                  <p className="font-semibold text-amber-800 dark:text-amber-300">Confirm Send</p>
                  <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
                    You are about to send personalized profile-completion emails to{" "}
                    <strong>
                      {useManualSelection ? selectedStudentIds.size : previewStudents.length}
                    </strong>{" "}
                    student(s). Each student will receive an email customized to their missing profile sections.
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={handleSend}
                      disabled={send.isPending}
                      className="flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-700 disabled:opacity-50"
                    >
                      {send.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      Yes, Send Now
                    </button>
                    <button
                      onClick={() => setConfirmSend(false)}
                      className="rounded-lg border border-amber-300 px-4 py-2 text-sm font-medium text-amber-800 transition-colors hover:bg-amber-100 dark:text-amber-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Preview / Student List */}
          {showPreview && (
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <div className="flex items-center justify-between border-b border-slate-200 p-5 dark:border-slate-700">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Matched Students ({previewStudents.length})
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Each student will receive a personalized email based on their missing sections
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {previewStudents.length > 0 && (
                    <button
                      onClick={toggleAllStudents}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                      {selectedStudentIds.size === previewStudents.length
                        ? "Deselect All"
                        : "Select All"}
                    </button>
                  )}
                  <button
                    onClick={() => setShowStudentList(!showStudentList)}
                    className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700"
                  >
                    {showStudentList ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {previewStudents.length === 0 ? (
                <div className="p-8 text-center">
                  <UserX className="mx-auto h-10 w-10 text-slate-300" />
                  <p className="mt-2 font-medium text-slate-600 dark:text-slate-400">No students matched</p>
                  <p className="text-sm text-slate-500">Try adjusting your filters</p>
                </div>
              ) : (
                <>
                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-4">
                    <SummaryCard label="Total" value={previewStudents.length} color="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400" />
                    <SummaryCard
                      label="Selected"
                      value={selectedStudentIds.size}
                      color="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                    />
                    <SummaryCard
                      label="Avg Missing"
                      value={
                        previewStudents.length > 0
                          ? Math.round(
                              previewStudents.reduce((s, st) => s + st.missingSections.length, 0) /
                                previewStudents.length
                            )
                          : 0
                      }
                      color="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                    />
                    <SummaryCard
                      label="Fully Missing"
                      value={previewStudents.filter((s) => s.missingSections.length >= 8).length}
                      color="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    />
                  </div>

                  {/* Expandable Student List */}
                  {showStudentList && (
                    <div className="max-h-[500px] overflow-y-auto border-t border-slate-200 dark:border-slate-700">
                      <table className="min-w-full">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-800/50">
                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                              <input
                                type="checkbox"
                                checked={selectedStudentIds.size === previewStudents.length && previewStudents.length > 0}
                                onChange={toggleAllStudents}
                                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                              />
                            </th>
                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                              Student
                            </th>
                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                              Missing Sections
                            </th>
                            <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                              Count
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                          {previewStudents.map((student) => (
                            <tr
                              key={student.id}
                              className={`transition-colors ${
                                selectedStudentIds.has(student.id)
                                  ? "bg-indigo-50/50 dark:bg-indigo-900/10"
                                  : "hover:bg-slate-50 dark:hover:bg-slate-700/30"
                              }`}
                            >
                              <td className="px-5 py-3">
                                <input
                                  type="checkbox"
                                  checked={selectedStudentIds.has(student.id)}
                                  onChange={() => toggleStudentSelection(student.id)}
                                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                />
                              </td>
                              <td className="px-5 py-3">
                                <p className="text-sm font-medium text-slate-900 dark:text-white">{student.name}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{student.email}</p>
                              </td>
                              <td className="px-5 py-3">
                                <div className="flex flex-wrap gap-1">
                                  {student.missingSections.slice(0, 4).map((s) => (
                                    <span
                                      key={s}
                                      className="inline-flex rounded-md bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                    >
                                      {SECTION_LABELS[s] || s}
                                    </span>
                                  ))}
                                  {student.missingSections.length > 4 && (
                                    <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-400">
                                      +{student.missingSections.length - 4} more
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-5 py-3 text-right">
                                <span
                                  className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                                    student.missingSections.length >= 7
                                      ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                      : student.missingSections.length >= 4
                                      ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                      : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                  }`}
                                >
                                  {student.missingSections.length}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Info Box */}
          {!showPreview && !send.isSuccess && (
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 dark:border-blue-800 dark:bg-blue-900/20">
              <div className="flex items-start gap-3">
                <Info className="mt-0.5 h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-semibold text-blue-800 dark:text-blue-300">How it works</p>
                  <ul className="mt-2 space-y-1.5 text-sm text-blue-700 dark:text-blue-400">
                    <li>1. Select filters on the left to target students with incomplete profiles</li>
                    <li>2. Click <strong>Preview</strong> to see which students match your filters</li>
                    <li>3. Optionally select/deselect individual students from the list</li>
                    <li>4. Click <strong>Send Emails</strong> to deliver personalized reminders</li>
                    <li>5. Each student receives an email customized to their specific missing sections</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ============ COMPONENTS ============

function SummaryCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={`rounded-xl px-4 py-3 text-center ${color}`}>
      <p className="text-xl font-bold">{value}</p>
      <p className="text-xs font-medium opacity-80">{label}</p>
    </div>
  )
}
