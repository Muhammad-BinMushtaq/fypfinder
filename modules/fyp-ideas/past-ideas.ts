import crypto from "crypto"
import prisma from "@/lib/db"
import fypProjectsF21Raw from "@/data/fyp-projects-f21.json"
import fypProjectsF22Raw from "@/data/fyp-projects-f22.json"

interface FYPProjectRaw {
  "Group#": number
  "Student Name": string
  "Registration No": string
  "Internal Supervisor": string
  "FYP Title": string
  "Abstract": string
  "Thematic Area": string
  "Batch"?: string
}

export interface PastIdeaCatalogRecord {
  sourceKey: string
  batch: string
  groupNumber: number
  title: string
  abstract: string
  supervisor: string
  students: string[]
  keywords: string[]
  searchText: string
  sourceHash: string
}

export interface SimilarPastIdeaContext {
  sourceKey: string
  batch: string
  groupNumber: number
  title: string
  abstract: string
  supervisor: string
  students: string[]
  keywords: string[]
  similarityScore: number
  overlapTerms: string[]
}

interface SimilarityInput {
  title: string
  problemStatement: string
  ideaDescription: string
  coreFeatures: string
}

const CACHE_TTL_MS = 10 * 60 * 1000

const STOP_WORDS = new Set([
  "the", "and", "for", "with", "that", "this", "from", "into", "using",
  "use", "used", "your", "their", "have", "will", "would", "should",
  "about", "than", "then", "them", "they", "system", "based", "application",
  "project", "platform", "mobile", "web", "app", "idea", "student", "students",
  "build", "make", "made", "need", "needs", "real", "time", "data",
])

let cachedCorpus:
  | { loadedAt: number; records: PastIdeaCatalogRecord[] }
  | null = null

export function buildPastIdeaCatalogRecords(): PastIdeaCatalogRecord[] {
  const allRaw = [
    ...(fypProjectsF21Raw as FYPProjectRaw[]).map((item) => ({ ...item, Batch: item.Batch || "F21" })),
    ...(fypProjectsF22Raw as FYPProjectRaw[]).map((item) => ({ ...item, Batch: item.Batch || "F22" })),
  ]

  return allRaw.map((item) => {
    const batch = item.Batch || "Unknown"
    const title = compactWhitespace(item["FYP Title"] || "Untitled Project")
    const abstract = normalizeAbstract(item["Abstract"])
    const supervisor = compactWhitespace(item["Internal Supervisor"] || "Not Assigned")
    const students = splitList(item["Student Name"])
    const keywords = splitKeywords(item["Thematic Area"])
    const sourceKey = `${batch.toLowerCase()}-${item["Group#"]}`
    const searchText = compactWhitespace(
      [title, abstract, supervisor, students.join(" "), keywords.join(" ")].join(" ")
    )
    const sourceHash = crypto
      .createHash("sha256")
      .update([sourceKey, title, abstract, supervisor, students.join("|"), keywords.join("|")].join("::"))
      .digest("hex")

    return {
      sourceKey,
      batch,
      groupNumber: item["Group#"],
      title,
      abstract,
      supervisor,
      students,
      keywords,
      searchText,
      sourceHash,
    }
  })
}

export async function getPastIdeaCatalog(): Promise<PastIdeaCatalogRecord[]> {
  const now = Date.now()
  if (cachedCorpus && now - cachedCorpus.loadedAt < CACHE_TTL_MS) {
    return cachedCorpus.records
  }

  const rows = await prisma.pastFypIdea.findMany({
    orderBy: [{ batch: "desc" }, { groupNumber: "asc" }],
  })

  const records: PastIdeaCatalogRecord[] =
    rows.length > 0
      ? rows.map((row) => ({
          sourceKey: row.sourceKey,
          batch: row.batch,
          groupNumber: row.groupNumber,
          title: row.title,
          abstract: row.abstract,
          supervisor: row.supervisor,
          students: parseJsonStringArray(row.students),
          keywords: parseJsonStringArray(row.keywords),
          searchText: row.searchText,
          sourceHash: row.sourceHash,
        }))
      : buildPastIdeaCatalogRecords()

  cachedCorpus = { loadedAt: now, records }
  return records
}

export function clearPastIdeaCatalogCache(): void {
  cachedCorpus = null
}

export async function findSimilarPastIdeas(
  input: SimilarityInput,
  limit = 3
): Promise<SimilarPastIdeaContext[]> {
  const corpus = await getPastIdeaCatalog()
  const inputText = compactWhitespace(
    [input.title, input.problemStatement, input.ideaDescription, input.coreFeatures].join(" ")
  )
  const normalizedInput = normalizeForComparison(inputText)
  const inputTokens = tokenize(normalizedInput)
  const inputTitleTokens = tokenize(normalizeForComparison(input.title))

  const scored = corpus
    .map((idea) => {
      const ideaNormalized = normalizeForComparison(idea.searchText)
      const ideaTokens = tokenize(ideaNormalized)
      const ideaTitleTokens = tokenize(normalizeForComparison(idea.title))

      const sharedTokens = intersect(inputTokens, ideaTokens)
      const sharedTitleTokens = intersect(inputTitleTokens, ideaTitleTokens)

      const overlapFromInput = sharedTokens.length / Math.max(inputTokens.length, 1)
      const overlapFromIdea = sharedTokens.length / Math.max(ideaTokens.length, 1)
      const titleOverlap = sharedTitleTokens.length / Math.max(inputTitleTokens.length || 1, 1)

      let score =
        overlapFromInput * 0.55 +
        overlapFromIdea * 0.2 +
        titleOverlap * 0.25

      if (
        normalizeForComparison(input.title) === normalizeForComparison(idea.title) &&
        normalizeForComparison(input.title).length > 0
      ) {
        score = 1
      } else if (
        normalizeForComparison(input.title).includes(normalizeForComparison(idea.title)) ||
        normalizeForComparison(idea.title).includes(normalizeForComparison(input.title))
      ) {
        score += 0.15
      }

      const overlapTerms = sharedTokens.slice(0, 6)

      return {
        ...idea,
        similarityScore: Number(Math.min(1, score).toFixed(2)),
        overlapTerms,
      }
    })
    .filter((idea) => idea.similarityScore >= 0.12)
    .sort((a, b) => b.similarityScore - a.similarityScore)
    .slice(0, limit)

  return scored
}

function splitList(value: string): string[] {
  return compactWhitespace(value)
    .split(/,\s*/)
    .map((item) => item.trim())
    .filter((item) => item.length > 1 && item !== "]")
}

function splitKeywords(value: string): string[] {
  return compactWhitespace(value)
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter((item) => item.length > 1 && item !== "\u00a0")
}

function normalizeAbstract(value: string): string {
  if (!value || value.trim() === "\u00a0") {
    return "Abstract not available."
  }

  return compactWhitespace(value)
}

function compactWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim()
}

function normalizeForComparison(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function tokenize(value: string): string[] {
  return Array.from(
    new Set(
      value
        .split(" ")
        .map((token) => token.trim())
        .filter((token) => token.length > 2 && !STOP_WORDS.has(token))
    )
  )
}

function intersect(a: string[], b: string[]): string[] {
  const lookup = new Set(b)
  return a.filter((item) => lookup.has(item))
}

function parseJsonStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string")
  }

  return []
}
