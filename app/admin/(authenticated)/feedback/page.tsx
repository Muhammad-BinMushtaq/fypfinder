// app/admin/(authenticated)/feedback/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import {
  MessageSquareHeart,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Send,
  Loader2,
  X,
  User,
  GraduationCap,
  Mail,
  RefreshCw,
} from "lucide-react";

interface FeedbackStudent {
  id: string;
  name: string;
  department: string;
  currentSemester: number;
  user: {
    email: string;
  };
}

interface AdminFeedbackItem {
  id: string;
  studentId: string;
  category: string;
  customTitle: string | null;
  description: string;
  status: "PENDING" | "IN_PROGRESS" | "IMPLEMENTED" | "RESOLVED" | "REJECTED";
  adminResponse: string | null;
  respondedAt: string | null;
  createdAt: string;
  updatedAt: string;
  student: FeedbackStudent;
}

interface FeedbackCounts {
  all: number;
  pending: number;
  inProgress: number;
  implemented: number;
  resolved: number;
  rejected: number;
}

export default function AdminFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<AdminFeedbackItem[]>([]);
  const [counts, setCounts] = useState<FeedbackCounts>({
    all: 0,
    pending: 0,
    inProgress: 0,
    implemented: 0,
    resolved: 0,
    rejected: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal / Drawer state for reviewing a feedback
  const [selectedTicket, setSelectedTicket] = useState<AdminFeedbackItem | null>(null);
  const [editStatus, setEditStatus] = useState<AdminFeedbackItem["status"]>("PENDING");
  const [adminResponseText, setAdminResponseText] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const fetchFeedbacks = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (searchQuery.trim()) params.set("search", searchQuery.trim());

      const res = await fetch(`/api/admin/feedback?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setFeedbacks(json.data.feedbacks || []);
        setCounts(json.data.counts);
      } else {
        toast.error("Failed to load feedbacks");
      }
    } catch {
      toast.error("Network error loading feedbacks");
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  const handleOpenReview = (ticket: AdminFeedbackItem) => {
    setSelectedTicket(ticket);
    setEditStatus(ticket.status);
    setAdminResponseText(ticket.adminResponse || "");
  };

  const handleSaveResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;

    try {
      setIsSaving(true);
      const res = await fetch(`/api/admin/feedback/${selectedTicket.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: editStatus,
          adminResponse: adminResponseText.trim() || null,
        }),
      });

      const json = await res.json();
      if (res.ok) {
        toast.success("Feedback updated and student notified!");
        setSelectedTicket(null);
        await fetchFeedbacks();
      } else {
        toast.error(json.message || "Failed to update feedback");
      }
    } catch {
      toast.error("Network error while saving response");
    } finally {
      setIsSaving(false);
    }
  };

  const renderStatusBadge = (status: AdminFeedbackItem["status"]) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      case "IN_PROGRESS":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
            <Sparkles className="w-3 h-3" />
            In Progress
          </span>
        );
      case "IMPLEMENTED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3" />
            Implemented
          </span>
        );
      case "RESOLVED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-300 dark:border-teal-800">
            <ShieldCheck className="w-3 h-3" />
            Resolved
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
            <AlertCircle className="w-3 h-3" />
            Closed
          </span>
        );
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20">
            <MessageSquareHeart className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Student Feedback Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Review submissions, leave official responses, and notify students in real time
            </p>
          </div>
        </div>

        <button
          onClick={fetchFeedbacks}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-xs cursor-pointer self-start sm:self-auto transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div
          onClick={() => setStatusFilter("ALL")}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            statusFilter === "ALL"
              ? "bg-slate-900 text-white border-slate-900 shadow-sm"
              : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300"
          }`}
        >
          <p className="text-[11px] font-medium opacity-80">All Submissions</p>
          <p className="text-xl font-bold mt-0.5">{counts.all}</p>
        </div>

        <div
          onClick={() => setStatusFilter("PENDING")}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            statusFilter === "PENDING"
              ? "bg-amber-600 text-white border-amber-600 shadow-sm"
              : "bg-white dark:bg-slate-800 border-amber-200 dark:border-amber-900/50 hover:border-amber-400"
          }`}
        >
          <p className="text-[11px] font-medium text-amber-700 dark:text-amber-400">
            Pending
          </p>
          <p className="text-xl font-bold mt-0.5 text-amber-900 dark:text-amber-300">
            {counts.pending}
          </p>
        </div>

        <div
          onClick={() => setStatusFilter("IN_PROGRESS")}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            statusFilter === "IN_PROGRESS"
              ? "bg-blue-600 text-white border-blue-600 shadow-sm"
              : "bg-white dark:bg-slate-800 border-blue-200 dark:border-blue-900/50 hover:border-blue-400"
          }`}
        >
          <p className="text-[11px] font-medium text-blue-700 dark:text-blue-400">
            In Progress
          </p>
          <p className="text-xl font-bold mt-0.5 text-blue-900 dark:text-blue-300">
            {counts.inProgress}
          </p>
        </div>

        <div
          onClick={() => setStatusFilter("IMPLEMENTED")}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            statusFilter === "IMPLEMENTED"
              ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
              : "bg-white dark:bg-slate-800 border-emerald-200 dark:border-emerald-900/50 hover:border-emerald-400"
          }`}
        >
          <p className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
            Implemented
          </p>
          <p className="text-xl font-bold mt-0.5 text-emerald-900 dark:text-emerald-300">
            {counts.implemented}
          </p>
        </div>

        <div
          onClick={() => setStatusFilter("RESOLVED")}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            statusFilter === "RESOLVED"
              ? "bg-teal-600 text-white border-teal-600 shadow-sm"
              : "bg-white dark:bg-slate-800 border-teal-200 dark:border-teal-900/50 hover:border-teal-400"
          }`}
        >
          <p className="text-[11px] font-medium text-teal-700 dark:text-teal-400">
            Resolved
          </p>
          <p className="text-xl font-bold mt-0.5 text-teal-900 dark:text-teal-300">
            {counts.resolved}
          </p>
        </div>

        <div
          onClick={() => setStatusFilter("REJECTED")}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            statusFilter === "REJECTED"
              ? "bg-slate-700 text-white border-slate-700 shadow-sm"
              : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-400"
          }`}
        >
          <p className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
            Closed
          </p>
          <p className="text-xl font-bold mt-0.5 text-slate-800 dark:text-slate-300">
            {counts.rejected}
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full sm:flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student, email, department, or keyword..."
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-48 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Statuses ({counts.all})</option>
            <option value="PENDING">Pending ({counts.pending})</option>
            <option value="IN_PROGRESS">In Progress ({counts.inProgress})</option>
            <option value="IMPLEMENTED">Implemented ({counts.implemented})</option>
            <option value="RESOLVED">Resolved ({counts.resolved})</option>
            <option value="REJECTED">Closed ({counts.rejected})</option>
          </select>
        </div>
      </div>

      {/* Feedback List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
          <p className="text-xs text-slate-500">Loading student feedback...</p>
        </div>
      ) : feedbacks.length === 0 ? (
        <div className="text-center p-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
          <MessageSquareHeart className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            No feedback found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {statusFilter !== "ALL"
              ? `There are no feedback tickets matching the "${statusFilter}" filter.`
              : "No student feedback has been submitted yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {feedbacks.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700 p-5 shadow-xs hover:border-indigo-200 dark:hover:border-indigo-900/60 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                {/* Student Info */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-xs">
                    {item.student.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {item.student.name}
                      </h3>
                      {renderStatusBadge(item.status)}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 flex-wrap mt-0.5">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {item.student.user.email}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <GraduationCap className="w-3 h-3" />
                        {item.student.department} (Sem {item.student.currentSemester})
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(item.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenReview(item)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-white bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-600 rounded-xl transition-all self-start sm:self-auto cursor-pointer"
                >
                  Review & Respond
                </button>
              </div>

              {/* Category & Topic */}
              <div className="mt-3.5 space-y-1">
                <div className="text-xs font-bold text-indigo-700 dark:text-indigo-400">
                  {item.category}
                  {item.customTitle ? ` — ${item.customTitle}` : ""}
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  {item.description}
                </p>
              </div>

              {/* Admin Note Preview */}
              {item.adminResponse && (
                <div className="mt-3 p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40 text-xs">
                  <span className="font-bold text-emerald-800 dark:text-emerald-300 block mb-0.5">
                    Official Admin Note:
                  </span>
                  <p className="text-emerald-950 dark:text-emerald-200 whitespace-pre-wrap">
                    {item.adminResponse}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Review & Respond Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Respond to Feedback
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Ticket from {selectedTicket.student.name} ({selectedTicket.student.user.email})
                </p>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveResponse} className="p-5 space-y-4 overflow-y-auto">
              {/* Submission details recap */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    {selectedTicket.category}
                  </span>
                  <span className="text-slate-400">
                    {new Date(selectedTicket.createdAt).toLocaleString()}
                  </span>
                </div>
                {selectedTicket.customTitle && (
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    Topic: {selectedTicket.customTitle}
                  </p>
                )}
                <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                  {selectedTicket.description}
                </p>
              </div>

              {/* Status Selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Update Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as AdminFeedbackItem["status"])}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none cursor-pointer"
                >
                  <option value="PENDING">⏳ PENDING (Awaiting review)</option>
                  <option value="IN_PROGRESS">🚀 IN_PROGRESS (Under development/investigation)</option>
                  <option value="IMPLEMENTED">🎉 IMPLEMENTED (Feature or fix shipped)</option>
                  <option value="RESOLVED">✓ RESOLVED (Answered / Completed)</option>
                  <option value="REJECTED">✕ CLOSED / REJECTED (Not feasible or duplicate)</option>
                </select>
              </div>

              {/* Admin Response Textarea */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Admin Response Note (Visible to student)
                </label>
                <textarea
                  rows={4}
                  value={adminResponseText}
                  onChange={(e) => setAdminResponseText(e.target.value)}
                  placeholder="e.g. This issue has been resolved in the latest release! Thank you for the report."
                  maxLength={2500}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none resize-none"
                />
                <p className="text-[11px] text-slate-400">
                  Saving this will update the ticket and automatically send a Web Push notification to the student.
                </p>
              </div>

              {/* Modal Footer */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Saving & Notifying...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Save & Notify Student
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
