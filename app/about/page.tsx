import type { Metadata } from "next";
import Link from "next/link";
import { 
  GraduationCap, 
  Users, 
  Brain, 
  Sparkles, 
  ExternalLink, 
  ArrowRight
} from "lucide-react";
import { LandingThemeToggle } from "@/components/landing/LandingThemeToggle";

export const metadata: Metadata = {
  title: "About | FYPMate",
  description:
    "Learn about FYPMate: A student collaboration and AI idea validation platform built by Muhammad bin Mushtaq with academic mentorship from Dr. Muhammad Shuaib Qureshi.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About FYPMate",
    description:
      "A platform helping university students find FYP teammates and validate project proposals.",
    url: "https://fypmate.com/about",
    siteName: "FYPMate",
    type: "website",
  },
};

export default function AboutPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AboutPage",
        "@id": "https://fypmate.com/about#webpage",
        "url": "https://fypmate.com/about",
        "name": "About FYPMate",
        "description": "About FYPMate: Student teammate discovery and AI idea validation platform created by Muhammad bin Mushtaq with mentorship from Dr. Muhammad Shuaib Qureshi.",
        "isPartOf": {
          "@type": "WebSite",
          "@id": "https://fypmate.com/#website",
          "name": "FYPMate",
          "url": "https://fypmate.com"
        }
      },
      {
        "@type": "Person",
        "@id": "https://fypmate.com/about#creator",
        "name": "Muhammad bin Mushtaq",
        "jobTitle": "Creator & Developer",
        "affiliation": {
          "@type": "EducationalOrganization",
          "name": "Pak-Austria Fachhochschule: Institute of Applied Sciences and Technology (PAF-IAST)",
          "url": "https://paf-iast.edu.pk"
        },
        "sameAs": [
          "https://www.linkedin.com/in/muhammad-bin-mushtaq1/",
          "https://github.com/Muhammad-BinMushtaq"
        ]
      },
      {
        "@type": "Person",
        "@id": "https://fypmate.com/about#mentor",
        "name": "Dr. Muhammad Shuaib Qureshi",
        "jobTitle": "University Professor & Academic Mentor",
        "worksFor": {
          "@type": "Organization",
          "name": "Datalligence.pk",
          "url": "https://www.datalligence.pk"
        },
        "sameAs": [
          "https://www.datalligence.pk/team",
          "https://www.linkedin.com/in/qureshi2015/"
        ]
      }
    ]
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-100 transition-colors">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800 transition-colors">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 bg-slate-900 text-white dark:bg-white dark:text-zinc-900 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">FYPMate</span>
            </Link>

            <div className="flex items-center gap-3">
              <Link
                href="/idea-validator"
                className="hidden sm:inline-flex text-sm text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors px-2 py-1"
              >
                Idea Validator
              </Link>
              <Link
                href="/privacy"
                className="hidden sm:inline-flex text-sm text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors px-2 py-1"
              >
                Privacy
              </Link>
              <LandingThemeToggle />
              <Link
                href="/"
                className="px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-700 dark:text-zinc-200 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-lg transition-colors"
              >
                Home
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-28 pb-20 px-6 max-w-4xl mx-auto space-y-14">
        
        {/* Header */}
        <header className="space-y-4">
          <p className="text-xs font-semibold tracking-wider uppercase text-slate-500 dark:text-zinc-400">
            About the Platform
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            Connecting students, building better Final Year Projects.
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-zinc-400 leading-relaxed max-w-3xl">
            FYPMate is a web platform designed to help university students discover suitable teammates and evaluate project proposals with AI before formal academic submission.
          </p>
        </header>

        {/* What FYPMate Does */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">What FYPMate Does</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800/80 space-y-2">
              <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 flex items-center justify-center mb-3">
                <Users className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-base">Teammate Discovery</h3>
              <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                Search and connect with students based on specific technical skills, domain interests, and availability so teams have complementary strengths.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800/80 space-y-2">
              <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 flex items-center justify-center mb-3">
                <Brain className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-base">AI Proposal Assessment</h3>
              <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                Evaluate project concepts across novelty, feasibility, timeline, and difficulty, helping students identify potential gaps early on.
              </p>
            </div>
          </div>
        </section>

        {/* Why it was created */}
        <section className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800/80 space-y-3">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">The Motivation</h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-400 leading-relaxed">
            Finding compatible project partners is one of the most common hurdles students face in their final year. Misaligned skills, unclear expectations, and unverified proposals often lead to difficult project cycles. FYPMate was built to offer a simple, dedicated space where students can find each other and refine their ideas effectively.
          </p>
        </section>

        {/* Credits & People - Placed cleanly at the bottom, humble & professional */}
        <section className="pt-6 border-t border-slate-200 dark:border-zinc-800/80 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Project Credits</h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Development and academic mentorship</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Muhammad bin Mushtaq */}
            <div className="p-5 rounded-xl bg-white dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800/80 flex flex-col justify-between space-y-4">
              <div className="space-y-1.5">
                <h3 className="font-semibold text-slate-900 dark:text-white text-base">Muhammad bin Mushtaq</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Creator & Developer</p>
                <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed pt-1">
                  Conceived, designed, and developed FYPMate as an undergraduate student at Pak-Austria Fachhochschule: Institute of Applied Sciences and Technology (PAF-IAST).
                </p>
              </div>
              <div className="flex items-center gap-3 pt-2 text-xs">
                <a
                  href="https://www.linkedin.com/in/muhammad-bin-mushtaq1/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <span>LinkedIn</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href="https://github.com/Muhammad-BinMushtaq"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <span>GitHub</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Dr. Muhammad Shuaib Qureshi */}
            <div className="p-5 rounded-xl bg-white dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800/80 flex flex-col justify-between space-y-4">
              <div className="space-y-1.5">
                <h3 className="font-semibold text-slate-900 dark:text-white text-base">Dr. Muhammad Shuaib Qureshi</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Academic Mentor</p>
                <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed pt-1">
                  University professor and Chief Scientific Officer at Datalligence.pk. Provided mentorship, feedback, and academic guidance during the project’s development.
                </p>
              </div>
              <div className="flex items-center gap-3 pt-2 text-xs">
                <a
                  href="https://www.datalligence.pk/team"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <span>Datalligence Team</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href="https://www.linkedin.com/in/qureshi2015/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <span>LinkedIn</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-2xl bg-slate-100/70 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800/80">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white text-base">Have an FYP idea to test?</h3>
            <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">Use our free validator tool to get instant feedback.</p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link
              href="/idea-validator"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-zinc-900 text-xs font-medium hover:bg-slate-800 dark:hover:bg-zinc-200 transition-colors"
            >
              <span>Try Validator</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-6 border-t border-slate-200 dark:border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-zinc-400">
          <p>© 2026 FYPMate. Created by Muhammad bin Mushtaq.</p>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Home
            </Link>
            <Link href="/idea-validator" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Idea Validator
            </Link>
            <Link href="/privacy" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Privacy Policy
            </Link>
          </div>
        </footer>
      </main>
    </div>
  );
}
