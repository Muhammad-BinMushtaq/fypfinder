// modules/fyp-ideas/schemas.ts

/**
 * FYP Idea Validator — Zod Schemas
 * --------------------------------
 * Validates student input and LLM output shapes.
 * Shared between API route (input) and service layer (LLM output).
 */

import { z } from "zod"

// =====================
// Input Validation
// =====================

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
    .transform((v) => v ?? null),
})

export type IdeaInput = z.infer<typeof ideaInputSchema>

// =====================
// LLM Output Validation — Call 1 (Panel)
// =====================

const ideaInterpreterSchema = z.object({
  domain: z.string(),
  impliedTechnologies: z.array(z.string()),
  expectedArchitecture: z.string(),
  systemScope: z.enum(["small", "medium", "large"]),
  targetUsers: z.string(),
  coreProblemRestated: z.string(),
})

const technicalEvaluatorSchema = z.object({
  feasibilityScore: z.number().min(1).max(10),
  difficultyLevel: z.enum(["beginner", "intermediate", "advanced"]),
  requiredSkills: z.array(z.string()).min(1),
  estimatedWeeks: z.number().min(1),
  technicalChallenges: z.array(z.string()).min(1),
  suggestedTechStack: z.array(z.string()).min(1),
})

const industryEvaluatorSchema = z.object({
  industryRelevanceScore: z.number().min(1).max(10),
  trendAlignment: z.enum(["outdated", "current", "emerging"]),
  realWorldApplicability: z.enum(["low", "medium", "high"]),
  similarExistingProducts: z.array(z.string()),
  marketPotential: z.string(),
})

const academicEvaluatorSchema = z.object({
  fypSuitabilityScore: z.number().min(1).max(10),
  innovationScore: z.number().min(1).max(10),
  researchDepth: z.enum(["shallow", "moderate", "deep"]),
  academicStrengths: z.array(z.string()).min(1),
  academicWeaknesses: z.array(z.string()).min(1),
})

const riskCriticSchema = z.object({
  riskLevel: z.enum(["low", "medium", "high"]),
  hiddenChallenges: z.array(z.string()).min(1),
  unrealisticAssumptions: z.array(z.string()).min(1),
  potentialFailurePoints: z.array(z.string()).min(1),
  mitigationSuggestions: z.array(z.string()).min(1),
})

export const panelOutputSchema = z.object({
  ideaInterpreter: ideaInterpreterSchema,
  technicalEvaluator: technicalEvaluatorSchema,
  industryEvaluator: industryEvaluatorSchema,
  academicEvaluator: academicEvaluatorSchema,
  riskCritic: riskCriticSchema,
})

export type PanelOutput = z.infer<typeof panelOutputSchema>

// =====================
// LLM Output Validation — Call 2 (Synthesizer)
// =====================

const roadmapPhaseSchema = z.object({
  phase: z.string(),
  duration: z.string(),
  tasks: z.array(z.string()).min(1),
})

export const synthesizerOutputSchema = z.object({
  feasibilityScore: z.number().min(1).max(10),
  innovationScore: z.number().min(1).max(10),
  difficultyLevel: z.enum(["beginner", "intermediate", "advanced"]),
  industryRelevanceScore: z.number().min(1).max(10),
  requiredSkills: z.array(z.string()).min(1),
  riskFactors: z.array(z.string()).min(1),
  technologySuggestions: z.array(z.string()).min(1),
  implementationRoadmap: z.array(roadmapPhaseSchema).min(1),
  teamSizeSuitability: z.string(),
  projectScopeRealism: z.enum(["realistic", "ambitious", "unrealistic"]),
  summaryEvaluation: z.string(),
  finalRecommendation: z.enum([
    "Strongly Recommended",
    "Recommended with Changes",
    "Needs Major Revision",
    "Not Recommended",
  ]),
})

export type SynthesizerOutput = z.infer<typeof synthesizerOutputSchema>
