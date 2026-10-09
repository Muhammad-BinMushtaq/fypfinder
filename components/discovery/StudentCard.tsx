"use client";

/**
 * StudentCard Component
 * ---------------------
 * Clean, minimalist student preview card for discovery grid.
 * Equipped with minimal, non-blocking "Start Chat" and "Add Partner" actions.
 */

import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  FolderGit2,
  GraduationCap,
  MessageSquare,
  Users,
  Loader2,
  Check,
  Ban,
  Clock,
  Send,
  X,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { prefetchPublicProfile } from "@/hooks/student/usePublicProfile";
import { useSendMessageRequest } from "@/hooks/request/useMessageRequests";
import { useSendPartnerRequest } from "@/hooks/request/usePartnerRequests";
import { useStartConversation } from "@/hooks/messaging/useStartConversation";
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
  }, []);

  // Lock scroll when modal is active
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

  // Navigation to detail
  const handleCardClick = () => {
    router.push(`/dashboard/discovery/profile/${student.id}`);
  };

  const handleMouseEnter = () => {
    prefetchPublicProfile(queryClient, student.id);
  };

  // Eligibility and request status calculated client-side (Zero extra API calls)
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

  const getAvailabilityConfig = () => {
    if (student.isGroupLocked) {
      return { label: "Locked", dotColor: "bg-slate-400" };
    }
    switch (student.availability) {
      case "AVAILABLE":
        return { label: "Available", dotColor: "bg-emerald-500" };
      case "BUSY":
        return { label: "Busy", dotColor: "bg-amber-500" };
      case "AWAY":
        return { label: "Away", dotColor: "bg-slate-400" };
      default:
        return { label: "Unknown", dotColor: "bg-slate-400" };
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const availabilityConfig = getAvailabilityConfig();

  return (
    <>
      <div
        onClick={handleCardClick}
        onMouseEnter={handleMouseEnter}
        className="group cursor-pointer block h-full text-left"
      >
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-white/5 transition-all duration-300 overflow-hidden h-full flex flex-col hover:-translate-y-1 hover:shadow-xl relative">
          {/* Header Section */}
          <div className="p-6 flex flex-col items-center text-center space-y-4">
            {/* Avatar */}
            <div className="relative w-20 h-20 rounded-full overflow-hidden flex-shrink-0 bg-slate-50 dark:bg-slate-800 ring-4 ring-white dark:ring-slate-900 shadow-sm">
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
                <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-500 font-medium text-xl">
                  {getInitials(student.name)}
                </div>
              )}
            </div>

            {/* Core Info */}
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-lg tracking-tight truncate px-2">
                {student.name}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 truncate mt-0.5 flex items-center justify-center gap-1.5">
                <span>{student.department}</span>
                <span>·</span>
                {student.isGraduated ? (
                  <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                    <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                    Alumni
                  </span>
                ) : (
                  <span>Sem {student.semester}</span>
                )}
              </p>
            </div>

            {/* Status & Project Count */}
            <div className="flex items-center justify-center gap-4 text-xs font-medium w-full">
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${availabilityConfig.dotColor} shadow-sm`} />
                <span className="text-slate-600 dark:text-slate-300">{availabilityConfig.label}</span>
              </div>
              {student.projectCount > 0 && (
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  <FolderGit2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {student.projectCount} Project{student.projectCount !== 1 ? "s" : ""}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Skills - Minimal Pill Layout */}
          <div className="px-6 mt-auto">
            {student.skills && student.skills.length > 0 ? (
              <div className="flex flex-wrap justify-center gap-1.5">
                {student.skills.slice(0, 3).map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 text-[11px] rounded-full font-medium truncate max-w-[120px]"
                  >
                    {skill}
                  </span>
                ))}
                {student.skills.length > 3 && (
                  <span className="px-2 py-1 text-slate-400 dark:text-slate-500 text-[11px] font-medium">
                    +{student.skills.length - 3}
                  </span>
                )}
              </div>
            ) : (
              <div className="h-[26px]"></div>
            )}
          </div>

          {/* Minimal Action Row */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="px-4 py-3 mt-4 border-t border-slate-100 dark:border-white/5 grid grid-cols-2 gap-2 bg-slate-50/50 dark:bg-slate-900/50"
          >
            {/* 1. Chat / Message Button */}
            {student.availability === "AWAY" ? (
              <div className="h-8.5 inline-flex items-center justify-center gap-1 px-2 text-[11px] bg-slate-100 dark:bg-slate-800/60 text-slate-400 dark:text-slate-500 font-medium rounded-xl border border-slate-200/50 dark:border-slate-800 truncate">
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
                className="h-8.5 inline-flex items-center justify-center gap-1.5 px-2.5 text-xs bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-xs active:scale-95 disabled:opacity-50"
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
              <div className="h-8.5 inline-flex items-center justify-center gap-1 px-2 text-[11px] bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-medium rounded-xl border border-slate-200/50 dark:border-slate-800 truncate">
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
                className="h-8.5 inline-flex items-center justify-center gap-1.5 px-2.5 text-xs bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-xs active:scale-95 disabled:opacity-50"
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
              <div className="h-8.5 inline-flex items-center justify-center gap-1 px-2 text-[11px] bg-slate-100 dark:bg-slate-800/60 text-slate-400 dark:text-slate-500 font-medium rounded-xl border border-slate-200/50 dark:border-slate-800 truncate">
                <Clock className="w-3 h-3 shrink-0" />
                <span>Away</span>
              </div>
            ) : mySemester === 8 ? (
              <div
                className="h-8.5 inline-flex items-center justify-center gap-1 px-2 text-[11px] bg-slate-100 dark:bg-slate-800/60 text-slate-400 dark:text-slate-500 font-medium rounded-xl border border-slate-200/50 dark:border-slate-800 truncate"
                title="Semester 8 students cannot form new groups"
              >
                <Ban className="w-3 h-3 shrink-0" />
                <span>Sem 8</span>
              </div>
            ) : student.isGraduated ? (
              <div
                className="h-8.5 inline-flex items-center justify-center gap-1 px-2 text-[11px] bg-slate-100 dark:bg-slate-800/60 text-slate-400 dark:text-slate-500 font-medium rounded-xl border border-slate-200/50 dark:border-slate-800 truncate"
                title="Alumni cannot form student groups"
              >
                <Ban className="w-3 h-3 shrink-0" />
                <span>Alumni</span>
              </div>
            ) : isUserGroupLocked || student.isGroupLocked ? (
              <div
                className="h-8.5 inline-flex items-center justify-center gap-1 px-2 text-[11px] bg-slate-100 dark:bg-slate-800/60 text-slate-400 dark:text-slate-500 font-medium rounded-xl border border-slate-200/50 dark:border-slate-800 truncate"
                title="Team is locked"
              >
                <Ban className="w-3 h-3 shrink-0" />
                <span>Locked</span>
              </div>
            ) : hasAcceptedPartnerRequest ? (
              <div className="h-8.5 inline-flex items-center justify-center gap-1 px-2 text-[11px] bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 font-medium rounded-xl border border-emerald-200/60 dark:border-emerald-800/60 truncate">
                <Check className="w-3 h-3 shrink-0" />
                <span>Partners</span>
              </div>
            ) : hasPendingPartnerRequest ? (
              <div className="h-8.5 inline-flex items-center justify-center gap-1 px-2 text-[11px] bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-medium rounded-xl border border-slate-200/50 dark:border-slate-800 truncate">
                <Clock className="w-3 h-3 shrink-0" />
                <span>Pending</span>
              </div>
            ) : !canPartnerSemester && mySemester !== undefined ? (
              <div
                className="h-8.5 inline-flex items-center justify-center gap-1 px-2 text-[11px] bg-slate-100 dark:bg-slate-800/60 text-slate-400 dark:text-slate-500 font-medium rounded-xl border border-slate-200/50 dark:border-slate-800 truncate"
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
                className="h-8.5 inline-flex items-center justify-center gap-1.5 px-2.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 font-medium rounded-xl border border-slate-200/70 dark:border-slate-700/70 transition-all shadow-xs active:scale-95 disabled:opacity-50"
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
