"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { CheckCircleIcon, XIcon } from "../icons";

type ToastKind = "success" | "error";

type Toast = { id: number; kind: ToastKind; message: string };

type ToastApi = {
  success: (message: string) => void;
  error: (message: string) => void;
};

const TOAST_DURATION_MS = 4500;

const ToastContext = createContext<ToastApi | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}

const KIND_STYLE: Record<ToastKind, string> = {
  success: "bg-success-soft text-success border-success/30",
  error: "bg-danger-soft text-danger border-danger/30",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (kind: ToastKind, message: string) => {
      const id = nextId.current++;
      setToasts((prev) => [...prev, { id, kind, message }]);
      setTimeout(() => dismiss(id), TOAST_DURATION_MS);
    },
    [dismiss],
  );

  const api = useMemo<ToastApi>(
    () => ({ success: (m) => push("success", m), error: (m) => push("error", m) }),
    [push],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-[min(360px,calc(100vw-2rem))]">
        {toasts.map((toast) => {
          const Icon = toast.kind === "success" ? CheckCircleIcon : XIcon;
          return (
            <div
              key={toast.id}
              role={toast.kind === "error" ? "alert" : "status"}
              className={`flex items-start gap-2.5 rounded-xl border px-3.5 py-3 shadow-lg ${KIND_STYLE[toast.kind]}`}
            >
              <Icon size={16} className="mt-0.5 shrink-0" />
              <span className="flex-1 text-[13px] font-medium text-foreground wrap-break-word">{toast.message}</span>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                className="text-foreground-muted hover:text-foreground p-0.5 cursor-pointer"
                aria-label="Dismiss notification"
              >
                <XIcon size={12} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
