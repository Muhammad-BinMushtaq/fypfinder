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
  options: PdfTextExtractionOptions = {}
): Promise<PdfTextExtractionResult> {
  const maxPages = options.maxPages ?? MAX_PAGES
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs")

  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(buffer),
    stopAtErrors: true,
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
