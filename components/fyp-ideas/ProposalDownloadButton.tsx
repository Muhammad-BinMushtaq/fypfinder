"use client"

import { useState, useRef } from "react"
import { Download, Loader2 } from "lucide-react"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"
import type { ValidationResult } from "@/services/fypIdeas.service"
import { ProposalPrintTemplate } from "./ProposalPrintTemplate"

interface ProposalDownloadButtonProps {
  validation: ValidationResult
}

export function ProposalDownloadButton({ validation }: ProposalDownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const templateRef = useRef<HTMLDivElement>(null)

  const handleDownload = async () => {
    if (!validation.report || !templateRef.current) return
    
    setIsGenerating(true)
    try {
      const element = templateRef.current
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        windowWidth: 800,
      })

      const imgData = canvas.toDataURL("image/png")
      
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      })

      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width
      
      let heightLeft = pdfHeight
      let position = 0

      // Add first page
      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight)
      heightLeft -= pdf.internal.pageSize.getHeight()

      // Add subsequent pages if content exceeds one page
      while (heightLeft >= 0) {
        position = heightLeft - pdfHeight
        pdf.addPage()
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight)
        heightLeft -= pdf.internal.pageSize.getHeight()
      }

      const safeFilename = (validation.title || "FYP_Proposal")
        .replace(/[^a-zA-Z0-9_-]/g, "_")
        .slice(0, 35)

      pdf.save(`${safeFilename || "FYP_Proposal"}.pdf`)
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
        className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-gray-900 dark:bg-white px-3.5 py-1.5 text-xs font-semibold text-white dark:text-gray-900 shadow-sm transition hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isGenerating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
        {isGenerating ? "Generating..." : "Download Proposal PDF"}
      </button>

      {/* Hidden container for the print template */}
      <div className="absolute left-[-9999px] top-[-9999px] overflow-hidden">
        <ProposalPrintTemplate ref={templateRef} validation={validation} />
      </div>
    </>
  )
}
