"use client";

import { useState } from "react";
import {
  ExternalLink,
  FolderOpen,
  MoreHorizontal,
  Pencil,
  UserPlus,
  GraduationCap,
} from "lucide-react";
import type { MyGroup } from "@/hooks/group/useMyGroup";
import type { GroupWorkspaceMeta } from "@/services/workspace.service";
import { btnSecondary, useDismiss } from "./workspaceUi";

interface ProjectHeaderProps {
  group: MyGroup;
  meta?: GroupWorkspaceMeta;
  isLocked: boolean;
  onEdit: () => void;
  onAddMember: () => void;
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
        className={btnSecondary}
      >
        <FolderOpen className="h-4 w-4" />
        Resources
        {links.length > 0 && (
          <span className="text-slate-500">{links.length}</span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-30 mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-1.5 shadow-lg"
        >
          {links.length === 0 ? (
            <p className="px-3 py-3 text-sm text-slate-500 dark:text-slate-400">
              No links added yet. Add your repository, documents or slides.
            </p>
          ) : (
            links.map((l) => (
              <a
                key={l.id}
                role="menuitem"
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="flex min-h-11 items-center justify-between gap-3 rounded-lg px-3 text-sm text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <span className="truncate">{l.label}</span>
                <ExternalLink className="h-4 w-4 shrink-0 text-slate-400" />
              </a>
            ))
          )}
          <div className="mt-1 border-t border-slate-100 dark:border-slate-800 pt-1">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onEdit();
              }}
              className="flex min-h-11 w-full items-center gap-2 rounded-lg px-3 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <Pencil className="h-4 w-4" />
              {links.length === 0 ? "Add links" : "Edit links"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MoreMenu({
  canAddMember,
  onEdit,
  onAddMember,
  onOpenSupervisor,
}: {
  canAddMember: boolean;
  onEdit: () => void;
  onAddMember: () => void;
  onOpenSupervisor: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useDismiss<HTMLDivElement>(open, () => setOpen(false));

  const item =
    "flex min-h-11 w-full items-center gap-2.5 rounded-lg px-3 text-sm text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="More project actions"
        aria-expanded={open}
        aria-haspopup="menu"
        className={`${btnSecondary} !px-0 w-11 sm:w-10`}
      >
        <MoreHorizontal className="h-5 w-5" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-30 mt-2 w-64 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-1.5 shadow-lg"
        >
          <button
            type="button"
            role="menuitem"
            className={item}
            onClick={() => {
              setOpen(false);
              onEdit();
            }}
          >
            <Pencil className="h-4 w-4 text-slate-500" />
            Edit project details
          </button>
          {canAddMember && (
            <button
              type="button"
              role="menuitem"
              className={item}
              onClick={() => {
                setOpen(false);
                onAddMember();
              }}
            >
              <UserPlus className="h-4 w-4 text-slate-500" />
              Add a team member
            </button>
          )}
          <button
            type="button"
            role="menuitem"
            className={item}
            onClick={() => {
              setOpen(false);
              onOpenSupervisor();
            }}
          >
            <GraduationCap className="h-4 w-4 text-slate-500" />
            Supervisor and meetings
          </button>
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
  onAddMember,
  onOpenSupervisor,
}: ProjectHeaderProps) {
  const canAddMember = !isLocked && group.members.length < 3;

  return (
    <header className="space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-white break-words">
            {group.projectName || "Untitled FYP project"}
          </h1>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 text-sm text-slate-500 dark:text-slate-400">
            <button
              type="button"
              onClick={onOpenSupervisor}
              className="hover:text-slate-900 dark:hover:text-white underline-offset-2 hover:underline cursor-pointer"
            >
              Supervisor: {meta?.supervisorName || "not set"}
            </button>
            <span aria-hidden="true">·</span>
            <span>
              {isLocked
                ? `Team locked (${group.members.length})`
                : `Team ${group.members.length} of 3`}
            </span>
            {meta?.domainTrack && (
              <>
                <span aria-hidden="true">·</span>
                <span>{meta.domainTrack}</span>
              </>
            )}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <ResourcesMenu meta={meta} onEdit={onEdit} />
          <MoreMenu
            canAddMember={canAddMember}
            onEdit={onEdit}
            onAddMember={onAddMember}
            onOpenSupervisor={onOpenSupervisor}
          />
        </div>
      </div>

      {group.description && (
        <p className="max-w-3xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          {group.description}
        </p>
      )}
    </header>
  );
}
