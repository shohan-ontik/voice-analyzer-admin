"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { AdminModuleDetail } from "../../../lib/types";
import { ChapterEditorCard } from "../../../components/ChapterEditorCard";
import { ArrowRightIcon, ClipboardIcon, PlusIcon, TrashIcon } from "../../../components/icons";

async function readError(res: Response, fallback: string) {
  const body = await res.json().catch(() => null);
  return body?.error?.message ?? fallback;
}

export default function ModuleEditorPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [trainingModule, setTrainingModule] = useState<AdminModuleDetail | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [refreshIndex, setRefreshIndex] = useState(0);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [publishDate, setPublishDate] = useState("");

  const [saving, setSaving] = useState<"draft" | "publish" | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const refresh = useCallback(() => setRefreshIndex((n) => n + 1), []);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/modules/${id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(await readError(res, "Failed to load this module."));
        return res.json();
      })
      .then((data: AdminModuleDetail) => {
        if (cancelled) return;
        setTrainingModule(data);
        setTitle(data.title);
        setDescription(data.description);
        setPublishDate(data.publishDate ?? "");
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : "Failed to load this module.");
      });
    return () => {
      cancelled = true;
    };
  }, [id, refreshIndex]);

  async function handleAddChapter() {
    const res = await fetch(`/api/modules/${id}/chapters`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "New Chapter" }),
    });
    if (!res.ok) {
      setSaveError(await readError(res, "Failed to add chapter."));
      return;
    }
    refresh();
  }

  async function handleUpdateChapterTitle(chapterId: string, newTitle: string) {
    const res = await fetch(`/api/modules/${id}/chapters/${chapterId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle }),
    });
    if (!res.ok) {
      setSaveError(await readError(res, "Failed to rename chapter."));
      return;
    }
    refresh();
  }

  async function handleDeleteChapter(chapterId: string) {
    if (!window.confirm("Delete this chapter and all of its content items? This can't be undone.")) return;
    const res = await fetch(`/api/modules/${id}/chapters/${chapterId}`, { method: "DELETE" });
    if (!res.ok) {
      setSaveError(await readError(res, "Failed to delete chapter."));
      return;
    }
    refresh();
  }

  async function handleUploadMaterial(chapterId: string, file: File, materialTitle: string) {
    const formData = new FormData();
    formData.set("file", file);
    formData.set("title", materialTitle);
    const res = await fetch(`/api/modules/${id}/chapters/${chapterId}/materials`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      throw new Error(await readError(res, "Upload failed."));
    }
    refresh();
  }

  async function handleDeleteMaterial(chapterId: string, materialId: string) {
    if (!window.confirm("Delete this content item?")) return;
    const res = await fetch(`/api/modules/${id}/chapters/${chapterId}/materials/${materialId}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      setSaveError(await readError(res, "Failed to delete content item."));
      return;
    }
    refresh();
  }

  async function handleSave(publish: boolean) {
    setSaving(publish ? "publish" : "draft");
    setSaveError(null);
    try {
      const moduleRes = await fetch(`/api/modules/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, publishDate: publishDate || null, isActive: publish }),
      });
      if (!moduleRes.ok) throw new Error(await readError(moduleRes, "Failed to save the module."));

      router.push("/modules");
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save.");
    } finally {
      setSaving(null);
    }
  }

  async function handleDeleteModule() {
    if (!trainingModule) return;
    if (
      !window.confirm(`Delete "${trainingModule.title}"? This permanently removes its chapters, content, and exam.`)
    ) {
      return;
    }
    setDeleting(true);
    setSaveError(null);
    try {
      const res = await fetch(`/api/modules/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await readError(res, "Failed to delete module."));
      router.push("/modules");
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to delete module.");
      setDeleting(false);
    }
  }

  if (loadError) {
    return (
      <div className="px-10 py-8 max-w-[900px] w-full mx-auto flex flex-col gap-3">
        <div className="text-[13.5px] text-danger">{loadError}</div>
        <Link href="/modules" className="text-[13px] font-semibold text-accent cursor-pointer">
          Back to Content Management
        </Link>
      </div>
    );
  }

  if (!trainingModule) {
    return <div className="flex-1 flex items-center justify-center text-[13.5px] text-foreground-muted">Loading…</div>;
  }

  return (
    <div className="flex flex-col">
      <div className="px-10 pt-8 pb-32 max-w-[900px] w-full mx-auto flex flex-col gap-6">
        <div className="flex items-center gap-1.5 text-[13px]">
          <Link href="/modules" className="font-semibold text-foreground-muted hover:text-foreground cursor-pointer">
            Content Management
          </Link>
          <span className="text-foreground-muted">›</span>
          <span className="font-semibold text-accent">Edit Module</span>
        </div>

        <div>
          <h1 className="font-display font-bold text-[28px] text-foreground mb-1">Module Editor</h1>
          <p className="text-[14px] text-foreground-muted">
            Construct and refine training modules, chapters, and associated assessments.
          </p>
        </div>

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

        <div className="rounded-2xl border border-border bg-background-elevated p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-[16px] text-foreground">Chapter Builder</h2>
            <button
              type="button"
              onClick={handleAddChapter}
              className="flex items-center gap-1.5 text-[13px] font-semibold text-accent cursor-pointer"
            >
              <PlusIcon size={14} />
              Add Chapter
            </button>
          </div>

          {trainingModule.chapters.length === 0 ? (
            <p className="text-[13.5px] text-foreground-muted">No chapters yet — add one to get started.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {trainingModule.chapters.map((chapter, i) => (
                <ChapterEditorCard
                  key={chapter.id}
                  chapter={chapter}
                  index={i}
                  defaultExpanded={i === 0}
                  onUpdateTitle={(newTitle) => handleUpdateChapterTitle(chapter.id, newTitle)}
                  onDelete={() => handleDeleteChapter(chapter.id)}
                  onUploadMaterial={(file, materialTitle) => handleUploadMaterial(chapter.id, file, materialTitle)}
                  onDeleteMaterial={(materialId) => handleDeleteMaterial(chapter.id, materialId)}
                />
              ))}
            </div>
          )}
        </div>

        <Link
          href={`/modules/${id}/exams`}
          className="rounded-2xl border border-border bg-background-elevated p-6 flex items-center justify-between gap-4 cursor-pointer hover:border-accent/40"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-accent-soft text-accent flex items-center justify-center shrink-0">
              <ClipboardIcon size={18} />
            </div>
            <div>
              <div className="font-display font-bold text-[15px] text-foreground">
                Module Assessment {trainingModule.exam ? "· Configured" : "· Not set up"}
              </div>
              <p className="text-[13px] text-foreground-muted">Set the pass mark, deadline, and scenario question.</p>
            </div>
          </div>
          <ArrowRightIcon size={16} className="text-foreground-muted shrink-0" />
        </Link>
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
    </div>
  );
}
