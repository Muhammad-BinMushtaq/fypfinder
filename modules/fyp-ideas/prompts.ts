import type { SimilarPastIdeaContext } from "./past-ideas"

export interface ValidatorPromptInput {
  title: string
  problemStatement: string
  ideaDescription: string
  coreFeatures: string
  teamSize: number | null
}

export function buildValidatorSystemPrompt(): string {
  return `You are an expert FYP idea reviewer for university students.

Your job is to review one project idea in plain, easy language. Avoid heavy technical jargon. If you must use a technical term, explain it in simple words.

You will also receive up to 3 past FYP ideas that may be similar. Use them carefully:
- If the new idea is basically the same as an old one, say so clearly.
- If it overlaps but can still be made different, explain how.
- If it seems fresh, say why.
- Never invent past projects that were not provided.

Important rules:
- Be honest, but supportive.
- Use short, clear sentences.
- Focus on what helps a student make a better FYP decision.
- When suggesting improvements, make them practical and specific.
- For similarityScore in similarPastIdeas, use a 0-10 scale where 10 means "almost the same idea".
- recommendation must be exactly one of:
  "Strongly Recommended"
  "Recommended with Changes"
  "Needs Major Revision"
  "Not Recommended"
- originalityVerdict must be exactly one of:
  "appears_unique"
  "some_overlap"
  "very_similar"
  "already_done"
- difficultyLevel must be exactly one of:
  "easy"
  "moderate"
  "challenging"
- roadmap should have 3 to 5 phases, each with simple tasks students can understand.

Respond ONLY with one valid JSON object. No markdown. No code fences. No extra text.`
}

export function buildValidatorUserPrompt(
  input: ValidatorPromptInput,
  similarIdeas: SimilarPastIdeaContext[]
): string {
  const similarIdeasBlock =
    similarIdeas.length === 0
      ? "No strong matches were found in the past FYP idea list."
      : similarIdeas
          .map((idea, index) => {
            return [
              `Idea ${index + 1}:`,
              `- Title: ${idea.title}`,
              `- Batch: ${idea.batch}`,
              `- Group Number: ${idea.groupNumber}`,
              `- Supervisor: ${idea.supervisor}`,
              `- Students: ${idea.students.join(", ") || "Not available"}`,
              `- Keywords: ${idea.keywords.join(", ") || "Not available"}`,
              `- Abstract: ${idea.abstract}`,
              `- Search Similarity Score: ${(idea.similarityScore * 10).toFixed(1)}/10`,
              `- Shared Terms: ${idea.overlapTerms.join(", ") || "None"}`,
            ].join("\n")
          })
          .join("\n\n")

  return `Student Idea
- Title: ${input.title}
- Problem Statement: ${input.problemStatement}
- Idea Description: ${input.ideaDescription}
- Core Features: ${input.coreFeatures}
- Team Size: ${input.teamSize ?? "Not specified (assume 2 to 3 students)"}

Possible Similar Past FYP Ideas
${similarIdeasBlock}

Return a JSON object with exactly these keys:
- "plainSummary": string
- "shouldBuild": string
- "recommendation": "Strongly Recommended" | "Recommended with Changes" | "Needs Major Revision" | "Not Recommended"
- "feasibilityScore": number (1-10)
- "originalityScore": number (1-10)
- "usefulnessScore": number (1-10)
- "difficultyLevel": "easy" | "moderate" | "challenging"
- "estimatedTimeline": string
- "teamFit": string
- "whoWillUseIt": string
- "whyItMatters": string
- "originalityVerdict": "appears_unique" | "some_overlap" | "very_similar" | "already_done"
- "originalityReason": string
- "pastIdeaComparisonSummary": string
- "uniquenessImprovements": string[] (3-5 items)
- "strongPoints": string[] (3-5 items)
- "concernPoints": string[] (3-5 items)
- "riskReductionSteps": string[] (3-5 items)
- "simpleTechDirection": string[] (3-6 items)
- "simpleNextSteps": string[] (3-5 items)
- "roadmap": array of 3 to 5 objects:
  - "phase": string
  - "duration": string
  - "tasks": string[] (2-4 items)
- "elevatorPitch": string
- "plainLanguageAdvice": string[] (3-5 items)
- "similarPastIdeas": array of up to 3 objects:
  - "title": string
  - "batch": string
  - "groupNumber": number
  - "supervisor": string | null
  - "similarityScore": number (0-10)
  - "similarityReason": string
  - "keyDifference": string`
}
