"use client";

import { useCallback, useEffect, useState } from "react";
import type { AdminUser } from "../lib/types";
import { placeholderProgress } from "../lib/userProgressPlaceholder";
import { ConfirmDialog } from "./ConfirmDialog";
import { CreateUserModal } from "./CreateUserModal";
import {
  BanIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FilterIcon,
  PlusIcon,
  SearchIcon,
  TrashIcon,
} from "./icons";

const PAGE_SIZE = 10;

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

function formatDate(value: string | null) {
  if (!value) return "Never";
  return new Date(value).toLocaleDateString(undefined, { dateStyle: "medium" });
}

function scoreClass(score: number) {
  if (score >= 85) return "text-success";
  if (score >= 70) return "text-accent";
  return "text-danger";
}

function getPageNumbers(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set<number>([1, 2, 3, total]);
  if (current > 1 && current < total) pages.add(current);
  const sorted = [...pages].sort((a, b) => a - b);
  const result: (number | "ellipsis")[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (p - prev > 1) result.push("ellipsis");
    result.push(p);
    prev = p;
  }
  return result;
}

export function UsersManager() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [justCreated, setJustCreated] = useState<{ email: string; tempPassword: string } | null>(null);

  const [pendingActionId, setPendingActionId] = useState<string | null>(null);
  const [banTarget, setBanTarget] = useState<AdminUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadUsers = useCallback(async (q: string, p: number) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(p), pageSize: String(PAGE_SIZE) });
      if (q) params.set("q", q);
      const res = await fetch(`/api/users?${params}`);
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error?.message ?? "Failed to load users.");
      setUsers(body.items);
      setTotal(body.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => loadUsers(query, page), 300);
    return () => clearTimeout(t);
  }, [query, page, loadUsers]);

  function handleQueryChange(value: string) {
    setQuery(value);
    setPage(1);
  }

  async function runBanAction(user: AdminUser, action: "ban" | "unban") {
    setPendingActionId(user.id);
    try {
      const res = await fetch(`/api/users/${user.id}/${action}`, { method: "POST" });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error?.message ?? "Action failed.");
      setUsers((prev) => prev.map((u) => (u.id === user.id ? body : u)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed.");
    } finally {
      setPendingActionId(null);
    }
  }

  function handleToggleBan(user: AdminUser) {
    if (user.isBanned) {
      runBanAction(user, "unban");
      return;
    }
    setBanTarget(user);
  }

  async function confirmBan() {
    const user = banTarget;
    if (!user) return;
    await runBanAction(user, "ban");
    setBanTarget(null);
  }

  async function confirmDelete() {
    const user = deleteTarget;
    if (!user) return;

    setDeletingId(user.id);
    try {
      const res = await fetch(`/api/users/${user.id}`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error?.message ?? "Failed to delete user.");
      }
      setDeleteTarget(null);
      await loadUsers(query, page);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete user.");
      setDeleteTarget(null);
    } finally {
      setDeletingId(null);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="flex-1 px-10 py-8 max-w-[1240px] w-full mx-auto flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display font-bold text-[28px] text-foreground mb-1">User Management</h1>
          <p className="text-[14px] text-foreground-muted">Manage Sales Officers, track progress, and update roles.</p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-accent-ink font-display font-semibold text-[13.5px] shrink-0"
        >
          <PlusIcon size={16} />
          Add New User
        </button>
      </div>

      {justCreated && (
        <div className="bg-success-soft border border-success/30 rounded-2xl p-5 flex items-center justify-between gap-4">
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
            className="text-[13px] font-semibold text-success flex-shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-background-elevated overflow-hidden">
        <div className="p-5 flex items-center gap-3 flex-wrap border-b border-border">
          <div className="relative flex-1 min-w-[240px]">
            <SearchIcon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground-muted" />
            <input
              type="search"
              placeholder="Search by name or Employee ID..."
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm outline-none focus:border-accent"
            />
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-[13.5px] font-medium"
          >
            All Modules
            <ChevronDownIcon size={15} className="text-foreground-muted" />
          </button>

          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-background-elevated font-display font-semibold text-[13.5px] text-foreground"
          >
            <FilterIcon size={15} />
            Filter
          </button>
        </div>

        {error && <div className="px-5 pt-4 text-[13px] text-danger">{error}</div>}

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] font-bold uppercase tracking-wide text-foreground-muted border-b border-border">
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Employee ID</th>
              <th className="px-5 py-3">Chapters</th>
              <th className="px-5 py-3">Avg. Score</th>
              <th className="px-5 py-3">Last Active</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-foreground-muted">
                  Loading…
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-foreground-muted">
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((user) => {
                const progress = placeholderProgress(user.id);
                const progressPercent = (progress.chaptersCompleted / progress.totalChapters) * 100;
                return (
                  <tr key={user.id} className="border-b border-border last:border-0">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-accent-soft text-accent flex items-center justify-center font-display font-bold text-[12.5px] shrink-0">
                          {initials(user.name)}
                        </div>
                        <span className="font-semibold text-foreground whitespace-nowrap">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-foreground-muted">{user.employeeId ?? "—"}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5 min-w-[110px]">
                        <div className="flex-1 h-1.5 rounded-full bg-border overflow-hidden max-w-[70px]">
                          <div
                            className={`h-full rounded-full ${progressPercent === 100 ? "bg-success" : "bg-accent"}`}
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                        <span className="text-[12.5px] text-foreground-muted whitespace-nowrap">
                          {progress.chaptersCompleted}/{progress.totalChapters}
                        </span>
                      </div>
                    </td>
                    <td className={`px-5 py-3.5 font-bold ${scoreClass(progress.avgScore)}`}>
                      {progress.avgScore}%
                    </td>
                    <td className="px-5 py-3.5 text-foreground-muted whitespace-nowrap">
                      {formatDate(user.lastLoginAt)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          user.isBanned ? "bg-border text-foreground-muted" : "bg-success-soft text-success"
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {user.isBanned ? "Inactive" : "Active"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          disabled={pendingActionId === user.id}
                          onClick={() => handleToggleBan(user)}
                          title={user.isBanned ? "Unban user" : "Ban user"}
                          className={`inline-flex p-2 rounded-lg hover:bg-background disabled:opacity-50 cursor-pointer ${
                            user.isBanned ? "text-success" : "text-danger"
                          }`}
                        >
                          {user.isBanned ? <CheckCircleIcon size={17} /> : <BanIcon size={17} />}
                        </button>
                        <button
                          type="button"
                          disabled={deletingId === user.id}
                          onClick={() => setDeleteTarget(user)}
                          title="Delete user"
                          className="inline-flex p-2 rounded-lg hover:bg-background disabled:opacity-50 text-danger cursor-pointer"
                        >
                          <TrashIcon size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        <div className="px-5 py-4 flex items-center justify-between gap-4 flex-wrap border-t border-border">
          <span className="text-[13px] text-foreground-muted">
            {total === 0 ? "No users" : `Showing ${rangeStart}-${rangeEnd} of ${total.toLocaleString()}`}
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-foreground-muted disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeftIcon size={15} />
            </button>

            {getPageNumbers(page, totalPages).map((p, i) =>
              p === "ellipsis" ? (
                <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-foreground-muted">
                  …
                </span>
              ) : (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-[13px] font-semibold ${
                    p === page ? "bg-accent text-accent-ink" : "text-foreground-muted hover:bg-background"
                  }`}
                >
                  {p}
                </button>
              )
            )}

            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-foreground-muted disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRightIcon size={15} />
            </button>
          </div>
        </div>
      </div>

      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onCreated={(result) => {
            setJustCreated(result);
            setShowCreateModal(false);
            loadUsers(query, page);
          }}
        />
      )}

      {banTarget && (
        <ConfirmDialog
          title="Ban user"
          message={`Ban ${banTarget.name} (${banTarget.email})? They will be signed out immediately.`}
          confirmLabel="Ban"
          danger
          loading={pendingActionId === banTarget.id}
          onConfirm={confirmBan}
          onCancel={() => {
            if (pendingActionId !== banTarget.id) setBanTarget(null);
          }}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete user"
          message={`Delete ${deleteTarget.name} (${deleteTarget.email})? This permanently removes their account and practice history, and cannot be undone.`}
          confirmLabel="Delete"
          danger
          loading={deletingId === deleteTarget.id}
          onConfirm={confirmDelete}
          onCancel={() => {
            if (deletingId !== deleteTarget.id) setDeleteTarget(null);
          }}
        />
      )}
    </div>
  );
}
