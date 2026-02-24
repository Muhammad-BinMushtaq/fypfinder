// components/landing/SupademoButton.tsx
"use client";

import { useEffect } from "react";
import { Play } from "lucide-react";

declare global {
  interface Window {
    Supademo?: {
      open: (id: string) => void;
    };
  }
}

export function SupademoButton() {
  useEffect(() => {
    // Load Supademo script
    const script = document.createElement("script");
    script.src = "https://script.supademo.com/supademo.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup
      const existingScript = document.querySelector('script[src="https://script.supademo.com/supademo.js"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  const handleOpenDemo = () => {
    if (window.Supademo) {
      window.Supademo.open("cmm0w8zni23zi2rl7tqo5jjlo");
    }
  };

  return (
    <button
      onClick={handleOpenDemo}
      className="w-full sm:w-auto px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
    >
      <Play className="w-4 h-4" />
      Try Interactive Tour
    </button>
  );
}
