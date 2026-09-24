"use client";

import { useState, type FormEvent } from "react";
import type { AdminModuleSummary } from "../../lib/types";
import { XIcon } from "../icons";

export function CreateModuleModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (created: AdminModuleSummary) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/modules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description: description || undefined }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error?.message ?? "Failed to create module.");
      onCreated(body);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create module.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl bg-background-elevated border border-border p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-bold text-[18px] text-foreground">Create New Module</h2>
          <button type="button" onClick={onClose} className="text-foreground-muted hover:text-foreground p-1 cursor-pointer">
            <XIcon size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="new-module-title" className="text-[13px] font-semibold text-foreground-muted">
              Title
            </label>
            <input
              id="new-module-title"
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Communication Mastery"
              className="px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm outline-none focus:border-accent"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="new-module-description" className="text-[13px] font-semibold text-foreground-muted">
              Description
            </label>
            <textarea
              id="new-module-description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Core skills for effective client engagement."
              className="px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm outline-none focus:border-accent resize-none"
            />
          </div>

          <p className="text-[12.5px] text-foreground-muted">
            New modules start as a draft. Add at least one chapter and an exam before publishing.
          </p>

          {error && <div className="text-[13px] text-danger">{error}</div>}

          <button
            type="submit"
            disabled={creating}
            className="mt-1 py-3 rounded-xl bg-accent text-accent-ink font-display font-semibold text-sm disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
          >
            {creating ? "Creating…" : "Create module"}
          </button>
        </form>
      </div>
    </div>
  );
}
