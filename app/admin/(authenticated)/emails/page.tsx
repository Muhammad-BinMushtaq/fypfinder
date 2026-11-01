// app/admin/(authenticated)/emails/page.tsx
"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Mail,
  Send,
  Users,
  Sparkles,
  Bell,
  UserCheck,
  CheckCircle2,
  Loader2,
  Search,
  Eye,
  CheckSquare,
  Square,
  RefreshCw,
  FlaskConical,
  Zap,
  Info,
  X,
  ShieldAlert,
  History,
  Sliders,
  Building2,
  UserX,
  Gauge,
} from "lucide-react"
import { toast } from "react-toastify"
import { useAdminSession } from "@/hooks/admin"
import {
  previewEmailRecipients,
  sendEmails,
  type EmailCampaignType,
  type EmailCategory,
  type CompletionStatusFilter,
  type PushSubscriptionFilter,
  type TransactionalTriggerKey,
  type EmailTriggerConfig,
  type EmailQuotaStats,
  type EmailFilters,
  type EmailPreviewStudent,
  type EmailSendResult,
} from "@/services/admin.service"
import { DEPARTMENTS } from "@/lib/departments"

interface CampaignPreset {
  id: string
  label: string
  campaignType: EmailCampaignType
  emailCategory: EmailCategory
  completionStatus: CompletionStatusFilter
  semesters?: number[]
  hasGroup?: "true" | "false" | "ALL"
  seekingStatus?:
    | "LOOKING_FOR_TEAM"
    | "HAS_TEAM_LOOKING_FOR_MEMBERS"
    | "NOT_LOOKING"
    | "ALL"
  subject: string
  heading: string
  bodyText: string
  highlightTitle?: string
  highlightText?: string
  ctaText: string
  ctaUrl: string
}

const CAMPAIGN_PRESETS: CampaignPreset[] = [
  {
    id: "onboarding-incomplete",
    label: "⚡ Account Setup Not Completed",
    campaignType: "ONBOARDING_INCOMPLETE",
    emailCategory: "TRANSACTIONAL",
    completionStatus: "ONBOARDING_INCOMPLETE",
    subject:
      "⚡ {{first_name}}, finish setting up your FYPMate account (takes 30 seconds)",
    heading: "Complete Your 3-Step PAF-IAST Student Setup",
    bodyText:
      "You signed in to FYPMate with your PAF-IAST account ({{department}}), but your initial 3-step profile setup is still unfinished. Completing it takes 30 seconds and lets classmates in Semester {{semester}} see your skills and availability.",
    ctaText: "Finish Account Setup (30s)",
    ctaUrl: "/dashboard/discovery",
  },
  {
    id: "profile-incomplete",
    label: "📋 Profile Completion (<80%)",
    campaignType: "PROFILE_COMPLETION",
    emailCategory: "PROMOTIONAL",
    completionStatus: "MISSING_CHECKED",
    subject:
      "{{first_name}}, complete your FYPMate profile to get matched faster",
    heading: "Complete Your Academic Portfolio",
    bodyText: "",
    ctaText: "Update My Profile Now",
    ctaUrl: "/dashboard/profile",
  },
  {
    id: "sem7-group-check",
    label: "🎓 Sem 7: Offline Group Status Check",
    campaignType: "GENERAL_NOTIFICATION",
    emailCategory: "PROMOTIONAL",
    completionStatus: "ALL",
    semesters: [7],
    hasGroup: "false",
    seekingStatus: "LOOKING_FOR_TEAM",
    subject: "Quick Check: Have You Already Formed Your FYP Group?",
    heading:
      "Please Update Your FYP Availability Status (Semester {{semester}})",
    bodyText:
      "Salam {{first_name}},\n\nYour FYPMate profile is currently listed as 'Looking for a Team' in {{department}} (Semester {{semester}}).\n\nIf you have already formed your FYP group offline with classmates, please take 15 seconds to switch your status to 'Not Looking (Team Formed)' on your profile so active students only send requests to available peers.",
    ctaText: "Update My Availability Status",
    ctaUrl: "/dashboard/profile",
  },
  {
    id: "ai-validator-promo",
    label: "✨ Promote AI FYP Idea Validator",
    campaignType: "ANNOUNCEMENT",
    emailCategory: "PROMOTIONAL",
    completionStatus: "ALL",
    subject: "🤖 Validate Your FYP Idea in 60 Seconds on FYPMate",
    heading: "Benchmark Your FYP Idea Against Past PAF-IAST Projects",
    bodyText:
      "Not sure if your Final Year Project idea is original enough or if a similar project was already built in F21 or F22?\n\nUse the AI FYP Idea Validator on FYPMate to get an instant 100-point rubric evaluation, check overlap with past PAF-IAST projects, generate a 16-week execution roadmap, and practice with anticipated defense committee questions.",
    highlightTitle: "📄 Supports Direct PDF Proposal Upload",
    highlightText:
      "Already have a draft proposal PDF? Upload it directly to auto-extract your problem statement and download a formatted A4 evaluation dossier.",
    ctaText: "Validate My FYP Idea",
    ctaUrl: "/dashboard/fyp-ideas/validate",
  },
  {
    id: "dept-notice",
    label: "🏛️ Department-Specific Notice",
    campaignType: "GENERAL_NOTIFICATION",
    emailCategory: "PROMOTIONAL",
    completionStatus: "ALL",
    subject: "📢 FYP Notice for {{department}} (Semester {{semester}})",
    heading: "Important FYP Update for {{department}} Students",
    bodyText:
      "Salam {{first_name}},\n\nThis is a reminder for {{department}} students in Semester {{semester}} to finalize your FYP group members, lock your group on FYPMate, and validate your project proposal before the upcoming review.",
    ctaText: "Open FYPMate Workspace",
    ctaUrl: "/dashboard/fyp",
  },
]

const MISSING_SECTION_OPTIONS = [
  { key: "noSkills", label: "No Skills Added" },
  { key: "noProjects", label: "No Projects Added" },
  { key: "noInterests", label: "Missing Bio / Interests" },
  { key: "noPreferredTechStack", label: "Missing Preferred Tech Stack" },
  { key: "noCareerGoal", label: "Missing Career Goal" },
  { key: "noGithubUrl", label: "Missing GitHub URL" },
  { key: "noLinkedinUrl", label: "Missing LinkedIn URL" },
  { key: "noPhone", label: "Missing Phone Number" },
  { key: "noInternships", label: "No Internships" },
  { key: "noHobbies", label: "Missing Hobbies" },
] as const

