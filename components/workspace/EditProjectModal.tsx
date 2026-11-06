"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import type { MyGroup } from "@/hooks/group/useMyGroup";
import {
  useUpdateWorkspaceMeta,
  type CustomResourceLink,
  type GroupWorkspaceMeta,
  type SupervisorStatus,
} from "@/services/workspace.service";
import {
  Sheet,
  btnPrimary,
  btnSecondary,
  btnGhost,
  inputCls,
  textareaCls,
  labelCls,
} from "./workspaceUi";

interface EditProjectModalProps {
  group: MyGroup;
  meta?: GroupWorkspaceMeta;
  onClose: () => void;
}

/** Edits project details and resource links in one request (title, summary, supervisor and links). */
export function EditProjectModal({ group, meta, onClose }: EditProjectModalProps) {
  const updateMeta = useUpdateWorkspaceMeta(group.id);

  const [projectName, setProjectName] = useState(group.projectName || "");
  const [description, setDescription] = useState(group.description || "");
  const [domainTrack, setDomainTrack] = useState(meta?.domainTrack || "");
  const [supervisorName, setSupervisorName] = useState(meta?.supervisorName || "");
  const [supervisorStatus, setSupervisorStatus] = useState<SupervisorStatus>(
    meta?.supervisorStatus || "NOT_DECIDED"
  );
  const [repoUrl, setRepoUrl] = useState(meta?.repoUrl || "");
  const [docsUrl, setDocsUrl] = useState(meta?.docsUrl || "");
  const [demoUrl, setDemoUrl] = useState(meta?.demoUrl || "");
  const [customLinks, setCustomLinks] = useState<CustomResourceLink[]>(
    meta?.customLinks ? [...meta.customLinks] : []
  );

  const addLink = () => {
    if (customLinks.length >= 6) return;
    setCustomLinks((prev) => [
      ...prev,
      { id: `link-${Date.now()}-${prev.length}`, label: "", url: "", category: "OTHER" },
    ]);
  };

  const updateLink = (idx: number, field: "label" | "url", value: string) =>
    setCustomLinks((prev) =>
      prev.map((l, i) => (i === idx ? { ...l, [field]: value } : l))
    );

  const removeLink = (idx: number) =>
    setCustomLinks((prev) => prev.filter((_, i) => i !== idx));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) {
      toast.error("Project title is required");
      return;
    }

    updateMeta.mutate(
      {
        projectName: projectName.trim(),
        description: description.trim() || null,
        repoUrl: repoUrl.trim() || null,
        docsUrl: docsUrl.trim() || null,
        demoUrl: demoUrl.trim() || null,
        supervisorName: supervisorName.trim() || null,
        supervisorStatus,
        domainTrack: domainTrack.trim() || null,
        customLinks: customLinks.filter(
          (l) => l.label.trim().length > 0 && l.url.trim().length > 0
        ),
      },
      {
        onSuccess: () => {
          toast.success("Project saved");
          onClose();
        },
        onError: (err: any) => toast.error(err?.message || "Failed to save project"),
      }
    );
  };

  return (
    <Sheet
      title="Project details"
      description="Update your project information and links."
      onClose={onClose}
      wide
      footer={
        <>
          <button type="button" onClick={onClose} className={btnSecondary}>
            Cancel
          </button>
          <button
            type="submit"
            form="edit-project-form"
            disabled={!projectName.trim() || updateMeta.isPending}
            className={btnPrimary}
          >
            {updateMeta.isPending ? "Saving..." : "Save changes"}
          </button>
        </>
      }
    >
      <form id="edit-project-form" onSubmit={handleSave} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className={labelCls} htmlFor="ep-title">
              Project title
            </label>
            <input
              id="ep-title"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              maxLength={100}
              required
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="ep-desc">
              Summary
            </label>
            <textarea
              id="ep-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={500}
              className={textareaCls}
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="ep-domain">
              Domain or track
            </label>
            <input
              id="ep-domain"
              value={domainTrack}
              onChange={(e) => setDomainTrack(e.target.value)}
              placeholder="e.g. AI, Web, IoT"
              maxLength={80}
              className={inputCls}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Supervisor
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls} htmlFor="ep-sup">
                Name
              </label>
              <input
                id="ep-sup"
                value={supervisorName}
                onChange={(e) => setSupervisorName(e.target.value)}
                placeholder="e.g. Dr. Muhammad Bilal"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls} htmlFor="ep-sup-status">
                Status
              </label>
              <select
                id="ep-sup-status"
                value={supervisorStatus}
                onChange={(e) =>
                  setSupervisorStatus(e.target.value as SupervisorStatus)
                }
                className={inputCls}
              >
                <option value="NOT_DECIDED">Not decided</option>
                <option value="APPROACHED">Approached</option>
                <option value="CONFIRMED">Confirmed</option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Links
          </h3>
          <div>
            <label className={labelCls} htmlFor="ep-repo">
              GitHub repository
            </label>
            <input
              id="ep-repo"
              type="url"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/..."
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="ep-docs">
              Documents / SRS
            </label>
            <input
              id="ep-docs"
              type="url"
              value={docsUrl}
              onChange={(e) => setDocsUrl(e.target.value)}
              placeholder="https://docs.google.com/..."
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="ep-demo">
              Prototype / Demo
            </label>
            <input
              id="ep-demo"
              type="url"
              value={demoUrl}
              onChange={(e) => setDemoUrl(e.target.value)}
              placeholder="https://figma.com/..."
              className={inputCls}
            />
          </div>

          {customLinks.map((link, idx) => (
            <div key={link.id || idx} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1.5fr_auto] sm:items-center">
              <input
                value={link.label}
                onChange={(e) => updateLink(idx, "label", e.target.value)}
                placeholder="Label (e.g. Thesis, Slides, Dataset)"
                aria-label="Link label"
                maxLength={50}
                className={inputCls}
              />
              <input
                type="url"
                value={link.url}
                onChange={(e) => updateLink(idx, "url", e.target.value)}
                placeholder="https://..."
                aria-label="Link address"
                className={inputCls}
              />
              <button
                type="button"
                onClick={() => removeLink(idx)}
                aria-label="Remove link"
                className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}

          {customLinks.length < 6 && (
            <button type="button" onClick={addLink} className={btnGhost}>
              <Plus className="h-4 w-4" />
              Add another link
            </button>
          )}
        </div>
      </form>
    </Sheet>
  );
}
