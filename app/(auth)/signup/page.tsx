import Link from "next/link";
import { SignupForm } from "@/components/auth/SignupForm";

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-zinc-100">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-44 -right-40 h-80 w-80 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-44 -left-40 h-80 w-80 rounded-full bg-white/5 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-10 sm:px-0">
        <div className="mb-8 text-center">
          <Link href="/" className="mb-4 inline-flex">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-zinc-900 shadow-xl">
              <svg
                className="h-7 w-7 text-zinc-100"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17s4.5 10.747 10 10.747c5.5 0 10-4.998 10-10.747 0-6.002-4.5-10.747-10-10.747z"
                />
              </svg>
            </div>
          </Link>
          <h1 className="text-4xl font-semibold tracking-tight text-zinc-100">FYP Finder</h1>
          <p className="mt-2 text-sm text-zinc-400">Create your student account</p>
        </div>

        <section className="rounded-2xl border border-white/10 bg-zinc-950/90 p-8 shadow-2xl backdrop-blur">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-zinc-100">Create account</h2>
            <p className="mt-1 text-sm text-zinc-400">
              PAF-IAST students in semester 5 to 7
            </p>
          </div>
          <SignupForm />
        </section>
      </div>
    </main>
  );
}
