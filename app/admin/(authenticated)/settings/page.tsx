// app/admin/(authenticated)/settings/page.tsx
"use client"

import { useState } from "react"
import {
  Settings,
  User,
  Shield,
  Key,
  Loader2,
  Save,
  AlertCircle,
  CheckCircle,
} from "lucide-react"
import { useAdminSession } from "@/hooks/admin"

export default function AdminSettingsPage() {
  const { admin } = useAdminSession()

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-500 to-slate-700 shadow-lg shadow-slate-500/30">
            <Settings className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Admin account settings and preferences
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Admin Profile Info */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center gap-2 mb-5">
            <User className="h-5 w-5 text-slate-500 dark:text-slate-400" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Account Information</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-500 dark:text-slate-400">Name</label>
              <p className="mt-1 rounded-lg bg-slate-50 px-4 py-2.5 text-slate-900 dark:bg-slate-700 dark:text-white">
                {admin?.name || "Administrator"}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-500 dark:text-slate-400">Email</label>
              <p className="mt-1 rounded-lg bg-slate-50 px-4 py-2.5 text-slate-900 dark:bg-slate-700 dark:text-white">
                {admin?.email || "—"}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-500 dark:text-slate-400">Role</label>
              <div className="mt-1 flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700 dark:border-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                  <Shield className="h-3.5 w-3.5" />
                  Administrator
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Security */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center gap-2 mb-5">
            <Key className="h-5 w-5 text-slate-500 dark:text-slate-400" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Security</h2>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-700">
              <p className="font-medium text-slate-900 dark:text-white">Authentication</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Admin accounts are managed through Supabase Auth. Password changes can be done via the
                Supabase dashboard or password reset flow.
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-700">
              <p className="font-medium text-slate-900 dark:text-white">Session</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Your session is active and secure. Sessions expire after extended inactivity.
              </p>
              <div className="mt-2 flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400">
                <CheckCircle className="h-4 w-4" />
                Session active
              </div>
            </div>
          </div>
        </section>

        {/* Platform Info */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center gap-2 mb-5">
            <Shield className="h-5 w-5 text-slate-500 dark:text-slate-400" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Platform</h2>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3 dark:bg-slate-700">
              <span className="text-sm text-slate-600 dark:text-slate-400">Platform</span>
              <span className="text-sm font-medium text-slate-900 dark:text-white">FYP Finder</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3 dark:bg-slate-700">
              <span className="text-sm text-slate-600 dark:text-slate-400">Institution</span>
              <span className="text-sm font-medium text-slate-900 dark:text-white">PAF-IAST</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3 dark:bg-slate-700">
              <span className="text-sm text-slate-600 dark:text-slate-400">Access Level</span>
              <span className="text-sm font-medium text-slate-900 dark:text-white">Full Administrator</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
