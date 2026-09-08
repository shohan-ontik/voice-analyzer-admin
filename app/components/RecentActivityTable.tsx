import type { RecentActivityRow } from "../lib/dashboardMockData";

const AVATAR_TONES = ["bg-accent-soft text-accent", "bg-warning-soft text-warning", "bg-teal-soft text-teal"];

function scoreClass(score: number) {
  if (score >= 80) return "text-foreground";
  if (score >= 70) return "text-warning";
  return "text-danger";
}

export function RecentActivityTable({ rows }: { rows: RecentActivityRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-border">
            <th className="pb-3 text-[11px] font-bold uppercase tracking-wide text-foreground-muted">User Name</th>
            <th className="pb-3 text-[11px] font-bold uppercase tracking-wide text-foreground-muted">Module</th>
            <th className="pb-3 text-[11px] font-bold uppercase tracking-wide text-foreground-muted text-right">
              Score
            </th>
            <th className="pb-3 text-[11px] font-bold uppercase tracking-wide text-foreground-muted text-right">
              Date
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.id} className="border-b border-border last:border-0">
              <td className="py-3.5 pr-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-display font-bold text-[12px] shrink-0 ${AVATAR_TONES[i % AVATAR_TONES.length]}`}
                  >
                    {row.initials}
                  </div>
                  <span className="text-[13.5px] font-semibold text-foreground whitespace-nowrap">
                    {row.userName}
                  </span>
                </div>
              </td>
              <td className="py-3.5 pr-4 text-[13.5px] text-foreground-muted">{row.module}</td>
              <td className={`py-3.5 pr-4 text-[13.5px] font-bold text-right ${scoreClass(row.score)}`}>
                {row.score}%
              </td>
              <td className="py-3.5 text-[13px] text-foreground-muted text-right whitespace-nowrap">{row.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
