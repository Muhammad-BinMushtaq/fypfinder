// app/dashboard/layout.tsx
import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { UserRole } from "@/lib/generated/prisma/enums";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

import prisma from "@/lib/db";
import { WelcomeModal } from "@/components/onboarding/WelcomeModal";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  let user = null;
  let student = null;

  try {
    user = await getCurrentUser();
  } catch {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center px-6">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Unable to verify your session
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Please refresh the page. If the issue persists, log in again.
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    redirect("/login");
  }

  if (user.status === "SUSPENDED") {
    redirect("/suspended");
  }

  if (user.role !== UserRole.STUDENT) {
    redirect(user.role === UserRole.ADMIN ? "/admin/dashboard" : "/login");
  }

  // Fetch student to check onboarding status
  student = await prisma.student.findUnique({
    where: { userId: user.id },
    select: { name: true, department: true, currentSemester: true, onboardingCompleted: true }
  });

  return (
    <DashboardShell userEmail={user.email || "user@example.com"}>
      {student && !student.onboardingCompleted && (
        <WelcomeModal 
          userName={student.name} 
          department={student.department} 
          semester={student.currentSemester} 
        />
      )}
      {children}
    </DashboardShell>
  );
}
