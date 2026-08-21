"use client";

import { useCallback, useEffect, useState } from "react";
import type { Topic } from "../lib/types";

function truncate(text: string, max = 90) {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

export function TopicsManager() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [passage, setPassage] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPassage, setEditPassage] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const [pendingActionId, setPendingActionId] = useState<string | null>(null);

  const loadTopics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/topics");
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error?.message ?? "Failed to load topics.");
      setTopics(body.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load topics.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTopics();
  }, [loadTopics]);

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreating(true);
    setCreateError(null);
    try {
      const res = await fetch("/api/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, passage }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error?.message ?? "Failed to create topic.");
      setName("");
      setPassage("");
      await loadTopics();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Failed to create topic.");
    } finally {
      setCreating(false);
    }
  }

  function startEdit(topic: Topic) {
    setEditingId(topic.id);
    setEditName(topic.name);
    setEditPassage(topic.passage);
  }

  async function saveEdit(id: string) {
    setSavingEdit(true);
    try {
      const res = await fetch(`/api/topics/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, passage: editPassage }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error?.message ?? "Failed to save changes.");
      setTopics((prev) => prev.map((t) => (t.id === id ? body : t)));
      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save changes.");
    } finally {
      setSavingEdit(false);
    }
  }

  async function toggleActive(topic: Topic) {
    setPendingActionId(topic.id);
    try {
      const res = await fetch(`/api/topics/${topic.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !topic.isActive }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error?.message ?? "Action failed.");
      setTopics((prev) => prev.map((t) => (t.id === topic.id ? body : t)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed.");
    } finally {
      setPendingActionId(null);
    }
  }

  async function handleDelete(topic: Topic) {
    const confirmed = window.confirm(`Delete "${topic.name}"? This cannot be undone.`);
    if (!confirmed) return;

    setPendingActionId(topic.id);
    try {
      const res = await fetch(`/api/topics/${topic.id}`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error?.message ?? "Failed to delete topic.");
      }
      setTopics((prev) => prev.filter((t) => t.id !== topic.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete topic.");
    } finally {
      setPendingActionId(null);
    }
  }

  return (
    <div className="px-16 py-10 max-w-[1000px] w-full mx-auto flex flex-col gap-8">
      <div>
        <h1 className="font-display font-bold text-[26px] text-foreground mb-1">Topics</h1>
        <p className="text-[14px] text-foreground-muted">
          Manage the practice scenarios and Bangla scripts reps see in the app.
        </p>
      </div>

      <form
        onSubmit={handleCreate}
        className="bg-background-elevated border border-border rounded-2xl p-6 flex flex-col gap-4"
      >
        <div className="font-display font-semibold text-[15px] text-foreground">Create a new topic</div>
        <input
          type="text"
          required
          placeholder="Name (e.g. Cold Call)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm outline-none focus:border-accent"
        />
        <textarea
          required
          placeholder="Bangla passage the rep will read aloud…"
          value={passage}
          onChange={(e) => setPassage(e.target.value)}
          rows={3}
          className="px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm outline-none focus:border-accent font-bangla resize-y"
        />
        <div>
          <button
            type="submit"
            disabled={creating}
            className="px-5 py-2.5 rounded-xl bg-accent text-accent-ink font-display font-semibold text-sm disabled:opacity-60"
          >
            {creating ? "Creating…" : "Create topic"}
          </button>
        </div>
        {createError && <div className="text-[13px] text-danger">{createError}</div>}
      </form>

      {error && <div className="text-[13px] text-danger">{error}</div>}

      <div className="flex flex-col gap-3">
        {loading ? (
          <div className="text-center text-foreground-muted py-8">Loading…</div>
        ) : topics.length === 0 ? (
          <div className="text-center text-foreground-muted py-8">No topics yet.</div>
        ) : (
          topics.map((topic) => {
            const isEditing = editingId === topic.id;
            const isPending = pendingActionId === topic.id;
            return (
              <div key={topic.id} className="border border-border rounded-2xl bg-background-elevated p-5">
                {isEditing ? (
                  <div className="flex flex-col gap-3">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="px-3.5 py-2 rounded-lg border border-border bg-background text-foreground text-sm outline-none focus:border-accent font-display font-semibold"
                    />
                    <textarea
                      value={editPassage}
                      onChange={(e) => setEditPassage(e.target.value)}
                      rows={3}
                      className="px-3.5 py-2 rounded-lg border border-border bg-background text-foreground text-sm outline-none focus:border-accent font-bangla resize-y"
                    />
                    <div className="flex gap-2.5">
                      <button
                        type="button"
                        onClick={() => saveEdit(topic.id)}
                        disabled={savingEdit}
                        className="px-4 py-2 rounded-lg bg-accent text-accent-ink text-xs font-semibold disabled:opacity-60"
                      >
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
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2.5 mb-1.5">
                        <div className="font-display font-semibold text-[15px] text-foreground">{topic.name}</div>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            topic.isActive ? "bg-teal-soft text-teal" : "bg-border text-foreground-muted"
                          }`}
                        >
                          {topic.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <div className="text-[13.5px] text-foreground-muted font-bangla">
                        {truncate(topic.passage)}
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => startEdit(topic)}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-semibold border-[1.5px] border-border text-foreground"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => toggleActive(topic)}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-semibold border-[1.5px] border-border text-foreground disabled:opacity-50"
                      >
                        {topic.isActive ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleDelete(topic)}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-semibold border-[1.5px] border-danger text-danger disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
