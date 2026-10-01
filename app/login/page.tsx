"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { SparkleIcon } from "../components/icons";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
      const body = await res.json();

      if (!res.ok) {
        setError(body?.error?.message ?? "Login failed.");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5 mb-8 justify-center">
          <div className="w-9 h-9 rounded-[10px] bg-accent flex items-center justify-center text-white flex-shrink-0">
            <SparkleIcon size={18} />
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-foreground">
            PitchPerfect{" "}
            <span className="text-foreground-muted font-medium">Admin</span>
          </span>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-background-elevated border border-border rounded-2xl p-7 flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="identifier"
              className="text-[13px] font-semibold text-foreground-muted"
            >
              Username or phone number
            </label>
            <input
              id="identifier"
              type="text"
              required
              autoFocus
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm outline-none focus:border-accent"
              placeholder="admin"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="text-[13px] font-semibold text-foreground-muted"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm outline-none focus:border-accent"
              placeholder="••••••••"
            />
          </div>

          {error && <div className="text-[13px] text-danger">{error}</div>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-1.5 py-3 rounded-xl bg-accent text-accent-ink font-display font-semibold text-sm disabled:opacity-60"
          >
            {submitting ? "Logging in…" : "Log in"}
          </button>
        </form>
      </div>
    </div>
  );
}
