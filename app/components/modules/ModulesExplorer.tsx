"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AdminModuleSummary } from "../../lib/types";
import { AlertDialog } from "../AlertDialog";
import { ModulesGrid } from "./ModulesGrid";
import { ModulesPagination } from "./ModulesPagination";
import { ModulesToolbar, type FilterKey } from "./ModulesToolbar";

export function ModulesExplorer({
  items,
  total,
  page,
  filter,
  pageSize,
}: {
  items: AdminModuleSummary[];
  total: number;
  page: number;
  filter: FilterKey;
  pageSize: number;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Publish failures (e.g. the one-module-per-month limit) are shown in a popup.
  const [publishError, setPublishError] = useState<string | null>(null);

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
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update module.";
      if (m.isActive) {
        setError(message);
      } else {
        setPublishError(message);
      }
    } finally {
      setPendingId(null);
    }
  }

  // The filter lives in the URL and is applied by the API; switching it
  // starts over from the first page.
  function handleFilterChange(next: FilterKey) {
    router.push(next === "all" ? "/modules" : `/modules?filter=${next}`);
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // The modules API doesn't support search, so the query only narrows the
  // modules already loaded for the current page — the range/total below
  // reflect what's actually on screen whenever a search is active.
  const isSearching = query.trim() !== "";
  const visibleModules = isSearching
    ? items.filter((m) => m.title.toLowerCase().includes(query.trim().toLowerCase()))
    : items;
  const rangeTotal = isSearching ? visibleModules.length : total;
  const rangeStart = isSearching ? (rangeTotal === 0 ? 0 : 1) : total === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = isSearching ? rangeTotal : Math.min(page * pageSize, total);

  return (
    <>
      <ModulesToolbar query={query} onQueryChange={setQuery} filter={filter} onFilterChange={handleFilterChange} />

      {error && <div className="text-[13px] text-danger">{error}</div>}

      <ModulesGrid modules={visibleModules} pendingId={pendingId} onTogglePublish={handleTogglePublish} />

      {total > 0 && (
        <ModulesPagination
          page={page}
          filter={filter}
          totalPages={totalPages}
          rangeStart={rangeStart}
          rangeEnd={rangeEnd}
          rangeTotal={rangeTotal}
        />
      )}

      {publishError && (
        <AlertDialog
          title="Couldn't publish module"
          message={publishError}
          onClose={() => setPublishError(null)}
        />
      )}
    </>
  );
}
