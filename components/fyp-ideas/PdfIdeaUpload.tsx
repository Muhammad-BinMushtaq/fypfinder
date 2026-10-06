"use client"

import { useRef, useState } from "react"
import { AlertCircle, FileText, Loader2, Upload, X } from "lucide-react"

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
    <div className="mx-auto max-w-2xl space-y-5">
      {/* Informative quota and description pill */}
      <div className="rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50/60 dark:bg-slate-800/40 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Document Extraction & Synthesis
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Upload existing proposals or draft abstracts. Processed in-memory; files are never persisted.
            </p>
          </div>
          {typeof remainingToday === "number" && (
            <div className="self-start sm:self-center shrink-0 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-gray-600 dark:text-gray-300">
              <span className="font-semibold text-gray-900 dark:text-white">{remainingToday}</span> of 3 checks left
            </div>
          )}
        </div>
      </div>

      {limitReached && (
        <div className="flex items-start gap-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/60 p-3.5 text-xs text-gray-600 dark:text-gray-300">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
          <p>Daily student validations exhausted. Resets tomorrow at 00:00 UTC.</p>
        </div>
      )}

      {/* Modern Minimalist Dropzone */}
      <div
        onDragOver={(event) => {
          event.preventDefault()
        }}
        onDrop={(event) => {
          event.preventDefault()
          handleFile(event.dataTransfer.files.item(0))
        }}
        className="rounded-2xl border-2 border-dashed border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center transition hover:border-gray-900 dark:hover:border-slate-600"
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300">
          <Upload className="h-5 w-5" />
        </div>
        <h3 className="mt-4 text-sm font-semibold text-gray-900 dark:text-white">
          Drop proposal document here
        </h3>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Standard text-based PDF documents up to 10 MB (max 15 pages)
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
          className="mt-4 inline-flex items-center justify-center rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 transition hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50"
        >
          Select File
        </button>

        {file && (
          <div className="mx-auto mt-5 max-w-md rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50/70 dark:bg-slate-800/50 p-3 text-left">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <FileText className="h-4 w-4 shrink-0 text-gray-700 dark:text-gray-300" />
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-gray-900 dark:text-white">
                    {file.name}
                  </p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFile(null)}
                className="text-gray-400 hover:text-red-500 p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {error && <p className="mt-3 text-xs text-red-500">{error}</p>}
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!file || isPending || limitReached}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 dark:bg-white px-5 py-3 text-xs font-semibold text-white dark:text-gray-900 transition hover:bg-gray-800 dark:hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Extracting & Validating...
          </>
        ) : (
          <>
            <FileText className="h-4 w-4" />
            Process & Validate Proposal
          </>
        )}
      </button>
    </div>
  )
}
