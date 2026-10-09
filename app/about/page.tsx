import type { Metadata } from "next";
import Link from "next/link";
import { 
  GraduationCap, 
  Sparkles, 
  Users, 
  Brain, 
  Compass, 
  CheckCircle2, 
  ExternalLink, 
  Award,
  ArrowRight
} from "lucide-react";

export const metadata: Metadata = {
  title: "About Us | FYPMate - AI FYP Teammate Discovery & Idea Validation",
  description:
    "Learn about FYPMate: the AI-driven Final Year Project collaboration platform created by Muhammad bin Mushtaq under the supervision of Dr. Muhammad Shuaib Qureshi at PAF-IAST.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About FYPMate — Built for University Students & Academic Excellence",
    description:
      "Bridging student talent and academic rigor with AI-powered team formation and FYP project validation at fypmate.com.",
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
        "description": "About FYPMate: The student teammate discovery and AI idea validation platform created by Muhammad bin Mushtaq and supervised by Dr. Muhammad Shuaib Qureshi at PAF-IAST.",
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
        "jobTitle": "Founder, Sole Creator & Lead Developer",
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
        "@id": "https://fypmate.com/about#supervisor",
        "name": "Dr. Muhammad Shuaib Qureshi",
        "jobTitle": "University Professor & Academic Advisor",
        "worksFor": {
          "@type": "Organization",
          "name": "Datalligence.pk",
          "url": "https://datalligence.pk"
        },
        "sameAs": [
          "https://datalligence.pk/wps-members/dr-muhammad-shuaib-qureshi/"
        ]
      },
      {
        "@type": "EducationalOrganization",
        "@id": "https://paf-iast.edu.pk/#organization",
        "name": "Pak-Austria Fachhochschule: Institute of Applied Sciences and Technology",
        "alternateName": "PAF-IAST",
        "url": "https://paf-iast.edu.pk",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Haripur",
          "addressRegion": "Khyber Pakhtunkhwa",
          "addressCountry": "PK"
        }
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-neutral-950 to-zinc-950 text-zinc-100">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Subtle Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute top-1/3 -left-40 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-neutral-950/80 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-tr from-white to-gray-200 rounded-xl flex items-center justify-center text-gray-950 shadow-md group-hover:scale-105 transition-transform">
                <GraduationCap className="w-5 h-5 text-gray-900" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">FYPMate</span>
            </Link>

            <div className="flex items-center gap-3">
              <Link
                href="/idea-validator"
                className="hidden sm:inline-flex text-sm text-zinc-300 hover:text-white transition-colors px-3 py-1.5"
              >
                Idea Validator
              </Link>
              <Link
                href="/"
                className="px-4 py-2 text-sm font-medium text-zinc-200 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative pt-28 pb-20 px-6 lg:px-8 max-w-5xl mx-auto space-y-16">
        
        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold tracking-wide text-zinc-300 uppercase">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Academic Innovation & Collaboration</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Empowering Students to Build Outstanding FYPs
          </h1>

          <p className="text-base sm:text-lg text-zinc-400 leading-relaxed">
            FYPMate was built to solve the universal challenge faced by university students: 
            finding the right project teammates and validating academic ideas before submitting formal proposals.
          </p>
        </div>

        {/* Mission Card */}
        <section className="bg-white/5 border border-white/10 rounded-3xl p-8 sm:p-12 shadow-2xl backdrop-blur-sm relative overflow-hidden">
          <div className="space-y-6">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Compass className="w-6 h-6" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-white">Our Mission</h2>
            
            <p className="text-zinc-300 leading-relaxed text-base sm:text-lg">
              Every year, thousands of final-year undergraduate and graduate students struggle with partner mismatches, lack of cross-disciplinary skill alignment, and unpredictable supervisor proposal evaluations. 
            </p>
            <p className="text-zinc-400 leading-relaxed text-sm sm:text-base">
              <strong>FYPMate</strong> bridges this gap by creating an intuitive, verified platform where students can showcase verified skills, discover like-minded collaborators, and utilize an advanced AI-powered Feasibility Engine to evaluate project ideas across standardized academic rubrics.
            </p>
          </div>
        </section>

        {/* Core Pillars */}
        <section className="space-y-6">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">What Makes FYPMate Unique</h2>
            <p className="text-sm text-zinc-400 mt-2">Engineered specifically for university academia, research rigor, and engineering teams.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 hover:border-white/20 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
                <Brain className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-white">AI Feasibility Engine</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Evaluates project proposals across novelty, technical difficulty, timeline feasibility, team fit, and hardware constraints with actionable feedback.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 hover:border-white/20 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-white">Skill-Based Teammate Matching</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Connects software developers, data scientists, AI engineers, and hardware specialists so teams have balanced and complete skill sets.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 hover:border-white/20 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-white">Benchmark Duplicate Protection</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Cross-references historical departmental submissions to help teams avoid repetitive ideas and formulate distinctive, novel project contributions.
              </p>
            </div>
          </div>
        </section>

        {/* Project Leadership & Credits */}
        <section className="space-y-8">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Project Leadership & Credits</h2>
            <p className="text-sm text-zinc-400 mt-2">
              Developed as an applied academic initiative to advance technology-driven collaboration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Creator Card */}
            <div className="bg-gradient-to-b from-white/[0.07] to-white/[0.02] border border-white/10 rounded-3xl p-8 space-y-6 flex flex-col justify-between hover:border-white/20 transition-all shadow-xl">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center font-bold text-lg text-indigo-300">
                    MB
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Muhammad bin Mushtaq</h3>
                    <p className="text-xs sm:text-sm text-indigo-400 font-medium">Founder & Sole Creator</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-zinc-300 leading-relaxed">
                  <p>
                    <strong>Muhammad bin Mushtaq</strong> is the founder, ideator, and developer behind FYPMate. Conceived entirely as his original brainchild at <strong>Pak-Austria Fachhochschule: Institute of Applied Sciences and Technology (PAF-IAST)</strong>, he designed the user experience, engineered the complete full-stack web architecture, and built the AI idea validation engine from the ground up.
                  </p>
                  <p className="text-zinc-400 text-xs">
                    Sole creator responsible for the concept, system architecture, database design, Next.js engineering, and AI evaluation pipeline.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center gap-3">
                <a
                  href="https://www.linkedin.com/in/muhammad-bin-mushtaq1/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-zinc-200 hover:text-white transition-colors"
                >
                  <span>LinkedIn Profile</span>
                  <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                </a>

                <a
                  href="https://github.com/Muhammad-BinMushtaq"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-zinc-200 hover:text-white transition-colors"
                >
                  <span>GitHub Profile</span>
                  <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                </a>
              </div>
            </div>

            {/* Supervisor Card */}
            <div className="bg-gradient-to-b from-white/[0.07] to-white/[0.02] border border-white/10 rounded-3xl p-8 space-y-6 flex flex-col justify-between hover:border-white/20 transition-all shadow-xl">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-violet-600/30 border border-violet-500/40 flex items-center justify-center font-bold text-lg text-violet-300">
                    SQ
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Dr. Muhammad Shuaib Qureshi</h3>
                    <p className="text-xs sm:text-sm text-violet-400 font-medium">Academic Mentor & Professor</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-zinc-300 leading-relaxed">
                  <p>
                    <strong>Dr. Muhammad Shuaib Qureshi</strong> is Muhammad’s university professor and academic mentor. During the development of the platform, he offered valuable academic advice, research guidance, and thoughtful suggestions that helped refine the evaluation rubrics and academic alignment of the project.
                  </p>
                  <p className="text-zinc-400 text-xs">
                    University professor, research advisor, and Chief Scientific Officer at Datalligence.pk.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center gap-3">
                <a
                  href="https://datalligence.pk/wps-members/dr-muhammad-shuaib-qureshi/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-zinc-200 hover:text-white transition-colors"
                >
                  <span>View Professor Profile</span>
                  <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                </a>
              </div>
            </div>
          </div>

          {/* Academic Institution Banner */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-1">
              <p className="text-xs uppercase font-bold tracking-wider text-zinc-400">Host Academic Institution</p>
              <h4 className="text-lg sm:text-xl font-bold text-white">Pak-Austria Fachhochschule: Institute of Applied Sciences and Technology</h4>
              <p className="text-sm text-zinc-400">Mang, Haripur, Khyber Pakhtunkhwa, Pakistan (PAF-IAST)</p>
            </div>

            <a
              href="https://paf-iast.edu.pk"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-sm font-medium text-white transition-colors shrink-0"
            >
              <span>Visit University Portal</span>
              <ExternalLink className="w-4 h-4 text-zinc-300" />
            </a>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="bg-gradient-to-r from-indigo-900/40 via-violet-900/40 to-indigo-900/40 border border-indigo-500/30 rounded-3xl p-8 sm:p-12 text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Ready to find your partner or test your FYP idea?
          </h2>
          <p className="text-zinc-300 max-w-xl mx-auto text-sm sm:text-base">
            Start collaborating with ambitious peers today, benchmark your proposals, and build something exceptional.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-gray-900 font-semibold hover:bg-gray-100 transition-colors shadow-lg"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/idea-validator"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-semibold transition-colors"
            >
              <span>Test AI Idea Validator</span>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <p>© 2026 FYPMate. Built for academic purposes at PAF-IAST.</p>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <Link href="/idea-validator" className="hover:text-white transition-colors">
              Idea Validator
            </Link>
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
          </div>
        </footer>
      </main>
    </div>
  );
}
