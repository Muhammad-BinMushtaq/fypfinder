import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import { requireRole } from "@/lib/auth"
import { UserRole } from "@/lib/generated/prisma/enums"
import { logger } from "@/lib/logger"
import { createRateLimiter, getClientIdentifier } from "@/lib/rate-limit"
import { extractPdfText } from "@/lib/pdf/extract-text"
import { extractIdeaFromPdfText } from "@/modules/fyp-ideas/pdf-extraction.service"
import {
  toStudentFacingValidationResult,
  validateIdea,
} from "@/modules/fyp-ideas/fyp-ideas.service"

export const runtime = "nodejs"

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024
const MAX_PAGES = 15

const pdfIdeaExtractionUserRateLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  maxRequests: 3,
})

const pdfIdeaExtractionIpRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  maxRequests: 10,
})

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(UserRole.STUDENT)

    const userRateLimit = pdfIdeaExtractionUserRateLimiter.check(user.id)
    if (!userRateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: `PDF extraction limit reached. Try again in ${userRateLimit.retryAfter ?? 600} seconds.`,
        },
        { status: 429 }
      )
    }

    const ipIdentifier = getClientIdentifier(request.headers, "ip:unknown")
    const ipRateLimit = pdfIdeaExtractionIpRateLimiter.check(ipIdentifier)
    if (!ipRateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: `Too many PDF uploads from this network. Try again in ${ipRateLimit.retryAfter ?? 3600} seconds.`,
        },
        { status: 429 }
      )
    }

    const student = await prisma.student.findUnique({
      where: { userId: user.id },
      select: { id: true },
    })

    if (!student) {
      return NextResponse.json(
        { success: false, message: "Student profile not found" },
        { status: 404 }
      )
    }

    const formData = await request.formData()
    const file = formData.get("file")

    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, message: "PDF file is required" },
        { status: 400 }
      )
    }

    if (!isPdfFile(file)) {
      return NextResponse.json(
        { success: false, message: "Only PDF files are supported" },
        { status: 400 }
      )
    }

    if (file.size === 0) {
      return NextResponse.json(
        { success: false, message: "This PDF is empty. Please upload a PDF with proposal content." },
        { status: 400 }
      )
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        {
          success: false,
          message: "PDF must be 10 MB or smaller.",
        },
        { status: 413 }
      )
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const pdfText = await extractPdfText(buffer, { maxPages: MAX_PAGES })
    const extraction = await extractIdeaFromPdfText(pdfText.text)

    let validation = null
    if (extraction.ideaInput) {
      const validationResult = await validateIdea(extraction.ideaInput, {
        studentId: student.id,
        accessMode: "student",
      })
      validation = toStudentFacingValidationResult(validationResult)
    }

    return NextResponse.json(
      {
        success: true,
        message: validation
          ? "PDF processed and idea validated successfully"
          : "PDF processed. Please review and complete the extracted fields before validation.",
        data: {
          draft: extraction.ideaInput,
          extracted: extraction.extracted.fields,
          confidence: extraction.extracted.confidence,
          warnings: extraction.extracted.warnings,
          validation,
          pdf: {
            pageCount: pdfText.pageCount,
            textLength: pdfText.text.length,
            maxPages: MAX_PAGES,
            maxFileSizeBytes: MAX_FILE_SIZE_BYTES,
          },
        },
      },
      { status: 200 }
    )
  } catch (error) {
    logger.error("PDF idea extraction error:", error)
    const message = error instanceof Error ? error.message : "Failed to process PDF"

    if (message.includes("Unauthorized") || message.includes("Account suspended")) {
      return NextResponse.json({ success: false, message }, { status: 403 })
    }

    if (message.includes("Daily limit") || message.includes("limit reached")) {
      return NextResponse.json({ success: false, message }, { status: 429 })
    }

    if (message.includes("pages or fewer")) {
      return NextResponse.json({ success: false, message }, { status: 413 })
    }

    if (
      message.includes("images only") ||
      message.includes("no usable text") ||
      message.includes("empty")
    ) {
      return NextResponse.json({ success: false, message }, { status: 400 })
    }

    if (message.includes("GROQ_API_KEY")) {
      return NextResponse.json(
        { success: false, message: "AI extraction service is not configured" },
        { status: 503 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        message: "We could not read this PDF. Please check the file and try again.",
      },
      { status: 500 }
    )
  }
}

function isPdfFile(file: File): boolean {
  const hasPdfMime = file.type === "application/pdf"
  const hasPdfExtension = file.name.toLowerCase().endsWith(".pdf")
  return hasPdfMime && hasPdfExtension
}

