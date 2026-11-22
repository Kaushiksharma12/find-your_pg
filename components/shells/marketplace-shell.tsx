"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Home,
  Search,
  SlidersHorizontal,
  Compass,
  Bookmark,
  User,
  Building2,
  ShieldCheck,
  Sun,
  Moon,
  Menu,
  X,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/auth-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface MarketplaceShellProps {
  children: React.ReactNode;
}

export function MarketplaceShell({ children }: MarketplaceShellProps) {
  const { theme, setTheme } = useTheme();
  const { user, openAuthModal, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Browse PGs", href: "/browse" },
    { label: "Compare", href: "/compare" },
    { label: "How It Works", href: "/#how-it-works" },
    { label: "About", href: "/#about" },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col font-sans selection:bg-[var(--accent-primary)]/20 selection:text-[var(--accent-primary)]">
      {/* Top Main Navigation Header */}
      <header className="sticky top-0 z-50 w-full bg-[var(--surface)]/90 backdrop-blur-md border-b border-[var(--surface-border)] shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-10 w-10 rounded-2xl bg-[var(--accent-primary)] flex items-center justify-center text-white font-display font-extrabold text-xl shadow-sm shadow-[var(--accent-primary)]/20 group-hover:scale-105 transition-transform">
              <Home className="h-5 w-5 text-white stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-black text-xl tracking-tight text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors">
                FindYourPeace
              </span>
              <span className="text-[10px] font-sans font-semibold tracking-wider text-[var(--accent-primary)] uppercase -mt-1">
                Student Stays & PGs
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-semibold transition-colors hover:text-[var(--accent-primary)] ${
                    isActive ? "text-[var(--accent-primary)]" : "text-[var(--text-secondary)]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Utilities & Actions */}
          <div className="flex items-center gap-3">
            {/* Theme Switcher */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full text-[var(--text-secondary)] hover:text-[var(--accent-primary)] hover:bg-[var(--surface-hover)]"
              aria-label="Toggle Theme"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            {/* Account & Portals Switcher */}
            <div className="hidden sm:flex items-center gap-2">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2 font-bold text-xs bg-[var(--surface-hover)] rounded-xl border border-[var(--surface-border)]">
                      <User className="h-4 w-4 text-[var(--accent-primary)]" />
                      <span>{user.name}</span>
                      <Badge variant="terracotta" size="sm" className="text-[9px] uppercase font-bold ml-1">
                        {user.role}
                      </Badge>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuLabel className="font-bold text-xs">
                      <div>{user.name}</div>
                      <div className="text-[10px] text-[var(--text-muted)] font-normal">{user.email}</div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={user.role === "owner" ? "/owner" : "/dashboard"}>
                        Go to Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="text-red-500 font-bold">
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Button
                    onClick={() => openAuthModal({ mode: "sign-in" })}
                    variant="ghost"
                    size="sm"
                    className="font-semibold text-sm hover:text-[var(--accent-primary)]"
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={() => openAuthModal({ mode: "create-account" })}
                    variant="primary"
                    size="sm"
                    className="bg-[var(--accent-primary)] hover:opacity-90 text-white font-semibold text-sm shadow-sm rounded-xl px-4"
                  >
                    Create Account
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Hamburger */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-[var(--text-primary)]"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-[var(--surface-border)] bg-[var(--surface)] p-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-semibold hover:bg-[var(--surface-hover)]"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-[var(--surface-border)] flex flex-col gap-2">
              {user ? (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-[var(--text-primary)] px-2">
                    Signed in as {user.name} ({user.role})
                  </div>
                  <Button onClick={logout} variant="outline" size="sm" className="w-full text-red-500">
                    Sign Out
                  </Button>
                </div>
              ) : (
                <>
                  <Button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openAuthModal({ mode: "sign-in" });
                    }}
                    variant="outline"
                    size="sm"
                    className="w-full justify-center"
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openAuthModal({ mode: "create-account" });
                    }}
                    variant="primary"
                    size="sm"
                    className="w-full justify-center bg-[var(--accent-primary)] text-white"
                  >
                    Create Account
                  </Button>
                </>
              )}
            </div>
          </div>
        )}


      </header>

      {/* Main Page Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--surface-border)] bg-[var(--surface)] py-12 text-sm text-[var(--text-secondary)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-[var(--accent-primary)] flex items-center justify-center text-white font-bold">
                <Home className="h-4 w-4" />
              </div>
              <span className="font-display font-black text-lg text-[var(--text-primary)]">FindYourPeace</span>
            </Link>
            <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
              The premier accommodation marketplace for students and young professionals across India. Verified PGs, transparent pricing, and zero hassle.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-[var(--text-primary)] mb-4">Discover Stays</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/browse?city=bangalore" className="hover:text-[var(--accent-primary)]">PGs in Bangalore</Link></li>
              <li><Link href="/browse?city=pune" className="hover:text-[var(--accent-primary)]">PGs in Pune</Link></li>
              <li><Link href="/browse?city=hyderabad" className="hover:text-[var(--accent-primary)]">PGs in Hyderabad</Link></li>
              <li><Link href="/browse?city=delhi" className="hover:text-[var(--accent-primary)]">PGs in Delhi NCR</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-[var(--text-primary)] mb-4">Company</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/#about" className="hover:text-[var(--accent-primary)]">About FindYourPeace</Link></li>
              <li><Link href="/#how-it-works" className="hover:text-[var(--accent-primary)]">How It Works</Link></li>
              <li><Link href="/compare" className="hover:text-[var(--accent-primary)]">Compare Stays</Link></li>
              {user?.role !== "renter" && (
                <li><Link href="/owner" className="hover:text-[var(--accent-primary)]">List Your Property</Link></li>
              )}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-[var(--text-primary)] mb-4">Support & Governance</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/dashboard" className="hover:text-[var(--accent-primary)]">Renter Portal</Link></li>
              {user?.role !== "renter" && (
                <li><Link href="/owner" className="hover:text-[var(--accent-primary)]">Owner Dashboard</Link></li>
              )}
              <li><span className="text-[var(--text-muted)]">Verified Quality Standard</span></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 mt-8 border-t border-[var(--surface-border)] flex flex-col sm:flex-row items-center justify-between text-xs text-[var(--text-muted)]">
          <p>© 2026 FindYourPeace (Find Your Peace). All rights reserved.</p>
          <p className="flex items-center gap-1 mt-2 sm:mt-0">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Verified Premium Accommodation Marketplace
          </p>
        </div>
      </footer>
    </div>
  );
}
