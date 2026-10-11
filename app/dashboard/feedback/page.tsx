// app/dashboard/feedback/page.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  MessageSquareHeart,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Send,
  Loader2,
  Plus,
  HelpCircle,
  ShieldCheck,
  ChevronDown,
  Check,
  Bug,
  Lightbulb,
  Users,
  Palette,
  MessageSquare,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { FEEDBACK_CATEGORIES, type FeedbackCategory } from "@/lib/feedback-categories";

interface FeedbackItem {
  id: string;
  category: string;
  customTitle: string | null;
  description: string;
  status: "PENDING" | "IN_PROGRESS" | "IMPLEMENTED" | "RESOLVED" | "REJECTED";
  adminResponse: string | null;
  respondedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface MyFeedbackResponse {
  activeTicket: FeedbackItem | null;
  latestResolvedTicket: FeedbackItem | null;
  canSubmitNew: boolean;
}

function CategoryIcon({ name, className }: { name: FeedbackCategory["iconName"]; className?: string }) {
  switch (name) {
    case "Bug":
      return <Bug className={className} />;
    case "Lightbulb":
      return <Lightbulb className={className} />;
    case "Users":
      return <Users className={className} />;
    case "Sparkles":
      return <Sparkles className={className} />;
    case "Palette":
      return <Palette className={className} />;
    case "MessageSquare":
    default:
      return <MessageSquare className={className} />;
  }
}

export default function FeedbackPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<MyFeedbackResponse>({
    queryKey: ["my-feedback"],
    queryFn: async () => {
      const res = await fetch("/api/feedback/my-feedback", {
        headers: { "Cache-Control": "no-cache" },
      });
      if (!res.ok) throw new Error("Failed to load feedback");
      const json = await res.json();
      return json.data;
    },
    staleTime: 60 * 1000,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);

  // Form states
  const [selectedCategory, setSelectedCategory] = useState<FeedbackCategory | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [customTitle, setCustomTitle] = useState("");
  const [description, setDescription] = useState("");

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCategory) {
      toast.warning("Please choose a category");
      return;
    }

