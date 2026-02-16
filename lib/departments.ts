// lib/departments.ts
/**
 * Department Mapping Utility
 * --------------------------
 * Central source of truth for department names.
 * Used across discovery filters, profile pages, and public profiles.
 */

export interface Department {
  value: string;  // Abbreviation (e.g., "SE")
  label: string;  // Full name (e.g., "Software Engineering")
  faculty: string; // Faculty/School name
}

export const DEPARTMENTS: Department[] = [
  // IT & Computing
  { value: "AI", label: "Artificial Intelligence", faculty: "Information Technology & Computer Science" },
  { value: "SE", label: "Software Engineering", faculty: "Information Technology & Computer Science" },
  { value: "CS", label: "Computer Science", faculty: "Information Technology & Computer Science" },
  { value: "DS", label: "Data Science", faculty: "Information Technology & Computer Science" },
  { value: "CYS", label: "Cyber Security", faculty: "Information Technology & Computer Science" },

  // Engineering
  { value: "CE", label: "Computer Engineering", faculty: "Electrical & Computer Engineering" },
  { value: "CHE", label: "Chemical Engineering", faculty: "Chemical & Energy Engineering" },
  { value: "MCET", label: "Mechatronics Engineering", faculty: "Mechanical & Manufacturing Engineering" },

  // Biological Sciences
  { value: "BMS", label: "Biomedical Sciences", faculty: "Biological Sciences" },
  { value: "BTEC", label: "Biotechnology", faculty: "Biological Sciences" },
  { value: "BTY", label: "Bioinformatics", faculty: "Biological Sciences" },

  // Business
  { value: "BUS", label: "Business Administration", faculty: "Business, Entrepreneurship and Professional Development" },

  // Pharmaceutical Sciences
  { value: "PHY", label: "Pharmacy", faculty: "Department of Pharmaceutical Sciences" },
  { value: "PHR", label: "Pharmaceutical Research", faculty: "Department of Pharmaceutical Sciences" },
  { value: "PHD", label: "Pharmaceutical Development", faculty: "Department of Pharmaceutical Sciences" },

  // Design
  { value: "SDT", label: "Spatial Design Technologies", faculty: "Design Art and Architecture Technologies" },
  { value: "ITD", label: "Interior Design", faculty: "Design Art and Architecture Technologies" },

  // Languages
  { value: "ENG", label: "English & Modern Languages", faculty: "English & Modern Languages" },
];

/**
 * Get full department name from abbreviation
 * @param code - Department abbreviation (e.g., "SE")
 * @returns Full department name or the original code if not found
 */
export function getDepartmentLabel(code: string | undefined | null): string {
  if (!code) return "Unknown";
  const dept = DEPARTMENTS.find((d) => d.value === code);
  return dept?.label || code;
}

/**
 * Get department info from abbreviation
 * @param code - Department abbreviation (e.g., "SE")
 * @returns Department object or null if not found
 */
export function getDepartmentInfo(code: string | undefined | null): Department | null {
  if (!code) return null;
  return DEPARTMENTS.find((d) => d.value === code) || null;
}

/**
 * Get faculty name from department code
 * @param code - Department abbreviation (e.g., "SE")
 * @returns Faculty name or empty string if not found
 */
export function getDepartmentFaculty(code: string | undefined | null): string {
  if (!code) return "";
  const dept = DEPARTMENTS.find((d) => d.value === code);
  return dept?.faculty || "";
}
