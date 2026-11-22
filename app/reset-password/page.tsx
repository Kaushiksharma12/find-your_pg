"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Home, Lock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [done, setDone] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    setDone(true);
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

      <div className="w-full max-w-md bg-[var(--surface)] p-8 rounded-3xl border border-[var(--surface-border)] shadow-xl space-y-6">
        {!done ? (
          <>
            <div className="space-y-2 text-center">
              <h1 className="font-display font-bold text-xl text-[var(--text-primary)]">Reset Password</h1>
              <p className="text-xs text-[var(--text-secondary)]">Create a new secure password for your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-primary)]">New Password</label>
                <Input
                  type="password"
                  icon={<Lock className="h-4 w-4" />}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-primary)]">Confirm Password</label>
                <Input
                  type="password"
                  icon={<Lock className="h-4 w-4" />}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  required
                />
              </div>

              <Button type="submit" variant="primary" size="md" className="w-full bg-[#FF5A36] text-white font-bold rounded-2xl h-12">
                Update Password
              </Button>
            </form>
          </>
        ) : (
          <div className="space-y-4 py-4 text-center">
            <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto" />
            <h2 className="font-bold text-lg text-[var(--text-primary)]">Password Updated Successfully</h2>
            <p className="text-xs text-[var(--text-secondary)]">You can now sign in with your new password.</p>
            <Button onClick={() => router.push("/sign-in")} variant="primary" size="md" className="w-full bg-[#FF5A36]">
              Sign In Now
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