    if (description.trim().length < 15) {
      toast.warning("Please enter at least 15 characters describing your feedback");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/feedback/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: selectedCategory.label,
          customTitle: customTitle.trim() || null,
          description: description.trim(),
        }),
      });

      const result = await res.json();

      if (res.ok) {
        toast.success("Feedback submitted! Our team has been notified.");
        setSelectedCategory(null);
        setCustomTitle("");
        setDescription("");
        setShowNewForm(false);
        await queryClient.invalidateQueries({ queryKey: ["my-feedback"] });
      } else {
        toast.error(result.message || "Failed to submit feedback");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: FeedbackItem["status"]) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50/80 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/70 dark:border-amber-800/60 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Pending Review
          </span>
        );
      case "IN_PROGRESS":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-200/70 dark:border-slate-700/70 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            In Progress
          </span>
        );
      case "IMPLEMENTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50/80 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/60 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Implemented
          </span>
        );
      case "RESOLVED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50/80 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/60 shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Resolved
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60">
            <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
            Closed
          </span>
        );
    }
  };

  const activeTicket = data?.activeTicket;
  const latestResolved = data?.latestResolvedTicket;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4 pb-12">
      {/* Back Link */}
      <div>
        <Link
          href="/dashboard/discovery"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Discovery
        </Link>
      </div>

      {/* Modern Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700/60 shrink-0">
            <MessageSquareHeart className="w-5 h-5 text-slate-700 dark:text-slate-300" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Share Your Feedback
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
              Help make FYP Finder faster, smoother, and more useful. Every submission goes directly to our moderation and development team.
            </p>
          </div>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && !data && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4 animate-pulse">
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
          <div className="h-10 bg-slate-100 dark:bg-slate-800/60 rounded-xl" />
          <div className="h-28 bg-slate-100 dark:bg-slate-800/60 rounded-xl" />
        </div>
      )}

      {/* STATE A: ACTIVE TICKET IN PROGRESS */}
      {!isLoading && activeTicket && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Current Ticket
              </span>
              <span className="text-xs text-slate-300 dark:text-slate-600">•</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {new Date(activeTicket.createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
            {getStatusBadge(activeTicket.status)}
          </div>

          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {activeTicket.customTitle || activeTicket.category}
            </h2>
            {activeTicket.customTitle && (
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Category: {activeTicket.category}
              </p>
            )}
          </div>

          <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/60 text-xs sm:text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
            {activeTicket.description}
          </div>

          {/* Admin response */}
          {activeTicket.adminResponse && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                <Sparkles className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                Admin Response:
              </div>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                {activeTicket.adminResponse}
              </p>
            </div>
          )}

          {/* Under Review Notice */}
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 text-slate-600 dark:text-slate-400 text-xs">
            <HelpCircle className="w-4 h-4 shrink-0 text-slate-400 mt-0.5" />
            <p>
              Your feedback is currently under review by our admin team. You can initiate a new ticket once this submission is addressed.
            </p>
          </div>
        </div>
      )}

      {/* STATE B: LATEST RESOLVED TICKET */}
      {!isLoading && !activeTicket && latestResolved && !showNewForm && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Previous Ticket
              </span>
              <span className="text-xs text-slate-300 dark:text-slate-600">•</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {new Date(latestResolved.createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
            {getStatusBadge(latestResolved.status)}
          </div>

          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {latestResolved.customTitle || latestResolved.category}
            </h2>
            {latestResolved.customTitle && (
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Category: {latestResolved.category}
              </p>
            )}
          </div>

          <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/60 text-xs sm:text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
            {latestResolved.description}
          </div>

          {/* Admin Response Note */}
          {latestResolved.adminResponse && (
            <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-900/40 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-900 dark:text-emerald-300">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  Admin Response:
                </span>
                {latestResolved.respondedAt && (
                  <span className="text-[11px] font-normal text-emerald-700 dark:text-emerald-400">
                    {new Date(latestResolved.respondedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-emerald-950 dark:text-emerald-200 whitespace-pre-wrap leading-relaxed">
                {latestResolved.adminResponse}
              </p>
            </div>
          )}

          {/* Action button */}
          <div className="pt-2 flex justify-end">
            <button
              onClick={() => setShowNewForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white dark:text-slate-900 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 rounded-xl shadow-xs transition-all active:scale-98 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Submit New Feedback
            </button>
          </div>
        </div>
      )}

      {/* STATE C: SUBMISSION FORM */}
      {!isLoading && !activeTicket && (showNewForm || !latestResolved) && (
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5"
        >
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Create Feedback Submission
            </h2>
            {latestResolved && (
              <button
                type="button"
                onClick={() => setShowNewForm(false)}
                className="text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
              >
                View Previous Ticket
              </button>
            )}
          </div>

          {/* Minimal Dropdown Selector */}
          <div className="space-y-1.5" ref={dropdownRef}>
            <label className="block text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
              Feedback Category <span className="text-red-500">*</span>
            </label>

            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedCategory
                    ? "bg-white dark:bg-slate-800/90 border-slate-300 dark:border-slate-600 shadow-2xs ring-1 ring-slate-900/5 dark:ring-white/10"
                    : "bg-slate-50/70 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                }`}
              >
                {selectedCategory ? (
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 flex items-center justify-center shrink-0">
                      <CategoryIcon name={selectedCategory.iconName} className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                        {selectedCategory.label}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {selectedCategory.description}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-slate-400 dark:text-slate-500 text-xs sm:text-sm">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                      <HelpCircle className="w-4 h-4" />
                    </div>
                    <span>Select category (Bug, Feature, Matching, AI, UX, Other)...</span>
                  </div>
                )}

                <ChevronDown
                  className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                    isDropdownOpen ? "rotate-180 text-slate-700 dark:text-slate-300" : ""
                  }`}
                />
              </button>

              {/* Floating Menu */}
              {isDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl overflow-hidden p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                  {FEEDBACK_CATEGORIES.map((cat) => {
                    const isSelected = selectedCategory?.id === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setSelectedCategory(cat);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all text-left cursor-pointer ${
                          isSelected
                            ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
                            : "hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 shrink-0">
                            <CategoryIcon name={cat.iconName} className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate">
                              {cat.label}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                              {cat.description}
                            </p>
                          </div>
                        </div>

                        {isSelected && (
                          <Check className="w-4 h-4 text-slate-900 dark:text-white shrink-0 ml-2" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Topic Summary */}
          <div className="space-y-1.5">
            <label
              htmlFor="custom-title"
              className="block text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200"
            >
              Short Topic / Summary <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              id="custom-title"
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="e.g. Filter reset bug on mobile, Proposal export to Markdown"
              maxLength={80}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-slate-400 dark:focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-white/10 transition-all"
            />
          </div>

          {/* Detailed Explanation */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="feedback-desc"
                className="block text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200"
              >
                Detailed Explanation <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">
                {description.length} / 2500
              </span>
            </div>
            <textarea
              id="feedback-desc"
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please explain what happened, what you expected, or your suggestion in detail..."
              maxLength={2500}
              required
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-slate-400 dark:focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-white/10 transition-all resize-none"
            />
            <p className="text-[11px] text-slate-400">
              Minimum 15 characters required.
            </p>
          </div>

          {/* Submit Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="submit"
              disabled={isSubmitting || !selectedCategory}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white dark:text-slate-900 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-xs transition-all active:scale-98 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Feedback
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
