"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Github, FileText, Play, Star, GitFork, X } from "lucide-react";

interface ProjectEmbedCardProps {
  embedType?: string | null;
  embedUrl?: string | null;
  mediaMetadata?: any;
}

export function ProjectEmbedCard({ embedType, embedUrl, mediaMetadata }: ProjectEmbedCardProps) {
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll and hide mobile bottom nav when modal is open
  useEffect(() => {
    if (isPdfModalOpen) {
      document.body.style.overflow = "hidden";
      document.body.classList.add("modal-open");
    } else {
      document.body.style.overflow = "unset";
      document.body.classList.remove("modal-open");
    }
    return () => {
      document.body.style.overflow = "unset";
      document.body.classList.remove("modal-open");
    };
  }, [isPdfModalOpen]);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isPdfModalOpen) {
        setIsPdfModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPdfModalOpen]);

  if (!embedType || !embedUrl) return null;

  if (embedType === "GITHUB") {
    return (
      <a
        href={embedUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block mt-4 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden hover:border-gray-300 dark:hover:border-slate-600 transition-colors"
      >
        <div className="p-4 bg-gray-50 dark:bg-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 bg-white dark:bg-slate-700 rounded-full flex items-center justify-center border border-gray-200 dark:border-slate-600 shadow-sm flex-shrink-0">
            <Github className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {embedUrl.replace("https://github.com/", "")}
            </p>
            {mediaMetadata?.description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                {mediaMetadata.description}
              </p>
            )}
            <div className="flex items-center gap-3 mt-2 text-xs font-medium text-gray-600 dark:text-gray-400">
              {mediaMetadata?.language && (
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  {mediaMetadata.language}
                </span>
              )}
              {mediaMetadata?.stars !== undefined && (
                <span className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5" />
                  {mediaMetadata.stars}
                </span>
              )}
              {mediaMetadata?.forks !== undefined && (
                <span className="flex items-center gap-1">
                  <GitFork className="w-3.5 h-3.5" />
                  {mediaMetadata.forks}
                </span>
              )}
            </div>
          </div>
        </div>
      </a>
    );
  }

  if (embedType === "PDF") {
    return (
      <>
        <div 
          onClick={() => setIsPdfModalOpen(true)}
          className="mt-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 p-4 cursor-pointer hover:border-gray-300 dark:hover:border-slate-600 transition-colors flex items-center gap-4"
        >
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center border border-red-200 dark:border-red-800 flex-shrink-0">
            <FileText className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Project Documentation</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Click to view full PDF</p>
          </div>
        </div>

        {mounted && isPdfModalOpen && createPortal(
          <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
            onClick={() => setIsPdfModalOpen(false)}
          >
            <div 
              className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
              aria-hidden="true"
            />
            <div 
              className="relative bg-white dark:bg-slate-900 w-full max-w-4xl h-[85vh] rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-red-500" />
                  PDF Viewer
                </h3>
                <button
                  type="button"
                  onClick={() => setIsPdfModalOpen(false)}
                  className="p-1.5 text-gray-500 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 bg-gray-100 dark:bg-slate-800">
                <embed src={embedUrl} type="application/pdf" width="100%" height="100%" />
              </div>
            </div>
          </div>,
          document.body
        )}
      </>
    );
  }

  if (embedType === "DEMO") {
    return (
      <div className="mt-4 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden bg-gray-50 dark:bg-slate-800">
        <div className="p-3 border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center gap-2">
          <Play className="w-4 h-4 text-blue-500" />
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate">
            Live Demo: {embedUrl}
          </span>
        </div>
        <div className="aspect-video w-full bg-gray-100 dark:bg-slate-800 relative">
          <iframe 
            src={embedUrl}
            className="absolute inset-0 w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin"
            title="Live Demo Preview"
          />
        </div>
      </div>
    );
  }

  return null;
}
