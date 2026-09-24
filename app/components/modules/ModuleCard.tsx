"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { AdminModuleSummary } from "../../lib/types";
import { ClockIcon, MoreVerticalIcon } from "../icons";
import { useClickOutside } from "../../lib/useClickOutside";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function ModuleCard({
  module: m,
  onTogglePublish,
  pending,
}: {
  module: AdminModuleSummary;
  onTogglePublish: (m: AdminModuleSummary) => void;
  pending: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useClickOutside(menuRef, () => setMenuOpen(false));

  return (
    <div
      className={`rounded-2xl border border-border bg-background-elevated border-l-4 flex flex-col ${
        m.isActive ? "border-l-accent" : "border-l-warning"
      }`}
    >
      <div className="p-5 flex flex-col gap-4 flex-1">
        <div className="flex items-start justify-between gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
              m.isActive ? "bg-border text-foreground-muted" : "bg-warning-soft text-warning"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {m.isActive ? "Published" : "Draft"}
          </span>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="text-foreground-muted hover:text-foreground p-1 -m-1 cursor-pointer"
              aria-label="Module actions"
            >
              <MoreVerticalIcon size={18} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-7 w-44 rounded-xl border border-border bg-background-elevated shadow-lg py-1.5 z-10">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => {
                    setMenuOpen(false);
                    onTogglePublish(m);
                  }}
                  className="w-full text-left px-3.5 py-2 text-[13px] font-semibold text-foreground-muted hover:text-foreground disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                >
                  {m.isActive ? "Unpublish" : "Publish"}
                </button>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="font-display font-bold text-[19px] text-foreground mb-1">{m.title}</div>
          <p className="text-[13.5px] text-foreground-muted leading-relaxed line-clamp-2">{m.description}</p>
        </div>

        <div className="h-px bg-border" />

        <div className="flex items-center gap-8">
          <div>
            <div className="font-display font-bold text-[16px] text-foreground">{m.chapterCount}</div>
            <div className="text-[12px] text-foreground-muted">Chapters</div>
          </div>
          <div>
            <div className="font-display font-bold text-[16px] text-foreground">{m.examCount}</div>
            <div className="text-[12px] text-foreground-muted">{m.examCount === 1 ? "Exam" : "Exams"}</div>
          </div>
        </div>

        <div className="h-px bg-border" />

        <div className="flex items-center gap-1.5 text-[12.5px] text-foreground-muted">
          <ClockIcon size={13} />
          {formatDate(m.updatedAt)}
        </div>

        <div className="flex items-center gap-3 mt-auto pt-1">
          <Link
            href={`/modules/${m.id}`}
            className="flex-1 text-center px-4 py-2.5 rounded-lg border border-border bg-background text-foreground font-display font-semibold text-[13px]"
          >
            Edit Content
          </Link>
          <Link
            href={`/modules/${m.id}/exams`}
            className="flex-1 text-center px-4 py-2.5 rounded-lg border border-border bg-background text-foreground font-display font-semibold text-[13px]"
          >
            Manage Exams
          </Link>
        </div>
      </div>
    </div>
  );
}
