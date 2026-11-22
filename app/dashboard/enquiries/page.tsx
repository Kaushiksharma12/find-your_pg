"use client";

import * as React from "react";
import { MessageSquare, Clock, CheckCircle2 } from "lucide-react";
import { UserShell } from "@/components/shells/user-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MOCK_USER_PROFILE } from "@/lib/mock-data";

export default function EnquiriesPage() {
  return (
    <UserShell>
      <div className="space-y-6">
        <div className="border-b border-[var(--surface-border)] pb-4">
          <h1 className="font-display font-extrabold text-2xl text-[var(--text-primary)]">My Enquiries</h1>
          <p className="text-xs text-[var(--text-secondary)]">Track questions sent to PG owners & host responses</p>
        </div>

        <div className="space-y-4">
          {MOCK_USER_PROFILE.enquiries.map((enq) => (
            <Card key={enq.id} className="p-6 rounded-3xl border-[var(--surface-border)] bg-[var(--surface)] space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--surface-border)] pb-3">
                <div>
                  <h3 className="font-bold text-base text-[var(--text-primary)]">{enq.propertyName}</h3>
                  <div className="text-xs text-[var(--text-muted)]">{enq.location} • Sent on {enq.date}</div>
                </div>
                <Badge variant="amber" size="sm">{enq.status}</Badge>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-2xl bg-[var(--surface-hover)] border border-[var(--surface-border)] text-[var(--text-secondary)]">
                  <strong>My Question:</strong> &ldquo;{enq.message}&rdquo;
                </div>

                {enq.hostResponse && (
                  <div className="p-3 rounded-2xl bg-[#FFF1EE] dark:bg-[#FF5A36]/10 border border-[#FF5A36]/20 text-[#FF5A36]">
                    <strong>Host Answer:</strong> &ldquo;{enq.hostResponse}&rdquo;
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </UserShell>
  );
}
