const MAX_PAGES = 15
const MIN_USABLE_TEXT_LENGTH = 80

export interface PdfTextExtractionResult {
  text: string
  pageCount: number
}

export interface PdfTextExtractionOptions {
  maxPages?: number
}

export async function extractPdfText(
  buffer: Buffer,
  options: PdfTextExtractionOptions = {},
  baseUrl: string = "http://localhost:3000"
): Promise<PdfTextExtractionResult> {
  const maxPages = options.maxPages ?? MAX_PAGES

  // Try to call the Python Serverless Function first
  try {
    const response = await fetch(`${baseUrl}/api/extract_pdf`, {
      method: "POST",
      body: new Uint8Array(buffer),
      headers: {
        "Content-Length": buffer.length.toString(),
      },
    })
    
    if (response.ok) {
      const data = await response.json()
      return { text: data.text, pageCount: data.pageCount }
    } else {
      const errorText = await response.text()
      // If Python throws a specific expected error, rethrow it
      if (response.status === 413 || response.status === 400) {
        throw new Error(errorText || "Invalid PDF")
      }
      // Fallback to pdfjs if python endpoint fails/not available
      console.warn("Python PDF extraction failed, falling back to pdfjs:", errorText)
    }
  } catch (err) {
    console.warn("Could not reach Python PDF endpoint, falling back to pdfjs", err)
  }

  // Fallback: Node.js pdfjs-dist
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs")

  // Ensure standard fonts are loaded to prevent crashing on standard fonts
  const standardFontDataUrl = "node_modules/pdfjs-dist/standard_fonts/"

  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(buffer),
    standardFontDataUrl,
    stopAtErrors: false, // Don't stop completely on minor font errors
  })

  const document = await loadingTask.promise
  const pageCount = document.numPages

  if (pageCount > maxPages) {
    throw new Error(`PDF must be ${maxPages} pages or fewer.`)
  }

  const pageTexts: string[] = []

  for (let pageNumber = 1; pageNumber <= pageCount; pageNumber++) {
    const page = await document.getPage(pageNumber)
    const content = await page.getTextContent()
    const text = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim()

    if (text) {
      pageTexts.push(text)
    }

    page.cleanup()
  }

  await loadingTask.destroy()

  const text = normalizePdfText(pageTexts.join("\n\n"))

  if (text.length < MIN_USABLE_TEXT_LENGTH) {
    throw new Error(
      "This PDF appears to contain images only or has no usable text. Please upload a text-based PDF or use manual submission."
    )
  }

  return { text, pageCount }
}

function normalizePdfText(text: string): string {
  return text
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}
