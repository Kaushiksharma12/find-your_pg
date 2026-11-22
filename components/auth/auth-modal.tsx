"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  X,
  Home,
  Mail,
  Lock,
  User,
  Phone,
  Building2,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AuthModal() {
  const { authModalState, closeAuthModal, login, register } = useAuth();
  const shouldReduceMotion = useReducedMotion();

  const [mode, setMode] = React.useState<"sign-in" | "create-account">("sign-in");
  const [role, setRole] = React.useState<"renter" | "owner">("renter");

  // Form State - strictly clean default values
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [fullName, setFullName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [formError, setFormError] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Sync mode and accountType when modal opens
  const [wasOpen, setWasOpen] = React.useState(false);
  if (authModalState.isOpen && !wasOpen) {
    setWasOpen(true);
    setMode(authModalState.mode);
    if (authModalState.accountType) {
      setRole(authModalState.accountType);
    }
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setFullName("");
    setPhone("");
    setFormError("");
    setIsSubmitting(false);
  } else if (!authModalState.isOpen && wasOpen) {
    setWasOpen(false);
  }

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setFormError("Please fill in both email and password.");
      return;
    }
    setFormError("");
    setIsSubmitting(true);

    const result = await login(
      {
        email,
        password,
        role,
      },
      authModalState.intendedAction
    );

    setIsSubmitting(false);

    if (!result.success) {
      setFormError(result.error || "Invalid email or password.");
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      setFormError("Please complete all required fields.");
      return;
    }
    if (password !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }
    setFormError("");
    setIsSubmitting(true);

    const result = await register(
      {
        name: fullName,
        email,
        password,
        phone,
        role,
      },
      authModalState.intendedAction
    );

    setIsSubmitting(false);

    if (!result.success) {
      setFormError(result.error || "Registration failed.");
    }
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const modalVariants = shouldReduceMotion
    ? {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : {
        hidden: { opacity: 0, scale: 0.96, y: 20 },
        visible: {
          opacity: 1,
          scale: 1,
          y: 0,
          transition: { type: "spring" as const, stiffness: 320, damping: 26 },
        },
        exit: {
          opacity: 0,
          scale: 0.98,
          y: 10,
          transition: { duration: 0.18, ease: "easeOut" as const },
        },
      };

  const contentStaggerVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { delay: 0.08, duration: 0.25 },
    },
  };

  return (
    <DialogPrimitive.Root open={authModalState.isOpen} onOpenChange={(open) => !open && closeAuthModal()}>
      <AnimatePresence>
        {authModalState.isOpen && (
          <DialogPrimitive.Portal forceMount>
            {/* Backdrop */}
            <DialogPrimitive.Overlay asChild>
              <motion.div
                variants={backdropVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4"
              />
            </DialogPrimitive.Overlay>

            {/* Modal Container */}
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 pointer-events-none">
              <DialogPrimitive.Content asChild>
                <motion.div
                  variants={modalVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="pointer-events-auto w-full max-w-md bg-[var(--surface)] border border-[var(--surface-border)] rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto focus:outline-none relative"
                >
                  {/* Close Button */}
                  <DialogPrimitive.Close className="absolute top-4 right-4 h-9 w-9 rounded-full bg-[var(--surface-hover)] border border-[var(--surface-border)] text-[var(--text-secondary)] hover:text-[var(--accent-primary)] flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]">
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                  </DialogPrimitive.Close>

                  {/* Contextual Prompt Banner if present */}
                  {authModalState.reason && (
                    <motion.div
                      variants={contentStaggerVariants}
                      initial="hidden"
                      animate="visible"
                      className="p-3.5 rounded-2xl bg-[var(--accent-light)] border border-[var(--accent-primary)]/30 flex items-center gap-3 text-xs"
                    >
                      <div className="h-8 w-8 rounded-xl bg-[var(--accent-primary)] text-white flex items-center justify-center shrink-0 shadow-sm">
                        <ShieldCheck className="h-4 w-4" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="font-bold text-[var(--text-primary)]">Action Requires Sign In</div>
                        <div className="text-[var(--text-secondary)] font-medium">{authModalState.reason}</div>
                      </div>
                    </motion.div>
                  )}

                  {/* Header / Brand */}
                  <div className="text-center space-y-2 pt-1">
                    <div className="inline-flex items-center gap-2 font-display font-black text-xl text-[var(--text-primary)]">
                      <div className="h-9 w-9 rounded-xl bg-[var(--accent-primary)] flex items-center justify-center text-white shadow-sm">
                        <Home className="h-4 w-4" />
                      </div>
                      <span>FindYourPeace</span>
                    </div>

                    <DialogPrimitive.Title className="text-lg font-bold font-display text-[var(--text-primary)] tracking-tight">
                      {mode === "sign-in" ? "Welcome Back" : "Create Your Account"}
                    </DialogPrimitive.Title>

                    <DialogPrimitive.Description className="text-xs text-[var(--text-secondary)] font-medium">
                      {mode === "sign-in"
                        ? "Sign in to continue discovering and booking student stays."
                        : "Join thousands of students and host partners across India."}
                    </DialogPrimitive.Description>
                  </div>

                  {/* Role Selector Tabs (Renter vs Host Partner - NO ADMIN) */}
                  <div className="grid grid-cols-2 gap-1 bg-[var(--surface-hover)] p-1 rounded-2xl border border-[var(--surface-border)] text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setRole("renter")}
                      className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                        role === "renter"
                          ? "bg-[var(--accent-primary)] text-white shadow-sm font-bold"
                          : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                      }`}
                    >
                      <User className="h-3.5 w-3.5" />
                      <span>Student / Renter</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole("owner")}
                      className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                        role === "owner"
                          ? "bg-[var(--accent-primary)] text-white shadow-sm font-bold"
                          : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                      }`}
                    >
                      <Building2 className="h-3.5 w-3.5" />
                      <span>Host Partner</span>
                    </button>
                  </div>

                  {/* Display Error Message */}
                  {formError && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs text-center font-semibold">
                      {formError}
                    </div>
                  )}

                  {/* Form Body */}
                  <motion.div variants={contentStaggerVariants} initial="hidden" animate="visible">
                    {mode === "sign-in" ? (
                      /* SIGN IN FORM */
                      <form onSubmit={handleSignInSubmit} className="space-y-3.5">
                        <div className="space-y-1">
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

                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-[var(--text-primary)]">Password</label>
                            <Link
                              href="/forgot-password"
                              onClick={closeAuthModal}
                              className="text-xs text-[var(--accent-primary)] hover:underline font-medium"
                            >
                              Forgot Password?
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
                          className="w-full bg-[var(--accent-primary)] hover:opacity-90 text-white font-bold rounded-2xl h-11 shadow-sm mt-2 flex items-center justify-center gap-2"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span>Authenticating...</span>
                            </>
                          ) : (
                            <span>Sign In as {role === "renter" ? "Student" : "Host Partner"}</span>
                          )}
                        </Button>
                      </form>
                    ) : (
                      /* CREATE ACCOUNT FORM */
                      <form onSubmit={handleRegisterSubmit} className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-[var(--text-primary)]">
                            {role === "owner" ? "Full Name / Property Name" : "Full Name"}
                          </label>
                          <Input
                            type="text"
                            icon={<User className="h-4 w-4" />}
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder={role === "owner" ? "e.g. Ramesh Kumar (Sunlight Stay)" : "e.g. Kaushik Sharma"}
                            required
                            disabled={isSubmitting}
                          />
                        </div>

                        <div className="space-y-1">
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

                        <div className="space-y-1">
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

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-[var(--text-primary)]">Password</label>
                            <Input
                              type="password"
                              icon={<Lock className="h-4 w-4" />}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="Min 6 chars"
                              required
                              disabled={isSubmitting}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-[var(--text-primary)]">Confirm Password</label>
                            <Input
                              type="password"
                              icon={<Lock className="h-4 w-4" />}
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              placeholder="Re-enter password"
                              required
                              disabled={isSubmitting}
                            />
                          </div>
                        </div>

                        <Button
                          type="submit"
                          variant="primary"
                          size="md"
                          disabled={isSubmitting}
                          className="w-full bg-[var(--accent-primary)] hover:opacity-90 text-white font-bold rounded-2xl h-11 shadow-sm mt-2 flex items-center justify-center gap-2"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span>Registering...</span>
                            </>
                          ) : (
                            <span>Register as {role === "renter" ? "Student" : "Host Partner"}</span>
                          )}
                        </Button>
                      </form>
                    )}
                  </motion.div>

                  {/* Switch between Sign In and Create Account */}
                  <div className="text-center text-xs text-[var(--text-secondary)] pt-3 border-t border-[var(--surface-border)] font-medium">
                    {mode === "sign-in" ? (
                      <>
                        Don&apos;t have an account?{" "}
                        <button
                          type="button"
                          onClick={() => {
                            setMode("create-account");
                            setFormError("");
                          }}
                          className="font-bold text-[var(--accent-primary)] hover:underline"
                        >
                          Create Account
                        </button>
                      </>
                    ) : (
                      <>
                        Already registered?{" "}
                        <button
                          type="button"
                          onClick={() => {
                            setMode("sign-in");
                            setFormError("");
                          }}
                          className="font-bold text-[var(--accent-primary)] hover:underline"
                        >
                          Sign In
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>
              </DialogPrimitive.Content>
            </div>
          </DialogPrimitive.Portal>
        )}
      </AnimatePresence>
    </DialogPrimitive.Root>
  );
}
