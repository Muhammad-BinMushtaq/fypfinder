// services/admin.service.ts
/**
 * Admin Service
 * -------------
 * All API calls for admin functionality.
 * This is the ONLY place where admin-related fetch calls should happen.
 */

// ============ TYPES ============

export interface AdminUser {
  id: string
  email: string
  name?: string
  role: "ADMIN"
}

export interface StudentListItem {
  id: string
  userId: string
  name: string
  email: string
  university: string | null
  department: string | null
  status: "ACTIVE" | "SUSPENDED" | "DELETION_REQUESTED"
  createdAt: string
  profilePicture: string | null
  currentSemester?: number
}

export interface StudentFullProfile {
  id: string
  userId: string
  name: string
  department: string
  currentSemester: number
  profilePicture: string | null
  interests: string | null
  phone: string | null
  linkedinUrl: string | null
  githubUrl: string | null
  availability: string
  careerGoal: string | null
  hobbies: string | null
  preferredTechStack: string | null
  industryPreference: string | null
  showGroupOnProfile: boolean
  createdAt: string
  user: {
    email: string
    status: string
    createdAt: string
  }
  skills: Array<{ id: string; name: string; level: string }>
  projects: Array<{ id: string; name: string; description: string | null; liveLink: string | null; githubLink: string | null }>
  internships: Array<{ id: string; companyName: string; position: string; duration: string; description: string | null; certificateLink: string | null }>
  groupMember: {
    joinedAt: string
    group: {
      id: string
      projectName: string
      isLocked: boolean
      members: Array<{ student: { id: string; name: string } }>
    }
  } | null
}

// Keep backward compat alias
export interface StudentDetails extends StudentListItem {
  bio: string | null
  skills: Array<{ id: string; name: string; level: string }>
  projects: Array<{ id: string; title: string; description: string }>
}

export interface AdminReports {
  period: "week" | "month"
  dateRange: { start: string; end: string }
  overview: {
    totalStudents: number
    activeStudents: number
    suspendedStudents: number
    totalGroups: number
  }
  currentPeriod: {
    newStudents: number
    newMessages: number
    newConversations: number
    newRequests: number
    acceptedRequests: number
    newGroups: number
  }
  trends: {
    students: number
    messages: number
    conversations: number
    requests: number
  }
  breakdown: {
    departments: Array<{ department: string; count: number }>
    semesters: Array<{ semester: number; count: number }>
    statuses: Array<{ status: string; count: number }>
    availability: Array<{ status: string; count: number }>
  }
  skills: {
    totalSkills: number
    topSkills: Array<{ name: string; count: number }>
    levelDistribution: Array<{ level: string; count: number }>
  }
  profileCompletion: {
    totalStudents: number
    missingPhone: number
    missingInterests: number
    missingCareerGoal: number
    noSkills: number
    noProjects: number
  }
  groupStats: {
    totalGroups: number
    studentsInGroups: number
    studentsWithoutGroup: number
  }
}

export interface AdminConversation {
  id: string
  studentA: {
    id: string
    name: string
    email: string
    profilePicture: string | null
  }
  studentB: {
    id: string
    name: string
    email: string
    profilePicture: string | null
  }
  lastMessage: {
    content: string
    createdAt: string
    senderId: string
  } | null
  messageCount: number
  createdAt: string
}

