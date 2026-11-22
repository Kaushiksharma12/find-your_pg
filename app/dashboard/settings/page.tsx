"use client";

import * as React from "react";
import { Settings, Shield, Bell, Moon } from "lucide-react";
import { UserShell } from "@/components/shells/user-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function UserSettingsPage() {
  return (
    <UserShell>
      <div className="space-y-6">
        <div className="border-b border-[var(--surface-border)] pb-4">
          <h1 className="font-display font-extrabold text-2xl text-[var(--text-primary)]">Account Settings</h1>
          <p className="text-xs text-[var(--text-secondary)]">Manage security, communication, and system preferences</p>
        </div>

        <Card className="p-6 rounded-3xl border-[var(--surface-border)] bg-[var(--surface)] max-w-xl space-y-6">
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-[var(--text-primary)]">Notification Preferences</h3>
            <label className="flex items-center justify-between text-xs text-[var(--text-secondary)] cursor-pointer">
              <span>Email updates on enquiry replies</span>
              <input type="checkbox" defaultChecked className="accent-[#FF5A36]" />
            </label>
            <label className="flex items-center justify-between text-xs text-[var(--text-secondary)] cursor-pointer">
              <span>SMS reminders for scheduled site visits</span>
              <input type="checkbox" defaultChecked className="accent-[#FF5A36]" />
            </label>
          </div>

          <div className="border-t border-[var(--surface-border)] pt-4 space-y-4">
            <h3 className="font-bold text-sm text-[var(--text-primary)]">Security</h3>
            <Button variant="outline" size="sm" className="rounded-xl text-xs">
              Change Account Password
            </Button>
          </div>
        </Card>
      </div>
    </UserShell>
  );
}
