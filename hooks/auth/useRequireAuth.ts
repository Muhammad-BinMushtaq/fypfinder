// hooks/auth/useRequireAuth.ts

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "./useSession";

/**
 * useRequireAuth
 * ----------------
 * Route protection hook.
 * Redirects unauthenticated or suspended users.
 * Returns isAuthChecked to prevent content flash.
 */
export function useRequireAuth() {
  const router = useRouter();
  const { user, isLoading, isFetching } = useSession();
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  useEffect(() => {
    if (isLoading || isFetching) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (user.status === "SUSPENDED") {
      router.replace("/suspended");
      return;
    }

    // Auth verified - safe to show content
    setIsAuthChecked(true);
  }, [user, isLoading, isFetching, router]);

  return {
    user,
    isLoading,
    // True only when auth is confirmed (user exists and is not suspended)
    isAuthChecked,
    // Show loading until auth is fully verified
    isAuthLoading: isLoading || isFetching || !isAuthChecked,
  };
}
