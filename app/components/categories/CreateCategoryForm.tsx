"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Spinner } from "../Spinner";

export function CreateCategoryForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreating(true);
    setCreateError(null);
    try {
      const res = await fetch("/api/score-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error?.message ?? "Failed to create category.");
      setName("");
      router.refresh();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Failed to create category.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <form
      onSubmit={handleCreate}
      className="bg-background-elevated border border-border rounded-2xl p-6 flex flex-col gap-4"
    >
      <div className="font-display font-semibold text-[15px] text-foreground">Create a new category</div>
      <div className="flex gap-3 flex-wrap">
        <input
          type="text"
          required
          placeholder="Name (e.g. Confidence)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 min-w-[220px] px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={creating}
          className="px-5 py-2.5 rounded-xl bg-accent text-accent-ink font-display font-semibold text-sm disabled:opacity-60 flex items-center gap-2"
        >
          {creating && <Spinner />}
          {creating ? "Creating…" : "Create category"}
        </button>
      </div>
      {createError && <div className="text-[13px] text-danger">{createError}</div>}
    </form>
  );
}
