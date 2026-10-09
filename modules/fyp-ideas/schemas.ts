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
  score: z.coerce.number().default(0),
  maxScore: z.coerce.number().default(10),
  summary: z.string().default(""),
  feedback: z.array(z.string()).default([]),
  action: z.string().default(""),
})

const createBoundedScoreSchema = (max: number) =>
  detailedScoreSchema.extend({
    score: z.coerce
      .number()
      .transform((val) => Math.max(0, Math.min(max, Math.round(val)))),
    maxScore: z.coerce.number().default(max),
    feedback: z.array(z.string()).min(1).default(["No specific feedback provided."]),
  })

export const scoringBreakdownSchema = z.object({
  problemClarityRelevance: createBoundedScoreSchema(20),
  ideaExplanationUsability: createBoundedScoreSchema(20),
  keyFeaturesCompleteness: createBoundedScoreSchema(15),
  feasibilityResources: createBoundedScoreSchema(10),
  originalityNovelty: createBoundedScoreSchema(10),
  impactUsefulness: createBoundedScoreSchema(10),
  improvementPotential: createBoundedScoreSchema(15),
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
  feasibilityScore: z.coerce
    .number()
    .transform((val) => Math.max(1, Math.min(10, Math.round(val)))),
  originalityScore: z.coerce
    .number()
    .transform((val) => Math.max(1, Math.min(10, Math.round(val)))),
  usefulnessScore: z.coerce
    .number()
    .transform((val) => Math.max(1, Math.min(10, Math.round(val)))),
  difficultyLevel: z.enum(["easy", "moderate", "challenging"]).catch("moderate"),
  estimatedTimeline: z.string().default("4-6 months"),
  teamFit: z.string().default("2-3 students"),
  whoWillUseIt: z.string().default("Students and faculty"),
  whyItMatters: z.string().default("Addresses an important workflow problem"),
  originalityVerdict: z
    .enum(["appears_unique", "some_overlap", "very_similar", "already_done"])
    .catch("some_overlap"),
  originalityReason: z.string().default(""),
  pastIdeaComparisonSummary: z.string().default(""),
  uniquenessImprovements: z.array(z.string()).min(1).default(["Add specialized features"]),
  strongPoints: z.array(z.string()).min(1).default(["Clear problem domain"]),
  concernPoints: z.array(z.string()).min(1).default(["Scope could be refined"]),
  riskReductionSteps: z.array(z.string()).min(1).default(["Start with MVP"]),
  simpleTechDirection: z.array(z.string()).min(1).default(["Standard web or mobile stack"]),
  simpleNextSteps: z.array(z.string()).min(1).default(["Finalize team and requirements"]),
  roadmap: z.array(roadmapPhaseSchema).min(1),
  elevatorPitch: z.string().default(""),
  plainLanguageAdvice: z.array(z.string()).min(1).default(["Focus on building the core workflow first."]),
  similarPastIdeas: z.array(similarPastIdeaSchema).default([]),
})

export const legacyValidationReportSchema = validationReportBaseSchema

export const defenseQuestionSchema = z.object({
  question: z.string().default(""),
  suggestedAnswerStrategy: z.string().default(""),
})

export const hardwareRequirementSchema = z.object({
  isSoftwareOnly: z.boolean().default(true),
  estimatedCost: z.string().default("$0 (Free cloud tier viable)"),
  notes: z.string().default("Standard software development stack."),
})

export type DefenseQuestion = z.infer<typeof defenseQuestionSchema>
export type HardwareRequirement = z.infer<typeof hardwareRequirementSchema>

export const validationReportSchema = validationReportBaseSchema.extend({
  finalScore: z.coerce
    .number()
    .transform((val) => Math.max(0, Math.min(100, Math.round(val)))),
  scoringBreakdown: scoringBreakdownSchema,
  advancedFeatureSuggestions: z.array(z.string()).default([]),
  mvpRecommendations: z.array(z.string()).default([]),
  roadmapPriorities: z.array(z.string()).default([]),
  readinessTier: z
    .enum(["defense_ready", "refinement_required", "high_risk"])
    .catch("refinement_required")
    .default("refinement_required"),
  goldenDirective: z.string().default(""),
  defenseQuestions: z.array(defenseQuestionSchema).default([]),
  hardwareRequirement: hardwareRequirementSchema.default({
    isSoftwareOnly: true,
    estimatedCost: "$0 (Free cloud tier viable)",
    notes: "Standard software development stack.",
  }),
})

export type RoadmapPhase = z.infer<typeof roadmapPhaseSchema>
export type SimilarPastIdea = z.infer<typeof similarPastIdeaSchema>
export type DetailedScore = z.infer<typeof detailedScoreSchema>
export type ScoringBreakdown = z.infer<typeof scoringBreakdownSchema>
export type ValidationReport = z.infer<typeof validationReportSchema>

