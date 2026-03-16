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

export interface GroqChatResult {
  content: string
  tokensUsed: number
}

/**
 * Send a chat completion request to Groq.
 * Returns the raw text content and token usage.
 *
 * - Uses low temperature (0.3) for deterministic JSON output.
 * - Retries once on 429 (rate limit) after a delay.
 */
export async function groqChat(
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number
): Promise<GroqChatResult> {
  const client = getGroqClient()

  const makeRequest = async (): Promise<GroqChatResult> => {
    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: maxTokens,
      response_format: { type: "json_object" },
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      throw new Error("Groq returned empty response")
    }

    const tokensUsed =
      (completion.usage?.prompt_tokens ?? 0) +
      (completion.usage?.completion_tokens ?? 0)

    return { content, tokensUsed }
  }

  try {
    return await makeRequest()
  } catch (error: unknown) {
    // Retry once on rate limit (429)
    if (isRateLimitError(error)) {
      logger.warn("Groq rate limited, retrying after 3s delay...")
      await delay(3000)
      return await makeRequest()
    }
    throw error
  }
}

/**
 * Parse a JSON string from Groq response, with one retry prompt if malformed.
 */
export function parseGroqJson<T>(raw: string): T {
  // Strip markdown code fences if the model adds them despite instructions
  let cleaned = raw.trim()
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "")
  }
  return JSON.parse(cleaned) as T
}

function isRateLimitError(error: unknown): boolean {
  if (error && typeof error === "object" && "status" in error) {
    return (error as { status: number }).status === 429
  }
  return false
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
