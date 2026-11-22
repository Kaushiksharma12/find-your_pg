"use client";

import * as React from "react";
import { Settings, ShieldCheck, Building, CreditCard } from "lucide-react";
import { OwnerShell } from "@/components/shells/owner-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function OwnerSettingsPage() {
  return (
    <OwnerShell>
      <div className="space-y-6 max-w-2xl">
        <div className="border-b border-[var(--surface-border)] pb-4">
          <h1 className="font-display font-extrabold text-2xl text-[var(--text-primary)]">Host Partner Settings</h1>
          <p className="text-xs text-[var(--text-secondary)]">Business profile, payout bank account & notification settings</p>
        </div>

        <Card className="p-6 rounded-3xl border-[var(--surface-border)] bg-[var(--surface)] space-y-6">
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-[var(--text-primary)]">Payout Bank Account</h3>
            <div className="p-4 rounded-2xl bg-[var(--surface-hover)] border border-[var(--surface-border)] text-xs space-y-1">
              <div>Bank Name: <strong>HDFC Bank Ltd</strong></div>
              <div>Account Number: <strong>•••• •••• 4921</strong></div>
              <div>IFSC Code: <strong>HDFC0001234</strong></div>
            </div>
            <Button variant="outline" size="sm" className="rounded-xl text-xs">
              Update Bank Details
            </Button>
          </div>
        </Card>
      </div>
    </OwnerShell>
  );
}
