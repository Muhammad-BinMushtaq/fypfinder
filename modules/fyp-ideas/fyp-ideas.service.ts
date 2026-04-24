import crypto from "crypto"
import { z } from "zod"
import { Prisma } from "@/lib/generated/prisma/client"
import prisma from "@/lib/db"
import { logger } from "@/lib/logger"
import { groqChatWithFallback, parseGroqJson } from "./groq-client"
import { findSimilarPastIdeas } from "./past-ideas"
import { buildValidatorSystemPrompt, buildValidatorUserPrompt } from "./prompts"
import {
  type IdeaInput,
  type ValidationReport,
  legacyValidationReportSchema,
  validationReportSchema,
} from "./schemas"

const MAX_VALIDATIONS_PER_DAY = 3
const SINGLE_CALL_MAX_TOKENS = 5000

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
  createdAt: Date
}

export type StudentFacingValidationResult = Omit<
  ValidationResult,
  "tokensUsed" | "modelUsed" | "latencyMs"
>

interface ValidateIdeaOptions {
  studentId?: string | null
  accessMode: "student" | "guest"
}

const GUEST_HIDDEN_SECTIONS = [
  "Detailed roadmap",
  "Detailed risk reduction plan",
  "Simple tech direction",
  "Long-form advice",
  "Full elevator pitch",
] as const

export async function validateIdea(
  input: IdeaInput,
  options: ValidateIdeaOptions
): Promise<ValidationResult> {
  const isStudent = options.accessMode === "student" && Boolean(options.studentId)
  const studentId = options.studentId ?? null

  if (isStudent && studentId) {
    const inputHash = computeInputHash(input)
    const existing = await findExistingValidation(studentId, inputHash)
    const cached = existing && existing.status === "COMPLETED"
      ? formatStoredValidation(existing, "student")
      : null

    if (cached) {
      return cached
    }

    await enforceStudentRateLimit(studentId)

    const record = existing
      ? await resetExistingValidation(existing.id, input, inputHash)
      : await prisma.fYPIdeaValidation.create({
          data: {
            studentId,
            title: input.title,
            problemStatement: input.problemStatement,
            ideaDescription: input.ideaDescription,
            coreFeatures: input.coreFeatures,
            teamSize: input.teamSize,
            inputHash,
            status: "PENDING",
          },
        })

    try {
      const reportResult = await generateValidationReport(input)
      const recommendation = mapRecommendation(reportResult.report.recommendation)

      const updated = await prisma.fYPIdeaValidation.update({
        where: { id: record.id },
        data: {
          panelEvaluation: Prisma.DbNull,
          finalResult: JSON.parse(JSON.stringify(reportResult.report)),
          detailedRoadmap: JSON.parse(JSON.stringify(reportResult.report.roadmap)),
          feasibilityScore: reportResult.report.feasibilityScore,
          innovationScore: reportResult.report.originalityScore,
          industryRelevanceScore: reportResult.report.usefulnessScore,
          originalityScore: reportResult.report.originalityScore,
          usefulnessScore: reportResult.report.usefulnessScore,
          recommendation,
          status: "COMPLETED",
          modelUsed: reportResult.modelUsed,
          tokensUsed: reportResult.tokensUsed,
          latencyMs: reportResult.latencyMs,
          errorMessage: null,
        },
      })

      return formatStoredValidation(updated, "student")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      logger.error("Student idea validation failed:", error)

      await prisma.fYPIdeaValidation.update({
        where: { id: record.id },
        data: {
          status: "FAILED",
          errorMessage,
        },
      })

      throw new Error(`Validation failed: ${errorMessage}`)
    }
  }

  const guestResult = await generateValidationReport(input)
  return buildGuestPreviewResult(guestResult)
}

