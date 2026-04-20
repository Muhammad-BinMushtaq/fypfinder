// modules/fyp-ideas/fyp-ideas.service.ts

/**
 * FYP Idea Validator — Service Layer
 * -----------------------------------
 * Orchestrates the full validation pipeline:
 * 1. Input preprocessing & hash
 * 2. Cache check (same idea → return cached result)
 * 3. Rate limit check (max 3 per student per day)
 * 4. Call 1: Panel evaluation (5 roles in one LLM call)
 * 5. Call 2: Final synthesis
 * 6. Persist to database
 *
 * This module is fully isolated. Failures here do not affect
 * messaging, discovery, or any other feature.
 */

import crypto from "crypto"
import prisma from "@/lib/db"
import { Prisma } from "@/lib/generated/prisma/client"
import { logger } from "@/lib/logger"
import { groqChatWithFallback, parseGroqJson } from "./groq-client"
import {
  buildPanelSystemPrompt,
  buildPanelUserPrompt,
  buildSynthesizerSystemPrompt,
  buildSynthesizerUserPrompt,
} from "./prompts"
import {
  type IdeaInput,
  type PanelOutput,
  type SynthesizerOutput,
  panelOutputSchema,
  synthesizerOutputSchema,
} from "./schemas"

const MAX_VALIDATIONS_PER_DAY = 3
const PANEL_MAX_TOKENS = 3000
const SYNTHESIZER_MAX_TOKENS = 1500

// =====================
// Public API
// =====================

export interface ValidationResult {
  id: string
  status: "pending" | "completed" | "failed"
  feasibilityScore: number | null
  innovationScore: number | null
  industryRelevanceScore: number | null
  recommendation: string | null
  panelEvaluation: PanelOutput | null
  finalResult: SynthesizerOutput | null
  tokensUsed: number
  modelUsed: string | null
  latencyMs: number | null
  createdAt: Date
}

/**
 * Run the full idea validation pipeline for a student.
 */
export async function validateIdea(
  studentId: string,
  input: IdeaInput
): Promise<ValidationResult> {
  // 1. Compute input hash and check cache first.
  // Cached results should not consume a fresh daily validation slot.
  const inputHash = computeInputHash(input)
  const existing = await findExistingValidation(studentId, inputHash)
  const cached = existing && existing.status === "COMPLETED"
    ? formatResult(existing)
    : null

  if (cached) return cached

  // 2. Check daily rate limit for new runs / retries.
  await enforceRateLimit(studentId)

  // 3. Create or reset the pending record.
  const record = existing
    ? await prisma.fYPIdeaValidation.update({
        where: { id: existing.id },
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
          recommendation: null,
          status: "PENDING",
          modelUsed: null,
          tokensUsed: 0,
          latencyMs: null,
          errorMessage: null,
          createdAt: new Date(),
        },
      })
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
    // 4. Call 1: Panel evaluation
    const panelSystem = buildPanelSystemPrompt()
    const panelUser = buildPanelUserPrompt({
      title: input.title,
      problemStatement: truncate(input.problemStatement, 400),
      ideaDescription: truncate(input.ideaDescription, 800),
      coreFeatures: truncate(input.coreFeatures, 500),
      teamSize: input.teamSize,
    })

    const panelResult = await groqChatWithFallback(
      panelSystem,
      panelUser,
      PANEL_MAX_TOKENS,
      {
        validateResponse: (content) => {
          parseAndValidatePanel(content)
        },
      }
    )
    const panelParsed = parseAndValidatePanel(panelResult.content)
    let totalTokens = panelResult.tokensUsed
    let totalLatencyMs = panelResult.latencyMs

    // 5. Call 2: Synthesizer
    const synthSystem = buildSynthesizerSystemPrompt()
    const synthUser = buildSynthesizerUserPrompt(JSON.stringify(panelParsed))

    const synthResult = await groqChatWithFallback(
      synthSystem,
      synthUser,
      SYNTHESIZER_MAX_TOKENS,
      {
        validateResponse: (content) => {
          parseAndValidateSynthesizer(content)
        },
      }
    )
    const synthParsed = parseAndValidateSynthesizer(synthResult.content)
    totalTokens += synthResult.tokensUsed
    totalLatencyMs += synthResult.latencyMs

    // 6. Map recommendation string to enum value
    const recommendation = mapRecommendation(synthParsed.finalRecommendation)
    const modelUsed = [
      `Panel: ${panelResult.modelUsed}`,
      `Synthesizer: ${synthResult.modelUsed}`,
    ].join(" | ")

    // 7. Persist completed result
    const updated = await prisma.fYPIdeaValidation.update({
      where: { id: record.id },
      data: {
        panelEvaluation: JSON.parse(JSON.stringify(panelParsed)),
        finalResult: JSON.parse(JSON.stringify(synthParsed)),
        feasibilityScore: synthParsed.feasibilityScore,
        innovationScore: synthParsed.innovationScore,
        industryRelevanceScore: synthParsed.industryRelevanceScore,
        recommendation,
        status: "COMPLETED",
        modelUsed,
        tokensUsed: totalTokens,
        latencyMs: totalLatencyMs,
      },
    })

    return formatResult(updated)
  } catch (error) {
    // Mark as failed but don't throw — let caller handle gracefully
    const errorMsg = error instanceof Error ? error.message : "Unknown error"
    logger.error("FYP idea validation failed:", error)

    await prisma.fYPIdeaValidation.update({
      where: { id: record.id },
      data: {
        status: "FAILED",
        errorMessage: errorMsg,
      },
    })

    throw new Error(`Validation failed: ${errorMsg}`)
  }
}

