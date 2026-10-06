// components/request/RequestCard.tsx
"use client";

/**
 * RequestCard Component
 * ---------------------
 * Displays an incoming or outgoing request in a modern minimalist card.
 * 
 * Props:
 * - request: The request data (MessageRequest | PartnerRequest)
 * - variant: "sent" | "received" - determines which student info to show
 * - type: "message" | "partner" - visual styling hint
 * - onAccept: Callback for accept action (only for received)
 * - onReject: Callback for reject action (only for received)
 */

import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { 
  MessageSquare, 
  Users, 
  ArrowUpRight,
  ArrowDownLeft,
  ExternalLink,
  Clock
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
  const student = variant === "received" ? request.fromStudent : request.toStudent;

  if (!student) {
    return null;
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .filter(Boolean)
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusIndicator = () => {
    switch (request.status) {
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
            Pending Decision
          </span>
        );
      case "ACCEPTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Accepted
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
            Declined
          </span>
        );
    }
  };

  const isPartner = type === "partner";
  const isIncoming = variant === "received";

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 transition-all duration-200 p-4 sm:p-5 flex flex-col justify-between shadow-2xs overflow-hidden">
      <div>
        {/* Card Header: Type Badge, Direction & Status */}
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700">
              {isPartner ? <Users className="w-3 h-3" /> : <MessageSquare className="w-3 h-3" />}
              <span>{isPartner ? "Partner Invite" : "Message Request"}</span>
            </span>
            <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
              {isIncoming ? <ArrowDownLeft className="w-3 h-3 text-slate-400" /> : <ArrowUpRight className="w-3 h-3 text-slate-400" />}
              <span>{isIncoming ? "Incoming" : "Outgoing"}</span>
            </span>
          </div>

          <div>{getStatusIndicator()}</div>
        </div>

        {/* Student Profile Info */}
        <div className="flex items-start gap-3">
          <Link
            href={`/dashboard/discovery/profile/${student.id}`}
            className="shrink-0 group"
          >
            {student.profilePicture ? (
              <img
                src={student.profilePicture}
                alt={student.name}
                className="w-11 h-11 rounded-xl object-cover border border-slate-200 dark:border-slate-700 group-hover:border-slate-400 transition"
              />
            ) : (
              <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-800 dark:text-slate-200 font-bold text-xs group-hover:scale-102 transition">
                {getInitials(student.name)}
              </div>
            )}
          </Link>

          <div className="min-w-0 flex-1">
            <Link
              href={`/dashboard/discovery/profile/${student.id}`}
              className="inline-flex items-center gap-1 group truncate max-w-full"
            >
              <h3 className="font-bold text-slate-900 dark:text-white text-sm group-hover:underline truncate">
                {student.name}
              </h3>
              <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 shrink-0" />
            </Link>

            <p className="text-xs text-slate-600 dark:text-slate-400 truncate mt-0.5">
              {student.department}
            </p>

            <span className="inline-block mt-1 text-[10px] font-semibold text-slate-500 dark:text-slate-400 px-1.5 py-0.2 rounded bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
              Semester {student.currentSemester}
            </span>
          </div>
        </div>

        {/* Reason / Accompanying Message */}
        {request.reason && (
          <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/80">
            <p className="text-xs text-slate-600 dark:text-slate-300 italic leading-relaxed border-l-2 border-slate-300 dark:border-slate-700 pl-2.5">
              "{request.reason}"
            </p>
          </div>
        )}
      </div>

      {/* Card Footer: Timestamp & Actions */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
          </span>
          <span className="text-[10px] font-medium text-slate-400">
            {isIncoming ? "Sent to you" : "Sent by you"}
          </span>
        </div>

        {/* Action Buttons for Incoming Pending Requests */}
        {isIncoming && request.status === "PENDING" && (
          <RequestActions
            onAccept={() => onAccept?.(request.id)}
            onReject={() => onReject?.(request.id)}
            isLoading={isLoading}
            type={type}
          />
        )}
      </div>
    </div>
  );
}
