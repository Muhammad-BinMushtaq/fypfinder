# Detailed Implementation Plan: Idea Submission & Python PDF Extraction

Based on the decision to use Vercel Python Serverless Functions for robust PDF extraction, here is the comprehensive, step-by-step implementation plan to solve all four issues with absolute certainty.

---

## 1. Robust PDF Extraction (Vercel Python Serverless Function)
**Goal:** Replace the fragile `pdfjs-dist` Node.js implementation with an industry-standard Python parser (`PyMuPDF`) to completely eliminate standard-font crashes and extraction failures.
**Implementation Steps:**
1. **Create the Python Endpoint**: Create `api/extract_pdf.py` at the root of the project (outside the `app/` directory). Vercel automatically detects this folder and provisions a Python Serverless Function.
2. **Implement PyMuPDF**: Write a simple Python handler using the built-in HTTP server or a lightweight framework to receive the PDF binary, extract the text using `PyMuPDF` (`fitz`), and return the cleaned text.
3. **Dependencies**: Create `api/requirements.txt` containing `PyMuPDF`.
4. **Refactor Next.js Route**: Update the existing `app/api/fyp-ideas/extract-pdf/route.ts`. Instead of using `lib/pdf/extract-text.ts`, it will now forward the incoming PDF buffer internally to our new `http://localhost:3000/api/extract_pdf` endpoint (or the production URL), receive the robustly extracted text, and pass it to Groq.
5. **Clean Error Handling**: Update the Next.js `catch` block to return explicit errors (e.g., distinguishing between "AI extraction failed" and "Invalid PDF file") rather than the generic "Cannot read PDF" catch-all.

---

## 2. Resolving the "Lost Progress" Form Reset Bug
**Goal:** Ensure user data survives API validation errors and loading states without being destroyed.
**Location:** `components/fyp-ideas/IdeaValidatorWorkspace.tsx`
**Implementation Steps:**
1. Currently, the form is unmounted during loading: `{isBusy ? <LoadingState /> : <ValidatorWizard />}`. Because the user's data is stored inside `ValidatorWizard`'s local state, unmounting it destroys the data.
2. **Fix**: Use CSS conditional rendering (`hidden` class) instead of React unmounting. 
   - We will render `<ValidatorWizard />` permanently but apply `className={isBusy ? "hidden" : "block"}`. 
   - This keeps the component alive in the background DOM, meaning its `useState` perfectly preserves the user's drafted title, problem statement, and features even if the backend returns a 400 validation error.

---

## 3. Enforcing Strict Input Limits (Frontend)
**Goal:** Physically prevent users from typing or pasting beyond the database schema limits, thereby preventing Zod 400 validation errors in the first place.
**Location:** `components/fyp-ideas/ValidatorWizard.tsx`
**Implementation Steps:**
1. Add native HTML `maxLength` attributes to all input fields to perfectly mirror the backend Zod constraints:
   - `Project Title`: Add `maxLength={200}`
   - `Problem Statement`: Add `maxLength={500}`
   - `Idea Description`: Add `maxLength={2000}`
   - `Core Features`: Add `maxLength={1000}`
2. (Optional but recommended): Add a small visual character counter to each field so the user knows they are approaching the limit.

---

## 4. Fixing PDF Report Generation (Formatting & Truncation)
**Goal:** Generate a beautiful, untruncated PDF that matches the app's Tailwind design system and properly supports Unicode characters (smart quotes, emojis).
**Location:** `components/fyp-ideas/ProposalDownloadButton.tsx`
**Implementation Steps:**
1. **Remove jsPDF Primitive Drawing**: Delete all the manual, hardcoded `doc.text(..., x, y)` coordinates which cause truncation and ignore Tailwind CSS.
2. **Create a Hidden Template Component**: Build a new React component (`<ProposalPrintTemplate />`) styled beautifully with Tailwind that looks exactly like a professional FYP proposal document. We will render this off-screen.
3. **Use html2canvas + jsPDF**: When the user clicks download, use `html2canvas` to take a high-quality visual snapshot of this styled DOM element. We then insert that image into `jsPDF`.
   - **Solves Truncation**: The HTML element naturally expands to fit all the AI's generated text, and we can map it seamlessly across multiple PDF pages.
   - **Solves Formatting**: It will look exactly like your web app (colors, fonts, borders).
   - **Solves Unicode**: `html2canvas` natively supports emojis, smart quotes, and Unicode, completely bypassing `jsPDF`'s WinAnsiEncoding font limitations.
