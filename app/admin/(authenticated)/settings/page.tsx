// app/admin/(authenticated)/settings/page.tsx
"use client"

import {
  Settings,
  User,
  Shield,
  Key,
  CheckCircle,
  Building,
  Server,
  Lock,
} from "lucide-react"
import { useAdminSession } from "@/hooks/admin"

export default function AdminSettingsPage() {
  const { admin } = useAdminSession()

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3.5">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs">
          <Settings className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            System & Account Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Administrator credentials, security policies, and environment information
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Administrator Profile Card */}
        <section className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-5">
            <User className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Administrator Profile
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Full Name
              </label>
              <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-white">
                {admin?.name || "System Administrator"}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Account Email
              </label>
              <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-white">
                {admin?.email || "—"}
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Role & Permissions
              </label>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-800 dark:text-slate-200">
                  <Shield className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  Full Administrator (Role: ADMIN)
                </span>
                <span className="text-xs text-slate-400">
                  Unrestricted access to all student directories, chats, and analytics
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Security & Authentication */}
        <section className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-5">
            <Key className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Security & Authentication
            </h2>
          </div>

          <div className="space-y-3">
            <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-slate-500" />
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">
                      Supabase Auth Management
                    </p>
                  </div>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Admin credentials and cryptographic sessions are managed through Supabase Auth with HTTP-only secure cookie storage. Password rotations are executed via the Supabase dashboard or password reset flows.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">
                    Active Session Status
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    Bearer token authenticated and verified by server middleware.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                  <CheckCircle className="h-3.5 w-3.5" />
                  Authenticated
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Platform & Institution Metadata */}
        <section className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-5">
            <Server className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Platform & Environment
            </h2>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
            <div className="flex items-center justify-between py-3">
              <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <Building className="h-3.5 w-3.5" />
                Host Institution
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">
                Pak-Austria Fachhochschule: Institute of Applied Sciences and Technology (PAF-IAST)
              </span>
            </div>

            <div className="flex items-center justify-between py-3">
              <span className="text-slate-500 dark:text-slate-400">Application Name</span>
              <span className="font-semibold text-slate-900 dark:text-white">FYPMate Admin Suite</span>
            </div>

            <div className="flex items-center justify-between py-3">
              <span className="text-slate-500 dark:text-slate-400">Database Layer</span>
              <span className="font-semibold text-slate-900 dark:text-white">PostgreSQL via Supabase</span>
            </div>

            <div className="flex items-center justify-between py-3">
              <span className="text-slate-500 dark:text-slate-400">Audit Compliance</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">Enforced & Active</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

