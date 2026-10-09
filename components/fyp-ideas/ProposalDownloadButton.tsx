"use client"

import { useState, useRef } from "react"
import { Download, Loader2 } from "lucide-react"
import { jsPDF } from "jspdf"
import { toPng } from "html-to-image"
import type { ValidationResult } from "@/services/fypIdeas.service"
import { ProposalPrintTemplate } from "./ProposalPrintTemplate"

interface ProposalDownloadButtonProps {
  validation: ValidationResult
}

export function ProposalDownloadButton({ validation }: ProposalDownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const templateRef = useRef<HTMLDivElement>(null)

  const handleDownload = async () => {
    if (!validation.report || !templateRef.current || isGenerating) return
    
    setIsGenerating(true)
    try {
      // Yield to the event loop so React can render the loading spinner immediately
      await new Promise((resolve) => setTimeout(resolve, 80))

      const element = templateRef.current
      const isMobile = typeof window !== "undefined" && window.innerWidth < 640
      
      // Fast, optimized snapshotting without excessive canvas allocation
      const dataUrl = await toPng(element, {
        pixelRatio: isMobile ? 1.0 : 1.2,
        backgroundColor: "#ffffff",
        cacheBust: false,
      })
      
      // Yield to the browser main thread after canvas rasterization so animation frames tick
      await new Promise((resolve) => setTimeout(resolve, 30))

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      })

      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      
      // Calculate aspect ratio height using bounding rect
      const rect = element.getBoundingClientRect()
      const elementWidth = rect.width > 0 ? rect.width : 820
      const elementHeight = rect.height > 0 ? rect.height : 1000
      
      const imgHeight = (elementHeight * pdfWidth) / elementWidth
      
      let heightLeft = imgHeight
      let position = 0

      // Add first page
      pdf.addImage(dataUrl, "PNG", 0, position, pdfWidth, imgHeight, undefined, "FAST")
      heightLeft -= pageHeight

      // Add subsequent pages if content exceeds one page with non-blocking micro-yields
      while (heightLeft > 0) {
        position -= pageHeight
        pdf.addPage()
        pdf.addImage(dataUrl, "PNG", 0, position, pdfWidth, imgHeight, undefined, "FAST")
        heightLeft -= pageHeight
        await new Promise((resolve) => setTimeout(resolve, 20))
      }

      const rawTitle = validation.title || validation.report.plainSummary || "FYP_Idea"
      const safeTitle = rawTitle
        .replace(/^\[[^\]]+\]\s*/, "")
        .replace(/[^a-zA-Z0-9_-]/g, "_")
        .slice(0, 30)

      // Yield before saving so download initiation doesn't freeze the spinner
      await new Promise((resolve) => setTimeout(resolve, 20))

      pdf.save(`FYP_Validation_Report_${safeTitle}.pdf`)
    } catch (error) {
      console.error("Failed to generate PDF:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <>
      <button
        onClick={handleDownload}
        disabled={isGenerating}
        className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 dark:bg-white px-3.5 py-1.5 text-xs font-semibold text-white dark:text-slate-900 shadow-sm transition hover:bg-slate-800 dark:hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isGenerating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
        {isGenerating ? "Preparing Report..." : "Download Validation Report"}
      </button>

      {/* Zero-opacity container positioned on-screen so browser can pre-layout without freezing */}
      <div 
        style={{ 
          position: "fixed", 
          top: 0, 
          left: 0, 
          width: 820,
          opacity: 0, 
          pointerEvents: "none",
          zIndex: -9999,
        }}
        aria-hidden="true"
      >
        <ProposalPrintTemplate ref={templateRef} validation={validation} />
      </div>
    </>
  )
}
