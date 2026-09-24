"use client";

import { useState, type FormEvent } from "react";
import type { AdminChapter, AdminMaterialType } from "../../lib/types";
import { ChevronDownIcon, ChevronRightIcon, FileIcon, HeadphoneIcon, PlusIcon, TrashIcon, VideoIcon } from "../icons";

const MATERIAL_ICON: Record<AdminMaterialType, typeof VideoIcon> = {
  video: VideoIcon,
  pdf: FileIcon,
  audio: HeadphoneIcon,
};

const MATERIAL_ICON_WRAP: Record<AdminMaterialType, string> = {
  video: "bg-danger-soft text-danger",
  pdf: "bg-accent-soft text-accent",
  audio: "bg-teal-soft text-teal",
};

export function ChapterEditorCard({
  chapter,
  index,
  defaultExpanded,
  onUpdateTitle,
  onDelete,
  onUploadMaterial,
  onDeleteMaterial,
}: {
  chapter: AdminChapter;
  index: number;
  defaultExpanded: boolean;
  onUpdateTitle: (title: string) => void;
  onDelete: () => void;
  onUploadMaterial: (file: File, title: string) => Promise<void>;
  onDeleteMaterial: (materialId: string) => void;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [titleDraft, setTitleDraft] = useState(chapter.title);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleUpload(event: FormEvent) {
    event.preventDefault();
    if (!file || !newTitle.trim()) return;
    setUploading(true);
    setUploadError(null);
    try {
      await onUploadMaterial(file, newTitle.trim());
      setNewTitle("");
      setFile(null);
      setShowAddForm(false);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="flex items-center gap-3 p-4">
        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-bold uppercase tracking-wide text-foreground-muted mb-0.5">
            Chapter {index + 1}
          </div>
          <input
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={() => {
              const trimmed = titleDraft.trim();
              if (trimmed && trimmed !== chapter.title) onUpdateTitle(trimmed);
              else setTitleDraft(chapter.title);
            }}
            className="font-display font-bold text-[15px] text-foreground bg-transparent outline-none w-full border-b border-transparent focus:border-accent cursor-text"
          />
        </div>
        <button
          type="button"
          onClick={onDelete}
          className="text-foreground-muted hover:text-danger p-1.5 cursor-pointer"
          aria-label="Delete chapter"
        >
          <TrashIcon size={16} />
        </button>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="text-foreground-muted hover:text-foreground p-1.5 cursor-pointer"
          aria-label={expanded ? "Collapse chapter" : "Expand chapter"}
        >
          {expanded ? <ChevronDownIcon size={16} /> : <ChevronRightIcon size={16} />}
        </button>
      </div>

      {expanded && (
        <div className="px-4 pb-4 flex flex-col gap-3 border-t border-border pt-4">
          <div className="text-[11px] font-bold uppercase tracking-wide text-foreground-muted">Content Items</div>

          {chapter.materials.length === 0 && (
            <p className="text-[13px] text-foreground-muted">No content items yet.</p>
          )}

          {chapter.materials.map((material) => {
            const Icon = MATERIAL_ICON[material.type];
            return (
              <div key={material.id} className="flex items-center gap-3 rounded-xl border border-border p-3">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${MATERIAL_ICON_WRAP[material.type]}`}
                >
                  <Icon size={16} />
                </div>
                <span className="flex-1 text-[13.5px] font-medium text-foreground truncate">{material.title}</span>
                <button
                  type="button"
                  onClick={() => onDeleteMaterial(material.id)}
                  className="text-foreground-muted hover:text-danger p-1 cursor-pointer"
                  aria-label="Delete content item"
                >
                  <TrashIcon size={14} />
                </button>
              </div>
            );
          })}

          {showAddForm ? (
            <form onSubmit={handleUpload} className="rounded-xl border border-dashed border-border p-3.5 flex flex-col gap-2.5">
              <input
                type="text"
                required
                placeholder="Content item title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="px-3 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:border-accent"
              />
              <input
                type="file"
                required
                accept="video/*,audio/*,application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="text-[12.5px] text-foreground-muted cursor-pointer"
              />
              {uploadError && <div className="text-[12.5px] text-danger">{uploadError}</div>}
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-3.5 py-2 rounded-lg bg-accent text-accent-ink text-[12.5px] font-semibold disabled:opacity-60 cursor-pointer"
                >
                  {uploading ? "Uploading…" : "Upload"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3.5 py-2 rounded-lg text-foreground-muted text-[12.5px] font-semibold cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="self-start flex items-center gap-1.5 text-[12.5px] font-semibold text-accent cursor-pointer"
            >
              <PlusIcon size={13} />
              Add Content Item
            </button>
          )}
        </div>
      )}
    </div>
  );
}
