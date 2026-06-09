import { logger } from "@/lib/logger"
import { groqChatWithFallback, parseGroqJson } from "./groq-client"
import {
  buildPdfIdeaExtractionSystemPrompt,
  buildPdfIdeaExtractionUserPrompt,
} from "./prompts"
import {
  extractedIdeaSchema,
  ideaInputSchema,
  type ExtractedIdea,
  type ExtractedIdeaFields,
  type IdeaInput,
} from "./schemas"

const EXTRACTION_MAX_TOKENS = 2500
const PDF_TEXT_MAX_CHARS = 30_000

export interface PdfIdeaExtractionResult {
  extracted: ExtractedIdea
  ideaInput: IdeaInput | null
  modelUsed: string
  tokensUsed: number
  latencyMs: number
}

export async function extractIdeaFromPdfText(
  pdfText: string
): Promise<PdfIdeaExtractionResult> {
  const boundedText = pdfText.slice(0, PDF_TEXT_MAX_CHARS)
  const result = await groqChatWithFallback(
    buildPdfIdeaExtractionSystemPrompt(),
    buildPdfIdeaExtractionUserPrompt(boundedText),
    EXTRACTION_MAX_TOKENS,
    {
      validateResponse: (content) => {
        parseExtractedIdea(content)
      },
    }
  )

  const extracted = parseExtractedIdea(result.content)
  const ideaInput = buildIdeaInput(extracted.fields)

  return {
    extracted,
    ideaInput,
    modelUsed: result.modelUsed,
    tokensUsed: result.tokensUsed,
    latencyMs: result.latencyMs,
  }
}

function parseExtractedIdea(raw: string): ExtractedIdea {
  const parsed = parseGroqJson<unknown>(raw)
  const result = extractedIdeaSchema.safeParse(parsed)

  if (!result.success) {
    logger.error("PDF idea extraction schema check failed:", result.error.issues)
    throw new Error("AI extraction response had an invalid structure")
  }

  return result.data
}

function buildIdeaInput(fields: ExtractedIdeaFields): IdeaInput | null {
  const title = truncate(firstNonEmpty([fields.title, fields.projectSummary]), 200)
  const problemStatement = truncate(fields.problemStatement, 500)
  const ideaDescription = truncate(
    firstNonEmpty([
      fields.description,
      fields.projectSummary,
      [fields.proposedSolution, fields.scope].filter(Boolean).join(" "),
    ]),
    2000
  )
  const coreFeatures = truncate(
    [
      fields.proposedSolution && `Solution: ${fields.proposedSolution}`,
      fields.technologies.length > 0 && `Technologies: ${fields.technologies.join(", ")}`,
      fields.techStack.length > 0 && `Tech stack: ${fields.techStack.join(", ")}`,
      fields.apis.length > 0 && `APIs: ${fields.apis.join(", ")}`,
      fields.platforms.length > 0 && `Platforms: ${fields.platforms.join(", ")}`,
      fields.objectives.length > 0 && `Objectives: ${fields.objectives.join(", ")}`,
      fields.futureExpansion && `Future expansion: ${fields.futureExpansion}`,
    ]
      .filter(Boolean)
      .join("\n"),
    1000
  )

  const parsed = ideaInputSchema.safeParse({
    title,
    problemStatement,
    ideaDescription,
    coreFeatures,
    teamSize: null,
  })

  return parsed.success ? parsed.data : null
}

function firstNonEmpty(values: string[]): string {
  return values.find((value) => value.trim().length > 0)?.trim() ?? ""
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text
  }

  return text.slice(0, maxLength).trim()
}

