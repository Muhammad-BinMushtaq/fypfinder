// app/admin/(authenticated)/emails/page.tsx
"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import {
  Send,
  Search,
  Filter,
  Loader2,
  Eye,
  X,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react"
import {
  previewEmailRecipients,
  sendEmails,
  type EmailFilters,
  type EmailPreviewResponse,
  type EmailCampaignType,
  type EmailCategory,
  type CompletionStatusFilter,
  type PushSubscriptionFilter,
  type TransactionalTriggerKey,
  type EmailTriggerConfig,
} from "@/services/admin.service"
import { DEPARTMENTS } from "@/lib/departments"
import { toast } from "react-toastify"

type ActiveTab = "COMPOSE" | "TRIGGERS" | "HISTORY"

interface QuickPreset {
  id: string
  label: string
  campaignType: EmailCampaignType
  completionStatus: CompletionStatusFilter
  semesters: number[]
  seekingStatus: EmailFilters["seekingStatus"]
  subject: string
  heading: string
  bodyText: string
  ctaText: string
  ctaUrl: string
}

const QUICK_PRESETS: QuickPreset[] = [
  {
    id: "profile_incomplete",
    label: "Incomplete Profile Reminder (< 80%)",
    campaignType: "PROFILE_COMPLETION",
    completionStatus: "INCOMPLETE_UNDER_80",
    semesters: [],
    seekingStatus: "ALL",
    subject: "{{name}} — Please complete your FYPMate profile",
    heading: "",
    bodyText:
      "Your FYPMate profile is missing key details. Classmates in your department rely on your skills, project links, and role preferences to send partner requests.",
    ctaText: "Update Profile",
    ctaUrl: "/dashboard/profile",
  },
  {
    id: "setup_incomplete",
    label: "Unfinished Account Setup",
    campaignType: "ONBOARDING_INCOMPLETE",
    completionStatus: "ONBOARDING_INCOMPLETE",
    semesters: [],
    seekingStatus: "ALL",
    subject: "{{name}} — Complete your FYPMate account setup",
    heading: "",
    bodyText:
      "You signed in to FYPMate with your PAF-IAST account, but your initial profile setup is still incomplete.",
    ctaText: "Complete Setup",
    ctaUrl: "/dashboard/discovery",
  },
  {
    id: "sem7_status_check",
    label: "Semester 7 Group Status Check",
    campaignType: "GENERAL_NOTIFICATION",
    completionStatus: "ALL",
    semesters: [7],
    seekingStatus: "LOOKING_FOR_TEAM",
    subject: "Semester 7 FYP Check: Confirm your group status on FYPMate",
    heading: "Please Confirm Your Current FYP Group Status",
    bodyText:
      "Your profile in {{department}} (Semester {{semester}}) is currently marked as 'Looking for a Team'.\n\nIf you have already formed your FYP group offline with classmates, please update your status to 'Not Looking' on your profile so students still searching only contact available peers.",
    ctaText: "Update Availability",
    ctaUrl: "/dashboard/profile",
  },
  {
    id: "idea_validator_announcement",
    label: "AI FYP Idea Validator Announcement",
    campaignType: "ANNOUNCEMENT",
    completionStatus: "ALL",
    semesters: [],
    seekingStatus: "ALL",
    subject: "Validate your FYP idea against past PAF-IAST projects on FYPMate",
    heading: "Test Your FYP Idea Before Your Proposal Defense",
    bodyText:
      "You can now evaluate your Final Year Project idea using the AI Idea Validator on FYPMate. Check similarity against archived PAF-IAST projects, review a 100-point rubric breakdown, and practice expected defense questions.",
    ctaText: "Open Idea Validator",
    ctaUrl: "/dashboard/fyp-ideas",
  },
]

