"use client";

import { useCallback, useEffect, useState } from "react";
import type { AdminUser } from "../lib/types";

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function UsersManager() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [justCreated, setJustCreated] = useState<{ email: string; tempPassword: string } | null>(null);

  const [pendingActionId, setPendingActionId] = useState<string | null>(null);

  const loadUsers = useCallback(async (q: string) => {
    setLoading(true);
    setError(null);
    try {
      const url = q ? `/api/users?q=${encodeURIComponent(q)}` : "/api/users";
      const res = await fetch(url);
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error?.message ?? "Failed to load users.");
      setUsers(body.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => loadUsers(query), 300);
    return () => clearTimeout(t);
  }, [query, loadUsers]);

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreating(true);
    setCreateError(null);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error?.message ?? "Failed to create user.");

      setJustCreated({ email: body.email, tempPassword: body.tempPassword });
      setEmail("");
      setName("");
      await loadUsers(query);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Failed to create user.");
    } finally {
      setCreating(false);
    }
  }

  async function handleToggleBan(user: AdminUser) {
    if (!user.isBanned) {
      const confirmed = window.confirm(`Ban ${user.name} (${user.email})? They will be signed out immediately.`);
      if (!confirmed) return;
    }

    setPendingActionId(user.id);
    try {
      const res = await fetch(`/api/users/${user.id}/${user.isBanned ? "unban" : "ban"}`, { method: "POST" });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error?.message ?? "Action failed.");
      setUsers((prev) => prev.map((u) => (u.id === user.id ? body : u)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed.");
    } finally {
      setPendingActionId(null);
    }
  }

  return (
    <div className="flex-1 px-16 py-10 max-w-[1000px] w-full mx-auto flex flex-col gap-8">
      <div>
        <h1 className="font-display font-bold text-[26px] text-foreground mb-1">Users</h1>
        <p className="text-[14px] text-foreground-muted">
          Create accounts for sales reps, and ban or unban access as needed.
        </p>
      </div>

      <form
        onSubmit={handleCreate}
        className="bg-background-elevated border border-border rounded-2xl p-6 flex flex-col gap-4"
      >
        <div className="font-display font-semibold text-[15px] text-foreground">Create a new user</div>
        <div className="flex gap-3 flex-wrap">
          <input
            type="text"
            required
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 min-w-[180px] px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm outline-none focus:border-accent"
          />
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 min-w-[220px] px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm outline-none focus:border-accent"
          />
          <button
            type="submit"
            disabled={creating}
            className="px-5 py-2.5 rounded-xl bg-accent text-accent-ink font-display font-semibold text-sm disabled:opacity-60"
          >
            {creating ? "Creating…" : "Create user"}
          </button>
        </div>
        {createError && <div className="text-[13px] text-danger">{createError}</div>}
      </form>

      {justCreated && (
        <div className="bg-teal-soft border border-teal/30 rounded-2xl p-5 flex items-center justify-between gap-4">
          <div className="text-[13.5px] text-foreground">
            Created <span className="font-semibold">{justCreated.email}</span>. Temporary password (shown once —
            share it with them now):{" "}
            <code className="px-2 py-1 rounded-md bg-background-elevated font-mono text-[13px]">
              {justCreated.tempPassword}
            </code>
          </div>
          <button
            type="button"
            onClick={() => setJustCreated(null)}
            className="text-[13px] font-semibold text-teal flex-shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="flex flex-col gap-4">
        <input
          type="search"
          placeholder="Search by name or email…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="px-3.5 py-2.5 rounded-xl border border-border bg-background-elevated text-foreground text-sm outline-none focus:border-accent max-w-sm"
        />

        {error && <div className="text-[13px] text-danger">{error}</div>}

        <div className="border border-border rounded-2xl bg-background-elevated overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[12.5px] font-semibold text-foreground-muted border-b border-border">
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Created</th>
                <th className="px-5 py-3">Last login</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-foreground-muted">
                    Loading…
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-foreground-muted">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-b border-border last:border-0">
                    <td className="px-5 py-3.5 font-medium text-foreground">{user.name}</td>
                    <td className="px-5 py-3.5 text-foreground-muted">{user.email}</td>
                    <td className="px-5 py-3.5 text-foreground-muted capitalize">{user.role}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          user.isBanned ? "bg-danger-soft text-danger" : "bg-teal-soft text-teal"
                        }`}
                      >
                        {user.isBanned ? "Banned" : "Active"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-foreground-muted">{formatDate(user.createdAt)}</td>
                    <td className="px-5 py-3.5 text-foreground-muted">{formatDate(user.lastLoginAt)}</td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        type="button"
                        disabled={pendingActionId === user.id}
                        onClick={() => handleToggleBan(user)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border-[1.5px] disabled:opacity-50 ${
                          user.isBanned
                            ? "border-teal text-teal"
                            : "border-danger text-danger"
                        }`}
                      >
                        {pendingActionId === user.id ? "…" : user.isBanned ? "Unban" : "Ban"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
