"use client";

import * as React from "react";
import { Inbox, CheckCircle2 } from "lucide-react";
import { OwnerShell } from "@/components/shells/owner-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MOCK_OWNER_DATA } from "@/lib/mock-data";

export default function OwnerEnquiriesPage() {
  const [replyText, setReplyText] = React.useState<{ [key: string]: string }>({});

  const handleSendReply = (id: string) => {
    alert(`Reply sent to tenant!`);
    setReplyText((prev) => ({ ...prev, [id]: "" }));
  };

  return (
    <OwnerShell>
      <div className="space-y-6">
        <div className="border-b border-[var(--surface-border)] pb-4">
          <h1 className="font-display font-extrabold text-2xl text-[var(--text-primary)]">Inbound Student Enquiries</h1>
          <p className="text-xs text-[var(--text-secondary)]">Respond to questions from prospective student renters</p>
        </div>

        <div className="space-y-4">
          {MOCK_OWNER_DATA.incomingEnquiries.map((enq) => (
            <Card key={enq.id} className="p-6 rounded-3xl border-[var(--surface-border)] bg-[var(--surface)] space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--surface-border)] pb-3">
                <div>
                  <h3 className="font-bold text-base text-[var(--text-primary)]">{enq.senderName}</h3>
                  <div className="text-xs text-[var(--text-muted)]">Target: {enq.property} • Date: {enq.date}</div>
                </div>
                <Badge variant="amber" size="sm">{enq.status}</Badge>
              </div>

              <div className="p-3 rounded-2xl bg-[var(--surface-hover)] border border-[var(--surface-border)] text-xs text-[var(--text-secondary)]">
                &ldquo;{enq.question}&rdquo;
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type your response to student..."
                  value={replyText[enq.id] || ""}
                  onChange={(e) => setReplyText({ ...replyText, [enq.id]: e.target.value })}
                  className="flex-1 p-2.5 rounded-xl border border-[var(--surface-border)] bg-[var(--surface-hover)] text-xs text-[var(--text-primary)]"
                />
                <Button
                  onClick={() => handleSendReply(enq.id)}
                  variant="primary"
                  size="sm"
                  className="bg-[#FF5A36] text-white rounded-xl text-xs font-bold"
                >
                  Send Reply
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </OwnerShell>
  );
}
