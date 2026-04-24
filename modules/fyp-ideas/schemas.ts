import { z } from "zod"

export const ideaInputSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, "Title must be at least 5 characters")
    .max(200, "Title must be at most 200 characters"),
  problemStatement: z
    .string()
    .trim()
    .min(20, "Problem statement must be at least 20 characters")
    .max(500, "Problem statement must be at most 500 characters"),
  ideaDescription: z
    .string()
    .trim()
    .min(50, "Idea description must be at least 50 characters")
    .max(2000, "Idea description must be at most 2000 characters"),
  coreFeatures: z
    .string()
    .trim()
    .min(20, "Core features must be at least 20 characters")
    .max(1000, "Core features must be at most 1000 characters"),
  teamSize: z
    .number()
    .int()
    .min(1, "Team size must be at least 1")
    .max(6, "Team size must be at most 6")
    .nullable()
    .optional()
    .transform((value) => value ?? null),
})

export type IdeaInput = z.infer<typeof ideaInputSchema>

export const roadmapPhaseSchema = z.object({
  phase: z.string(),
  duration: z.string(),
  tasks: z.array(z.string()).min(1),
})

export const similarPastIdeaSchema = z.object({
  title: z.string(),
  batch: z.string(),
  groupNumber: z.number().int().nonnegative(),
  supervisor: z.string().nullable(),
  similarityScore: z.number().min(0).max(10),
  similarityReason: z.string(),
  keyDifference: z.string(),
})

export const validationReportSchema = z.object({
  plainSummary: z.string(),
  shouldBuild: z.string(),
  recommendation: z.enum([
    "Strongly Recommended",
    "Recommended with Changes",
    "Needs Major Revision",
    "Not Recommended",
  ]),
  feasibilityScore: z.number().min(1).max(10),
  originalityScore: z.number().min(1).max(10),
  usefulnessScore: z.number().min(1).max(10),
  difficultyLevel: z.enum(["easy", "moderate", "challenging"]),
  estimatedTimeline: z.string(),
  teamFit: z.string(),
  whoWillUseIt: z.string(),
  whyItMatters: z.string(),
  originalityVerdict: z.enum([
    "appears_unique",
    "some_overlap",
    "very_similar",
    "already_done",
  ]),
  originalityReason: z.string(),
  pastIdeaComparisonSummary: z.string(),
  uniquenessImprovements: z.array(z.string()).min(1),
  strongPoints: z.array(z.string()).min(1),
  concernPoints: z.array(z.string()).min(1),
  riskReductionSteps: z.array(z.string()).min(1),
  simpleTechDirection: z.array(z.string()).min(1),
  simpleNextSteps: z.array(z.string()).min(1),
  roadmap: z.array(roadmapPhaseSchema).min(3).max(5),
  elevatorPitch: z.string(),
  plainLanguageAdvice: z.array(z.string()).min(1),
  similarPastIdeas: z.array(similarPastIdeaSchema).max(3),
})

export type RoadmapPhase = z.infer<typeof roadmapPhaseSchema>
export type SimilarPastIdea = z.infer<typeof similarPastIdeaSchema>
export type ValidationReport = z.infer<typeof validationReportSchema>
