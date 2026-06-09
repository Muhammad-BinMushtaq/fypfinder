"use client"

import { useRef, useState } from "react"
import { AlertCircle, FileText, Loader2, Upload } from "lucide-react"

interface PdfIdeaUploadProps {
  onUpload: (file: File) => void
  isPending: boolean
  remainingToday?: number
}

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024

export function PdfIdeaUpload({
  onUpload,
  isPending,
  remainingToday,
}: PdfIdeaUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState("")

  const handleFile = (nextFile: File | null) => {
    setError("")

    if (!nextFile) {
      setFile(null)
      return
    }

    if (nextFile.type !== "application/pdf" || !nextFile.name.toLowerCase().endsWith(".pdf")) {
      setError("Only PDF files are supported.")
      setFile(null)
      return
    }

    if (nextFile.size > MAX_FILE_SIZE_BYTES) {
      setError("PDF must be 10 MB or smaller.")
      setFile(null)
      return
    }

    setFile(nextFile)
  }

  const handleSubmit = () => {
    if (!file || isPending) {
      return
    }

    onUpload(file)
  }

  const limitReached = remainingToday === 0

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-orange-50 p-5 shadow-sm dark:border-amber-900/40 dark:from-slate-900 dark:via-slate-900 dark:to-amber-950/30">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-700 dark:border-amber-900/40 dark:bg-slate-900 dark:text-amber-300">
              <FileText className="h-3.5 w-3.5" />
              Upload PDF
            </div>
            <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">
              Upload a proposal, abstract, or concept note. The PDF is processed temporarily and is not stored.
            </p>
          </div>

          {typeof remainingToday === "number" && (
            <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-200">
              <div className="font-semibold">Remaining today</div>
              <div className="mt-0.5">{remainingToday} of 3 validations left</div>
            </div>
          )}
        </div>
      </div>

      {limitReached && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>You have used all student validations for today. PDF extraction also runs validation, so come back tomorrow.</p>
        </div>
      )}

      <div
        onDragOver={(event) => {
          event.preventDefault()
        }}
        onDrop={(event) => {
          event.preventDefault()
          handleFile(event.dataTransfer.files.item(0))
        }}
        className="rounded-3xl border border-dashed border-gray-300 bg-white p-6 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-gray-200">
          <Upload className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-gray-950 dark:text-white">
          Drop your PDF here
        </h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          PDF only, up to 10 MB and 15 pages. Scanned image-only PDFs need OCR and are not supported yet.
        </p>

        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={(event) => handleFile(event.target.files?.item(0) ?? null)}
        />

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isPending}
          className="mt-5 inline-flex items-center justify-center rounded-2xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-gray-200 dark:hover:bg-slate-800"
        >
          Browse PDF
        </button>

        {file && (
          <div className="mx-auto mt-5 max-w-xl rounded-2xl border border-gray-200 bg-gray-50 p-4 text-left dark:border-slate-800 dark:bg-slate-950/40">
            <div className="flex items-start gap-3">
              <FileText className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-300" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                  {file.name}
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
          </div>
        )}

        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!file || isPending || limitReached}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gray-900 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing PDF...
          </>
        ) : (
          <>
            <FileText className="h-4 w-4" />
            Extract and Validate Idea
          </>
        )}
      </button>
    </div>
  )
}