const TRANSACTIONAL_TRIGGERS: Array<{
  key: TransactionalTriggerKey
  title: string
  eventDescription: string
  sourceFile: string
}> = [
  {
    key: "partnerRequest",
    title: "🎓 FYP Partner Request Received",
    eventDescription:
      "Triggered automatically when Student A sends an FYP Partner Request to Student B.",
    sourceFile: "modules/request/request.service.ts → notifyPartnerRequest()",
  },
  {
    key: "messageRequest",
    title: "💬 Message Request Received",
    eventDescription:
      "Triggered automatically when Student A sends a 1-on-1 Message Request to Student B.",
    sourceFile: "modules/request/request.service.ts → notifyMessageRequest()",
  },
  {
    key: "requestAccepted",
    title: "🎉 Partner / Message Request Accepted",
    eventDescription:
      "Triggered automatically when Student B accepts Student A's Partner or Message request.",
    sourceFile:
      "modules/request/request.service.ts → notifyRequestAccepted()",
  },
  {
    key: "feedbackUpdate",
    title: "📋 Admin Feedback Ticket Response",
    eventDescription:
      "Triggered automatically when an Admin replies to or updates a student's Feedback ticket.",
    sourceFile: "app/api/admin/feedback/[id]/route.ts → notifyFeedbackUpdate()",
  },
  {
    key: "welcomeEmail",
    title: "👋 New PAF-IAST Student Welcome",
    eventDescription:
      "Triggered automatically once when a new student signs up via Microsoft OAuth.",
    sourceFile: "app/api/auth/callback/route.ts → buildWelcomeEmail()",
  },
]

