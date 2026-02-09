// app/page.tsx
import Link from "next/link";


export default function HomePage() {


  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-neutral-950 to-zinc-950">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-neutral-950/80 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-neutral-200 to-neutral-400 rounded-xl flex items-center justify-center text-xl shadow-lg text-neutral-900">
                🎓
              </div>
              <span className="text-xl font-bold text-white">FYP Finder</span>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="px-5 py-2.5 text-sm font-semibold text-neutral-900 bg-white rounded-lg hover:bg-neutral-100 transition-all shadow-lg"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-32 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neutral-800/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neutral-700/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-neutral-800/10 to-neutral-600/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-8">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
            <span className="text-sm text-gray-300 font-medium">FYP Partner Finder Pak-Austria Institute </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            <span className="bg-gradient-to-r from-neutral-100 via-neutral-200 to-neutral-400 bg-clip-text text-transparent">
             Find your FYP Partner at 
            </span>
            <br />
            PAF-IAST
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            A university social interaction platform where PAF-IAST students can create profiles,
            discover teammates, send message and partner requests, and live chat in real time.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-8 py-4 text-lg font-semibold text-neutral-900 bg-white rounded-xl hover:bg-neutral-100 transition-all shadow-xl hover:scale-105"
            >
              Start Finding Partners →
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 text-lg font-semibold text-gray-300 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all"
            >
              I have an account
            </Link>
          </div>

          {/* Stats removed per request */}
        </div>
      </section>

      {/* Profile Preview Section - Locked Cards */}
      <section className="relative py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Students Looking for Partners
            </h2>
            <p className="text-gray-400">
              Login to unlock profiles and start connecting
            </p>
          </div>

          {/* Locked Profile Cards - Horizontal Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Preview Card 1 - Ahmed */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-neutral-700/20 to-neutral-600/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
              <div className="relative bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden">
                {/* Visible Header - Name & Avatar */}
                <div className="p-5 border-b border-white/10">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-neutral-200 to-neutral-400 rounded-full flex items-center justify-center text-xl font-bold text-neutral-900 flex-shrink-0">
                      A
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white text-lg">Ahmed Khan</h3>
                      <p className="text-sm text-gray-400">BSCS • 7th Semester</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        <span className="text-xs text-green-400">Looking for partner</span>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Locked Content */}
                <div className="relative p-5">
                  <div className="absolute inset-0 backdrop-blur-sm bg-slate-900/60 z-10 flex items-center justify-center">
                    <Link href="/login" className="flex flex-col items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
                      <svg className="w-6 h-6 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <span className="text-sm text-white font-medium">Login to unlock profile</span>
                    </Link>
                  </div>
                  {/* Blurred content preview */}
                  <div className="space-y-4 opacity-40">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Skills</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-white/10 text-gray-200 text-xs rounded-full">React</span>
                        <span className="px-3 py-1 bg-white/10 text-gray-200 text-xs rounded-full">Node.js</span>
                        <span className="px-3 py-1 bg-white/10 text-gray-200 text-xs rounded-full">Python</span>
                        <span className="px-3 py-1 bg-white/10 text-gray-200 text-xs rounded-full">+2 more</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Bio</p>
                      <p className="text-sm text-gray-400">Passionate developer interested in web technologies and AI...</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Projects</p>
                      <p className="text-sm text-gray-400">3 projects showcased</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Preview Card 2 - Sara */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-neutral-700/20 to-neutral-600/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
              <div className="relative bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden">
                <div className="p-5 border-b border-white/10">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-neutral-200 to-neutral-400 rounded-full flex items-center justify-center text-xl font-bold text-neutral-900 flex-shrink-0">
                      S
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white text-lg">Sara Malik</h3>
                      <p className="text-sm text-gray-400">BSSE • 8th Semester</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        <span className="text-xs text-green-400">Available for team</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="relative p-5">
                  <div className="absolute inset-0 backdrop-blur-sm bg-slate-900/60 z-10 flex items-center justify-center">
                    <Link href="/login" className="flex flex-col items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
                      <svg className="w-6 h-6 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <span className="text-sm text-white font-medium">Login to unlock profile</span>
                    </Link>
                  </div>
                  <div className="space-y-4 opacity-40">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Skills</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-white/10 text-gray-200 text-xs rounded-full">UI/UX</span>
                        <span className="px-3 py-1 bg-white/10 text-gray-200 text-xs rounded-full">Figma</span>
                        <span className="px-3 py-1 bg-white/10 text-gray-200 text-xs rounded-full">Flutter</span>
                        <span className="px-3 py-1 bg-white/10 text-gray-200 text-xs rounded-full">+1 more</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Bio</p>
                      <p className="text-sm text-gray-400">Creative designer with a focus on mobile-first experiences...</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Projects</p>
                      <p className="text-sm text-gray-400">5 projects showcased</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Preview Card 3 - Usman */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-neutral-700/20 to-neutral-600/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
              <div className="relative bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden">
                <div className="p-5 border-b border-white/10">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-neutral-200 to-neutral-400 rounded-full flex items-center justify-center text-xl font-bold text-neutral-900 flex-shrink-0">
                      U
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white text-lg">Usman Raza</h3>
                      <p className="text-sm text-gray-400">BSCS • 7th Semester</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                        <span className="text-xs text-amber-400">Has 1 partner</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="relative p-5">
                  <div className="absolute inset-0 backdrop-blur-sm bg-slate-900/60 z-10 flex items-center justify-center">
                    <Link href="/login" className="flex flex-col items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
                      <svg className="w-6 h-6 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <span className="text-sm text-white font-medium">Login to unlock profile</span>
                    </Link>
                  </div>
                  <div className="space-y-4 opacity-40">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Skills</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-white/10 text-gray-200 text-xs rounded-full">ML</span>
                        <span className="px-3 py-1 bg-white/10 text-gray-200 text-xs rounded-full">TensorFlow</span>
                        <span className="px-3 py-1 bg-white/10 text-gray-200 text-xs rounded-full">Data Science</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Bio</p>
                      <p className="text-sm text-gray-400">Data enthusiast building intelligent systems...</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Projects</p>
                      <p className="text-sm text-gray-400">4 projects showcased</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Preview Card 4 - Fatima */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-neutral-700/20 to-neutral-600/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
              <div className="relative bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden">
                <div className="p-5 border-b border-white/10">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-neutral-200 to-neutral-400 rounded-full flex items-center justify-center text-xl font-bold text-neutral-900 flex-shrink-0">
                      F
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white text-lg">Fatima Zahid</h3>
                      <p className="text-sm text-gray-400">BSSE • 8th Semester</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        <span className="text-xs text-green-400">Looking for partner</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="relative p-5">
                  <div className="absolute inset-0 backdrop-blur-sm bg-slate-900/60 z-10 flex items-center justify-center">
                    <Link href="/login" className="flex flex-col items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
                      <svg className="w-6 h-6 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <span className="text-sm text-white font-medium">Login to unlock profile</span>
                    </Link>
                  </div>
                  <div className="space-y-4 opacity-40">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Skills</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-white/10 text-gray-200 text-xs rounded-full">Java</span>
                        <span className="px-3 py-1 bg-white/10 text-gray-200 text-xs rounded-full">Spring Boot</span>
                        <span className="px-3 py-1 bg-white/10 text-gray-200 text-xs rounded-full">AWS</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Bio</p>
                      <p className="text-sm text-gray-400">Backend developer specializing in scalable systems...</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Projects</p>
                      <p className="text-sm text-gray-400">2 projects showcased</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA below cards */}
          <div className="text-center mt-10">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-neutral-900 bg-white rounded-xl hover:bg-neutral-100 transition-all shadow-lg"
            >
              Create Your Profile
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative py-20 sm:py-32 bg-gradient-to-b from-transparent via-neutral-950/50 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-gray-400">
              A clear 6-step flow for PAFAIST FYP collaboration
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative text-center">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-neutral-200 to-neutral-400 rounded-2xl flex items-center justify-center text-2xl font-bold text-neutral-900 mb-6 shadow-lg shadow-black/30">
                1
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Create Your Profile</h3>
              <p className="text-gray-400">
                Sign up and add skills, projects, interests, and availability.
              </p>
              {/* Connector line */}
              <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-white/20 to-transparent"></div>
            </div>

            {/* Step 2 */}
            <div className="relative text-center">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-neutral-200 to-neutral-400 rounded-2xl flex items-center justify-center text-2xl font-bold text-neutral-900 mb-6 shadow-lg shadow-black/30">
                2
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Discover Students</h3>
              <p className="text-gray-400">
                Use filters to find students who match your FYP needs.
              </p>
              <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-white/20 to-transparent"></div>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-neutral-200 to-neutral-400 rounded-2xl flex items-center justify-center text-2xl font-bold text-neutral-900 mb-6 shadow-lg shadow-black/30">
                3
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Send Message Request</h3>
              <p className="text-gray-400">
                Request permission to chat so conversations stay focused and relevant.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            {/* Step 4 */}
            <div className="relative text-center">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-neutral-200 to-neutral-400 rounded-2xl flex items-center justify-center text-2xl font-bold text-neutral-900 mb-6 shadow-lg shadow-black/30">
                4
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Chat in Real Time</h3>
              <p className="text-gray-400">
                Discuss ideas instantly once messaging is allowed.
              </p>
              <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-white/20 to-transparent"></div>
            </div>

            {/* Step 5 */}
            <div className="relative text-center">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-neutral-200 to-neutral-400 rounded-2xl flex items-center justify-center text-2xl font-bold text-neutral-900 mb-6 shadow-lg shadow-black/30">
                5
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Send Partner Request</h3>
              <p className="text-gray-400">
                When ready, send a partner request to formalize the team.
              </p>
              <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-white/20 to-transparent"></div>
            </div>

            {/* Step 6 */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-neutral-200 to-neutral-400 rounded-2xl flex items-center justify-center text-2xl font-bold text-neutral-900 mb-6 shadow-lg shadow-black/30">
                6
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Form and Lock Team</h3>
              <p className="text-gray-400">
                Accept requests, finalize your group, and move forward with FYP work.
              </p>
            </div>
          </div>
        </div>
      </section>

     

      

     

      {/* CTA Section */}
      <section className="relative py-20 sm:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="p-8 sm:p-12 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-sm">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to Find Your FYP Partner?
            </h2>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto">
              Join students who have already found their perfect teammates. 
              Start your FYP journey today.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold text-neutral-900 bg-white rounded-xl hover:bg-neutral-100 transition-all shadow-xl hover:scale-105"
            >
              Get Started for Free
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-lg shadow-lg">
                  🎓
                </div>
                <span className="text-xl font-bold text-white">FYP Finder</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                A dedicated platform designed to help university students find the perfect teammates for their Final Year Projects.
              </p>
            
            </div>

            {/* Open Source */}
            <div>
              <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                <span className="text-lg">🔓</span> Open Source
              </h4>
              <p className="text-gray-400 text-sm mb-4">
                This project is open source and available for educational purposes. Feel free to explore, learn, and contribute.
              </p>
              <a
                href="https://github.com/Muhammad-BinMushtaq/fypfinder"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" />
                </svg>
                View on GitHub
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>

            {/* Creator */}
            <div>
              <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                <span className="text-lg">👤</span> Creator
              </h4>
              <p className="text-gray-400 text-sm mb-4">
                Created by <span className="text-white font-medium">Muhammad bin Mushtaq</span> 
              </p>
              <div className="flex items-center gap-3">
                <a
                  href="https://www.linkedin.com/in/muhammad-bin-mushtaq1/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-10 h-10 bg-white/5 border border-white/10 rounded-lg text-gray-400 hover:text-blue-400 hover:border-blue-500/50 transition-all"
                  title="LinkedIn"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a
                  href="https://github.com/Muhammad-BinMushtaq"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-10 h-10 bg-white/5 border border-white/10 rounded-lg text-gray-400 hover:text-white hover:border-white/30 transition-all"
                  title="GitHub"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-white/10">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-500">
                © 2026 FYP Finder. Built for academic purposes.
              </p>
              <p className="text-xs text-gray-600">
                Built with Next.js, TypeScript, Prisma & Supabase
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
