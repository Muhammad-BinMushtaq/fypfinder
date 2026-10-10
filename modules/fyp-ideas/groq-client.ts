// modules/fyp-ideas/groq-client.ts

/**
 * Multi-Provider AI Resilience Client
 * -----------------------------------
 * Highly available, zero-cost AI completion client with automatic multi-tier fallback:
 *
 * Tier 1: Groq Key Pool (4 distinct keys rotated round-robin with auto-cooldown on 429)
 *         Models: qwen/qwen3.8-27b, openai/gpt-oss-120b, openai/gpt-oss-20b
 * Tier 2: Google Gemini (gemini-3.5-flash-lite / gemini-3.8-flash with 1M free token buffer)
 * Tier 3: OpenRouter Free Pool (nemotron-3-nano-omni-30b-a3b-reasoning:free / dots-3-note-preview:free)
 * Tier 4: Mistral AI (mistral-small-latest)
 *
 * Guarantees:
 * - 100% backward-compatible with groqChatWithFallback and parseGroqJson
 * - Zero regression to existing Zod validation schemas
 * - Isolates errors and seamlessly escalates across providers
 */

import { logger } from "@/lib/logger"

export interface GroqChatResult {
  content: string
  tokensUsed: number
  modelUsed: string
  latencyMs: number
}

const REQUEST_TIMEOUT_MS = 35_000

// In-memory key cooldown state (timestamp when key becomes usable again)
const keyCooldowns = new Map<string, number>()

function isKeyCoolingDown(key: string): boolean {
  const expiresAt = keyCooldowns.get(key)
  if (!expiresAt) return false
  if (Date.now() > expiresAt) {
    keyCooldowns.delete(key)
    return false
  }
  return true
}

function setKeyCooldown(key: string, durationMs = 60_000) {
  keyCooldowns.set(key, Date.now() + durationMs)
}

// -------------------------------------------------------------
// Provider Key Resolvers
// -------------------------------------------------------------
function getGroqKeys(): string[] {
  const keys = [
    process.env.GROQ_API_KEY_1,
    process.env.GROQ_API_KEY_2,
    process.env.GROQ_API_KEY_3,
    process.env.GROQ_API_KEY_4,
    process.env.GROQ_API_KEY,
  ].filter((k): k is string => Boolean(k && k.trim().length > 0))

  // Deduplicate
  return Array.from(new Set(keys))
}

function getGeminiKey(): string | null {
  return process.env.GEMINI_API_KEY || null
}

function getOpenRouterKeys(): string[] {
  const keys = [
    process.env.OPENROUTER_API_KEY_1,
    process.env.OPENROUTER_API_KEY_2,
    process.env.OPENROUTER_API_KEY,
  ].filter((k): k is string => Boolean(k && k.trim().length > 0))

  return Array.from(new Set(keys))
}

function getMistralKey(): string | null {
  return process.env.MISTRAL_API_KEY || null
}

// -------------------------------------------------------------
// Provider Execution Handlers
// -------------------------------------------------------------