export async function getStudentValidations(studentId: string, limit = 10, offset = 0) {
  const [validations, total] = await Promise.all([
    prisma.fYPIdeaValidation.findMany({
      where: { studentId, status: "COMPLETED" },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.fYPIdeaValidation.count({
      where: { studentId, status: "COMPLETED" },
    }),
  ])

  return {
    items: validations.map((record) => formatStoredValidation(record, "student")),
    total,
    limit,
    offset,
  }
}

export async function getRemainingValidations(studentId: string): Promise<number> {
  const todayCount = await getStudentValidationCountToday(studentId)
  return Math.max(0, MAX_VALIDATIONS_PER_DAY - todayCount)
}

export function toStudentFacingValidationResult(
  result: ValidationResult
): StudentFacingValidationResult {
  const { tokensUsed, modelUsed, latencyMs, ...studentFacingResult } = result
  return studentFacingResult
}

async function generateValidationReport(input: IdeaInput) {
  const similarIdeas = await findSimilarPastIdeas(input, 3)
  const systemPrompt = buildValidatorSystemPrompt()
  const userPrompt = buildValidatorUserPrompt(
    {
      title: input.title,
      problemStatement: truncate(input.problemStatement, 500),
      ideaDescription: truncate(input.ideaDescription, 1200),
      coreFeatures: truncate(input.coreFeatures, 700),
      teamSize: input.teamSize,
    },
    similarIdeas
  )

  const result = await groqChatWithFallback(systemPrompt, userPrompt, SINGLE_CALL_MAX_TOKENS, {
    validateResponse: (content) => {
      parseValidationReport(content)
    },
  })

  const report = parseValidationReport(result.content)

  return {
    report,
    tokensUsed: result.tokensUsed,
    modelUsed: result.modelUsed,
    latencyMs: result.latencyMs,
  }
}

async function enforceStudentRateLimit(studentId: string): Promise<void> {
  const todayCount = await getStudentValidationCountToday(studentId)

  if (todayCount >= MAX_VALIDATIONS_PER_DAY) {
    throw new Error(
      `Daily limit reached. You can validate up to ${MAX_VALIDATIONS_PER_DAY} ideas per day.`
    )
  }
}

async function getStudentValidationCountToday(studentId: string): Promise<number> {
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)

  return prisma.fYPIdeaValidation.count({
    where: {
      studentId,
      createdAt: { gte: startOfDay },
    },
  })
}

function computeInputHash(input: IdeaInput): string {
  const normalized = [
    input.title.toLowerCase().trim(),
    input.problemStatement.toLowerCase().trim(),
    input.ideaDescription.toLowerCase().trim(),
    input.coreFeatures.toLowerCase().trim(),
  ].join("|")

  return crypto.createHash("sha256").update(normalized).digest("hex")
}

async function findExistingValidation(studentId: string, inputHash: string) {
  return prisma.fYPIdeaValidation.findFirst({
    where: {
      studentId,
      inputHash,
    },
    orderBy: { createdAt: "desc" },
  })
}

async function resetExistingValidation(id: string, input: IdeaInput, inputHash: string) {
  return prisma.fYPIdeaValidation.update({
    where: { id },
    data: {
      title: input.title,
      problemStatement: input.problemStatement,
      ideaDescription: input.ideaDescription,
      coreFeatures: input.coreFeatures,
      teamSize: input.teamSize,
      inputHash,
      panelEvaluation: Prisma.DbNull,
      finalResult: Prisma.DbNull,
      detailedRoadmap: Prisma.DbNull,
      feasibilityScore: null,
      innovationScore: null,
      industryRelevanceScore: null,
      originalityScore: null,
      usefulnessScore: null,
      recommendation: null,
      status: "PENDING",
      modelUsed: null,
      tokensUsed: 0,
      latencyMs: null,
      errorMessage: null,
      createdAt: new Date(),
    },
  })
}

function parseValidationReport(raw: string): ValidationReport {
  const parsed = parseGroqJson<unknown>(raw)
  const result = validationReportSchema.safeParse(parsed)

  if (!result.success) {
    logger.error("Validation report schema check failed:", result.error.issues)
    throw new Error("AI validation response had an invalid structure")
  }

  return normalizeValidationReport(result.data)
}

function buildGuestPreviewResult(result: {
  report: ValidationReport
  tokensUsed: number
  modelUsed: string
  latencyMs: number
}): ValidationResult {
  const previewReport: ValidationReport = {
    ...result.report,
    riskReductionSteps: [],
    simpleTechDirection: [],
    plainLanguageAdvice: result.report.plainLanguageAdvice.slice(0, 2),
    roadmap: result.report.roadmap.slice(0, 2).map((phase) => ({
      ...phase,
      tasks: phase.tasks.slice(0, 1),
    })),
    elevatorPitch: "Sign up to unlock the polished project pitch for this idea.",
    similarPastIdeas: result.report.similarPastIdeas.map((idea) => ({
      ...idea,
      supervisor: null,
    })),
  }

  return {
    id: crypto.randomUUID(),
    status: "completed",
    recommendation: mapRecommendation(result.report.recommendation),
    feasibilityScore: result.report.feasibilityScore,
    originalityScore: result.report.originalityScore,
    usefulnessScore: result.report.usefulnessScore,
    report: previewReport,
    previewLocked: true,
    accessMode: "guest",
    hiddenSections: [...GUEST_HIDDEN_SECTIONS],
    tokensUsed: result.tokensUsed,
    modelUsed: result.modelUsed,
    latencyMs: result.latencyMs,
    createdAt: new Date(),
  }
}

function formatStoredValidation(
  record: {
    id: string
    status: string
    recommendation: string | null
    feasibilityScore: number | null
    originalityScore: number | null
    usefulnessScore: number | null
    finalResult: unknown
    tokensUsed: number
    modelUsed: string | null
    latencyMs: number | null
    createdAt: Date
  },
  accessMode: "student" | "guest"
): ValidationResult {
  const report = parseStoredReport(record.finalResult)

  return {
    id: record.id,
    status: normalizeStatus(record.status),
    recommendation: record.recommendation,
    feasibilityScore: record.feasibilityScore,
    originalityScore: record.originalityScore,
    usefulnessScore: record.usefulnessScore,
    report,
    previewLocked: accessMode === "guest",
    accessMode,
    hiddenSections: accessMode === "guest" ? [...GUEST_HIDDEN_SECTIONS] : [],
    tokensUsed: record.tokensUsed,
    modelUsed: record.modelUsed,
    latencyMs: record.latencyMs,
    createdAt: record.createdAt,
  }
}

function parseStoredReport(value: unknown): ValidationReport | null {
  const parsed = validationReportSchema.safeParse(value)
  if (parsed.success) {
    return normalizeValidationReport(parsed.data)
  }

  const legacyParsed = legacyValidationReportSchema.safeParse(value)
  if (legacyParsed.success) {
    return upgradeLegacyReport(legacyParsed.data)
  }

  return null
}

function normalizeValidationReport(report: ValidationReport): ValidationReport {
  return {
    ...report,
    finalScore: computeFinalScore(report.scoringBreakdown),
  }
}

function computeFinalScore(report: ValidationReport["scoringBreakdown"]): number {
  return Math.max(
    0,
    Math.min(
      100,
      Math.round(
        report.problemClarityRelevance.score +
          report.ideaExplanationUsability.score +
          report.keyFeaturesCompleteness.score +
          report.feasibilityResources.score +
          report.originalityNovelty.score +
          report.impactUsefulness.score +
          report.improvementPotential.score
      )
    )
  )
}

function upgradeLegacyReport(
  report: z.infer<typeof legacyValidationReportSchema>
): ValidationReport {
  const feasibility = clampScore(report.feasibilityScore, 1, 10)
  const originality = clampScore(report.originalityScore, 1, 10)
  const usefulness = clampScore(report.usefulnessScore, 1, 10)
  const concernPenalty = Math.min(5, report.concernPoints.length)

  const upgraded: ValidationReport = {
    ...report,
    scoringBreakdown: {
      problemClarityRelevance: {
        score: clampScore(Math.round(usefulness * 1.7), 0, 20),
        maxScore: 20,
        summary: report.whyItMatters,
        feedback: report.strongPoints.slice(0, 3),
        action: report.simpleNextSteps[0] ?? "Clarify the exact problem and target users.",
      },
      ideaExplanationUsability: {
        score: clampScore(Math.round(usefulness * 1.6), 0, 20),
        maxScore: 20,
        summary: report.whoWillUseIt,
        feedback: report.plainLanguageAdvice.slice(0, 3),
        action: report.simpleNextSteps[1] ?? "Explain the main user flow in simple steps.",
      },
      keyFeaturesCompleteness: {
        score: clampScore(Math.round((feasibility + usefulness) * 0.75) - concernPenalty, 0, 15),
        maxScore: 15,
        summary: "The previous report listed the main feature direction but did not use the newer detailed rubric.",
        feedback: report.concernPoints.slice(0, 3),
        action: "Group features into must-have, should-have, and later enhancements.",
      },
      feasibilityResources: {
        score: feasibility,
        maxScore: 10,
        summary: report.teamFit,
        feedback: report.riskReductionSteps.slice(0, 3),
        action: report.riskReductionSteps[0] ?? "Reduce the first version to a buildable MVP.",
      },
      originalityNovelty: {
        score: originality,
        maxScore: 10,
        summary: report.originalityReason,
        feedback: report.uniquenessImprovements.slice(0, 3),
        action: report.uniquenessImprovements[0] ?? "Add a clear differentiator from past projects.",
      },
      impactUsefulness: {
        score: usefulness,
        maxScore: 10,
        summary: report.whyItMatters,
        feedback: report.strongPoints.slice(0, 3),
        action: report.simpleNextSteps[2] ?? "Validate usefulness with likely users.",
      },
      improvementPotential: {
        score: clampScore(Math.round((feasibility + originality + usefulness) / 2), 0, 15),
        maxScore: 15,
        summary: "This score was estimated from the earlier report format.",
        feedback: report.uniquenessImprovements.slice(0, 3),
        action: "Turn the improvement ideas into a short build roadmap.",
      },
    },
    finalScore: 0,
    advancedFeatureSuggestions: getDefaultAdvancedFeatureSuggestions(),
    mvpRecommendations: report.simpleNextSteps.slice(0, 5),
    roadmapPriorities: report.roadmap.map((phase) => `${phase.phase}: ${phase.tasks[0]}`).slice(0, 5),
  }

  return normalizeValidationReport(upgraded)
}

function clampScore(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function getDefaultAdvancedFeatureSuggestions(): string[] {
  return [
    "Personalized AI recommendations for study times, learning paths, or next actions.",
    "Calendar integration with reminders, deadlines, and notification preferences.",
    "Offline data storage for core workflows when internet access is weak.",
    "Customizable app monitoring or distraction controls for focused sessions.",
    "Privacy controls with export, consent, and account data deletion options.",
    "Gamification through badges, goals, streaks, and milestone progress.",
    "Teacher or mentor dashboards for review, feedback, and student progress tracking.",
  ]
}

function mapRecommendation(
  recommendation: ValidationReport["recommendation"]
): "STRONGLY_RECOMMENDED" | "RECOMMENDED_WITH_CHANGES" | "NEEDS_MAJOR_REVISION" | "NOT_RECOMMENDED" {
  const map = {
    "Strongly Recommended": "STRONGLY_RECOMMENDED",
    "Recommended with Changes": "RECOMMENDED_WITH_CHANGES",
    "Needs Major Revision": "NEEDS_MAJOR_REVISION",
    "Not Recommended": "NOT_RECOMMENDED",
  } as const

  return map[recommendation]
}

function normalizeStatus(status: string): ValidationResult["status"] {
  switch (status) {
    case "COMPLETED":
    case "completed":
      return "completed"
    case "FAILED":
    case "failed":
      return "failed"
    default:
      return "pending"
  }
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text
  }

  return `${text.slice(0, maxLength - 3)}...`
}
