// lib/profile-constants.ts
/**
 * Shared (server + client safe) constants for student profiles.
 * Keep this file free of React / "use client" imports so API routes can use it.
 */

export const AVAILABLE_ROLES = [
  "Frontend Lead",
  "Backend Dev",
  "AI/ML Specialist",
  "UI/UX Designer",
  "IoT/Embedded Lead",
  "Mobile Dev",
  "Cybersecurity",
  "Full Stack",
] as const;

export const MAX_PRIMARY_ROLES = 2;

export const SEEKING_STATUS_OPTIONS = [
  { value: "LOOKING_FOR_TEAM", label: "Looking for a team" },
  { value: "HAS_TEAM_LOOKING_FOR_MEMBERS", label: "Have a team, need members" },
  { value: "NOT_LOOKING", label: "Not looking right now" },
] as const;

export const SEEKING_STATUS_VALUES = SEEKING_STATUS_OPTIONS.map((o) => o.value) as [
  string,
  ...string[]
];

export function getSeekingStatusLabel(value?: string | null): string {
  return SEEKING_STATUS_OPTIONS.find((o) => o.value === value)?.label ?? "Looking for a team";
}

export const AVAILABILITY_OPTIONS = [
  { value: "AVAILABLE", label: "Available", dot: "bg-emerald-500" },
  { value: "BUSY", label: "Busy", dot: "bg-amber-500" },
  { value: "AWAY", label: "Away", dot: "bg-slate-400" },
] as const;

/** Field length limits (shared by UI maxLength and server validation) */
export const PROFILE_LIMITS = {
  bio: 600,
  careerGoal: 150,
  hobbies: 150,
  techStack: 200,
  phone: 20,
  url: 300,
  projectName: 100,
  projectDescription: 1000,
} as const;
