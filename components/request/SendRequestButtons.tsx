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

import { useState, useMemo } from "react";
import { useSendMessageRequest, useSentMessageRequests, useReceivedMessageRequests } from "@/hooks/request/useMessageRequests";
import { useSendPartnerRequest, useSentPartnerRequests } from "@/hooks/request/usePartnerRequests";
import { useStartConversation } from "@/hooks/messaging/useStartConversation";
import { useCheckMessagePermission } from "@/hooks/messaging/useCheckMessagePermission";
import { MessageSquare, Users, Loader2, Check, Ban, Clock, Send, Info } from "lucide-react";
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
}: SendRequestButtonsProps) {
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [messageReason, setMessageReason] = useState("");
  const [partnerReason, setPartnerReason] = useState("");
  const [messageSuccess, setMessageSuccess] = useState(false);
  const [partnerSuccess, setPartnerSuccess] = useState(false);

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
        toast.error("Please provide a reason for your message request");
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
        {!canPartner && targetSemester !== undefined && currentSemester !== undefined && currentSemester !== 8 && (
          <div className="w-full text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/60 flex items-start gap-2.5 leading-relaxed">
            <Info className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0 mt-0.5" />
            <span>
              Partner requests require the same semester (You: Sem {currentSemester}, Them: Sem {targetSemester}).
            </span>
          </div>
        )}

        {/* Minimalist Neutral Semester 8 Disclaimer */}
        {currentSemester === 8 && (
          <div className="w-full text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/60 flex items-start gap-2.5 leading-relaxed">
            <Info className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0 mt-0.5" />
            <span>
              Semester 8 students can message but cannot form partner groups.
            </span>
          </div>
        )}
      </div>

      {/* Message Request Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowMessageModal(false)}
          />

          {/* Modal */}
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
              Message Request to {targetName}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Add an optional message explaining why you want to connect.
            </p>

            <textarea
              value={messageReason}
              onChange={(e) => setMessageReason(e.target.value)}
              placeholder="Hi! I'd like to discuss potential FYP collaboration..."
              className="w-full h-24 px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent resize-none"
              maxLength={500}
            />
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 text-right">
              {messageReason.length}/500
            </p>

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowMessageModal(false)}
                className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-slate-600 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-slate-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendMessageRequest}
                disabled={sendMessageMutation.isPending}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-all disabled:opacity-50"
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
        </div>
      )}

      {/* Partner Request Modal */}
      {showPartnerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowPartnerModal(false)}
          />

          {/* Modal */}
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
              Partner Request to {targetName}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Add an optional message explaining why you want to partner with them for your FYP.
            </p>

            <textarea
              value={partnerReason}
              onChange={(e) => setPartnerReason(e.target.value)}
              placeholder="Hi! I'm looking for a partner for my FYP project on machine learning..."
              className="w-full h-24 px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent resize-none"
              maxLength={500}
            />
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 text-right">
              {partnerReason.length}/500
            </p>

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowPartnerModal(false)}
                className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-slate-600 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-slate-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendPartnerRequest}
                disabled={sendPartnerMutation.isPending}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-all disabled:opacity-50"
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
        </div>
      )}
    </>
  );
}
