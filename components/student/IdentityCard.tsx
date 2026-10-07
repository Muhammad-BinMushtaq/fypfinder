"use client";

import { useState, useEffect } from "react";
import { GraduationCap, BookOpen, Github, Linkedin, Lock, Eye, Building2, Calendar, X, Loader2 } from "lucide-react";
import { ProfilePictureUpload } from "./ProfilePictureUpload";
import { getDepartmentLabel } from "@/lib/departments";
import { PrimaryRoleBadges } from "./PrimaryRoleBadges";
import { useMyProfile } from "@/hooks/student/useMyProfile";
import type { StudentProfile } from "@/services/student.service";
import Link from "next/link";
import { toast } from "react-toastify";

interface IdentityCardProps {
  profile: StudentProfile;
}

export function IdentityCard({ profile }: IdentityCardProps) {
  const { updateProfileAsync } = useMyProfile();
  const [isChangingAvailability, setIsChangingAvailability] = useState(false);
  const [isSemesterModalOpen, setIsSemesterModalOpen] = useState(false);
  const [semesterRequest, setSemesterRequest] = useState({ newSemester: profile.semester.toString(), reason: "" });
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

  // Lock body scroll when modal is open to keep background fixed and clean
  useEffect(() => {
    if (isSemesterModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isSemesterModalOpen]);

  const getAvailabilityConfig = (status: string) => {
    switch (status) {
      case "AVAILABLE": return { label: "Available", dot: "bg-emerald-500", text: "text-emerald-700 dark:text-emerald-400" };
      case "BUSY": return { label: "Busy", dot: "bg-amber-500", text: "text-amber-700 dark:text-amber-400" };
      case "AWAY": return { label: "Away", dot: "bg-slate-400", text: "text-slate-600 dark:text-slate-400" };
      default: return { label: "Away", dot: "bg-slate-400", text: "text-slate-600 dark:text-slate-400" };
    }
  };

  const availabilityConfig = getAvailabilityConfig(profile.availability);

  const handleAvailabilityToggle = async () => {
    if (isChangingAvailability) return;
    setIsChangingAvailability(true);
    const nextStatus = profile.availability === "AVAILABLE" ? "BUSY" : profile.availability === "BUSY" ? "AWAY" : "AVAILABLE";
    try {
      await updateProfileAsync({ availability: nextStatus });
      toast.success("Availability updated");
    } catch (e: any) {
      toast.error(e.message || "Failed to update availability");
      console.error(e);
    } finally {
      setIsChangingAvailability(false);
    }
  };

  const handleSemesterRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingRequest(true);
    try {
      // Dummy API call for now since there's no backend for this yet
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsSemesterModalOpen(false);
      setSemesterRequest({ newSemester: profile.semester.toString(), reason: "" });
      toast.success("Request sent successfully! Admins will review it shortly.");
    } catch (e: any) {
      toast.error(e.message || "Failed to send request");
      console.error(e);
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-sm sticky top-8">
        
        {/* View Public Profile Link */}
        <div className="flex justify-end mb-2">
          <Link 
            href={`/dashboard/discovery/profile/${profile.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            View as others
          </Link>
        </div>

        {/* Profile Picture & Name */}
        <div className="flex flex-col items-center text-center">
          <div className="mb-4">
            <ProfilePictureUpload 
              currentPicture={profile.profilePicture}
              studentId={profile.id}
              name={profile.name}
            />
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {profile.name}
          </h1>

          {/* Availability Toggle */}
          <button 
            onClick={handleAvailabilityToggle}
            disabled={isChangingAvailability}
            className={`mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer disabled:opacity-50 text-xs font-medium ${availabilityConfig.text}`}
            title="Click to toggle availability"
          >
            <span className={`w-2 h-2 rounded-full ${availabilityConfig.dot} ${isChangingAvailability ? 'animate-pulse' : ''}`} />
            {availabilityConfig.label}
          </button>
        </div>

        {/* Academic Info */}
        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3 text-sm text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="truncate">{getDepartmentLabel(profile.department)}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2" title="Locked from roll number">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Semester {profile.semester}</span>
              <Lock className="w-3 h-3 text-slate-400 dark:text-slate-500 ml-0.5" />
            </div>
            <button 
              type="button"
              onClick={() => setIsSemesterModalOpen(true)}
              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium px-2 py-1 rounded-md bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors shrink-0"
            >
              Request Change
            </button>
          </div>
        </div>

        {/* Roles */}
        {profile.primaryRoles && profile.primaryRoles.length > 0 && (
          <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-800 flex justify-center">
            <PrimaryRoleBadges roles={profile.primaryRoles} />
          </div>
        )}

        {/* Socials */}
        {(profile.githubUrl || profile.linkedinUrl) && (
          <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-800 flex justify-center gap-2.5">
            {profile.githubUrl && (
              <a href={profile.githubUrl} target="_blank" rel="noreferrer" className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 transition-colors">
                <Github className="w-4 h-4" />
              </a>
            )}
            {profile.linkedinUrl && (
              <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
            )}
          </div>
        )}
      </div>

      {/* Request Semester Change Modal */}
      {isSemesterModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsSemesterModalOpen(false)}
          />

          {/* Modal Dialog */}
          <div 
            className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[calc(100dvh-2rem)] my-auto animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleSemesterRequest} className="flex flex-col h-full overflow-hidden">
              <div className="p-5 sm:p-7 space-y-5 overflow-y-auto">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-1">
                      Request Semester Change
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                      Your semester is derived from your roll number. If it is incorrect, submit a request for an admin to update it.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsSemesterModalOpen(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs sm:text-sm font-medium text-slate-900 dark:text-white">
                      New Semester (1-8) *
                    </label>
                    <select 
                      value={semesterRequest.newSemester}
                      onChange={(e) => setSemesterRequest({...semesterRequest, newSemester: e.target.value})}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-base sm:text-sm outline-none focus:border-slate-400 dark:focus:border-slate-500 transition-colors"
                    >
                      {[1,2,3,4,5,6,7,8].map(s => (
                        <option key={s} value={s} disabled={s === profile.semester}>
                          Semester {s} {s === profile.semester ? "(Current)" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs sm:text-sm font-medium text-slate-900 dark:text-white">
                      Reason for Change *
                    </label>
                    <textarea 
                      required
                      value={semesterRequest.reason}
                      onChange={(e) => setSemesterRequest({...semesterRequest, reason: e.target.value})}
                      placeholder="Briefly explain why your semester needs to be updated..."
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-base sm:text-sm outline-none focus:border-slate-400 dark:focus:border-slate-500 transition-colors resize-none min-h-[95px] max-h-[140px]"
                    />
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 sm:px-7 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsSemesterModalOpen(false)}
                  className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingRequest || !semesterRequest.reason.trim()}
                  className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmittingRequest && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSubmittingRequest ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
