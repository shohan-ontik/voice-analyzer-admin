"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AdminModuleDetail } from "../../lib/types";
import { TrashIcon } from "../icons";
import { readError } from "./readError";

export function ModuleBasicsForm({
  moduleId,
  module: trainingModule,
}: {
  moduleId: string;
  module: AdminModuleDetail;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(trainingModule.title);
  const [description, setDescription] = useState(trainingModule.description);
  const [publishDate, setPublishDate] = useState(trainingModule.publishDate ?? "");

  const [saving, setSaving] = useState<"draft" | "publish" | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleSave(publish: boolean) {
    setSaving(publish ? "publish" : "draft");
    setSaveError(null);
    try {
      const res = await fetch(`/api/modules/${moduleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, publishDate: publishDate || null, isActive: publish }),
      });
      if (!res.ok) throw new Error(await readError(res, "Failed to save the module."));
      router.push("/modules");
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save.");
    } finally {
      setSaving(null);
    }
  }

  async function handleDeleteModule() {
    if (
      !window.confirm(`Delete "${trainingModule.title}"? This permanently removes its chapters, content, and exam.`)
    ) {
      return;
    }
    setDeleting(true);
    setSaveError(null);
    try {
      const res = await fetch(`/api/modules/${moduleId}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await readError(res, "Failed to delete module."));
      router.push("/modules");
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to delete module.");
      setDeleting(false);
    }
  }

  return (
    <>
      {saveError && <div className="text-[13.5px] text-danger">{saveError}</div>}

      <div className="rounded-2xl border border-border bg-background-elevated p-6 flex flex-col gap-4">
        <h2 className="font-display font-bold text-[16px] text-foreground">Module Basics</h2>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="module-title" className="text-[13px] font-semibold text-foreground-muted">
            Module Title
          </label>
          <input
            id="module-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm outline-none focus:border-accent"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="module-description" className="text-[13px] font-semibold text-foreground-muted">
            Description
          </label>
          <textarea
            id="module-description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm outline-none focus:border-accent resize-none"
          />
        </div>

        <div className="flex flex-col gap-1.5 max-w-[240px]">
          <label htmlFor="module-publish-date" className="text-[13px] font-semibold text-foreground-muted">
            Publish Date
          </label>
          <input
            id="module-publish-date"
            type="date"
            value={publishDate}
            onChange={(e) => setPublishDate(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm outline-none focus:border-accent cursor-pointer"
          />
        </div>
      </div>

      <div className="fixed bottom-0 left-64 right-0 border-t border-border bg-background-elevated px-10 py-4 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={handleDeleteModule}
          disabled={deleting}
          className="flex items-center gap-1.5 text-[13px] font-semibold text-danger disabled:opacity-50 cursor-pointer"
        >
          <TrashIcon size={14} />
          {deleting ? "Deleting…" : "Delete Module"}
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleSave(false)}
            disabled={saving !== null}
            className="px-4 py-2.5 rounded-xl border border-border text-foreground font-display font-semibold text-[13.5px] disabled:opacity-50 cursor-pointer"
          >
            {saving === "draft" ? "Saving…" : "Save as Draft"}
          </button>
          <button
            type="button"
            onClick={() => handleSave(true)}
            disabled={saving !== null}
            className="px-4 py-2.5 rounded-xl bg-accent text-accent-ink font-display font-semibold text-[13.5px] disabled:opacity-50 cursor-pointer"
          >
            {saving === "publish" ? "Publishing…" : "Publish Module"}
          </button>
        </div>
      </div>
    </>
  );
}
