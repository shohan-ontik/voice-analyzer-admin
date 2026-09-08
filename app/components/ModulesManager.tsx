"use client";

import { useCallback, useEffect, useState } from "react";
import type { AdminModuleSummary } from "../lib/types";
import { CreateModuleModal } from "./CreateModuleModal";
import { ModuleCard } from "./ModuleCard";
import { PlusIcon, SearchIcon } from "./icons";

type FilterKey = "all" | "published" | "drafts";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "published", label: "Published" },
  { key: "drafts", label: "Drafts" },
];

export function ModulesManager() {
  const [modules, setModules] = useState<AdminModuleSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  // Bumping this re-runs the fetch effect below without a separate
  // effect-triggered function call (see the react-hooks/set-state-in-effect
  // rule) — used to refresh the list after creating or publishing a module.
  const [refreshIndex, setRefreshIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/modules")
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) throw new Error(body?.error?.message ?? "Failed to load modules.");
        if (!cancelled) {
          setModules(body.items);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load modules.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [refreshIndex]);

  const loadModules = useCallback(() => setRefreshIndex((n) => n + 1), []);

  async function handleTogglePublish(m: AdminModuleSummary) {
    setPendingId(m.id);
    setError(null);
    try {
      const res = await fetch(`/api/modules/${m.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !m.isActive }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error?.message ?? "Failed to update module.");
      setModules((prev) => prev.map((mod) => (mod.id === m.id ? { ...mod, isActive: body.isActive } : mod)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update module.");
    } finally {
      setPendingId(null);
    }
  }

  const filteredModules = modules.filter((m) => {
    const matchesFilter = filter === "all" || (filter === "published" ? m.isActive : !m.isActive);
    const matchesQuery = query.trim() === "" || m.title.toLowerCase().includes(query.trim().toLowerCase());
    return matchesFilter && matchesQuery;
  });

  return (
    <div className="flex-1 px-10 py-8 max-w-[1240px] w-full mx-auto flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display font-bold text-[28px] text-foreground mb-1">Modules & Content</h1>
          <p className="text-[14px] text-foreground-muted">Manage training curriculum, exams, and settings.</p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-accent-ink font-display font-semibold text-[13.5px] shrink-0"
        >
          <PlusIcon size={16} />
          Create New Module
        </button>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[240px] max-w-sm">
          <SearchIcon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground-muted" />
          <input
            type="search"
            placeholder="Search modules..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-background-elevated text-foreground text-sm outline-none focus:border-accent"
          />
        </div>

        <div className="flex items-center gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-full text-[13px] font-semibold border transition-colors ${
                filter === f.key
                  ? "bg-accent-soft text-accent border-accent/30"
                  : "bg-background-elevated text-foreground-muted border-border hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="text-[13px] text-danger">{error}</div>}

      {loading ? (
        <div className="text-center text-[13.5px] text-foreground-muted py-16">Loading…</div>
      ) : filteredModules.length === 0 ? (
        <div className="text-center text-[13.5px] text-foreground-muted py-16">No modules found.</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredModules.map((m) => (
            <ModuleCard key={m.id} module={m} onTogglePublish={handleTogglePublish} pending={pendingId === m.id} />
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateModuleModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false);
            loadModules();
          }}
        />
      )}
    </div>
  );
}
