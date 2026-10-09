"use client";

/**
 * StudentCard Component
 * ---------------------
 * Clean, minimalist student preview card matching the Public Profile View styling.
 * Equipped with minimal action buttons ("Chat" in green when active, "Partner")
 * and the "View Profile ↗" navigation affordance. Skills removed per design.
 */

import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  GraduationCap,
  Building2,
  Calendar,
  MessageSquare,
  Users,
  Loader2,
  Check,
  Ban,
  Clock,
  Send,
  X,
  ArrowUpRight,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { prefetchPublicProfile } from "@/hooks/student/usePublicProfile";
import { useSendMessageRequest } from "@/hooks/request/useMessageRequests";
import { useSendPartnerRequest } from "@/hooks/request/usePartnerRequests";
import { useStartConversation } from "@/hooks/messaging/useStartConversation";
import { getDepartmentLabel } from "@/lib/departments";
import { toast } from "react-toastify";
import type { MatchedStudent } from "@/services/discovery.service";

interface StudentCardProps {
  student: MatchedStudent;
  myProfileId?: string;
  mySemester?: number;
  isUserGroupLocked?: boolean;
  sentPartnerRequests?: any[];
  sentMessageRequests?: any[];
  receivedMessageRequests?: any[];
}

export function StudentCard({
  student,
  myProfileId,
  mySemester,
  isUserGroupLocked = false,
  sentPartnerRequests,
  sentMessageRequests,
  receivedMessageRequests,
}: StudentCardProps) {
  const queryClient = useQueryClient();
  const router = useRouter();

  // Modals state
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [messageReason, setMessageReason] = useState("");
  const [partnerReason, setPartnerReason] = useState("");
  const [messageSuccess, setMessageSuccess] = useState(false);
  const [partnerSuccess, setPartnerSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Prefetch route bundle in background so clicking opens immediately in 0ms
    router.prefetch(`/dashboard/discovery/profile/${student.id}`);
  }, [router, student.id]);

  // Lock scroll when modal is open
  useEffect(() => {
    const isAnyModalOpen = showMessageModal || showPartnerModal;
    if (isAnyModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showMessageModal, showPartnerModal]);

  // Mutations
  const sendMessageMutation = useSendMessageRequest();
  const sendPartnerMutation = useSendPartnerRequest();
  const { startConversation, isPending: isStartingChat } = useStartConversation();

  // Navigation to detail page
  const handleCardClick = () => {
    router.push(`/dashboard/discovery/profile/${student.id}`);
  };

  const handleMouseEnter = () => {
    router.prefetch(`/dashboard/discovery/profile/${student.id}`);
    prefetchPublicProfile(queryClient, student.id);
  };

  // Eligibility & request status evaluated client-side (zero extra network calls)
  const existingSentMessageRequest = useMemo(() => {
    if (!sentMessageRequests) return null;
    return sentMessageRequests.find((req: any) => req.toStudentId === student.id);
  }, [sentMessageRequests, student.id]);

  const existingReceivedMessageRequest = useMemo(() => {
    if (!receivedMessageRequests) return null;
    return receivedMessageRequests.find((req: any) => req.fromStudentId === student.id);
  }, [receivedMessageRequests, student.id]);

  const existingPartnerRequest = useMemo(() => {
    if (!sentPartnerRequests) return null;
    return sentPartnerRequests.find((req: any) => req.toStudentId === student.id);
  }, [sentPartnerRequests, student.id]);

  const canDirectChat = useMemo(() => {
    if (existingSentMessageRequest?.status === "ACCEPTED") return true;
    if (existingReceivedMessageRequest?.status === "ACCEPTED") return true;
    return false;
  }, [existingSentMessageRequest, existingReceivedMessageRequest]);

  const hasPendingMessageRequest = existingSentMessageRequest?.status === "PENDING";
  const hasAcceptedPartnerRequest = existingPartnerRequest?.status === "ACCEPTED";
  const hasPendingPartnerRequest = existingPartnerRequest?.status === "PENDING";

  const isSameStudent = myProfileId === student.id;
  const canPartnerSemester =
    mySemester !== undefined &&
    student.semester !== undefined &&
    mySemester === student.semester;

  const handleSendMessageRequest = async () => {
    try {
      if (!messageReason.trim()) {
        toast.error("Please provide a reason for your message request");
        return;
      }
      await sendMessageMutation.mutateAsync({
        toStudentId: student.id,
        reason: messageReason.trim(),
      });
      setMessageSuccess(true);
      setShowMessageModal(false);
      setMessageReason("");
      setTimeout(() => setMessageSuccess(false), 3000);
    } catch {
      // Error handled by mutation
    }
  };

  const handleSendPartnerRequest = async () => {
    try {
      if (!partnerReason.trim()) {
        toast.error("Please provide a reason for your partner request");
        return;
      }
      await sendPartnerMutation.mutateAsync({
        toStudentId: student.id,
        reason: partnerReason.trim(),
      });
      setPartnerSuccess(true);
      setShowPartnerModal(false);
      setPartnerReason("");
      setTimeout(() => setPartnerSuccess(false), 3000);
    } catch {
      // Error handled by mutation
    }
  };

  const availabilityConfig = useMemo(() => {
    const config: Record<string, { label: string; dot: string; text: string }> = {
      AVAILABLE: { label: "Available", dot: "bg-emerald-500", text: "text-emerald-700 dark:text-emerald-400" },
      BUSY: { label: "Busy", dot: "bg-amber-500", text: "text-amber-700 dark:text-amber-400" },
      AWAY: { label: "Away", dot: "bg-slate-400", text: "text-slate-600 dark:text-slate-400" },
    };
    return config[student.availability] || config.AWAY;
  }, [student.availability]);

  const groupStatusConfig = useMemo(() => {
    if (student.isGroupLocked) {
      return { label: "Team locked", text: "text-slate-600 dark:text-slate-400" };
    }
    return { label: "Looking for team", text: "text-emerald-700 dark:text-emerald-400" };
  }, [student.isGroupLocked]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <div
        onClick={handleCardClick}
        onMouseEnter={handleMouseEnter}
        className="group cursor-pointer block h-full text-left select-none transition-transform duration-100 ease-out active:scale-[0.985]"
      >
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 transition-all duration-300 overflow-hidden h-full flex flex-col hover:-translate-y-1 hover:shadow-xl relative p-5 sm:p-6 select-none group-active:border-slate-300 dark:group-active:border-slate-700">
          {/* Avatar & Header (Matching Detail Page Card) */}
          <div className="flex flex-col items-center text-center">
            {/* Avatar */}
            <div className="relative mb-3.5 w-20 h-20 rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex-shrink-0 shadow-sm mx-auto">
              {student.profilePicture ? (
                <Image
                  src={student.profilePicture}
                  alt={student.name}
                  fill
                  sizes="80px"
                  className="object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-500 font-semibold text-xl">
                  {getInitials(student.name)}
                </div>
              )}
            </div>

            {/* Name */}
            <h3 className="font-bold text-slate-900 dark:text-white text-lg tracking-tight truncate px-1 w-full">
              {student.name}
            </h3>

            {/* Availability & Group Badges */}
            <div className="mt-2.5 flex flex-wrap items-center justify-center gap-1.5 text-xs font-medium">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                <span className={`w-1.5 h-1.5 rounded-full ${availabilityConfig.dot}`} />
                <span className={availabilityConfig.text}>{availabilityConfig.label}</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                <span className={groupStatusConfig.text}>{groupStatusConfig.label}</span>
              </div>
            </div>
          </div>

          {/* Academic Info (Matching Detail Page Structure) */}
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-2 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{getDepartmentLabel(student.department)}</span>
            </div>
            <div className="flex items-center gap-2">
              {student.isGraduated ? (
                <>
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">Alumni</span>
                </>
              ) : (
                <>
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Semester {student.semester}</span>
                </>
              )}
            </div>
          </div>

          {/* Spacer to push actions to bottom */}
          <div className="flex-1 min-h-[12px]"></div>

          {/* Action Section */}
          <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 space-y-2.5">
            {/* Reduced Size Action Buttons (Message / Chat & Partner) */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="grid grid-cols-2 gap-2"
            >
              {/* 1. Chat / Message Button */}
              {student.availability === "AWAY" ? (
                <div className="h-8 inline-flex items-center justify-center gap-1 px-2 text-[11px] bg-slate-100 dark:bg-slate-800/60 text-slate-400 dark:text-slate-500 font-medium rounded-xl border border-slate-200/50 dark:border-slate-800 truncate">
                  <Clock className="w-3 h-3 shrink-0" />
                  <span>Away</span>
                </div>
              ) : canDirectChat ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    startConversation({ targetStudentId: student.id });
                  }}
                  disabled={isStartingChat}
                  className="h-8 inline-flex items-center justify-center gap-1.5 px-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:hover:bg-emerald-500 dark:text-white transition-all shadow-xs active:scale-95 disabled:opacity-50"
                  title="Start chatting"
                >
                  {isStartingChat ? (
                    <Loader2 className="w-3 h-3 animate-spin shrink-0" />
                  ) : (
                    <Send className="w-3 h-3 shrink-0" />
                  )}
                  <span>Chat</span>
                </button>
              ) : hasPendingMessageRequest ? (
                <div className="h-8 inline-flex items-center justify-center gap-1 px-2 text-[11px] bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-medium rounded-xl border border-slate-200/50 dark:border-slate-800 truncate">
                  <Clock className="w-3 h-3 shrink-0" />
                  <span>Pending</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMessageModal(true);
                  }}
                  disabled={sendMessageMutation.isPending || messageSuccess}
                  className="h-8 inline-flex items-center justify-center gap-1 px-2 text-xs bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-xs active:scale-95 disabled:opacity-50"
                  title="Send message request"
                >
                  {messageSuccess ? (
                    <>
                      <Check className="w-3 h-3 shrink-0" />
                      <span>Sent!</span>
                    </>
                  ) : (
                    <>
                      <MessageSquare className="w-3 h-3 shrink-0" />
                      <span>Message</span>
                    </>
                  )}
                </button>
              )}

              {/* 2. Partner Button */}
              {student.availability === "AWAY" ? (
                <div className="h-8 inline-flex items-center justify-center gap-1 px-2 text-[11px] bg-slate-100 dark:bg-slate-800/60 text-slate-400 dark:text-slate-500 font-medium rounded-xl border border-slate-200/50 dark:border-slate-800 truncate">
                  <Clock className="w-3 h-3 shrink-0" />
                  <span>Away</span>
                </div>
              ) : mySemester === 8 ? (
                <div
                  className="h-8 inline-flex items-center justify-center gap-1 px-2 text-[11px] bg-slate-100 dark:bg-slate-800/60 text-slate-400 dark:text-slate-500 font-medium rounded-xl border border-slate-200/50 dark:border-slate-800 truncate"
                  title="Semester 8 students cannot form new groups"
                >
                  <Ban className="w-3 h-3 shrink-0" />
                  <span>Sem 8</span>
                </div>
              ) : student.isGraduated ? (
                <div
                  className="h-8 inline-flex items-center justify-center gap-1 px-2 text-[11px] bg-slate-100 dark:bg-slate-800/60 text-slate-400 dark:text-slate-500 font-medium rounded-xl border border-slate-200/50 dark:border-slate-800 truncate"
                  title="Alumni cannot form student groups"
                >
                  <Ban className="w-3 h-3 shrink-0" />
                  <span>Alumni</span>
                </div>
              ) : isUserGroupLocked || student.isGroupLocked ? (
                <div
                  className="h-8 inline-flex items-center justify-center gap-1 px-2 text-[11px] bg-slate-100 dark:bg-slate-800/60 text-slate-400 dark:text-slate-500 font-medium rounded-xl border border-slate-200/50 dark:border-slate-800 truncate"
                  title="Team is locked"
                >
                  <Ban className="w-3 h-3 shrink-0" />
                  <span>Locked</span>
                </div>
              ) : hasAcceptedPartnerRequest ? (
                <div className="h-8 inline-flex items-center justify-center gap-1 px-2 text-[11px] bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 font-medium rounded-xl border border-emerald-200/60 dark:border-emerald-800/60 truncate">
                  <Check className="w-3 h-3 shrink-0" />
                  <span>Partners</span>
                </div>
              ) : hasPendingPartnerRequest ? (
                <div className="h-8 inline-flex items-center justify-center gap-1 px-2 text-[11px] bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-medium rounded-xl border border-slate-200/50 dark:border-slate-800 truncate">
                  <Clock className="w-3 h-3 shrink-0" />
                  <span>Pending</span>
                </div>
              ) : !canPartnerSemester && mySemester !== undefined ? (
                <div
                  className="h-8 inline-flex items-center justify-center gap-1 px-2 text-[11px] bg-slate-100 dark:bg-slate-800/60 text-slate-400 dark:text-slate-500 font-medium rounded-xl border border-slate-200/50 dark:border-slate-800 truncate"
                  title={`Different semester (You: Sem ${mySemester}, Them: Sem ${student.semester})`}
                >
                  <Ban className="w-3 h-3 shrink-0" />
                  <span>Diff Sem</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowPartnerModal(true);
                  }}
                  disabled={sendPartnerMutation.isPending || partnerSuccess}
                  className="h-8 inline-flex items-center justify-center gap-1 px-2 text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 font-medium rounded-xl border border-slate-200/70 dark:border-slate-700/70 transition-all shadow-xs active:scale-95 disabled:opacity-50"
                  title="Send partner request"
                >
                  {partnerSuccess ? (
                    <>
                      <Check className="w-3 h-3 shrink-0" />
                      <span>Sent!</span>
                    </>
                  ) : (
                    <>
                      <Users className="w-3 h-3 shrink-0" />
                      <span>Partner</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* View Profile Action (A bit larger, clearly clickable, select-none) */}
            <button
              type="button"
              onClick={handleCardClick}
              className="w-full pt-2 pb-0.5 flex justify-center items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors select-none cursor-pointer group/link active:scale-[0.99]"
            >
              <span className="select-none">View Profile</span>
              <ArrowUpRight className="w-4 h-4 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shrink-0" />
            </button>
          </div>
        </div>
      </div>

      {/* Message Request Modal */}
      {mounted &&
        showMessageModal &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 overflow-y-auto overscroll-contain animate-in fade-in duration-200 text-left"
            onClick={() => setShowMessageModal(false)}
          >
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" />

            <div
              className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col max-h-[calc(100dvh-2rem)] my-auto animate-in zoom-in-95 duration-200 z-10"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-4 sm:p-6 pb-3 flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80">
                <div className="min-w-0">
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight truncate">
                    Message Request
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                    Connect with{" "}
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {student.name}
                    </span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowMessageModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Body */}
              <div className="p-4 sm:p-6 space-y-3.5 overflow-y-auto">
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Add a message explaining why you want to connect with {student.name}.
                </p>

                <div>
                  <textarea
                    value={messageReason}
                    onChange={(e) => setMessageReason(e.target.value)}
                    placeholder="Hi! I saw your profile on discovery and would love to collaborate..."
                    className="w-full h-24 sm:h-28 px-3.5 py-2.5 sm:px-4 sm:py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:border-transparent resize-none text-base sm:text-sm transition-all"
                    maxLength={500}
                  />
                  <div className="flex justify-between items-center mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                    <span>Keep it relevant and polite</span>
                    <span>{messageReason.length}/500</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 sm:p-6 pt-3 sm:pt-4 border-t border-slate-100 dark:border-slate-800/80 flex gap-3 bg-slate-50/50 dark:bg-slate-900/40">
                <button
                  type="button"
                  onClick={() => setShowMessageModal(false)}
                  className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-xs sm:text-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSendMessageRequest}
                  disabled={sendMessageMutation.isPending || !messageReason.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-sm disabled:opacity-50 text-xs sm:text-sm"
                >
                  {sendMessageMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Request"
                  )}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Partner Request Modal */}
      {mounted &&
        showPartnerModal &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 overflow-y-auto overscroll-contain animate-in fade-in duration-200 text-left"
            onClick={() => setShowPartnerModal(false)}
          >
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" />

            <div
              className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col max-h-[calc(100dvh-2rem)] my-auto animate-in zoom-in-95 duration-200 z-10"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-4 sm:p-6 pb-3 flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80">
                <div className="min-w-0">
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight truncate">
                    Partner Request
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                    Invite{" "}
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {student.name}
                    </span>{" "}
                    to your FYP group
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPartnerModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Body */}
              <div className="p-4 sm:p-6 space-y-3.5 overflow-y-auto">
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Add a message explaining your FYP vision and why you'd make a great team.
                </p>

                <div>
                  <textarea
                    value={partnerReason}
                    onChange={(e) => setPartnerReason(e.target.value)}
                    placeholder="Hi! I'm looking for a partner for my FYP on..."
                    className="w-full h-24 sm:h-28 px-3.5 py-2.5 sm:px-4 sm:py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:border-transparent resize-none text-base sm:text-sm transition-all"
                    maxLength={500}
                  />
                  <div className="flex justify-between items-center mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                    <span>Describe your tech stack or ideas</span>
                    <span>{partnerReason.length}/500</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 sm:p-6 pt-3 sm:pt-4 border-t border-slate-100 dark:border-slate-800/80 flex gap-3 bg-slate-50/50 dark:bg-slate-900/40">
                <button
                  type="button"
                  onClick={() => setShowPartnerModal(false)}
                  className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-xs sm:text-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSendPartnerRequest}
                  disabled={sendPartnerMutation.isPending || !partnerReason.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-sm disabled:opacity-50 text-xs sm:text-sm"
                >
                  {sendPartnerMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Request"
                  )}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
