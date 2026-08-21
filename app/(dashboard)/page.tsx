import { DashboardStats } from "../components/DashboardStats";

export default function DashboardPage() {
  return (
    <div className="px-16 py-10 max-w-[1000px] w-full mx-auto flex flex-col gap-8">
      <div>
        <h1 className="font-display font-bold text-[26px] text-foreground mb-1">Dashboard</h1>
        <p className="text-[14px] text-foreground-muted">Overview of accounts and practice activity.</p>
      </div>
      <DashboardStats />
    </div>
  );
}
