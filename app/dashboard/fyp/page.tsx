// app/dashboard/fyp/page.tsx
"use client";

export default function FYPManagementPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center">
        {/* Illustration */}
        <div className="relative mb-8">
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center">
            <span className="text-6xl">🚧</span>
          </div>
          {/* Animated dots */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-amber-400 rounded-full animate-bounce"></div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-orange-400 rounded-full animate-bounce delay-100"></div>
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-yellow-400 rounded-full animate-bounce delay-200"></div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-red-400 rounded-full animate-bounce delay-300"></div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sm:p-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-full mb-6">
            <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
            <span className="text-sm font-medium text-amber-700">Under Development</span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            FYP Management
          </h1>
          
          <p className="text-gray-600 mb-8 leading-relaxed">
            We're building something amazing! Soon you'll be able to manage your 
            FYP group, track progress, assign tasks, and collaborate with your teammates 
            all in one place.
          </p>

          {/* Upcoming Features */}
          <div className="text-left bg-gray-50 rounded-2xl p-6 mb-8">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">
              Coming Soon
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-gray-600">
                <span className="w-6 h-6 bg-indigo-100 rounded-lg flex items-center justify-center text-sm">👥</span>
                <span>Team member management</span>
              </li>
              <li className="flex items-center gap-3 text-gray-600">
                <span className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center text-sm">✅</span>
                <span>Task assignment & tracking</span>
              </li>
              <li className="flex items-center gap-3 text-gray-600">
                <span className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center text-sm">📊</span>
                <span>Progress monitoring</span>
              </li>
              <li className="flex items-center gap-3 text-gray-600">
                <span className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center text-sm">📁</span>
                <span>Document sharing</span>
              </li>
              <li className="flex items-center gap-3 text-gray-600">
                <span className="w-6 h-6 bg-orange-100 rounded-lg flex items-center justify-center text-sm">📅</span>
                <span>Milestone tracking</span>
              </li>
            </ul>
          </div>

          {/* Back Button */}
          <a
            href="/dashboard/profile"
            className="inline-flex items-center gap-2 px-6 py-3 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Profile
          </a>
        </div>

        {/* Footer Note */}
        <p className="mt-6 text-sm text-gray-400">
          Want to be notified when this launches? Stay tuned!
        </p>
      </div>
    </div>
  );
}
