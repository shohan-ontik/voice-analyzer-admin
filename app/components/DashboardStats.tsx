"use client";

import { useEffect, useState } from "react";
import type { AdminStatsSummary } from "../lib/types";

const CARDS: { key: keyof AdminStatsSummary; label: string; accent?: boolean }[] = [
  { key: "totalUsers", label: "Total users" },
  { key: "bannedUsers", label: "Banned users", accent: true },
  { key: "totalPracticeSessions", label: "Practice sessions (all time)" },
  { key: "sessionsThisWeek", label: "Sessions this week" },
];

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

  if (error) {
    return <div className="text-[13px] text-danger">{error}</div>;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
      {CARDS.map((card) => (
        <div key={card.key} className="p-[22px] rounded-2xl bg-background-elevated border border-border">
          <div className="text-xs font-semibold text-foreground-muted mb-2.5">{card.label}</div>
          <div
            className={`font-display font-bold text-[28px] ${card.accent ? "text-danger" : "text-foreground"}`}
          >
            {stats ? stats[card.key] : "—"}
          </div>
        </div>
      ))}
    </div>
  );
}
