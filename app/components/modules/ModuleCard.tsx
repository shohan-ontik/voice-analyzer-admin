"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { AdminModuleSummary } from "../../lib/types";
import { ClipboardIcon, ClockIcon, FileIcon, MoreVerticalIcon } from "../icons";
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
      className={`group rounded-2xl border border-border bg-background-elevated border-l-4 transition-shadow hover:shadow-md ${
        m.isActive ? "border-l-accent" : "border-l-warning"
      }`}
    >
      <div className="p-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
        <div
          className={`hidden sm:flex w-14 h-14 shrink-0 items-center justify-center rounded-xl ${
            m.isActive ? "bg-accent-soft text-accent" : "bg-warning-soft text-warning"
          }`}
        >
          <FileIcon size={24} />
        </div>

        <div className="flex-1 min-w-0 flex flex-col gap-2.5">
          <div className="flex items-center gap-3">
            <Link
              href={`/modules/${m.id}`}
              className="font-display font-bold text-[18px] text-foreground truncate hover:text-accent cursor-pointer"
              title={m.title}
            >
              {m.title}
            </Link>
            <span
              className={`inline-flex shrink-0 items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                m.isActive ? "bg-success-soft text-success" : "bg-warning-soft text-warning"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {m.isActive ? "Published" : "Draft"}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[13px] text-foreground-muted">
            <span className="inline-flex items-center gap-1.5">
              <FileIcon size={14} />
              <span className="font-semibold text-foreground">{m.chapterCount}</span>
              {m.chapterCount === 1 ? "Chapter" : "Chapters"}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ClipboardIcon size={14} />
              <span className="font-semibold text-foreground">{m.examCount}</span>
              {m.examCount === 1 ? "Exam" : "Exams"}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ClockIcon size={14} />
              Updated {formatDate(m.updatedAt)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:shrink-0">
          <Link
            href={`/modules/${m.id}`}
            className="flex-1 sm:flex-none text-center px-4 py-2.5 rounded-lg bg-accent text-accent-ink font-display font-semibold text-[13px] hover:opacity-90 cursor-pointer"
          >
            Edit Content
          </Link>
          <Link
            href={`/modules/${m.id}/exams`}
            className="flex-1 sm:flex-none text-center px-4 py-2.5 rounded-lg border border-border bg-background text-foreground font-display font-semibold text-[13px] hover:bg-accent-soft cursor-pointer"
          >
            Manage Exams
          </Link>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="text-foreground-muted hover:text-foreground hover:bg-background rounded-lg p-2 cursor-pointer"
              aria-label="Module actions"
              aria-expanded={menuOpen}
            >
              <MoreVerticalIcon size={18} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-10 w-44 rounded-xl border border-border bg-background-elevated shadow-lg py-1.5 z-10">
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
      </div>
    </div>
  );
}
