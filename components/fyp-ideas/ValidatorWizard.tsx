"use client"

import { useEffect, useState } from "react"
import { AlertCircle, CheckCircle2, ChevronRight, Loader2, Sparkles, X } from "lucide-react"
import type { IdeaInput } from "@/services/fypIdeas.service"

interface ValidatorWizardProps {
  onSubmit: (input: IdeaInput) => void
  isPending: boolean
  mode: "student" | "public"
  remainingToday?: number
  initialValues?: Partial<IdeaInput>
}

const DOMAINS = ["AI/ML", "IoT", "Web", "Mobile", "Cybersecurity", "Other"]

const QUICK_TEMPLATES = [
  {
    name: "Smart Agriculture IoT Monitor",
    domain: "IoT",
    title: "Smart Agriculture IoT Monitor",
    problemStatement: "Farmers struggle to monitor soil moisture and weather conditions in real-time, leading to overwatering or crop damage.",
    ideaDescription: "An IoT-based sensor network that collects soil data and sends alerts to farmers via a mobile app.",
    coreFeatures: "Real-time dashboards, automated irrigation triggers, SMS alerts.",
    techStack: ["Arduino", "React Native", "Firebase"],
    teamSize: "3",
  },
  {
    name: "AI Medical Image Classifier",
    domain: "AI/ML",
    title: "AI Medical Image Classifier",
    problemStatement: "Radiologists have a high workload and sometimes miss early signs of diseases in X-rays.",
    ideaDescription: "A machine learning tool that analyzes medical scans and highlights potential anomalies as a second opinion.",
    coreFeatures: "Image upload, automated inference, confidence scores, doctor feedback loop.",
    techStack: ["Python", "TensorFlow", "Next.js"],
    teamSize: "2",
  },
  {
    name: "FinTech Mobile Wallet",
    domain: "Mobile",
    title: "FinTech Mobile Wallet",
    problemStatement: "Students need a simple, fee-free way to split bills and send money on campus.",
    ideaDescription: "A mobile wallet designed for the university ecosystem, allowing instant peer-to-peer transfers.",
    coreFeatures: "QR code payments, bill splitting, transaction history.",
    techStack: ["Flutter", "Node.js", "PostgreSQL"],
    teamSize: "3",
  },
  {
    name: "Cybersecurity Threat Detector",
    domain: "Cybersecurity",
    title: "Cybersecurity Threat Detector",
    problemStatement: "Small businesses cannot afford expensive intrusion detection systems.",
    ideaDescription: "A lightweight, open-source network monitor that detects common attack patterns.",
    coreFeatures: "Packet sniffing, anomaly alerts, daily security reports.",
    techStack: ["Python", "Wireshark API", "React"],
    teamSize: "2",
  },
  {
    name: "E-Learning Platform",
    domain: "Web",
    title: "E-Learning Platform",
    problemStatement: "Students lack a centralized place to find peer-tutoring and shared notes.",
    ideaDescription: "A web platform connecting students for tutoring and resource sharing.",
    coreFeatures: "Tutor matching, video calls, note uploads, rating system.",
    techStack: ["Next.js", "WebRTC", "Supabase"],
    teamSize: "3",
  },
  {
    name: "Healthcare Management System",
    domain: "Web",
    title: "Healthcare Management System",
    problemStatement: "Small clinics rely on paper records, making patient history hard to track.",
    ideaDescription: "A simple electronic health record (EHR) system tailored for small clinics.",
    coreFeatures: "Patient profiles, appointment scheduling, prescription tracking.",
    techStack: ["React", "Express", "MongoDB"],
    teamSize: "3",
  },
]

const STEPS = [
  { id: 1, label: "Scope & Domain" },
  { id: 2, label: "Problem & Solution" },
  { id: 3, label: "Features & Tech" },
  { id: 4, label: "Review & Submit" },
]

