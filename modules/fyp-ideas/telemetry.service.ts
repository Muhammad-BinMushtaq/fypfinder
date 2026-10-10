import prisma from "@/lib/db"
import { logger } from "@/lib/logger"

export interface LogAIRequestParams {
  studentId?: string | null
  operation: "idea_validation" | "pdf_extraction" | "other"
  provider: "Groq" | "Google" | "OpenRouter" | "Mistral"
  modelId: string
  keyAlias: string
  status: "SUCCESS" | "RATE_LIMITED" | "TIMEOUT" | "SCHEMA_ERROR" | "FAILED"
  isFallback: boolean
  fallbackFrom?: string | null
  promptTokens?: number
  completionTokens?: number
  totalTokens: number
  latencyMs: number
  errorMessage?: string | null
}

/**
 * Persists an AI telemetry event to the database asynchronously.
 * Never throws or interrupts the user response flow.
 */
export async function recordAITelemetry(params: LogAIRequestParams): Promise<void> {
  try {
    await prisma.aIRequestLog.create({
      data: {
        studentId: params.studentId ?? null,
        operation: params.operation,
        provider: params.provider,
        modelId: params.modelId,
        keyAlias: params.keyAlias,
        status: params.status,
        isFallback: params.isFallback,
        fallbackFrom: params.fallbackFrom ?? null,
        promptTokens: params.promptTokens ?? 0,
        completionTokens: params.completionTokens ?? 0,
        totalTokens: params.totalTokens,
        latencyMs: params.latencyMs,
        errorMessage: params.errorMessage ?? null,
      },
    })
  } catch (error) {
    logger.error("Failed to record AI telemetry log:", error)
  }
}
