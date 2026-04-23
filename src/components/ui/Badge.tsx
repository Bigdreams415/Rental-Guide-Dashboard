import { clsx } from "clsx";

export type BadgeVariant =
  | "pending" | "verified" | "rejected"
  | "available" | "sold" | "rented"
  | "success" | "warning" | "error" | "info" | "neutral";

interface BadgeProps {
  variant: BadgeVariant;
  label: string;
  dot?: boolean;
  className?: string;
  size?: "sm" | "md";
}

const styles: Record<BadgeVariant, { bg: string; text: string; border: string; dot: string }> = {
  pending: {
    bg: "bg-warning/10",
    text: "text-yellow-800",
    border: "border-warning/20",
    dot: "bg-warning"
  },
  verified: {
    bg: "bg-success/10",
    text: "text-green-800",
    border: "border-success/20",
    dot: "bg-success"
  },
  rejected: {
    bg: "bg-error/10",
    text: "text-red-800",
    border: "border-error/20",
    dot: "bg-error"
  },
  available: {
    bg: "bg-success/10",
    text: "text-green-800",
    border: "border-success/20",
    dot: "bg-success"
  },
  sold: {
    bg: "bg-grey/10",
    text: "text-grey-dark",
    border: "border-grey/20",
    dot: "bg-grey"
  },
  rented: {
    bg: "bg-accent/10",
    text: "text-blue-800",
    border: "border-accent/20",
    dot: "bg-accent"
  },
  success: {
    bg: "bg-success/10",
    text: "text-green-800",
    border: "border-success/20",
    dot: "bg-success"
  },
  warning: {
    bg: "bg-warning/10",
    text: "text-yellow-800",
    border: "border-warning/20",
    dot: "bg-warning"
  },
  error: {
    bg: "bg-error/10",
    text: "text-red-800",
    border: "border-error/20",
    dot: "bg-error"
  },
  info: {
    bg: "bg-accent/10",
    text: "text-blue-800",
    border: "border-accent/20",
    dot: "bg-accent"
  },
  neutral: {
    bg: "bg-grey/10",
    text: "text-grey-dark",
    border: "border-grey/20",
    dot: "bg-grey"
  },
};

const sizes = {
  sm: "px-2 py-0.5 text-[10px] gap-1",
  md: "px-2.5 py-1 text-xs gap-1.5",
};

export function Badge({ variant, label, dot = true, className, size = "md" }: BadgeProps) {
  const style = styles[variant];
  
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full font-medium border backdrop-blur-sm",
        "transition-all hover:scale-105 hover:shadow-sm",
        style.bg,
        style.text,
        style.border,
        sizes[size],
        className
      )}
    >
      {dot && (
        <span className={clsx("w-1.5 h-1.5 rounded-full animate-pulse", style.dot)} />
      )}
      {label}
    </span>
  );
}

// ─── Helpers to convert backend enum values → badge props ─────────────────────

export function verificationBadge(status: string): { variant: BadgeVariant; label: string } {
  const map: Record<string, { variant: BadgeVariant; label: string }> = {
    pending_verification: { variant: "pending", label: "Pending Review" },
    verified: { variant: "verified", label: "Verified" },
    rejected: { variant: "rejected", label: "Rejected" },
  };
  return map[status] ?? { variant: "neutral", label: status };
}

export function statusBadge(status: string): { variant: BadgeVariant; label: string } {
  const map: Record<string, { variant: BadgeVariant; label: string }> = {
    available: { variant: "available", label: "Available" },
    pending: { variant: "pending", label: "Pending" },
    sold: { variant: "sold", label: "Sold" },
    rented: { variant: "rented", label: "Rented" },
    unavailable: { variant: "neutral", label: "Unavailable" },
  };
  return map[status] ?? { variant: "neutral", label: status };
}