export function ValidatorWizard({ onSubmit, isPending, mode, remainingToday, initialValues }: ValidatorWizardProps) {
  const [step, setStep] = useState(initialValues?.title ? 4 : 1)
  const [domain, setDomain] = useState("")
  const [title, setTitle] = useState(initialValues?.title ?? "")
  const [problemStatement, setProblemStatement] = useState(initialValues?.problemStatement ?? "")
  const [ideaDescription, setIdeaDescription] = useState(initialValues?.ideaDescription ?? "")
  const [coreFeatures, setCoreFeatures] = useState(initialValues?.coreFeatures ?? "")
  const [techStack, setTechStack] = useState<string[]>([])
  const [techInput, setTechInput] = useState("")
  const [teamSize, setTeamSize] = useState(initialValues?.teamSize ? String(initialValues.teamSize) : "")
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (initialValues?.title) {
      setTitle(initialValues.title)
      if (initialValues.problemStatement) setProblemStatement(initialValues.problemStatement)
      if (initialValues.ideaDescription) setIdeaDescription(initialValues.ideaDescription)
      if (initialValues.coreFeatures) setCoreFeatures(initialValues.coreFeatures)
      if (initialValues.teamSize) setTeamSize(String(initialValues.teamSize))
      setStep(4)
    }
  }, [initialValues])

  const validateStep = (currentStep: number) => {
    const nextErrors: Record<string, string> = {}
    if (currentStep === 1) {
      if (!domain) nextErrors.domain = "Please select a domain"
      if (title.trim().length < 5) nextErrors.title = "Title must be at least 5 characters"
    } else if (currentStep === 2) {
      if (problemStatement.trim().length < 20) nextErrors.problemStatement = "Must be at least 20 characters"
      if (ideaDescription.trim().length < 50) nextErrors.ideaDescription = "Must be at least 50 characters"
    } else if (currentStep === 3) {
      if (coreFeatures.trim().length < 20) nextErrors.coreFeatures = "Must be at least 20 characters"
    }
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const nextStep = () => {
    if (validateStep(step)) setStep(s => s + 1)
  }

  const prevStep = () => setStep(s => Math.max(1, s - 1))

  const handleTechKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      if (techInput.trim() && !techStack.includes(techInput.trim())) {
        setTechStack([...techStack, techInput.trim()])
        setTechInput("")
      }
    }
  }

  const removeTech = (t: string) => {
    setTechStack(techStack.filter(x => x !== t))
  }

  const applyTemplate = (t: typeof QUICK_TEMPLATES[0]) => {
    setDomain(t.domain)
    setTitle(t.title)
    setProblemStatement(t.problemStatement)
    setIdeaDescription(t.ideaDescription)
    setCoreFeatures(t.coreFeatures)
    setTechStack(t.techStack)
    setTeamSize(t.teamSize)
    setErrors({})
    setStep(4)
  }

  const handleSubmit = () => {
    if (!validateStep(4)) return
    
    const combinedFeatures = techStack.length > 0 
      ? `${coreFeatures}\n\nTech Stack: ${techStack.join(", ")}`
      : coreFeatures

    const rawTitle = domain && !title.toLowerCase().includes(domain.toLowerCase()) 
      ? `[${domain}] ${title.trim()}` 
      : title.trim()
    const finalTitle = rawTitle.slice(0, 200).trim()

    onSubmit({
      title: finalTitle,
      problemStatement: problemStatement.trim(),
      ideaDescription: ideaDescription.trim(),
      coreFeatures: combinedFeatures.trim(),
      teamSize: teamSize ? Number(teamSize) : null,
    })
  }

  const studentLimitReached = mode === "student" && remainingToday === 0

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Quick Templates Drawer */}
      <div className="rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/40 p-4">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Starter Templates
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            Pre-fill fields to test
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_TEMPLATES.map((t) => (
            <button
              key={t.name}
              type="button"
              onClick={() => applyTemplate(t)}
              className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 transition hover:border-gray-900 dark:hover:border-white hover:text-gray-900 dark:hover:text-white"
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Form Card */}
      <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm">
        {/* Minimalist Stepper Header */}
        <div className="mb-8 border-b border-gray-100 dark:border-slate-800 pb-5">
          <div className="flex items-center justify-between">
            {STEPS.map((s) => (
              <div key={s.id} className="flex items-center gap-2">
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                    s.id === step
                      ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                      : s.id < step
                      ? "bg-emerald-500 text-white"
                      : "bg-gray-100 text-gray-400 dark:bg-slate-800 dark:text-gray-500"
                  }`}
                >
                  {s.id < step ? "✓" : s.id}
                </div>
                <span
                  className={`hidden sm:inline text-xs font-medium ${
                    s.id === step
                      ? "text-gray-900 dark:text-white"
                      : "text-gray-400 dark:text-gray-500"
                  }`}
                >
                  {s.label}
                </span>
              </div>
            ))}
          </div>
          {/* Active progress bar line */}
          <div className="mt-4 h-1 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gray-900 dark:bg-white transition-all duration-300 ease-out" 
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-900 dark:text-white">
                  Primary Domain
                </label>
                {errors.domain && <span className="text-xs text-red-500">{errors.domain}</span>}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 mb-2.5">
                Select the principal technology or research track
              </p>
              <div className="flex flex-wrap gap-2">
                {DOMAINS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDomain(d)}
                    className={`rounded-lg border px-3.5 py-1.5 text-xs font-medium transition-all ${
                      domain === d
                        ? "border-gray-900 bg-gray-900 text-white dark:border-white dark:bg-white dark:text-gray-900 shadow-sm"
                        : "border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/40 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-900 dark:text-white">
                  Project Title
                </label>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {title.length}/200
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 mb-2">
                Clear, descriptive title for your proposal
              </p>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={200}
                placeholder="e.g. Autonomous Campus Navigation & Shuttle Telemetry"
                className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50/40 dark:bg-slate-800/40 px-3.5 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none transition focus:border-gray-900 dark:focus:border-white focus:bg-white dark:focus:bg-slate-900"
              />
              {errors.title && <p className="mt-1.5 text-xs text-red-500">{errors.title}</p>}
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-900 dark:text-white">
                  Problem Statement
                </label>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {problemStatement.length}/500
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 mb-2">
                What precise pain point or deficiency does this project address?
              </p>
              <textarea
                value={problemStatement}
                onChange={(e) => setProblemStatement(e.target.value)}
                maxLength={500}
                rows={3}
                placeholder="e.g. Students frequently miss transport due to lack of real-time positioning and unpredictable arrival intervals..."
                className="w-full resize-none rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50/40 dark:bg-slate-800/40 px-3.5 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none transition focus:border-gray-900 dark:focus:border-white focus:bg-white dark:focus:bg-slate-900"
              />
              {errors.problemStatement && <p className="mt-1.5 text-xs text-red-500">{errors.problemStatement}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-900 dark:text-white">
                  Proposed Solution & System Architecture
                </label>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {ideaDescription.length}/2000
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 mb-2">
                Explain how your solution operates, the user flow, and the novelty
              </p>
              <textarea
                value={ideaDescription}
                onChange={(e) => setIdeaDescription(e.target.value)}
                maxLength={2000}
                rows={5}
                placeholder="e.g. A cross-platform telemetry client paired with GPS transceivers transmitting to an edge-processed telemetry broker..."
                className="w-full resize-none rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50/40 dark:bg-slate-800/40 px-3.5 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none transition focus:border-gray-900 dark:focus:border-white focus:bg-white dark:focus:bg-slate-900"
              />
              {errors.ideaDescription && <p className="mt-1.5 text-xs text-red-500">{errors.ideaDescription}</p>}
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-900 dark:text-white">
                  Core Deliverables & Key Features
                </label>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {coreFeatures.length}/1000
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 mb-2">
                List the measurable milestones, user modules, and key functionalities
              </p>
              <textarea
                value={coreFeatures}
                onChange={(e) => setCoreFeatures(e.target.value)}
                maxLength={1000}
                rows={4}
                placeholder="e.g. Real-time GPS map, WebSocket latency alerts, transport dispatch dashboard, ETA push notification engine..."
                className="w-full resize-none rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50/40 dark:bg-slate-800/40 px-3.5 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none transition focus:border-gray-900 dark:focus:border-white focus:bg-white dark:focus:bg-slate-900"
              />
              {errors.coreFeatures && <p className="mt-1.5 text-xs text-red-500">{errors.coreFeatures}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white">
                Technologies & Tools (Optional)
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 mb-2">
                Press Enter or comma to append libraries or frameworks
              </p>
              <div className="flex min-h-[44px] flex-wrap items-center gap-1.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50/40 dark:bg-slate-800/40 p-2">
                {techStack.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 rounded-md bg-gray-200/80 dark:bg-slate-700 px-2.5 py-1 text-xs font-medium text-gray-800 dark:text-gray-200"
                  >
                    {t}
                    <button
                      type="button"
                      onClick={() => removeTech(t)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  onKeyDown={handleTechKeyDown}
                  className="flex-1 min-w-[140px] bg-transparent px-2 py-1 text-xs text-gray-900 dark:text-white outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  placeholder="e.g. Next.js, PyTorch, ESP32..."
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4 */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white">
                Target Team Capacity
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 mb-2">
                Optional estimate of students required to execute within deadlines
              </p>
              <select
                value={teamSize}
                onChange={(e) => setTeamSize(e.target.value)}
                className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50/40 dark:bg-slate-800/40 px-3.5 py-2.5 text-sm text-gray-900 dark:text-white outline-none transition focus:border-gray-900 dark:focus:border-white focus:bg-white dark:focus:bg-slate-900"
              >
                <option value="">Unspecified</option>
                <option value="1">1 student (Individual)</option>
                <option value="2">2 students</option>
                <option value="3">3 students</option>
                <option value="4">4 students</option>
                <option value="5">5 students</option>
                <option value="6">6 students</option>
              </select>
            </div>

            {/* Clean summary preview */}
            <div className="rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/30 p-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
                Submission Summary
              </h4>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs">
                <div>
                  <dt className="text-gray-400 dark:text-gray-500 font-medium">Domain:</dt>
                  <dd className="text-gray-900 dark:text-white font-medium mt-0.5">{domain || "None"}</dd>
                </div>
                <div>
                  <dt className="text-gray-400 dark:text-gray-500 font-medium">Team Estimate:</dt>
                  <dd className="text-gray-900 dark:text-white font-medium mt-0.5">
                    {teamSize ? `${teamSize} students` : "Flexible"}
                  </dd>
                </div>
                <div className="sm:col-span-2 mt-1">
                  <dt className="text-gray-400 dark:text-gray-500 font-medium">Title:</dt>
                  <dd className="text-gray-900 dark:text-white font-medium mt-0.5 line-clamp-1">{title || "Untitled"}</dd>
                </div>
                {techStack.length > 0 && (
                  <div className="sm:col-span-2 mt-1">
                    <dt className="text-gray-400 dark:text-gray-500 font-medium">Tech Stack:</dt>
                    <dd className="text-gray-900 dark:text-white font-medium mt-0.5">{techStack.join(", ")}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="mt-8 pt-5 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={prevStep}
            disabled={step === 1 || isPending}
            className="rounded-lg px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 transition hover:bg-gray-100 dark:hover:bg-slate-800 disabled:opacity-0"
          >
            Back
          </button>
          
          {step < 4 ? (
            <button
              type="button"
              onClick={nextStep}
              className="flex items-center gap-1.5 rounded-lg bg-gray-900 dark:bg-white px-5 py-2 text-xs font-semibold text-white dark:text-gray-900 transition hover:bg-gray-800 dark:hover:bg-gray-100 shadow-sm"
            >
              Continue
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isPending || studentLimitReached}
              className="flex items-center gap-2 rounded-lg bg-gray-900 dark:bg-white px-6 py-2.5 text-xs font-semibold text-white dark:text-gray-900 transition hover:bg-gray-800 dark:hover:bg-gray-100 shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Validating Idea...
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  Run AI Validation
                </>
              )}
            </button>
          )}
        </div>
      </div>
      
      {studentLimitReached && (
        <div className="flex items-start gap-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/60 p-3.5 text-xs text-gray-600 dark:text-gray-300">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
          <p>Daily student validation quota reached. Resets at midnight UTC.</p>
        </div>
      )}
    </div>
  )
}
