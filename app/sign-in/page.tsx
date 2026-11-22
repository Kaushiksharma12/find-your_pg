"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Home, Lock, Mail, Loader2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SignInPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [role, setRole] = React.useState<"renter" | "owner">("renter");
  const [formError, setFormError] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setFormError("Please fill in both email and password.");
      return;
    }
    setFormError("");
    setIsSubmitting(true);

    const res = await login({ email, password, role });
    setIsSubmitting(false);

    if (res.success) {
      if (role === "owner") {
        router.push("/owner");
      } else {
        router.push("/dashboard");
      }
    } else {
      setFormError(res.error || "Authentication failed. Please check credentials.");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col justify-center items-center px-4 py-12 font-sans selection:bg-[#FF5A36]/20">
      
      {/* Brand Header */}
      <div className="mb-8 text-center space-y-2">
        <Link href="/" className="inline-flex items-center gap-2 font-display font-black text-2xl text-[var(--text-primary)]">
          <div className="h-10 w-10 rounded-2xl bg-[#FF5A36] flex items-center justify-center text-white">
            <Home className="h-5 w-5" />
          </div>
          <span>FindYourPeace</span>
        </Link>
        <p className="text-xs text-[var(--text-secondary)]">Sign in to manage your stays, enquiries & booking requests</p>
      </div>

      {/* Auth Card */}
      <div className="w-full max-w-md bg-[var(--surface)] p-8 rounded-3xl border border-[var(--surface-border)] shadow-xl space-y-6">
        
        {/* Role Selector Tabs (Renter / Host Partner only) */}
        <div className="grid grid-cols-2 gap-1 bg-[var(--surface-hover)] p-1 rounded-2xl border border-[var(--surface-border)] text-xs font-semibold">
          <button
            type="button"
            onClick={() => setRole("renter")}
            className={`py-2 rounded-xl transition-all ${
              role === "renter" ? "bg-[#FF5A36] text-white shadow-sm" : "text-[var(--text-secondary)]"
            }`}
          >
            Renter / Student
          </button>
          <button
            type="button"
            onClick={() => setRole("owner")}
            className={`py-2 rounded-xl transition-all ${
              role === "owner" ? "bg-[#FF5A36] text-white shadow-sm" : "text-[var(--text-secondary)]"
            }`}
          >
            Host Partner
          </button>
        </div>

        {formError && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs text-center font-semibold">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--text-primary)]">Email Address</label>
            <Input
              type="email"
              icon={<Mail className="h-4 w-4" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[var(--text-primary)]">Password</label>
              <Link href="/forgot-password" className="text-xs text-[#FF5A36] hover:underline font-medium">
                Forgot?
              </Link>
            </div>
            <Input
              type="password"
              icon={<Lock className="h-4 w-4" />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              disabled={isSubmitting}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={isSubmitting}
            className="w-full bg-[#FF5A36] hover:bg-[#E0482B] text-white font-bold rounded-2xl h-12 shadow-lg shadow-[#FF5A36]/25 mt-2 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <span>Sign In as {role === "renter" ? "Renter" : "Host Partner"}</span>
            )}
          </Button>
        </form>

        <div className="text-center text-xs text-[var(--text-secondary)] pt-4 border-t border-[var(--surface-border)]">
          Don&apos;t have an account?{" "}
          <Link href="/create-account" className="font-bold text-[#FF5A36] hover:underline">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}
