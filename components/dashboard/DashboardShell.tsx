"use client";

import { ReactNode, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { MobileBottomNav, isBottomNavAllowed } from "@/components/dashboard/MobileBottomNav";
import { MobileProfileMenu } from "@/components/dashboard/MobileProfileMenu";
import { SuspensionBanner } from "@/components/student/SuspensionBanner";
import { PushPermissionBanner } from "@/components/pwa/PushPermissionBanner";
import { InstallPromptBanner } from "@/components/pwa/InstallPromptBanner";
import { InstallButton } from "@/components/pwa/InstallButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { GraduationCap, Lightbulb, ClipboardCheck, MessageCircleMore, UserPlus, ArrowLeft } from "lucide-react";
import { useVisualViewport } from "@/hooks/useVisualViewport";
import { useUnreadCount } from "@/hooks/messaging/useUnreadCount";
import { useRealtimeConversationUpdates } from "@/hooks/messaging/useRealtimeMessages";
import { useMyProfile } from "@/hooks/student/useMyProfile";
import { useReceivedPartnerRequests } from "@/hooks/request/usePartnerRequests";
import { useReceivedMessageRequests } from "@/hooks/request/useMessageRequests";
import clientLogger from "@/lib/client-logger";

interface DashboardShellProps {
  userEmail: string;
  children: ReactNode;
}

export function DashboardShell({ userEmail, children }: DashboardShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const { profile } = useMyProfile();
  useRealtimeConversationUpdates(profile?.id ?? null);

  const { unreadCount } = useUnreadCount();
  const { data: partnerReqs } = useReceivedPartnerRequests();
  const { data: messageReqs } = useReceivedMessageRequests();
  const pendingPartnerCount = partnerReqs?.filter((r) => r.status === "PENDING").length ?? 0;
  const pendingMessageCount = messageReqs?.filter((r) => r.status === "PENDING").length ?? 0;
  const totalPendingRequests = pendingPartnerCount + pendingMessageCount;

  const isChatOpen = pathname.startsWith("/dashboard/messages/") && pathname !== "/dashboard/messages";
  const viewportHeight = useVisualViewport(isChatOpen);

  const isSubPage =
    pathname === "/dashboard/profile" ||
    pathname === "/dashboard/settings" ||
    pathname.startsWith("/dashboard/requests") ||
    pathname === "/dashboard/messages" ||
    pathname.startsWith("/dashboard/feedback") ||
    pathname.startsWith("/dashboard/discovery/profile");

  const getSubPageTitle = () => {
    if (pathname === "/dashboard/profile") return "My Profile";
    if (pathname === "/dashboard/settings") return "Settings";
    if (pathname.startsWith("/dashboard/requests")) return "Requests";
    if (pathname === "/dashboard/messages") return "Messages";
    if (pathname.startsWith("/dashboard/feedback")) return "Feedback";
    if (pathname.startsWith("/dashboard/discovery/profile")) return "Profile";
    return "Back";
  };

  const shouldShowBottomNav = !isChatOpen && isBottomNavAllowed(pathname);

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/dashboard/discovery");
    }
  };

  useEffect(() => {
    if (!isChatOpen) return;

    // Body scroll lock on mobile when active chat is open
    const originalOverflow = document.body.style.overflow;
    const originalPosition = document.body.style.position;
    const originalWidth = document.body.style.width;

    if (window.innerWidth < 1024) {
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
      window.scrollTo(0, 0);
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.position = originalPosition;
      document.body.style.width = originalWidth;
    };
  }, [isChatOpen]);

  // Listen for smooth SPA navigation messages from Service Worker notification clicks
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    const handleSwMessage = (event: MessageEvent) => {
      if (event.data?.type === "PWA_NAVIGATE" && event.data?.url) {
        router.push(event.data.url);
      }
    };

    navigator.serviceWorker.addEventListener("message", handleSwMessage);
    return () => {
      navigator.serviceWorker.removeEventListener("message", handleSwMessage);
    };
  }, [router]);

  // Proactively warm up React Query cache for instant tab switches
  useEffect(() => {
    const timer = setTimeout(() => {
      queryClient.prefetchQuery({
        queryKey: ["conversations"],
        queryFn: async () => {
          const res = await fetch("/api/messaging/get-conversations");
          if (!res.ok) return [];
          const json = await res.json();
          return json.data?.conversations || [];
        },
        staleTime: 5 * 60 * 1000,
      });

      queryClient.prefetchQuery({
        queryKey: ["discovery", { limit: 12, offset: 0 }],
        queryFn: async () => {
          const res = await fetch("/api/discovery/get-matched-students?limit=12&offset=0");
          if (!res.ok) return null;
          const json = await res.json();
          return json.data || null;
        },
        staleTime: 5 * 60 * 1000,
      });

      queryClient.prefetchQuery({
        queryKey: ["group", "my-group"],
        queryFn: async () => {
          const res = await fetch("/api/group/get-my-group");
          if (!res.ok) return null;
          const json = await res.json();
          return json.data || null;
        },
        staleTime: 5 * 60 * 1000,
      });

      // Eagerly prefetch profile, settings, and feedback pages
      router.prefetch("/dashboard/profile");
      router.prefetch("/dashboard/settings");
      router.prefetch("/dashboard/feedback");
    }, 1200);

    return () => clearTimeout(timer);
  }, [queryClient, router]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (response.ok) {
        queryClient.clear();

        if (typeof window !== "undefined") {
          localStorage.removeItem("fypfinder-cache");
        }

        router.push("/login");
        router.refresh();
      } else {
        clientLogger.error("Logout failed");
        setIsLoggingOut(false);
      }
    } catch (error) {
      clientLogger.error("Logout error:", error);
      setIsLoggingOut(false);
    }
  };

  return (
    <div
      className={`bg-slate-100 dark:bg-[#020617] flex ${
        isChatOpen ? "h-[100dvh] overflow-hidden" : "min-h-screen"
      }`}
    >
      {/* Desktop Sidebar */}
      <DashboardSidebar
        userEmail={userEmail || "user@example.com"}
        onLogout={handleLogout}
        isLoggingOut={isLoggingOut}
      />

      {/* Main content */}
      <main
        style={
          isChatOpen && viewportHeight
            ? { height: `${viewportHeight}px` }
            : undefined
        }
        className={`flex-1 min-w-0 w-full lg:pl-[17.5rem] ${
          isChatOpen
            ? "max-lg:fixed max-lg:top-0 max-lg:left-0 max-lg:right-0 max-lg:z-40 lg:static lg:z-0 lg:pr-4 lg:py-4 h-[100dvh] overflow-hidden flex flex-col"
            : shouldShowBottomNav
            ? "lg:pr-4 lg:py-4 pb-28 lg:pb-4 overflow-x-hidden flex flex-col min-h-screen"
            : "lg:pr-4 lg:py-4 pb-6 lg:pb-4 overflow-x-hidden flex flex-col min-h-screen"
        }`}
      >
        {/* Floating Desktop Main Container */}
        <div
          className={`flex-1 flex flex-col lg:bg-white/75 lg:dark:bg-slate-900/60 lg:backdrop-blur-xl lg:border lg:border-white/40 lg:dark:border-white/10 lg:shadow-[0_8px_30px_rgb(0,0,0,0.04)] lg:dark:shadow-2xl lg:rounded-3xl relative overflow-hidden ${
            isChatOpen ? "h-full rounded-none border-none shadow-none bg-white dark:bg-slate-900" : ""
          }`}
        >
          {/* Mobile Header (Glass) - Hidden when in active chat */}
          {!isChatOpen && (
            <div className="lg:hidden sticky top-0 z-40 bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border-b border-slate-200/60 dark:border-white/10 px-4 py-2.5 shadow-xs">
              <div className="flex items-center justify-between gap-3">
                {/* Brand Link or Back Navigation */}
                {isSubPage ? (
                  <button
                    onClick={handleBack}
                    className="flex items-center gap-2 -ml-1 text-slate-800 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors shrink-0 max-w-[55%]"
                    aria-label="Back"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center shrink-0">
                      <ArrowLeft className="w-4 h-4" />
                    </div>
                    <span className="font-bold tracking-tight text-base truncate">{getSubPageTitle()}</span>
                  </button>
                ) : (
                  <Link href="/dashboard/discovery" prefetch={true} className="flex items-center gap-2.5 shrink-0 min-w-0">
                    <div className="w-8 h-8 bg-gradient-to-tr from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 rounded-xl flex items-center justify-center shrink-0 shadow-md">
                      <GraduationCap className="w-4 h-4 text-white dark:text-gray-900" />
                    </div>
                    <span className="font-bold tracking-tight text-gray-900 dark:text-white text-base truncate">FYP Finder</span>
                  </Link>
                )}

                {/* Right utility actions (Option A: Requests, Messages, Profile Avatar Dropdown) */}
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  {/* Feedback Link (Text Button) */}
                  <Link
                    href="/dashboard/feedback"
                    prefetch={true}
                    title="Give Feedback"
                    className="px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 rounded-full border border-slate-200/80 dark:border-slate-700/80 transition-all active:scale-95 shrink-0"
                  >
                    Feedback
                  </Link>

                  {/* Requests Link */}
                  <Link
                    href="/dashboard/requests"
                    prefetch={true}
                    title="Requests"
                    className="relative flex h-8 w-8 items-center justify-center rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-90 transition-all"
                  >
                    <UserPlus className="w-4 h-4" />
                    {totalPendingRequests > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 min-w-[15px] h-3.5 px-0.5 flex items-center justify-center text-[9px] font-bold bg-blue-600 text-white rounded-full shadow-xs">
                        {totalPendingRequests > 9 ? "9+" : totalPendingRequests}
                      </span>
                    )}
                  </Link>

                  {/* Messages Link */}
                  <Link
                    href="/dashboard/messages"
                    prefetch={true}
                    title="Messages"
                    className="relative flex h-8 w-8 items-center justify-center rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-90 transition-all"
                  >
                    <MessageCircleMore className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 min-w-[15px] h-3.5 px-0.5 flex items-center justify-center text-[9px] font-bold bg-red-500 text-white rounded-full shadow-xs">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </Link>

                  {/* Profile Dropdown */}
                  <MobileProfileMenu
                    userEmail={userEmail}
                    onLogout={handleLogout}
                    isLoggingOut={isLoggingOut}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Desktop Header (Minimal & Floating inside main container) - Hidden when in active chat */}
          {!isChatOpen && (
            <div className="hidden lg:flex sticky top-0 z-40 bg-transparent px-6 py-4 items-center justify-between border-b border-gray-100 dark:border-white/5">
              <div className="flex-1">
                {/* Optional: Breadcrumbs or Page Title could go here */}
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard/feedback"
                  prefetch={true}
                  title="Give Feedback"
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 rounded-full border border-slate-200/80 dark:border-slate-700/80 transition-all active:scale-95 shrink-0"
                >
                  Feedback
                </Link>
                <InstallButton />
                <div className="h-4 w-px bg-gray-200 dark:bg-white/10"></div>
                <Link
                  href="/dashboard/fyp-ideas"
                  prefetch={true}
                  title="FYP Ideas"
                  className="flex items-center justify-center w-9 h-9 text-gray-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-full transition-all"
                >
                  <Lightbulb className="w-4 h-4" />
                </Link>
                <Link
                  href="/dashboard/fyp-ideas/validate"
                  prefetch={true}
                  title="Validate Idea"
                  className="flex items-center justify-center w-9 h-9 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-all"
                >
                  <ClipboardCheck className="w-4 h-4" />
                </Link>
                <ThemeToggle />
              </div>
            </div>
          )}

          <SuspensionBanner />

          {/* Content Area */}
          <div
            className={`flex-1 lg:rounded-b-3xl relative z-10 flex flex-col min-h-0 ${
              isChatOpen ? "p-0 h-full overflow-hidden" : "p-4 lg:p-6"
            }`}
          >
            {children}
          </div>
          
          {!isChatOpen && (
            <>
              <PushPermissionBanner />
              <InstallPromptBanner />
            </>
          )}
        </div>
      </main>

      {/* Mobile Bottom Navigation - Only rendered on allowed pages (Find Partners, Previous FYPs, Validate FYP) */}
      {shouldShowBottomNav && <MobileBottomNav />}
    </div>
  );
}
