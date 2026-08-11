"use client";

import { Monitor, Server, BrainCircuit, PenTool, Cpu, Smartphone, ShieldCheck, Layers } from "lucide-react";

export const ROLE_ICONS: Record<string, React.ReactNode> = {
  "Frontend Lead": <Monitor className="w-3.5 h-3.5" />,
  "Backend Dev": <Server className="w-3.5 h-3.5" />,
  "AI/ML Specialist": <BrainCircuit className="w-3.5 h-3.5" />,
  "UI/UX Designer": <PenTool className="w-3.5 h-3.5" />,
  "IoT/Embedded Lead": <Cpu className="w-3.5 h-3.5" />,
  "Mobile Dev": <Smartphone className="w-3.5 h-3.5" />,
  "Cybersecurity": <ShieldCheck className="w-3.5 h-3.5" />,
  "Full Stack": <Layers className="w-3.5 h-3.5" />,
};

export const AVAILABLE_ROLES = [
  "Frontend Lead",
  "Backend Dev",
  "AI/ML Specialist",
  "UI/UX Designer",
  "IoT/Embedded Lead",
  "Mobile Dev",
  "Cybersecurity",
  "Full Stack",
];

interface PrimaryRoleBadgesProps {
  roles: string[] | any;
  className?: string;
}

export function PrimaryRoleBadges({ roles, className = "" }: PrimaryRoleBadgesProps) {
  if (!roles || !Array.isArray(roles) || roles.length === 0) return null;

  // Max 2 badges
  const displayRoles = roles.slice(0, 2);

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {displayRoles.map((role) => (
        <span
          key={role}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 text-xs font-semibold shadow-sm"
        >
          {ROLE_ICONS[role] || <Layers className="w-3.5 h-3.5" />}
          {role}
        </span>
      ))}
    </div>
  );
}
