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
    script.src = "https://supademo.com/embed.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup
      const existingScript = document.querySelector('script[src="https://supademo.com/embed.js"]');
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
    <div className="max-w-4xl mx-auto">
      <div className="relative aspect-video bg-gray-50 dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden group">
        <button
          onClick={handleOpenDemo}
          className="absolute inset-0 flex items-center justify-center cursor-pointer transition-all"
        >
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-900 dark:bg-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
              <Play className="w-7 h-7 text-white dark:text-gray-900 ml-1" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
              Watch Platform Demo
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Interactive walkthrough
            </p>
          </div>
        </button>
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f3f4f6_1px,transparent_1px),linear-gradient(to_bottom,#f3f4f6_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
      </div>
    </div>
  );
}