export default function AdminEmailsPage() {
  const { admin } = useAdminSession()

  // Active top-level tab
  const [activeTab, setActiveTab] = useState<
    "CAMPAIGNS" | "AUTO_TRIGGERS" | "LOGS"
  >("CAMPAIGNS")

  // Campaign mode & Email type
  const [campaignType, setCampaignType] =
    useState<EmailCampaignType>("PROFILE_COMPLETION")
  const [emailCategory, setEmailCategory] =
    useState<EmailCategory>("PROMOTIONAL")
  const [completionStatus, setCompletionStatus] =
    useState<CompletionStatusFilter>("MISSING_CHECKED")

  // Profile completion checkboxes
  const [missingFilters, setMissingFilters] = useState({
    noSkills: true,
    noProjects: true,
    noInternships: false,
    noHobbies: false,
    noPhone: false,
    noInterests: true,
    noCareerGoal: false,
    noPreferredTechStack: false,
    noLinkedinUrl: false,
    noGithubUrl: false,
    selectAll: false,
  })

  // Audience segmentation filters
  const [selectedSemesters, setSelectedSemesters] = useState<number[]>([])
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([])
  const [availability, setAvailability] = useState<
    "AVAILABLE" | "BUSY" | "AWAY" | "ALL"
  >("ALL")
  const [hasGroup, setHasGroup] = useState<"true" | "false" | "ALL">("ALL")
  const [seekingStatus, setSeekingStatus] = useState<
    | "LOOKING_FOR_TEAM"
    | "HAS_TEAM_LOOKING_FOR_MEMBERS"
    | "NOT_LOOKING"
    | "ALL"
  >("ALL")
  const [pushFilter, setPushFilter] = useState<PushSubscriptionFilter>("ALL")
  const [excludeRecentlyEmailed, setExcludeRecentlyEmailed] =
    useState<boolean>(true)
  const [batchCap, setBatchCap] = useState<number>(80) // Default 80 to stay safely within Resend 100/day Free Tier
  const [searchQuery, setSearchQuery] = useState("")

  // Custom email content fields
  const [subject, setSubject] = useState("")
  const [heading, setHeading] = useState("")
  const [bodyText, setBodyText] = useState("")
  const [highlightTitle, setHighlightTitle] = useState("")
  const [highlightText, setHighlightText] = useState("")
  const [ctaText, setCtaText] = useState("")
  const [ctaUrl, setCtaUrl] = useState("")

  // Transactional template preview key (when in AUTO_TRIGGERS tab)
  const [transactionalPreviewKey, setTransactionalPreviewKey] = useState<
    TransactionalTriggerKey | undefined
  >(undefined)

  // Preview & Quota state from server
  const [isLoadingPreview, setIsLoadingPreview] = useState(false)
  const [matchedStudents, setMatchedStudents] = useState<EmailPreviewStudent[]>(
    []
  )
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(
    new Set()
  )
  const [sampleSubject, setSampleSubject] = useState("")
  const [sampleHtml, setSampleHtml] = useState("")
  const [sampleCategory, setSampleCategory] =
    useState<EmailCategory>("PROMOTIONAL")
  const [isResendConfigured, setIsResendConfigured] = useState<boolean>(true)
  const [senderAddress, setSenderAddress] = useState<string>(
    "FYPMate <notifications@fypmate.com>"
  )
  const [quotaStats, setQuotaStats] = useState<EmailQuotaStats | null>(null)
  const [triggerConfig, setTriggerConfig] = useState<EmailTriggerConfig>({
    deliveryMode: "SMART_FALLBACK",
    partnerRequest: true,
    messageRequest: true,
    requestAccepted: true,
    feedbackUpdate: true,
    welcomeEmail: true,
    dailyTransactionalReserve: 15,
  })
  const [departmentBreakdown, setDepartmentBreakdown] = useState<
    Array<{ department: string; count: number }>
  >([])
  const [summaryCounts, setSummaryCounts] = useState({
    totalActive: 0,
    onboardingIncompleteCount: 0,
    incompleteUnder50Count: 0,
    noPushCount: 0,
  })

  // Sending & Test state
  const [testEmailInput, setTestEmailInput] = useState("")
  const [isSendingTest, setIsSendingTest] = useState(false)
  const [isSendingCampaign, setIsSendingCampaign] = useState(false)
  const [isSavingTriggerConfig, setIsSavingTriggerConfig] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [lastSendResult, setLastSendResult] = useState<EmailSendResult | null>(
    null
  )

  useEffect(() => {
    if (admin?.email && !testEmailInput) {
      setTestEmailInput(admin.email)
    }
  }, [admin?.email, testEmailInput])

  // Build filter payload
  const buildFilterPayload = useCallback((): EmailFilters => {
    return {
      campaignType,
      emailCategory,
      completionStatus,
      ...missingFilters,
      semesters: selectedSemesters.length > 0 ? selectedSemesters : undefined,
      departments:
        selectedDepartments.length > 0 ? selectedDepartments : undefined,
      availability,
      hasGroup,
      seekingStatus,
      pushFilter,
      excludeRecentlyEmailed,
      cooldownDays: 7,
      limit: batchCap > 0 ? batchCap : undefined,
      search: searchQuery.trim() || undefined,
      subject: subject.trim() || undefined,
      heading: heading.trim() || undefined,
      bodyText: bodyText.trim() || undefined,
      highlightTitle: highlightTitle.trim() || undefined,
      highlightText: highlightText.trim() || undefined,
      ctaText: ctaText.trim() || undefined,
      ctaUrl: ctaUrl.trim() || undefined,
      transactionalPreviewKey:
        activeTab === "AUTO_TRIGGERS" ? transactionalPreviewKey : undefined,
    }
  }, [
    campaignType,
    emailCategory,
    completionStatus,
    missingFilters,
    selectedSemesters,
    selectedDepartments,
    availability,
    hasGroup,
    seekingStatus,
    pushFilter,
    excludeRecentlyEmailed,
    batchCap,
    searchQuery,
    subject,
    heading,
    bodyText,
    highlightTitle,
    highlightText,
    ctaText,
    ctaUrl,
    activeTab,
    transactionalPreviewKey,
  ])

  const fetchPreview = useCallback(async () => {
    try {
      setIsLoadingPreview(true)
      const payload = buildFilterPayload()
      const res = await previewEmailRecipients(payload)

      setMatchedStudents(res.students)
      setSelectedStudentIds(new Set(res.students.map((s) => s.id)))
      setSampleSubject(res.sampleSubject)
      setSampleHtml(res.sampleHtml)
      setSampleCategory(res.sampleCategory)
      setIsResendConfigured(res.isResendConfigured)
      setSenderAddress(res.senderAddress)
      if (res.quotaStats) setQuotaStats(res.quotaStats)
      if (res.triggerConfig) setTriggerConfig(res.triggerConfig)
      if (res.departmentBreakdown)
        setDepartmentBreakdown(res.departmentBreakdown)
      if (res.summaryCounts) setSummaryCounts(res.summaryCounts)
    } catch (err: any) {
      toast.error(err?.message || "Failed to load email preview")
    } finally {
      setIsLoadingPreview(false)
    }
  }, [buildFilterPayload])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPreview()
    }, 300)
    return () => clearTimeout(timer)
  }, [fetchPreview])

  // Save changes to Automatic Trigger Config
  const handleUpdateTriggerConfig = async (
    updates: Partial<EmailTriggerConfig>
  ) => {
    try {
      setIsSavingTriggerConfig(true)
      const nextConfig = { ...triggerConfig, ...updates }
      setTriggerConfig(nextConfig)

      const res = await previewEmailRecipients({
        ...buildFilterPayload(),
        triggerConfigUpdate: updates,
      })
      if (res.triggerConfig) setTriggerConfig(res.triggerConfig)
      toast.success("Automatic email trigger settings saved")
    } catch (err: any) {
      toast.error(err?.message || "Failed to update trigger settings")
    } finally {
      setIsSavingTriggerConfig(false)
    }
  }

  // Apply a preset
  const applyPreset = (preset: CampaignPreset) => {
    setActiveTab("CAMPAIGNS")
    setTransactionalPreviewKey(undefined)
    setCampaignType(preset.campaignType)
    setEmailCategory(preset.emailCategory)
    setCompletionStatus(preset.completionStatus)
    setSubject(preset.subject)
    setHeading(preset.heading)
    setBodyText(preset.bodyText)
    setHighlightTitle(preset.highlightTitle || "")
    setHighlightText(preset.highlightText || "")
    setCtaText(preset.ctaText)
    setCtaUrl(preset.ctaUrl)
    setSelectedSemesters(preset.semesters || [])
    setHasGroup(preset.hasGroup || "ALL")
    setSeekingStatus(preset.seekingStatus || "ALL")
    toast.info(`Loaded preset: ${preset.label}`)
  }

  const toggleSemester = (sem: number) => {
    setSelectedSemesters((prev) =>
      prev.includes(sem) ? prev.filter((s) => s !== sem) : [...prev, sem]
    )
  }

  const toggleDepartment = (deptValue: string) => {
    setSelectedDepartments((prev) =>
      prev.includes(deptValue)
        ? prev.filter((d) => d !== deptValue)
        : [...prev, deptValue]
    )
  }

  const toggleStudentSelection = (id: string) => {
    setSelectedStudentIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAllMatched = () => {
    if (selectedStudentIds.size === matchedStudents.length) {
      setSelectedStudentIds(new Set())
    } else {
      setSelectedStudentIds(new Set(matchedStudents.map((s) => s.id)))
    }
  }

  // Send single test email
  const handleSendTestEmail = async () => {
    if (!testEmailInput.trim()) {
      toast.warning("Please enter an email address for the test")
      return
    }
    try {
      setIsSendingTest(true)
      const payload: EmailFilters = {
        ...buildFilterPayload(),
        testEmail: testEmailInput.trim(),
      }
      const res = await sendEmails(payload)
      setLastSendResult(res)
      if (res.totalSent > 0) {
        toast.success(`Test email sent to ${testEmailInput.trim()}`)
        fetchPreview()
      } else {
        toast.error(res.errors[0] || "Failed to send test email")
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to send test email")
    } finally {
      setIsSendingTest(false)
    }
  }

  // Execute batch email send
  const handleSendCampaign = async () => {
    if (selectedStudentIds.size === 0) {
      toast.warning("Please select at least 1 recipient")
      return
    }

    try {
      setIsSendingCampaign(true)
      setShowConfirmModal(false)

      const payload: EmailFilters = {
        ...buildFilterPayload(),
        studentIds: Array.from(selectedStudentIds),
      }

      const res = await sendEmails(payload)
      setLastSendResult(res)

      if (res.totalSent > 0) {
        toast.success(
          `Successfully sent ${res.totalSent} of ${res.totalTargeted} email(s)!`
        )
        fetchPreview()
      } else {
        toast.error(res.errors[0] || "Email campaign failed to send")
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to send email campaign")
    } finally {
      setIsSendingCampaign(false)
    }
  }

  const dailyPct = quotaStats
    ? Math.min(
        100,
        Math.round((quotaStats.sentTodayTotal / quotaStats.dailyLimit) * 100)
      )
    : 0
  const monthlyPct = quotaStats
    ? Math.min(
        100,
        Math.round((quotaStats.sentMonthTotal / quotaStats.monthlyLimit) * 100)
      )
    : 0

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 dark:border-slate-800/80 pb-6">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs">
            <Mail className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Resend Email &amp; Quota Management
            </h1>
            <p className="mt-0.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Manage Promotional &amp; Reminder broadcasts, Automatic
              Transactional triggers, and Resend Free-Tier limits
            </p>
          </div>
        </div>

        {/* Resend Status Pill */}
        <div className="flex flex-wrap items-center gap-2">
          <div
            className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold ${
              isResendConfigured
                ? "border-emerald-200/80 bg-emerald-50/60 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300"
                : "border-amber-200/80 bg-amber-50/60 text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                isResendConfigured ? "bg-emerald-500" : "bg-amber-500"
              }`}
            />
            {isResendConfigured
              ? "Resend Connected (2 req/s Paced)"
              : "RESEND_API_KEY Missing in .env"}
          </div>
        </div>
      </div>

      {/* Resend Free Tier Quota Meter Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Daily Quota Card */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Gauge className="h-3.5 w-3.5 text-indigo-500" />
              Daily Quota (Free Tier)
            </span>
            <span className="font-bold text-slate-900 dark:text-white">
              {quotaStats?.sentTodayTotal ?? 0} /{" "}
              {quotaStats?.dailyLimit ?? 100}
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className={`h-full rounded-full transition-all ${
                dailyPct >= 90
                  ? "bg-rose-500"
                  : dailyPct >= 70
                  ? "bg-amber-500"
                  : "bg-indigo-600"
              }`}
              style={{ width: `${dailyPct}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>
              {quotaStats?.sentTodayTransactional ?? 0} Transactional &bull;{" "}
              {quotaStats?.sentTodayPromotional ?? 0} Promo
            </span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              {quotaStats?.remainingToday ?? 100} left today
            </span>
          </div>
        </div>

        {/* Monthly Quota Card */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-500 dark:text-slate-400">
              Monthly Quota (Free Tier)
            </span>
            <span className="font-bold text-slate-900 dark:text-white">
              {quotaStats?.sentMonthTotal ?? 0} /{" "}
              {quotaStats?.monthlyLimit ?? 3000}
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-emerald-600 transition-all"
              style={{ width: `${monthlyPct}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>
              {quotaStats?.sentMonthTransactional ?? 0} Transactional &bull;{" "}
              {quotaStats?.sentMonthPromotional ?? 0} Promo
            </span>
            <span>{quotaStats?.remainingMonth ?? 3000} left</span>
          </div>
        </div>

        {/* Account Completion Quick Audit */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xs">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Incomplete Accounts
          </p>
          <div className="mt-1.5 flex items-baseline gap-3">
            <div>
              <span className="text-xl font-bold text-amber-600 dark:text-amber-400">
                {summaryCounts.onboardingIncompleteCount}
              </span>
              <span className="ml-1 text-[11px] text-slate-500">
                setup unfinished
              </span>
            </div>
            <div>
              <span className="text-xl font-bold text-slate-900 dark:text-white">
                {summaryCounts.incompleteUnder50Count}
              </span>
              <span className="ml-1 text-[11px] text-slate-500">
                &lt;50% profile
              </span>
            </div>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Click &ldquo;Account Setup Not Completed&rdquo; preset to target
          </p>
        </div>

        {/* Auto-Trigger Mode Status */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Auto-Trigger Mode
            </p>
            <span className="rounded-md bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
              {triggerConfig.deliveryMode === "SMART_FALLBACK"
                ? "Smart Quota Saver"
                : "Always Send"}
            </span>
          </div>
          <p className="mt-1.5 text-xs font-semibold text-slate-900 dark:text-white">
            {summaryCounts.noPushCount} of {summaryCounts.totalActive} students
            lack Push
          </p>
          <p className="mt-0.5 text-[11px] text-slate-400">
            From: <code className="font-mono">{senderAddress}</code>
          </p>
        </div>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200/80 dark:border-slate-800 pb-3">
        <button
          type="button"
          onClick={() => {
            setActiveTab("CAMPAIGNS")
            setTransactionalPreviewKey(undefined)
          }}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === "CAMPAIGNS"
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50"
          }`}
        >
          <Send className="h-4 w-4" />
          <span>1. Send Admin Campaigns &amp; Department Broadcasts</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("AUTO_TRIGGERS")
            setTransactionalPreviewKey("partnerRequest")
          }}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === "AUTO_TRIGGERS"
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50"
          }`}
        >
          <Sliders className="h-4 w-4" />
          <span>2. Automatic Transactional Triggers (5 Templates)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("LOGS")}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === "LOGS"
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50"
          }`}
        >
          <History className="h-4 w-4" />
          <span>
            3. Sent Email Logs ({quotaStats?.recentLogs?.length ?? 0})
          </span>
        </button>
      </div>

      {/* Last Send Result Alert */}
      {lastSendResult && (
        <div
          className={`rounded-2xl border p-4 flex items-start justify-between gap-4 ${
            lastSendResult.totalFailed === 0
              ? "border-emerald-200 bg-emerald-50/60 dark:border-emerald-900/50 dark:bg-emerald-950/20"
              : "border-amber-200 bg-amber-50/60 dark:border-amber-900/50 dark:bg-amber-950/20"
          }`}
        >
          <div className="space-y-1 text-xs">
            <p className="font-bold text-slate-900 dark:text-white">
              Last Dispatch Summary: Sent {lastSendResult.totalSent} of{" "}
              {lastSendResult.totalTargeted} email(s)
              {lastSendResult.quotaRemainingToday !== undefined
                ? ` • ${lastSendResult.quotaRemainingToday} daily emails remaining today`
                : ""}
            </p>
            {lastSendResult.errors.length > 0 && (
              <ul className="list-disc pl-4 text-rose-600 dark:text-rose-400 space-y-0.5">
                {lastSendResult.errors.map((e, idx) => (
                  <li key={idx}>{e}</li>
                ))}
              </ul>
            )}
          </div>
          <button
            onClick={() => setLastSendResult(null)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* TAB 3: RECENT EMAIL DISPATCH LOGS */}
      {activeTab === "LOGS" && (
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Recent Resend Email Dispatches (Last 25)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Tracks both automatic transactional notifications and manual
                admin promotional campaigns
              </p>
            </div>
            <button
              type="button"
              onClick={fetchPreview}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </button>
          </div>

          {!quotaStats?.recentLogs || quotaStats.recentLogs.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">
              No emails logged yet. Send a test email or campaign to see live
              delivery records here.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200/80 dark:divide-slate-800 text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-slate-500">
                      Time
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-500">
                      Recipient
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-500">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-500">
                      Template
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-500">
                      Subject
                    </th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-500">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {quotaStats.recentLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                        {log.recipientEmail}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold ${
                            log.category === "TRANSACTIONAL"
                              ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
                              : "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300"
                          }`}
                        >
                          {log.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                        {log.templateKey}
                      </td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300 max-w-xs truncate">
                        {log.subject}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold ${
                            log.status === "SENT"
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                              : "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 1 & TAB 2: TWO-COLUMN WORKSPACE */}
      {activeTab !== "LOGS" && (
        <div className="grid gap-6 lg:grid-cols-12">
          {/* LEFT COLUMN (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {activeTab === "AUTO_TRIGGERS" ? (
              /* TAB 2: AUTOMATIC TRANSACTIONAL TRIGGERS MANAGEMENT */
              <div className="space-y-6">
                {/* Delivery Mode Card */}
                <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Zap className="h-4 w-4 text-indigo-600" />
                        <span>
                          Automatic Transactional Email Delivery Policy
                        </span>
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Control how FYPMate uses your 100/day Resend Free Tier
                        quota for automatic student events
                      </p>
                    </div>
                    {isSavingTriggerConfig && (
                      <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                    )}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleUpdateTriggerConfig({
                          deliveryMode: "SMART_FALLBACK",
                        })
                      }
                      className={`flex flex-col items-start rounded-xl border p-4 text-left transition-all cursor-pointer ${
                        triggerConfig.deliveryMode === "SMART_FALLBACK"
                          ? "border-indigo-600 bg-indigo-50/50 dark:border-indigo-400 dark:bg-indigo-950/30"
                          : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          Smart Web-Push Fallback
                        </span>
                        <span className="rounded-md bg-emerald-100 dark:bg-emerald-950 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                          Recommended (Free Tier)
                        </span>
                      </div>
                      <p className="mt-1.5 text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                        If a student already has Web Push enabled, they get a
                        free Push notification. Resend email is sent{" "}
                        <strong>only when the student has NO Web Push</strong>{" "}
                        enabled—saving up to 60% of your 100/day quota!
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleUpdateTriggerConfig({
                          deliveryMode: "ALWAYS_SEND",
                        })
                      }
                      className={`flex flex-col items-start rounded-xl border p-4 text-left transition-all cursor-pointer ${
                        triggerConfig.deliveryMode === "ALWAYS_SEND"
                          ? "border-indigo-600 bg-indigo-50/50 dark:border-indigo-400 dark:bg-indigo-950/30"
                          : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                      }`}
                    >
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        Always Send Email + Push
                      </span>
                      <p className="mt-1.5 text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                        Sends an automatic Resend email to the student&apos;s{" "}
                        <code>@paf-iast.edu.pk</code> inbox on every enabled
                        event, even if they also receive a Web Push
                        notification.
                      </p>
                    </button>
                  </div>
                </div>

                {/* Individual Automatic Triggers List */}
                <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs space-y-4">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                      5 Automatic Transactional Email Templates &amp; Toggles
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Click <strong>Preview Template</strong> on any trigger to
                      inspect its HTML design and send yourself a test email
                    </p>
                  </div>

                  <div className="space-y-3">
                    {TRANSACTIONAL_TRIGGERS.map((item) => {
                      const isEnabled = Boolean(triggerConfig[item.key])
                      const isPreviewing = transactionalPreviewKey === item.key

                      return (
                        <div
                          key={item.key}
                          className={`rounded-xl border p-4 transition-all ${
                            isPreviewing
                              ? "border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20"
                              : "border-slate-200/80 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/20"
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                                  {item.title}
                                </span>
                                <span
                                  className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                                    isEnabled
                                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                                      : "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                                  }`}
                                >
                                  {isEnabled ? "ACTIVE" : "PAUSED"}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {item.eventDescription}
                              </p>
                              <p className="text-[11px] font-mono text-slate-400">
                                Hook: {item.sourceFile}
                              </p>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() =>
                                  setTransactionalPreviewKey(item.key)
                                }
                                className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                                  isPreviewing
                                    ? "border-indigo-600 bg-indigo-600 text-white"
                                    : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100"
                                }`}
                              >
                                Preview Template
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleUpdateTriggerConfig({
                                    [item.key]: !isEnabled,
                                  })
                                }
                                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                                  isEnabled
                                    ? "bg-slate-200/80 hover:bg-rose-100 text-slate-700 hover:text-rose-700 dark:bg-slate-800 dark:text-slate-300"
                                    : "bg-emerald-600 hover:bg-emerald-500 text-white"
                                }`}
                              >
                                {isEnabled ? "Pause" : "Enable"}
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            ) : (
              /* TAB 1: ADMIN CAMPAIGNS & FILTERED BROADCASTS */
              <>
                {/* 1. Campaign Template & Type Selector */}
                <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                      1. Choose Email Template &amp; Resend Category
                    </h2>

                    {/* Explicit Transactional vs Promotional Category Switch */}
                    <div className="inline-flex items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/60 p-1 text-xs">
                      <button
                        type="button"
                        onClick={() => setEmailCategory("PROMOTIONAL")}
                        className={`rounded-lg px-2.5 py-1 font-semibold transition-all cursor-pointer ${
                          emailCategory === "PROMOTIONAL"
                            ? "bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 shadow-2xs"
                            : "text-slate-500"
                        }`}
                      >
                        Promotional / Broadcast
                      </button>
                      <button
                        type="button"
                        onClick={() => setEmailCategory("TRANSACTIONAL")}
                        className={`rounded-lg px-2.5 py-1 font-semibold transition-all cursor-pointer ${
                          emailCategory === "TRANSACTIONAL"
                            ? "bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-2xs"
                            : "text-slate-500"
                        }`}
                      >
                        Transactional / Account
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        setCampaignType("ONBOARDING_INCOMPLETE")
                        setEmailCategory("TRANSACTIONAL")
                        setCompletionStatus("ONBOARDING_INCOMPLETE")
                      }}
                      className={`flex flex-col items-start rounded-xl border p-3 text-left transition-all cursor-pointer ${
                        campaignType === "ONBOARDING_INCOMPLETE"
                          ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900 shadow-xs"
                          : "border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                      }`}
                    >
                      <UserX className="h-4 w-4 mb-1.5" />
                      <span className="text-xs font-bold">
                        Setup Incomplete
                      </span>
                      <span
                        className={`text-[10px] mt-0.5 ${
                          campaignType === "ONBOARDING_INCOMPLETE"
                            ? "text-slate-300 dark:text-slate-600"
                            : "text-slate-500"
                        }`}
                      >
                        Unfinished 3-step onboarding
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setCampaignType("PROFILE_COMPLETION")
                        setEmailCategory("PROMOTIONAL")
                        setCompletionStatus("MISSING_CHECKED")
                      }}
                      className={`flex flex-col items-start rounded-xl border p-3 text-left transition-all cursor-pointer ${
                        campaignType === "PROFILE_COMPLETION"
                          ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900 shadow-xs"
                          : "border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                      }`}
                    >
                      <UserCheck className="h-4 w-4 mb-1.5" />
                      <span className="text-xs font-bold">
                        Profile Reminder
                      </span>
                      <span
                        className={`text-[10px] mt-0.5 ${
                          campaignType === "PROFILE_COMPLETION"
                            ? "text-slate-300 dark:text-slate-600"
                            : "text-slate-500"
                        }`}
                      >
                        Lists missing skills &amp; projects
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setCampaignType("ANNOUNCEMENT")
                        setEmailCategory("PROMOTIONAL")
                        setCompletionStatus("ALL")
                      }}
                      className={`flex flex-col items-start rounded-xl border p-3 text-left transition-all cursor-pointer ${
                        campaignType === "ANNOUNCEMENT"
                          ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900 shadow-xs"
                          : "border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                      }`}
                    >
                      <Sparkles className="h-4 w-4 mb-1.5" />
                      <span className="text-xs font-bold">
                        Promotional / Feature
                      </span>
                      <span
                        className={`text-[10px] mt-0.5 ${
                          campaignType === "ANNOUNCEMENT"
                            ? "text-slate-300 dark:text-slate-600"
                            : "text-slate-500"
                        }`}
                      >
                        Spotlight AI Validator &amp; tools
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setCampaignType("GENERAL_NOTIFICATION")
                        setEmailCategory("PROMOTIONAL")
                        setCompletionStatus("ALL")
                      }}
                      className={`flex flex-col items-start rounded-xl border p-3 text-left transition-all cursor-pointer ${
                        campaignType === "GENERAL_NOTIFICATION"
                          ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900 shadow-xs"
                          : "border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                      }`}
                    >
                      <Bell className="h-4 w-4 mb-1.5" />
                      <span className="text-xs font-bold">
                        Dept / General Notice
                      </span>
                      <span
                        className={`text-[10px] mt-0.5 ${
                          campaignType === "GENERAL_NOTIFICATION"
                            ? "text-slate-300 dark:text-slate-600"
                            : "text-slate-500"
                        }`}
                      >
                        Department &amp; semester notices
                      </span>
                    </button>
                  </div>

                  {/* 1-Click Presets */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                      1-Click Ready Templates &amp; Audience Presets
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {CAMPAIGN_PRESETS.map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => applyPreset(preset)}
                          className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 2. Audience Filters: Department, Account Completion, Semesters & Quota Savers */}
                <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                      2. Filter Target Recipients (Department, Account
                      Completion &amp; Quota Savers)
                    </h2>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDepartments([])
                        setSelectedSemesters([])
                        setCompletionStatus("ALL")
                        setAvailability("ALL")
                        setHasGroup("ALL")
                        setSeekingStatus("ALL")
                        setPushFilter("ALL")
                        setExcludeRecentlyEmailed(false)
                        setSearchQuery("")
                      }}
                      className="text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                    >
                      Reset All Filters
                    </button>
                  </div>

                  {/* Account / Profile Completion Filter */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Account &amp; Profile Completion Filter
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {[
                        { id: "ALL", label: "All Active Accounts" },
                        {
                          id: "ONBOARDING_INCOMPLETE",
                          label: `Setup Incomplete (${summaryCounts.onboardingIncompleteCount})`,
                        },
                        {
                          id: "INCOMPLETE_UNDER_50",
                          label: `< 50% Complete (${summaryCounts.incompleteUnder50Count})`,
                        },
                        {
                          id: "INCOMPLETE_UNDER_80",
                          label: "< 80% Complete",
                        },
                        {
                          id: "MISSING_CHECKED",
                          label: "Missing Checked Fields",
                        },
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() =>
                            setCompletionStatus(
                              opt.id as CompletionStatusFilter
                            )
                          }
                          className={`rounded-xl border px-2.5 py-2 text-[11px] font-semibold transition-all cursor-pointer ${
                            completionStatus === opt.id
                              ? "border-indigo-600 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-950/50 dark:text-indigo-300"
                              : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Department Multi-Select Pills with Counts */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-slate-500" />
                        <span>
                          Filter by Department (click one or more departments;
                          leave empty for All)
                        </span>
                      </label>
                      {selectedDepartments.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setSelectedDepartments([])}
                          className="text-[11px] text-indigo-600 hover:underline cursor-pointer"
                        >
                          Clear ({selectedDepartments.length})
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {DEPARTMENTS.map((dept) => {
                        const isSelected = selectedDepartments.includes(
                          dept.value
                        )
                        const countObj = departmentBreakdown.find(
                          (d) =>
                            d.department.toLowerCase() ===
                              dept.value.toLowerCase() ||
                            d.department.toLowerCase() ===
                              dept.label.toLowerCase()
                        )
                        const count = countObj?.count ?? 0

                        return (
                          <button
                            key={dept.value}
                            type="button"
                            onClick={() => toggleDepartment(dept.value)}
                            className={`inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1 text-xs font-medium transition-all cursor-pointer ${
                              isSelected
                                ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900"
                                : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                            }`}
                          >
                            <span>{dept.value}</span>
                            <span
                              className={`rounded-md px-1 text-[10px] ${
                                isSelected
                                  ? "bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-900"
                                  : "bg-slate-200/70 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                              }`}
                            >
                              {count}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Semester Pills + Quota Savers Row */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                        Semesters (leave empty for All)
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {[5, 6, 7, 8].map((sem) => {
                          const active = selectedSemesters.includes(sem)
                          return (
                            <button
                              key={sem}
                              type="button"
                              onClick={() => toggleSemester(sem)}
                              className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                                active
                                  ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900"
                                  : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300"
                              }`}
                            >
                              Sem {sem}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                        Free-Tier Batch Cap (Max 100/day on Resend)
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { cap: 50, label: "Max 50" },
                          { cap: 80, label: "Max 80 (Safe)" },
                          { cap: 100, label: "Max 100" },
                          { cap: 0, label: "All" },
                        ].map((item) => (
                          <button
                            key={item.cap}
                            type="button"
                            onClick={() => setBatchCap(item.cap)}
                            className={`rounded-xl border px-2.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                              batchCap === item.cap
                                ? "border-indigo-600 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-950/50 dark:text-indigo-300"
                                : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300"
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Secondary Dropdowns */}
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                        FYP Group Status
                      </label>
                      <select
                        value={hasGroup}
                        onChange={(e) =>
                          setHasGroup(e.target.value as "true" | "false" | "ALL")
                        }
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                      >
                        <option value="ALL">All Group States</option>
                        <option value="false">No FYP Group Yet</option>
                        <option value="true">Already in an FYP Group</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                        Seeking Status
                      </label>
                      <select
                        value={seekingStatus}
                        onChange={(e) => setSeekingStatus(e.target.value as any)}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                      >
                        <option value="ALL">All Seeking States</option>
                        <option value="LOOKING_FOR_TEAM">
                          Looking for Team
                        </option>
                        <option value="HAS_TEAM_LOOKING_FOR_MEMBERS">
                          Has Team (Recruiting)
                        </option>
                        <option value="NOT_LOOKING">Not Looking</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                        Push Notification Filter
                      </label>
                      <select
                        value={pushFilter}
                        onChange={(e) =>
                          setPushFilter(
                            e.target.value as PushSubscriptionFilter
                          )
                        }
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                      >
                        <option value="ALL">All Students</option>
                        <option value="NO_PUSH">
                          Only Students WITHOUT Push ({summaryCounts.noPushCount}
                          )
                        </option>
                        <option value="HAS_PUSH">
                          Only Students WITH Push
                        </option>
                      </select>
                    </div>
                  </div>

                  {/* Multi-Day Cooldown Checkbox */}
                  <label className="flex items-center gap-2.5 rounded-xl border border-indigo-200/70 dark:border-indigo-900/40 bg-indigo-50/40 dark:bg-indigo-950/20 px-3.5 py-2.5 text-xs font-medium text-slate-800 dark:text-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={excludeRecentlyEmailed}
                      onChange={(e) =>
                        setExcludeRecentlyEmailed(e.target.checked)
                      }
                      className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>
                      <strong>Multi-Day Batch Helper:</strong> Exclude students
                      already emailed in the last 7 days (lets you send 80/day
                      across multiple days without duplicates!)
                    </span>
                  </label>
                </div>

                {/* 3. Content & Missing Sections Configuration */}
                <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs space-y-4">
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    3.{" "}
                    {campaignType === "PROFILE_COMPLETION"
                      ? "Missing Profile Sections & Custom Message"
                      : "Customize Email Subject & Content"}
                  </h2>

                  {campaignType === "PROFILE_COMPLETION" && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Check which missing fields to audit &amp; list inside
                          each student&apos;s personalized email:
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            const allChecked = MISSING_SECTION_OPTIONS.every(
                              (o) => missingFilters[o.key]
                            )
                            const nextState = !allChecked
                            setMissingFilters({
                              noSkills: nextState,
                              noProjects: nextState,
                              noInternships: nextState,
                              noHobbies: nextState,
                              noPhone: nextState,
                              noInterests: nextState,
                              noCareerGoal: nextState,
                              noPreferredTechStack: nextState,
                              noLinkedinUrl: nextState,
                              noGithubUrl: nextState,
                              selectAll: false,
                            })
                          }}
                          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                        >
                          Toggle All
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {MISSING_SECTION_OPTIONS.map((item) => {
                          const checked = missingFilters[item.key]
                          return (
                            <label
                              key={item.key}
                              className={`flex items-center gap-2.5 rounded-xl border px-3 py-2 text-xs font-medium cursor-pointer transition-colors ${
                                checked
                                  ? "border-indigo-500/40 bg-indigo-50/40 text-slate-900 dark:border-indigo-500/40 dark:bg-indigo-950/30 dark:text-white"
                                  : "border-slate-200/80 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 text-slate-600 dark:text-slate-400"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={(e) =>
                                  setMissingFilters((prev) => ({
                                    ...prev,
                                    [item.key]: e.target.checked,
                                  }))
                                }
                                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                              />
                              <span>{item.label}</span>
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  <div className="space-y-3 pt-1">
                    <div className="flex items-center gap-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 px-3 py-2 text-[11px] text-slate-600 dark:text-slate-400">
                      <Info className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                      <span>
                        Dynamic variables:{" "}
                        <code className="font-mono font-semibold text-indigo-600">
                          {"{{first_name}}"}
                        </code>
                        ,{" "}
                        <code className="font-mono font-semibold text-indigo-600">
                          {"{{name}}"}
                        </code>
                        ,{" "}
                        <code className="font-mono font-semibold text-indigo-600">
                          {"{{department}}"}
                        </code>
                        ,{" "}
                        <code className="font-mono font-semibold text-indigo-600">
                          {"{{semester}}"}
                        </code>
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Subject Line (leave blank for template default)
                      </label>
                      <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Custom subject or leave empty for automatic subject..."
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>

                    {(campaignType === "ANNOUNCEMENT" ||
                      campaignType === "GENERAL_NOTIFICATION") && (
                      <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Email Heading
                        </label>
                        <input
                          type="text"
                          value={heading}
                          onChange={(e) => setHeading(e.target.value)}
                          placeholder="Main headline inside the email..."
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                        {campaignType === "PROFILE_COMPLETION" ||
                        campaignType === "ONBOARDING_INCOMPLETE"
                          ? "Optional Custom Intro Paragraph (leave blank for automatic)"
                          : "Message Body"}
                      </label>
                      <textarea
                        rows={3}
                        value={bodyText}
                        onChange={(e) => setBodyText(e.target.value)}
                        placeholder="Write custom message body or leave empty for default template..."
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 p-3 text-xs text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Interactive Recipient Selection Table */}
                <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs overflow-hidden">
                  <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Users className="h-4 w-4 text-slate-500" />
                        <span>
                          4. Targeted Recipients ({selectedStudentIds.size} of{" "}
                          {matchedStudents.length} selected)
                        </span>
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Click any row to check/uncheck specific students
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search name, roll no, dept..."
                          className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={fetchPreview}
                        className="rounded-xl border border-slate-200 dark:border-slate-800 p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                      >
                        <RefreshCw
                          className={`h-3.5 w-3.5 ${
                            isLoadingPreview ? "animate-spin" : ""
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                    {isLoadingPreview ? (
                      <div className="py-14 text-center">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-slate-400" />
                        <p className="mt-2 text-xs text-slate-500">
                          Filtering student recipients...
                        </p>
                      </div>
                    ) : matchedStudents.length === 0 ? (
                      <div className="py-14 text-center px-4">
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          No matching active students found
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          Try adjusting the Department, Completion, or Cooldown
                          filters above.
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="bg-slate-50/80 dark:bg-slate-800/40 px-4 py-2.5 flex items-center justify-between text-xs">
                          <button
                            type="button"
                            onClick={toggleSelectAllMatched}
                            className="inline-flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
                          >
                            {selectedStudentIds.size ===
                            matchedStudents.length ? (
                              <CheckSquare className="h-4 w-4 text-indigo-600" />
                            ) : (
                              <Square className="h-4 w-4 text-slate-400" />
                            )}
                            <span>
                              {selectedStudentIds.size ===
                              matchedStudents.length
                                ? "Deselect All"
                                : `Select All (${matchedStudents.length})`}
                            </span>
                          </button>
                          <span className="text-[11px] text-slate-500">
                            Showing up to {batchCap || "all"} matched students
                          </span>
                        </div>

                        {matchedStudents.map((student) => {
                          const isSelected = selectedStudentIds.has(student.id)
                          return (
                            <div
                              key={student.id}
                              onClick={() => toggleStudentSelection(student.id)}
                              className={`flex items-center justify-between gap-3 px-4 py-3 text-xs transition-colors cursor-pointer ${
                                isSelected
                                  ? "bg-white dark:bg-slate-900 hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                                  : "bg-slate-50/40 dark:bg-slate-950/40 opacity-60"
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => {}}
                                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 pointer-events-none"
                                />
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <p className="font-semibold text-slate-900 dark:text-white truncate">
                                      {student.name}
                                    </p>
                                    {!student.onboardingCompleted && (
                                      <span className="rounded bg-rose-50 dark:bg-rose-950/50 px-1.5 py-0.5 text-[10px] font-bold text-rose-600 dark:text-rose-400">
                                        Setup Unfinished
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                    {student.email} &bull; {student.department}{" "}
                                    (Sem {student.currentSemester})
                                  </p>
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center justify-end gap-1.5 shrink-0">
                                <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                                  {student.completenessPercent}% profile
                                </span>

                                {!student.hasPushEnabled && (
                                  <span className="rounded-md bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:text-amber-300">
                                    No Push
                                  </span>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* RIGHT COLUMN (5 cols): Dispatch Action + Test Sender + Live HTML Preview */}
          <div className="lg:col-span-5 space-y-6">
            {/* Dispatch & Test Card */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Send className="h-4 w-4 text-indigo-600" />
                  <span>
                    {activeTab === "AUTO_TRIGGERS"
                      ? "Test Automatic Transactional Email"
                      : "Dispatch Campaign"}
                  </span>
                </h2>
                <span
                  className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                    sampleCategory === "TRANSACTIONAL"
                      ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                      : "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300"
                  }`}
                >
                  {sampleCategory}
                </span>
              </div>

              {activeTab === "CAMPAIGNS" && (
                <>
                  {quotaStats &&
                    selectedStudentIds.size > quotaStats.remainingToday && (
                      <div className="rounded-xl border border-amber-200 bg-amber-50/70 dark:border-amber-900/50 dark:bg-amber-950/30 p-3 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                        <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                        <span>
                          You selected{" "}
                          <strong>{selectedStudentIds.size}</strong> students,
                          and <strong>{quotaStats.remainingToday}</strong>{" "}
                          emails remain in today&apos;s 100/day Free Tier limit.
                          The first {quotaStats.remainingToday} will be sent now
                          and the rest can be sent tomorrow!
                        </span>
                      </div>
                    )}

                  <button
                    type="button"
                    disabled={
                      isSendingCampaign ||
                      selectedStudentIds.size === 0 ||
                      !isResendConfigured
                    }
                    onClick={() => setShowConfirmModal(true)}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 py-3 px-4 text-xs sm:text-sm font-bold shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isSendingCampaign ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Sending Paced Batch via Resend...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>
                          Send {sampleCategory} Email to{" "}
                          {selectedStudentIds.size} Student
                          {selectedStudentIds.size === 1 ? "" : "s"}
                        </span>
                      </>
                    )}
                  </button>
                </>
              )}

              {/* Test Email Box */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <FlaskConical className="h-3.5 w-3.5 text-slate-500" />
                  <span>
                    Send 1 Test Email of Currently Previewed Template
                  </span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={testEmailInput}
                    onChange={(e) => setTestEmailInput(e.target.value)}
                    placeholder="Enter test email address..."
                    className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                  <button
                    type="button"
                    disabled={isSendingTest || !isResendConfigured}
                    onClick={handleSendTestEmail}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 disabled:opacity-50 cursor-pointer shrink-0"
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
            </div>

            {/* Live HTML Preview Card */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs overflow-hidden">
              <div className="p-4 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-slate-500" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Live HTML Email Preview
                  </h3>
                </div>
                <span className="text-[11px] text-slate-400">
                  {activeTab === "AUTO_TRIGGERS"
                    ? `Trigger: ${transactionalPreviewKey}`
                    : `Template: ${campaignType}`}
                </span>
              </div>

              <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200/60 dark:border-slate-800 text-xs">
                <span className="text-slate-400 font-medium">Subject: </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {sampleSubject || "Loading subject..."}
                </span>
              </div>

              <div className="bg-slate-100 dark:bg-slate-950 p-2">
                {sampleHtml ? (
                  <iframe
                    title="Email HTML Preview"
                    srcDoc={sampleHtml}
                    className="w-full h-[540px] rounded-xl bg-white border border-slate-200/80"
                    sandbox="allow-same-origin"
                  />
                ) : (
                  <div className="h-[420px] flex items-center justify-center text-xs text-slate-400">
                    Generating preview...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shrink-0">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Confirm {sampleCategory} Email Broadcast
                </h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  You are about to send{" "}
                  <strong className="text-slate-900 dark:text-white">
                    {selectedStudentIds.size} email(s)
                  </strong>{" "}
                  via Resend using the{" "}
                  <strong className="text-slate-900 dark:text-white">
                    {campaignType.replace(/_/g, " ")}
                  </strong>{" "}
                  template.
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 text-xs space-y-1.5">
              <p className="text-slate-600 dark:text-slate-300">
                <strong>Subject:</strong> {sampleSubject}
              </p>
              <p className="text-slate-600 dark:text-slate-300">
                <strong>Category Tag:</strong> {sampleCategory}
              </p>
              <p className="text-slate-600 dark:text-slate-300">
                <strong>Daily Quota Remaining:</strong>{" "}
                {quotaStats?.remainingToday ?? 100} /{" "}
                {quotaStats?.dailyLimit ?? 100}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendCampaign}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-xs font-bold text-white shadow-xs cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Confirm &amp; Send Now</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
