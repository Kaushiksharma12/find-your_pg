"use client";

import * as React from "react";
import { Calendar, CheckCircle2 } from "lucide-react";
import { OwnerShell } from "@/components/shells/owner-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function OwnerVisitsPage() {
  return (
    <OwnerShell>
      <div className="space-y-6">
        <div className="border-b border-[var(--surface-border)] pb-4">
          <h1 className="font-display font-extrabold text-2xl text-[var(--text-primary)]">Site Visit Requests</h1>
          <p className="text-xs text-[var(--text-secondary)]">Approve and confirm physical PG walkthrough requests</p>
        </div>

        <Card className="p-6 rounded-3xl border-[var(--surface-border)] bg-[var(--surface)] space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--surface-border)] pb-3">
            <div>
              <h3 className="font-bold text-base text-[var(--text-primary)]">Kaushik Sharma</h3>
              <div className="text-xs text-[var(--text-muted)]">Sunrise PG & Student Living • Oct 12, 2026 at 04:00 PM</div>
            </div>
            <Badge variant="amber" size="sm">Pending Approval</Badge>
          </div>

          <div className="flex gap-3">
            <Button onClick={() => alert("Visit Request Approved!")} variant="primary" size="sm" className="bg-emerald-600 text-white rounded-xl text-xs">
              Confirm Slot
            </Button>
            <Button onClick={() => alert("Visit Rescheduled!")} variant="outline" size="sm" className="rounded-xl text-xs">
              Reschedule Slot
            </Button>
          </div>
        </Card>
      </div>
    </OwnerShell>
  );
}
