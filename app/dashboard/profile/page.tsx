"use client";

import * as React from "react";
import { User, Mail, Phone, GraduationCap, MapPin, CheckCircle2 } from "lucide-react";
import { UserShell } from "@/components/shells/user-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { MOCK_USER_PROFILE } from "@/lib/mock-data";

export default function ProfilePage() {
  const [profile, setProfile] = React.useState(MOCK_USER_PROFILE);
  const [saved, setSaved] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <UserShell>
      <div className="space-y-6">
        <div className="border-b border-[var(--surface-border)] pb-4">
          <h1 className="font-display font-extrabold text-2xl text-[var(--text-primary)]">My Profile</h1>
          <p className="text-xs text-[var(--text-secondary)]">Manage your personal information and student preferences</p>
        </div>

        <Card className="p-6 rounded-3xl border-[var(--surface-border)] bg-[var(--surface)] max-w-2xl space-y-6">
          <div className="flex items-center gap-4 border-b border-[var(--surface-border)] pb-6">
            <img src={profile.avatar} alt={profile.name} className="w-16 h-16 rounded-full object-cover border-2 border-[#FF5A36]" />
            <div>
              <div className="font-bold text-lg text-[var(--text-primary)]">{profile.name}</div>
              <div className="text-xs text-[#FF5A36] font-semibold">{profile.role}</div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-primary)]">Full Name</label>
                <Input icon={<User className="h-4 w-4" />} value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-primary)]">Email Address</label>
                <Input icon={<Mail className="h-4 w-4" />} value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-primary)]">Phone Number</label>
                <Input icon={<Phone className="h-4 w-4" />} value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-primary)]">College / Workplace</label>
                <Input icon={<GraduationCap className="h-4 w-4" />} value={profile.college} onChange={(e) => setProfile({ ...profile, college: e.target.value })} />
              </div>
            </div>

            <Button type="submit" variant="primary" size="md" className="bg-[#FF5A36] text-white font-bold rounded-2xl">
              Save Changes
            </Button>
            {saved && (
              <span className="text-xs font-bold text-emerald-500 flex items-center gap-1 inline-block ml-4">
                <CheckCircle2 className="h-4 w-4" /> Profile updated successfully!
              </span>
            )}
          </form>
        </Card>
      </div>
    </UserShell>
  );
}
