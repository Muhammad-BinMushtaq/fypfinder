"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useSignup } from "@/hooks/auth/useSignup";

const UNIVERSITY_DOMAIN = "@paf-iast.edu.pk";
const STUDENT_ID_REGEX = /^[bB]\d{2}[fFsS]\d{4}[a-zA-Z]{2}\d{3}$/;

function getPasswordStrength(password: string): {
  level: "weak" | "fair" | "good" | "strong";
  percentage: number;
  barClass: string;
} {
  let strength = 0;
  if (password.length >= 6) strength++;
  if (password.length >= 10) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;

  const levels = [
    { level: "weak" as const, percentage: 20, barClass: "bg-red-500" },
    { level: "fair" as const, percentage: 40, barClass: "bg-orange-500" },
    { level: "good" as const, percentage: 60, barClass: "bg-yellow-500" },
    { level: "strong" as const, percentage: 100, barClass: "bg-emerald-500" },
  ];

  return levels[Math.min(strength, 3)];
}

export function SignupForm() {
  const { signup, isLoading, isError, error, isSuccess } = useSignup();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const passwordStrength = getPasswordStrength(password);
  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  const validateForm = () => {
    const nextErrors: typeof errors = {};

    if (!email) {
      nextErrors.email = "Email is required";
    } else if (!email.endsWith(UNIVERSITY_DOMAIN)) {
      nextErrors.email = `Email must end with ${UNIVERSITY_DOMAIN}`;
    } else {
      const studentId = email.split("@")[0];
      if (!STUDENT_ID_REGEX.test(studentId)) {
        nextErrors.email = "Invalid student ID format (example: B23F0001SE021)";
      }
    }

    if (!password) {
      nextErrors.password = "Password is required";
    } else if (password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters";
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    signup({ email, password });
  };

  if (isSuccess) {
    return (
      <div className="space-y-5 py-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-950/40">
          <svg
            className="h-8 w-8 text-emerald-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <h3 className="text-xl font-semibold text-zinc-100">Account created</h3>
          <p className="mt-1 text-sm text-zinc-400">You can now sign in to continue.</p>
        </div>
        <Link
          href="/login"
          className="inline-block rounded-lg bg-zinc-100 px-5 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-200"
        >
          Go to login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-medium text-zinc-200">
          University email
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <svg
              className="h-5 w-5 text-zinc-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value.toLowerCase())}
            placeholder="b23f0001se021@paf-iast.edu.pk"
            disabled={isLoading}
            className={`w-full rounded-lg border pl-12 pr-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition ${
              errors.email
                ? "border-red-500/70 bg-red-950/30 focus:border-red-500"
                : "border-white/15 bg-zinc-900 focus:border-zinc-400"
            } ${isLoading ? "cursor-not-allowed opacity-60" : ""}`}
          />
        </div>
        {errors.email && <p className="mt-2 text-xs text-red-400">{errors.email}</p>}
        <p className="mt-2 text-xs text-zinc-500">
          Format: B23F0001SE021@paf-iast.edu.pk
        </p>
      </div>

      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-medium text-zinc-200">
          Password
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <svg
              className="h-5 w-5 text-zinc-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
            disabled={isLoading}
            className={`w-full rounded-lg border pl-12 pr-12 py-3 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition ${
              errors.password
                ? "border-red-500/70 bg-red-950/30 focus:border-red-500"
                : "border-white/15 bg-zinc-900 focus:border-zinc-400"
            } ${isLoading ? "cursor-not-allowed opacity-60" : ""}`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute inset-y-0 right-0 flex items-center pr-4 text-zinc-500 hover:text-zinc-200"
          >
            {showPassword ? (
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path
                  fillRule="evenodd"
                  d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-14-14zM10 5c4.478 0 8.268 2.943 9.542 7a9.968 9.968 0 01-2.293 3.95l-1.422-1.422A7.99 7.99 0 0017.5 12c-1.02-2.674-3.52-5-7.5-5a8.21 8.21 0 00-2.704.46L5.78 5.944A10.08 10.08 0 0110 5zM2.5 8.05L4.012 9.56A8.65 8.65 0 002.5 12c1.274 4.057 5.064 7 9.542 7 1.433 0 2.79-.293 4.01-.82l-1.56-1.56a8.35 8.35 0 01-2.45.38c-3.98 0-6.48-2.326-7.5-5 .338-.883.805-1.69 1.388-2.397L2.5 8.05z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>
        </div>
        {errors.password && <p className="mt-2 text-xs text-red-400">{errors.password}</p>}

        {password && (
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Password strength</span>
              <span className="capitalize">{passwordStrength.level}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
              <div
                className={`h-full transition-all duration-300 ${passwordStrength.barClass}`}
                style={{ width: `${passwordStrength.percentage}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-zinc-200">
          Confirm password
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <svg
              className="h-5 w-5 text-zinc-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="********"
            disabled={isLoading}
            className={`w-full rounded-lg border pl-12 pr-12 py-3 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition ${
              errors.confirmPassword
                ? "border-red-500/70 bg-red-950/30 focus:border-red-500"
                : passwordsMatch
                ? "border-emerald-500/70 bg-emerald-950/20 focus:border-emerald-500"
                : "border-white/15 bg-zinc-900 focus:border-zinc-400"
            } ${isLoading ? "cursor-not-allowed opacity-60" : ""}`}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((v) => !v)}
            className="absolute inset-y-0 right-0 flex items-center pr-4 text-zinc-500 hover:text-zinc-200"
          >
            {showConfirmPassword ? (
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path
                  fillRule="evenodd"
                  d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-14-14zM10 5c4.478 0 8.268 2.943 9.542 7a9.968 9.968 0 01-2.293 3.95l-1.422-1.422A7.99 7.99 0 0017.5 12c-1.02-2.674-3.52-5-7.5-5a8.21 8.21 0 00-2.704.46L5.78 5.944A10.08 10.08 0 0110 5zM2.5 8.05L4.012 9.56A8.65 8.65 0 002.5 12c1.274 4.057 5.064 7 9.542 7 1.433 0 2.79-.293 4.01-.82l-1.56-1.56a8.35 8.35 0 01-2.45.38c-3.98 0-6.48-2.326-7.5-5 .338-.883.805-1.69 1.388-2.397L2.5 8.05z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="mt-2 text-xs text-red-400">{errors.confirmPassword}</p>
        )}
        {passwordsMatch && password && (
          <p className="mt-2 text-xs text-emerald-400">Passwords match</p>
        )}
      </div>

      {isError && error && (
        <div className="rounded-lg border border-red-500/30 bg-red-950/30 p-3 text-sm text-red-300">
          {(error as Error).message}
        </div>
      )}

      <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-xs text-zinc-400">
        Only students in semester 5 to 7 can register.
      </div>

      <button
        type="submit"
        disabled={isLoading || !email || !password || !confirmPassword}
        className={`w-full rounded-lg px-4 py-3 text-sm font-medium transition ${
          isLoading || !email || !password || !confirmPassword
            ? "cursor-not-allowed bg-zinc-700 text-zinc-400"
            : "bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
        }`}
      >
        {isLoading ? "Creating account..." : "Create account"}
      </button>

      <p className="text-center text-sm text-zinc-400">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-zinc-200 hover:text-white">
          Sign in
        </Link>
      </p>
    </form>
  );
}
