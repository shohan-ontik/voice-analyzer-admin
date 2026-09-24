"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AdminChapter } from "../../lib/types";
import { PlusIcon } from "../icons";
import { ChapterEditorCard } from "./ChapterEditorCard";
import { readError } from "./readError";

export function ChapterBuilder({ moduleId, chapters }: { moduleId: string; chapters: AdminChapter[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function handleAddChapter() {
    setError(null);
    const res = await fetch(`/api/modules/${moduleId}/chapters`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "New Chapter" }),
    });
    if (!res.ok) {
      setError(await readError(res, "Failed to add chapter."));
      return;
    }
    router.refresh();
  }

  async function handleUpdateChapterTitle(chapterId: string, newTitle: string) {
    setError(null);
    const res = await fetch(`/api/modules/${moduleId}/chapters/${chapterId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle }),
    });
    if (!res.ok) {
      setError(await readError(res, "Failed to rename chapter."));
      return;
    }
    router.refresh();
  }

  async function handleDeleteChapter(chapterId: string) {
    if (!window.confirm("Delete this chapter and all of its content items? This can't be undone.")) return;
    setError(null);
    const res = await fetch(`/api/modules/${moduleId}/chapters/${chapterId}`, { method: "DELETE" });
    if (!res.ok) {
      setError(await readError(res, "Failed to delete chapter."));
      return;
    }
    router.refresh();
  }

  async function handleUploadMaterial(chapterId: string, file: File, materialTitle: string) {
    const formData = new FormData();
    formData.set("file", file);
    formData.set("title", materialTitle);
    const res = await fetch(`/api/modules/${moduleId}/chapters/${chapterId}/materials`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      throw new Error(await readError(res, "Upload failed."));
    }
    router.refresh();
  }

  async function handleDeleteMaterial(chapterId: string, materialId: string) {
    if (!window.confirm("Delete this content item?")) return;
    setError(null);
    const res = await fetch(`/api/modules/${moduleId}/chapters/${chapterId}/materials/${materialId}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      setError(await readError(res, "Failed to delete content item."));
      return;
    }
    router.refresh();
  }

  return (
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

      {error && <div className="text-[13px] text-danger">{error}</div>}

      {chapters.length === 0 ? (
        <p className="text-[13.5px] text-foreground-muted">No chapters yet — add one to get started.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {chapters.map((chapter, i) => (
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
  );
}
