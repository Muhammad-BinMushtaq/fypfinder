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
}

export interface StudentDetails extends StudentListItem {
  bio: string | null
  skills: Array<{ id: string; name: string; level: string }>
  projects: Array<{ id: string; title: string; description: string }>
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

  return data.admin
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

  return data.admin
}

export async function getAdminSession(): Promise<AdminUser | null> {
  const response = await fetch("/api/admin/session")

  if (!response.ok) {
    return null
  }

  const data = await response.json()
  return data.admin || null
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
    })),
    total: pagination.total,
    page,
    pageSize,
    totalPages: Math.ceil(pagination.total / pageSize),
  }
}

export async function getStudentDetails(studentId: string): Promise<StudentDetails> {
  const response = await fetch(`/api/admin/get-student/${studentId}`)
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch student details")
  }

  return data.student
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

export async function deleteStudent(studentId: string): Promise<void> {
  const response = await fetch("/api/admin/delete-student", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ studentId }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || "Failed to delete student")
  }
}

// ============ CONVERSATIONS (READ-ONLY) ============

export async function getAdminConversations(
  page: number = 1,
  pageSize: number = 20
): Promise<PaginatedResponse<AdminConversation>> {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  })

  const response = await fetch(`/api/admin/conversations?${params.toString()}`)
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch conversations")
  }

  return data
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
    throw new Error(data.message || "Failed to fetch messages")
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

  return data
}
