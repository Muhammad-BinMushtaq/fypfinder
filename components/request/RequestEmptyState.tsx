// components/request/RequestEmptyState.tsx
"use client";

/**
 * RequestEmptyState Component
 * ---------------------------
 * Shown when there are no requests to display.
 * 
 * Props:
 * - variant: "sent" | "received"
 * - type: "message" | "partner"
 */

import { Inbox, Send, MessageSquare, Users } from "lucide-react";

interface RequestEmptyStateProps {
  variant: "sent" | "received";
  type: "message" | "partner";
}

export function RequestEmptyState({ variant, type }: RequestEmptyStateProps) {
  const getIcon = () => {
    if (variant === "received") {
      return <Inbox className="w-12 h-12 text-gray-300" />;
    }
    return <Send className="w-12 h-12 text-gray-300" />;
  };

  const getMessage = () => {
    if (variant === "received") {
      return type === "message"
        ? "No message requests received yet"
        : "No partner requests received yet";
    }
    return type === "message"
      ? "You haven't sent any message requests"
      : "You haven't sent any partner requests";
  };

  const getSubMessage = () => {
    if (variant === "received") {
      return "When someone wants to connect with you, their request will appear here.";
    }
    return type === "message"
      ? "Find students in Discovery and send them a message request to start a conversation."
      : "Find potential partners in Discovery and send them a partner request to form a group.";
  };

  const accentColor = type === "message" ? "blue" : "purple";

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div
        className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-4 ${
          type === "message"
            ? "bg-blue-50 border border-blue-100"
            : "bg-purple-50 border border-purple-100"
        }`}
      >
        {getIcon()}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">
        {getMessage()}
      </h3>
      <p className="text-sm text-gray-500 text-center max-w-sm">
        {getSubMessage()}
      </p>
    </div>
  );
}
