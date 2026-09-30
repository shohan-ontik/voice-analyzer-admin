"use client";

import { useState } from "react";
import type { AdminChapter, AdminMaterialType } from "../../lib/types";
import { MaterialUploadForm } from "./MaterialUploadForm";
import { useSessionDraft } from "./useSessionDraft";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  FileIcon,
  HeadphoneIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  VideoIcon,
} from "../icons";

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
  const {
    value: titleDraft,
    setValue: setTitleDraft,
    reset: resetTitleDraft,
  } = useSessionDraft(`chapter-title-draft:${chapter.id}`, chapter.title);
  const [showAddForm, setShowAddForm] = useState(false);

  async function handleUpload(file: File, title: string) {
    await onUploadMaterial(file, title);
    setShowAddForm(false);
  }

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="flex items-center gap-3 p-4">
        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-bold uppercase tracking-wide text-foreground-muted mb-1.5">
            Chapter {index + 1} · Name
          </div>
          <label className="group flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-background hover:border-accent focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20 transition-colors cursor-text">
            <input
              value={titleDraft}
              placeholder="Untitled chapter"
              aria-label={`Chapter ${index + 1} name`}
              title="Click to rename"
              onChange={(e) => setTitleDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.currentTarget.blur();
                if (e.key === "Escape") {
                  const input = e.currentTarget;
                  resetTitleDraft();
                  requestAnimationFrame(() => input.blur());
                }
              }}
              onBlur={() => {
                const trimmed = titleDraft.trim();
                if (trimmed && trimmed !== chapter.title) {
                  setTitleDraft(trimmed);
                  onUpdateTitle(trimmed);
                } else {
                  resetTitleDraft();
                }
              }}
              className="flex-1 min-w-0 font-display font-bold text-[15px] text-foreground bg-transparent outline-none placeholder:text-foreground-muted cursor-text"
            />
            <PencilIcon
              size={14}
              aria-hidden
              className="shrink-0 text-foreground-muted group-hover:text-accent group-focus-within:text-accent transition-colors"
            />
            <span className="shrink-0 text-[11px] font-semibold text-foreground-muted group-hover:text-accent group-focus-within:hidden">
              Edit
            </span>
          </label>
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
            <MaterialUploadForm onUpload={handleUpload} onCancel={() => setShowAddForm(false)} />
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