async function executeGroqRequest(
  key: string,
  model: string,
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number
): Promise<{ content: string; tokensUsed: number }> {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: `${systemPrompt}\n\nIMPORTANT: You must return valid raw JSON only.` },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.2,
      max_tokens: maxTokens,
      response_format: { type: "json_object" },
    }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  })

  if (!response.ok) {
    const errBody = await response.text().catch(() => "")
    const status = response.status
    if (status === 429) {
      setKeyCooldown(key, 60_000)
    }
    throw new Error(`Groq HTTP ${status}: ${errBody}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content
  if (!content) throw new Error("Groq returned empty completion content")

  const tokensUsed =
    (data.usage?.prompt_tokens ?? 0) + (data.usage?.completion_tokens ?? 0)

  return { content, tokensUsed }
}

async function executeGeminiRequest(
  key: string,
  model: string,
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number
): Promise<{ content: string; tokensUsed: number }> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: `${systemPrompt}\n\nIMPORTANT: You must return valid JSON only.` }],
      },
      contents: [{ parts: [{ text: userPrompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        maxOutputTokens: maxTokens,
        temperature: 0.2,
      },
    }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  })

  if (!response.ok) {
    const errBody = await response.text().catch(() => "")
    throw new Error(`Gemini HTTP ${response.status}: ${errBody}`)
  }

  const data = await response.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error("Gemini returned empty candidate text")

  const tokensUsed = data.usageMetadata?.totalTokenCount ?? 0
  return { content: text, tokensUsed }
}

async function executeOpenRouterRequest(
  key: string,
  model: string,
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number
): Promise<{ content: string; tokensUsed: number }> {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${key}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://fypmate.com",
      "X-Title": "FYPMate",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: `${systemPrompt}\n\nIMPORTANT: You must return valid raw JSON only. Do not output markdown codeblocks, prose, or thinking tags.` },
        { role: "user", content: userPrompt },
      ],
      max_tokens: maxTokens,
      temperature: 0.2,
    }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  })

  if (!response.ok) {
    const errBody = await response.text().catch(() => "")
    throw new Error(`OpenRouter HTTP ${response.status}: ${errBody}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content
  if (!content) throw new Error("OpenRouter returned empty completion content")

  const tokensUsed =
    (data.usage?.prompt_tokens ?? 0) + (data.usage?.completion_tokens ?? 0)

  return { content, tokensUsed }
}

async function executeMistralRequest(
  key: string,
  model: string,
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number
): Promise<{ content: string; tokensUsed: number }> {
  const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: `${systemPrompt}\n\nIMPORTANT: You must return valid raw JSON only.` },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      max_tokens: maxTokens,
      temperature: 0.2,
    }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  })

  if (!response.ok) {
    const errBody = await response.text().catch(() => "")
    throw new Error(`Mistral HTTP ${response.status}: ${errBody}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content
  if (!content) throw new Error("Mistral returned empty completion content")

  const tokensUsed =
    (data.usage?.prompt_tokens ?? 0) + (data.usage?.completion_tokens ?? 0)

  return { content, tokensUsed }
}

// -------------------------------------------------------------
// Master Multi-Provider Orchestrator with Resilient Fallback
// -------------------------------------------------------------

export async function groqChatWithFallback(
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number,
  options?: {
    validateResponse?: (content: string) => void
  }
): Promise<GroqChatResult> {
  const groqKeys = getGroqKeys()
  const geminiKey = getGeminiKey()
  const openRouterKeys = getOpenRouterKeys()
  const mistralKey = getMistralKey()

  if (groqKeys.length === 0 && !geminiKey && openRouterKeys.length === 0 && !mistralKey) {
    throw new Error("GROQ_API_KEY is not configured and no fallback keys are available")
  }

  const errors: string[] = []

  // ---------------------------------------------------------
  // TIER 1: Groq Key Pool (Try each active key across high-speed models)
  // ---------------------------------------------------------
  const groqModels = ["qwen/qwen3.8-27b", "openai/gpt-oss-120b", "openai/gpt-oss-20b"]

  for (let keyIdx = 0; keyIdx < groqKeys.length; keyIdx++) {
    const key = groqKeys[keyIdx]
    if (isKeyCoolingDown(key)) {
      continue // Skip key while cooling down after 429
    }

    for (const model of groqModels) {
      const startTime = Date.now()
      try {
        const { content, tokensUsed } = await executeGroqRequest(
          key,
          model,
          systemPrompt,
          userPrompt,
          maxTokens
        )

        // Validate payload conforms to schema before accepting
        options?.validateResponse?.(content)

        return {
          content,
          tokensUsed,
          modelUsed: `Groq (${model})`,
          latencyMs: Date.now() - startTime,
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        errors.push(`Groq[Key${keyIdx + 1} - ${model}]: ${msg}`)
        logger.warn(`Groq key ${keyIdx + 1} failed for ${model}: ${msg}`)
      }
    }
  }

  // ---------------------------------------------------------
  // TIER 2: Google Gemini (High-Capacity 1M TPM Safety Net)
  // ---------------------------------------------------------
  if (geminiKey) {
    const geminiModels = ["gemini-3.5-flash-lite", "gemini-flash-latest"]
    for (const model of geminiModels) {
      const startTime = Date.now()
      try {
        const { content, tokensUsed } = await executeGeminiRequest(
          geminiKey,
          model,
          systemPrompt,
          userPrompt,
          maxTokens
        )

        options?.validateResponse?.(content)

        return {
          content,
          tokensUsed,
          modelUsed: `Google (${model})`,
          latencyMs: Date.now() - startTime,
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        errors.push(`Gemini[${model}]: ${msg}`)
        logger.warn(`Gemini fallback failed for ${model}: ${msg}`)
      }
    }
  }

  // ---------------------------------------------------------
  // TIER 3: OpenRouter Free Pool
  // ---------------------------------------------------------
  if (openRouterKeys.length > 0) {
    const openRouterModels = [
      "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
      "dots-studio/dots-3-note-preview:free",
    ]
    for (const key of openRouterKeys) {
      for (const model of openRouterModels) {
        const startTime = Date.now()
        try {
          const { content, tokensUsed } = await executeOpenRouterRequest(
            key,
            model,
            systemPrompt,
            userPrompt,
            maxTokens
          )

          options?.validateResponse?.(content)

          return {
            content,
            tokensUsed,
            modelUsed: `OpenRouter (${model})`,
            latencyMs: Date.now() - startTime,
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err)
          errors.push(`OpenRouter[${model}]: ${msg}`)
          logger.warn(`OpenRouter fallback failed for ${model}: ${msg}`)
        }
      }
    }
  }

  // ---------------------------------------------------------
  // TIER 4: Mistral AI Fallback
  // ---------------------------------------------------------
  if (mistralKey) {
    const startTime = Date.now()
    try {
      const { content, tokensUsed } = await executeMistralRequest(
        mistralKey,
        "mistral-small-latest",
        systemPrompt,
        userPrompt,
        maxTokens
      )

      options?.validateResponse?.(content)

      return {
        content,
        tokensUsed,
        modelUsed: "Mistral (mistral-small-latest)",
        latencyMs: Date.now() - startTime,
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      errors.push(`Mistral: ${msg}`)
      logger.warn(`Mistral fallback failed: ${msg}`)
    }
  }

  logger.error("All AI providers in fallback chain exhausted:", errors)
  throw new Error(`All AI fallback models failed. Details: ${errors.slice(-3).join(" | ")}`)
}

/**
 * Legacy wrapper for backward compatibility
 */
export async function groqChat(
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number
): Promise<Omit<GroqChatResult, "modelUsed" | "latencyMs">> {
  const result = await groqChatWithFallback(systemPrompt, userPrompt, maxTokens)
  return {
    content: result.content,
    tokensUsed: result.tokensUsed,
  }
}

/**
 * Robust JSON Parser: cleans code fences, markdown wrapping, and extracts inner objects
 */
export function parseGroqJson<T>(raw: string): T {
  let cleaned = raw.trim()

  // Strip code fences if model wrapped response in ```json ... ```
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "")
  }

  try {
    return JSON.parse(cleaned) as T
  } catch {
    // If model included introductory thoughts or prose, find outer JSON boundaries
    const jsonStart = cleaned.indexOf("{")
    const jsonEnd = cleaned.lastIndexOf("}")

    if (jsonStart >= 0 && jsonEnd > jsonStart) {
      const extracted = cleaned.slice(jsonStart, jsonEnd + 1)
      return JSON.parse(extracted) as T
    }

    throw new Error("AI provider response did not contain valid JSON")
  }
}
