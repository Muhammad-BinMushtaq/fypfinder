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

    // Header
    doc.setFontSize(22)
    doc.setFont("helvetica", "bold")
    doc.text("Pak-Austria Fachhochschule", 105, 20, { align: "center" })
    doc.setFontSize(16)
    doc.text("Institute of Applied Sciences and Technology", 105, 28, { align: "center" })
    
    doc.setFontSize(14)
    doc.setFont("helvetica", "normal")
    doc.text("Final Year Project Proposal", 105, 40, { align: "center" })

    // Title
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text("Project Title:", 20, 60)
    doc.setFont("helvetica", "normal")
    doc.text(report.plainSummary.substring(0, 80) + "...", 50, 60)

    // AI Validation Summary
    doc.setFont("helvetica", "bold")
    doc.text("AI Validation Summary:", 20, 75)
    doc.setFont("helvetica", "normal")
    doc.text(`Recommendation: ${validation.recommendation || "Pending"}`, 20, 82)
    doc.text(`Final Score: ${report.finalScore}/100`, 20, 89)

    // Proposed Solution
    doc.setFont("helvetica", "bold")
    doc.text("Proposed Solution:", 20, 105)
    doc.setFont("helvetica", "normal")
    const splitPitch = doc.splitTextToSize(report.elevatorPitch || "", 170)
    doc.text(splitPitch, 20, 112)

    // Risk Assessment
    let y = 112 + splitPitch.length * 7 + 10
    doc.setFont("helvetica", "bold")
    doc.text("Risk Assessment:", 20, y)
    doc.setFont("helvetica", "normal")
    y += 7
    report.riskReductionSteps.forEach((step) => {
      const splitStep = doc.splitTextToSize(`- ${step}`, 170)
      doc.text(splitStep, 20, y)
      y += splitStep.length * 7
      if (y > 270) {
        doc.addPage()
        y = 20
      }
    })

    // Roadmap
    y += 10
    if (y > 270) {
      doc.addPage()
      y = 20
    }
    doc.setFont("helvetica", "bold")
    doc.text("Roadmap:", 20, y)
    doc.setFont("helvetica", "normal")
    y += 7
    report.roadmap.forEach((phase) => {
      doc.setFont("helvetica", "bold")
      doc.text(`${phase.phase} (${phase.duration}):`, 20, y)
      doc.setFont("helvetica", "normal")
      y += 7
      phase.tasks.forEach((task) => {
        const splitTask = doc.splitTextToSize(`- ${task}`, 160)
        doc.text(splitTask, 25, y)
        y += splitTask.length * 7
        if (y > 270) {
          doc.addPage()
          y = 20
        }
      })
      y += 5
      if (y > 270) {
        doc.addPage()
        y = 20
      }
    })

    doc.save("FYP_Proposal.pdf")
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
