// app/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthenticatedRedirectPath, getCurrentUser } from "@/lib/auth";
import { LandingThemeToggle } from "@/components/landing/LandingThemeToggle";
import { SupademoButton } from "@/components/landing/SupademoButton";
import { LandingFaq } from "@/components/landing/LandingFaq";
import { DiscoveryMockup } from "@/components/landing/DiscoveryMockup";
import { MessagingMockup } from "@/components/landing/MessagingMockup";
import { ValidatorMockup } from "@/components/landing/ValidatorMockup";
import { WorkspaceMockup } from "@/components/landing/WorkspaceMockup";
import { 
  GraduationCap, 
  Users, 
  Brain, 
  MessageSquare, 
  FolderKanban, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Lock,
  ChevronRight
} from "lucide-react";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const params = await searchParams;
  // If OAuth code arrives at root (Supabase redirect fallback), forward it to callback
  if (params?.code) {
    redirect(`/api/auth/callback?code=${encodeURIComponent(params.code)}`);
  }

  // Check if user is already logged in - redirect to the correct app area
  let redirectPath: string | null = null;
  try {
    const user = await getCurrentUser();
    redirectPath = getAuthenticatedRedirectPath(user);
  } catch {
    // If error checking session, just show landing page
  }

  if (redirectPath) {
    redirect(redirectPath);
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://fypmate.com/#website",
        "url": "https://fypmate.com",
        "name": "FYPMate",
        "description": "AI-powered FYP Idea Validator and Student Teammate Discovery Platform",
        "publisher": {
          "@type": "Organization",
          "name": "FYPMate",
          "url": "https://fypmate.com"
        }
      },
      {
        "@type": "WebApplication",
        "@id": "https://fypmate.com/#webapp",
        "name": "FYPMate",
        "url": "https://fypmate.com",
        "applicationCategory": "EducationalApplication",
        "operatingSystem": "All",
        "browserRequirements": "Requires JavaScript. Requires HTML5.",
        "description": "Connect with university students for Final Year Projects (FYP) and validate research proposals with an AI-powered evaluation engine.",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        }
      }
    ]
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-zinc-100 transition-colors relative selection:bg-slate-900 selection:text-white dark:selection:bg-white dark:selection:text-slate-950">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Subtle Background Grid Pattern */}
      <div 
        className="fixed inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:64px_64px] opacity-40 pointer-events-none" 
        style={{ zIndex: 0 }} 
      />

      {/* ========================================= */}
      {/* 1. MINIMALIST NAVIGATION HEADER           */}
      {/* ========================================= */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/85 dark:bg-slate-950/85 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 bg-slate-900 text-white dark:bg-white dark:text-slate-950 rounded-xl flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                FYP<span className="font-semibold text-slate-500 dark:text-zinc-400">Mate</span>
              </span>
            </Link>

            {/* Middle Navigation Links */}
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-zinc-300">
              <a href="#discovery" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                Find Partners
              </a>
              <Link 
                href="/idea-validator" 
                className="hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1.5"
              >
                <span>AI Validator</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/40">
                  AI
                </span>
              </Link>
              <a href="#messaging" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                Collaboration
              </a>
              <a href="#workspace" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                Workspace
              </a>
              <a href="#how-it-works" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                Workflow
              </a>
            </div>

            {/* Actions + Theme Toggle */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              <LandingThemeToggle />
              <Link
                href="/login"
                className="hidden sm:inline-flex text-xs sm:text-sm font-semibold text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white px-2.5 py-1.5 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/login"
                className="px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-white dark:text-slate-950 bg-slate-900 dark:bg-white rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-xs"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ========================================= */}
      {/* 2. VALUE PROPOSITION HERO SECTION         */}
      {/* ========================================= */}
      <section className="relative pt-28 pb-12 sm:pt-36 sm:pb-16 z-10">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-5">
            {/* Minimal Campus Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-full shadow-2xs">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                PAF-IAST Pilot • University Final Year Project Platform
              </span>
            </div>

            {/* Main Clear Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.12]">
              Assemble Your FYP Team.
              <span className="block text-slate-600 dark:text-zinc-400 font-bold mt-1">
                Validate Ideas Before Defense.
              </span>
            </h1>

            {/* Sub-headline */}
            <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-400 max-w-xl mx-auto leading-relaxed pt-1">
              Match with verified university peers by tech stack and availability, and benchmark proposal feasibility against past academic FYP archives with AI.
            </p>

            {/* CTA Action Hub */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
              <Link
                href="/login"
                className="w-full sm:w-auto px-5 py-3 text-xs sm:text-sm font-semibold text-white dark:text-slate-950 bg-slate-900 dark:bg-white rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors flex items-center justify-center gap-2.5 shadow-xs active:scale-[0.99]"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="10" height="10" fill="#F25022" />
                  <rect x="11" width="10" height="10" fill="#7FBA00" />
                  <rect y="11" width="10" height="10" fill="#00A4EF" />
                  <rect x="11" y="11" width="10" height="10" fill="#FFB900" />
                </svg>
                <span>Continue with Microsoft</span>
              </Link>

              <Link
                href="/idea-validator"
                className="w-full sm:w-auto px-5 py-3 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors flex items-center justify-center gap-2 shadow-2xs active:scale-[0.99]"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Test AI Idea Validator</span>
              </Link>

              <SupademoButton />
            </div>
          </div>

          {/* ========================================= */}
          {/* 3. PRODUCT SHOWCASE VIDEO WINDOW          */}
          {/* ========================================= */}
          <div className="mt-12 max-w-4xl mx-auto">
            <div className="rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 p-2 sm:p-3 shadow-xl backdrop-blur-md">
              {/* Window Chrome Header */}
              <div className="flex items-center justify-between px-3 py-1.5 mb-1.5">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                </div>
                <div className="px-3 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-500 dark:text-zinc-400 border border-slate-200/60 dark:border-slate-700/60">
                  fypmate.com • Walkthrough Demo
                </div>
                <div className="w-8" />
              </div>

              {/* Ambient Video Frame: Autoplaying, Looping, Muted, and Unclickable */}
              <div className="relative aspect-video rounded-xl sm:rounded-2xl overflow-hidden bg-black shadow-inner">
                {/* Transparent glass overlay to guarantee zero accidental clicks/popups */}
                <div 
                  className="absolute inset-0 z-10 bg-transparent pointer-events-auto cursor-default" 
                  aria-hidden="true" 
                />

                <iframe 
                  className="absolute inset-0 w-full h-full block"
                  src="https://www.youtube.com/embed/l5DJNJ_SBSU?autoplay=1&mute=1&controls=0&loop=1&playlist=l5DJNJ_SBSU&modestbranding=1&rel=0&playsinline=1" 
                  title="FYPMate Platform Walkthrough Video"
                  frameBorder={0} 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                  referrerPolicy="strict-origin-when-cross-origin" 
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================= */}
      {/* 4. CREDIBILITY & METRICS STRIP            */}
      {/* ========================================= */}
      <section className="relative z-10 py-8 border-y border-slate-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/40 backdrop-blur-xs">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div className="space-y-0.5">
              <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">2–3 Students</p>
              <p className="text-xs text-slate-500 dark:text-zinc-400">Team Size Standard</p>
            </div>
            <div className="space-y-0.5">
              <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">5 Dimensions</p>
              <p className="text-xs text-slate-500 dark:text-zinc-400">AI Defense Rubric</p>
            </div>
            <div className="space-y-0.5">
              <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">100% Free</p>
              <p className="text-xs text-slate-500 dark:text-zinc-400">For University Students</p>
            </div>
            <div className="space-y-0.5">
              <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">PAF-IAST</p>
              <p className="text-xs text-slate-500 dark:text-zinc-400">Founding Campus</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================= */}
      {/* 5. ALTERNATING REALISTIC FEATURE MOCKUPS   */}
      {/* ========================================= */}
      <div className="relative z-10 divide-y divide-slate-200/80 dark:divide-slate-800/80">
        
        {/* SHOWCASE 1: TEAMMATE DISCOVERY & STUDENT PROFILES */}
        <section id="discovery" className="py-16 sm:py-24">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
              {/* Text Left */}
              <div className="space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <Users className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Teammate Discovery</span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                  Find Compatible Partners by Verified Tech Stack
                </h2>
                <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                  Search through departmental classmates with verified skillsets, semester status, and live availability. Stop building accidental teams that fall apart mid-semester.
                </p>

                <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600 dark:text-zinc-300 pt-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Filter peers by technical stack, frameworks, and tools</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Live availability indicator avoids already-grouped classmates</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>View GitHub repositories, previous work, and experience</span>
                  </li>
                </ul>

                <div className="pt-2">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                  >
                    <span>Browse Discovery Directory</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Mockup Right */}
              <div>
                <DiscoveryMockup />
              </div>
            </div>
          </div>
        </section>

        {/* SHOWCASE 2: REAL-TIME MESSAGING & COLLABORATION REQUESTS */}
        <section id="messaging" className="py-16 sm:py-24 bg-slate-50/50 dark:bg-slate-900/20">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
              {/* Mockup Left */}
              <div className="order-2 lg:order-1">
                <MessagingMockup />
              </div>

              {/* Text Right */}
              <div className="space-y-4 order-1 lg:order-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Real-Time Collaboration</span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                  Discuss Project Scope Before Formal Commitment
                </h2>
                <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                  Send structured message requests to classmates. Once approved, collaborate in real time to discuss project visions, expected division of labor, and advisor preferences.
                </p>

                <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600 dark:text-zinc-300 pt-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Permissioned messaging prevents spam and random inquiries</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Direct partner invitations once mutual agreement is reached</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Seamless transition directly into the FYP team workspace</span>
                  </li>
                </ul>

                <div className="pt-2">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                  >
                    <span>Connect with University Peers</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SHOWCASE 3: AI PROPOSAL FEASIBILITY & DUPLICATE CHECK */}
        <section id="validator" className="py-16 sm:py-24">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
              {/* Text Left */}
              <div className="space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <Brain className="w-3.5 h-3.5 text-amber-500" />
                  <span>AI Proposal Feasibility</span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                  Benchmark Proposal Defense Scores with AI
                </h2>
                <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                  Evaluate your project proposal against 5 institutional rubric dimensions. Cross-reference past university FYP archives to identify duplicate ideas before the committee defense.
                </p>

                <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600 dark:text-zinc-300 pt-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>0–100 rubric scoring across novelty, difficulty, and timeline</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Archive duplicate check prevents redundant project proposals</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Clear recommendations for literature review and hardware scope</span>
                  </li>
                </ul>

                <div className="pt-2">
                  <Link
                    href="/idea-validator"
                    className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
                  >
                    <span>Run Free AI Proposal Evaluation</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Mockup Right */}
              <div>
                <ValidatorMockup />
              </div>
            </div>
          </div>
        </section>

        {/* SHOWCASE 4: TEAM WORKSPACE & GROUP LOCK */}
        <section id="workspace" className="py-16 sm:py-24 bg-slate-50/50 dark:bg-slate-900/20">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
              {/* Mockup Left */}
              <div className="order-2 lg:order-1">
                <WorkspaceMockup />
              </div>

              {/* Text Right */}
              <div className="space-y-4 order-1 lg:order-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <FolderKanban className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Team Workspace</span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                  Lock Team Rosters & Execute Milestones
                </h2>
                <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                  Finalize your official 2–3 member group to lock rosters under academic rules. Manage deliverables, literature reviews, and implementation tasks in one unified space.
                </p>

                <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600 dark:text-zinc-300 pt-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Official roster locking compliant with university policy</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Milestone task boards with assigned student roles</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Centralized repository, live demo links, and documentation</span>
                  </li>
                </ul>

                <div className="pt-2">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                  >
                    <span>Launch FYP Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>

      {/* ========================================= */}
      {/* 6. HOW IT WORKS WORKFLOW SECTION          */}
      {/* ========================================= */}
      <section id="how-it-works" className="py-16 sm:py-24 relative z-10 border-t border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-1.5">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              How It Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400">
              Six simple steps from idea formulation to official FYP group locking
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { step: 1, title: "University SSO Sign In", desc: "Log in with your university account to verify your student identity and department." },
              { step: 2, title: "Profile & Tech Stack", desc: "Highlight your verified programming languages, tools, frameworks, and project interests." },
              { step: 3, title: "Search Classmates", desc: "Filter peers by technical stack, semester status, and live availability across departments." },
              { step: 4, title: "Send Message Request", desc: "Exchange introductory messages with potential teammates to align on project vision." },
              { step: 5, title: "Assemble Official Group", desc: "Send formal partner invitations to assemble your 2–3 member FYP team roster." },
              { step: 6, title: "AI Feasibility Benchmark", desc: "Validate proposal novelty, rubric defense score, and past FYP overlap with AI." },
            ].map((item) => (
              <div key={item.step} className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-2.5">
                <div className="w-8 h-8 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-lg flex items-center justify-center text-xs font-bold shadow-xs">
                  {item.step}
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</h3>
                <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================= */}
      {/* 7. FREQUENTLY ASKED QUESTIONS             */}
      {/* ========================================= */}
      <LandingFaq />

      {/* ========================================= */}
      {/* 8. READY TO BEGIN BOTTOM BANNER           */}
      {/* ========================================= */}
      <section className="py-16 sm:py-24 relative z-10 border-t border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center space-y-5">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Ready to Build Your Final Year Project?
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 max-w-lg mx-auto leading-relaxed">
            Join ambitious university students collaborating on FYPMate, benchmark your ideas against past archives, and assemble your dream team.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-1">
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 text-xs sm:text-sm font-semibold text-white dark:text-slate-900 bg-slate-900 dark:bg-white rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-xs"
            >
              <span>Get Started with University SSO</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/idea-validator"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 text-xs sm:text-sm font-semibold text-slate-800 dark:text-zinc-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors shadow-2xs"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Test AI Idea Validator</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================= */}
      {/* 9. MINIMALIST INSTITUTIONAL FOOTER        */}
      {/* ========================================= */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-10 bg-white dark:bg-slate-950 relative z-10">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Brand Column */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <span className="text-base font-bold text-slate-900 dark:text-white">FYPMate</span>
              </div>
              <p className="text-slate-500 dark:text-zinc-400 text-xs leading-relaxed max-w-sm">
                The academic collaboration and AI validation platform helping university students assemble high-performing FYP teams.
              </p>
            </div>

            {/* Founder & Developer Column */}
            <div>
              <h4 className="text-slate-900 dark:text-white font-semibold text-xs mb-1.5">Platform Developer</h4>
              <p className="text-slate-900 dark:text-white font-medium text-xs mb-0.5">Muhammad bin Mushtaq</p>
              <p className="text-slate-500 dark:text-zinc-400 text-[11px] mb-2">Conceived, designed & built at PAF-IAST</p>
              <div className="flex items-center gap-2.5">
                <a
                  href="https://www.linkedin.com/in/muhammad-bin-mushtaq1/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  title="Muhammad bin Mushtaq on LinkedIn"
                >
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
                <a
                  href="https://github.com/Muhammad-BinMushtaq"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  title="Muhammad bin Mushtaq on GitHub"
                >
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Academic Mentor Column */}
            <div>
              <h4 className="text-slate-900 dark:text-white font-semibold text-xs mb-1.5">Academic Mentor</h4>
              <p className="text-slate-900 dark:text-white font-medium text-xs mb-0.5">Dr. Muhammad Shuaib Qureshi</p>
              <p className="text-slate-500 dark:text-zinc-400 text-[11px] mb-2">University Professor • CSO at Datalligence.pk</p>
              <div className="flex items-center gap-3 text-xs font-semibold">
                <a
                  href="https://www.datalligence.pk/team"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors text-[11px]"
                >
                  Datalligence Team →
                </a>
                <a
                  href="https://www.linkedin.com/in/qureshi2015/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors text-[11px]"
                >
                  LinkedIn →
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-zinc-400">
            <p>© 2026 FYPMate. Created by Muhammad bin Mushtaq.</p>
            <div className="flex items-center gap-5">
              <Link href="/about" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                About Us
              </Link>
              <Link href="/idea-validator" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                Idea Validator
              </Link>
              <Link href="/privacy" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
