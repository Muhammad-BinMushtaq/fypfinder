// components/request/SendRequestButtons.tsx
"use client";

/**
 * SendRequestButtons Component
 * ----------------------------
 * Action buttons to send message/partner requests from public profile.
 * Also shows "Start Conversation" button if users are allowed to message.
 * 
 * Props:
 * - targetStudentId: The student to send request to
 * - targetName: Student name for confirmation messages
 * - isSameStudent: If true, hide buttons (can't request yourself)
 * - targetSemester: Used to check partner eligibility
 * - currentSemester: Current user's semester
 * 
 * ⚠️ Backend validates all eligibility. These buttons just trigger the request.
 */

import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { useSendMessageRequest, useSentMessageRequests, useReceivedMessageRequests } from "@/hooks/request/useMessageRequests";
import { useSendPartnerRequest, useSentPartnerRequests } from "@/hooks/request/usePartnerRequests";
import { useStartConversation } from "@/hooks/messaging/useStartConversation";
import { useCheckMessagePermission } from "@/hooks/messaging/useCheckMessagePermission";
import { MessageSquare, Users, Loader2, Check, Ban, Clock, Send, Info, X } from "lucide-react";
import { toast } from "react-toastify";

interface SendRequestButtonsProps {
  targetStudentId: string;
  targetName: string;
  isSameStudent?: boolean;
  targetSemester?: number;
  currentSemester?: number;
  /** Is current user already in an FYP group? */
  isUserInGroup?: boolean;
  /** Is target student in a locked group? */
  isTargetGroupLocked?: boolean;
  /** Is current user's group locked? */
  isUserGroupLocked?: boolean;
  /** Target student's availability status */
  targetAvailability?: "AVAILABLE" | "BUSY" | "AWAY";
  isTargetGraduated?: boolean;
}

