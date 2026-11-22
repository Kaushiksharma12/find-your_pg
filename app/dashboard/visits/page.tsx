"use client";

import * as React from "react";
import { Calendar, MapPin, Phone, CheckCircle2 } from "lucide-react";
import { UserShell } from "@/components/shells/user-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MOCK_USER_PROFILE } from "@/lib/mock-data";

export default function VisitsPage() {
  return (
    <UserShell>
      <div className="space-y-6">
        <div className="border-b border-[var(--surface-border)] pb-4">
          <h1 className="font-display font-extrabold text-2xl text-[var(--text-primary)]">Scheduled Site Visits</h1>
          <p className="text-xs text-[var(--text-secondary)]">Manage your physical PG inspection appointments</p>
        </div>

        <div className="space-y-4">
          {MOCK_USER_PROFILE.visits.map((vis) => (
            <Card key={vis.id} className="p-6 rounded-3xl border-[var(--surface-border)] bg-[var(--surface)] space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--surface-border)] pb-3">
                <div>
                  <h3 className="font-bold text-base text-[var(--text-primary)]">{vis.propertyName}</h3>
                  <div className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-[#FF5A36]" /> {vis.location}
                  </div>
                </div>
                <Badge variant="emerald" size="sm">{vis.status}</Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-2xl bg-[var(--surface-hover)] border border-[var(--surface-border)]">
                  <div className="text-[var(--text-muted)] uppercase font-bold text-[10px]">Time Slot</div>
                  <div className="font-bold text-[var(--text-primary)]">{vis.scheduledDate}</div>
                </div>
                <div className="p-3 rounded-2xl bg-[var(--surface-hover)] border border-[var(--surface-border)]">
                  <div className="text-[var(--text-muted)] uppercase font-bold text-[10px]">Host Contact</div>
                  <div className="font-bold text-[var(--text-primary)]">{vis.contactPerson}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </UserShell>
  );
}
