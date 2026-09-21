"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminUser } from "../lib/types";
import { BellIcon, HelpCircleIcon, LogoutIcon, SearchIcon } from "./icons";

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function TopBar() {
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/me")
      .then(async (res) => {
        if (!res.ok) return;
        setUser(await res.json());
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function logout() {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="h-16 flex-shrink-0 border-b border-border bg-background-elevated flex items-center gap-4 px-6">
      <div className="relative flex-1 max-w-[420px]">
        <SearchIcon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground-muted" />
        <input
          type="text"
          placeholder="Search..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm outline-none focus:border-accent"
        />
      </div>

      <div className="flex-1" />

      <button
        type="button"
        className="relative text-foreground-muted hover:text-foreground p-1.5"
        aria-label="Notifications"
      >
        <BellIcon size={19} />
      </button>

      <a
        href="mailto:support@salestrainpro.com"
        className="text-foreground-muted hover:text-foreground p-1.5"
        aria-label="Help"
      >
        <HelpCircleIcon size={19} />
      </a>

      <div className="w-px h-6 bg-border" />

      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="w-9 h-9 rounded-full bg-accent-soft text-accent flex items-center justify-center font-display font-bold text-[13px]"
        >
          {user ? initials(user.name) : "…"}
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-11 w-56 rounded-xl border border-border bg-background-elevated shadow-lg py-2 z-20">
            {user && (
              <div className="px-3.5 py-2 border-b border-border mb-1">
                <div className="text-sm font-semibold text-foreground truncate">{user.name}</div>
                <div className="text-[12px] text-foreground-muted truncate">{user.username}</div>
              </div>
            )}
            <button
              type="button"
              onClick={logout}
              disabled={loggingOut}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm font-semibold text-foreground-muted hover:text-foreground disabled:opacity-50"
            >
              <LogoutIcon size={16} />
              {loggingOut ? "Logging out…" : "Log out"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
