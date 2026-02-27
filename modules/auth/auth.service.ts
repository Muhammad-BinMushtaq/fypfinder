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
  // Semester calculation (UNCHANGED LOGIC)
  // =============================

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1

  let academicYear = currentYear
  let currentSession: "F" | "S"

  if (currentMonth >= 9) {
    currentSession = "F"
  } else if (currentMonth <= 5) {
    currentSession = "S"
    academicYear--
  } else {
    currentSession = "F"
    academicYear--
  }

  const admissionFullYear = 2000 + admissionYear
  const yearsElapsed = academicYear - admissionFullYear

  let currentSemester = yearsElapsed * 2 + 1

  if (admissionSession === "s" && currentSession === "F") {
    currentSemester += 1
  }

  if (admissionSession === "f" && currentSession === "S") {
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
