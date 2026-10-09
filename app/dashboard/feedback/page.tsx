// app/dashboard/feedback/page.tsx
"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  MessageSquareHeart,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Send,
  Loader2,
  PlusCircle,
  HelpCircle,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";
import { FEEDBACK_CATEGORIES, ALL_CATEGORY_LABELS } from "@/lib/feedback-categories";

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

export default function FeedbackPage() {
  const [data, setData] = useState<MyFeedbackResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);

  // Form states
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [customTitle, setCustomTitle] = useState("");
  const [description, setDescription] = useState("");

  const fetchFeedback = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/feedback/my-feedback", {
        headers: { "Cache-Control": "no-cache" },
      });
      if (res.ok) {
        const json = await res.json();
        setData(json.data);
        if (!json.data.activeTicket && !json.data.latestResolvedTicket) {
          setShowNewForm(true);
        } else if (!json.data.activeTicket) {
          setShowNewForm(false);
        }
      } else {
        toast.error("Failed to load feedback status");
      }
    } catch {
      toast.error("Network error loading feedback");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCategory) {
      toast.warning("Please select a feedback category");
      return;
    }

    const isOther = selectedCategory.toLowerCase().includes("other");
    if (isOther && (!customTitle || customTitle.trim().length < 3)) {
      toast.warning("Please enter a custom topic title (minimum 3 characters)");
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
          category: selectedCategory,
          customTitle: isOther ? customTitle.trim() : null,
          description: description.trim(),
        }),
      });

      const result = await res.json();

      if (res.ok) {
        toast.success("Feedback submitted! Our team has been notified.");
        setSelectedCategory("");
        setCustomTitle("");
        setDescription("");
        setShowNewForm(false);
        await fetchFeedback();
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
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <Clock className="w-3.5 h-3.5" />
            Pending Review
          </span>
        );
      case "IN_PROGRESS":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
            <Sparkles className="w-3.5 h-3.5" />
            In Progress
          </span>
        );
      case "IMPLEMENTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Implemented
          </span>
        );
      case "RESOLVED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-100 text-teal-800 dark:bg-teal-950/50 dark:text-teal-300 border border-teal-300 dark:border-teal-800">
            <ShieldCheck className="w-3.5 h-3.5" />
            Resolved
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
            <AlertCircle className="w-3.5 h-3.5" />
            Closed
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          Loading feedback status...
        </p>
      </div>
    );
  }

  const activeTicket = data?.activeTicket;
  const latestResolved = data?.latestResolvedTicket;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 pb-12">
      {/* Header section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl shrink-0">
            <MessageSquareHeart className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Share Your Feedback
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
              Help us make FYP Finder faster, smoother, and more useful for everyone. Every suggestion goes directly to our engineering and moderation team.
            </p>
          </div>
        </div>
      </div>

      {/* STATE A: ACTIVE TICKET IN PROGRESS (Blocks new submission) */}
      {activeTicket && (
        <div className="bg-white dark:bg-slate-900 border border-amber-200/80 dark:border-amber-900/50 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Current Ticket
              </span>
              <span className="text-xs text-slate-400">•</span>
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

          <div className="space-y-1.5">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {activeTicket.customTitle || activeTicket.category}
            </h2>
            {activeTicket.customTitle && (
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Category: {activeTicket.category}
              </p>
            )}
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs sm:text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
            {activeTicket.description}
          </div>

          {/* Admin response if given interim */}
          {activeTicket.adminResponse && (
            <div className="p-4 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/40 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-900 dark:text-blue-300">
                <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                Admin Response:
              </div>
              <p className="text-xs sm:text-sm text-blue-950 dark:text-blue-200 whitespace-pre-wrap">
                {activeTicket.adminResponse}
              </p>
            </div>
          )}

          {/* Under Review Notice */}
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-amber-900 dark:text-amber-200 text-xs">
            <HelpCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
            <p>
              Your feedback is currently under review by our admin team. You can initiate a new ticket once this submission is addressed.
            </p>
          </div>
        </div>
      )}

      {/* STATE B: LATEST RESOLVED TICKET (Display closed feedback + admin reply + Unlock button) */}
      {!activeTicket && latestResolved && !showNewForm && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Previous Ticket
              </span>
              <span className="text-xs text-slate-400">•</span>
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

          <div className="space-y-1.5">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {latestResolved.customTitle || latestResolved.category}
            </h2>
            {latestResolved.customTitle && (
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Category: {latestResolved.category}
              </p>
            )}
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs sm:text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
            {latestResolved.description}
          </div>

          {/* Admin Official Note */}
          {latestResolved.adminResponse && (
            <div className="p-4 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900/40 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-900 dark:text-emerald-300">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  Admin Response:
                </span>
                {latestResolved.respondedAt && (
                  <span className="text-[11px] font-normal text-emerald-800/80 dark:text-emerald-400">
                    {new Date(latestResolved.respondedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-emerald-950 dark:text-emerald-200 whitespace-pre-wrap">
                {latestResolved.adminResponse}
              </p>
            </div>
          )}

          {/* Action button to unlock new feedback form */}
          <div className="pt-2 flex justify-end">
            <button
              onClick={() => setShowNewForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors active:scale-98 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              Submit New Feedback
            </button>
          </div>
        </div>
      )}

      {/* STATE C: FRESH SUBMISSION FORM (When allowed) */}
      {(!activeTicket && (showNewForm || !latestResolved)) && (
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5"
        >
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Create New Submission
            </h2>
            {latestResolved && (
              <button
                type="button"
                onClick={() => setShowNewForm(false)}
                className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
              >
                View Previous
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="space-y-1.5">
            <label
              htmlFor="category-select"
              className="block text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200"
            >
              Category Selection <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                id="category-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 pr-10 cursor-pointer"
                required
              >
                <option value="" disabled>
                  -- Select a reason or category ({ALL_CATEGORY_LABELS.length} topics) --
                </option>
                {FEEDBACK_CATEGORIES.map((catGroup) => (
                  <optgroup key={catGroup.group} label={catGroup.group}>
                    {catGroup.items.map((item) => (
                      <option key={item.id} value={item.label}>
                        {item.label} — {item.description}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Conditional Custom Topic for "Other" */}
          {selectedCategory.toLowerCase().includes("other") && (
            <div className="space-y-1.5 animate-in fade-in duration-150">
              <label
                htmlFor="custom-title"
                className="block text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200"
              >
                Custom Topic Title <span className="text-red-500">*</span>
              </label>
              <input
                id="custom-title"
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="e.g., Suggestion for team code sharing"
                maxLength={80}
                required
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          )}

          {/* Description Textarea */}
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
              placeholder="Describe what happened, the screen you were on, or how you would like this feature to work..."
              maxLength={2500}
              required
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
            />
            <p className="text-[11px] text-slate-400">
              Please be as descriptive as possible. Minimum 15 characters.
            </p>
          </div>

          {/* Submit button */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-xl shadow-xs transition-all active:scale-98 cursor-pointer"
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
