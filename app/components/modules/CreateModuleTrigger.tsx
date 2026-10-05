"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PlusIcon } from "../icons";
import { Spinner } from "../Spinner";
import { useToast } from "../toast/ToastProvider";
import { readError } from "./readError";

const DEFAULT_MODULE_TITLE = "Untitled Module";

const DEFAULT_CLASS_NAME =
  "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-accent-ink font-display font-semibold text-[13.5px] shrink-0 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed";

type CreateModuleTriggerProps = {
  label?: string;
  className?: string;
};

export function CreateModuleTrigger({
  label = "Create New Module",
  className = DEFAULT_CLASS_NAME,
}: CreateModuleTriggerProps) {
  const router = useRouter();
  const toast = useToast();
  const [creating, setCreating] = useState(false);

  async function handleCreate() {
    setCreating(true);
    try {
      const res = await fetch("/api/modules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: DEFAULT_MODULE_TITLE }),
      });
      if (!res.ok) throw new Error(await readError(res, "Failed to create module."));
      const created = (await res.json()) as { id: string };
      router.push(`/modules/${created.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create module.");
      setCreating(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCreate}
      disabled={creating}
      className={className}
    >
      {creating ? <Spinner /> : <PlusIcon size={16} />}
      {creating ? "Creating…" : label}
    </button>
  );
}
