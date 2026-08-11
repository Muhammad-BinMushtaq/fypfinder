"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronRight, Briefcase, GraduationCap, Code2, Loader2, Sparkles } from "lucide-react";
import { toast } from "react-toastify";
import { AVAILABLE_ROLES, PrimaryRoleBadges } from "@/components/student/PrimaryRoleBadges";

const COMMON_SKILLS = [
  "React", "Node.js", "Python", "Machine Learning", "Flutter", 
  "UI/UX Design", "Java", "C++", "AWS", "Firebase", "MongoDB", "SQL"
];

interface WelcomeModalProps {
  userName: string;
  department: string;
  semester: number;
}

export function WelcomeModal({ userName, department, semester }: WelcomeModalProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Form State
  const [selectedSemester, setSelectedSemester] = useState(semester || 5);
  const [selectedDepartment, setSelectedDepartment] = useState(department || "SE");
  const [skills, setSkills] = useState<{name: string; level: string}[]>([]);
  const [seekingStatus, setSeekingStatus] = useState("LOOKING_FOR_TEAM");
  const [primaryRoles, setPrimaryRoles] = useState<string[]>([]);

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const toggleSkill = (skillName: string) => {
    if (skills.find((s) => s.name === skillName)) {
      setSkills(skills.filter((s) => s.name !== skillName));
    } else {
      setSkills([...skills, { name: skillName, level: "INTERMEDIATE" }]);
    }
  };

  const updateSkillLevel = (skillName: string, level: string) => {
    setSkills(skills.map(s => s.name === skillName ? { ...s, level } : s));
  };

  const toggleRole = (role: string) => {
    if (primaryRoles.includes(role)) {
      setPrimaryRoles(primaryRoles.filter(r => r !== role));
    } else if (primaryRoles.length < 2) {
      setPrimaryRoles([...primaryRoles, role]);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // 1. Update Profile
      const profileRes = await fetch("/api/student/update-my-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentSemester: selectedSemester,
          seekingStatus,
          primaryRoles,
          onboardingCompleted: true,
        }),
      });

      if (!profileRes.ok) throw new Error("Failed to update profile");

      // 2. Add Skills
      for (const skill of skills) {
        await fetch("/api/student/skill/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: skill.name,
            level: skill.level,
          }),
        });
      }

      toast.success("Profile setup complete!");
      router.refresh(); // Refresh to hide modal
    } catch (error) {
      toast.error("Something went wrong during setup.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Sparkles className="text-amber-500 w-5 h-5" />
              Welcome to FYP Finder, {userName.split(" ")[0]}!
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Let's get your profile set up in just a few steps.</p>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  s === step ? "bg-blue-600" : s < step ? "bg-blue-300" : "bg-gray-200 dark:bg-slate-700"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 h-[400px] overflow-y-auto">
          
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Academic Information</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Please confirm your current semester. This helps us match you with students looking for FYP partners right now.</p>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Semester</label>
                <div className="flex flex-wrap gap-3">
                  {[5, 6, 7, 8].map((sem) => (
                    <button
                      key={sem}
                      onClick={() => setSelectedSemester(sem)}
                      className={`px-4 py-2 rounded-lg border font-medium transition-colors ${
                        selectedSemester === sem 
                          ? "bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/30 dark:border-blue-500 dark:text-blue-300" 
                          : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 dark:bg-slate-800 dark:border-slate-600 dark:text-gray-300"
                      }`}
                    >
                      Semester {sem}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                  <Code2 className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Skills</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Select your strongest technical skills and set your proficiency level. (Select at least 1)</p>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {COMMON_SKILLS.map((skill) => {
                  const isSelected = skills.some(s => s.name === skill);
                  return (
                    <button
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                        isSelected 
                          ? "bg-purple-50 border-purple-500 text-purple-700 dark:bg-purple-900/30 dark:border-purple-500 dark:text-purple-300" 
                          : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 dark:bg-slate-800 dark:border-slate-600 dark:text-gray-300 hover:border-gray-300"
                      }`}
                    >
                      {skill} {isSelected && <Check className="inline w-3 h-3 ml-1" />}
                    </button>
                  );
                })}
              </div>

              {skills.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Set Proficiency Levels:</h4>
                  {skills.map(skill => (
                    <div key={skill.name} className="flex items-center justify-between p-3 border border-gray-200 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-800/50">
                      <span className="font-medium text-gray-900 dark:text-white">{skill.name}</span>
                      <select 
                        value={skill.level}
                        onChange={(e) => updateSkillLevel(skill.name, e.target.value)}
                        className="text-sm border-gray-300 dark:border-slate-600 rounded-md py-1 bg-white dark:bg-slate-700 text-gray-900 dark:text-white outline-none"
                      >
                        <option value="BEGINNER">Beginner</option>
                        <option value="INTERMEDIATE">Intermediate</option>
                        <option value="ADVANCED">Advanced</option>
                      </select>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
                  <Briefcase className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">What are you looking for?</h3>
              </div>
              
              <div className="grid gap-3">
                {[
                  { id: "LOOKING_FOR_TEAM", title: "Looking for a Team", desc: "I want to join an existing idea or find partners to form a group." },
                  { id: "HAS_TEAM_LOOKING_FOR_MEMBERS", title: "Have a Team, Need Members", desc: "We have an idea and need more people to complete our group." },
                  { id: "NOT_LOOKING", title: "Not Looking Right Now", desc: "I already have a full team or I'm not doing FYP this semester." },
                ].map(option => (
                  <button
                    key={option.id}
                    onClick={() => setSeekingStatus(option.id)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      seekingStatus === option.id 
                        ? "bg-emerald-50 border-emerald-500 dark:bg-emerald-900/20 dark:border-emerald-500" 
                        : "bg-white border-gray-200 hover:border-gray-300 dark:bg-slate-800 dark:border-slate-700 dark:hover:border-slate-600"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className={`font-semibold ${seekingStatus === option.id ? "text-emerald-700 dark:text-emerald-400" : "text-gray-900 dark:text-white"}`}>
                        {option.title}
                      </h4>
                      {seekingStatus === option.id && <Check className="text-emerald-500 w-5 h-5" />}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{option.desc}</p>
                  </button>
                ))}
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select your Primary Roles (Max 2, Optional)
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_ROLES.map((role) => {
                    const isSelected = primaryRoles.includes(role);
                    return (
                      <button
                        key={role}
                        onClick={() => toggleRole(role)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                          isSelected 
                            ? "bg-blue-100 border-blue-500 text-blue-700 dark:bg-blue-900/40 dark:border-blue-500 dark:text-blue-300" 
                            : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-slate-800 dark:border-slate-600 dark:text-gray-400"
                        } ${!isSelected && primaryRoles.length >= 2 ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {role}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 flex justify-between">
          <button
            onClick={handleBack}
            className={`px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white ${step === 1 ? 'invisible' : ''}`}
          >
            Back
          </button>
          
          {step < 3 ? (
            <button
              onClick={handleNext}
              disabled={step === 2 && skills.length === 0}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {isSubmitting ? "Saving..." : "Complete Setup"}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
