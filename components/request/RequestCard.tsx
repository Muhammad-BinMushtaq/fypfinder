// components/request/RequestCard.tsx
"use client";

/**
 * RequestCard Component
 * ---------------------
 * Displays a request (message or partner) in a card format.
 * 
 * Props:
 * - request: The request data (MessageRequest | PartnerRequest)
 * - variant: "sent" | "received" - determines which student info to show
 * - type: "message" | "partner" - visual styling hint
 * - onAccept: Callback for accept action (only for received)
 * - onReject: Callback for reject action (only for received)
 * 
 * ⚠️ NO API calls, NO business logic here.
 * All data comes via props. Actions trigger parent callbacks.
 */

import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

import { 
  MessageSquare, 
  Users, 
  Clock, 
  CheckCircle2, 
  XCircle,
  ArrowUpRight,
  ArrowDownLeft,
  ExternalLink
} from "lucide-react";
import { RequestActions } from "./RequestActions";

export interface StudentPreview {
  id: string;
  name: string;
  department: string;
  currentSemester: number;
  profilePicture: string | null;
}

export interface BaseRequest {
  id: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  reason: string | null;
  createdAt: string;
  fromStudent?: StudentPreview;
  toStudent?: StudentPreview;
}

interface RequestCardProps {
  request: BaseRequest;
  variant: "sent" | "received";
  type: "message" | "partner";
  onAccept?: (requestId: string) => void;
  onReject?: (requestId: string) => void;
  isLoading?: boolean;
}

export function RequestCard({
  request,
  variant,
  type,
  onAccept,
  onReject,
  isLoading = false,
}: RequestCardProps) {
  // Get the relevant student (sender for received, receiver for sent)
  const student = variant === "received" ? request.fromStudent : request.toStudent;

  if (!student) {
    return null;
  }

  // Generate initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Get status badge style
  const getStatusBadge = () => {
    switch (request.status) {
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      case "ACCEPTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800">
            <CheckCircle2 className="w-3 h-3" />
            Accepted
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">
            <XCircle className="w-3 h-3" />
            Rejected
          </span>
        );
    }
  };

  // Get type icon
  const getTypeIcon = () => {
    if (type === "message") {
      return <MessageSquare className="w-4 h-4 text-gray-600 dark:text-gray-400" />;
    }
    return <Users className="w-4 h-4 text-gray-600 dark:text-gray-400" />;
  };

  // Get type label
  const getTypeLabel = () => {
    if (type === "message") {
      return "Message Request";
    }
    return "Partner Request";
  };

  // Get variant icon
  const getVariantIcon = () => {
    if (variant === "sent") {
      return <ArrowUpRight className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />;
    }
    return <ArrowDownLeft className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />;
  };

  // Get card border color based on type
  const getBorderClass = () => {
    return "border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600";
  };

  return (
    <div
      className={`relative bg-white dark:bg-slate-800 rounded-2xl border ${getBorderClass()} p-4 sm:p-5 hover:shadow-xl dark:hover:shadow-slate-900/50 transition-all duration-300 overflow-hidden`}
    >
      <div className="relative z-10">
        {/* Header: Type + Status + Time */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {getTypeIcon()}
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
              {getTypeLabel()}
            </span>
            {getVariantIcon()}
          </div>
          {getStatusBadge()}
        </div>

        {/* Student Info */}
        <div className="flex items-start gap-3 sm:gap-4">
          {/* Avatar - Clickable to profile */}
          <Link
            href={`/dashboard/discovery/profile/${student.id}`}
            className="flex-shrink-0 group"
          >
            {student.profilePicture ? (
              <img
                src={student.profilePicture}
                alt={student.name}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover border-2 border-gray-100 dark:border-slate-600 shadow-lg group-hover:border-gray-300 dark:group-hover:border-slate-500 transition-colors"
              />
            ) : (
              <div
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gray-900 dark:bg-slate-600 flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-lg group-hover:scale-105 transition-transform"
              >
                {getInitials(student.name)}
              </div>
            )}
          </Link>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <Link
              href={`/dashboard/discovery/profile/${student.id}`}
              className="inline-flex items-center gap-1 group"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white truncate group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
                {student.name}
              </h3>
              <ExternalLink className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-400 transition-colors" />
            </Link>
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
              {student.department}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Semester {student.currentSemester}
            </p>
          </div>
        </div>

        {/* Reason (if any) */}
        {request.reason && (
          <div className="mt-4 p-3 bg-gray-50 dark:bg-slate-700 rounded-xl border border-gray-100 dark:border-slate-600">
            <p className="text-sm text-gray-600 dark:text-gray-300 italic">"{request.reason}"</p>
          </div>
        )}

        {/* Timestamp */}
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
          {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
        </p>

        {/* Actions (only for received + pending) */}
        {variant === "received" && request.status === "PENDING" && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
            <RequestActions
              onAccept={() => onAccept?.(request.id)}
              onReject={() => onReject?.(request.id)}
              isLoading={isLoading}
              type={type}
            />
          </div>
        )}
      </div>
    </div>
  );
}
