# 🎓 FYPMate (`fypmate.com`)

**FYPMate** is a Next.js 15 collaboration platform designed for university students to discover peers, form Final Year Project (FYP) teams based on skills and interests, communicate in real time, and validate project ideas with AI.

---

## 📖 Documentation Single Source of Truth

All technical documentation, architectural specifications, database design, business rules, real-time messaging protocols, and developer guidelines have been consolidated into a single master document:

👉 **[Master Single Source of Truth Document (`docs/SINGLE_SOURCE_OF_TRUTH.md`)](docs/SINGLE_SOURCE_OF_TRUTH.md)**

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- npm or yarn
- Supabase PostgreSQL account

### Local Development Setup

1. **Install Dependencies**:
   ```powershell
   npm install
   ```

2. **Setup Environment Variables**:
   Copy `.env.example` (or create `.env.local`) with:
   ```env
   DATABASE_URL="your-supabase-database-url"
   DIRECT_URL="your-direct-database-url"
   NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
   GROQ_API_KEY="your-groq-api-key"
   ```

3. **Database Initialization**:
   ```powershell
   npx prisma generate
   npx prisma db push
   ```

4. **Run Development Server**:
   ```powershell
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠 Tech Stack

- **Framework**: Next.js 15 (App Router, Turbopack) & React 19
- **Language**: TypeScript
- **Database & ORM**: PostgreSQL (Supabase) & Prisma ORM 7
- **State & Realtime**: TanStack React Query v5 & Supabase Realtime WebSockets
- **Styling**: Tailwind CSS v4 & Lucide Icons
- **AI Integration**: Groq SDK (Llama 3 / DeepSeek models)

---

## 📄 License

This project is licensed under the MIT License.