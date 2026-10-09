"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabaseClient";

/**
 * MicrosoftAuthButton
 * -------------------
 * Unified auth component for both login and signup.
 * Since OAuth handles both cases automatically (new user = signup, existing = login),
 * there's no need for separate forms.
 */
export function MicrosoftAuthButton() {
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");

  const [isLoading, setIsLoading] = useState(false);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const [error, setError] = useState<string | null>(errorParam);

  const handleAuth = async () => {
    if (!agreedToPrivacy) {
      setError("Please check the box confirming you comply with the Privacy Policy to proceed.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Clear any stale cached data before starting OAuth flow
      // This ensures fresh data after successful login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('fypfinder-cache');
      }

      const supabase = getSupabaseClient();
      await supabase.auth.signOut({ scope: "local" });

      const callbackUrl = `${window.location.origin}/api/auth/callback`;

      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "azure",
        options: {
          redirectTo: callbackUrl,
          scopes: "email openid profile",
          queryParams: {
            prompt: "select_account",
          },
        },
      });

      if (oauthError) {
        setError(oauthError.message);
        console.log("THis is auth error:", oauthError);
        setIsLoading(false);
      }
      // Browser will redirect automatically — no need to handle success
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {error && (
        <div className="rounded-xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-950/30 p-3 text-sm text-red-600 dark:text-red-300">
          {decodeURIComponent(error)}
        </div>
      )}

      {/* Privacy Policy Consent Checkbox */}
      <div className="pt-0.5">
        <label className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-zinc-400 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={agreedToPrivacy}
            onChange={(e) => {
              setAgreedToPrivacy(e.target.checked);
              if (error) setError(null);
            }}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 dark:border-zinc-700 text-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:bg-zinc-900 cursor-pointer accent-indigo-600 shrink-0"
          />
          <span className="leading-relaxed">
            If you are logging in, you comply with the{" "}
            <Link
              href="/privacy"
              target="_blank"
              className="font-semibold text-slate-900 dark:text-zinc-100 underline underline-offset-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Privacy Policy
            </Link>
            .
          </span>
        </label>
      </div>

      <button
        onClick={handleAuth}
        disabled={isLoading || !agreedToPrivacy}
        className={`w-full flex items-center justify-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition shadow-sm ${
          isLoading || !agreedToPrivacy
            ? "cursor-not-allowed bg-slate-200 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 opacity-60"
            : "bg-slate-900 text-white hover:bg-slate-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 active:scale-[0.99]"
        }`}
      >
        {isLoading ? (
          <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          <svg className="h-5 w-5" viewBox="0 0 21 21" fill="none">
            <rect x="1" y="1" width="9" height="9" fill="#F25022" />
            <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
            <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
            <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
          </svg>
        )}
        {isLoading ? "Redirecting..." : "Continue with Microsoft"}
      </button>

      <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-4 space-y-2">
        <p className="text-sm font-semibold text-slate-800 dark:text-zinc-200">Requirements</p>
        <ul className="text-xs text-slate-600 dark:text-zinc-400 space-y-1.5">
          <li className="flex items-center gap-2">
            <svg className="h-4 w-4 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>PAF-IAST university email (@paf-iast.edu.pk)</span>
          </li>
          <li className="flex items-center gap-2">
            <svg className="h-4 w-4 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Bachelor students only</span>
          </li>
          <li className="flex items-center gap-2">
            <svg className="h-4 w-4 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Semester 5 to 8 semester students only</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
