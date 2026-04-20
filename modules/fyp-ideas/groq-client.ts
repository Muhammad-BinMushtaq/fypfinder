// modules/fyp-ideas/groq-client.ts

/**
 * Groq API Client Wrapper
 * -----------------------
 * Isolated Groq SDK wrapper for the FYP Idea Validator.
 * Handles initialization, retries on rate-limit, and JSON parsing.
 *
 * This module is self-contained. If Groq is unavailable or misconfigured,
 * errors are contained here and do not propagate to other features.
 */

import Groq from "groq-sdk"
import { logger } from "@/lib/logger"

const GROQ_API_KEY = process.env.GROQ_API_KEY

let groqClient: Groq | null = null

function getGroqClient(): Groq {
  if (!GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured")
  }
  if (!groqClient) {
    groqClient = new Groq({ apiKey: GROQ_API_KEY })
  }
  return groqClient
}

export interface ModelConfig {
  id: string
  maxTokens: number
  temperature: number
  label: string
}

export interface GroqChatResult {
  content: string
  tokensUsed: number
  modelUsed: string
  latencyMs: number
}

const REQUEST_TIMEOUT_MS = 30_000
const RETRY_DELAYS_MS = [1_000, 2_500] as const

// Model configurations with fallback strategy
const MODELS: ModelConfig[] = [
  { id: "openai/gpt-oss-120b", maxTokens: 4096, temperature: 0.2, label: "GPT-OSS-120B" },
  { id: "llama-3.3-70b-versatile", maxTokens: 3000, temperature: 0.3, label: "Llama-3.3-70B" },
]

/**
 * Send a chat completion request to Groq with automatic model fallback.
 * Returns the raw text content, token usage, model used, and latency.
 *
 * Strategy:
 * 1. Try primary model (GPT-OSS-120B)
 * 2. On failure (429/500/timeout/parse-fail), fallback to secondary model
 * 3. Return result with metadata about which model succeeded
 */
export async function groqChatWithFallback(
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number,
  options?: {
    validateResponse?: (content: string) => void
  }
): Promise<GroqChatResult> {
  const client = getGroqClient()

  const makeRequest = async (model: ModelConfig): Promise<GroqChatResult> => {
    let lastError: unknown = null

    for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
      const startTime = Date.now()

      try {
        const completion = await client.chat.completions.create({
          model: model.id,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: model.temperature,
          max_tokens: Math.min(maxTokens, model.maxTokens),
          response_format: { type: "json_object" },
        }, {
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        })

        const latencyMs = Date.now() - startTime
        const content = completion.choices[0]?.message?.content

        if (!content) {
          throw new Error("Groq returned empty response")
        }

        const tokensUsed =
          (completion.usage?.prompt_tokens ?? 0) +
          (completion.usage?.completion_tokens ?? 0)

        options?.validateResponse?.(content)

        return { content, tokensUsed, modelUsed: model.label, latencyMs }
      } catch (error) {
        lastError = error

        const shouldRetry =
          attempt < RETRY_DELAYS_MS.length && isRetryableGroqError(error)

        if (!shouldRetry) {
          throw error
        }

        const retryDelay = RETRY_DELAYS_MS[attempt]
        logger.warn(
          `Groq request failed for ${model.label} on attempt ${attempt + 1}. Retrying in ${retryDelay}ms...`,
          error
        )
        await delay(retryDelay)
      }
    }

    throw lastError instanceof Error
      ? lastError
      : new Error(`Groq request failed for ${model.label}`)
  }

  // Try primary model first
  try {
    return await makeRequest(MODELS[0])
  } catch (error) {
    logger.warn(`Primary model (${MODELS[0].label}) failed:`, error)

    // Try fallback model
    try {
      return await makeRequest(MODELS[1])
    } catch (fallbackError) {
      logger.error(`Fallback model (${MODELS[1].label}) also failed:`, fallbackError)
      throw new Error(`Both models failed. Primary: ${error instanceof Error ? error.message : 'Unknown error'}. Fallback: ${fallbackError instanceof Error ? fallbackError.message : 'Unknown error'}`)
    }
  }
}

/**
 * Legacy function for backward compatibility - uses fallback mechanism
 */
export async function groqChat(
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number
): Promise<Omit<GroqChatResult, 'modelUsed' | 'latencyMs'>> {
  const result = await groqChatWithFallback(systemPrompt, userPrompt, maxTokens)
  return {
    content: result.content,
    tokensUsed: result.tokensUsed,
  }
}

/**
 * Parse a JSON string from Groq response.
 * Handles fenced responses and extra prose around the JSON body.
 */
export function parseGroqJson<T>(raw: string): T {
  // Strip markdown code fences if the model adds them despite instructions
  let cleaned = raw.trim()
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "")
  }

  try {
    return JSON.parse(cleaned) as T
  } catch {
    const jsonStart = cleaned.indexOf("{")
    const jsonEnd = cleaned.lastIndexOf("}")

    if (jsonStart >= 0 && jsonEnd > jsonStart) {
      return JSON.parse(cleaned.slice(jsonStart, jsonEnd + 1)) as T
    }

    throw new Error("Groq response did not contain valid JSON")
  }
}

function isRateLimitError(error: unknown): boolean {
  if (error && typeof error === "object" && "status" in error) {
    return (error as { status: number }).status === 429
  }
  return false
}

function isServerError(error: unknown): boolean {
  if (error && typeof error === "object" && "status" in error) {
    const status = (error as { status: number }).status
    return status >= 500
  }
  return false
}

function isTimeoutError(error: unknown): boolean {
  if (!(error instanceof Error)) return false

  return (
    error.name === "AbortError" ||
    error.message.toLowerCase().includes("timeout") ||
    error.message.toLowerCase().includes("timed out")
  )
}

function isRetryableGroqError(error: unknown): boolean {
  return isRateLimitError(error) || isServerError(error) || isTimeoutError(error)
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
