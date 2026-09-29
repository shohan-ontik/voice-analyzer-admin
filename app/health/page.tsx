import { HealthRefreshButton } from "../components/health/HealthRefreshButton";
import {
  ActivityIcon,
  BanIcon,
  CheckCircleIcon,
  ClockIcon,
} from "../components/icons";
import { getHealth } from "../lib/apiClient";
import type { HealthCheckResult } from "../lib/types";

type Tone = "success" | "danger" | "warning";

const TONE_CLASSES: Record<Tone, { soft: string; text: string }> = {
  success: { soft: "bg-success-soft", text: "text-success" },
  danger: { soft: "bg-danger-soft", text: "text-danger" },
  warning: { soft: "bg-warning-soft", text: "text-warning" },
};

function overallStatus(health: HealthCheckResult): {
  tone: Tone;
  title: string;
  detail: string;
} {
  if (!health.reachable) {
    return {
      tone: "danger",
      title: "API unreachable",
      detail:
        health.error ??
        "The admin console could not connect to the API server.",
    };
  }
  if (health.ok) {
    return {
      tone: "success",
      title: "All systems operational",
      detail: "The API and database are responding normally.",
    };
  }
  if (health.database === "down") {
    return {
      tone: "warning",
      title: "Database unavailable",
      detail: "The API is running but cannot reach the database.",
    };
  }
  return {
    tone: "danger",
    title: "API unhealthy",
    detail: `The health check returned HTTP ${health.httpStatus}.`,
  };
}

function ComponentRow({
  label,
  tone,
  value,
}: {
  label: string;
  tone: Tone;
  value: string;
}) {
  const Icon = tone === "success" ? CheckCircleIcon : BanIcon;
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-border/70 last:border-b-0">
      <span className="text-[14px] font-semibold text-foreground">{label}</span>
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12.5px] font-semibold ${TONE_CLASSES[tone].soft} ${TONE_CLASSES[tone].text}`}
      >
        <Icon size={13} />
        {value}
      </span>
    </div>
  );
}

export default async function HealthPage() {
  const health = await getHealth();
  const status = overallStatus(health);
  const tone = TONE_CLASSES[status.tone];

  const databaseTone: Tone =
    health.database === "up"
      ? "success"
      : health.database === "down"
        ? "danger"
        : "warning";

  return (
    <main className="flex-1 bg-background min-h-screen">
      <div className="px-10 py-8 max-w-[1000px] w-full mx-auto flex flex-col gap-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-display font-bold text-[28px] text-foreground mb-1">
              System Health
            </h1>
            <p className="text-[14px] text-foreground-muted">
              Live status of the API server and its database.
            </p>
          </div>
          <HealthRefreshButton />
        </div>

        <div
          className={`rounded-2xl border border-border p-6 flex items-center gap-4 ${tone.soft}`}
        >
          <div
            className={`w-12 h-12 rounded-full bg-background-elevated flex items-center justify-center shrink-0 ${tone.text}`}
          >
            <ActivityIcon size={22} />
          </div>
          <div>
            <div className={`font-display font-bold text-[20px] ${tone.text}`}>
              {status.title}
            </div>
            <div className="text-[13.5px] text-foreground-muted">
              {status.detail}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-5 items-start">
          <div className="rounded-2xl border border-border bg-background-elevated px-6 py-2">
            <ComponentRow
              label="API Server"
              tone={health.reachable ? "success" : "danger"}
              value={health.reachable ? "Reachable" : "Unreachable"}
            />
            <ComponentRow
              label="Database"
              tone={databaseTone}
              value={
                health.database === "up"
                  ? "Up"
                  : health.database === "down"
                    ? "Down"
                    : "Unknown"
              }
            />
          </div>

          <div className="rounded-2xl border border-border bg-background-elevated p-6 flex flex-col gap-4">
            <div>
              <div className="text-[12.5px] text-foreground-muted">
                Response Time
              </div>
              <div className="font-display font-bold text-[20px] text-foreground">
                {health.latencyMs} ms
              </div>
            </div>
            <div>
              <div className="text-[12.5px] text-foreground-muted">
                HTTP Status
              </div>
              <div className="font-display font-bold text-[20px] text-foreground">
                {health.httpStatus ?? "—"}
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[12.5px] text-foreground-muted">
              <ClockIcon size={13} />
              Checked at{" "}
              {new Date(health.checkedAt).toLocaleString("en-US", {
                timeZone: "UTC",
                timeZoneName: "short",
              })}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
