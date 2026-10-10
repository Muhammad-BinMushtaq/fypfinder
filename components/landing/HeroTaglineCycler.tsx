"use client";

import { useEffect, useState } from "react";

const WORDS = [
  "AI Feasibility",
  "Novelty Score",
  "Defense Readiness",
  "Partner Matching",
];

export function HeroTaglineCycler() {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % WORDS.length);
        setFade(true);
      }, 240);
    }, 2800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
      <span className="text-xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-700 dark:text-zinc-300">
        Engineered for
      </span>
      <span className="inline-flex items-center rounded-xl border border-slate-300/80 dark:border-slate-700/80 bg-white/90 dark:bg-slate-900/90 px-3 py-1 sm:px-4 sm:py-1.5 shadow-xs backdrop-blur-xs">
        <span
          className={`text-xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight transition-all duration-200 text-slate-900 dark:text-white ${
            fade ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
          }`}
        >
          {WORDS[index]}
        </span>
      </span>
    </div>
  );
}
