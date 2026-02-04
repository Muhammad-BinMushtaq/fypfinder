// components/request/SendRequestButtons.tsx
"use client";

/**
 * SendRequestButtons Component
 * ----------------------------
 * Action buttons to send message/partner requests from public profile.
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

import { useState } from "react";
import { useSendMessageRequest } from "@/hooks/request/useMessageRequests";
import { useSendPartnerRequest } from "@/hooks/request/usePartnerRequests";
import { MessageSquare, Users, Loader2, Check } from "lucide-react";

interface SendRequestButtonsProps {
  targetStudentId: string;
  targetName: string;
  isSameStudent?: boolean;
  targetSemester?: number;
  currentSemester?: number;
}

export function SendRequestButtons({
  targetStudentId,
  targetName,
  isSameStudent = false,
  targetSemester,
  currentSemester,
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
      await sendMessageMutation.mutateAsync({
        toStudentId: targetStudentId,
        reason: messageReason || undefined,
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
      await sendPartnerMutation.mutateAsync({
        toStudentId: targetStudentId,
        reason: partnerReason || undefined,
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
      <div className="flex flex-wrap gap-3">
        {/* Send Message Request Button */}
        <button
          onClick={() => setShowMessageModal(true)}
          disabled={sendMessageMutation.isPending || messageSuccess}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {messageSuccess ? (
            <>
              <Check className="w-4 h-4" />
              Request Sent!
            </>
          ) : sendMessageMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <MessageSquare className="w-4 h-4" />
              Send Message Request
            </>
          )}
        </button>

        {/* Send Partner Request Button */}
        <button
          onClick={() => setShowPartnerModal(true)}
          disabled={sendPartnerMutation.isPending || partnerSuccess}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {partnerSuccess ? (
            <>
              <Check className="w-4 h-4" />
              Request Sent!
            </>
          ) : sendPartnerMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Users className="w-4 h-4" />
              Send Partner Request
            </>
          )}
        </button>

        {/* Semester mismatch hint */}
        {!canPartner && targetSemester !== undefined && currentSemester !== undefined && (
          <div className="w-full mt-2 text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
            ⚠️ Partner requests require the same semester. You're in Semester {currentSemester}, they're in Semester {targetSemester}.
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
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Message Request to {targetName}
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Add an optional message explaining why you want to connect.
            </p>

            <textarea
              value={messageReason}
              onChange={(e) => setMessageReason(e.target.value)}
              placeholder="Hi! I'd like to discuss potential FYP collaboration..."
              className="w-full h-24 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 placeholder:text-gray-400"
              maxLength={500}
            />
            <p className="text-xs text-gray-400 mt-1 text-right">
              {messageReason.length}/500
            </p>

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowMessageModal(false)}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendMessageRequest}
                disabled={sendMessageMutation.isPending}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50"
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
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Partner Request to {targetName}
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Add an optional message explaining why you want to partner with them for your FYP.
            </p>

            <textarea
              value={partnerReason}
              onChange={(e) => setPartnerReason(e.target.value)}
              placeholder="Hi! I'm looking for a partner for my FYP project on machine learning..."
              className="w-full h-24 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-gray-900 placeholder:text-gray-400"
              maxLength={500}
            />
            <p className="text-xs text-gray-400 mt-1 text-right">
              {partnerReason.length}/500
            </p>

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowPartnerModal(false)}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendPartnerRequest}
                disabled={sendPartnerMutation.isPending}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-medium rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all disabled:opacity-50"
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
