import { clsx } from "clsx";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  animation?: "pulse" | "wave" | "none";
}

export function Skeleton({
  className,
  variant = "text",
  animation = "pulse",
}: SkeletonProps) {
  return (
    <div
      className={clsx(
        "bg-grey-light/50",
        animation === "pulse" && "animate-pulse",
        animation === "wave" && "animate-shimmer",
        variant === "text" && "h-4 rounded",
        variant === "circular" && "rounded-full",
        variant === "rectangular" && "rounded-lg",
        className
      )}
    />
  );
}