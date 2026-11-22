"use client";

import * as React from "react";
import { Star, MessageSquare } from "lucide-react";
import { UserShell } from "@/components/shells/user-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function UserReviewsPage() {
  return (
    <UserShell>
      <div className="space-y-6">
        <div className="border-b border-[var(--surface-border)] pb-4">
          <h1 className="font-display font-extrabold text-2xl text-[var(--text-primary)]">My Reviews</h1>
          <p className="text-xs text-[var(--text-secondary)]">Feedback you have shared for visited student residences</p>
        </div>

        <Card className="p-6 rounded-3xl border-[var(--surface-border)] bg-[var(--surface)] space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--surface-border)] pb-3">
            <div>
              <h3 className="font-bold text-base text-[var(--text-primary)]">Aura Spatial Heights</h3>
              <div className="text-xs text-[var(--text-muted)]">Kothrud, Pune • Reviewed on Sep 14, 2026</div>
            </div>
            <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
              <Star className="h-4 w-4 fill-amber-500" /> 5.0
            </div>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">
            &ldquo;Awesome study room and high speed wifi. Food quality was great for student living!&rdquo;
          </p>
        </Card>
      </div>
    </UserShell>
  );
}