export interface AdminMessage {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  senderEmail: string
  content: string
  createdAt: string
  isRead: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface StudentFilters {
  search?: string
  status?: "ACTIVE" | "SUSPENDED" | "DELETION_REQUESTED" | "ALL"
  department?: string
  skill?: string
  availability?: "AVAILABLE" | "BUSY" | "AWAY" | "ALL"
  hasGroup?: "true" | "false" | "ALL"
  page?: number
  pageSize?: number
}

// ============ AUTH ============

export async function adminLogin(email: string, password: string): Promise<AdminUser> {
  const response = await fetch("/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || "Login failed")
  }

  return data.data.admin
}

export async function adminSignup(name: string, email: string, password: string): Promise<AdminUser> {
  const response = await fetch("/api/admin/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || "Signup failed")
  }

  return data.data.admin
}

export async function getAdminSession(): Promise<AdminUser | null> {
  const response = await fetch("/api/admin/session")

  if (!response.ok) {
    return null
  }

  const data = await response.json()
  return data.data?.admin || null
}

export async function adminLogout(): Promise<void> {
  const response = await fetch("/api/admin/logout", {
    method: "POST",
  })

  if (!response.ok) {
    throw new Error("Logout failed")
  }
}

// ============ STUDENTS ============

export async function getAllStudents(
  filters: StudentFilters = {}
): Promise<PaginatedResponse<StudentListItem>> {
  const params = new URLSearchParams()

  // API uses limit/offset, convert from page/pageSize
  const pageSize = filters.pageSize || 10
  const page = filters.page || 1
  const offset = (page - 1) * pageSize

  params.set("limit", String(pageSize))
  params.set("offset", String(offset))

  if (filters.search) params.set("name", filters.search)
  if (filters.status && filters.status !== "ALL") params.set("status", filters.status)
  if (filters.department) params.set("department", filters.department)
  if (filters.skill) params.set("skill", filters.skill)
  if (filters.availability && filters.availability !== "ALL") params.set("availability", filters.availability)
  if (filters.hasGroup && filters.hasGroup !== "ALL") params.set("hasGroup", filters.hasGroup)

  const response = await fetch(`/api/admin/get-all-students?${params.toString()}`)
  const json = await response.json()

  if (!response.ok) {
    throw new Error(json.message || "Failed to fetch students")
  }

  // Transform API response to expected format
  const apiData = json.data
  const students = apiData?.items || []
  const pagination = apiData?.pagination || { total: 0, limit: pageSize, offset: 0 }

  return {
    data: students.map((student: any) => ({
      id: student.id,
      userId: student.userId || "",
      name: student.name,
      email: student.user?.email || "",
      university: student.university || null,
      department: student.department || null,
      status: student.user?.status || "ACTIVE",
      createdAt: student.createdAt,
      profilePicture: student.profilePicture || null,
      currentSemester: student.currentSemester,
    })),
    total: pagination.total,
    page,
    pageSize,
    totalPages: Math.ceil(pagination.total / pageSize),
  }
}

export async function getStudentDetails(studentId: string): Promise<StudentFullProfile> {
  const response = await fetch(`/api/admin/get-student/${studentId}`)
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch student details")
  }

  return data.data
}

