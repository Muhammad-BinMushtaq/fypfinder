"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

/**
 * Shared, minimal style tokens for the FYP workspace.
 * Uses text-base (16px) on mobile to prevent iOS/Android auto-zoom distortion when focusing inputs,
 * and text-sm (14px) on larger screens. Touch targets are 40-44px tall.
 */
export const inputCls =
  "w-full h-11 sm:h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 text-base sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-slate-900 dark:focus:border-slate-400 focus:ring-2 focus:ring-slate-900/5 dark:focus:ring-white/10 transition-all";

export const textareaCls =
  "w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 text-base sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-slate-900 dark:focus:border-slate-400 focus:ring-2 focus:ring-slate-900/5 dark:focus:ring-white/10 resize-none transition-all";

export const labelCls =
  "block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5";

export const btnPrimary =
  "inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-100 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all shadow-xs";

export const btnSecondary =
  "inline-flex items-center justify-center gap-1.5 h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-[0.99] disabled:opacity-50 cursor-pointer transition-all";

export const btnGhost =
  "inline-flex items-center justify-center gap-1.5 h-9 px-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 cursor-pointer transition-colors";

export const btnDangerText =
  "inline-flex items-center justify-center gap-1.5 h-9 px-2.5 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-50 cursor-pointer transition-colors";

export const cardSurface =
  "rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs";

/** Closes a popover when clicking/touching outside of it or pressing Escape. */
export function useDismiss<T extends HTMLElement>(
  open: boolean,
  onClose: () => void
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown, { passive: true });
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return ref;
}

interface SheetProps {
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}

/**
 * Portal-backed dialog: centered modal on desktop, bottom sheet on mobile.
 * Renders directly in document.body with z-[999] so it is never trapped below
 * DashboardShell's sticky top header (z-40), sidebar (z-50), or mobile bottom nav (z-50).
 */
export function Sheet({
  title,
  description,
  onClose,
  children,
  footer,
  wide,
}: SheetProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.classList.add("modal-open");

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.classList.remove("modal-open");
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  if (!mounted || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[999] h-[100dvh] w-screen flex items-end sm:items-center justify-center bg-slate-950/55 backdrop-blur-[2px] sm:p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`flex w-full ${
          wide ? "sm:max-w-2xl" : "sm:max-w-lg"
        } max-h-[90dvh] sm:max-h-[86vh] flex-col rounded-t-2xl sm:rounded-2xl border-t sm:border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 duration-150`}
      >
        {/* Subtle drag handle pill on mobile */}
        <div className="mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-full bg-slate-200 dark:bg-slate-700 sm:hidden" />

        <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 px-4 py-3.5 sm:px-6 sm:py-4 shrink-0">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white leading-snug">
              {title}
            </h2>
            {description && (
              <p className="mt-0.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="-mr-1.5 -mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-5">
          {children}
        </div>

        {footer && (
          <div className="shrink-0 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/90 px-4 py-3 sm:px-6 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
