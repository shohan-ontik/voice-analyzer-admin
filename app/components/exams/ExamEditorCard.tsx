"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AdminExam } from "../../lib/types";
import { SparklesIcon } from "../icons";
import { useToast } from "../toast/ToastProvider";

async function readError(res: Response, fallback: string) {
  const body = await res.json().catch(() => null);
  return body?.error?.message ?? fallback;
}

export function ExamEditorCard({ moduleId, exam, index }: { moduleId: string; exam: AdminExam; index: number }) {
  const router = useRouter();
  const toast = useToast();

  const [scenario, setScenario] = useState(exam.scenario);
  const [passMark, setPassMark] = useState(String(exam.passMark));
  const [deadlineDays, setDeadlineDays] = useState(exam.deadlineDays != null ? String(exam.deadlineDays) : "");

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [generating, setGenerating] = useState(false);

  const idPrefix = `exam-${exam.id}`;

  async function handleGenerate() {
    setGenerating(true);
    setSaveError(null);
    try {
      const res = await fetch(`/api/modules/${moduleId}/exam/generate-scenario`, { method: "POST" });
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
      const res = await fetch(`/api/modules/${moduleId}/exams/${exam.id}`, {
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
      toast.success(`Exam ${index + 1} saved successfully.`);
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save the exam.";
      setSaveError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-background-elevated p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display font-bold text-[16px] text-foreground">Exam {index + 1}</h2>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent-soft text-accent text-[11px] font-bold">
          <SparklesIcon size={11} />
          AI Enabled
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${idPrefix}-pass-mark`} className="text-[13px] font-semibold text-foreground-muted">
            Pass Mark (%)
          </label>
          <input
            id={`${idPrefix}-pass-mark`}
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
          <label htmlFor={`${idPrefix}-deadline`} className="text-[13px] font-semibold text-foreground-muted">
            Exam Deadline (Days after enrollment)
          </label>
          <input
            id={`${idPrefix}-deadline`}
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
          <label htmlFor={`${idPrefix}-scenario`} className="text-[13px] font-semibold text-foreground-muted">
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
          id={`${idPrefix}-scenario`}
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
  );
}
