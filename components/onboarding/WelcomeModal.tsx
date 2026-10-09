"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronRight, Briefcase, Code2, Loader2, Sparkles, X, ShieldCheck } from "lucide-react";
import { toast } from "react-toastify";
import { AVAILABLE_ROLES } from "@/components/student/PrimaryRoleBadges";

const COMMON_SKILLS = [
  "React", "Node.js", "Python", "Machine Learning", "Flutter", 
  "UI/UX Design", "Java", "C++", "AWS", "Firebase", "MongoDB", "SQL"
];

interface WelcomeModalProps {
  userName: string;
  department: string;
  semester: number;
  existingSkills?: { name: string; level: string }[];
  existingRoles?: string[];
  existingSeekingStatus?: string;
}

export function WelcomeModal({ 
  userName, 
  department, 
  semester,
  existingSkills = [],
  existingRoles = [],
  existingSeekingStatus = "LOOKING_FOR_TEAM",
}: WelcomeModalProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDismissing, setIsDismissing] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const router = useRouter();

  // Form State
  const [skills, setSkills] = useState<{ name: string; level: string }[]>(() => {
    if (existingSkills.length > 0) {
      return existingSkills.map(s => ({ name: s.name, level: s.level }));
    }
    return [];
  });
  const [seekingStatus, setSeekingStatus] = useState(existingSeekingStatus || "LOOKING_FOR_TEAM");
  const [primaryRoles, setPrimaryRoles] = useState<string[]>(existingRoles || []);

  // Keyboard accessibility (Escape key to dismiss)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSubmitting && !isDismissing) {
        handleDismiss();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSubmitting, isDismissing]);

  const handleNext = () => setStep((prev) => Math.min(prev + 1, 3));
  const handleBack = () => setStep((prev) => Math.max(prev - 1, 1));

  const toggleSkill = (skillName: string) => {
    const exists = skills.find((s) => s.name.toLowerCase() === skillName.toLowerCase());
    if (exists) {
      setSkills(skills.filter((s) => s.name.toLowerCase() !== skillName.toLowerCase()));
    } else {
      setSkills([...skills, { name: skillName, level: "INTERMEDIATE" }]);
    }
  };

  const updateSkillLevel = (skillName: string, level: string) => {
    setSkills(skills.map(s => s.name.toLowerCase() === skillName.toLowerCase() ? { ...s, level } : s));
  };

  const toggleRole = (role: string) => {
    if (primaryRoles.includes(role)) {
      setPrimaryRoles(primaryRoles.filter(r => r !== role));
    } else if (primaryRoles.length < 2) {
      setPrimaryRoles([...primaryRoles, role]);
    }
  };

  // Close / Skip setup without blocking the user
  const handleDismiss = async () => {
    setIsDismissing(true);
    setIsOpen(false);
    try {
      await fetch("/api/student/update-my-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ onboardingCompleted: true }),
      });
      toast.info("Setup skipped. You can complete your profile anytime in Settings / Profile.");
      router.refresh();
    } catch {
      // Graceful local dismiss
      router.refresh();
    } finally {
      setIsDismissing(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // 1. Update Profile (Notice: do NOT send currentSemester, keeping it tamper-proof)
      const profileRes = await fetch("/api/student/update-my-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seekingStatus,
          primaryRoles,
          onboardingCompleted: true,
        }),
      });

      if (!profileRes.ok) throw new Error("Failed to update profile");

      // 2. Add only genuinely new skills (prevents 409 duplicate errors)
      const existingNames = new Set(
        existingSkills.map((s) => s.name.trim().toLowerCase())
      );

      for (const skill of skills) {
        if (!existingNames.has(skill.name.trim().toLowerCase())) {
          try {
            await fetch("/api/student/skill/add", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: skill.name,
                level: skill.level,
              }),
            });
          } catch {
            // Ignore individual skill conflict to avoid failing whole onboarding
          }
        }
      }

      toast.success("Profile setup complete!");
      setIsOpen(false);
      router.refresh();
    } catch (error) {
      toast.error("Something went wrong during setup.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl max-h-[85dvh] sm:max-h-[88dvh] flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
      >
        
        {/* Header (Fixed at top) */}
        <div className="shrink-0 bg-gray-50/90 dark:bg-slate-800/90 border-b border-gray-200 dark:border-slate-700/80 px-5 py-4 sm:px-6 flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h2 id="onboarding-title" className="text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 truncate">
              <Sparkles className="text-amber-500 w-4.5 h-4.5 shrink-0" />
              <span>Welcome, {userName.split(" ")[0]}!</span>
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Step {step} of 3 • Quick FYP Profile Setup
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Step Indicators */}
            <div className="flex gap-1.5" aria-label={`Step ${step} of 3`}>
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all ${
                    s === step 
                      ? "bg-blue-600 scale-110" 
                      : s < step 
                      ? "bg-blue-300 dark:bg-blue-700" 
                      : "bg-gray-200 dark:bg-slate-700"
                  }`}
                />
              ))}
            </div>

            {/* Prominent Cross Button */}
            <button
              onClick={handleDismiss}
              disabled={isDismissing || isSubmitting}
              className="p-1.5 -mr-1 text-gray-400 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white hover:bg-gray-200/70 dark:hover:bg-slate-700/70 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Skip setup"
              aria-label="Close setup tour"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body (Dynamically scrollable, guaranteed to never overflow screen) */}
        <div className="flex-1 min-h-0 overflow-y-auto p-5 sm:p-6 space-y-5 overscroll-contain">
          
          {/* STEP 1: Academic Status & FYP Seeking Goal */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">Academic Status & FYP Goal</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Verified academic credentials and team status.</p>
                </div>
              </div>

              {/* Read-Only Verified Status Card (No editable semester buttons!) */}
              <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                    Academic Record
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-100/90 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                    <Check className="w-3 h-3" /> Auto-verified from Student ID
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 block">Department</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{department || "Computer Science"}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 block">Current Semester</span>
                    <span className="font-semibold text-gray-900 dark:text-white">Semester {semester || 7}</span>
                  </div>
                </div>
              </div>

              {/* Seeking Status Options */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                  What is your FYP Status right now?
                </label>
                <div className="grid gap-2">
                  {[
                    { id: "LOOKING_FOR_TEAM", title: "Looking for a Team", desc: "I want to join an existing idea or find partners to form a group." },
                    { id: "HAS_TEAM_LOOKING_FOR_MEMBERS", title: "Have a Team, Need Members", desc: "We have an idea and need more teammates to complete our group." },
                    { id: "NOT_LOOKING", title: "Not Looking Right Now", desc: "I already have a full team or I am taking FYP in a later semester." },
                  ].map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setSeekingStatus(option.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        seekingStatus === option.id 
                          ? "bg-blue-50/80 border-blue-500 dark:bg-blue-900/20 dark:border-blue-500" 
                          : "bg-white border-gray-200 hover:border-gray-300 dark:bg-slate-800/80 dark:border-slate-700 dark:hover:border-slate-600"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <h4 className={`text-sm font-semibold ${seekingStatus === option.id ? "text-blue-700 dark:text-blue-400" : "text-gray-900 dark:text-white"}`}>
                          {option.title}
                        </h4>
                        {seekingStatus === option.id && <Check className="text-blue-500 w-4 h-4 shrink-0" />}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{option.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Top Skills */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400 shrink-0">
                  <Code2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">Technical Skills</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Select skills to showcase on your discovery card.</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {COMMON_SKILLS.map((skill) => {
                  const isSelected = skills.some(s => s.name.toLowerCase() === skill.toLowerCase());
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium border transition-colors ${
                        isSelected 
                          ? "bg-purple-50 border-purple-500 text-purple-700 dark:bg-purple-900/30 dark:border-purple-500 dark:text-purple-300" 
                          : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-300 hover:border-gray-300"
                      }`}
                    >
                      {skill} {isSelected && <Check className="inline w-3 h-3 ml-1" />}
                    </button>
                  );
                })}
              </div>

              {skills.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-slate-800">
                  <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Proficiency Level:
                  </h4>
                  <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                    {skills.map((skill) => (
                      <div key={skill.name} className="flex items-center justify-between p-2.5 border border-gray-200 dark:border-slate-700 rounded-lg bg-gray-50/60 dark:bg-slate-800/40 text-xs sm:text-sm">
                        <span className="font-medium text-gray-900 dark:text-white">{skill.name}</span>
                        <select 
                          value={skill.level}
                          onChange={(e) => updateSkillLevel(skill.name, e.target.value)}
                          className="border border-gray-200 dark:border-slate-600 rounded-md py-1 px-2 bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-xs outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="BEGINNER">Beginner</option>
                          <option value="INTERMEDIATE">Intermediate</option>
                          <option value="ADVANCED">Advanced</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Primary Roles & Review */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400 shrink-0">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">Primary Roles (Optional)</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Pick up to 2 key roles you excel at for FYP.</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                  Select up to 2 Roles:
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_ROLES.map((role) => {
                    const isSelected = primaryRoles.includes(role);
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => toggleRole(role)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                          isSelected 
                            ? "bg-blue-100 border-blue-500 text-blue-700 dark:bg-blue-900/40 dark:border-blue-500 dark:text-blue-300" 
                            : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-400"
                        } ${!isSelected && primaryRoles.length >= 2 ? 'opacity-40 cursor-not-allowed' : ''}`}
                      >
                        {role} {isSelected && <Check className="inline w-3 h-3 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Summary Preview Box */}
              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 text-xs space-y-1.5">
                <span className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">Setup Summary:</span>
                <p className="text-gray-600 dark:text-gray-400">
                  • <strong className="text-gray-900 dark:text-white">Academic:</strong> {department} • Semester {semester}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  • <strong className="text-gray-900 dark:text-white">FYP Goal:</strong> {seekingStatus.replace(/_/g, " ")}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  • <strong className="text-gray-900 dark:text-white">Skills:</strong> {skills.length > 0 ? skills.map(s => s.name).join(", ") : "None selected yet"}
                </p>
                {primaryRoles.length > 0 && (
                  <p className="text-gray-600 dark:text-gray-400">
                    • <strong className="text-gray-900 dark:text-white">Roles:</strong> {primaryRoles.join(", ")}
                  </p>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Footer (Fixed at bottom, always fully visible on laptops & phones) */}
        <div className="shrink-0 p-4 sm:px-6 bg-gray-50/90 dark:bg-slate-800/90 border-t border-gray-200 dark:border-slate-700/80 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleBack}
            className={`px-4 py-2 text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors ${step === 1 ? 'invisible' : ''}`}
          >
            Back
          </button>
          
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDismiss}
              disabled={isDismissing || isSubmitting}
              className="px-3.5 py-2 text-xs sm:text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              Skip for now
            </button>

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors shadow-xs"
              >
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {isSubmitting ? "Saving..." : "Complete Setup"}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
