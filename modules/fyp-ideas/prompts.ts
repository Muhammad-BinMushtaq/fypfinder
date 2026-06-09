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
- Score the idea using the detailed 100-point rubric exactly:
  problem clarity & relevance 0-20,
  idea explanation & usability 0-20,
  key features completeness 0-15,
  feasibility & resources 0-10,
  originality/novelty 0-10,
  impact & usefulness 0-10,
  improvement potential 0-15.
- finalScore must equal the sum of those seven detailed scores.
- Keep feasibilityScore, originalityScore, and usefulnessScore as simple 1-10 summary scores.
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
- advancedFeatureSuggestions should include optional and advanced features when relevant, such as:
  personalized AI recommendations, calendar integration and notifications,
  offline data storage, customizable app monitoring/distraction controls,
  privacy and data deletion options, gamification, and teacher or mentor dashboards.

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
- "finalScore": number (0-100, sum of scoringBreakdown scores)
- "scoringBreakdown": object with exactly these keys:
  - "problemClarityRelevance": object
    - "score": number (0-20)
    - "maxScore": 20
    - "summary": string
    - "feedback": string[] (2-4 items)
    - "action": string
  - "ideaExplanationUsability": object
    - "score": number (0-20)
    - "maxScore": 20
    - "summary": string
    - "feedback": string[] (2-4 items)
    - "action": string
  - "keyFeaturesCompleteness": object
    - "score": number (0-15)
    - "maxScore": 15
    - "summary": string
    - "feedback": string[] (2-4 items)
    - "action": string
  - "feasibilityResources": object
    - "score": number (0-10)
    - "maxScore": 10
    - "summary": string
    - "feedback": string[] (2-4 items)
    - "action": string
  - "originalityNovelty": object
    - "score": number (0-10)
    - "maxScore": 10
    - "summary": string
    - "feedback": string[] (2-4 items)
    - "action": string
  - "impactUsefulness": object
    - "score": number (0-10)
    - "maxScore": 10
    - "summary": string
    - "feedback": string[] (2-4 items)
    - "action": string
  - "improvementPotential": object
    - "score": number (0-15)
    - "maxScore": 15
    - "summary": string
    - "feedback": string[] (2-4 items)
    - "action": string
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
- "advancedFeatureSuggestions": string[] (7-10 items, include personalized AI recommendations, calendar notifications, offline storage, monitoring controls, privacy deletion, gamification, and teacher/mentor dashboard where sensible)
- "mvpRecommendations": string[] (3-6 items that define the first build)
- "roadmapPriorities": string[] (3-6 items that explain what to build first, next, and later)
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

export function buildPdfIdeaExtractionSystemPrompt(): string {
  return `You are an academic FYP proposal extraction engine for FYP Finder.

Extract structured final year project idea data from PDF text.

Rules:
- Return JSON only.
- Do not invent facts.
- If a field is missing, return an empty string or empty array.
- Every extracted field must include a confidence score from 0 to 1.
- Lower confidence when the source text is vague, implied, inconsistent, or incomplete.
- Preserve student intent but rewrite noisy proposal text into clean submission-ready language.
- Do not include unsafe HTML, scripts, markdown tables, or document formatting.
- Keep fields concise enough for a student to review and edit.

Return exactly this JSON shape:
{
  "fields": {
    "title": "",
    "problemStatement": "",
    "proposedSolution": "",
    "description": "",
    "projectSummary": "",
    "department": "",
    "domain": "",
    "category": "",
    "technologies": [],
    "techStack": [],
    "aiUsage": "",
    "apis": [],
    "platforms": [],
    "novelty": "",
    "innovation": "",
    "existingAlternatives": [],
    "marketGap": "",
    "objectives": [],
    "scope": "",
    "futureExpansion": "",
    "targetUsers": []
  },
  "confidence": {
    "title": 0,
    "problemStatement": 0,
    "proposedSolution": 0,
    "description": 0,
    "projectSummary": 0,
    "department": 0,
    "domain": 0,
    "category": 0,
    "technologies": 0,
    "techStack": 0,
    "aiUsage": 0,
    "apis": 0,
    "platforms": 0,
    "novelty": 0,
    "innovation": 0,
    "existingAlternatives": 0,
    "marketGap": 0,
    "objectives": 0,
    "scope": 0,
    "futureExpansion": 0,
    "targetUsers": 0
  },
  "warnings": []
}`
}

export function buildPdfIdeaExtractionUserPrompt(pdfText: string): string {
  return `PDF text:
${pdfText}`
}
