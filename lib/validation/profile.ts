// lib/validation/profile.ts
/**
 * Server-side validation for student profile + project payloads.
 * Prevents non-http(s) URLs (e.g. `javascript:`), oversized fields and
 * arbitrary enum values from being persisted.
 */
import { z } from "zod";
import {
  AVAILABLE_ROLES,
  MAX_PRIMARY_ROLES,
  PROFILE_LIMITS,
  SEEKING_STATUS_VALUES,
} from "@/lib/profile-constants";

/** True only for absolute http/https URLs. */
export function isSafeHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function hostMatches(value: string, domain: string): boolean {
  try {
    const host = new URL(value).hostname.toLowerCase();
    return host === domain || host.endsWith(`.${domain}`);
  } catch {
    return false;
  }
}

/** Optional URL: empty string allowed (= clear), otherwise must be http(s). */
const optionalUrl = (domain?: string, label = "URL") =>
  z
    .string()
    .trim()
    .max(PROFILE_LIMITS.url, `${label} is too long`)
    .refine((v) => v === "" || isSafeHttpUrl(v), `${label} must start with http:// or https://`)
    .refine((v) => v === "" || !domain || hostMatches(v, domain), `${label} must be a ${domain} link`)
    .optional();

const optionalText = (max: number, label: string) =>
  z.string().trim().max(max, `${label} must be at most ${max} characters`).optional();

export const profileUpdateSchema = z.object({
  currentSemester: z.number().int().min(1).max(8).optional(),
  profilePicture: z
    .string()
    .trim()
    .refine((v) => v === "" || isSafeHttpUrl(v), "Invalid profile picture URL")
    .optional(),
  interests: optionalText(PROFILE_LIMITS.bio, "Bio"),
  phone: z
    .string()
    .trim()
    .max(PROFILE_LIMITS.phone, "Phone number is too long")
    .refine((v) => v === "" || /^[+\d][\d\s-]{5,}$/.test(v), "Invalid phone number")
    .optional(),
  linkedinUrl: optionalUrl("linkedin.com", "LinkedIn URL"),
  githubUrl: optionalUrl("github.com", "GitHub URL"),
  availability: z.enum(["AVAILABLE", "BUSY", "AWAY"]).optional(),
  careerGoal: optionalText(PROFILE_LIMITS.careerGoal, "Career goal"),
  hobbies: optionalText(PROFILE_LIMITS.hobbies, "Hobbies"),
  preferredTechStack: optionalText(PROFILE_LIMITS.techStack, "Tech stack"),
  fypIndustry: z.string().trim().max(60).optional(),
  primaryRoles: z
    .array(z.enum(AVAILABLE_ROLES))
    .max(MAX_PRIMARY_ROLES, `Select at most ${MAX_PRIMARY_ROLES} roles`)
    .optional(),
  seekingStatus: z.enum(SEEKING_STATUS_VALUES).optional(),
  onboardingCompleted: z.boolean().optional(),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

const EMBED_TYPES = ["NONE", "GITHUB", "PDF", "DEMO"] as const;

const projectBase = {
  name: z.string().trim().min(1, "Project name is required").max(PROFILE_LIMITS.projectName),
  description: optionalText(PROFILE_LIMITS.projectDescription, "Description"),
  liveLink: optionalUrl(undefined, "Live link"),
  githubLink: optionalUrl("github.com", "GitHub link"),
  embedType: z.enum(EMBED_TYPES).nullable().optional(),
  embedUrl: z
    .string()
    .trim()
    .max(PROFILE_LIMITS.url)
    .refine((v) => v === "" || isSafeHttpUrl(v), "Embed URL must start with http:// or https://")
    .nullable()
    .optional(),
  mediaMetadata: z.unknown().optional(),
};

export const projectCreateSchema = z.object({
  ...projectBase,
  githubLink: z
    .string()
    .trim()
    .min(1, "GitHub repository URL is required")
    .max(PROFILE_LIMITS.url)
    .refine(isSafeHttpUrl, "GitHub URL must start with http:// or https://")
    .refine((v) => hostMatches(v, "github.com"), "GitHub URL must be a github.com link"),
});

export const projectUpdateSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  ...projectBase,
  name: projectBase.name.optional(),
});

/** Returns the first human-readable validation message. */
export function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Invalid input";
}
