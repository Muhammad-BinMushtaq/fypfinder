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

export const extractedIdeaFieldsSchema = z.object({
  title: z.string().trim().default(""),
  problemStatement: z.string().trim().default(""),
  proposedSolution: z.string().trim().default(""),
  description: z.string().trim().default(""),
  projectSummary: z.string().trim().default(""),
  department: z.string().trim().default(""),
  domain: z.string().trim().default(""),
  category: z.string().trim().default(""),
  technologies: z.array(z.string().trim()).default([]),
  techStack: z.array(z.string().trim()).default([]),
  aiUsage: z.string().trim().default(""),
  apis: z.array(z.string().trim()).default([]),
  platforms: z.array(z.string().trim()).default([]),
  novelty: z.string().trim().default(""),
  innovation: z.string().trim().default(""),
  existingAlternatives: z.array(z.string().trim()).default([]),
  marketGap: z.string().trim().default(""),
  objectives: z.array(z.string().trim()).default([]),
  scope: z.string().trim().default(""),
  futureExpansion: z.string().trim().default(""),
  targetUsers: z.array(z.string().trim()).default([]),
})

export const extractedIdeaConfidenceSchema = z.object(
  Object.fromEntries(
    Object.keys(extractedIdeaFieldsSchema.shape).map((key) => [
      key,
      z.number().min(0).max(1).default(0),
    ])
  ) as Record<keyof z.infer<typeof extractedIdeaFieldsSchema>, z.ZodDefault<z.ZodNumber>>
)

export const extractedIdeaSchema = z.object({
  fields: extractedIdeaFieldsSchema,
  confidence: extractedIdeaConfidenceSchema,
  warnings: z.array(z.string().trim()).default([]),
})

export type ExtractedIdeaFields = z.infer<typeof extractedIdeaFieldsSchema>
export type ExtractedIdeaConfidence = z.infer<typeof extractedIdeaConfidenceSchema>
export type ExtractedIdea = z.infer<typeof extractedIdeaSchema>

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

export const detailedScoreSchema = z.object({
  score: z.number().min(0),
  maxScore: z.number().positive(),
  summary: z.string(),
  feedback: z.array(z.string()).min(1),
  action: z.string(),
})

export const scoringBreakdownSchema = z.object({
  problemClarityRelevance: detailedScoreSchema.extend({
    score: z.number().min(0).max(20),
    maxScore: z.literal(20),
  }),
  ideaExplanationUsability: detailedScoreSchema.extend({
    score: z.number().min(0).max(20),
    maxScore: z.literal(20),
  }),
  keyFeaturesCompleteness: detailedScoreSchema.extend({
    score: z.number().min(0).max(15),
    maxScore: z.literal(15),
  }),
  feasibilityResources: detailedScoreSchema.extend({
    score: z.number().min(0).max(10),
    maxScore: z.literal(10),
  }),
  originalityNovelty: detailedScoreSchema.extend({
    score: z.number().min(0).max(10),
    maxScore: z.literal(10),
  }),
  impactUsefulness: detailedScoreSchema.extend({
    score: z.number().min(0).max(10),
    maxScore: z.literal(10),
  }),
  improvementPotential: detailedScoreSchema.extend({
    score: z.number().min(0).max(15),
    maxScore: z.literal(15),
  }),
})

const validationReportBaseSchema = z.object({
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

export const legacyValidationReportSchema = validationReportBaseSchema

export const validationReportSchema = validationReportBaseSchema.extend({
  finalScore: z.number().min(0).max(100),
  scoringBreakdown: scoringBreakdownSchema,
  advancedFeatureSuggestions: z.array(z.string()).min(6).max(10),
  mvpRecommendations: z.array(z.string()).min(3).max(6),
  roadmapPriorities: z.array(z.string()).min(3).max(6),
})

export type RoadmapPhase = z.infer<typeof roadmapPhaseSchema>
export type SimilarPastIdea = z.infer<typeof similarPastIdeaSchema>
export type DetailedScore = z.infer<typeof detailedScoreSchema>
export type ScoringBreakdown = z.infer<typeof scoringBreakdownSchema>
export type ValidationReport = z.infer<typeof validationReportSchema>
