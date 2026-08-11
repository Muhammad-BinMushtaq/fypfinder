"use client"

import { useState } from "react"
import { AlertCircle, CheckCircle2, ChevronRight, Loader2, Sparkles, X } from "lucide-react"
import type { IdeaInput } from "@/services/fypIdeas.service"

interface ValidatorWizardProps {
  onSubmit: (input: IdeaInput) => void
  isPending: boolean
  mode: "student" | "public"
  remainingToday?: number
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

export function ValidatorWizard({ onSubmit, isPending, mode, remainingToday }: ValidatorWizardProps) {
  const [step, setStep] = useState(1)
  const [domain, setDomain] = useState("")
  const [title, setTitle] = useState("")
  const [problemStatement, setProblemStatement] = useState("")
  const [ideaDescription, setIdeaDescription] = useState("")
  const [coreFeatures, setCoreFeatures] = useState("")
  const [techStack, setTechStack] = useState<string[]>([])
  const [techInput, setTechInput] = useState("")
  const [teamSize, setTeamSize] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

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
    
    // Combine core features and tech stack
    const combinedFeatures = techStack.length > 0 
      ? `${coreFeatures}\n\nTech Stack: ${techStack.join(", ")}`
      : coreFeatures

    // Prepend domain to title if not already there
    const finalTitle = title.includes(domain) ? title : `[${domain}] ${title}`

    onSubmit({
      title: finalTitle,
      problemStatement,
      ideaDescription,
      coreFeatures: combinedFeatures,
      teamSize: teamSize ? Number(teamSize) : null,
    })
  }

  const studentLimitReached = mode === "student" && remainingToday === 0

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Quick Templates */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">Quick Templates</div>
        <div className="flex flex-wrap gap-2">
          {QUICK_TEMPLATES.map((t) => (
            <button
              key={t.name}
              type="button"
              onClick={() => applyTemplate(t)}
              className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700 transition hover:bg-gray-100 dark:border-slate-700 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700"
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {/* Stepper */}
        <div className="mb-8 flex items-center justify-center gap-2">
          {[1, 2, 3, 4].map((num) => (
            <div key={num} className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                  num === step
                    ? "bg-amber-500 text-white"
                    : num < step
                    ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                    : "bg-gray-100 text-gray-400 dark:bg-slate-800 dark:text-gray-500"
                }`}
              >
                {num < step ? <CheckCircle2 className="h-4 w-4" /> : num}
              </div>
              {num < 4 && (
                <div
                  className={`h-0.5 w-10 sm:w-16 ${
                    num < step ? "bg-gray-900 dark:bg-white" : "bg-gray-100 dark:bg-slate-800"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-4">
            <div>
              <label className="text-sm font-semibold text-gray-900 dark:text-white">Domain</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {DOMAINS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDomain(d)}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                      domain === d
                        ? "border-amber-500 bg-amber-50 text-amber-700 dark:border-amber-500/50 dark:bg-amber-500/20 dark:text-amber-300"
                        : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
              {errors.domain && <p className="mt-2 text-xs text-red-500">{errors.domain}</p>}
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-900 dark:text-white">Project Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="E.g. Smart campus bus tracking"
                className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 dark:border-slate-700 dark:bg-slate-800"
              />
              {errors.title && <p className="mt-2 text-xs text-red-500">{errors.title}</p>}
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-4">
            <div>
              <label className="text-sm font-semibold text-gray-900 dark:text-white">Problem Statement</label>
              <p className="text-xs text-gray-500">What is frustrating or missing today?</p>
              <textarea
                value={problemStatement}
                onChange={(e) => setProblemStatement(e.target.value)}
                rows={4}
                className="mt-2 w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 dark:border-slate-700 dark:bg-slate-800"
              />
              {errors.problemStatement && <p className="mt-2 text-xs text-red-500">{errors.problemStatement}</p>}
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-900 dark:text-white">Idea Description</label>
              <p className="text-xs text-gray-500">Explain what the system does</p>
              <textarea
                value={ideaDescription}
                onChange={(e) => setIdeaDescription(e.target.value)}
                rows={5}
                className="mt-2 w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 dark:border-slate-700 dark:bg-slate-800"
              />
              {errors.ideaDescription && <p className="mt-2 text-xs text-red-500">{errors.ideaDescription}</p>}
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-4">
            <div>
              <label className="text-sm font-semibold text-gray-900 dark:text-white">Core Features</label>
              <textarea
                value={coreFeatures}
                onChange={(e) => setCoreFeatures(e.target.value)}
                rows={4}
                className="mt-2 w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 dark:border-slate-700 dark:bg-slate-800"
              />
              {errors.coreFeatures && <p className="mt-2 text-xs text-red-500">{errors.coreFeatures}</p>}
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-900 dark:text-white">Tech Stack (Optional)</label>
              <p className="text-xs text-gray-500">Press Enter or comma to add</p>
              <div className="mt-2 flex min-h-[46px] flex-wrap items-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 p-2 dark:border-slate-700 dark:bg-slate-800">
                {techStack.map((t) => (
                  <span key={t} className="flex items-center gap-1 rounded-full bg-gray-200 px-3 py-1 text-xs font-medium text-gray-800 dark:bg-slate-700 dark:text-gray-200">
                    {t}
                    <button type="button" onClick={() => removeTech(t)} className="hover:text-red-500"><X className="h-3 w-3" /></button>
                  </span>
                ))}
                <input
                  type="text"
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  onKeyDown={handleTechKeyDown}
                  className="flex-1 bg-transparent px-2 py-1 text-sm outline-none placeholder:text-gray-400"
                  placeholder="e.g. React, Node.js..."
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4 */}
        {step === 4 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-4">
            <div>
              <label className="text-sm font-semibold text-gray-900 dark:text-white">Team Size</label>
              <select
                value={teamSize}
                onChange={(e) => setTeamSize(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 dark:border-slate-700 dark:bg-slate-800"
              >
                <option value="">Not sure yet</option>
                <option value="1">1 student</option>
                <option value="2">2 students</option>
                <option value="3">3 students (Max)</option>
              </select>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
              <h4 className="font-semibold text-amber-900 dark:text-amber-200">Summary</h4>
              <ul className="mt-2 space-y-1 text-sm text-amber-800 dark:text-amber-300">
                <li><span className="font-medium">Title:</span> {title}</li>
                <li><span className="font-medium">Domain:</span> {domain}</li>
                <li><span className="font-medium">Tech Stack:</span> {techStack.length ? techStack.join(", ") : "None"}</li>
              </ul>
            </div>
          </div>
        )}

        <div className="mt-8 flex items-center justify-between">
          <button
            type="button"
            onClick={prevStep}
            disabled={step === 1 || isPending}
            className="rounded-xl px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-100 disabled:opacity-0 dark:text-gray-300 dark:hover:bg-slate-800"
          >
            Back
          </button>
          
          {step < 4 ? (
            <button
              type="button"
              onClick={nextStep}
              className="flex items-center gap-2 rounded-xl bg-gray-900 px-6 py-2 text-sm font-semibold text-white transition hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isPending || studentLimitReached}
              className="flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-2 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Checking...</>
              ) : (
                <><Sparkles className="h-4 w-4" /> Validate My Idea</>
              )}
            </button>
          )}
        </div>
      </div>
      
      {studentLimitReached && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>You've used all validations for today. Come back tomorrow.</p>
        </div>
      )}
    </div>
  )
}
