import type { ComponentType } from "react";

export function StatCard({
  label,
  value,
  Icon,
  iconWrapClass,
}: {
  label: string;
  value: string | number;
  Icon: ComponentType<{ size?: number }>;
  iconWrapClass: string;
}) {
  return (
    <div className="p-5 rounded-2xl bg-background-elevated border border-border flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-semibold text-foreground-muted">
          {label}
        </span>
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconWrapClass}`}
        >
          <Icon size={17} />
        </div>
      </div>

      <div>
        <div className="font-display font-bold text-[30px] leading-none text-foreground mb-2">
          {value}
        </div>
      </div>
    </div>
  );
}
