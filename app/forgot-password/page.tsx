"use client";

import * as React from "react";
import Link from "next/link";
import { Home, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col justify-center items-center px-4 py-12 font-sans">
      <div className="mb-8 text-center space-y-2">
        <Link href="/" className="inline-flex items-center gap-2 font-display font-black text-2xl text-[var(--text-primary)]">
          <div className="h-10 w-10 rounded-2xl bg-[#FF5A36] flex items-center justify-center text-white">
            <Home className="h-5 w-5" />
          </div>
          <span>FindYourPeace</span>
        </Link>
      </div>

      <div className="w-full max-w-md bg-[var(--surface)] p-8 rounded-3xl border border-[var(--surface-border)] shadow-xl space-y-6 text-center">
        {!submitted ? (
          <>
            <div className="space-y-2">
              <h1 className="font-display font-bold text-xl text-[var(--text-primary)]">Forgot Password?</h1>
              <p className="text-xs text-[var(--text-secondary)]">Enter your registered email address to receive password reset instructions.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-primary)]">Email Address</label>
                <Input
                  type="email"
                  icon={<Mail className="h-4 w-4" />}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                  required
                />
              </div>

              <Button type="submit" variant="primary" size="md" className="w-full bg-[#FF5A36] text-white font-bold rounded-2xl h-12">
                Send Reset Link
              </Button>
            </form>
          </>
        ) : (
          <div className="space-y-4 py-4">
            <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto" />
            <h2 className="font-bold text-lg text-[var(--text-primary)]">Check your inbox</h2>
            <p className="text-xs text-[var(--text-secondary)]">
              We&apos;ve sent a password reset link to <strong className="text-[var(--text-primary)]">{email}</strong>.
            </p>
            <Link href="/reset-password">
              <Button variant="outline" size="sm" className="w-full rounded-xl text-xs font-semibold mt-2">
                Demo: Go to Reset Password Screen
              </Button>
            </Link>
          </div>
        )}

        <div className="pt-4 border-t border-[var(--surface-border)]">
          <Link href="/sign-in" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF5A36] hover:underline">
            <ArrowLeft className="h-4 w-4" /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