export function SendRequestButtons({
  targetStudentId,
  targetName,
  isSameStudent = false,
  targetSemester,
  currentSemester,
  isUserInGroup = false,
  isTargetGroupLocked = false,
  isUserGroupLocked = false,
  targetAvailability = "AVAILABLE",
  isTargetGraduated = false,
}: SendRequestButtonsProps) {
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

  // Lock background scroll, hide mobile bottom nav, and isolate interaction
  useEffect(() => {
    const isAnyModalOpen = showMessageModal || showPartnerModal;
    if (isAnyModalOpen) {
      document.body.style.overflow = "hidden";
      document.body.classList.add("modal-open");
    } else {
      document.body.style.overflow = "unset";
      document.body.classList.remove("modal-open");
    }
    return () => {
      document.body.style.overflow = "unset";
      document.body.classList.remove("modal-open");
    };
  }, [showMessageModal, showPartnerModal]);

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowMessageModal(false);
        setShowPartnerModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Mutations
  const sendMessageMutation = useSendMessageRequest();
  const sendPartnerMutation = useSendPartnerRequest();
  const { startConversation, isPending: isStartingChat } = useStartConversation();

  // Check if users can message each other (partners or accepted request)
  const { canMessage, isLoading: isCheckingPermission } = useCheckMessagePermission(
    isSameStudent ? null : targetStudentId
  );

  // Fetch existing requests to check status
  const { data: sentMessageRequests } = useSentMessageRequests();
  const { data: receivedMessageRequests } = useReceivedMessageRequests();
  const { data: sentPartnerRequests } = useSentPartnerRequests();

  // Check if there's an existing message request to this student (sent by current user)
  const existingSentMessageRequest = useMemo(() => {
    if (!sentMessageRequests) return null;
    return sentMessageRequests.find((req: any) => req.toStudentId === targetStudentId);
  }, [sentMessageRequests, targetStudentId]);

  // Check if there's an existing message request from this student (received by current user)
  const existingReceivedMessageRequest = useMemo(() => {
    if (!receivedMessageRequests) return null;
    return receivedMessageRequests.find((req: any) => req.fromStudentId === targetStudentId);
  }, [receivedMessageRequests, targetStudentId]);

  // Check if there's an existing partner request to this student
  const existingPartnerRequest = useMemo(() => {
    if (!sentPartnerRequests) return null;
    return sentPartnerRequests.find((req: any) => req.toStudentId === targetStudentId);
  }, [sentPartnerRequests, targetStudentId]);

  // Determine button states
  // canMessage from API checks both partners AND accepted requests
  const hasPendingMessageRequest = existingSentMessageRequest?.status === "PENDING";
  const hasAcceptedPartnerRequest = existingPartnerRequest?.status === "ACCEPTED";
  const hasPendingPartnerRequest = existingPartnerRequest?.status === "PENDING";

  // If same student, don't show anything
  if (isSameStudent) {
    return null;
  }

  // Check if semesters match for partner request hint
  const canPartner =
    targetSemester !== undefined &&
    currentSemester !== undefined &&
    targetSemester === currentSemester;

  // Handle send message request
  const handleSendMessageRequest = async () => {
    try {
      if (messageReason.trim() === "") {
        toast.error("Please provide a reason for your message request");
        return;
      }
      await sendMessageMutation.mutateAsync({
        toStudentId: targetStudentId,
        reason: messageReason
      });
      setMessageSuccess(true);
      setShowMessageModal(false);
      setMessageReason("");
      setTimeout(() => setMessageSuccess(false), 3000);
    } catch (error) {
      // Error handling is in the mutation
    }
  };

  // Handle send partner request
  const handleSendPartnerRequest = async () => {
    try {
      if (partnerReason.trim() === "") {
        toast.error("Please provide a reason for your partner request");
        return;
      }
      await sendPartnerMutation.mutateAsync({
        toStudentId: targetStudentId,
        reason: partnerReason,
      });
      setPartnerSuccess(true);
      setShowPartnerModal(false);
      setPartnerReason("");
      setTimeout(() => setPartnerSuccess(false), 3000);
    } catch (error) {
      // Error handling is in the mutation
    }
  };

  return (
    <>
      <div className="w-full space-y-2.5">
        {/* Parallel Action Buttons (Side-by-Side 50/50 Grid) */}
        <div className="grid grid-cols-2 gap-2 w-full">
          {/* Send Message Request / Start Chat Button */}
          {targetAvailability === "AWAY" ? (
            <div className="w-full h-10 inline-flex items-center justify-center gap-1.5 px-2 text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium rounded-xl border border-slate-200/60 dark:border-slate-700/60 truncate">
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span>Away</span>
            </div>
          ) : isCheckingPermission ? (
            <div className="w-full h-10 inline-flex items-center justify-center gap-1.5 px-2 text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium rounded-xl border border-slate-200/60 dark:border-slate-700/60">
              <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
              <span>Checking...</span>
            </div>
          ) : canMessage ? (
            <button
              onClick={() => startConversation({ targetStudentId })}
              disabled={isStartingChat}
              className="w-full h-10 inline-flex items-center justify-center gap-1.5 px-2 text-xs sm:text-sm bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isStartingChat ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                  <span>Opening...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 shrink-0" />
                  <span>Chat</span>
                </>
              )}
            </button>
          ) : hasPendingMessageRequest ? (
            <div className="w-full h-10 inline-flex items-center justify-center gap-1.5 px-2 text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium rounded-xl border border-slate-200/60 dark:border-slate-700/60">
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span>Pending</span>
            </div>
          ) : (
            <button
              onClick={() => setShowMessageModal(true)}
              disabled={sendMessageMutation.isPending || messageSuccess}
              className="w-full h-10 inline-flex items-center justify-center gap-1.5 px-2 text-xs sm:text-sm bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {messageSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 shrink-0" />
                  <span>Sent!</span>
                </>
              ) : sendMessageMutation.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                  <span>Message</span>
                </>
              )}
            </button>
          )}

          {/* Send Partner Request Button */}
          {targetAvailability === "AWAY" ? (
            <div className="w-full h-10 inline-flex items-center justify-center gap-1.5 px-2 text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium rounded-xl border border-slate-200/60 dark:border-slate-700/60 truncate">
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span>Away</span>
            </div>
          ) : currentSemester === 8 ? (
            <div className="w-full h-10 inline-flex items-center justify-center gap-1.5 px-2 text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium rounded-xl border border-slate-200/60 dark:border-slate-700/60 truncate">
              <Ban className="w-3.5 h-3.5 shrink-0" />
              <span>View Only</span>
            </div>
          ) : hasAcceptedPartnerRequest ? (
            <div className="w-full h-10 inline-flex items-center justify-center gap-1.5 px-2 text-xs bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 font-medium rounded-xl border border-emerald-200/60 dark:border-emerald-800/60">
              <Check className="w-3.5 h-3.5 shrink-0" />
              <span>Partners</span>
            </div>
          ) : isUserGroupLocked || isTargetGroupLocked ? (
            <div className="w-full h-10 inline-flex items-center justify-center gap-1.5 px-2 text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium rounded-xl border border-slate-200/60 dark:border-slate-700/60">
              <Ban className="w-3.5 h-3.5 shrink-0" />
              <span>Locked</span>
            </div>
          ) : hasPendingPartnerRequest ? (
            <div className="w-full h-10 inline-flex items-center justify-center gap-1.5 px-2 text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium rounded-xl border border-slate-200/60 dark:border-slate-700/60">
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span>Pending</span>
            </div>
          ) : isTargetGraduated ? (
            <div className="w-full h-10 inline-flex items-center justify-center gap-1.5 px-2 text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium rounded-xl border border-slate-200/60 dark:border-slate-700/60 truncate" title="Graduated alumni cannot form new groups">
              <Ban className="w-3.5 h-3.5 shrink-0" />
              <span>Alumni</span>
            </div>
          ) : !canPartner ? (
            <div className="w-full h-10 inline-flex items-center justify-center gap-1.5 px-2 text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium rounded-xl border border-slate-200/60 dark:border-slate-700/60 truncate">
              <Ban className="w-3.5 h-3.5 shrink-0" />
              <span>Different Sem</span>
            </div>
          ) : (
            <button
              onClick={() => setShowPartnerModal(true)}
              disabled={sendPartnerMutation.isPending || partnerSuccess}
              className="w-full h-10 inline-flex items-center justify-center gap-1.5 px-2 text-xs sm:text-sm bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-medium rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {partnerSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 shrink-0" />
                  <span>Sent!</span>
                </>
              ) : sendPartnerMutation.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Users className="w-3.5 h-3.5 shrink-0" />
                  <span>Partner</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Minimalist Neutral Semester Mismatch Disclaimer */}
        {!canPartner && !isTargetGraduated && targetSemester !== undefined && currentSemester !== undefined && currentSemester !== 8 && (
          <p className="text-center text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            Partner requests require matching semesters (You: Sem {currentSemester}, Them: Sem {targetSemester}).
          </p>
        )}

        {/* Minimalist Neutral Semester 8 Disclaimer */}
        {currentSemester === 8 && (
          <p className="text-center text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            Semester 8 students can message but cannot form partner groups.
          </p>
        )}
      </div>

      {/* Message Request Modal */}
      {mounted && showMessageModal && createPortal(
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 overflow-y-auto overscroll-contain animate-in fade-in duration-200"
          onClick={() => setShowMessageModal(false)}
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            aria-hidden="true"
          />

          {/* Modal Dialog */}
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
                  Connect with <span className="font-semibold text-slate-800 dark:text-slate-200">{targetName}</span>
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

            {/* Scrollable Form Body */}
            <div className="p-4 sm:p-6 space-y-3.5 overflow-y-auto">
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Add an optional message explaining why you want to connect.
              </p>

              <div>
                <textarea
                  value={messageReason}
                  onChange={(e) => setMessageReason(e.target.value)}
                  placeholder="Hi! I'd like to discuss potential FYP collaboration..."
                  className="w-full h-24 sm:h-28 px-3.5 py-2.5 sm:px-4 sm:py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:border-transparent resize-none text-base sm:text-sm transition-all"
                  maxLength={500}
                />
                <div className="flex justify-between items-center mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                  <span>Keep it relevant and polite</span>
                  <span>{messageReason.length}/500</span>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
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
      {mounted && showPartnerModal && createPortal(
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 overflow-y-auto overscroll-contain animate-in fade-in duration-200"
          onClick={() => setShowPartnerModal(false)}
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            aria-hidden="true"
          />

          {/* Modal Dialog */}
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
                  Invite <span className="font-semibold text-slate-800 dark:text-slate-200">{targetName}</span> to your FYP group
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

            {/* Scrollable Form Body */}
            <div className="p-4 sm:p-6 space-y-3.5 overflow-y-auto">
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Add an optional message explaining why you want to partner with them for your FYP.
              </p>

              <div>
                <textarea
                  value={partnerReason}
                  onChange={(e) => setPartnerReason(e.target.value)}
                  placeholder="Hi! I'm looking for a partner for my FYP project on..."
                  className="w-full h-24 sm:h-28 px-3.5 py-2.5 sm:px-4 sm:py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:border-transparent resize-none text-base sm:text-sm transition-all"
                  maxLength={500}
                />
                <div className="flex justify-between items-center mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                  <span>Describe your skills or project ideas</span>
                  <span>{partnerReason.length}/500</span>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
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
