// app/privacy/page.tsx
import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | FYP Finder",
  description: "Privacy Policy for FYP Finder - Learn how we collect, use, and protect your data.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-neutral-950 to-zinc-950">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-neutral-950/80 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-neutral-200 to-neutral-400 rounded-xl flex items-center justify-center text-xl shadow-lg text-neutral-900">
                🎓
              </div>
              <span className="text-xl font-bold text-white">FYP Finder</span>
            </Link>
            <Link
              href="/"
              className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              Privacy Policy
            </h1>
            <p className="text-gray-400 mb-8">
              Last updated: February 16, 2026
            </p>

            <div className="space-y-8 text-gray-300">
              {/* Introduction */}
              <section>
                <h2 className="text-xl font-semibold text-white mb-3">1. Introduction</h2>
                <p className="leading-relaxed">
                  FYP Finder ("we," "our," or "us") is committed to protecting your privacy. 
                  This Privacy Policy explains how we collect, use, disclose, and safeguard your 
                  information when you use our platform designed to help PAF-IAST university 
                  students find Final Year Project (FYP) partners.
                </p>
              </section>

              {/* Information We Collect */}
              <section>
                <h2 className="text-xl font-semibold text-white mb-3">2. Information We Collect</h2>
                <p className="mb-4">We collect the following types of information:</p>
                
                <h3 className="text-lg font-medium text-white mb-2">2.1 Account Information</h3>
                <ul className="list-disc list-inside space-y-1 mb-4 text-gray-400">
                  <li>Name (from your Microsoft account)</li>
                  <li>University email address (@paf-iast.edu.pk)</li>
                  <li>Student registration number (derived from email)</li>
                  <li>Department and semester information</li>
                </ul>

                <h3 className="text-lg font-medium text-white mb-2">2.2 Profile Information</h3>
                <ul className="list-disc list-inside space-y-1 mb-4 text-gray-400">
                  <li>Profile picture (optional)</li>
                  <li>Bio and interests</li>
                  <li>Skills and experience levels</li>
                  <li>Projects and portfolio links</li>
                  <li>Social links (GitHub, LinkedIn)</li>
                  <li>Availability status</li>
                </ul>

                <h3 className="text-lg font-medium text-white mb-2">2.3 Communication Data</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-400">
                  <li>Messages sent through the platform</li>
                  <li>Message and partner requests</li>
                  <li>Group formation and membership data</li>
                </ul>
              </section>

              {/* How We Use Your Information */}
              <section>
                <h2 className="text-xl font-semibold text-white mb-3">3. How We Use Your Information</h2>
                <p className="mb-4">We use the collected information for:</p>
                <ul className="list-disc list-inside space-y-2 text-gray-400">
                  <li><strong className="text-gray-300">Authentication:</strong> To verify your identity as a PAF-IAST student</li>
                  <li><strong className="text-gray-300">Profile Display:</strong> To show your profile to other students seeking FYP partners</li>
                  <li><strong className="text-gray-300">Matching:</strong> To calculate compatibility scores with other students</li>
                  <li><strong className="text-gray-300">Communication:</strong> To facilitate messaging between students</li>
                  <li><strong className="text-gray-300">Group Management:</strong> To manage FYP group formation and membership</li>
                  <li><strong className="text-gray-300">Platform Improvement:</strong> To improve our services and user experience</li>
                </ul>
              </section>

              {/* Data Sharing */}
              <section>
                <h2 className="text-xl font-semibold text-white mb-3">4. Data Sharing and Disclosure</h2>
                <p className="mb-4">We may share your information in the following situations:</p>
                <ul className="list-disc list-inside space-y-2 text-gray-400">
                  <li><strong className="text-gray-300">With Other Students:</strong> Your profile information is visible to other authenticated users for the purpose of finding FYP partners</li>
                  <li><strong className="text-gray-300">With Administrators:</strong> Platform administrators may access user data for moderation and support purposes</li>
                  <li><strong className="text-gray-300">Third-Party Services:</strong> We use Supabase for authentication and database hosting, and Microsoft for OAuth</li>
                  <li><strong className="text-gray-300">Legal Requirements:</strong> When required by law or to protect our rights</li>
                </ul>
                <p className="mt-4 text-sm">
                  We do <strong className="text-white">not</strong> sell your personal information to third parties.
                </p>
              </section>

              {/* Data Storage */}
              <section>
                <h2 className="text-xl font-semibold text-white mb-3">5. Data Storage and Security</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-400">
                  <li>Data is stored in Supabase-hosted PostgreSQL databases with SSL encryption</li>
                  <li>Authentication tokens are stored in secure, httpOnly cookies</li>
                  <li>Profile pictures are stored in Supabase Storage with access controls</li>
                  <li>We implement industry-standard security measures to protect your data</li>
                </ul>
              </section>

              {/* Data Retention */}
              <section>
                <h2 className="text-xl font-semibold text-white mb-3">6. Data Retention</h2>
                <p className="leading-relaxed">
                  We retain your data for as long as your account is active. If you request account 
                  deletion, we will delete your personal data within 30 days, except for data we are 
                  required to retain for legal or legitimate business purposes (such as message 
                  history that involves other users).
                </p>
              </section>

              {/* Your Rights */}
              <section>
                <h2 className="text-xl font-semibold text-white mb-3">7. Your Rights</h2>
                <p className="mb-4">You have the right to:</p>
                <ul className="list-disc list-inside space-y-2 text-gray-400">
                  <li><strong className="text-gray-300">Access:</strong> View your profile and all data we have about you</li>
                  <li><strong className="text-gray-300">Update:</strong> Edit your profile information at any time</li>
                  <li><strong className="text-gray-300">Delete:</strong> Request deletion of your account and associated data</li>
                  <li><strong className="text-gray-300">Control Visibility:</strong> Choose whether to show or hide your FYP group on your profile</li>
                </ul>
                <p className="mt-4 text-sm">
                  To exercise these rights, visit the Settings page in your dashboard or contact us directly.
                </p>
              </section>

              {/* Cookies */}
              <section>
                <h2 className="text-xl font-semibold text-white mb-3">8. Cookies and Session Data</h2>
                <p className="leading-relaxed">
                  We use essential cookies for authentication and session management. These cookies 
                  are necessary for the platform to function and cannot be disabled. We do not use 
                  tracking cookies or third-party advertising cookies.
                </p>
                <p className="mt-3 text-sm text-gray-400">
                  Session duration: Access tokens expire after 1 hour and are automatically refreshed. 
                  Refresh tokens are valid for up to 7 days of inactivity.
                </p>
              </section>

              {/* Children's Privacy */}
              <section>
                <h2 className="text-xl font-semibold text-white mb-3">9. Age Requirement</h2>
                <p className="leading-relaxed">
                  FYP Finder is designed for university students. By using this platform, you confirm 
                  that you are at least 18 years of age or the age of majority in your jurisdiction.
                </p>
              </section>

              {/* Changes */}
              <section>
                <h2 className="text-xl font-semibold text-white mb-3">10. Changes to This Policy</h2>
                <p className="leading-relaxed">
                  We may update this Privacy Policy from time to time. We will notify users of any 
                  material changes by posting the new policy on this page with an updated "Last 
                  updated" date.
                </p>
              </section>

              {/* Contact */}
              <section>
                <h2 className="text-xl font-semibold text-white mb-3">11. Contact Us</h2>
                <p className="leading-relaxed mb-4">
                  If you have questions about this Privacy Policy or our data practices, please contact:
                </p>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <p className="text-white font-medium">Muhammad bin Mushtaq</p>
                  <p className="text-gray-400 text-sm">FYP Finder Developer</p>
                  <div className="flex items-center gap-4 mt-3">
                    <a
                      href="https://github.com/Muhammad-BinMushtaq/fypfinder"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      GitHub Repository
                    </a>
                    <a
                      href="https://www.linkedin.com/in/muhammad-bin-mushtaq1/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      LinkedIn
                    </a>
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-neutral-900 bg-white rounded-xl hover:bg-neutral-100 transition-all"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              © 2026 FYP Finder. Built for academic purposes.
            </p>
            <p className="text-xs text-gray-600">
              Built with Next.js, TypeScript, Prisma & Supabase
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
