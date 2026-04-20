// modules/fyp-ideas/prompts.ts

/**
 * FYP Idea Validator — Prompt Templates
 * --------------------------------------
 * Contains the two prompt templates used for multi-agent evaluation.
 * Call 1: Panel of 5 evaluators in a single prompt.
 * Call 2: Final synthesizer that merges all panel results.
 * Call 3: Detailed roadmap generator (on-demand).
 */

export interface PanelPromptInput {
  title: string
  problemStatement: string
  ideaDescription: string
  coreFeatures: string
  teamSize: number | null
}

/**
 * Build the system prompt for Call 1 — the panel of 5 evaluators.
 */
export function buildPanelSystemPrompt(): string {
  return `You are a panel of 5 FYP (Final Year Project) evaluators. You must evaluate a student's project idea from 5 distinct expert perspectives. For each role, produce a JSON object under the designated key.

Rules:
- Be critical, specific, and concise. No filler text or praise without justification.
- Name specific technologies, not vague categories.
- Give concrete examples, not abstract observations.
- Do NOT say "this is a good idea" without specific justification.
- Do NOT list generic risks like "time management" or "team coordination".
- If the description is vague, state assumptions and evaluate the most reasonable interpretation.
- If team size is not specified, assume 2-3 students.
- If technologies are not mentioned, infer the most appropriate ones from the problem domain.

Respond ONLY with a single valid JSON object. No markdown, no explanations, no code fences. The JSON must have exactly these 5 keys: "ideaInterpreter", "technicalEvaluator", "industryEvaluator", "academicEvaluator", "riskCritic".`
}

/**
 * Build the user prompt for Call 1 — includes the student submission and role schemas.
 */
export function buildPanelUserPrompt(input: PanelPromptInput): string {
  return `## Project Submission
- Title: ${input.title}
- Problem: ${input.problemStatement}
- Description: ${input.ideaDescription}
- Core Features: ${input.coreFeatures}
- Team Size: ${input.teamSize ?? "Not specified (assume 2-3)"}

## Evaluation Roles

### Role 1: Idea Interpreter
Extract structured context from the idea.
Output JSON with keys:
- "domain": string (project domain, e.g. "Healthcare", "Education Technology")
- "impliedTechnologies": string[] (technologies implied by the idea)
- "expectedArchitecture": string (e.g. "Client-server web app", "Mobile + cloud backend")
- "systemScope": "small" | "medium" | "large"
- "targetUsers": string (who will use this system)
- "coreProblemRestated": string (restate the core problem in one sentence)

### Role 2: Technical Evaluator
Analyze technical feasibility. Be specific about skills and time.
Output JSON with keys:
- "feasibilityScore": number (1-10, where 10 = fully feasible for FYP students)
- "feasibilityReasoning": string (2-3 sentence explanation of why this score)
- "difficultyLevel": "beginner" | "intermediate" | "advanced"
- "requiredSkills": string[] (at least 3 specific skills)
- "estimatedWeeks": number (realistic dev time for a student team)
- "technicalChallenges": string[] (at least 2 specific challenges)
- "suggestedTechStack": string[] (specific frameworks/tools)

### Role 3: Industry Evaluator
Analyze real-world relevance. Be honest about market saturation.
Output JSON with keys:
- "industryRelevanceScore": number (1-10, where 10 = highly relevant)
- "industryRelevanceReasoning": string (2-3 sentence explanation of why this score)
- "trendAlignment": "outdated" | "current" | "emerging"
- "realWorldApplicability": "low" | "medium" | "high"
- "similarExistingProducts": string[] (name actual products, max 3)
- "marketPotential": string (one sentence assessment)

### Role 4: Academic Evaluator
Analyze suitability as a university FYP. Consider research depth and innovation.
Output JSON with keys:
- "fypSuitabilityScore": number (1-10, where 10 = ideal FYP project)
- "fypSuitabilityReasoning": string (2-3 sentence explanation of why this score)
- "innovationScore": number (1-10, where 10 = highly innovative)
- "innovationReasoning": string (2-3 sentence explanation of why this score)
- "researchDepth": "shallow" | "moderate" | "deep"
- "academicStrengths": string[] (at least 2)
- "academicWeaknesses": string[] (at least 1)

### Role 5: Risk Critic
Be harsh. Find weaknesses and unrealistic assumptions.
Output JSON with keys:
- "riskLevel": "low" | "medium" | "high"
- "hiddenChallenges": string[] (at least 2 non-obvious challenges)
- "unrealisticAssumptions": string[] (at least 1)
- "potentialFailurePoints": string[] (at least 2)
- "mitigationSuggestions": string[] (at least 2 actionable suggestions)`
}

