"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AdminModuleSummary } from "../../lib/types";
import { ModulesGrid } from "./ModulesGrid";
import { ModulesPagination } from "./ModulesPagination";
import { ModulesToolbar, type FilterKey } from "./ModulesToolbar";

export function ModulesExplorer({
  items,
  total,
  page,
  pageSize,
}: {
  items: AdminModuleSummary[];
  total: number;
  page: number;
  pageSize: number;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      setError(err instanceof Error ? err.message : "Failed to update module.");
    } finally {
      setPendingId(null);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // The modules API doesn't support search or publish-status filtering
  // server-side, so both only narrow the modules already loaded for the
  // current page — the range/total below reflect what's actually on screen
  // whenever a filter is active.
  const isFiltered = filter !== "all" || query.trim() !== "";
  const visibleModules = items.filter((m) => {
    const matchesFilter = filter === "all" || (filter === "published" ? m.isActive : !m.isActive);
    const matchesQuery = query.trim() === "" || m.title.toLowerCase().includes(query.trim().toLowerCase());
    return matchesFilter && matchesQuery;
  });
  const rangeTotal = isFiltered ? visibleModules.length : total;
  const rangeStart = isFiltered ? (rangeTotal === 0 ? 0 : 1) : total === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = isFiltered ? rangeTotal : Math.min(page * pageSize, total);

  return (
    <>
      <ModulesToolbar query={query} onQueryChange={setQuery} filter={filter} onFilterChange={setFilter} />

      {error && <div className="text-[13px] text-danger">{error}</div>}

      <ModulesGrid modules={visibleModules} pendingId={pendingId} onTogglePublish={handleTogglePublish} />

      {total > 0 && (
        <ModulesPagination
          page={page}
          totalPages={totalPages}
          rangeStart={rangeStart}
          rangeEnd={rangeEnd}
          rangeTotal={rangeTotal}
        />
      )}
    </>
  );
}
