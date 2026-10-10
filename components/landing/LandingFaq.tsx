"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: "What is FYPMate?",
    answer:
      "FYPMate is an academic collaboration and AI validation platform tailored for university students. It helps you discover high-compatibility project teammates, collaborate in real-time, and benchmark your Final Year Project proposals against rigorous academic criteria.",
  },
  {
    question: "How does the AI FYP Idea Validator work?",
    answer:
      "The validator evaluates your project title, problem statement, core features, and tech stack across key dimensions: feasibility, academic novelty, market readiness, and committee risk factors. It generates actionable feedback and sample defense questions within seconds.",
  },
  {
    question: "Who can use FYPMate?",
    answer:
      "FYPMate is built specifically for university undergraduate and graduate students preparing for their capstone or Final Year Projects, as well as supervisors mentoring student groups.",
  },
  {
    question: "Is FYPMate free to use?",
    answer:
      "Yes. University students can sign up, discover peers, form teams, and use the AI Idea Validator completely free using their institutional account.",
  },
  {
    question: "Is my project idea kept confidential?",
    answer:
      "Absolutely. Your idea submissions are private to your session and account. They are evaluated securely by AI models without being made public or shared with other student teams without your explicit consent.",
  },
];

export function LandingFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex((current) => (current === idx ? null : idx));
  };

  return (
    <section id="faq" className="py-16 sm:py-24 relative z-10 border-t border-slate-200/80 dark:border-slate-800/80">
      <div className="max-w-4xl mx-auto px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-600 dark:text-zinc-400 border border-slate-200/70 dark:border-slate-700/70">
            Frequently Asked Questions
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Everything You Need to Know
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400">
            Clear answers about teammates, AI idea evaluation, and platform privacy.
          </p>
        </div>

        <div className="divide-y divide-slate-200 dark:divide-slate-800 border-y border-slate-200 dark:border-slate-800">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={idx} className="transition-colors">
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full py-4 sm:py-5 flex items-center justify-between gap-4 text-left font-semibold text-sm sm:text-base text-slate-900 dark:text-white hover:text-slate-700 dark:hover:text-zinc-200 transition-colors"
                  aria-expanded={isOpen}
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 shrink-0 text-slate-500 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-slate-900 dark:text-white" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="pb-5 pr-6 text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
