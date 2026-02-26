// components/onboarding/WelcomeModal.tsx
"use client";

import { useState, useEffect } from "react";
import { X, Sparkles, Users, MessageCircle, Target, ArrowRight, Check } from "lucide-react";
import { useRouter } from "next/navigation";

interface WelcomeModalProps {
  userName: string;
  profileComplete: boolean;
}

const STORAGE_KEY = "fypfinder-onboarding-seen";

export function WelcomeModal({ userName, profileComplete }: WelcomeModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();

  // Check if user has seen onboarding
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const hasSeenOnboarding = localStorage.getItem(STORAGE_KEY);
    if (!hasSeenOnboarding && !profileComplete) {
      // Small delay for better UX
      const timer = setTimeout(() => setIsOpen(true), 500);
      return () => clearTimeout(timer);
    }
  }, [profileComplete]);

  const handleClose = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setIsOpen(false);
  };

  const handleStartSetup = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setIsOpen(false);
    // Scroll to profile completion section
    const profileSection = document.getElementById("profile-form");
    if (profileSection) {
      profileSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSkip = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setIsOpen(false);
  };

  const features = [
    {
      icon: Users,
      title: "Find FYP Partners",
      description: "Discover students with complementary skills for your final year project",
    },
    {
      icon: Target,
      title: "Smart Matching",
      description: "Get matched based on skills, interests, and project goals",
    },
    {
      icon: MessageCircle,
      title: "Connect & Collaborate",
      description: "Send requests and chat with potential team members",
    },
  ];

  if (!isOpen) return null;

  const firstName = userName.split(" ")[0];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 dark:from-slate-700 dark:to-slate-800 px-6 py-8 text-center">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="w-16 h-16 mx-auto mb-4 bg-white/10 rounded-2xl flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-amber-400" />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">
            Welcome, {firstName}!
          </h2>
          <p className="text-gray-300 text-sm">
            You&apos;re one step closer to finding your perfect FYP partner
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Features */}
          <div className="space-y-4 mb-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Getting Started Tip */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center flex-shrink-0">
                <Target className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                  Quick Tip
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                  Complete your profile to appear in search results. Profiles with photos and skills get 3x more partner requests!
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row gap-3">
            <button
              onClick={handleSkip}
              className="flex-1 px-4 py-2.5 text-gray-600 dark:text-gray-400 font-medium text-sm hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
            >
              I&apos;ll do it later
            </button>
            <button
              onClick={handleStartSetup}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium text-sm rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
            >
              Complete Profile
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
