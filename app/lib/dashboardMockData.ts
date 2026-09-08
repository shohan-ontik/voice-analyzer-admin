// Static placeholder data for pieces of the Admin Overview dashboard that
// have no backing endpoint yet (exam counts, proficiency scoring, a
// modules/exams pipeline, month-over-month trend deltas, and a joined
// per-user recent-activity feed). Stands in for that future analytics API —
// no network calls here. Real numbers (total users, practice sessions) are
// fetched separately from GET /api/stats and merged in on the page.

export type TrendDirection = "up" | "down";

export type RecentActivityRow = {
  id: string;
  userName: string;
  initials: string;
  module: string;
  score: number;
  date: string;
};

export const dashboardPlaceholders = {
  examsTaken: 950,
  examsTakenTrend: { direction: "down" as TrendDirection, label: "-2% this month" },
  avgProficiency: 78,
  avgProficiencyTrend: { direction: "up" as TrendDirection, label: "+3% this month" },
  totalUsersTrend: { direction: "up" as TrendDirection, label: "+12% this month" },
  practiceSessionsTrend: { direction: "up" as TrendDirection, label: "+5% this month" },
  modulesPublished: 12,
  pendingExams: 4,
};

export const recentActivity: RecentActivityRow[] = [
  { id: "1", userName: "John Doe", initials: "JD", module: "Objection Handling Advanced", score: 92, date: "Oct 24, 2023" },
  { id: "2", userName: "Alice Smith", initials: "AS", module: "Cold Calling Basics", score: 85, date: "Oct 24, 2023" },
  { id: "3", userName: "Bob Williams", initials: "BW", module: "Closing Techniques", score: 64, date: "Oct 23, 2023" },
  { id: "4", userName: "Eva Jones", initials: "EJ", module: "Product Knowledge Q3", score: 98, date: "Oct 23, 2023" },
  { id: "5", userName: "Mike Brown", initials: "MB", module: "Objection Handling Advanced", score: 75, date: "Oct 22, 2023" },
];
