// components/landing/LandingNav.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { GraduationCap, Menu, X } from "lucide-react";
import { LandingThemeToggle } from "./LandingThemeToggle";

export function LandingNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group" onClick={closeMenu}>
            <div className="w-9 h-9 bg-slate-900 text-white dark:bg-white dark:text-slate-950 rounded-xl flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              FYP<span className="font-semibold text-slate-500 dark:text-zinc-400">Mate</span>
            </span>
          </Link>

          {/* Desktop Middle Navigation Links */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-zinc-300">
            <a href="#discovery" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Find Partners
            </a>
            <Link 
              href="/idea-validator" 
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Idea Validator
            </Link>
            <a href="#collaboration" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Connect & Chat
            </a>
            <a href="#workspace" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Workspace
            </a>
            <a href="#how-it-works" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              How It Works
            </a>
          </div>

          {/* Desktop Actions + Theme Toggle */}
          <div className="hidden md:flex items-center gap-2.5 sm:gap-3">
            <LandingThemeToggle />
            <Link
              href="/login"
              className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white px-2.5 py-1.5 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/login"
              className="px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-white dark:text-slate-950 bg-slate-900 dark:bg-white rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-xs"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Right Controls: Theme Toggle + Hamburger Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <LandingThemeToggle />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Slide-down Drawer / Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950 px-6 py-5 space-y-4 shadow-xl animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-3 text-sm font-medium text-slate-700 dark:text-slate-200">
            <a 
              href="#discovery" 
              onClick={closeMenu}
              className="py-1.5 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Find Partners
            </a>
            <Link 
              href="/idea-validator" 
              onClick={closeMenu}
              className="py-1.5 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Idea Validator
            </Link>
            <a 
              href="#collaboration" 
              onClick={closeMenu}
              className="py-1.5 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Connect & Chat
            </a>
            <a 
              href="#workspace" 
              onClick={closeMenu}
              className="py-1.5 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Workspace
            </a>
            <a 
              href="#how-it-works" 
              onClick={closeMenu}
              className="py-1.5 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              How It Works
            </a>
          </div>

          <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800 flex flex-col gap-2.5">
            <Link
              href="/login"
              onClick={closeMenu}
              className="w-full py-2.5 text-center text-sm font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/login"
              onClick={closeMenu}
              className="w-full py-2.5 text-center text-sm font-semibold text-white dark:text-slate-950 bg-slate-900 dark:bg-white rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-xs"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
