// services/fypIdeas.service.ts

/**
 * FYP Ideas Service — Client API Layer
 * -------------------------------------
 * Pure API contract layer. No React, no hooks, no caching.
 */

/* ---------- TYPES ---------- */

export interface IdeaInput {
  title: string
  problemStatement: string
  ideaDescription: string
  coreFeatures: string
  teamSize?: number | null
}

export interface RoadmapPhase {
  phase: string
  duration: string
  tasks: string[]
}

export interface PanelEvaluation {
  ideaInterpreter: {
    domain: string
    impliedTechnologies: string[]
    expectedArchitecture: string
    systemScope: "small" | "medium" | "large"
    targetUsers: string
    coreProblemRestated: string
  }
  technicalEvaluator: {
    feasibilityScore: number
    feasibilityReasoning: string
    difficultyLevel: "beginner" | "intermediate" | "advanced"
    requiredSkills: string[]
    estimatedWeeks: number
    technicalChallenges: string[]
    suggestedTechStack: string[]
  }
  industryEvaluator: {
    industryRelevanceScore: number
    industryRelevanceReasoning: string
    trendAlignment: "outdated" | "current" | "emerging"
    realWorldApplicability: "low" | "medium" | "high"
    similarExistingProducts: string[]
    marketPotential: string
  }
  academicEvaluator: {
    fypSuitabilityScore: number
    fypSuitabilityReasoning: string
    innovationScore: number
    innovationReasoning: string
    researchDepth: "shallow" | "moderate" | "deep"
    academicStrengths: string[]
    academicWeaknesses: string[]
  }
  riskCritic: {
    riskLevel: "low" | "medium" | "high"
    hiddenChallenges: string[]
    unrealisticAssumptions: string[]
    potentialFailurePoints: string[]
    mitigationSuggestions: string[]
  }
}

export interface SynthesizerResult {
  feasibilityScore: number
  feasibilityReasoning: string
  innovationScore: number
  innovationReasoning: string
  difficultyLevel: "beginner" | "intermediate" | "advanced"
  industryRelevanceScore: number
  industryRelevanceReasoning: string
  requiredSkills: string[]
  riskFactors: string[]
  technologySuggestions: string[]
  technologyJustification: string
  implementationRoadmap: RoadmapPhase[]
  teamSizeSuitability: string
  projectScopeRealism: "realistic" | "ambitious" | "unrealistic"
  scopeRecommendation: string
  improvementSuggestions: string[]
  summaryEvaluation: string
  finalRecommendation:
    | "Strongly Recommended"
    | "Recommended with Changes"
    | "Needs Major Revision"
    | "Not Recommended"
}

export interface ValidationResult {
  id: string
  status: "pending" | "completed" | "failed"
  feasibilityScore: number | null
  innovationScore: number | null
  industryRelevanceScore: number | null
  recommendation: string | null
  panelEvaluation: PanelEvaluation | null
  finalResult: SynthesizerResult | null
  tokensUsed: number
  modelUsed: string | null
  latencyMs: number | null
  createdAt: string
}

export interface ValidationHistoryResponse {
  items: ValidationResult[]
  total: number
  remainingToday: number
  limit: number
  offset: number
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  errors?: { field: string; message: string }[]
}

/* ---------- API FUNCTIONS ---------- */

export async function validateIdea(input: IdeaInput): Promise<ValidationResult> {
  const response = await fetch("/api/fyp-ideas/validate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  })

  const json: ApiResponse<ValidationResult> = await response.json()

  if (!response.ok) {
    throw new Error(json.message || "Failed to validate idea")
  }

  return json.data
}

export async function getMyValidations(
  limit = 10,
  offset = 0
): Promise<ValidationHistoryResponse> {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  })

  const response = await fetch(`/api/fyp-ideas/my-validations?${params}`, {
    method: "GET",
    credentials: "include",
  })

  const json: ApiResponse<ValidationHistoryResponse> = await response.json()

  if (!response.ok) {
    throw new Error(json.message || "Failed to fetch validations")
  }

  return json.data
}
