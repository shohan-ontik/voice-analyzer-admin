"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshIcon } from "../icons";
import { Spinner } from "../Spinner";

export function HealthRefreshButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() => startTransition(() => router.refresh())}
      disabled={isPending}
      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-background-elevated font-display font-semibold text-[13.5px] text-foreground shrink-0 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isPending ? <Spinner /> : <RefreshIcon size={15} />}
      {isPending ? "Checking…" : "Re-check"}
    </button>
  );
}
