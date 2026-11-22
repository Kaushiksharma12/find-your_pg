"use client";

import * as React from "react";
import { motion, useMotionValue, useSpring, useTransform, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

export interface CardProps extends HTMLMotionProps<"div"> {
  enable3DTilt?: boolean;
  glowOnHover?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(

  ({ className, enable3DTilt = false, glowOnHover = true, children, style, ...props }, ref) => {
    // 3D Motion values for mouse movement tracking
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x, { stiffness: 250, damping: 25 });
    const mouseYSpring = useSpring(y, { stiffness: 250, damping: 25 });

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["8deg", "-8deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-8deg", "8deg"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!enable3DTilt) return;
      // Skip heavy 3D calculations on touch/mobile viewports
      if (window.innerWidth < 768) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const xPct = mouseX / width - 0.5;
      const yPct = mouseY / height - 0.5;

      x.set(xPct);
      y.set(yPct);
    };

    const handleMouseLeave = () => {
      if (!enable3DTilt) return;
      x.set(0);
      y.set(0);
    };

    return (
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          ...(enable3DTilt
            ? {
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
                perspective: 1200,
              }
            : {}),
          ...style,
        }}
        className={cn(
          "relative rounded-2xl bg-[var(--surface)] border border-[var(--surface-border)] p-6 text-[var(--text-primary)] transition-all duration-300 shadow-sm",
          glowOnHover && "hover:border-[var(--accent-primary)]/40 hover:shadow-md",
          className
        )}
        {...props}
      >
        <div style={enable3DTilt ? { transform: "translateZ(25px)", transformStyle: "preserve-3d" } : undefined}>
          {children as React.ReactNode}
        </div>
      </motion.div>
    );
  }
);
Card.displayName = "Card";


export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col space-y-1.5 pb-4", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("font-display text-xl font-bold tracking-tight text-[var(--text-primary)]", className)} {...props} />;
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-xs text-[var(--text-secondary)] font-sans leading-relaxed", className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("pt-0", className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-center pt-4 border-t border-[var(--surface-border)] mt-4", className)} {...props} />;
}
