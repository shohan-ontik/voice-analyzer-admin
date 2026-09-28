import type { AdminModuleSummary } from "../../lib/types";
import { ModuleCard } from "./ModuleCard";

export function ModulesGrid({
  modules,
  pendingId,
  onTogglePublish,
}: {
  modules: AdminModuleSummary[];
  pendingId: string | null;
  onTogglePublish: (m: AdminModuleSummary) => void;
}) {
  if (modules.length === 0) {
    return <div className="text-center text-[13.5px] text-foreground-muted py-16">No modules found.</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {modules.map((m) => (
        <ModuleCard key={m.id} module={m} onTogglePublish={onTogglePublish} pending={pendingId === m.id} />
      ))}
    </div>
  );
}
