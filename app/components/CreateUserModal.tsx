"use client";

import { useState, type FormEvent } from "react";
import { XIcon } from "./icons";

export function CreateUserModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (result: { username: string; phone: string; tempPassword: string }) => void;
}) {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username, phone, employeeId: employeeId || undefined }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error?.message ?? "Failed to create user.");
      onCreated({ username: body.username, phone: body.phone, tempPassword: body.tempPassword });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create user.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl bg-background-elevated border border-border p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-bold text-[18px] text-foreground">Add New User</h2>
          <button type="button" onClick={onClose} className="text-foreground-muted hover:text-foreground p-1">
            <XIcon size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="new-user-name" className="text-[13px] font-semibold text-foreground-muted">
              Full name
            </label>
            <input
              id="new-user-name"
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
              className="px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm outline-none focus:border-accent"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="new-user-username" className="text-[13px] font-semibold text-foreground-muted">
              Username
            </label>
            <input
              id="new-user-username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="jane.doe"
              className="px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm outline-none focus:border-accent"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="new-user-phone" className="text-[13px] font-semibold text-foreground-muted">
              Phone number
            </label>
            <input
              id="new-user-phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+15551234567"
              className="px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm outline-none focus:border-accent"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="new-user-employee-id" className="text-[13px] font-semibold text-foreground-muted">
              Employee ID <span className="font-normal text-foreground-muted">(optional)</span>
            </label>
            <input
              id="new-user-employee-id"
              type="text"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              placeholder="EMP-1042"
              className="px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm outline-none focus:border-accent"
            />
          </div>

          {error && <div className="text-[13px] text-danger">{error}</div>}

          <button
            type="submit"
            disabled={creating}
            className="mt-1 py-3 rounded-xl bg-accent text-accent-ink font-display font-semibold text-sm disabled:opacity-60"
          >
            {creating ? "Creating…" : "Create user"}
          </button>
        </form>
      </div>
    </div>
  );
}
