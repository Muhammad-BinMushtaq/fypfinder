// =============================
// Validation Result Type
// =============================
export type StudentIDValidationResult =
  | {
      valid: true
      currentSemester: number
      department: string
    }
  | {
      valid: false
      error: string
    }

export function validateStudentID(studentId: string): StudentIDValidationResult {
  // Normalize input (allow uppercase or lowercase)
  const normalizedId = studentId.trim().toLowerCase()

  /**
   * Format Supported:
   * B23S0295SE014
   * b23s0295se014
   * Department code can be 2–4 letters
   *
   * Pattern:
   * b + 2 digits year
   * + f|s
   * + 4 digits
   * + 2–4 letters (department)
   * + 3 digits
   */
  const studentIdRegex = /^b(\d{2})([fs])\d{4}([a-z]{2,4})\d{3}$/

  const match = normalizedId.match(studentIdRegex)

  if (!match) {
    return {
      valid: false,
      error:
        "Invalid student ID format. Example: B23S0295SE014",
    }
  }

  const admissionYear = parseInt(match[1])
  const admissionSession = match[2] // f | s
  const department = match[3].toUpperCase() // dynamic length (2–4 letters)

  // =============================
  // Semester calculation (Fixed BUG-004)
  // =============================
  //
  // Academic calendar used at PAF-IAST:
  //   Fall term:   Sep – Jan  (months 9–12 of year Y, plus Jan of Y+1)
  //   Spring term: Feb – May  (months 2–5)
  //   Summer:      Jun – Aug  (months 6–8)  → treated as end of Spring term
  //
  // The "current session" determines which odd/even semester the student is in.
  // Summer months belong to the same Spring term (same academic year) so we
  // do NOT decrement academicYear for them.

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1 // 1-indexed

  let academicYear = currentYear
  let currentSession: "F" | "S"

  if (currentMonth >= 9) {
    // Sep–Dec: Fall term of currentYear
    currentSession = "F"
    academicYear = currentYear
  } else if (currentMonth >= 6) {
    // Jun–Aug: Summer break → belongs to Spring term of currentYear
    // (Spring ended, Fall hasn't started yet — treat as late Spring)
    currentSession = "S"
    academicYear = currentYear
  } else if (currentMonth >= 2) {
    // Feb–May: Spring term of currentYear (academicYear shifts back 1)
    currentSession = "S"
    academicYear = currentYear - 1
  } else {
    // January: still in Fall term that started in Sep of previous year
    currentSession = "F"
    academicYear = currentYear - 1
  }

  const admissionFullYear = 2000 + admissionYear
  const yearsElapsed = academicYear - admissionFullYear

  if (yearsElapsed < 0) {
    return {
      valid: false,
      error: "Student ID refers to a future admission year. Registration not yet open.",
    }
  }

  // Base semester index: each year = 2 semesters; start at semester 1
  let currentSemester = yearsElapsed * 2 + 1

  // Adjust for admission session vs current session offset
  // Fall-admitted student in a Spring term → one extra semester completed
  if (admissionSession === "f" && currentSession === "S") {
    currentSemester += 1
  }
  // Spring-admitted student in a Fall term → one extra semester completed
  if (admissionSession === "s" && currentSession === "F") {
    currentSemester += 1
  }

  // ❌ Semester validation
  // Semesters 5-8 are allowed (FYP eligible)
  // Note: Semester 8 students have read-only access for partner requests
  if (currentSemester < 5) {
    return {
      valid: false,
      error: `Semester ${currentSemester}: Only students in semester 5, 6, 7, or 8 can signup`,
    }
  }

  if (currentSemester > 8) {
    return {
      valid: false,
      error: `Semester ${currentSemester}: Registration closed for advanced students`,
    }
  }

  // ✅ SUCCESS
  return {
    valid: true,
    currentSemester,
    department,
  }
}
