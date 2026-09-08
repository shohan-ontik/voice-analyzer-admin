"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileIcon, GridIcon, HelpCircleIcon, MicIcon, SettingsIcon, UsersIcon } from "./icons";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", Icon: GridIcon },
  { href: "/users", label: "User Management", Icon: UsersIcon },
  { href: "/modules", label: "Content Management", Icon: FileIcon },
  { href: "/settings", label: "Settings", Icon: SettingsIcon },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 flex-shrink-0 border-r border-border bg-background-elevated flex flex-col">
      <div className="flex items-center gap-2.5 px-6 py-6 border-b border-border">
        <div className="w-9 h-9 rounded-[10px] bg-accent flex items-center justify-center flex-shrink-0">
          <MicIcon size={18} className="text-accent-ink" />
        </div>
        <span className="leading-tight">
          <span className="block font-display font-bold text-[17px] tracking-tight text-foreground">
            SalesTrain Pro
          </span>
          <span className="block text-foreground-muted font-medium text-[12px]">Admin Console</span>
        </span>
      </div>

      <nav className="flex-1 px-3.5 pt-4 flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                isActive ? "bg-accent-soft text-accent" : "text-foreground-muted hover:text-foreground"
              }`}
            >
              <item.Icon size={17} className="flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3.5 py-5 border-t border-border">
        <a
          href="mailto:support@salestrainpro.com"
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-foreground-muted hover:text-foreground"
        >
          <HelpCircleIcon size={17} />
          Help Support
        </a>
      </div>
    </div>
  );
}
