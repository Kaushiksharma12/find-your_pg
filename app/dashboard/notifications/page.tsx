"use client";

import * as React from "react";
import { Bell, CheckCircle2 } from "lucide-react";
import { UserShell } from "@/components/shells/user-shell";
import { Card } from "@/components/ui/card";
import { MOCK_USER_PROFILE } from "@/lib/mock-data";

export default function NotificationsPage() {
  return (
    <UserShell>
      <div className="space-y-6">
        <div className="border-b border-[var(--surface-border)] pb-4">
          <h1 className="font-display font-extrabold text-2xl text-[var(--text-primary)]">Notifications</h1>
          <p className="text-xs text-[var(--text-secondary)]">Recent updates regarding your visits, enquiries, and stay status</p>
        </div>

        <div className="space-y-3">
          {MOCK_USER_PROFILE.activities.map((item) => (
            <Card key={item.id} className="p-4 rounded-2xl border-[var(--surface-border)] bg-[var(--surface)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-[#FF5A36]" />
                <div>
                  <div className="font-bold text-xs text-[var(--text-primary)]">{item.title}</div>
                  <div className="text-[10px] text-[var(--text-muted)]">{item.time}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </UserShell>
  );
}
