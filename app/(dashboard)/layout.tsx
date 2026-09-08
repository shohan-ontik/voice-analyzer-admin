import type { ReactNode } from "react";
import { Sidebar } from "../components/Sidebar";
import { TopBar } from "../components/TopBar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex-1 flex bg-background min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
