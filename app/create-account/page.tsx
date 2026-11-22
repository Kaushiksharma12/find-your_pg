"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Home, Mail, Lock, User, Phone, Building2, Loader2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CreateAccountPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [accountType, setAccountType] = React.useState<"renter" | "owner">("renter");
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [formError, setFormError] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      setFormError("Please fill in all required fields.");
      return;
    }
    setFormError("");
    setIsSubmitting(true);

    const res = await register({
      name: fullName,
      email,
      password,
      phone,
      role: accountType,
    });

    setIsSubmitting(false);

    if (res.success) {
      if (accountType === "owner") {
        router.push("/owner");
      } else {
        router.push("/dashboard");
      }
    } else {
      setFormError(res.error || "Registration failed. Please try again.");
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
        <p className="text-xs text-[var(--text-secondary)]">Create your free account to find or list student stays</p>
      </div>

      {/* Form Card */}
      <div className="w-full max-w-md bg-[var(--surface)] p-8 rounded-3xl border border-[var(--surface-border)] shadow-xl space-y-6">
        
        {/* Account Type Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">Select Account Type</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setAccountType("renter")}
              className={`p-3 rounded-2xl border text-left transition-all ${
                accountType === "renter"
                  ? "border-[#FF5A36] bg-[#FFF1EE]/50 dark:bg-[#FF5A36]/10 text-[#FF5A36]"
                  : "border-[var(--surface-border)] text-[var(--text-secondary)]"
              }`}
            >
              <User className="h-5 w-5 mb-1" />
              <div className="font-bold text-xs">Student / Renter</div>
              <div className="text-[10px] text-[var(--text-muted)]">Looking for a stay</div>
            </button>

            <button
              type="button"
              onClick={() => setAccountType("owner")}
              className={`p-3 rounded-2xl border text-left transition-all ${
                accountType === "owner"
                  ? "border-[#FF5A36] bg-[#FFF1EE]/50 dark:bg-[#FF5A36]/10 text-[#FF5A36]"
                  : "border-[var(--surface-border)] text-[var(--text-secondary)]"
              }`}
            >
              <Building2 className="h-5 w-5 mb-1" />
              <div className="font-bold text-xs">Host Partner</div>
              <div className="text-[10px] text-[var(--text-muted)]">Listing PG/Hostel</div>
            </button>
          </div>
        </div>

        {formError && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs text-center font-semibold">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--text-primary)]">Full Name</label>
            <Input
              type="text"
              icon={<User className="h-4 w-4" />}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Kaushik Sharma"
              required
              disabled={isSubmitting}
            />
          </div>

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
            <label className="text-xs font-bold text-[var(--text-primary)]">Phone Number</label>
            <Input
              type="tel"
              icon={<Phone className="h-4 w-4" />}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--text-primary)]">Password</label>
            <Input
              type="password"
              icon={<Lock className="h-4 w-4" />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
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
                <span>Registering...</span>
              </>
            ) : (
              <span>Create {accountType === "owner" ? "Host" : "Renter"} Account</span>
            )}
          </Button>
        </form>

        <div className="text-center text-xs text-[var(--text-secondary)] pt-4 border-t border-[var(--surface-border)]">
          Already registered?{" "}
          <Link href="/sign-in" className="font-bold text-[#FF5A36] hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
