// app/dashboard/settings/page.tsx
"use client";

import { useState } from "react";
import { 
  Settings, 
  User, 
  Shield, 
  Bell, 
  Trash2, 
  GraduationCap, 
  CheckCircle2, 
  ExternalLink, 
  Eye, 
  EyeOff, 
  Smartphone, 
  Lock, 
  Sparkles, 
  Users, 
  AlertTriangle,
  Info,
  LogOut
} from "lucide-react";
import Link from "next/link";
import { DeletionRequestButton } from "@/components/student/DeletionRequestButton";
import { NotificationSettings } from "@/components/pwa/NotificationSettings";
import { useSession } from "@/hooks/auth/useSession";
import { useMyProfile } from "@/hooks/student/useMyProfile";
import { useMyGroup, useUpdateGroupVisibility } from "@/hooks/group/useMyGroup";

type SettingsTab = "account" | "notifications" | "privacy" | "security";

export default function SettingsPage() {
  const { user, logout } = useSession();
  const { profile } = useMyProfile();
  const { group } = useMyGroup();
  const updateGroupVisibility = useUpdateGroupVisibility();

  const [activeTab, setActiveTab] = useState<SettingsTab>("account");
  
  // Local toggles for simulated/granular preferences
  const [partnerRequestsAlert, setPartnerRequestsAlert] = useState(true);
  const [chatMessagesAlert, setChatMessagesAlert] = useState(true);
  const [ideaValidationAlert, setIdeaValidationAlert] = useState(true);
  const [workspaceTasksAlert, setWorkspaceTasksAlert] = useState(true);

  const currentMember = group?.members.find((m) => m.id === profile?.id);
  const isGroupVisible = currentMember?.showGroupOnProfile ?? true;

  return (
    <div className="min-h-screen bg-transparent text-slate-900 dark:text-slate-100 font-sans pb-16 overflow-x-hidden">
      {/* Top Header Banner */}
      <div className="border-b border-white/40 dark:border-white/10 bg-black/5 dark:bg-white/5 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm font-medium uppercase tracking-wider bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-300">
                  <Settings className="h-4 w-4" />
                  Preferences
                </span>
                <span className="text-sm text-slate-400">•</span>
                <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                  PAF-IAST Student Account
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                Settings & Preferences
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base mt-2 max-w-xl leading-relaxed">
                Manage your institutional identity, FYP partner discovery privacy, notification channels, and account security.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/dashboard/profile"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl border border-white/40 dark:border-white/10 bg-white/80 dark:bg-white/10 backdrop-blur-md text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-xl"
              >
                <User className="h-4 w-4" />
                View Profile
              </Link>
            </div>
          </div>

          {/* Segmented Navigation Tabs (Pill style, flex-wrap to prevent horizontal scroll) */}
          <div className="mt-8">
            <div className="inline-flex flex-wrap items-center bg-black/5 dark:bg-white/5 backdrop-blur-md rounded-3xl p-1.5 border border-white/20 dark:border-white/5 w-full lg:w-fit">
              <button
                onClick={() => setActiveTab("account")}
                className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-medium transition-all flex-1 sm:flex-none ${
                  activeTab === "account"
                    ? "bg-white/80 dark:bg-white/10 backdrop-blur-md text-slate-900 dark:text-white shadow-xl border border-white/40 dark:border-white/10"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <User className="w-4 h-4" />
                <span>Account & Identity</span>
              </button>

              <button
                onClick={() => setActiveTab("notifications")}
                className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-medium transition-all flex-1 sm:flex-none ${
                  activeTab === "notifications"
                    ? "bg-white/80 dark:bg-white/10 backdrop-blur-md text-slate-900 dark:text-white shadow-xl border border-white/40 dark:border-white/10"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Bell className="w-4 h-4" />
                <span>Notifications & Alerts</span>
              </button>

              <button
                onClick={() => setActiveTab("privacy")}
                className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-medium transition-all flex-1 sm:flex-none ${
                  activeTab === "privacy"
                    ? "bg-white/80 dark:bg-white/10 backdrop-blur-md text-slate-900 dark:text-white shadow-xl border border-white/40 dark:border-white/10"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Users className="w-4 h-4" />
                <span>FYP Privacy</span>
              </button>

              <button
                onClick={() => setActiveTab("security")}
                className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-medium transition-all flex-1 sm:flex-none ${
                  activeTab === "security"
                    ? "bg-white/80 dark:bg-white/10 backdrop-blur-md text-slate-900 dark:text-white shadow-xl border border-white/40 dark:border-white/10"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Security</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Settings Content Area */}
      <div className="max-w-5xl mx-auto px-3.5 sm:px-6 py-6 sm:py-8">
        {/* ================= TAB 1: ACCOUNT & IDENTITY ================= */}
        {activeTab === "account" && (
          <div className="space-y-4 sm:space-y-6">
            {/* Institutional ID Card */}
            <div className="rounded-3xl border border-white/40 dark:border-white/10 bg-white/80 dark:bg-white/10 backdrop-blur-md p-4 sm:p-6 shadow-xl space-y-4 sm:space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-white/20 dark:border-white/5 pb-3 sm:pb-4">
                <div>
                  <h3 className="text-sm sm:text-base font-medium uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5 sm:gap-2">
                    <GraduationCap className="h-4 w-4 text-slate-600 dark:text-slate-400 shrink-0" />
                    Institutional Credentials
                  </h3>
                  <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-0.5">
                    Verified credentials managed by Pak-Austria Fachhochschule (PAF-IAST).
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-sm sm:text-base font-medium w-fit">
                  <CheckCircle2 className="h-3 w-3 text-emerald-400 dark:text-emerald-600 shrink-0" />
                  Verified Student (Azure SSO)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                <div className="p-3 sm:p-3.5 rounded-2xl border border-white/20 dark:border-white/5 bg-slate-50/50 dark:bg-slate-800/30">
                  <span className="text-slate-400 font-medium block mb-1 text-sm">Student Full Name</span>
                  <p className="font-medium text-slate-900 dark:text-white text-sm sm:text-base break-words">
                    {profile?.name || "Student User"}
                  </p>
                </div>

                <div className="p-3 sm:p-3.5 rounded-2xl border border-white/20 dark:border-white/5 bg-slate-50/50 dark:bg-slate-800/30">
                  <span className="text-slate-400 font-medium block mb-1 text-sm">Official University Email</span>
                  <p className="font-medium text-slate-900 dark:text-white text-sm sm:text-base break-all">
                    {user?.email || "student@paf-iast.edu.pk"}
                  </p>
                </div>

                <div className="p-3 sm:p-3.5 rounded-2xl border border-white/20 dark:border-white/5 bg-slate-50/50 dark:bg-slate-800/30">
                  <span className="text-slate-400 font-medium block mb-1 text-sm">Department / Academic Discipline</span>
                  <p className="font-medium text-slate-900 dark:text-white text-sm sm:text-base break-words">
                    {profile?.department || "Computer Science / Software Engineering"}
                  </p>
                </div>

                <div className="p-3 sm:p-3.5 rounded-2xl border border-white/20 dark:border-white/5 bg-slate-50/50 dark:bg-slate-800/30">
                  <span className="text-slate-400 font-medium block mb-1 text-sm">Current Semester & Batch</span>
                  <p className="font-medium text-slate-900 dark:text-white text-sm sm:text-base">
                    {profile?.semester ? `Semester ${profile.semester}` : "Semester 7/8"} • Senior Batch
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-white/20 dark:border-white/5">
                <span className="text-sm sm:text-base text-slate-400">
                  To update official department or name, contact the PAF-IAST registrar.
                </span>
                <Link
                  href="/dashboard/profile"
                  className="inline-flex items-center gap-1 text-sm font-medium text-slate-900 dark:text-white hover:underline w-fit"
                >
                  Edit Portfolio Bio & Skills <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Discovery Preview Card */}
            <div className="rounded-3xl border border-white/40 dark:border-white/10 bg-black/5 dark:bg-white/5 backdrop-blur-md p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-medium text-slate-800 dark:text-slate-200 shrink-0">
                  {(profile?.name || "S").charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-white text-sm sm:text-base">
                    Public Discovery Card Preview
                  </h4>
                  <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-0.5">
                    Your profile is active and discoverable by other PAF-IAST students seeking partners.
                  </p>
                </div>
              </div>
              <Link
                href="/dashboard/discovery"
                className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-2xl bg-white/80 dark:bg-white/10 backdrop-blur-md border border-white/40 dark:border-white/10 text-slate-800 dark:text-slate-200 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition w-full sm:w-fit shrink-0"
              >
                Go to Partner Discovery
              </Link>
            </div>
          </div>
        )}

        {/* ================= TAB 2: NOTIFICATIONS ================= */}
        {activeTab === "notifications" && (
          <div className="space-y-4 sm:space-y-6">
            {/* PWA Push Notification Panel */}
            <div className="rounded-3xl border border-white/40 dark:border-white/10 bg-white/80 dark:bg-white/10 backdrop-blur-md p-4 sm:p-6 shadow-xl">
              <div className="mb-4">
                <h3 className="text-sm sm:text-base font-medium uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5 sm:gap-2">
                  <Smartphone className="h-4 w-4 text-slate-600 dark:text-slate-400 shrink-0" />
                  Web Push Notification Service
                </h3>
                <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-0.5">
                  Receive instant alerts on your desktop or mobile device when partners reach out.
                </p>
              </div>

              <NotificationSettings />
            </div>

            {/* Granular Alert Preferences */}
            <div className="rounded-3xl border border-white/40 dark:border-white/10 bg-white/80 dark:bg-white/10 backdrop-blur-md p-4 sm:p-6 shadow-xl space-y-3 sm:space-y-4">
              <div className="border-b border-white/20 dark:border-white/5 pb-3">
                <h3 className="text-sm sm:text-base font-medium uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5 sm:gap-2">
                  <Bell className="h-4 w-4 text-slate-600 dark:text-slate-400 shrink-0" />
                  Alert Channels & Event Triggers
                </h3>
                <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-0.5">
                  Customize which activities trigger automated notification alerts.
                </p>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800/80 text-sm">
                {/* Trigger 1 */}
                <div className="py-3 flex items-start sm:items-center justify-between gap-3">
                  <div className="min-w-0 pr-2">
                    <h4 className="font-medium text-slate-900 dark:text-white text-sm sm:text-base leading-snug">
                      FYP Partner Requests & Invitations
                    </h4>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
                      Notify immediately when a student invites you to join their FYP group.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={partnerRequestsAlert}
                    onChange={(e) => setPartnerRequestsAlert(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer accent-slate-900 dark:accent-white shrink-0 mt-0.5 sm:mt-0"
                  />
                </div>

                {/* Trigger 2 */}
                <div className="py-3 flex items-start sm:items-center justify-between gap-3">
                  <div className="min-w-0 pr-2">
                    <h4 className="font-medium text-slate-900 dark:text-white text-sm sm:text-base leading-snug">
                      Teammate Direct Messages
                    </h4>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
                      Send push notifications for new group chat messages and inquiries.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={chatMessagesAlert}
                    onChange={(e) => setChatMessagesAlert(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer accent-slate-900 dark:accent-white shrink-0 mt-0.5 sm:mt-0"
                  />
                </div>

                {/* Trigger 3 */}
                <div className="py-3 flex items-start sm:items-center justify-between gap-3">
                  <div className="min-w-0 pr-2">
                    <h4 className="font-medium text-slate-900 dark:text-white text-sm sm:text-base leading-snug">
                      AI Idea Validation Complete
                    </h4>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
                      Receive an alert when your idea evaluation report finishes generating.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={ideaValidationAlert}
                    onChange={(e) => setIdeaValidationAlert(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer accent-slate-900 dark:accent-white shrink-0 mt-0.5 sm:mt-0"
                  />
                </div>

                {/* Trigger 4 */}
                <div className="py-3 flex items-start sm:items-center justify-between gap-3">
                  <div className="min-w-0 pr-2">
                    <h4 className="font-medium text-slate-900 dark:text-white text-sm sm:text-base leading-snug">
                      Workspace Tasks & Milestones
                    </h4>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
                      Reminders for upcoming FYP proposal deadlines and supervisor deliverables.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={workspaceTasksAlert}
                    onChange={(e) => setWorkspaceTasksAlert(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer accent-slate-900 dark:accent-white shrink-0 mt-0.5 sm:mt-0"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: FYP PRIVACY ================= */}
        {activeTab === "privacy" && (
          <div className="space-y-4 sm:space-y-6">
            {/* Discovery & Team Visibility */}
            <div className="rounded-3xl border border-white/40 dark:border-white/10 bg-white/80 dark:bg-white/10 backdrop-blur-md p-4 sm:p-6 shadow-xl space-y-4">
              <div className="border-b border-white/20 dark:border-white/5 pb-3">
                <h3 className="text-sm sm:text-base font-medium uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5 sm:gap-2">
                  <Users className="h-4 w-4 text-slate-600 dark:text-slate-400 shrink-0" />
                  Partner Matching & Discovery Visibility
                </h3>
                <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-0.5">
                  Control how your profile and current group appear to other students.
                </p>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {/* Group Public Visibility */}
                <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-white text-sm sm:text-base leading-snug">
                      Display FYP Group on Public Profile
                    </h4>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
                      When enabled, your current project title and team members are visible on your profile card.
                    </p>
                  </div>
                  <button
                    onClick={() => updateGroupVisibility.mutate(!isGroupVisible)}
                    disabled={updateGroupVisibility.isPending || !group}
                    className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-2xl text-sm font-medium transition w-fit shrink-0 ${
                      isGroupVisible
                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                        : "bg-black/5 dark:bg-white/5 backdrop-blur-md text-slate-600 dark:text-slate-400 border border-white/40 dark:border-white/10"
                    }`}
                  >
                    {isGroupVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    {isGroupVisible ? "Visible" : "Hidden"}
                  </button>
                </div>

                {/* Institutional Notice */}
                <div className="py-3.5 flex items-start gap-2.5 sm:gap-3 bg-black/5 dark:bg-white/5 backdrop-blur-md p-3 rounded-2xl mt-2">
                  <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    <strong>PAF-IAST Academic Policy:</strong> FYP teams must strictly consist of 2 to 3 registered students. Once your group reaches 3 approved members, your group will be automatically locked.
                  </p>
                </div>
              </div>
            </div>

            {/* Validation History Privacy */}
            <div className="rounded-3xl border border-white/40 dark:border-white/10 bg-white/80 dark:bg-white/10 backdrop-blur-md p-4 sm:p-6 shadow-xl space-y-3 text-sm">
              <h3 className="text-sm sm:text-base font-medium uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5 sm:gap-2">
                <Sparkles className="h-4 w-4 text-slate-600 dark:text-slate-400 shrink-0" />
                Idea Validation Quota & Storage
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
                Your account is allocated <strong>5 idea validations per day</strong>. All completed feasibility assessments are securely encrypted and stored in your private history.
              </p>
              <div className="pt-2">
                <Link
                  href="/dashboard/fyp-ideas/validate"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-900 dark:text-white underline hover:opacity-80"
                >
                  View My Validation History & Quotas →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 4: SECURITY & DANGER ZONE ================= */}
        {activeTab === "security" && (
          <div className="space-y-4 sm:space-y-6">
            {/* SSO Security Card */}
            <div className="rounded-3xl border border-white/40 dark:border-white/10 bg-white/80 dark:bg-white/10 backdrop-blur-md p-4 sm:p-6 shadow-xl space-y-4">
              <div className="border-b border-white/20 dark:border-white/5 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm sm:text-base font-medium uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5 sm:gap-2">
                    <Lock className="h-4 w-4 text-slate-600 dark:text-slate-400 shrink-0" />
                    Authentication & Session
                  </h3>
                  <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-0.5">
                    Your login session is secured via Microsoft Azure Active Directory SSO.
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 sm:p-4 rounded-2xl border border-white/20 dark:border-white/5 text-sm space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="font-medium text-slate-800 dark:text-slate-200 text-sm sm:text-base">Identity Provider:</span>
                  <span className="font-mono text-slate-600 dark:text-slate-400 text-sm sm:text-base break-all">PAF-IAST Microsoft Azure AD</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="font-medium text-slate-800 dark:text-slate-200 text-sm sm:text-base">Session Type:</span>
                  <span className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">Secure HTTP-Only JWT Cookie</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="font-medium text-slate-800 dark:text-slate-200 text-sm sm:text-base">Active Email:</span>
                  <span className="text-slate-600 dark:text-slate-400 text-sm sm:text-base break-all">{user?.email}</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-sm sm:text-base text-slate-400">
                  Password resets must be performed through your university portal.
                </span>
                <button
                  onClick={() => logout()}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-2xl border border-white/40 dark:border-white/10 bg-white/80 dark:bg-white/10 backdrop-blur-md text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition shrink-0"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign Out
                </button>
              </div>
            </div>

            {/* Danger Zone: Account Deletion */}
            <div className="rounded-3xl border border-red-200 dark:border-red-900/40 bg-red-50/30 dark:bg-red-950/10 p-4 sm:p-6 space-y-4">
              <div className="flex items-start gap-2.5 border-b border-red-100 dark:border-red-900/30 pb-3">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm sm:text-base font-medium uppercase tracking-wider text-red-900 dark:text-red-300">
                    Danger Zone: Request Account Deletion
                  </h3>
                  <p className="text-sm sm:text-base text-red-600 dark:text-red-400 mt-0.5">
                    Irreversible action that requires university administrative review.
                  </p>
                </div>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                If you request account deletion, your student discovery profile, partner requests, and idea validation history will be queued for permanent removal after administrative approval.
              </p>

              <div className="pt-2">
                <DeletionRequestButton />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
