"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { AdminModuleDetail } from "../../../lib/types";
import { FileIcon, HeadphoneIcon, VideoIcon } from "../../../components/icons";

const MATERIAL_ICON = { video: VideoIcon, pdf: FileIcon, audio: HeadphoneIcon } as const;

export default function ModuleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [trainingModule, setTrainingModule] = useState<AdminModuleDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/modules/${id}`)
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) throw new Error(body?.error?.message ?? "Failed to load this module.");
        if (!cancelled) setTrainingModule(body);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load this module.");
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (error) {
    return (
      <div className="flex-1 px-10 py-8 max-w-[900px] w-full mx-auto flex flex-col gap-3">
        <div className="text-[13.5px] text-danger">{error}</div>
        <Link href="/modules" className="text-[13px] font-semibold text-accent">
          Back to Modules & Content
        </Link>
      </div>
    );
  }

  if (!trainingModule) {
    return <div className="flex-1 flex items-center justify-center text-[13.5px] text-foreground-muted">Loading…</div>;
  }

  return (
    <div className="flex-1 px-10 py-8 max-w-[900px] w-full mx-auto flex flex-col gap-6">
      <Link href="/modules" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-foreground-muted hover:text-foreground w-fit">
        Back to Modules & Content
      </Link>

      <div>
        <div className="flex items-center gap-2.5 mb-2">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
              trainingModule.isActive ? "bg-border text-foreground-muted" : "bg-warning-soft text-warning"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {trainingModule.isActive ? "Published" : "Draft"}
          </span>
        </div>
        <h1 className="font-display font-bold text-[26px] text-foreground mb-1.5">{trainingModule.title}</h1>
        <p className="text-[14px] text-foreground-muted">{trainingModule.description}</p>
      </div>

      <div className="rounded-2xl border border-border bg-background-elevated p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-[16px] text-foreground">
            Chapters ({trainingModule.chapters.length})
          </h2>
          <button
            type="button"
            disabled
            title="Chapter authoring is coming soon"
            className="px-3.5 py-2 rounded-lg border border-border text-foreground-muted text-[12.5px] font-semibold opacity-50 cursor-not-allowed"
          >
            Add Chapter
          </button>
        </div>

        {trainingModule.chapters.length === 0 ? (
          <p className="text-[13.5px] text-foreground-muted">No chapters yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {trainingModule.chapters.map((chapter, i) => (
              <div key={chapter.id} className="rounded-xl border border-border p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[12px] font-bold text-accent">Chapter {i + 1}</span>
                </div>
                <div className="font-display font-semibold text-[14.5px] text-foreground mb-1">{chapter.title}</div>
                <p className="text-[13px] text-foreground-muted leading-relaxed mb-2.5">{chapter.description}</p>
                <div className="flex items-center gap-3 flex-wrap">
                  {chapter.materials.map((material) => {
                    const Icon = MATERIAL_ICON[material.type];
                    return (
                      <span
                        key={material.id}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background border border-border text-[11.5px] text-foreground-muted"
                      >
                        <Icon size={12} />
                        {material.title}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div id="exam" className="rounded-2xl border border-border bg-background-elevated p-6 flex flex-col gap-4 scroll-mt-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-[16px] text-foreground">Exam</h2>
          <button
            type="button"
            disabled
            title="Exam authoring is coming soon"
            className="px-3.5 py-2 rounded-lg border border-border text-foreground-muted text-[12.5px] font-semibold opacity-50 cursor-not-allowed"
          >
            {trainingModule.exam ? "Edit Exam" : "Add Exam"}
          </button>
        </div>

        {trainingModule.exam ? (
          <div className="rounded-xl border border-border p-4 flex flex-col gap-2">
            <div className="font-display font-semibold text-[14.5px] text-foreground">{trainingModule.exam.title}</div>
            <p className="text-[13px] text-foreground-muted leading-relaxed">{trainingModule.exam.scenario}</p>
            <div className="text-[12.5px] text-foreground-muted">
              Pass mark: <span className="font-semibold text-foreground">{trainingModule.exam.passMark}%</span>
            </div>
          </div>
        ) : (
          <p className="text-[13.5px] text-foreground-muted">
            No exam yet — a module needs one before it can be published.
          </p>
        )}
      </div>

      <p className="text-[12.5px] text-foreground-muted">
        Chapter, material, and exam authoring is a separate feature that isn&apos;t built yet — this is a read-only
        preview.
      </p>
    </div>
  );
}
