import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { MicrosoftAuthButton } from "@/components/auth/LoginForm";
import { LandingThemeToggle } from "@/components/landing/LandingThemeToggle";
import { getAuthenticatedRedirectPath, getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to FYPMate to find university project teammates and validate FYP ideas.",
  alternates: {
    canonical: "/login",
  },
};

export default async function LoginPage() {
  let redirectPath: string | null = null;

  try {
    const user = await getCurrentUser();
    redirectPath = getAuthenticatedRedirectPath(user);
  } catch {
    // Show login when the existing session cannot be verified.
  }

  if (redirectPath) {
    redirect(redirectPath);
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-zinc-100 transition-colors relative flex flex-col justify-center">
      {/* Top Header Controls */}
      <div className="absolute top-5 left-6 right-6 flex items-center justify-between z-10">
        <Link
          href="/"
          className="text-xs sm:text-sm font-medium text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          ← Back to Home
        </Link>
        <LandingThemeToggle />
      </div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-44 -right-40 h-80 w-80 rounded-full bg-slate-200/60 dark:bg-white/5 blur-3xl" />
        <div className="absolute -bottom-44 -left-40 h-80 w-80 rounded-full bg-slate-200/60 dark:bg-white/5 blur-3xl" />
      </div>

      <div className="relative mx-auto flex w-full max-w-md flex-col justify-center px-4 py-16 sm:px-0">
        <div className="mb-8 text-center">
          <Link href="/" className="mb-4 inline-flex">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-900 shadow-md">
              <svg
                className="h-7 w-7 text-slate-900 dark:text-zinc-100"
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
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">FYPMate</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-zinc-400">Find your perfect FYP partner</p>
        </div>

        <section className="rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white/95 dark:bg-zinc-950/90 p-8 shadow-xl dark:shadow-2xl backdrop-blur">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-zinc-100">Sign in</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">Use your university Microsoft account</p>
          </div>
          <Suspense fallback={
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-400 dark:border-zinc-400 border-t-transparent" />
            </div>
          }>
            <MicrosoftAuthButton />
          </Suspense>
        </section>
      </div>
    </main>
  );
}