export async function updateStudent(
  studentId: string,
  updates: { name?: string; currentSemester?: number }
): Promise<{ id: string; name: string; currentSemester: number }> {
  const response = await fetch(`/api/admin/update-student/${studentId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || "Failed to update student")
  }

  return data.data
}

export async function suspendStudent(studentId: string): Promise<void> {
  const response = await fetch("/api/admin/suspend-student", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ studentId, action: "suspend" }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || "Failed to suspend student")
  }
}

export async function unsuspendStudent(studentId: string): Promise<void> {
  const response = await fetch("/api/admin/suspend-student", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ studentId, action: "unsuspend" }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || "Failed to unsuspend student")
  }
}

// ============ CONVERSATIONS (READ-ONLY) ============

export async function getAdminConversations(
  page: number = 1,
  pageSize: number = 20,
  search?: string
): Promise<PaginatedResponse<AdminConversation>> {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  })
  if (search) {
    params.set("search", search)
  }

  const response = await fetch(`/api/admin/conversations?${params.toString()}`)
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || data.error || "Failed to fetch conversations")
  }

  return data
}

export async function getAdminConversationDetails(
  conversationId: string
): Promise<AdminConversation> {
  const response = await fetch(`/api/admin/conversations/${conversationId}`)
  const json = await response.json()

  if (!response.ok || !json.data) {
    throw new Error(json.message || "Failed to fetch conversation")
  }

  return json.data
}

export async function getAdminMessages(
  conversationId: string,
  page: number = 1,
  pageSize: number = 50
): Promise<PaginatedResponse<AdminMessage>> {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  })

  const response = await fetch(`/api/admin/conversations/${conversationId}/messages?${params.toString()}`)
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || data.error || "Failed to fetch messages")
  }

  return data
}

// ============ STATISTICS ============

export interface AdminStats {
  totalStudents: number
  activeStudents: number
  suspendedStudents: number
  deletionRequestedStudents: number
  totalConversations: number
  totalMessages: number
}

export async function getAdminStats(): Promise<AdminStats> {
  const response = await fetch("/api/admin/stats")
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch stats")
  }

  return data.data
}

// ============ REPORTS ============

export async function getAdminReports(period: "week" | "month" = "week"): Promise<AdminReports> {
  const response = await fetch(`/api/admin/reports?period=${period}`)
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch reports")
  }

  return data.data
}

// ============ EMAIL NOTIFICATIONS & QUOTA MANAGEMENT (RESEND) ============

export type EmailCampaignType =
  | "ONBOARDING_INCOMPLETE"
  | "PROFILE_COMPLETION"
  | "ANNOUNCEMENT"
  | "GENERAL_NOTIFICATION"

export type EmailCategory = "TRANSACTIONAL" | "PROMOTIONAL"

export type CompletionStatusFilter =
  | "ALL"
  | "ONBOARDING_INCOMPLETE"
  | "INCOMPLETE_UNDER_50"
  | "INCOMPLETE_UNDER_80"
  | "MISSING_CHECKED"

export type PushSubscriptionFilter = "ALL" | "NO_PUSH" | "HAS_PUSH"

export type TransactionalTriggerKey =
  | "partnerRequest"
  | "messageRequest"
  | "requestAccepted"
  | "feedbackUpdate"
  | "welcomeEmail"

export interface EmailTriggerConfig {
  deliveryMode: "SMART_FALLBACK" | "ALWAYS_SEND"
  partnerRequest: boolean
  messageRequest: boolean
  requestAccepted: boolean
  feedbackUpdate: boolean
  welcomeEmail: boolean
  dailyTransactionalReserve: number
}

export interface EmailLogEntry {
  id: string
  recipientEmail: string
  studentId: string | null
  category: EmailCategory
  templateKey: string
  subject: string
  status: "SENT" | "FAILED"
  errorMessage: string | null
  createdAt: string
}

export interface EmailQuotaStats {
  dailyLimit: number
  monthlyLimit: number
  sentTodayTotal: number
  sentTodayTransactional: number
  sentTodayPromotional: number
  remainingToday: number
  sentMonthTotal: number
  sentMonthTransactional: number
  sentMonthPromotional: number
  remainingMonth: number
  recentLogs: EmailLogEntry[]
}

export interface EmailFilters {
  campaignType?: EmailCampaignType
  emailCategory?: EmailCategory
  completionStatus?: CompletionStatusFilter
  noSkills: boolean
  noProjects: boolean
  noInternships: boolean
  noHobbies: boolean
  noPhone: boolean
  noInterests: boolean
  noCareerGoal: boolean
  noPreferredTechStack: boolean
  noLinkedinUrl: boolean
  noGithubUrl: boolean
  selectAll: boolean

  // Audience filters
  semesters?: number[]
  department?: string
  departments?: string[]
  availability?: "AVAILABLE" | "BUSY" | "AWAY" | "ALL"
  hasGroup?: "true" | "false" | "ALL"
  seekingStatus?:
    | "LOOKING_FOR_TEAM"
    | "HAS_TEAM_LOOKING_FOR_MEMBERS"
    | "NOT_LOOKING"
    | "ALL"
  pushFilter?: PushSubscriptionFilter
  excludeRecentlyEmailed?: boolean
  cooldownDays?: number
  search?: string

  // Recipient selection & batch cap
  studentIds?: string[]
  limit?: number

  // Custom email content
  subject?: string
  heading?: string
  bodyText?: string
  highlightTitle?: string
  highlightText?: string
  ctaText?: string
  ctaUrl?: string

  // Test email target & transactional preview
  testEmail?: string
  transactionalPreviewKey?: TransactionalTriggerKey
  triggerConfigUpdate?: Partial<EmailTriggerConfig>
}

export interface EmailPreviewStudent {
  id: string
  name: string
  email: string
  department: string
  currentSemester: number
  availability: string
  seekingStatus: string
  hasGroup: boolean
  onboardingCompleted: boolean
  completenessPercent: boolean | number
  hasPushEnabled: boolean
  recentlyEmailed: boolean
  missingSections: string[]
}

export interface EmailPreviewResponse {
  total: number
  students: EmailPreviewStudent[]
  sampleSubject: string
  sampleHtml: string
  sampleCategory: EmailCategory
  isResendConfigured: boolean
  senderAddress: string
  quotaStats: EmailQuotaStats
  triggerConfig: EmailTriggerConfig
  departmentBreakdown: Array<{ department: string; count: number }>
  summaryCounts: {
    totalActive: number
    onboardingIncompleteCount: number
    incompleteUnder50Count: number
    noPushCount: number
    recentlyEmailedCount?: number
  }
}

export interface EmailSendResult {
  totalTargeted: number
  totalSent: number
  totalFailed: number
  errors: string[]
  quotaRemainingToday?: number
}

export async function previewEmailRecipients(
  filters: EmailFilters
): Promise<EmailPreviewResponse> {
  const response = await fetch("/api/admin/email/preview", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(filters),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || "Failed to preview recipients")
  }

  return data.data
}

export async function sendEmails(
  filters: EmailFilters
): Promise<EmailSendResult> {
  const response = await fetch("/api/admin/email/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(filters),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || "Failed to send emails")
  }

  return data.data
}
