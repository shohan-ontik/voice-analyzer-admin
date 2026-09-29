"use client";

import { useRef, useState, type DragEvent, type FormEvent } from "react";
import type { AdminMaterialType } from "../../lib/types";
import { FileIcon, HeadphoneIcon, UploadCloudIcon, VideoIcon, XIcon } from "../icons";

const MAX_SIZE_MB = 500;

const TYPE_ICON: Record<AdminMaterialType, typeof VideoIcon> = {
  video: VideoIcon,
  pdf: FileIcon,
  audio: HeadphoneIcon,
};

const TYPE_WRAP: Record<AdminMaterialType, string> = {
  video: "bg-danger-soft text-danger",
  pdf: "bg-accent-soft text-accent",
  audio: "bg-teal-soft text-teal",
};

const TYPE_LABEL: Record<AdminMaterialType, string> = {
  video: "Video",
  pdf: "PDF",
  audio: "Audio",
};

function detectType(file: File): AdminMaterialType | null {
  if (file.type.startsWith("video/")) return "video";
  if (file.type.startsWith("audio/")) return "audio";
  if (file.type === "application/pdf") return "pdf";
  return null;
}

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function titleFromFilename(name: string) {
  return name
    .replace(/\.[^.]+$/, "")
    .replace(/[_-]+/g, " ")
    .trim();
}

export function MaterialUploadForm({
  onUpload,
  onCancel,
}: {
  onUpload: (file: File, title: string) => Promise<void>;
  onCancel: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [titleTouched, setTitleTouched] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const type = file ? detectType(file) : null;

  function selectFile(next: File | undefined) {
    if (!next) return;
    if (!detectType(next)) {
      setError("Unsupported file. Please choose a video, audio, or PDF file.");
      return;
    }
    if (next.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File is too large. Maximum size is ${MAX_SIZE_MB} MB.`);
      return;
    }
    setError(null);
    setFile(next);
    if (!titleTouched) setTitle(titleFromFilename(next.name));
  }

  function clearFile() {
    setFile(null);
    if (!titleTouched) setTitle("");
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    setDragging(false);
    if (uploading) return;
    selectFile(event.dataTransfer.files?.[0]);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!file || !title.trim()) return;
    setUploading(true);
    setError(null);
    try {
      await onUpload(file, title.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
      setUploading(false);
    }
  }

  const Icon = type ? TYPE_ICON[type] : null;

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-border p-4 flex flex-col gap-3.5 bg-background">
      <input
        ref={inputRef}
        type="file"
        accept="video/*,audio/*,application/pdf"
        className="hidden"
        onChange={(e) => selectFile(e.target.files?.[0])}
      />

      {file && Icon && type ? (
        <div className="flex items-center gap-3 rounded-xl border border-border p-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${TYPE_WRAP[type]}`}>
            <Icon size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13.5px] font-medium text-foreground truncate">{file.name}</div>
            <div className="text-[12px] text-foreground-muted">
              {TYPE_LABEL[type]} · {formatSize(file.size)}
            </div>
          </div>
          {!uploading && (
            <button
              type="button"
              onClick={clearFile}
              className="text-foreground-muted hover:text-danger p-1.5 cursor-pointer"
              aria-label="Remove selected file"
            >
              <XIcon size={14} />
            </button>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`flex flex-col items-center gap-1.5 rounded-xl border-2 border-dashed px-4 py-7 text-center transition-colors cursor-pointer ${
            dragging ? "border-accent bg-accent-soft" : "border-border hover:border-accent hover:bg-accent-soft"
          }`}
        >
          <span className="w-10 h-10 rounded-full bg-accent-soft text-accent flex items-center justify-center">
            <UploadCloudIcon size={18} />
          </span>
          <span className="text-[13.5px] font-semibold text-foreground">
            Drag &amp; drop a file here, or <span className="text-accent">browse</span>
          </span>
          <span className="text-[12px] text-foreground-muted">
            Video, audio, or PDF · up to {MAX_SIZE_MB} MB
          </span>
        </button>
      )}

      <label className="flex flex-col gap-1.5">
        <span className="text-[12px] font-semibold text-foreground-muted">Title</span>
        <input
          type="text"
          required
          disabled={uploading}
          placeholder="e.g. Introduction to active listening"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setTitleTouched(true);
          }}
          className="px-3 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:border-accent disabled:opacity-60"
        />
      </label>

      {uploading && (
        <div className="flex flex-col gap-1.5" role="status">
          <div className="h-1.5 rounded-full bg-border overflow-hidden">
            <div className="h-full w-1/3 rounded-full bg-accent animate-pulse" />
          </div>
          <span className="text-[12px] text-foreground-muted">Uploading… please keep this page open.</span>
        </div>
      )}

      {error && (
        <div className="text-[12.5px] text-danger rounded-lg bg-danger-soft px-3 py-2" role="alert">
          {error}
        </div>
      )}

      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={uploading}
          className="px-3.5 py-2 rounded-lg text-foreground-muted text-[12.5px] font-semibold disabled:opacity-60 cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={uploading || !file || !title.trim()}
          className="px-4 py-2 rounded-lg bg-accent text-accent-ink text-[12.5px] font-semibold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {uploading ? "Uploading…" : "Upload"}
        </button>
      </div>
    </form>
  );
}
