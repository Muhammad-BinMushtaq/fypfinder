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
   * b23f0018sdaat025 (5-letter department code)
   * Department code can be 2–6 letters
   *
   * Pattern:
   * b + 2 digits year
   * + f|s
   * + 4 digits
   * + 2–6 letters (department)
   * + 3 digits
   */
  const studentIdRegex = /^b(\d{2})([fs])\d{4}([a-z]{2,6})\d{3}$/

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
  const department = match[3].toUpperCase() // dynamic length (2–6 letters)

  // =============================
  // Semester calculation using Monotonic Term Index
  // =============================
  // Academic calendar used at PAF-IAST:
  //   Spring term: Feb – Aug (months 2–8, includes summer break)
  //   Fall term:   Sep – Jan (months 9–12 of current year, month 1 of next year)
  //
  // Every term is represented by a sequential index:
  //   termIndex = Year * 2 + (Session === "S" ? 0 : 1)
  // Current semester is simply the difference in elapsed terms + 1.

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1 // 1-indexed

  let currentTermYear = currentYear
  let currentTermSession: "S" | "F"

  if (currentMonth >= 2 && currentMonth <= 8) {
    // Feb–Aug: Spring term of currentYear
    currentTermSession = "S"
    currentTermYear = currentYear
  } else if (currentMonth >= 9) {
    // Sep–Dec: Fall term of currentYear
    currentTermSession = "F"
    currentTermYear = currentYear
  } else {
    // January (month 1): Still in Fall term that started in Sep of previous year
    currentTermSession = "F"
    currentTermYear = currentYear - 1
  }

  const admissionFullYear = 2000 + admissionYear
  const admissionTermIndex = admissionFullYear * 2 + (admissionSession === "s" ? 0 : 1)
  const currentTermIndex = currentTermYear * 2 + (currentTermSession === "S" ? 0 : 1)

  if (currentTermIndex < admissionTermIndex) {
    return {
      valid: false,
      error: "Student ID refers to a future admission year. Registration not yet open.",
    }
  }

  // Elapsed terms + 1 gives the current semester
  const currentSemester = (currentTermIndex - admissionTermIndex) + 1

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
