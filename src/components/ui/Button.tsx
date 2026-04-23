import { clsx } from "clsx";
import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "success" | "danger" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: ReactNode;
  children: ReactNode;
  fullWidth?: boolean;
}

const variants = {
  primary: "bg-gradient-to-r from-primary to-primary-dark text-white shadow-sm shadow-primary/20 hover:shadow-md hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0",
  secondary: "bg-gradient-to-r from-secondary to-secondary-dark text-white shadow-sm shadow-secondary/20 hover:shadow-md hover:shadow-secondary/30 hover:-translate-y-0.5 active:translate-y-0",
  success: "bg-gradient-to-r from-success to-green-600 text-white shadow-sm shadow-success/20 hover:shadow-md hover:shadow-success/30 hover:-translate-y-0.5 active:translate-y-0",
  danger: "bg-gradient-to-r from-error to-red-600 text-white shadow-sm shadow-error/20 hover:shadow-md hover:shadow-error/30 hover:-translate-y-0.5 active:translate-y-0",
  ghost: "bg-transparent text-text-secondary hover:bg-primary/10 hover:text-primary hover:scale-105 active:scale-100",
  outline: "border border-grey-light/50 bg-surface/50 text-text-primary hover:bg-primary/5 hover:border-primary/30 hover:text-primary hover:shadow-sm active:scale-95 backdrop-blur-sm",
};

const sizes = {
  sm: "px-3 py-1.5 text-xs gap-1.5 rounded-lg",
  md: "px-4 py-2 text-sm gap-2 rounded-xl",
  lg: "px-5 py-2.5 text-sm gap-2 rounded-xl",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  children,
  className,
  disabled,
  fullWidth = false,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={clsx(
        "inline-flex items-center justify-center font-semibold transition-all duration-200",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none disabled:hover:shadow-none",
        "focus:outline-none focus:ring-2 focus:ring-primary/20",
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className
      )}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : (
        icon && <span className="shrink-0 group-hover:scale-110 transition-transform">{icon}</span>
      )}
      {children}
    </button>
  );
}