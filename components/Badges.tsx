import { avatarColors, initials } from "@/lib/utils";

export function VerifiedBadge() {
  return (
    <span className="inline-flex items-center gap-0.5 rounded-full bg-success-light px-1.5 py-0.5 text-[10px] font-semibold text-success">
      <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden>
        <polyline points="20 6 9 17 4 12" />
      </svg>
      Verified
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    OPEN: "bg-success-light text-success",
    FULL: "bg-warning-light text-warning",
    CANCELLED: "bg-surface-hover text-text-faint",
    COMPLETED: "bg-accent-light text-accent-dark",
    PENDING: "bg-warning-light text-warning",
    APPROVED: "bg-success-light text-success",
    ACTIVE: "bg-success-light text-success",
  };
  const label =
    status === "OPEN"
      ? "Active"
      : status.charAt(0) + status.slice(1).toLowerCase().replace(/_/g, " ");
  return (
    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${map[status] ?? "bg-surface-hover text-text-muted"}`}>
      {label}
    </span>
  );
}

export function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const { bg, fg } = avatarColors(name);
  const sizes = { sm: "h-8 w-8 text-xs", md: "h-10 w-10 text-sm", lg: "h-14 w-14 text-base" };
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold ${sizes[size]}`}
      style={{ backgroundColor: bg, color: fg }}
      aria-hidden
    >
      {initials(name)}
    </div>
  );
}
