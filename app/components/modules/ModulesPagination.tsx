import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "../icons";

function getPageNumbers(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set<number>([1, 2, 3, total]);
  if (current > 1 && current < total) pages.add(current);
  const sorted = [...pages].sort((a, b) => a - b);
  const result: (number | "ellipsis")[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (p - prev > 1) result.push("ellipsis");
    result.push(p);
    prev = p;
  }
  return result;
}

function pageHref(p: number) {
  return p <= 1 ? "/modules" : `/modules?page=${p}`;
}

export function ModulesPagination({
  page,
  totalPages,
  rangeStart,
  rangeEnd,
  rangeTotal,
}: {
  page: number;
  totalPages: number;
  rangeStart: number;
  rangeEnd: number;
  rangeTotal: number;
}) {
  return (
    <div className="px-5 py-4 flex items-center justify-between gap-4 flex-wrap rounded-2xl border border-border bg-background-elevated">
      <span className="text-[13px] text-foreground-muted">
        {`Showing ${rangeStart}-${rangeEnd} of ${rangeTotal.toLocaleString()}`}
      </span>

      <div className="flex items-center gap-1.5">
        {page > 1 ? (
          <Link
            href={pageHref(page - 1)}
            className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-foreground-muted"
            aria-label="Previous page"
          >
            <ChevronLeftIcon size={15} />
          </Link>
        ) : (
          <span
            aria-hidden
            className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-foreground-muted opacity-40"
          >
            <ChevronLeftIcon size={15} />
          </span>
        )}

        {getPageNumbers(page, totalPages).map((p, i) =>
          p === "ellipsis" ? (
            <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-foreground-muted">
              …
            </span>
          ) : (
            <Link
              key={p}
              href={pageHref(p)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-[13px] font-semibold ${
                p === page ? "bg-accent text-accent-ink" : "text-foreground-muted hover:bg-background"
              }`}
            >
              {p}
            </Link>
          )
        )}

        {page < totalPages ? (
          <Link
            href={pageHref(page + 1)}
            className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-foreground-muted"
            aria-label="Next page"
          >
            <ChevronRightIcon size={15} />
          </Link>
        ) : (
          <span
            aria-hidden
            className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-foreground-muted opacity-40"
          >
            <ChevronRightIcon size={15} />
          </span>
        )}
      </div>
    </div>
  );
}
