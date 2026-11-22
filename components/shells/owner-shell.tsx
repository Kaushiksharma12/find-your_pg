"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Building2,
  BedDouble,
  Inbox,
  Plus,
  ArrowLeft,
  Settings,
  TrendingUp,
  Home,
  Sun,
  Moon,
  LogOut,
  Calendar,
  CalendarCheck,
  Star,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MOCK_OWNER_DATA } from "@/lib/mock-data";
import { useAuth } from "@/context/auth-context";

export interface OwnerShellProps {
  children: React.ReactNode;
}

export function OwnerShell({ children }: OwnerShellProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { user, openAuthModal } = useAuth();

  const navLinks = [
    { label: "Overview", href: "/owner", icon: Layers },
    { label: "My Properties", href: "/owner/properties", icon: Building2 },
    { label: "Enquiries", href: "/owner/enquiries", icon: Inbox },
    { label: "Visit Requests", href: "/owner/visits", icon: Calendar },
    { label: "Booking Approvals", href: "/owner/bookings", icon: CalendarCheck },
    { label: "Owner Reviews", href: "/owner/reviews", icon: Star },
    { label: "Settings", href: "/owner/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col font-sans">
      {/* Owner Header Bar */}
      <header className="sticky top-0 z-40 w-full bg-[var(--surface)] border-b border-[var(--surface-border)] px-4 sm:px-6 h-16 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-9 w-9 rounded-xl bg-emerald-700 flex items-center justify-center text-white font-bold">
              <Home className="h-4 w-4" />
            </div>
            <span className="font-display font-black text-lg text-[var(--text-primary)]">FindYourPeace</span>
          </Link>
          <div className="h-4 w-px bg-[var(--surface-border)]" />
          <Badge variant="emerald" size="sm" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 font-semibold">
            Host Partner Hub
          </Badge>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/owner/properties/new">
            <Button variant="primary" size="sm" className="bg-[var(--accent-primary)] hover:opacity-90 text-white rounded-xl gap-1.5 text-xs font-semibold shadow-sm">
              <Plus className="h-4 w-4" /> Add Property
            </Button>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full text-[var(--text-secondary)] hover:text-[var(--accent-primary)]"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-[var(--surface-border)]">
              <div className="h-8 w-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">
                {user.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div className="hidden sm:block text-xs">
                <div className="font-bold text-[var(--text-primary)]">{user.name}</div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Verified Host</div>
              </div>
            </div>
          ) : (
            <Button
              onClick={() => openAuthModal({ mode: "sign-in", accountType: "owner", reason: "Sign in with a Host Partner account to manage your listings." })}
              variant="outline"
              size="sm"
              className="border-emerald-700 text-emerald-700 dark:text-emerald-400 font-bold rounded-xl text-xs"
            >
              Host Sign In
            </Button>
          )}
        </div>
      </header>


      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 gap-8">
        
        {/* Host Sidebar */}
        <aside className="w-full md:w-64 shrink-0 space-y-2 bg-[var(--surface)] p-4 rounded-3xl border border-[var(--surface-border)] shadow-sm h-fit">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] px-3 py-1">
            Host Management
          </div>
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-emerald-700 text-white shadow-sm shadow-emerald-700/20"
                    : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-emerald-700 dark:hover:text-emerald-400"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}

          <div className="pt-4 border-t border-[var(--surface-border)]">
            <Link
              href="/"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
            >
              <LogOut className="h-4 w-4" />
              <span>Back to Marketplace</span>
            </Link>
          </div>
        </aside>

        {/* Viewport */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
