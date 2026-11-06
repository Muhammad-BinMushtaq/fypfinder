"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import {
  searchCollaboratorsApi,
  useInviteCollaborator,
  type InviteSearchCandidate,
} from "@/hooks/group/useMyGroup";
import { btnPrimary, inputCls } from "./workspaceUi";

/** Search same-semester students and invite them (an email is sent automatically). */
export function CollaboratorSearch() {
  const invite = useInviteCollaborator();
  const [query, setQuery] = useState("");
  const [note, setNote] = useState("");
  const [results, setResults] = useState<InviteSearchCandidate[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }

    let cancelled = false;
    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const found = await searchCollaboratorsApi(trimmed);
        if (!cancelled) setResults(found);
      } catch {
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 280);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  const handleInvite = (id: string) => {
    invite.mutate(
      { toStudentId: id, reason: note.trim() || undefined },
      {
        onSuccess: () => {
          setResults((prev) =>
            prev.map((r) =>
              r.id === id ? { ...r, isPending: true, canInvite: false } : r
            )
          );
          setNote("");
        },
      }
    );
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search classmates by name or email..."
          aria-label="Search classmates"
          className={`${inputCls} pl-10`}
        />
      </div>
      <input
        type="text"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Add a short note to the invitation email (optional)"
        aria-label="Invitation note"
        maxLength={140}
        className={inputCls}
      />

      {searching && (
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Searching students...
        </p>
      )}

      {!searching && query.trim().length >= 2 && results.length === 0 && (
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          No matching students found in your semester.
        </p>
      )}

      {query.trim().length < 2 && (
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Type at least 2 letters to search, or{" "}
          <Link
            href="/dashboard/discovery"
            className="font-medium text-slate-800 dark:text-slate-200 underline underline-offset-2"
          >
            browse Find Partners
          </Link>
          .
        </p>
      )}

      {results.length > 0 && (
        <ul className="divide-y divide-slate-100 dark:divide-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 max-h-64 overflow-y-auto">
          {results.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between gap-3 px-3.5 py-2.5"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                  {c.name}
                </p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                  {c.department} · Semester {c.semester}
                </p>
              </div>
              {c.canInvite ? (
                <button
                  type="button"
                  onClick={() => handleInvite(c.id)}
                  disabled={invite.isPending}
                  className={`${btnPrimary} !h-9 !px-3 text-xs shrink-0`}
                >
                  Invite
                </button>
              ) : (
                <span className="shrink-0 text-xs font-medium text-slate-500 dark:text-slate-400">
                  {c.isPending ? "Invited" : "Unavailable"}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
