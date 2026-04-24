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

export interface SimilarPastIdea {
  title: string
  batch: string
  groupNumber: number
  supervisor: string | null
  similarityScore: number
  similarityReason: string
  keyDifference: string
}

export interface ValidationReport {
  plainSummary: string
  shouldBuild: string
  recommendation:
    | "Strongly Recommended"
    | "Recommended with Changes"
    | "Needs Major Revision"
    | "Not Recommended"
  feasibilityScore: number
  originalityScore: number
  usefulnessScore: number
  difficultyLevel: "easy" | "moderate" | "challenging"
  estimatedTimeline: string
  teamFit: string
  whoWillUseIt: string
  whyItMatters: string
  originalityVerdict: "appears_unique" | "some_overlap" | "very_similar" | "already_done"
  originalityReason: string
  pastIdeaComparisonSummary: string
  uniquenessImprovements: string[]
  strongPoints: string[]
  concernPoints: string[]
  riskReductionSteps: string[]
  simpleTechDirection: string[]
  simpleNextSteps: string[]
  roadmap: RoadmapPhase[]
  elevatorPitch: string
  plainLanguageAdvice: string[]
  similarPastIdeas: SimilarPastIdea[]
}

export interface ValidationResult {
  id: string
  status: "pending" | "completed" | "failed"
  recommendation: string | null
  feasibilityScore: number | null
  originalityScore: number | null
  usefulnessScore: number | null
  report: ValidationReport | null
  previewLocked: boolean
  accessMode: "student" | "guest"
  hiddenSections: string[]
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
