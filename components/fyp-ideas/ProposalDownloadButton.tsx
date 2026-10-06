"use client"

import { Download } from "lucide-react"
import { jsPDF } from "jspdf"
import type { ValidationResult } from "@/services/fypIdeas.service"

interface ProposalDownloadButtonProps {
  validation: ValidationResult
}

export function ProposalDownloadButton({ validation }: ProposalDownloadButtonProps) {
  const handleDownload = () => {
    if (!validation.report) return

    const doc = new jsPDF()
    const { report } = validation

    const stripMarkdown = (text: string) => {
      return text
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/\*(.*?)\*/g, "$1")
        .replace(/`([^`]+)`/g, "$1")
        .replace(/^#+\s+/gm, "")
        .trim()
    }

    let y = 20
    const pageBottom = 275

    const checkPageBreak = (neededHeight: number) => {
      if (y + neededHeight > pageBottom) {
        doc.addPage()
        y = 20
      }
    }

    // Header
    doc.setFontSize(20)
    doc.setFont("helvetica", "bold")
    doc.text("Pak-Austria Fachhochschule", 105, y, { align: "center" })
    y += 8

    doc.setFontSize(15)
    doc.text("Institute of Applied Sciences and Technology", 105, y, { align: "center" })
    y += 10
    
    doc.setFontSize(13)
    doc.setFont("helvetica", "normal")
    doc.text("Final Year Project Proposal", 105, y, { align: "center" })
    y += 15

    // Project Title
    checkPageBreak(20)
    doc.setFontSize(11)
    doc.setFont("helvetica", "bold")
    doc.text("Project Title:", 20, y)
    doc.setFont("helvetica", "normal")
    const titleText = stripMarkdown(validation.title || report.plainSummary || "Untitled Project")
    const splitTitle = doc.splitTextToSize(titleText, 130)
    doc.text(splitTitle, 52, y)
    y += Math.max(splitTitle.length * 6, 8) + 6

    // AI Validation Summary
    checkPageBreak(25)
    doc.setFont("helvetica", "bold")
    doc.text("AI Validation Summary:", 20, y)
    y += 6
    doc.setFont("helvetica", "normal")
    doc.text(`Recommendation: ${validation.recommendation || "Pending"}`, 25, y)
    y += 6
    doc.text(`Final Score: ${report.finalScore}/100`, 25, y)
    y += 10

    // Proposed Solution / Elevator Pitch
    if (report.elevatorPitch) {
      const cleanPitch = stripMarkdown(report.elevatorPitch)
      const splitPitch = doc.splitTextToSize(cleanPitch, 170)
      checkPageBreak(12 + splitPitch.length * 6)
      doc.setFont("helvetica", "bold")
      doc.text("Proposed Solution & Scope:", 20, y)
      y += 6
      doc.setFont("helvetica", "normal")
      doc.text(splitPitch, 20, y)
      y += splitPitch.length * 6 + 10
    }

    // Risk Assessment
    if (report.riskReductionSteps && report.riskReductionSteps.length > 0) {
      checkPageBreak(15)
      doc.setFont("helvetica", "bold")
      doc.text("Risk Assessment & Mitigation:", 20, y)
      y += 6
      doc.setFont("helvetica", "normal")

      report.riskReductionSteps.forEach((step) => {
        const cleanStep = stripMarkdown(step)
        const splitStep = doc.splitTextToSize(`• ${cleanStep}`, 170)
        checkPageBreak(splitStep.length * 6 + 2)
        doc.text(splitStep, 20, y)
        y += splitStep.length * 6 + 2
      })
      y += 8
    }

    // Roadmap
    if (report.roadmap && report.roadmap.length > 0) {
      checkPageBreak(15)
      doc.setFont("helvetica", "bold")
      doc.text("Project Implementation Roadmap:", 20, y)
      y += 7
      doc.setFont("helvetica", "normal")

      report.roadmap.forEach((phase) => {
        checkPageBreak(12)
        doc.setFont("helvetica", "bold")
        doc.text(`${phase.phase} (${phase.duration}):`, 20, y)
        y += 6
        doc.setFont("helvetica", "normal")

        phase.tasks.forEach((task) => {
          const cleanTask = stripMarkdown(task)
          const splitTask = doc.splitTextToSize(`- ${cleanTask}`, 160)
          checkPageBreak(splitTask.length * 6 + 2)
          doc.text(splitTask, 25, y)
          y += splitTask.length * 6 + 2
        })
        y += 4
      })
    }

    const safeFilename = (validation.title || "FYP_Proposal")
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 35)

    doc.save(`${safeFilename || "FYP_Proposal"}.pdf`)
  }

  return (
    <button
      onClick={handleDownload}
      className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700"
    >
      <Download className="h-4 w-4" />
      Download Proposal PDF
    </button>
  )
}
