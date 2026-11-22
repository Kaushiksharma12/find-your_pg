"use client";

import * as React from "react";
import { Star, MessageSquare } from "lucide-react";
import { OwnerShell } from "@/components/shells/owner-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function OwnerReviewsPage() {
  const [reply, setReply] = React.useState("");
  const [replied, setReplied] = React.useState(false);

  return (
    <OwnerShell>
      <div className="space-y-6">
        <div className="border-b border-[var(--surface-border)] pb-4">
          <h1 className="font-display font-extrabold text-2xl text-[var(--text-primary)]">Tenant Reviews & Rating Feedback</h1>
          <p className="text-xs text-[var(--text-secondary)]">Public feedback left by residents</p>
        </div>

        <Card className="p-6 rounded-3xl border-[var(--surface-border)] bg-[var(--surface)] space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--surface-border)] pb-3">
            <div>
              <h3 className="font-bold text-base text-[var(--text-primary)]">Rahul Sharma</h3>
              <div className="text-xs text-[var(--text-muted)]">Sunrise PG • Rated 4.5 ★</div>
            </div>
            <div className="text-xs font-bold text-amber-500">4.5 / 5.0</div>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">
            &ldquo;Great stay experience, fast wifi and friendly host.&rdquo;
          </p>

          {!replied ? (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Write official host response..."
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                className="flex-1 p-2 rounded-xl border border-[var(--surface-border)] bg-[var(--surface-hover)] text-xs text-[var(--text-primary)]"
              />
              <Button
                onClick={() => setReplied(true)}
                variant="primary"
                size="sm"
                className="bg-[#FF5A36] text-white text-xs rounded-xl font-semibold"
              >
                Post Reply
              </Button>
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-[#FFF1EE] dark:bg-[#FF5A36]/10 border border-[#FF5A36]/20 text-xs text-[#FF5A36]">
              <strong>Host Response:</strong> {reply || "Thank you for the review, Rahul!"}
            </div>
          )}
        </Card>
      </div>
    </OwnerShell>
  );
}
