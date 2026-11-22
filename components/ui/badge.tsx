"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "amber" | "emerald" | "rose" | "slate" | "glass" | "cyan" | "terracotta" | "sage" | "blush" | "charcoal" | "neutral";
  size?: "sm" | "md";
}

const variantStyles: Record<NonNullable<BadgeProps["variant"]>, string> = {
  amber:
    "bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30",
  emerald:
    "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30",
  rose:
    "bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/30",
  slate:
    "bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--surface-border)]",
  neutral:
    "bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--surface-border)]",
  charcoal:
    "bg-[var(--charcoal-surface)] text-[var(--text-primary)] border border-[var(--surface-border)]",
  glass:
    "bg-[var(--surface)]/80 text-[var(--text-primary)] border border-[var(--surface-border)] backdrop-blur-md",
  cyan:
    "bg-[var(--pastel-sage)] text-[var(--text-primary)] border border-[var(--surface-border)]",
  terracotta:
    "bg-[var(--accent-light)] text-[var(--accent-primary)] border border-[var(--accent-primary)]/30",
  sage:
    "bg-[var(--pastel-sage)] text-[var(--text-primary)] border border-[var(--surface-border)]",
  blush:
    "bg-[var(--pastel-blush)] text-[var(--text-primary)] border border-[var(--surface-border)]",
};

const sizeStyles: Record<NonNullable<BadgeProps["size"]>, string> = {
  sm: "px-2 py-0.5 text-[10px] font-medium rounded-full",
  md: "px-3 py-1 text-xs font-medium rounded-full",
};

export function Badge({
  className,
  variant = "amber",
  size = "md",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-sans tracking-wide uppercase transition-colors select-none",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    />
  );
}