const TRIGGER_ITEMS: Array<{
  key: TransactionalTriggerKey
  label: string
  eventDescription: string
}> = [
  {
    key: "partnerRequest",
    label: "Partner Request Received",
    eventDescription: "Sent when a student receives an FYP group invitation.",
  },
  {
    key: "messageRequest",
    label: "Message Request Received",
    eventDescription: "Sent when a student receives a 1-on-1 chat request.",
  },
  {
    key: "requestAccepted",
    label: "Request Accepted",
    eventDescription: "Sent when a student's partner or message request is accepted.",
  },
  {
    key: "feedbackUpdate",
    label: "Feedback Status Updated",
    eventDescription: "Sent when an admin updates or replies to a feedback ticket.",
  },
  {
    key: "welcomeEmail",
    label: "New Student Welcome",
    eventDescription: "Sent once when a student registers via Google OAuth.",
  },
]

const PAGE_SIZE = 10

export default function AdminEmailsPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("COMPOSE")

  // Filters state (excludeRecentlyEmailed defaults to FALSE so already-sent students are visible by default)
  const [filters, setFilters] = useState<EmailFilters>({
    campaignType: "PROFILE_COMPLETION",
    emailCategory: "TRANSACTIONAL",
    completionStatus: "ALL",
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
    selectAll: true,
    semesters: [],
    department: "ALL",
    departments: [],
    availability: "ALL",
    hasGroup: "ALL",
    seekingStatus: "ALL",
    pushFilter: "ALL",
    excludeRecentlyEmailed: false,
    cooldownDays: 7,
    search: "",
    limit: 85,
    subject: "",
    heading: "",
    bodyText: "",
    highlightTitle: "",
    highlightText: "",
    ctaText: "",
    ctaUrl: "",
  })

  const [searchInput, setSearchInput] = useState("")
  const [showMoreFilters, setShowMoreFilters] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [page, setPage] = useState(1)

  // Explicit student selection (by default all matching students in preview are selected)
  const [excludedStudentIds, setExcludedStudentIds] = useState<Set<string>>(new Set())

  const [previewData, setPreviewData] = useState<EmailPreviewResponse | null>(null)
  const [isLoadingPreview, setIsLoadingPreview] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [isSendingTest, setIsSendingTest] = useState(false)
  const [testEmailAddress, setTestEmailAddress] = useState("")

  // Trigger preview modal state
  const [selectedTriggerPreview, setSelectedTriggerPreview] =
    useState<TransactionalTriggerKey>("partnerRequest")
  const [isSavingTrigger, setIsSavingTrigger] = useState(false)

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => {
        if (prev.search === searchInput) return prev
        return { ...prev, search: searchInput }
      })
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  const fetchPreview = useCallback(async (currentFilters: EmailFilters) => {
    try {
      setIsLoadingPreview(true)
      const res = await previewEmailRecipients(currentFilters)
      setPreviewData(res)
    } catch (err: any) {
      toast.error(err?.message || "Failed to load email preview")
    } finally {
      setIsLoadingPreview(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPreview(filters)
    }, 200)
    return () => clearTimeout(timer)
  }, [filters, fetchPreview])

  // Students after applying filters
  const allMatchingStudents = useMemo(
    () => previewData?.students || [],
    [previewData?.students]
  )

  // Selected students = matching students minus manually unchecked rows
  const selectedStudents = useMemo(
    () => allMatchingStudents.filter((s) => !excludedStudentIds.has(s.id)),
    [allMatchingStudents, excludedStudentIds]
  )

  const totalPages = Math.max(1, Math.ceil(allMatchingStudents.length / PAGE_SIZE))
  const paginatedStudents = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return allMatchingStudents.slice(start, start + PAGE_SIZE)
  }, [allMatchingStudents, page])

  const toggleStudentSelection = (id: string) => {
    setExcludedStudentIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAllMatching = () => {
    if (selectedStudents.length === allMatchingStudents.length) {
      // Unselect all
      setExcludedStudentIds(new Set(allMatchingStudents.map((s) => s.id)))
    } else {
      // Select all
      setExcludedStudentIds(new Set())
    }
  }

  const handleApplyPreset = (presetId: string) => {
    const preset = QUICK_PRESETS.find((p) => p.id === presetId)
    if (!preset) return
    setExcludedStudentIds(new Set())
    setPage(1)
    setFilters((prev) => ({
      ...prev,
      campaignType: preset.campaignType,
      completionStatus: preset.completionStatus,
      semesters: preset.semesters,
      seekingStatus: preset.seekingStatus,
      subject: preset.subject,
      heading: preset.heading,
      bodyText: preset.bodyText,
      ctaText: preset.ctaText,
      ctaUrl: preset.ctaUrl,
    }))
  }

  const handleSendTest = async (overrideTriggerKey?: TransactionalTriggerKey) => {
    if (!testEmailAddress.trim()) {
      toast.warning("Enter an email address to receive the test email")
      return
    }
    try {
      setIsSendingTest(true)
      const res = await sendEmails({
        ...filters,
        transactionalPreviewKey: overrideTriggerKey || undefined,
        testEmail: testEmailAddress.trim(),
      })
      if (res.totalSent > 0) {
        toast.success(`Test email sent to ${testEmailAddress.trim()}`)
        fetchPreview(filters)
      } else {
        toast.error(res.errors?.[0] || "Failed to send test email")
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to send test email")
    } finally {
      setIsSendingTest(false)
    }
  }

  const handleSendCampaign = async () => {
    if (selectedStudents.length === 0) {
      toast.warning("Please select at least one student recipient")
      return
    }

    const confirmed = window.confirm(
      `Send this email to ${selectedStudents.length} selected student(s)?`
    )
    if (!confirmed) return

    try {
      setIsSending(true)
      const targetIds = selectedStudents.map((s) => s.id)
      const res = await sendEmails({
        ...filters,
        testEmail: undefined,
        transactionalPreviewKey: undefined,
        studentIds: targetIds,
      })

      if (res.totalSent > 0) {
        toast.success(`Sent ${res.totalSent} email(s) successfully`)
      }
      if (res.errors && res.errors.length > 0) {
        toast.warning(res.errors[0])
      }
      fetchPreview(filters)
    } catch (err: any) {
      toast.error(err?.message || "Failed to send emails")
    } finally {
      setIsSending(false)
    }
  }

  const handleUpdateTriggerConfig = async (patch: Partial<EmailTriggerConfig>) => {
    try {
      setIsSavingTrigger(true)
      const res = await previewEmailRecipients({
        ...filters,
        triggerConfigUpdate: patch,
      })
      setPreviewData(res)
      toast.success("Trigger configuration updated")
    } catch (err: any) {
      toast.error(err?.message || "Failed to update trigger settings")
    } finally {
      setIsSavingTrigger(false)
    }
  }

  const quota = previewData?.quotaStats
  const triggerConfig = previewData?.triggerConfig
  const alreadyEmailedInListCount = useMemo(
    () => allMatchingStudents.filter((s) => s.recentlyEmailed).length,
    [allMatchingStudents]
  )

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 dark:border-slate-800/80 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Email Management
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Send targeted student notifications, manage duplicate filters, and configure automatic triggers
          </p>
        </div>

        {/* Clean Segmented Tabs */}
        <div className="inline-flex rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900 p-1">
          <button
            type="button"
            onClick={() => {
              setActiveTab("COMPOSE")
              setFilters((prev) => ({ ...prev, transactionalPreviewKey: undefined }))
            }}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === "COMPOSE"
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Compose
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("TRIGGERS")
              setFilters((prev) => ({
                ...prev,
                transactionalPreviewKey: selectedTriggerPreview,
              }))
            }}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === "TRIGGERS"
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Auto Triggers
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("HISTORY")}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === "HISTORY"
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            History ({quota?.recentLogs?.length || 0})
          </button>
        </div>
      </div>

      {/* Minimalist Stats Row (Matches Student Directory) */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs dark:border-slate-800/80 dark:bg-slate-900">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Sent Today (Free Limit)
          </p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {quota ? `${quota.sentTodayTotal} / ${quota.dailyLimit}` : "0 / 100"}
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50/40 p-4 shadow-2xs dark:border-emerald-900/30 dark:bg-emerald-950/20">
          <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
            Remaining Today
          </p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-emerald-800 dark:text-emerald-300">
            {quota ? quota.remainingToday : 100}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs dark:border-slate-800/80 dark:bg-slate-900">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Monthly Sent
          </p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {quota ? `${quota.sentMonthTotal} / ${quota.monthlyLimit}` : "0 / 3000"}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs dark:border-slate-800/80 dark:bg-slate-900">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Selected Recipients
          </p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {selectedStudents.length}
          </p>
        </div>
      </div>

      {/* Resend Configuration Warning (Only shown if missing API key) */}
      {previewData && !previewData.isResendConfigured && (
        <div className="flex items-center gap-3 rounded-2xl border border-amber-200/80 bg-amber-50/60 px-4 py-3 text-xs text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>
            <strong className="font-semibold">RESEND_API_KEY is not configured.</strong> Add{" "}
            <code className="rounded bg-amber-100 dark:bg-amber-900/50 px-1 py-0.5">
              RESEND_API_KEY
            </code>{" "}
            in your environment variables to enable live sending.
          </span>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 1: COMPOSE & SEND                                                 */}
      {/* ===================================================================== */}
      {activeTab === "COMPOSE" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
          {/* LEFT 7 COLUMNS: RECIPIENT FILTERING & SELECTION TABLE */}
          <div className="lg:col-span-7 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 overflow-hidden shadow-2xs">
            {/* Search & Primary Filters Bar */}
            <div className="border-b border-slate-200/80 dark:border-slate-800/80 p-4 space-y-3">
              <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
                {/* Search Input */}
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search by student name or email..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 py-2 pl-10 pr-4 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-slate-400 dark:focus:border-slate-600 focus:bg-white dark:focus:bg-slate-800 focus:outline-none"
                  />
                </div>

                {/* Department Select */}
                <select
                  value={filters.department || "ALL"}
                  onChange={(e) => {
                    const val = e.target.value
                    setPage(1)
                    setExcludedStudentIds(new Set())
                    setFilters((prev) => ({
                      ...prev,
                      department: val,
                      departments: val === "ALL" ? [] : [val],
                    }))
                  }}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Departments</option>
                  {DEPARTMENTS.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </select>

                {/* Completion Status Select */}
                <select
                  value={filters.completionStatus || "ALL"}
                  onChange={(e) => {
                    setPage(1)
                    setExcludedStudentIds(new Set())
                    setFilters((prev) => ({
                      ...prev,
                      completionStatus: e.target.value as CompletionStatusFilter,
                    }))
                  }}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Profiles</option>
                  <option value="ONBOARDING_INCOMPLETE">Setup Incomplete</option>
                  <option value="INCOMPLETE_UNDER_50">Under 50% Complete</option>
                  <option value="INCOMPLETE_UNDER_80">Under 80% Complete</option>
                  <option value="MISSING_CHECKED">Missing Any Field</option>
                </select>

                {/* More Filters Toggle */}
                <button
                  type="button"
                  onClick={() => setShowMoreFilters(!showMoreFilters)}
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-colors cursor-pointer ${
                    showMoreFilters
                      ? "border-slate-900 dark:border-slate-100 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900"
                      : "border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <Filter className="h-3.5 w-3.5" />
                  <span>Filters</span>
                </button>
              </div>

              {/* Duplicate Control Bar — Check or Uncheck to Include/Exclude Already Sent Students */}
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 px-3.5 py-2.5">
                <label className="flex items-center gap-2.5 text-xs font-medium text-slate-700 dark:text-slate-200 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={Boolean(filters.excludeRecentlyEmailed)}
                    onChange={(e) => {
                      setPage(1)
                      setFilters((prev) => ({
                        ...prev,
                        excludeRecentlyEmailed: e.target.checked,
                      }))
                    }}
                    className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-slate-900 focus:ring-0 cursor-pointer"
                  />
                  <span>
                    Exclude already emailed students (prevent duplicates from last{" "}
                    {filters.cooldownDays || 7} days)
                  </span>
                </label>

                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {filters.excludeRecentlyEmailed
                    ? "Already-sent students hidden"
                    : `${alreadyEmailedInListCount} already sent included`}
                </span>
              </div>

              {/* Collapsible Advanced Filters */}
              {showMoreFilters && (
                <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 p-3.5 space-y-3">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div>
                      <label className="mb-1 block text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        Semester
                      </label>
                      <select
                        value={filters.semesters?.[0] || "ALL"}
                        onChange={(e) => {
                          const val = e.target.value
                          setPage(1)
                          setFilters((prev) => ({
                            ...prev,
                            semesters: val === "ALL" ? [] : [Number(val)],
                          }))
                        }}
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                      >
                        <option value="ALL">All Semesters</option>
                        <option value="5">Semester 5</option>
                        <option value="6">Semester 6</option>
                        <option value="7">Semester 7</option>
                        <option value="8">Semester 8</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        Group Status
                      </label>
                      <select
                        value={filters.hasGroup || "ALL"}
                        onChange={(e) => {
                          setPage(1)
                          setFilters((prev) => ({
                            ...prev,
                            hasGroup: e.target.value as EmailFilters["hasGroup"],
                          }))
                        }}
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                      >
                        <option value="ALL">All Students</option>
                        <option value="false">Not in a Group</option>
                        <option value="true">Already in a Group</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        Push Notifications
                      </label>
                      <select
                        value={filters.pushFilter || "ALL"}
                        onChange={(e) => {
                          setPage(1)
                          setFilters((prev) => ({
                            ...prev,
                            pushFilter: e.target.value as PushSubscriptionFilter,
                          }))
                        }}
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                      >
                        <option value="ALL">All Students</option>
                        <option value="NO_PUSH">Only Without Web Push</option>
                        <option value="HAS_PUSH">Only With Web Push</option>
                      </select>
                    </div>
                  </div>

                  {/* Missing Profile Fields Filter Checkboxes */}
                  <div>
                    <p className="mb-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      Filter by specific missing profile fields:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {(
                        [
                          ["noSkills", "Skills"],
                          ["noProjects", "Projects"],
                          ["noInterests", "Bio / Interests"],
                          ["noPhone", "Phone"],
                          ["noLinkedinUrl", "LinkedIn"],
                          ["noGithubUrl", "GitHub"],
                        ] as const
                      ).map(([fieldKey, label]) => (
                        <label
                          key={fieldKey}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-xs text-slate-700 dark:text-slate-300 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={Boolean(filters[fieldKey])}
                            onChange={(e) => {
                              setPage(1)
                              setFilters((prev) => ({
                                ...prev,
                                [fieldKey]: e.target.checked,
                              }))
                            }}
                            className="h-3.5 w-3.5 rounded border-slate-300"
                          />
                          <span>{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Recipient Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-850/50">
                    <th className="w-10 px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={
                          allMatchingStudents.length > 0 &&
                          selectedStudents.length === allMatchingStudents.length
                        }
                        onChange={toggleSelectAllMatching}
                        className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 cursor-pointer"
                        title="Select or unselect all matching students"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Student
                    </th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Department
                    </th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Profile
                    </th>
                    <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Email Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60">
                  {isLoadingPreview ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center">
                        <Loader2 className="mx-auto h-5 w-5 animate-spin text-slate-400" />
                        <p className="mt-2 text-xs text-slate-500">Loading recipients...</p>
                      </td>
                    </tr>
                  ) : paginatedStudents.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center">
                        <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                          No students match the current filters.
                        </p>
                        {filters.excludeRecentlyEmailed && (
                          <button
                            type="button"
                            onClick={() =>
                              setFilters((prev) => ({
                                ...prev,
                                excludeRecentlyEmailed: false,
                              }))
                            }
                            className="mt-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                          >
                            Uncheck &ldquo;Exclude already emailed students&rdquo; to show all
                          </button>
                        )}
                      </td>
                    </tr>
                  ) : (
                    paginatedStudents.map((student) => {
                      const isSelected = !excludedStudentIds.has(student.id)
                      const pct = Number(student.completenessPercent || 0)
                      return (
                        <tr
                          key={student.id}
                          onClick={() => toggleStudentSelection(student.id)}
                          className={`transition-colors cursor-pointer ${
                            isSelected
                              ? "hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                              : "opacity-50 bg-slate-50/40 dark:bg-slate-900/40"
                          }`}
                        >
                          <td
                            className="px-4 py-3"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleStudentSelection(student.id)}
                              className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 cursor-pointer"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-xs font-semibold text-slate-900 dark:text-white">
                              {student.name}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              {student.email}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-xs text-slate-700 dark:text-slate-300">
                              {student.department}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              Sem {student.currentSemester}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span
                                className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ${
                                  !student.onboardingCompleted
                                    ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                                    : pct >= 80
                                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                                    : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                                }`}
                              >
                                {!student.onboardingCompleted
                                  ? "Setup Incomplete"
                                  : `${pct}%`}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            {student.recentlyEmailed ? (
                              <span className="inline-flex items-center rounded-full border border-amber-200/70 bg-amber-50 px-2.5 py-0.5 text-[11px] font-medium text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-300">
                                Already Sent
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-full border border-emerald-200/70 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-300">
                                Ready
                              </span>
                            )}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer & Pagination */}
            <div className="flex items-center justify-between border-t border-slate-200/80 dark:border-slate-800/80 px-4 py-3 bg-slate-50/40 dark:bg-slate-900">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                <strong className="font-semibold text-slate-800 dark:text-slate-200">
                  {selectedStudents.length}
                </strong>{" "}
                of {allMatchingStudents.length} matching students selected
              </p>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-lg border border-slate-200 dark:border-slate-800 p-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <span className="px-2 text-xs text-slate-600 dark:text-slate-400">
                  {page} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="rounded-lg border border-slate-200 dark:border-slate-800 p-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT 5 COLUMNS: MESSAGE COMPOSER & ACTIONS */}
          <div className="lg:col-span-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 pb-3.5">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Compose Email
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  From: {previewData?.senderAddress || "FYPMate <noreply@fypmate.com>"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowPreviewModal(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
              >
                <Eye className="h-3.5 w-3.5" />
                <span>Preview HTML</span>
              </button>
            </div>

            {/* Quick Template Preset Selector */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
                  Template Type
                </label>
                <select
                  value={filters.campaignType || "PROFILE_COMPLETION"}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      campaignType: e.target.value as EmailCampaignType,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 px-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="PROFILE_COMPLETION">Profile Completion</option>
                  <option value="ONBOARDING_INCOMPLETE">Setup Incomplete</option>
                  <option value="GENERAL_NOTIFICATION">General Notice</option>
                  <option value="ANNOUNCEMENT">Platform Announcement</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
                  Load Ready Preset
                </label>
                <select
                  defaultValue=""
                  onChange={(e) => {
                    if (e.target.value) handleApplyPreset(e.target.value)
                  }}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 px-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="">Choose a preset...</option>
                  {QUICK_PRESETS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Delivery Category & Batch Cap */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
                  Delivery Mode
                </label>
                <select
                  value={filters.emailCategory || "TRANSACTIONAL"}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      emailCategory: e.target.value as EmailCategory,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 px-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="TRANSACTIONAL">Transactional (Recommended)</option>
                  <option value="PROMOTIONAL">Promotional</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
                  Max Batch Limit
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={filters.limit || 85}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      limit: Math.max(1, Math.min(100, Number(e.target.value) || 85)),
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Subject Line */}
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
                Email Subject
              </label>
              <input
                type="text"
                placeholder={
                  previewData?.sampleSubject ||
                  "Leave blank to use default template subject"
                }
                value={filters.subject || ""}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, subject: e.target.value }))
                }
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 px-3.5 py-2 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
              />
            </div>

            {/* Heading (shown for Announcement / General Notification) */}
            {(filters.campaignType === "ANNOUNCEMENT" ||
              filters.campaignType === "GENERAL_NOTIFICATION") && (
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
                  Email Heading
                </label>
                <input
                  type="text"
                  placeholder="Main heading inside the email"
                  value={filters.heading || ""}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, heading: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 px-3.5 py-2 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
                />
              </div>
            )}

            {/* Message Body */}
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  Message Content
                </label>
                <span className="text-[11px] text-slate-400">
                  Variables: {"{{name}}"}, {"{{department}}"}, {"{{semester}}"}
                </span>
              </div>
              <textarea
                rows={4}
                placeholder="Optional custom message paragraph (leave empty for default template text)..."
                value={filters.bodyText || ""}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, bodyText: e.target.value }))
                }
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 p-3 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
              />
            </div>

            {/* Test Send Row */}
            <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800/80">
              <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
                Send Test Email First
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email address..."
                  value={testEmailAddress}
                  onChange={(e) => setTestEmailAddress(e.target.value)}
                  className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
                />
                <button
                  type="button"
                  disabled={isSendingTest}
                  onClick={() => handleSendTest()}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 cursor-pointer"
                >
                  {isSendingTest ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                  <span>Send Test</span>
                </button>
              </div>
            </div>

            {/* Primary Send Button */}
            <button
              type="button"
              disabled={isSending || selectedStudents.length === 0}
              onClick={handleSendCampaign}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 dark:bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-white dark:text-slate-900 shadow-2xs transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer"
            >
              {isSending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Sending Emails...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Send to {selectedStudents.length} Selected Student(s)</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: AUTOMATIC TRANSACTIONAL TRIGGERS                               */}
      {/* ===================================================================== */}
      {activeTab === "TRIGGERS" && (
        <div className="space-y-6">
          {/* Delivery Mode Card */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-5 shadow-2xs flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Automatic Email Delivery Policy
              </h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Choose whether automatic event emails are sent only when Web Push is unavailable or on every event
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={isSavingTrigger}
                onClick={() =>
                  handleUpdateTriggerConfig({ deliveryMode: "SMART_FALLBACK" })
                }
                className={`rounded-xl border px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                  triggerConfig?.deliveryMode !== "ALWAYS_SEND"
                    ? "border-slate-900 dark:border-white bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                    : "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                }`}
              >
                Smart Fallback (No Push Only)
              </button>
              <button
                type="button"
                disabled={isSavingTrigger}
                onClick={() =>
                  handleUpdateTriggerConfig({ deliveryMode: "ALWAYS_SEND" })
                }
                className={`rounded-xl border px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                  triggerConfig?.deliveryMode === "ALWAYS_SEND"
                    ? "border-slate-900 dark:border-white bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                    : "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                }`}
              >
                Always Send Email
              </button>
            </div>
          </div>

          {/* 5 Automatic Triggers List */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 overflow-hidden shadow-2xs">
            <div className="divide-y divide-slate-200/70 dark:divide-slate-800/70">
              {TRIGGER_ITEMS.map((item) => {
                const isEnabled = triggerConfig ? Boolean(triggerConfig[item.key]) : true
                return (
                  <div
                    key={item.key}
                    className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {item.label}
                        </p>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            isEnabled
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                          }`}
                        >
                          {isEnabled ? "Enabled" : "Paused"}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        {item.eventDescription}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTriggerPreview(item.key)
                          setFilters((prev) => ({
                            ...prev,
                            transactionalPreviewKey: item.key,
                          }))
                          setShowPreviewModal(true)
                        }}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 cursor-pointer"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Preview</span>
                      </button>

                      <button
                        type="button"
                        disabled={isSavingTrigger}
                        onClick={() =>
                          handleUpdateTriggerConfig({ [item.key]: !isEnabled })
                        }
                        className={`rounded-xl border px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                          isEnabled
                            ? "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50"
                            : "border-slate-900 dark:border-white bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                        }`}
                      >
                        {isEnabled ? "Pause" : "Enable"}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 3: SENT EMAIL LOGS                                                */}
      {/* ===================================================================== */}
      {activeTab === "HISTORY" && (
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 overflow-hidden shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 px-6 py-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Recent Sent Emails
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Last 25 dispatches recorded across admin campaigns and automatic triggers
              </p>
            </div>
            <button
              type="button"
              onClick={() => fetchPreview(filters)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Refresh</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-850/50">
                  <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Recipient
                  </th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Template
                  </th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Sent At
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60">
                {!quota?.recentLogs || quota.recentLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-xs text-slate-500">
                      No email logs recorded yet.
                    </td>
                  </tr>
                ) : (
                  quota.recentLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                      <td className="px-6 py-3.5 text-xs font-medium text-slate-900 dark:text-white">
                        {log.recipientEmail}
                      </td>
                      <td className="px-6 py-3.5 text-xs text-slate-600 dark:text-slate-300 max-w-xs truncate">
                        {log.subject}
                      </td>
                      <td className="px-6 py-3.5 text-xs text-slate-500 dark:text-slate-400">
                        {log.templateKey}
                      </td>
                      <td className="px-6 py-3.5">
                        {log.status === "SENT" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                            <CheckCircle2 className="h-3 w-3" />
                            Sent
                          </span>
                        ) : (
                          <span
                            title={log.errorMessage || ""}
                            className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-[11px] font-medium text-red-700 dark:bg-red-950/40 dark:text-red-300"
                          >
                            <AlertCircle className="h-3 w-3" />
                            Failed
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-3.5 text-right text-xs text-slate-500 dark:text-slate-400">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* CLEAN HTML PREVIEW MODAL                                              */}
      {/* ===================================================================== */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-5 py-3.5">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Subject Preview
                </p>
                <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                  {previewData?.sampleSubject || "Email Preview"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="bg-slate-100 dark:bg-slate-950 p-4">
              {previewData?.sampleHtml ? (
                <iframe
                  title="Email HTML Preview"
                  srcDoc={previewData.sampleHtml}
                  className="h-[460px] w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white"
                />
              ) : (
                <div className="flex h-[320px] items-center justify-center text-xs text-slate-500">
                  Loading preview...
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 px-5 py-3 bg-white dark:bg-slate-900">
              <div className="flex items-center gap-2 flex-1 max-w-sm">
                <input
                  type="email"
                  placeholder="Send this preview to email..."
                  value={testEmailAddress}
                  onChange={(e) => setTestEmailAddress(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
                <button
                  type="button"
                  disabled={isSendingTest}
                  onClick={() =>
                    handleSendTest(
                      activeTab === "TRIGGERS" ? selectedTriggerPreview : undefined
                    )
                  }
                  className="shrink-0 rounded-xl bg-slate-900 dark:bg-white px-3 py-1.5 text-xs font-semibold text-white dark:text-slate-900 cursor-pointer"
                >
                  {isSendingTest ? "Sending..." : "Send Test"}
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="rounded-xl border border-slate-200 dark:border-slate-800 px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
