"use client";

import { useState } from "react";
import {
  ExternalLink,
  FolderOpen,
  Pencil,
  GraduationCap,
  Users,
} from "lucide-react";
import type { MyGroup } from "@/hooks/group/useMyGroup";
import type { GroupWorkspaceMeta } from "@/services/workspace.service";
import { btnSecondary, useDismiss } from "./workspaceUi";

interface ProjectHeaderProps {
  group: MyGroup;
  meta?: GroupWorkspaceMeta;
  isLocked: boolean;
  onEdit: () => void;
  onOpenSupervisor: () => void;
}

function ResourcesMenu({
  meta,
  onEdit,
}: {
  meta?: GroupWorkspaceMeta;
  onEdit: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useDismiss<HTMLDivElement>(open, () => setOpen(false));

  const links: Array<{ id: string; label: string; url: string }> = [];
  if (meta?.repoUrl)
    links.push({ id: "repo", label: "GitHub repository", url: meta.repoUrl });
  if (meta?.docsUrl)
    links.push({ id: "docs", label: "Documents / SRS", url: meta.docsUrl });
  if (meta?.demoUrl)
    links.push({ id: "demo", label: "Prototype / Demo", url: meta.demoUrl });
  (meta?.customLinks || []).forEach((l) =>
    links.push({ id: l.id, label: l.label, url: l.url })
  );

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={`${btnSecondary} !h-9 text-xs sm:text-sm`}
      >
        <FolderOpen className="h-4 w-4 text-slate-500 dark:text-slate-400" />
        <span>Resources</span>
        {links.length > 0 && (
          <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 px-1 text-[11px] font-semibold text-slate-700 dark:text-slate-200">
            {links.length}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute left-0 sm:left-auto sm:right-0 z-50 mt-2 w-72 max-w-[calc(100vw-2.5rem)] rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-1.5 shadow-xl"
        >
          {links.length === 0 ? (
            <p className="px-3 py-3 text-xs text-slate-500 dark:text-slate-400">
              No links attached yet. Click below to add your GitHub, SRS or demo links.
            </p>
          ) : (
            <div className="space-y-0.5">
              {links.map((l) => (
                <a
                  key={l.id}
                  role="menuitem"
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                  className="flex min-h-9 items-center justify-between gap-3 rounded-xl px-3 py-1.5 text-xs sm:text-sm text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <span className="truncate font-medium">{l.label}</span>
                  <ExternalLink className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                </a>
              ))}
            </div>
          )}
          <div className="mt-1 border-t border-slate-100 dark:border-slate-800 pt-1">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onEdit();
              }}
              className="flex min-h-9 w-full items-center gap-2 rounded-xl px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
            >
              <Pencil className="h-3.5 w-3.5 text-slate-400" />
              <span>{links.length === 0 ? "Add project links" : "Manage links"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function ProjectHeader({
  group,
  meta,
  isLocked,
  onEdit,
  onOpenSupervisor,
}: ProjectHeaderProps) {
  return (
    <header className="space-y-2">
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white break-words">
              {group.projectName || "Untitled FYP Project"}
            </h1>
            {meta?.domainTrack && (
              <span className="inline-flex items-center rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                {meta.domainTrack}
              </span>
            )}
          </div>

          {group.description && (
            <p className="mt-1 max-w-2xl text-xs sm:text-sm leading-relaxed text-slate-500 dark:text-slate-400 line-clamp-2">
              {group.description}
            </p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
            <button
              type="button"
              onClick={onOpenSupervisor}
              className="inline-flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <GraduationCap className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              <span>
                Supervisor:{" "}
                <strong className="font-semibold text-slate-700 dark:text-slate-200">
                  {meta?.supervisorName || "Not assigned"}
                </strong>
              </span>
            </button>

            <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">
              •
            </span>

            <span className="inline-flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              <span>
                {isLocked
                  ? `Locked (${group.members.length}/3)`
                  : `Team ${group.members.length} of 3`}
              </span>
            </span>
          </div>
        </div>

        {/* Minimal Actions: Resources & Edit */}
        <div className="flex items-center gap-2 shrink-0 pt-0.5 sm:pt-0">
          <ResourcesMenu meta={meta} onEdit={onEdit} />
          <button
            type="button"
            onClick={onEdit}
            className={`${btnSecondary} !h-9 text-xs sm:text-sm`}
            title="Edit project details and links"
          >
            <Pencil className="h-3.5 w-3.5 text-slate-500" />
            <span className="hidden xs:inline sm:inline">Edit project</span>
          </button>
        </div>
      </div>
    </header>
  );
}
