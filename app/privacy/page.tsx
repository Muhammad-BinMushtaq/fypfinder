import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap, ShieldCheck } from "lucide-react";
import { LandingThemeToggle } from "@/components/landing/LandingThemeToggle";

export const metadata: Metadata = {
  title: "Privacy Policy | FYPMate",
  description: "Privacy Policy for FYPMate - Learn how we collect, safeguard, and process student data with academic integrity.",
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gradient-to-br dark:from-zinc-950 dark:via-neutral-950 dark:to-zinc-950 text-slate-800 dark:text-zinc-100 transition-colors">
      {/* Subtle Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-indigo-500/5 dark:bg-indigo-500/10 blur-3xl" />
        <div className="absolute top-1/3 -left-40 h-96 w-96 rounded-full bg-violet-500/5 dark:bg-violet-500/10 blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/85 dark:bg-neutral-950/80 backdrop-blur-lg border-b border-slate-200/80 dark:border-white/10 transition-colors">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-slate-900 text-white dark:bg-gradient-to-tr dark:from-white dark:to-gray-200 dark:text-gray-900 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">FYPMate</span>
            </Link>

            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/about"
                className="hidden sm:inline-flex text-sm font-medium text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white transition-colors px-2.5 py-1.5"
              >
                About Us
              </Link>
              <Link
                href="/idea-validator"
                className="hidden sm:inline-flex text-sm font-medium text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white transition-colors px-2.5 py-1.5"
              >
                Idea Validator
              </Link>
              <LandingThemeToggle />
              <Link
                href="/"
                className="px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-700 dark:text-zinc-200 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-lg transition-colors"
              >
                ← Home
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="relative pt-28 pb-20 px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="bg-white dark:bg-white/5 border border-slate-200/90 dark:border-white/10 rounded-3xl p-6 sm:p-12 shadow-sm dark:shadow-2xl backdrop-blur-sm transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Privacy Policy
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
                Last updated: October 10, 2026 • Effective for all FYPMate services
              </p>
            </div>
          </div>

          <div className="space-y-10 text-slate-700 dark:text-zinc-300 text-sm sm:text-base leading-relaxed mt-8">
            {/* Introduction */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">1. Introduction</h2>
              <p>
                FYPMate ("we," "our," or "the platform") is dedicated to protecting student privacy while facilitating academic collaboration. 
                This Privacy Policy outlines how your personal information is collected, stored, protected, and processed when using our 
                Final Year Project (FYP) partner discovery and AI idea validation tools.
              </p>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-4">
                <strong>Academic Scope:</strong> FYPMate is an educational technology solution designed for university students 
                (primarily Pak-Austria Fachhochschule: Institute of Applied Sciences and Technology, PAF-IAST) 
                to assemble competent FYP groups and benchmark project viability.
              </p>
            </section>

            {/* Information We Collect */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">2. Information We Collect</h2>
              <p>We collect only the information necessary to provide peer matching and academic validation services:</p>
              
              <div className="space-y-3 pl-2">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">2.1 Institutional Account Data</h3>
                  <ul className="list-disc list-inside space-y-1 mt-1 text-slate-600 dark:text-zinc-400 text-sm">
                    <li>Full name and university email address (<code className="text-xs bg-slate-100 dark:bg-white/10 px-1.5 py-0.5 rounded">@paf-iast.edu.pk</code>) retrieved via Microsoft Azure AD.</li>
                    <li>Student registration number, academic department, and current semester.</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">2.2 Profile & Technical Skills</h3>
                  <ul className="list-disc list-inside space-y-1 mt-1 text-slate-600 dark:text-zinc-400 text-sm">
                    <li>Bio, technical skill proficiencies, and project interests.</li>
                    <li>Portfolio hyperlinks (e.g., GitHub, LinkedIn, personal website).</li>
                    <li>Availability status (Available, Busy, Away).</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">2.3 Communication & Proposal Data</h3>
                  <ul className="list-disc list-inside space-y-1 mt-1 text-slate-600 dark:text-zinc-400 text-sm">
                    <li>Direct messages and chat history exchanged between students on the platform.</li>
                    <li>Teammate connection requests and group formation invitations.</li>
                    <li>Project proposal drafts and abstracts submitted to the AI FYP Idea Validator.</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* How We Use Your Information */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">3. How We Use Your Information</h2>
              <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-zinc-400 text-sm">
                <li><strong className="text-slate-800 dark:text-zinc-200">Authentication & Verification:</strong> Confirming genuine university student enrollment.</li>
                <li><strong className="text-slate-800 dark:text-zinc-200">Peer Teammate Matching:</strong> Allowing fellow students to discover partners with complementary skill sets.</li>
                <li><strong className="text-slate-800 dark:text-zinc-200">Real-Time Messaging:</strong> Powering instant communication between students who mutually accept chat requests.</li>
                <li><strong className="text-slate-800 dark:text-zinc-200">AI Feasibility Benchmarking:</strong> Evaluating proposed project ideas across Novelty, Technical Feasibility, Timeline, and Hardware constraints.</li>
              </ul>
            </section>

            {/* Messaging Policy & Administrative Audit - LEGAL REFINEMENT */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">4. Communications Policy & Administrative Audit</h2>
              <div className="rounded-2xl border border-indigo-200/80 dark:border-indigo-500/30 bg-indigo-50/50 dark:bg-indigo-950/20 p-5 space-y-3">
                <h3 className="font-bold text-indigo-950 dark:text-indigo-200">Student Safety, Anti-Harassment & Moderation Standards</h3>
                <p className="text-slate-700 dark:text-zinc-300 text-sm leading-relaxed">
                  Messages sent across FYPMate are transmitted over encrypted TLS channels and stored securely in our PostgreSQL database. 
                  Because FYPMate is an official academic collaboration tool governed by university codes of conduct, 
                  <strong> communications are not end-to-end encrypted</strong>.
                </p>
                <p className="text-slate-700 dark:text-zinc-300 text-sm leading-relaxed">
                  To protect students from cyber-harassment, threats, blackmail, academic misconduct, or fraud, authorized platform administrators 
                  maintain read-only access to conversation history. <strong>Such access is strictly restricted to:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1.5 text-slate-700 dark:text-zinc-300 text-sm pl-2">
                  <li>Investigating formal reports or complaints of harassment, abusive language, or inappropriate conduct filed by a student.</li>
                  <li>Inquiring into reports of academic fraud, intellectual property theft, or violation of institutional project guidelines.</li>
                  <li>Resolving critical technical errors or verifying system integrity under audit logging.</li>
                </ul>
                <p className="text-xs text-slate-600 dark:text-zinc-400 italic">
                  Administrators do not engage in arbitrary or casual surveillance of student communications. Every administrative access event is logged for accountability.
                </p>
              </div>
            </section>

            {/* Data Sharing */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">5. Data Sharing and Third Parties</h2>
              <p>We do <strong className="text-slate-900 dark:text-white">not</strong> sell, rent, or monetize student personal information. Data is shared exclusively under these terms:</p>
              <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-zinc-400 text-sm">
                <li><strong className="text-slate-800 dark:text-zinc-200">With Fellow Students:</strong> Your public profile information (name, skills, bio) is visible to authenticated students seeking partners.</li>
                <li><strong className="text-slate-800 dark:text-zinc-200">Infrastructure Providers:</strong> Supabase (PostgreSQL database & authentication) and Microsoft Azure (OAuth Single Sign-On).</li>
                <li><strong className="text-slate-800 dark:text-zinc-200">Legal & Institutional Compliance:</strong> When required by university disciplinary committees or law enforcement in cases of criminal threats or legal subpoenas.</li>
              </ul>
            </section>

            {/* Security */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">6. Security & Storage</h2>
              <ul className="list-disc list-inside space-y-1.5 text-slate-600 dark:text-zinc-400 text-sm">
                <li>Data is hosted in PostgreSQL databases secured with SSL encryption in transit and at rest.</li>
                <li>Authentication session tokens are stored in secure, <code className="text-xs bg-slate-100 dark:bg-white/10 px-1 py-0.5 rounded">httpOnly</code> cookies.</li>
                <li>Row-Level Security (RLS) policies restrict database read/write access to authenticated user scopes.</li>
              </ul>
            </section>

            {/* Retention & Rights */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">7. Student Rights & Account Deletion</h2>
              <p>
                Students have full access to view, modify, or request deletion of their profile data at any time via the Settings dashboard. 
                Upon formal account deletion request, user identification data is purged within 30 days, 
                except where retention is required for active academic dispute resolution.
              </p>
            </section>

            {/* Contact */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">8. Contact & Administration</h2>
              <p>For questions or concerns regarding this policy, contact the platform development and administration team:</p>
              <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-5 border border-slate-200 dark:border-white/10 space-y-2">
                <p className="font-bold text-slate-900 dark:text-white">Muhammad bin Mushtaq</p>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Founder & Lead Software Architect • PAF-IAST</p>
                <div className="flex items-center gap-4 pt-2">
                  <a
                    href="https://www.linkedin.com/in/muhammad-bin-mushtaq1/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    LinkedIn Profile →
                  </a>
                  <a
                    href="https://github.com/Muhammad-BinMushtaq"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    GitHub Profile →
                  </a>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-zinc-400">
          <p>© 2026 FYPMate. Conceived, designed & built by Muhammad bin Mushtaq at PAF-IAST.</p>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Home
            </Link>
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
        </footer>
      </main>
    </div>
  );
}
