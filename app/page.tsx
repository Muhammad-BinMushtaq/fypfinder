// app/page.tsx
"use client"

import Link from "next/link";


export default function HomePage() {


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-xl shadow-lg">
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
                className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg hover:shadow-indigo-500/25"
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
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-8">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-sm text-indigo-300 font-medium">Pak-Austria Institute FYP Partner Finder</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              FYP Partner Finder
            </span>
            <br />
            for PAF-IAST
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
              className="w-full sm:w-auto px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:from-indigo-500 hover:to-purple-500 transition-all shadow-xl hover:shadow-indigo-500/30 hover:scale-105"
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

      {/* How It Works Section */}
      <section className="relative py-20 sm:py-32 bg-gradient-to-b from-transparent via-indigo-950/50 to-transparent">
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
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-2xl font-bold text-white mb-6 shadow-lg shadow-indigo-500/30">
                1
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Create Your Profile</h3>
              <p className="text-gray-400">
                Sign up and add skills, projects, interests, and availability.
              </p>
              {/* Connector line */}
              <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-indigo-500 to-transparent"></div>
            </div>

            {/* Step 2 */}
            <div className="relative text-center">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center text-2xl font-bold text-white mb-6 shadow-lg shadow-purple-500/30">
                2
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Discover Students</h3>
              <p className="text-gray-400">
                Use filters to find students who match your FYP needs.
              </p>
              <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-purple-500 to-transparent"></div>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-pink-500 to-red-600 rounded-2xl flex items-center justify-center text-2xl font-bold text-white mb-6 shadow-lg shadow-pink-500/30">
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
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl flex items-center justify-center text-2xl font-bold text-white mb-6 shadow-lg shadow-red-500/30">
                4
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Chat in Real Time</h3>
              <p className="text-gray-400">
                Discuss ideas instantly once messaging is allowed.
              </p>
              <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-red-500 to-transparent"></div>
            </div>

            {/* Step 5 */}
            <div className="relative text-center">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center text-2xl font-bold text-white mb-6 shadow-lg shadow-orange-500/30">
                5
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Send Partner Request</h3>
              <p className="text-gray-400">
                When ready, send a partner request to formalize the team.
              </p>
              <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-orange-500 to-transparent"></div>
            </div>

            {/* Step 6 */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-amber-500 to-yellow-600 rounded-2xl flex items-center justify-center text-2xl font-bold text-white mb-6 shadow-lg shadow-amber-500/30">
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

      {/* Features Section */}
      <section className="relative py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Built for PAF-IAST FYP Collaboration
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Clear, focused tools that match how FYP teams actually form at Pak-Austria.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="group p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-indigo-500/50 transition-all">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-2xl mb-5 group-hover:scale-110 transition-transform">
                🔍
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Smart Discovery</h3>
              <p className="text-gray-400">
                Filter by skills, department, semester, and availability to find the right teammate fast.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-indigo-500/50 transition-all">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-2xl mb-5 group-hover:scale-110 transition-transform">
                👤
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Rich Profiles</h3>
              <p className="text-gray-400">
                Highlight skills, projects, and interests so others understand your strengths.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-indigo-500/50 transition-all">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center text-2xl mb-5 group-hover:scale-110 transition-transform">
                🤝
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Partner Requests</h3>
              <p className="text-gray-400">
                Send and accept partner requests to form a serious FYP team.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-indigo-500/50 transition-all">
              <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center text-2xl mb-5 group-hover:scale-110 transition-transform">
                💬
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Real-Time Messaging</h3>
              <p className="text-gray-400">
                Chat instantly once messaging is allowed to discuss ideas and scope.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-indigo-500/50 transition-all">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center text-2xl mb-5 group-hover:scale-110 transition-transform">
                👥
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Team Management</h3>
              <p className="text-gray-400">
                Form your FYP group, manage members, and lock your team when ready.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="group p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-indigo-500/50 transition-all">
              <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center text-2xl mb-5 group-hover:scale-110 transition-transform">
                🚀
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Project Showcase</h3>
              <p className="text-gray-400">
                Share past work with links and demos to build trust quickly.
              </p>
            </div>
          </div>
        </div>
      </section>

      

      {/* Platform Principles Section */}
      <section className="relative py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-6">
              <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="text-sm text-emerald-300 font-medium">Our Commitment</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Platform Principles
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              FYP Finder is built on strong academic values to ensure a safe, productive, and respectful environment for all students.
            </p>
          </div>

          {/* Principles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Principle 1 - Academic Integrity */}
            <div className="p-6 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 rounded-2xl">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Academic Integrity</h3>
              <p className="text-gray-400 text-sm">
                We promote honest collaboration. All partnerships should uphold university academic policies and ethical standards.
              </p>
            </div>

            {/* Principle 2 - Permission-Based Messaging */}
            <div className="p-6 bg-gradient-to-br from-blue-500/10 to-indigo-500/5 border border-blue-500/20 rounded-2xl">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Permission-Based Messaging</h3>
              <p className="text-gray-400 text-sm">
                Students must request permission before starting conversations. No unsolicited messages or spam allowed.
              </p>
            </div>

            {/* Principle 3 - Admin Moderation */}
            <div className="p-6 bg-gradient-to-br from-purple-500/10 to-violet-500/5 border border-purple-500/20 rounded-2xl">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Admin Moderation</h3>
              <p className="text-gray-400 text-sm">
                Dedicated administrators monitor the platform to ensure compliance with guidelines and handle any issues promptly.
              </p>
            </div>

            {/* Principle 4 - No Random Chats */}
            <div className="p-6 bg-gradient-to-br from-orange-500/10 to-amber-500/5 border border-orange-500/20 rounded-2xl">
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">No Random Chats</h3>
              <p className="text-gray-400 text-sm">
                This is not a social chat app. All interactions should be purposeful and related to FYP collaboration.
              </p>
            </div>

            {/* Principle 5 - No Misuse */}
            <div className="p-6 bg-gradient-to-br from-red-500/10 to-rose-500/5 border border-red-500/20 rounded-2xl">
              <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Zero Tolerance for Misuse</h3>
              <p className="text-gray-400 text-sm">
                Any harassment, inappropriate behavior, or misuse of the platform will result in immediate account suspension.
              </p>
            </div>

            {/* Principle 6 - Academic Purpose Only */}
            <div className="p-6 bg-gradient-to-br from-cyan-500/10 to-sky-500/5 border border-cyan-500/20 rounded-2xl">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Academic Purpose Only</h3>
              <p className="text-gray-400 text-sm">
                FYP Finder is exclusively for Final Year Project collaboration. Keep all activities education-focused.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 sm:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="p-8 sm:p-12 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 rounded-3xl backdrop-blur-sm">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to Find Your FYP Partner?
            </h2>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto">
              Join students who have already found their perfect teammates. 
              Start your FYP journey today.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:from-indigo-500 hover:to-purple-500 transition-all shadow-xl hover:shadow-indigo-500/30 hover:scale-105"
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
              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span className="text-xs text-amber-300 font-medium">Academic Project • Not Commercial</span>
              </div>
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
                Created by <span className="text-white font-medium">Muhammad bin Mushtaq</span> as an academic Final Year Project.
              </p>
              <div className="flex items-center gap-3">
                <a
                  href="https://linkedin.com/in/muhammad-bin-mushtaq"
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
