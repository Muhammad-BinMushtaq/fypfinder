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
import { MessageSquare, Users, Loader2, Check, Ban, Clock, Send } from "lucide-react";
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
      <div className="flex flex-row gap-2 flex-wrap">
        {/* Send Message Request / Start Chat Button */}
        {targetAvailability === "AWAY" ? (
          // Target is away - cannot send message requests
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-red-50 text-red-600 font-medium rounded-lg border border-red-200">
            <Clock className="w-4 h-4" />
            User is Away
          </div>
        ) : isCheckingPermission ? (
          // Loading permission check
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-50 text-gray-500 font-medium rounded-lg border border-gray-200">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Checking...
          </div>
        ) : canMessage ? (
          // Can message (either partners or accepted request) - show Start Chat button
          <button
            onClick={() => startConversation({ targetStudentId })}
            disabled={isStartingChat}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all shadow-md shadow-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isStartingChat ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Opening...
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                Open Chat
              </>
            )}
          </button>
        ) : hasPendingMessageRequest ? (
          // Request pending
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 font-medium rounded-lg border border-amber-200 dark:border-amber-800">
            <Loader2 className="w-3.5 h-3.5" />
            Request Pending
          </div>
        ) : (
          // Can send request
          <button
            onClick={() => setShowMessageModal(true)}
            disabled={sendMessageMutation.isPending || messageSuccess}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {messageSuccess ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Sent!
              </>
            ) : sendMessageMutation.isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <MessageSquare className="w-3.5 h-3.5" />
                Start Messaging
              </>
            )}
          </button>
        )}

        {/* Send Partner Request Button */}
        {targetAvailability === "AWAY" ? (
          // Target is away - cannot send partner requests
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-medium rounded-lg border border-red-200 dark:border-red-800">
            <Clock className="w-3.5 h-3.5" />
            Away
          </div>
        ) : currentSemester === 8 ? (
          // Semester 8 students cannot send partner requests (read-only mode)
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 font-medium rounded-lg border border-slate-200 dark:border-slate-600">
            <Ban className="w-3.5 h-3.5" />
            View Only
          </div>
        ) : hasAcceptedPartnerRequest ? (
          // Already partnered
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-medium rounded-lg border border-green-200 dark:border-green-800">
            <Check className="w-3.5 h-3.5" />
            Partners
          </div>
        ) : isUserGroupLocked ? (
          // Current user's group is locked - cannot send partner requests
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400 font-medium rounded-lg border border-gray-200 dark:border-slate-600">
            <Ban className="w-3.5 h-3.5" />
            Group Locked
          </div>
        ) : isTargetGroupLocked ? (
          // Target's group is locked
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400 font-medium rounded-lg border border-gray-200 dark:border-slate-600">
            <Ban className="w-3.5 h-3.5" />
            Locked
          </div>
        ) : hasPendingPartnerRequest ? (
          // Request pending
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 font-medium rounded-lg border border-amber-200 dark:border-amber-800">
            <Loader2 className="w-3.5 h-3.5" />
            Request Pending
          </div>
        ) : !canPartner ? (
          // Semester mismatch - cannot send partner requests
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400 font-medium rounded-lg border border-gray-200 dark:border-slate-600">
            <Ban className="w-3.5 h-3.5" />
            Different Semester
          </div>
        ) : (
          // Can send request
          <button
            onClick={() => setShowPartnerModal(true)}
            disabled={sendPartnerMutation.isPending || partnerSuccess}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {partnerSuccess ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Sent!
              </>
            ) : sendPartnerMutation.isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Users className="w-3.5 h-3.5" />
                Add FYP Partner
              </>
            )}
          </button>
        )}

        {/* Semester mismatch hint */}
        {!canPartner && targetSemester !== undefined && currentSemester !== undefined && currentSemester !== 8 && (
          <div className="w-full mt-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-lg border border-amber-200 dark:border-amber-800">
            ⚠️ Partner requests require the same semester. You're in Semester {currentSemester}, they're in Semester {targetSemester}.
          </div>
        )}

        {/* Semester 8 info message */}
        {currentSemester === 8 && (
          <div className="w-full mt-2 text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/50 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600">
            ℹ️ Semester 8 students can view profiles and send messages, but cannot send partner requests.
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
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
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
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
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