/**
 * Get all validation history for a student.
 */
export async function getStudentValidations(
  studentId: string,
  limit = 10,
  offset = 0
) {
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
    items: validations.map(formatResult),
    total,
    limit,
    offset,
  }
}

/**
 * Get remaining validations for today.
 */
export async function getRemainingValidations(studentId: string): Promise<number> {
  const todayCount = await getTodayCount(studentId)
  return Math.max(0, MAX_VALIDATIONS_PER_DAY - todayCount)
}

// =====================
// Internal Helpers
// =====================

async function enforceRateLimit(studentId: string): Promise<void> {
  const todayCount = await getTodayCount(studentId)
  if (todayCount >= MAX_VALIDATIONS_PER_DAY) {
    throw new Error(
      `Daily limit reached. You can validate up to ${MAX_VALIDATIONS_PER_DAY} ideas per day.`
    )
  }
}

async function getTodayCount(studentId: string): Promise<number> {
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

async function findExistingValidation(
  studentId: string,
  inputHash: string
){
  return prisma.fYPIdeaValidation.findFirst({
    where: {
      studentId,
      inputHash,
    },
    orderBy: { createdAt: "desc" },
  })
}

function parseAndValidatePanel(raw: string): PanelOutput {
  const parsed = parseGroqJson<unknown>(raw)
  const result = panelOutputSchema.safeParse(parsed)

  if (!result.success) {
    logger.error("Panel output validation failed:", result.error.issues)
    throw new Error("AI panel response had invalid structure")
  }

  return result.data
}

function parseAndValidateSynthesizer(raw: string): SynthesizerOutput {
  const parsed = parseGroqJson<unknown>(raw)
  const result = synthesizerOutputSchema.safeParse(parsed)

  if (!result.success) {
    logger.error("Synthesizer output validation failed:", result.error.issues)
    throw new Error("AI synthesizer response had invalid structure")
  }

  return result.data
}

function mapRecommendation(
  rec: SynthesizerOutput["finalRecommendation"]
): "STRONGLY_RECOMMENDED" | "RECOMMENDED_WITH_CHANGES" | "NEEDS_MAJOR_REVISION" | "NOT_RECOMMENDED" {
  const map = {
    "Strongly Recommended": "STRONGLY_RECOMMENDED",
    "Recommended with Changes": "RECOMMENDED_WITH_CHANGES",
    "Needs Major Revision": "NEEDS_MAJOR_REVISION",
    "Not Recommended": "NOT_RECOMMENDED",
  } as const
  return map[rec]
}

function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text
  return text.slice(0, maxLen - 3) + "..."
}

function formatResult(record: {
  id: string
  status: string
  feasibilityScore: number | null
  innovationScore: number | null
  industryRelevanceScore: number | null
  recommendation: string | null
  panelEvaluation: unknown
  finalResult: unknown
  tokensUsed: number
  modelUsed: string | null
  latencyMs: number | null
  createdAt: Date
}): ValidationResult {
  return {
    id: record.id,
    status: normalizeStatus(record.status),
    feasibilityScore: record.feasibilityScore,
    innovationScore: record.innovationScore,
    industryRelevanceScore: record.industryRelevanceScore,
    recommendation: record.recommendation,
    panelEvaluation: record.panelEvaluation as PanelOutput | null,
    finalResult: record.finalResult as SynthesizerOutput | null,
    tokensUsed: record.tokensUsed,
    modelUsed: record.modelUsed,
    latencyMs: record.latencyMs,
    createdAt: record.createdAt,
  }
}

function normalizeStatus(
  status: string
): ValidationResult["status"] {
  switch (status) {
    case "COMPLETED":
    case "completed":
      return "completed"
    case "FAILED":
    case "failed":
      return "failed"
    case "PENDING":
    case "pending":
    default:
      return "pending"
  }
}
