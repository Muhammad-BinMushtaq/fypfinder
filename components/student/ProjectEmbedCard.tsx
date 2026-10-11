"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Github, FileText, Play, Star, GitFork, X, ExternalLink } from "lucide-react";

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
    const repoPath = embedUrl.replace(/^https?:\/\/(?:www\.)?github\.com\//i, "").replace(/\/$/, "");

    return (
      <a
        href={embedUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block mt-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 overflow-hidden hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs transition-all group"
      >
        <div className="p-3.5 flex items-start gap-3">
          <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center border border-slate-200/70 dark:border-slate-700/80 shadow-2xs shrink-0 group-hover:scale-105 transition-transform">
            <Github className="w-5 h-5 text-slate-800 dark:text-slate-200" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate">
                {repoPath}
              </p>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            {mediaMetadata?.description && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                {mediaMetadata.description}
              </p>
            )}

            {/* Badges: Language, Stars, Forks */}
            <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] font-medium text-slate-600 dark:text-slate-400">
              {mediaMetadata?.language && (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 text-slate-700 dark:text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                  {mediaMetadata.language}
                </span>
              )}
              {mediaMetadata?.stars !== undefined && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 text-slate-700 dark:text-slate-300">
                  <Star className="w-3 h-3 text-amber-500 fill-amber-500/20" />
                  {mediaMetadata.stars}
                </span>
              )}
              {mediaMetadata?.forks !== undefined && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 text-slate-700 dark:text-slate-300">
                  <GitFork className="w-3 h-3 text-slate-500" />
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
          className="mt-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-3.5 cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-colors flex items-center gap-3"
        >
          <div className="w-10 h-10 bg-red-50 dark:bg-red-950/40 rounded-xl flex items-center justify-center border border-red-200/80 dark:border-red-900/60 shrink-0">
            <FileText className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">Project Documentation</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Click to view full PDF</p>
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
              <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
                <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                  <FileText className="w-4 h-4 text-red-500" />
                  PDF Viewer
                </h3>
                <button
                  type="button"
                  onClick={() => setIsPdfModalOpen(false)}
                  className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 bg-slate-100 dark:bg-slate-800">
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
      <div className="mt-3 rounded-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden bg-slate-50/70 dark:bg-slate-800/40">
        <div className="p-2.5 border-b border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2">
          <Play className="w-3.5 h-3.5 text-blue-500" />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
            Live Demo: {embedUrl}
          </span>
        </div>
        <div className="aspect-video w-full bg-slate-100 dark:bg-slate-800 relative">
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
