// app/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { LandingThemeToggle } from "@/components/landing/LandingThemeToggle";
import { SupademoButton } from "@/components/landing/SupademoButton";

export default async function HomePage({
  searchParams,
}: {
  searchParams: { code?: string };
}) {
  // If OAuth code arrives at root (Supabase redirect fallback), forward it to callback
  if (searchParams?.code) {
    redirect(`/api/auth/callback?code=${searchParams.code}`);
  }

  // Check if user is already logged in - redirect to dashboard
  try {
    const user = await getCurrentUser();
    if (user && user.status === "ACTIVE") {
      redirect("/dashboard/discovery");
    }
  } catch {
    // If error checking session, just show landing page
    // This handles network errors gracefully
  }


  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 relative">
      {/* Subtle Grid Background - stays behind all content */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#e5e5e5_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e5_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:64px_64px] opacity-40 dark:opacity-100" style={{ zIndex: -1 }} />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-gray-100 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gray-900 dark:bg-white rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white dark:text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14v7" />
                </svg>
              </div>
              <span className="text-lg font-semibold text-gray-900 dark:text-white tracking-tight">FYP Finder</span>
            </div>

            {/* CTA + Theme Toggle */}
            <div className="flex items-center gap-2">
              <LandingThemeToggle />
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-white dark:text-gray-900 bg-gray-900 dark:bg-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 sm:pt-40 sm:pb-28">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-full mb-8">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
              <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">PAF-IAST Students Only</span>
            </div>

            {/* Main Heading - UNCHANGED */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-[1.1] tracking-tight">
              Find your FYP Partner at
              <br />
              <span className="text-gray-900 dark:text-white">PAF-IAST</span>
            </h1>

            {/* Subheading */}
            <p className="text-lg sm:text-xl text-gray-500 dark:text-gray-400 max-w-xl mx-auto mb-10 leading-relaxed">
              A university platform that helps PAF-IAST students find the right teammates for their Final Year Projects.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
              <Link
                href="/login"
                className="w-full sm:w-auto px-6 py-3 text-sm font-medium text-white dark:text-gray-900 bg-gray-900 dark:bg-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="10" height="10" fill="#F25022" />
                  <rect x="11" width="10" height="10" fill="#7FBA00" />
                  <rect y="11" width="10" height="10" fill="#00A4EF" />
                  <rect x="11" y="11" width="10" height="10" fill="#FFB900" />
                </svg>
                Continue with Microsoft
              </Link>
              <SupademoButton />
            </div>
          </div>

          {/* Demo Video */}
          <div className="max-w-4xl mx-auto">
            <div className="relative aspect-video rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden shadow-2xl">
              <iframe 
                className="absolute inset-0 w-full h-full block"
                src="https://www.youtube.com/embed/l5DJNJ_SBSU?si=AEzaXHlTThwBI7r3&autoplay=1&mute=1" 
                title="YouTube video player"
                frameBorder={0} 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                referrerPolicy="strict-origin-when-cross-origin" 
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </section>




      {/* Profile Preview Section */}
      <section className="py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
              Students Looking for Partners
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Login to unlock profiles and start connecting
            </p>
          </div>

          {/* Locked Profile Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Preview Card 1 */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
              <div className="p-5 border-b border-gray-100 dark:border-slate-700">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-900 dark:bg-white rounded-full flex items-center justify-center text-lg font-semibold text-white dark:text-gray-900 flex-shrink-0">
                    A
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Ahmed Khan</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">BSCS · 7th Semester</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Available</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative p-5">
                <div className="absolute inset-0 backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 z-10 flex items-center justify-center">
                  <Link href="/login" className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Login to view
                  </Link>
                </div>
                <div className="space-y-3 opacity-40">
                  <div className="flex flex-wrap gap-1.5">
                    <span className="px-2.5 py-1 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 text-xs rounded-md">React</span>
                    <span className="px-2.5 py-1 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 text-xs rounded-md">Node.js</span>
                    <span className="px-2.5 py-1 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 text-xs rounded-md">Python</span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Passionate developer interested in web technologies...</p>
                </div>
              </div>
            </div>

            {/* Preview Card 2 */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
              <div className="p-5 border-b border-gray-100 dark:border-slate-700">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-900 dark:bg-white rounded-full flex items-center justify-center text-lg font-semibold text-white dark:text-gray-900 flex-shrink-0">
                    S
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Sara Malik</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">BSSE · 8th Semester</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Available</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative p-5">
                <div className="absolute inset-0 backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 z-10 flex items-center justify-center">
                  <Link href="/login" className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Login to view
                  </Link>
                </div>
                <div className="space-y-3 opacity-40">
                  <div className="flex flex-wrap gap-1.5">
                    <span className="px-2.5 py-1 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 text-xs rounded-md">UI/UX</span>
                    <span className="px-2.5 py-1 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 text-xs rounded-md">Figma</span>
                    <span className="px-2.5 py-1 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 text-xs rounded-md">Flutter</span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Creative designer focusing on mobile-first experiences...</p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-10">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
            >
              View All Students
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Previous FYPs Section */}
      <section className="py-20 sm:py-28 bg-gray-50 dark:bg-slate-800/50 border-y border-gray-100 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
              Previous FYP Ideas
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              See what PAF-IAST students have built before
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* FYP 1 */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-md">Web App</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Smart Attendance System</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Face recognition-based attendance tracking for university classrooms with real-time reporting.</p>
              <div className="pt-4 border-t border-gray-100 dark:border-slate-700">
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Supervised by</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 blur-[3px] select-none">Dr. Ahmad Hassan</p>
              </div>
            </div>

            {/* FYP 2 */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-md">Mobile App</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Campus Navigation App</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Indoor navigation system for PAF-IAST campus with AR-based directions and building info.</p>
              <div className="pt-4 border-t border-gray-100 dark:border-slate-700">
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Supervised by</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 blur-[3px] select-none">Prof. Fatima Khan</p>
              </div>
            </div>

            {/* FYP 3 */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-2 py-1 rounded-md">AI/ML</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Exam Paper Generator</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">AI-powered system to generate balanced exam papers from question banks with difficulty scoring.</p>
              <div className="pt-4 border-t border-gray-100 dark:border-slate-700">
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Supervised by</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 blur-[3px] select-none">Dr. Imran Malik</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 sm:py-28 bg-gray-50 dark:bg-slate-800/50 border-y border-gray-100 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
              How It Works
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Six simple steps to find your FYP partner
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { step: 1, title: "Create Your Profile", desc: "Sign up and add your skills, projects, and interests." },
              { step: 2, title: "Discover Students", desc: "Use filters to find students who match your FYP needs." },
              { step: 3, title: "Send Message Request", desc: "Request permission to chat with potential partners." },
              { step: 4, title: "Chat in Real Time", desc: "Discuss ideas once messaging is approved." },
              { step: 5, title: "Send Partner Request", desc: "When ready, send a partner request to formalize." },
              { step: 6, title: "Form Your Team", desc: "Accept requests and lock your FYP group." },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 mx-auto bg-gray-900 dark:bg-white rounded-xl flex items-center justify-center text-lg font-semibold text-white dark:text-gray-900 mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-28">
        <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
            Ready to Find Your FYP Partner?
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-xl mx-auto">
            Join PAF-IAST students who have already found their perfect teammates.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white dark:text-gray-900 bg-gray-900 dark:bg-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
          >
            Get Started
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-slate-800 py-12 bg-gray-50 dark:bg-slate-800/50">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 bg-gray-900 dark:bg-white rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white dark:text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                  </svg>
                </div>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">FYP Finder</span>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                A platform to help university students find the perfect teammates for Final Year Projects.
              </p>
            </div>

            {/* Open Source */}
            {/* <div>
              <h4 className="text-gray-900 font-semibold mb-4">Open Source</h4>
              <p className="text-gray-500 text-sm mb-4">
                This project is open source and available for educational purposes.
              </p>
              <a
                href="https://github.com/Muhammad-BinMushtaq/fypfinder"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" />
                </svg>
                View on GitHub
              </a>
            </div> */}

            {/* Supervisor */}
            <div>
              <h4 className="text-gray-900 dark:text-white font-semibold mb-4">Supervised By</h4>
              <p className="text-gray-900 dark:text-white font-medium text-sm mb-1">Dr. Muhammad Shuaib Qureshi</p>
              <p className="text-gray-500 dark:text-gray-400 text-xs mb-3">Chief Scientific Officer at Datalligence.pk</p>
              <a
                href="https://datalligence.pk/wps-members/dr-muhammad-shuaib-qureshi/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                View Profile
              </a>
            </div>
          </div>

          {/* Creator */}
          <div className="pt-8 border-t border-gray-200 dark:border-slate-700">
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">
              Built by <span className="text-gray-900 dark:text-white font-medium">Muhammad bin Mushtaq</span>
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://www.linkedin.com/in/muhammad-bin-mushtaq1/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-gray-100 dark:bg-slate-700 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              <a
                href="https://github.com/Muhammad-BinMushtaq"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-gray-100 dark:bg-slate-700 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Bottom */}
          <div className="pt-8 mt-8 border-t border-gray-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-400 dark:text-gray-500">
              © 2026 FYP Finder. Built for academic purposes.
            </p>
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors">
                Privacy Policy
              </Link>


            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
