# FYPMate (`fypmate.com`) — SEO, GEO & Brand Implementation Tracker

> **Last Updated:** 2026-10-10  
> **Domain:** `https://fypmate.com`  
> **Transition:** `FYP Finder` $\rightarrow$ `FYPMate`  
> **Strategy Lead:** SEO & Brand Management  
> **Type Integrity Status:** `PASSED` (`npx tsc --noEmit` exited 0)

---

## 1. Objectives & Key Results (OKRs)

1. **Brand Identity Transition:** Safely replace legacy `FYP Finder` occurrences across navigation, footers, headers, email templates, administrative consoles, and PWA manifests with `FYPMate` while strictly preserving all existing UI styling, layouts, and theme tokens.
2. **Traditional Search Engine Optimization (SEO):** Implement Next.js 15 metadata architecture (`metadataBase: https://fypmate.com`, dynamic title templates `%s | FYPMate`, canonical tags, OpenGraph `summary_large_image` cards, `app/sitemap.ts`, and `app/robots.ts`).
3. **Generative Engine Optimization (GEO & AI Citations):** Ensure maximum citation authority and crawling eligibility for LLM search engines (Google AI Overviews / Gemini, ChatGPT Search / GPTBot, Perplexity / PerplexityBot, ClaudeBot, Applebot-Extended) via `llms.txt`, `llms-full.txt`, and Schema.org JSON-LD structured data (`WebApplication`, `WebSite`, `FAQPage`).

---

## 2. Implementation Progress Checklist

| Phase | Milestone | Scope | Status | Verification Result |
| :--- | :--- | :--- | :---: | :--- |
| **01** | **Implementation Tracking Document** | `SEO_AND_BRANDING_IMPLEMENTATION.md` | `[COMPLETED]` | Root Markdown log maintained |
| **02** | **Technical SEO Core** | `app/robots.ts` & `app/sitemap.ts` | `[COMPLETED]` | Dynamic routes output verified |
| **03** | **AI Search & LLM Citation Assets** | `public/llms.txt` & `public/llms-full.txt` | `[COMPLETED]` | Standardized markdown summaries for RAG & crawlers |
| **04** | **Root Layout & Meta Overhaul** | `app/layout.tsx` (metadataBase, canonicals, cards) | `[COMPLETED]` | Global metadata schema configured |
| **05** | **Page-Level SEO & Rich Schemas** | `app/idea-validator/page.tsx`, `app/(auth)/login/page.tsx`, `app/privacy/page.tsx`, `app/page.tsx` JSON-LD | `[COMPLETED]` | WebApplication + FAQPage + WebSite injected |
| **06** | **Global Brand String Migration** | Navbars, footers, sidebars, login, privacy, emails, feedback | `[COMPLETED]` | All user-facing strings migrated to FYPMate |
| **07** | **PWA & Logo Asset Updates** | `public/manifest.json`, `public/sw.js`, `public/icons/logo.svg` | `[COMPLETED]` | Monogram SVG & PWA name updated |
| **08** | **Final Type & Build Verification** | `npx tsc --noEmit` & Git commit | `[COMPLETED]` | **Zero errors (Exit Code 0)** |

---

## 3. Brand Word Replacement Log

