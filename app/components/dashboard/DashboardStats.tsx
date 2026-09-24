"use client";

import { useEffect, useState } from "react";
import { StatCard } from "../StatCard";
import { BarChartIcon, ClipboardIcon, RefreshIcon, UsersIcon } from "../icons";
import { dashboardPlaceholders } from "../../lib/dashboardMockData";
import type { AdminStatsSummary } from "../../lib/types";

export function DashboardStats() {
  const [stats, setStats] = useState<AdminStatsSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/stats")
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) throw new Error(body?.error?.message ?? "Failed to load stats.");
        if (!cancelled) setStats(body);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load stats.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      {error && <div className="text-[13px] text-danger">{error}</div>}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          label="Total Users"
          value={stats ? stats.totalUsers.toLocaleString() : "—"}
          Icon={UsersIcon}
          iconWrapClass="bg-accent-soft text-accent"
          trend={dashboardPlaceholders.totalUsersTrend}
        />
        <StatCard
          label="Practice Sessions"
          value={stats ? stats.totalPracticeSessions.toLocaleString() : "—"}
          Icon={RefreshIcon}
          iconWrapClass="bg-accent-soft text-accent"
          trend={dashboardPlaceholders.practiceSessionsTrend}
        />
        <StatCard
          label="Exams Taken"
          value={dashboardPlaceholders.examsTaken.toLocaleString()}
          Icon={ClipboardIcon}
          iconWrapClass="bg-danger-soft text-danger"
          trend={dashboardPlaceholders.examsTakenTrend}
        />
        <StatCard
          label="Avg. Proficiency"
          value={`${dashboardPlaceholders.avgProficiency}%`}
          Icon={BarChartIcon}
          iconWrapClass="bg-accent-soft text-accent"
          trend={dashboardPlaceholders.avgProficiencyTrend}
        />
      </div>
    </>
  );
}
