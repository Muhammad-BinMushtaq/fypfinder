// components/landing/LandingThemeToggle.tsx
"use client"

import { useTheme } from "@/contexts/ThemeContext"
import { Moon, Sun } from "lucide-react"

export function LandingThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg transition-colors bg-gray-100 text-gray-600 hover:bg-gray-200"
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </button>
  )
}
