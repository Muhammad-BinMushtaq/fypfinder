"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import * as authService from "@/services/auth.service";

export function LoginForm() {
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(errorParam);

  const handleMicrosoftLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const url = await authService.loginWithMicrosoft("/dashboard/profile");
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to initiate login");
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-950/30 p-3 text-sm text-red-300">
          {decodeURIComponent(error)}
        </div>
      )}

      <button
        onClick={handleMicrosoftLogin}
        disabled={isLoading}
        className={`w-full flex items-center justify-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
          isLoading
            ? "cursor-not-allowed bg-zinc-700 text-zinc-400"
            : "bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
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

      <div className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-2">
        <p className="text-sm font-medium text-zinc-200">Requirements</p>
        <ul className="text-xs text-zinc-400 space-y-1">
          <li className="flex items-center gap-2">
            <svg className="h-4 w-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            PAF-IAST university email (@paf-iast.edu.pk)
          </li>
          <li className="flex items-center gap-2">
            <svg className="h-4 w-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Bachelor students only
          </li>
          <li className="flex items-center gap-2">
            <svg className="h-4 w-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Semester 5, 6, or 7
          </li>
        </ul>
      </div>
    </div>
  );
}
