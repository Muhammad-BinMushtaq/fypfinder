"use client"

import { useEffect, useState } from "react"

export function useVisualViewport(enabled = true) {
  const [viewportHeight, setViewportHeight] = useState<number | null>(null)

  useEffect(() => {
    if (!enabled || typeof window === "undefined" || !window.visualViewport) {
      return
    }

    const vv = window.visualViewport

    const updateHeight = () => {
      // Only apply dynamic keyboard height on mobile/tablet viewports (< 1024px)
      if (window.innerWidth >= 1024) {
        setViewportHeight(null)
        return
      }

      setViewportHeight(Math.round(vv.height))

      // Prevent mobile browsers from keeping any window-level scroll offset
      if (window.scrollY !== 0) {
        window.scrollTo(0, 0)
      }
    }

    updateHeight()

    vv.addEventListener("resize", updateHeight)
    vv.addEventListener("scroll", updateHeight)

    return () => {
      vv.removeEventListener("resize", updateHeight)
      vv.removeEventListener("scroll", updateHeight)
    }
  }, [enabled])

  return viewportHeight
}
