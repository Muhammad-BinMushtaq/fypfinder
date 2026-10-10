// app/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthenticatedRedirectPath, getCurrentUser } from "@/lib/auth";
import { LandingThemeToggle } from "@/components/landing/LandingThemeToggle";
import { SupademoButton } from "@/components/landing/SupademoButton";
import { HeroTaglineCycler } from "@/components/landing/HeroTaglineCycler";
import { LandingFaq } from "@/components/landing/LandingFaq";
import { 
  GraduationCap, 
  Sparkles, 
  Users, 
  Brain, 
  ArrowRight, 
  CheckCircle2, 
  Lock
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
      },
      {
        "@type": "FAQPage",
        "@id": "https://fypmate.com/#faq",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "What is FYPMate?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "FYPMate is an AI-powered academic platform helping university students find ideal Final Year Project (FYP) teammates, discover peer collaborators by technical skill, and validate proposal feasibility."
            }
          },
          {
            "@type": "Question",
            "name": "How does the AI FYP Idea Validator work?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "The AI FYP Idea Validator evaluates project titles and descriptions across novelty, technical difficulty, timeline feasibility, team fit, and hardware constraints, providing instant rubric-based scores and benchmark comparisons."
            }
          },
          {
            "@type": "Question",
            "name": "Who can use FYPMate?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "FYPMate is designed for university engineering, computer science, and software students looking for project partners, research collaborators, and automated proposal evaluations."
            }
          },
          {
            "@type": "Question",
            "name": "Is FYPMate free to use?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, FYPMate is free for university students to find project partners and validate their academic project ideas."
            }
          }
        ]
      }
    ]
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 text-slate-800 dark:text-zinc-100 transition-colors relative selection:bg-slate-900 selection:text-white dark:selection:bg-white dark:selection:text-slate-950">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Subtle Background Grid Pattern */}
      <div 
        className="fixed inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:64px_64px] opacity-40 dark:opacity-40 pointer-events-none" 
        style={{ zIndex: 0 }} 
      />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/85 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
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

            {/* Middle Nav Links */}
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-zinc-300">
              <Link 
                href="/idea-validator" 
                className="hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1.5"
              >
                <span>Idea Validator</span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/40">
                  AI
                </span>
              </Link>
              <a href="#features" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                Platform
              </a>
              <a href="#how-it-works" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                How It Works
              </a>
              <Link href="/about" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                About Us
              </Link>
            </div>

            {/* Actions + Theme Toggle */}
            <div className="flex items-center gap-2 sm:gap-3">
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

      {/* Hero Section */}
      <section className="relative pt-28 pb-14 sm:pt-36 sm:pb-20 z-10">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-5">
            {/* Minimal Campus Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-full shadow-2xs">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                PAF-IAST Pilot • AI FYP Platform
              </span>
            </div>

            {/* Responsive Main Tagline */}
            <div className="space-y-2 sm:space-y-3">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.12]">
                Find Your FYP Teammate.
              </h1>
              <HeroTaglineCycler />
            </div>

            {/* Brief Subheading - Under 15 words */}
            <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-400 max-w-lg mx-auto leading-relaxed pt-1">
              Find verified FYP teammates and validate your project proposal with AI before committee defense.
            </p>

            {/* CTA Buttons */}
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

          {/* Product Showcase Window Mockup */}
          <div className="mt-12 max-w-4xl mx-auto">
            <div className="rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 p-2 sm:p-3 shadow-xl backdrop-blur-md">
              <div className="flex items-center justify-between px-3 py-1.5 mb-1.5">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                </div>
                <div className="px-3 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-500 dark:text-zinc-400 border border-slate-200/60 dark:border-slate-700/60">
                  fypmate.com • Platform Demo
                </div>
                <div className="w-8" />
              </div>
              <div className="relative aspect-video rounded-xl sm:rounded-2xl overflow-hidden bg-black shadow-inner">
                <iframe 
                  className="absolute inset-0 w-full h-full block"
                  src="https://www.youtube.com/embed/l5DJNJ_SBSU?si=AEzaXHlTThwBI7r3&autoplay=0&rel=0" 
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

      {/* Credibility & Metrics Strip */}
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

      {/* Core Platform Features: The Side-by-Side Split Table */}
      <section id="features" className="py-16 sm:py-24 relative z-10">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-xl mx-auto space-y-1.5">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              The Two FYP Engines
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400">
              Everything needed to assemble a balanced team and benchmark project feasibility.
            </p>
          </div>

          {/* Unified Split Table */}
          <div className="rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/70 shadow-xs overflow-hidden grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200/80 dark:divide-slate-800">
            {/* Side A: Teammate Discovery */}
            <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-zinc-200 flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg">Teammate Discovery</h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">Match by verified tech stack & availability</p>
                  </div>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-600 dark:text-zinc-300 pt-1">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Verified departmental student profiles</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Filter by tech stack and availability</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Direct chat and formal partner requests</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Locked team rosters under university rules</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-white hover:text-slate-600 dark:hover:text-zinc-300 transition-colors pt-3 border-t border-slate-100 dark:border-slate-800/80"
              >
                <span>Browse Student Discovery</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Side B: AI Proposal Feasibility */}
            <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-zinc-200 flex items-center justify-center shrink-0">
                    <Brain className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg">AI Proposal Feasibility</h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">Benchmark defense standards before submission</p>
                  </div>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-600 dark:text-zinc-300 pt-1">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>0–100 institutional defense rubric scoring</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Novelty and historical duplicate detection</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>2-semester defense milestone timeline</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Technical difficulty and hardware tier analysis</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/idea-validator"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-white hover:text-slate-600 dark:hover:text-zinc-300 transition-colors pt-3 border-t border-slate-100 dark:border-slate-800/80"
              >
                <span>Test AI Validator</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Student Directory Preview Section */}
      <section className="py-16 sm:py-24 relative z-10 border-t border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-xl mx-auto space-y-1.5">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Students Looking for Partners
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400">
              Sign in with your university account to explore full profiles and connect in real-time.
            </p>
          </div>

          {/* Preview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {/* Card 1 */}
            <div className="bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-full flex items-center justify-center font-bold text-xs shrink-0">
                    AK
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Ahmed Khan</h3>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">BSCS • Semester 7</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Available</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative p-4">
                <div className="absolute inset-0 backdrop-blur-xs bg-white/70 dark:bg-slate-900/70 z-10 flex items-center justify-center">
                  <Link 
                    href="/login" 
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-xs"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Login to View</span>
                  </Link>
                </div>
                <div className="space-y-2 opacity-30 select-none">
                  <div className="flex flex-wrap gap-1">
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-[10px] rounded-md">Next.js</span>
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-[10px] rounded-md">Node.js</span>
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-[10px] rounded-md">PostgreSQL</span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">Full-stack developer focusing on distributed web apps</p>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-xs shrink-0">
                    SM
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Sara Malik</h3>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">BSAI • Semester 7</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Available</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative p-4">
                <div className="absolute inset-0 backdrop-blur-xs bg-white/70 dark:bg-slate-900/70 z-10 flex items-center justify-center">
                  <Link 
                    href="/login" 
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-xs"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Login to View</span>
                  </Link>
                </div>
                <div className="space-y-2 opacity-30 select-none">
                  <div className="flex flex-wrap gap-1">
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-[10px] rounded-md">PyTorch</span>
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-[10px] rounded-md">Computer Vision</span>
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-[10px] rounded-md">Python</span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">AI enthusiast interested in healthcare imaging</p>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-700 text-white rounded-full flex items-center justify-center font-bold text-xs shrink-0">
                    ZT
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Zain Tariq</h3>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">BSE • Semester 7</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Available</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative p-4">
                <div className="absolute inset-0 backdrop-blur-xs bg-white/70 dark:bg-slate-900/70 z-10 flex items-center justify-center">
                  <Link 
                    href="/login" 
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-xs"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Login to View</span>
                  </Link>
                </div>
                <div className="space-y-2 opacity-30 select-none">
                  <div className="flex flex-wrap gap-1">
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-[10px] rounded-md">Embedded C</span>
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-[10px] rounded-md">ESP32</span>
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-[10px] rounded-md">IoT</span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">Hardware specialist building smart telemetry systems</p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center pt-1">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors shadow-2xs"
            >
              <span>View All Students in Discovery</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Historical FYP Inspiration Section */}
      <section className="py-16 sm:py-24 relative z-10 bg-slate-100/60 dark:bg-slate-900/30 border-y border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-xl mx-auto space-y-1.5">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              FYP Ideas & Inspiration
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400">
              Browse approved project directions to benchmark originality and avoid duplicate concepts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {/* FYP 1 */}
            <div className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-md">
                  Computer Vision
                </span>
                <span className="text-[10px] text-slate-400">Semester 8</span>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">Smart Attendance Verification</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                  Real-time edge facial recognition attendance pipeline with automated logging and LMS synchronization.
                </p>
              </div>
              <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400">
                Department of Computer Science • PAF-IAST
              </div>
            </div>

            {/* FYP 2 */}
            <div className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                  Mobile & AR
                </span>
                <span className="text-[10px] text-slate-400">Semester 8</span>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">AR Campus Navigation</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                  Indoor positioning system utilizing augmented reality beacons for multi-floor campus building navigation.
                </p>
              </div>
              <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400">
                Department of Software Engineering • PAF-IAST
              </div>
            </div>

            {/* FYP 3 */}
            <div className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-md">
                  NLP & LLM
                </span>
                <span className="text-[10px] text-slate-400">Semester 8</span>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">Adaptive Exam Generator</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                  AI-powered balanced question paper formulation using Bloom’s taxonomy difficulty scoring and anti-leakage checks.
                </p>
              </div>
              <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400">
                Department of Artificial Intelligence • PAF-IAST
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive AI Idea Validator Showcase Banner */}
      <section className="py-16 sm:py-24 relative z-10">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="rounded-2xl sm:rounded-3xl border border-amber-200 dark:border-amber-900/40 bg-gradient-to-br from-amber-50/80 via-white to-orange-50/60 dark:from-slate-900 dark:via-slate-900 dark:to-amber-950/30 p-6 sm:p-10 shadow-xs">
            <div className="max-w-2xl space-y-3.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white dark:bg-slate-800 border border-amber-200/90 dark:border-amber-900/40 text-[11px] font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>AI Feasibility Benchmark</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Check if your FYP idea is defense-ready before committing to it
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 leading-relaxed">
                Paste your project title and concept summary. Our AI engine evaluates novelty, implementation risks, timeline feasibility, and hardware complexity with an instant score.
              </p>
              <div className="pt-1.5 flex flex-col sm:flex-row gap-2.5">
                <Link
                  href="/idea-validator"
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white dark:text-slate-900 bg-slate-900 dark:bg-white rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 dark:text-amber-600" />
                  <span>Try Free AI Analysis</span>
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 dark:text-zinc-200 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-white/80 dark:hover:bg-slate-800 transition-colors"
                >
                  Sign In for Full PDF Reports
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 sm:py-24 relative z-10 bg-slate-100/60 dark:bg-slate-900/30 border-y border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-1.5">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              How It Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400">
              Six simple steps from idea inception to locked FYP group
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { step: 1, title: "Create Your Profile", desc: "Sign in with your university account and showcase your programming skills, frameworks, and domain interests." },
              { step: 2, title: "Discover Classmates", desc: "Filter peers by technical stack, target industry, and current availability status across university departments." },
              { step: 3, title: "Send Message Request", desc: "Send an introductory message request to prospective teammates to align on project vision." },
              { step: 4, title: "Chat in Real Time", desc: "Discuss project concepts, technical scope, and division of labor once your messaging request is accepted." },
              { step: 5, title: "Send Partner Request", desc: "Send a formal partner invitation to officially assemble your 2–3 member FYP team roster." },
              { step: 6, title: "Lock Team & Launch Workspace", desc: "Finalize your group to unlock the collaborative FYP Workspace with milestones and Kanban boards." },
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

      {/* Frequently Asked Questions */}
      <LandingFaq />

      {/* Ready to Begin Bottom Banner */}
      <section className="py-16 sm:py-24 relative z-10">
        <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center space-y-5">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Ready to Build Your Final Year Project?
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 max-w-lg mx-auto leading-relaxed">
            Join ambitious university students collaborating on FYPMate, benchmark your ideas, and assemble your dream team today.
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

      {/* Footer */}
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
