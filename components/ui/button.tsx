"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "outline"
    | "ghost"
    | "glass"
    | "destructive";
  size?: "sm" | "md" | "lg" | "icon";
  asChild?: boolean;
}

const variantStyles: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-[var(--accent-primary)] hover:opacity-90 text-white shadow-sm shadow-[var(--accent-primary)]/20 border border-[var(--accent-primary)]/30 font-semibold",
  secondary:
    "bg-[var(--bg-secondary)] hover:bg-[var(--surface-border)] text-[var(--text-primary)] border border-[var(--surface-border)]",
  outline:
    "border border-[var(--surface-border)] hover:border-[var(--accent-primary)]/50 text-[var(--text-primary)] hover:bg-[var(--accent-light)]",
  ghost:
    "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]",
  glass:
    "bg-[var(--surface)]/80 hover:bg-[var(--surface)] backdrop-blur-md border border-[var(--surface-border)] text-[var(--text-primary)] shadow-sm hover:border-[var(--accent-primary)]/40",
  destructive:
    "bg-red-700/90 hover:bg-red-700 text-white border border-red-600/30 shadow-sm",
};

const sizeStyles: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "h-8 px-3 text-xs rounded-lg gap-1.5",
  md: "h-10 px-4 text-sm rounded-xl gap-2",
  lg: "h-12 px-6 text-base rounded-2xl gap-2.5",
  icon: "h-10 w-10 p-0 rounded-xl items-center justify-center",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      asChild = false,
      onClick,
      children,
      disabled,
      type = "button",
      ...props
    },
    ref
  ) => {
    if (asChild) {
      return (
        <Slot
          className={cn(
            "inline-flex items-center justify-center font-sans tracking-wide transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
            variantStyles[variant],
            sizeStyles[size],
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </Slot>
      );
    }

    return (
      <motion.button
        ref={ref}
        type={type}
        disabled={disabled}
        whileTap={{ scale: disabled ? 1 : 0.97 }}
        whileHover={{ y: disabled ? 0 : -1 }}
        onClick={onClick}
        className={cn(
          "inline-flex items-center justify-center font-sans font-medium tracking-wide transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...(props as HTMLMotionProps<"button">)}
      >
        {children}
      </motion.button>
    );
  }
);
Button.displayName = "Button";
