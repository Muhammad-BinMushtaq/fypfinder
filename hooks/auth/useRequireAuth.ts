// hooks/auth/useRequireAuth.ts

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "./useSession";

/**
 * useRequireAuth
 * ----------------
 * Route protection hook.
 * Redirects unauthenticated or suspended users.
 */
export function useRequireAuth() {
  const router = useRouter();
  const { user, isLoading } = useSession();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (user.status === "SUSPENDED") {
      router.replace("/suspended");
    }
  }, [user, isLoading, router]);

  return {
    user,
    isLoading,
  };
}