| Component / File | Old String / Identity | New String / Identity | Rationale |
| :--- | :--- | :--- | :--- |
| `app/layout.tsx` | `"FYP Finder - Find Your Perfect Project Partner"` | `"FYPMate \| AI FYP Idea Validator & Student Teammate Platform"` | SEO-rich title targeting high-intent student queries |
| `app/layout.tsx` | Site name: `"FYP Finder"` | Site name: `"FYPMate"` | Canonical brand name |
| `app/page.tsx` (Nav) | `<span ...>FYP Finder</span>` | `<span ...>FYPMate</span>` | Public navigation consistency |
| `app/page.tsx` (Footer)| `<span ...>FYP Finder</span>`<br>`© 2026 FYP Finder` | `<span ...>FYPMate</span>`<br>`© 2026 FYPMate. All rights reserved.` | Legal & footer branding |
| `app/page.tsx` (JSON-LD)| *(None)* | Injected `WebApplication`, `WebSite`, `FAQPage` | Direct snippet inclusion in Google & AI Search |
| `app/idea-validator/` | *(No metadata exported)* | `AI FYP Idea Validator & Feasibility Report \| FYPMate` | High-intent organic search funnel |
| `app/about/page.tsx`   | *(New Page)* | `About Us \| FYPMate` + creator & supervisor Schema.org credits | Dedicated institutional story & authority signals |
| `app/privacy/page.tsx` | `"Privacy Policy \| FYP Finder"` | `"Privacy Policy \| FYPMate"` | Privacy & compliance branding |
| `app/(auth)/login/` | `"FYP Partner Finder"` | `"Sign in to FYPMate"` + canonical `/login` | Unified user auth flow |
| `DashboardSidebar.tsx` | `FYP Finder` | `FYPMate` | Authenticated student portal |
| `DashboardShell.tsx` | `FYP Finder` | `FYPMate` | Mobile navigation brand mark |
| `AdminSidebar.tsx` | `FYP Finder` | `FYPMate` | Admin back-office consistency |
| `AdminDashboard` | `"FYP Finder"` | `"FYPMate"` | Management overview subtitle |
| `AdminSettings` | `"FYP Finder Admin Suite"` | `"FYPMate Admin Suite"` | Admin application name |
| `AdminLogin` | `"FYP Finder Management Console"` | `"FYPMate Management Console"` | Admin portal brand |
| `FeedbackPage` | `"FYP Finder"` | `"FYPMate"` | Feedback submission prompt |
| `lib/email.ts` | `EMAIL_FROM_NAME = "FYP Finder"` | `EMAIL_FROM_NAME = "FYPMate"` | Transactional email sender name |
| `lib/email-templates.ts`| `https://fypfinder.com` | `https://fypmate.com` | Live link accuracy in emails |
| `public/manifest.json` | `"name": "FYP Finder"` | `"name": "FYPMate - AI FYP Idea Validator & Partner Platform"` | PWA app naming |
| `public/sw.js` | Push title: `'FYP Finder'` | Push title: `'FYPMate'` | Native push notification title |
| `public/icons/logo.svg`| Old SVG text `FYP` | High-contrast `FYPMate` monogram with modern mortarboard | Sharp favicon/PWA presentation |

---

## 4. AI Search Engine & Citation (GEO) Architecture

To rank and be cited directly by ChatGPT Search, Perplexity, and Google AI Overviews:

1. **Robots AI Crawler Permissions (`app/robots.ts`):**
   - Explicit allowances for: `GPTBot`, `ChatGPT-User`, `PerplexityBot`, `ClaudeBot`, `Google-Extended`, `Applebot-Extended`, and `*`.
   - Public paths: `/`, `/idea-validator`, `/privacy`, `/llms.txt`, `/llms-full.txt`.
   - Private paths disallowed: `/dashboard/`, `/admin/`, `/api/`.

2. **Standardized Citation Manifests:**
   - `public/llms.txt`: Concise executive summary structured for LLM retrieval-augmented generation (RAG) prompts.
   - `public/llms-full.txt`: Full platform breakdown including AI Feasibility Engine, rubric scoring (Novelty, Technical Difficulty, Timeline, Team Fit, Hardware), and university teammate matching.

3. **Schema.org Structured Data (`app/page.tsx`):**
   - `WebApplication`: Categories `EducationalApplication`, zero-cost license, HTML5/JS support.
   - `WebSite`: Canonical identity and publisher metadata.
   - `FAQPage`: Explicit Question & Answer nodes answering what FYPMate is, how the Idea Validator works, who can use it, and student pricing.
