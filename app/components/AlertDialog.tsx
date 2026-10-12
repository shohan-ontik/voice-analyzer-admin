"use client";

import { useEffect } from "react";

export function AlertDialog({
  title,
  message,
  closeLabel = "OK",
  onClose,
}: {
  title: string;
  message: string;
  closeLabel?: string;
  onClose: () => void;
}) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-message"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-background-elevated border border-border rounded-2xl p-6 flex flex-col gap-5"
      >
        <div>
          <div id="alert-dialog-title" className="font-display font-semibold text-[16px] text-foreground mb-1.5">
            {title}
          </div>
          <div id="alert-dialog-message" className="text-[13.5px] text-foreground-muted leading-relaxed">
            {message}
          </div>
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            autoFocus
            className="px-4 py-2 rounded-lg bg-accent text-accent-ink text-sm font-semibold cursor-pointer"
          >
            {closeLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
