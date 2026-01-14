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
  const studentIdRegex = /^B\d{2}[FS]\d{4}[A-Z]{2}\d{3}$/

  if (!studentIdRegex.test(studentId)) {
    return {
      valid: false,
      error: "Invalid student ID format. Expected: B23F0001SE021",
    }
  }

  // Extract components
  const degree = studentId[0] // B
  const admissionYear = parseInt(studentId.substring(1, 3)) // 23
  const admissionSession = studentId[3] // F | S
  const department = studentId.substring(8, 10) // ✅ SE, CY, CS

  // ❌ Only bachelors allowed
  if (degree !== "B") {
    return { valid: false, error: "Only bachelor students can signup" }
  }

  // ❌ Validate session
  if (admissionSession !== "F" && admissionSession !== "S") {
    return {
      valid: false,
      error: "Invalid session. Must be F (Fall) or S (Spring)",
    }
  }

  // =============================
  // Semester calculation
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

  if (admissionSession === "S" && currentSession === "F") {
    currentSemester += 1
  }

  if (admissionSession === "F" && currentSession === "S") {
    currentSemester += 1
  }

  // ❌ Semester validation
  if (currentSemester < 5) {
    return {
      valid: false,
      error: `Semester ${currentSemester}: Only students in semester 5, 6, or 7 can signup`,
    }
  }

  if (currentSemester > 7) {
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
