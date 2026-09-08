"use client";

import { useEffect, useState } from "react";
import { RecentActivityTable } from "../components/RecentActivityTable";
import { StatCard } from "../components/StatCard";
import {
  BarChartIcon,
  CalendarIcon,
  ChevronDownIcon,
  ClipboardClockIcon,
  ClipboardIcon,
  PlusIcon,
  RefreshIcon,
  TrendingUpIcon,
  UploadCloudIcon,
  UsersIcon,
} from "../components/icons";
import { dashboardPlaceholders, recentActivity } from "../lib/dashboardMockData";
import type { AdminStatsSummary } from "../lib/types";

export default function DashboardPage() {
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
    <div className="px-10 py-8 max-w-[1240px] w-full mx-auto flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display font-bold text-[28px] text-foreground mb-1">Admin Overview</h1>
          <p className="text-[14px] text-foreground-muted">Monitor high-level system performance and user activity.</p>
        </div>

        <button
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-background-elevated font-display font-semibold text-[13.5px] text-foreground shrink-0"
        >
          <CalendarIcon size={15} />
          Last 30 Days
          <ChevronDownIcon size={15} />
        </button>
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-5 items-start">
        <div className="rounded-2xl border border-border bg-background-elevated p-6">
          <h2 className="font-display font-bold text-[16px] text-foreground mb-4">Training Activity</h2>
          <div className="h-[280px] rounded-xl border border-border/70 flex flex-col items-center justify-center gap-2 text-foreground-muted">
            <TrendingUpIcon size={24} />
            <span className="text-[13px] font-medium">Line Chart Visualization Placeholder</span>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-background-elevated p-6 flex flex-col gap-4">
          <h2 className="font-display font-bold text-[16px] text-foreground">System Status</h2>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-full bg-accent-soft text-accent flex items-center justify-center shrink-0">
              <UploadCloudIcon size={19} />
            </div>
            <div>
              <div className="text-[12.5px] text-foreground-muted">Modules Published</div>
              <div className="font-display font-bold text-[20px] text-foreground">
                {dashboardPlaceholders.modulesPublished}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-full bg-warning-soft text-warning flex items-center justify-center shrink-0">
              <ClipboardClockIcon size={19} />
            </div>
            <div>
              <div className="text-[12.5px] text-foreground-muted">Pending Exams</div>
              <div className="font-display font-bold text-[20px] text-foreground">
                {dashboardPlaceholders.pendingExams}
              </div>
            </div>
          </div>

          <button
            type="button"
            className="mt-1 inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-accent text-accent-ink font-display font-semibold text-sm"
          >
            <PlusIcon size={16} />
            Create Module
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-background-elevated p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-[16px] text-foreground">Recent Activity</h2>
          <button type="button" className="text-[13px] font-semibold text-accent">
            View All
          </button>
        </div>
        <RecentActivityTable rows={recentActivity} />
      </div>
    </div>
  );
}
