"use client"

import { Clock3, FileText, Pickaxe } from "lucide-react"

interface PdfIdeaUploadProps {
  onUpload: (file: File) => void
  isPending: boolean
  remainingToday?: number
}

export function PdfIdeaUpload({
  remainingToday,
}: PdfIdeaUploadProps) {
  const limitReached = remainingToday === 0

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      {/* Modern Minimalist Placeholder */}
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 mb-4">
          <Pickaxe className="h-6 w-6" />
        </div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white tracking-tight">
          Feature Under Development
        </h3>
        <p className="mt-2 max-w-sm text-xs leading-relaxed text-gray-500 dark:text-gray-400">
          We are currently upgrading our AI document extraction models to improve accuracy and reduce costs. 
          PDF uploads are temporarily disabled.
        </p>

        <div className="mt-6 flex items-center gap-2 rounded-full border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 px-4 py-1.5 text-[11px] font-medium text-gray-600 dark:text-gray-300">
          <Clock3 className="h-3.5 w-3.5" />
          Expected to return soon
        </div>
      </div>

      <button
        type="button"
        disabled={true}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-100 dark:bg-slate-800 px-5 py-3 text-xs font-semibold text-gray-400 dark:text-gray-500 transition cursor-not-allowed border border-gray-200 dark:border-slate-700 shadow-sm"
      >
        <FileText className="h-4 w-4" />
        Process & Validate Proposal (Disabled)
      </button>
    </div>
  )
}
