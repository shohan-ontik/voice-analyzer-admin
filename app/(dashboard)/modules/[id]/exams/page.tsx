"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { AdminModuleDetail } from "../../../../lib/types";
import { SparklesIcon } from "../../../../components/icons";

async function readError(res: Response, fallback: string) {
  const body = await res.json().catch(() => null);
  return body?.error?.message ?? fallback;
}

export default function ManageExamPage() {
  const { id } = useParams<{ id: string }>();

  const [trainingModule, setTrainingModule] = useState<AdminModuleDetail | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [refreshIndex, setRefreshIndex] = useState(0);

  const [scenario, setScenario] = useState("");
  const [passMark, setPassMark] = useState("80");
  const [deadlineDays, setDeadlineDays] = useState("");

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [generating, setGenerating] = useState(false);

  const refresh = useCallback(() => setRefreshIndex((n) => n + 1), []);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/modules/${id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(await readError(res, "Failed to load this module."));
        return res.json() as Promise<AdminModuleDetail>;
      })
      .then((data) => {
        if (cancelled) return;
        setTrainingModule(data);
        setScenario(data.exam?.scenario ?? "");
        setPassMark(data.exam ? String(data.exam.passMark) : "80");
        setDeadlineDays(data.exam?.deadlineDays != null ? String(data.exam.deadlineDays) : "");
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : "Failed to load this module.");
      });
    return () => {
      cancelled = true;
    };
  }, [id, refreshIndex]);

  async function handleGenerate() {
    if (!trainingModule) return;
    setGenerating(true);
    setSaveError(null);
    try {
      const res = await fetch(`/api/modules/${id}/exam/generate-scenario`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: trainingModule.title, description: trainingModule.description }),
      });
      if (!res.ok) throw new Error(await readError(res, "Failed to generate a scenario."));
      const body = await res.json();
      setScenario(body.scenario);
      setSaved(false);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to generate a scenario.");
    } finally {
      setGenerating(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch(`/api/modules/${id}/exam`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenario,
          passMark: Number(passMark) || 80,
          deadlineDays: deadlineDays.trim() === "" ? null : Number(deadlineDays),
        }),
      });
      if (!res.ok) throw new Error(await readError(res, "Failed to save the exam."));
      setSaved(true);
      refresh();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save the exam.");
    } finally {
      setSaving(false);
    }
  }

  if (loadError) {
    return (
      <div className="px-10 py-8 max-w-[800px] w-full mx-auto flex flex-col gap-3">
        <div className="text-[13.5px] text-danger">{loadError}</div>
        <Link href="/modules" className="text-[13px] font-semibold text-accent cursor-pointer">
          Back to Content Management
        </Link>
      </div>
    );
  }

  if (!trainingModule) {
    return <div className="flex-1 flex items-center justify-center text-[13.5px] text-foreground-muted">Loading…</div>;
  }

  return (
    <div className="px-10 py-8 max-w-[800px] w-full mx-auto flex flex-col gap-6">
      <div className="flex items-center gap-1.5 text-[13px] flex-wrap">
        <Link href="/modules" className="font-semibold text-foreground-muted hover:text-foreground cursor-pointer">
          Content Management
        </Link>
        <span className="text-foreground-muted">›</span>
        <Link href={`/modules/${id}`} className="font-semibold text-foreground-muted hover:text-foreground cursor-pointer">
          {trainingModule.title}
        </Link>
        <span className="text-foreground-muted">›</span>
        <span className="font-semibold text-accent">Manage Exam</span>
      </div>

      <div>
        <h1 className="font-display font-bold text-[26px] text-foreground mb-1">Manage Exam</h1>
        <p className="text-[14px] text-foreground-muted">The final assessment trainees take after completing every chapter.</p>
      </div>

      <div className="rounded-2xl border border-border bg-background-elevated p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-[16px] text-foreground">Module Assessment</h2>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent-soft text-accent text-[11px] font-bold">
            <SparklesIcon size={11} />
            AI Enabled
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="exam-pass-mark" className="text-[13px] font-semibold text-foreground-muted">
              Pass Mark (%)
            </label>
            <input
              id="exam-pass-mark"
              type="number"
              min={1}
              max={100}
              value={passMark}
              onChange={(e) => {
                setPassMark(e.target.value);
                setSaved(false);
              }}
              className="px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm outline-none focus:border-accent"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="exam-deadline" className="text-[13px] font-semibold text-foreground-muted">
              Exam Deadline (Days after enrollment)
            </label>
            <input
              id="exam-deadline"
              type="number"
              min={0}
              value={deadlineDays}
              onChange={(e) => {
                setDeadlineDays(e.target.value);
                setSaved(false);
              }}
              className="px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm outline-none focus:border-accent"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="exam-scenario" className="text-[13px] font-semibold text-foreground-muted">
              Scenario Question (Roleplay Prompt)
            </label>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-[12px] font-semibold text-foreground disabled:opacity-50 cursor-pointer"
            >
              <SparklesIcon size={12} />
              {generating ? "Generating…" : "AI Generate Scenario"}
            </button>
          </div>
          <textarea
            id="exam-scenario"
            rows={4}
            value={scenario}
            onChange={(e) => {
              setScenario(e.target.value);
              setSaved(false);
            }}
            className="px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm outline-none focus:border-accent resize-none"
          />
        </div>

        {saveError && <div className="text-[13px] text-danger">{saveError}</div>}

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="self-start px-4 py-2.5 rounded-xl bg-accent text-accent-ink font-display font-semibold text-[13.5px] disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
        >
          {saving ? "Saving…" : saved ? "Saved" : "Save Exam"}
        </button>
      </div>
    </div>
  );
}
