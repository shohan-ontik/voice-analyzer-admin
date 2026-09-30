import { DashboardStats } from "../components/dashboard/DashboardStats";
import {
  ClipboardClockIcon,
  PlusIcon,
  UploadCloudIcon,
} from "../components/icons";
import { RecentActivityTable } from "../components/RecentActivityTable";
import {
  dashboardPlaceholders,
  recentActivity,
} from "../lib/dashboardMockData";

export default function DashboardPage() {
  return (
    <div className="px-10 py-8 max-w-[1240px] w-full mx-auto flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display font-bold text-[28px] text-foreground mb-1">
            Admin Overview
          </h1>
          <p className="text-[14px] text-foreground-muted">
            Monitor high-level system performance and user activity.
          </p>
        </div>
      </div>

      <DashboardStats />

      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-5 items-start">
        <div className="rounded-2xl border border-border bg-background-elevated p-6 flex flex-col gap-4">
          <h2 className="font-display font-bold text-[16px] text-foreground">
            System Status
          </h2>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-full bg-accent-soft text-accent flex items-center justify-center shrink-0">
              <UploadCloudIcon size={19} />
            </div>
            <div>
              <div className="text-[12.5px] text-foreground-muted">
                Modules Published
              </div>
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
              <div className="text-[12.5px] text-foreground-muted">
                Pending Exams
              </div>
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
          <h2 className="font-display font-bold text-[16px] text-foreground">
            Recent Activity
          </h2>
          <button
            type="button"
            className="text-[13px] font-semibold text-accent"
          >
            View All
          </button>
        </div>
        <RecentActivityTable rows={recentActivity} />
      </div>
    </div>
  );
}
