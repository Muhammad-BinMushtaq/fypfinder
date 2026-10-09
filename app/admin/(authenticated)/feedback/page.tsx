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

  // Modal state for reviewing a feedback
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
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      case "IN_PROGRESS":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20">
            <Sparkles className="w-3 h-3" />
            In Progress
          </span>
        );
      case "IMPLEMENTED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" />
            Implemented
          </span>
        );
      case "RESOLVED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-500/20">
            <ShieldCheck className="w-3 h-3" />
            Resolved
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-500/10 text-slate-700 dark:text-slate-400 border border-slate-500/20">
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
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs">
            <MessageSquareHeart className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Student Feedback
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Review student issues, suggestions, and send real-time notifications
            </p>
          </div>
        </div>

        <button
          onClick={fetchFeedbacks}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs cursor-pointer self-start sm:self-auto transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Filter Tabs / Stat Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { key: "ALL", label: "All Tickets", count: counts.all, color: "slate" },
          { key: "PENDING", label: "Pending", count: counts.pending, color: "amber" },
          { key: "IN_PROGRESS", label: "In Progress", count: counts.inProgress, color: "blue" },
          { key: "IMPLEMENTED", label: "Implemented", count: counts.implemented, color: "emerald" },
          { key: "RESOLVED", label: "Resolved", count: counts.resolved, color: "teal" },
          { key: "REJECTED", label: "Closed", count: counts.rejected, color: "slate" },
        ].map((tab) => {
          const isActive = statusFilter === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                isActive
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xs"
                  : "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-400"
              }`}
            >
              <p className={`text-[11px] font-medium ${isActive ? "opacity-80" : "text-slate-400 dark:text-slate-500"}`}>
                {tab.label}
              </p>
              <p className={`text-xl font-bold mt-1 ${isActive ? "text-white dark:text-slate-900" : "text-slate-900 dark:text-white"}`}>
                {tab.count}
              </p>
            </button>
          );
        })}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student, email, department, or keyword..."
            className="w-full rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-slate-400 dark:focus:border-slate-600 focus:outline-none focus:ring-1 focus:ring-slate-400 transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-48 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2.5 text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:border-slate-400 dark:focus:border-slate-600 focus:outline-none cursor-pointer"
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
        <div className="flex flex-col items-center justify-center p-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400 dark:text-slate-500 mb-2" />
          <p className="text-xs text-slate-500 dark:text-slate-400">Loading student feedback...</p>
        </div>
      ) : feedbacks.length === 0 ? (
        <div className="text-center p-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <MessageSquareHeart className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            No feedback found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {statusFilter !== "ALL"
              ? `There are no tickets matching the "${statusFilter}" filter.`
              : "No student feedback has been submitted yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {feedbacks.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                {/* Student Info */}
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-xs shrink-0 ring-1 ring-slate-200/60 dark:ring-slate-700">
                    {item.student.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {item.student.name}
                      </h3>
                      {renderStatusBadge(item.status)}
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400 flex-wrap mt-0.5">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-400" />
                        {item.student.user.email}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <GraduationCap className="w-3 h-3 text-slate-400" />
                        {item.student.department} (Sem {item.student.currentSemester})
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
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
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all self-start sm:self-auto cursor-pointer"
                >
                  Review & Respond
                </button>
              </div>

              {/* Category & Topic */}
              <div className="space-y-1.5">
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span className="inline-block rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:text-slate-300 mr-2">
                    {item.category}
                  </span>
                  {item.customTitle && <span>{item.customTitle}</span>}
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80">
                  {item.description}
                </p>
              </div>

              {/* Admin Note Preview */}
              {item.adminResponse && (
                <div className="p-3.5 rounded-xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 text-xs">
                  <span className="font-semibold text-emerald-800 dark:text-emerald-300 block mb-1">
                    Official Admin Response:
                  </span>
                  <p className="text-emerald-900 dark:text-emerald-200 whitespace-pre-wrap leading-relaxed">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
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
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveResponse} className="p-5 space-y-4 overflow-y-auto">
              {/* Submission details recap */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {selectedTicket.category}
                  </span>
                  <span className="text-slate-400">
                    {new Date(selectedTicket.createdAt).toLocaleString()}
                  </span>
                </div>
                {selectedTicket.customTitle && (
                  <p className="font-medium text-slate-800 dark:text-slate-200">
                    Topic: {selectedTicket.customTitle}
                  </p>
                )}
                <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {selectedTicket.description}
                </p>
              </div>

              {/* Status Selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Update Ticket Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as AdminFeedbackItem["status"])}
                  className="w-full rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:border-slate-400 dark:focus:border-slate-600 focus:outline-none cursor-pointer"
                >
                  <option value="PENDING">Pending (Awaiting review)</option>
                  <option value="IN_PROGRESS">In Progress (Under investigation)</option>
                  <option value="IMPLEMENTED">Implemented (Feature/fix shipped)</option>
                  <option value="RESOLVED">Resolved (Answered / Closed)</option>
                  <option value="REJECTED">Closed / Rejected (Not feasible)</option>
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
                  placeholder="e.g. This issue has been resolved in the latest update. Thank you for your feedback!"
                  maxLength={2500}
                  className="w-full rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-slate-400 dark:focus:border-slate-600 focus:outline-none resize-none"
                />
                <p className="text-[11px] text-slate-400">
                  Saving will update the ticket and deliver a Web Push notification to the student.
                </p>
              </div>

              {/* Modal Footer */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white dark:text-slate-900 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 disabled:opacity-50 rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Saving...
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

