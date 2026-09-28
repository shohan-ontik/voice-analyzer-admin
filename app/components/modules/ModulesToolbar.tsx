import type { Dispatch, SetStateAction } from "react";
import { SearchIcon } from "../icons";

export type FilterKey = "all" | "published" | "drafts";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "published", label: "Published" },
  { key: "drafts", label: "Drafts" },
];

export function ModulesToolbar({
  query,
  onQueryChange,
  filter,
  onFilterChange,
}: {
  query: string;
  onQueryChange: Dispatch<SetStateAction<string>>;
  filter: FilterKey;
  onFilterChange: Dispatch<SetStateAction<FilterKey>>;
}) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="relative flex-1 min-w-[240px] max-w-sm">
        <SearchIcon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground-muted" />
        <input
          type="search"
          placeholder="Search modules..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-background-elevated text-foreground text-sm outline-none focus:border-accent"
        />
      </div>

      <div className="flex items-center gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => onFilterChange(f.key)}
            className={`px-4 py-2 rounded-full text-[13px] font-semibold border transition-colors cursor-pointer ${
              filter === f.key
                ? "bg-accent-soft text-accent border-accent/30"
                : "bg-background-elevated text-foreground-muted border-border hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}