/**
 * Build the system prompt for Call 2 — the final synthesizer.
 */
export function buildSynthesizerSystemPrompt(): string {
  return `You are the final synthesizer for an FYP project evaluation panel. You receive evaluations from 5 expert roles. Produce a single final structured verdict that combines all perspectives.

Rules:
- Be decisive. Do not hedge or equivocate.
- Feasibility score should be weighted heavily by technical and risk evaluations.
- Innovation score should be weighted by academic and industry evaluations.
- The implementation roadmap must have exactly 4 phases.
- Each phase must have a duration and 2-4 specific tasks.
- finalRecommendation must be exactly one of: "Strongly Recommended", "Recommended with Changes", "Needs Major Revision", "Not Recommended".

Respond ONLY with a single valid JSON object. No markdown, no explanations, no code fences.`
}

/**
 * Build the user prompt for Call 2 — feeds panel output to synthesizer.
 */
export function buildSynthesizerUserPrompt(panelOutput: string): string {
  return `## Panel Evaluations
${panelOutput}

## Produce Final Verdict
Return a JSON object with exactly these keys:
- "feasibilityScore": number (1-10)
- "feasibilityReasoning": string (2-3 sentence explanation of why this score)
- "innovationScore": number (1-10)
- "innovationReasoning": string (2-3 sentence explanation of why this score)
- "industryRelevanceScore": number (1-10)
- "industryRelevanceReasoning": string (2-3 sentence explanation of why this score)
- "difficultyLevel": "beginner" | "intermediate" | "advanced"
- "requiredSkills": string[] (top 5-8 most important)
- "riskFactors": string[] (top 3 most critical risks)
- "technologySuggestions": string[] (recommended tech stack, 4-6 items)
- "technologyJustification": string (2-3 sentence explanation of why these technologies)
- "implementationRoadmap": array of exactly 4 objects, each with: "phase" (string), "duration" (string like "2-3 weeks"), "tasks" (string[], 2-4 items)
- "teamSizeSuitability": string (one sentence assessing team size fit)
- "projectScopeRealism": "realistic" | "ambitious" | "unrealistic"
- "scopeRecommendation": string (1-2 sentence advice on adjusting scope if needed)
- "improvementSuggestions": string[] (3-5 actionable next steps for the student)
- "summaryEvaluation": string (2-3 sentence summary)
- "finalRecommendation": "Strongly Recommended" | "Recommended with Changes" | "Needs Major Revision" | "Not Recommended"`
}

/**
 * Build the system prompt for Call 3 — detailed roadmap generator.
 */
export function buildRoadmapSystemPrompt(): string {
  return `You are a senior project manager creating a detailed, actionable implementation roadmap for an FYP project. You receive a project evaluation and must produce a comprehensive roadmap with 4-8 phases depending on project complexity.

Rules:
- Include research phase if project requires ML/data/algorithms
- Include dataset requirements if applicable
- Include deployment/hosting considerations
- Be specific: "Set up Next.js project with TypeScript" not "Set up project"
- Durations should be realistic for university students (weekends + evenings)
- Each phase includes: name, duration, description (2-3 sentences), tasks (3-6 specific items), deliverables, technologies used

Respond ONLY with a single valid JSON object. No markdown, no explanations, no code fences.`
}

/**
 * Build the user prompt for Call 3 — generates detailed roadmap.
 */
export function buildRoadmapUserPrompt(validationData: string): string {
  return `## Project Evaluation Data
${validationData}

## Generate Detailed Implementation Roadmap
Return a JSON object with exactly these keys:
- "phases": array of 4-8 objects, each with:
  - "name": string (phase title)
  - "duration": string (realistic time estimate like "2-3 weeks")
  - "description": string (2-3 sentences explaining what happens in this phase)
  - "tasks": string[] (3-6 specific, actionable tasks)
  - "deliverables": string[] (concrete outputs from this phase)
  - "technologiesUsed": string[] (specific tools/frameworks for this phase)
- "totalEstimatedWeeks": number (sum of all phase durations)
- "criticalPath": string[] (3-5 most important tasks that must be done sequentially)
- "datasetRequirements": string (if applicable, describe data needs and sources)
- "deploymentConsiderations": string (hosting, scaling, security considerations)`
}
