"use client";

import { useCallback, useEffect, useState } from "react";
import type { ScoreCategory } from "../lib/types";
import { ConfirmDialog } from "./ConfirmDialog";
import { Spinner } from "./Spinner";

export function CategoriesManager() {
  const [categories, setCategories] = useState<ScoreCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<ScoreCategory | null>(null);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/score-categories");
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error?.message ?? "Failed to load categories.");
      setCategories(body.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load categories.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
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
      await loadCategories();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Failed to create category.");
    } finally {
      setCreating(false);
    }
  }

  function startEdit(category: ScoreCategory) {
    setEditingId(category.id);
    setEditName(category.name);
  }

  async function saveEdit(id: string) {
    setSavingEdit(true);
    try {
      const res = await fetch(`/api/score-categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error?.message ?? "Failed to save changes.");
      setCategories((prev) => prev.map((c) => (c.id === id ? body : c)));
      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save changes.");
    } finally {
      setSavingEdit(false);
    }
  }

  async function toggleActive(category: ScoreCategory) {
    setTogglingId(category.id);
    try {
      const res = await fetch(`/api/score-categories/${category.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !category.isActive }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error?.message ?? "Action failed.");
      setCategories((prev) => prev.map((c) => (c.id === category.id ? body : c)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed.");
    } finally {
      setTogglingId(null);
    }
  }

  async function confirmDelete() {
    const category = deleteCandidate;
    if (!category) return;

    setDeletingId(category.id);
    try {
      const res = await fetch(`/api/score-categories/${category.id}`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error?.message ?? "Failed to delete category.");
      }
      setCategories((prev) => prev.filter((c) => c.id !== category.id));
      setDeleteCandidate(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete category.");
      setDeleteCandidate(null);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="px-16 py-10 max-w-[1000px] w-full mx-auto flex flex-col gap-8">
      <div>
        <h1 className="font-display font-bold text-[26px] text-foreground mb-1">Categories</h1>
        <p className="text-[14px] text-foreground-muted">
          Extra dimensions the AI marks every pitch on, alongside presentation, correctness,
          pronunciation and soft skills. Turn a category off to stop applying it to new sessions
          without losing its history.
        </p>
      </div>

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

      {error && <div className="text-[13px] text-danger">{error}</div>}

      <div className="flex flex-col gap-3">
        {loading ? (
          <div className="text-center text-foreground-muted py-8">Loading…</div>
        ) : categories.length === 0 ? (
          <div className="text-center text-foreground-muted py-8">No categories yet.</div>
        ) : (
          categories.map((category) => {
            const isEditing = editingId === category.id;
            const isToggling = togglingId === category.id;
            const isDeleting = deletingId === category.id;
            const isPending = isToggling || isDeleting;
            return (
              <div key={category.id} className="border border-border rounded-2xl bg-background-elevated p-5">
                {isEditing ? (
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 px-3.5 py-2 rounded-lg border border-border bg-background text-foreground text-sm outline-none focus:border-accent font-display font-semibold"
                    />
                    <button
                      type="button"
                      onClick={() => saveEdit(category.id)}
                      disabled={savingEdit}
                      className="px-4 py-2 rounded-lg bg-accent text-accent-ink text-xs font-semibold disabled:opacity-60 flex items-center gap-1.5"
                    >
                      {savingEdit && <Spinner />}
                      {savingEdit ? "Saving…" : "Save"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="px-4 py-2 rounded-lg border border-border text-foreground-muted text-xs font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                      <div className="font-display font-semibold text-[15px] text-foreground">{category.name}</div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          category.isActive ? "bg-teal-soft text-teal" : "bg-border text-foreground-muted"
                        }`}
                      >
                        {category.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => startEdit(category)}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-semibold border-[1.5px] border-border text-foreground"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={category.isActive}
                        disabled={isPending}
                        onClick={() => toggleActive(category)}
                        className={`relative w-11 h-6 rounded-full transition-colors disabled:opacity-50 ${
                          category.isActive ? "bg-accent" : "bg-border"
                        }`}
                        title={category.isActive ? "Turn off" : "Turn on"}
                      >
                        <span
                          className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform"
                          style={{ transform: category.isActive ? "translateX(20px)" : "translateX(0)" }}
                        />
                      </button>
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => setDeleteCandidate(category)}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-semibold border-[1.5px] border-danger text-danger disabled:opacity-50 flex items-center gap-1.5"
                      >
                        {isDeleting && <Spinner />}
                        {isDeleting ? "Deleting…" : "Delete"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {deleteCandidate && (
        <ConfirmDialog
          title="Delete category"
          message={`Delete "${deleteCandidate.name}"? This cannot be undone.`}
          confirmLabel="Delete"
          danger
          loading={deletingId === deleteCandidate.id}
          onConfirm={confirmDelete}
          onCancel={() => {
            if (deletingId !== deleteCandidate.id) setDeleteCandidate(null);
          }}
        />
      )}
    </div>
  );
}
