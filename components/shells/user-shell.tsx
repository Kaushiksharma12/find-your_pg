"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  LayoutDashboard,
  User,
  Heart,
  MessageSquare,
  Calendar,
  CalendarCheck,
  Star,
  Bell,
  Settings,
  ArrowLeft,
  Home,
  Sun,
  Moon,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MOCK_USER_PROFILE } from "@/lib/mock-data";
import { useAuth } from "@/context/auth-context";

export interface UserShellProps {
  children: React.ReactNode;
}

export function UserShell({ children }: UserShellProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { user, openAuthModal, logout } = useAuth();

  const sidebarLinks = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "My Profile", href: "/dashboard/profile", icon: User },
    { label: "Shortlisted PGs", href: "/dashboard/saved", icon: Heart },
    { label: "My Enquiries", href: "/dashboard/enquiries", icon: MessageSquare },
    { label: "Site Visits", href: "/dashboard/visits", icon: Calendar },
    { label: "Bookings", href: "/dashboard/bookings", icon: CalendarCheck },
    { label: "Reviews", href: "/dashboard/reviews", icon: Star },
    { label: "Notifications", href: "/dashboard/notifications", icon: Bell },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col font-sans">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 w-full bg-[var(--surface)] border-b border-[var(--surface-border)] px-4 sm:px-6 h-16 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-9 w-9 rounded-xl bg-[var(--accent-primary)] flex items-center justify-center text-white font-bold">
              <Home className="h-4 w-4" />
            </div>
            <span className="font-display font-black text-lg text-[var(--text-primary)]">FindYourPeace</span>
          </Link>
          <div className="h-4 w-px bg-[var(--surface-border)]" />
          <Badge variant="terracotta" size="sm" className="bg-[var(--accent-light)] text-[var(--accent-primary)] border-[var(--accent-primary)]/30 font-semibold">
            Renter Portal
          </Badge>
        </div>

        <div className="flex items-center gap-3">
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
              <img
                src={MOCK_USER_PROFILE.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover border border-[var(--accent-primary)]"
              />
              <div className="hidden sm:block text-xs">
                <div className="font-bold text-[var(--text-primary)]">{user.name}</div>
                <div className="text-[10px] text-[var(--text-muted)]">Renter Account</div>
              </div>
            </div>
          ) : (
            <Button
              onClick={() => openAuthModal({ mode: "sign-in", reason: "Sign in to manage your Renter Portal." })}
              variant="primary"
              size="sm"
              className="bg-[var(--accent-primary)] text-white font-bold rounded-xl text-xs"
            >
              Sign In
            </Button>
          )}
        </div>
      </header>


      {/* Sidebar + Main Content Layout */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 gap-8">
        
        {/* Sidebar */}
        <aside className="w-full md:w-64 shrink-0 space-y-2 bg-[var(--surface)] p-4 rounded-3xl border border-[var(--surface-border)] shadow-sm h-fit">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] px-3 py-1">
            Navigation Menu
          </div>
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-[var(--accent-primary)] text-white shadow-sm shadow-[var(--accent-primary)]/20"
                    : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--accent-primary)]"
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

        {/* Main Viewport */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
