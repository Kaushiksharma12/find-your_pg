"use client";

import * as React from "react";
import Link from "next/link";
import {
  Building2,
  BedDouble,
  Inbox,
  TrendingUp,
  Plus,
  ArrowRight,
  CheckCircle2,
  Clock,
  UserCheck,
} from "lucide-react";

import { OwnerShell } from "@/components/shells/owner-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MOCK_OWNER_DATA } from "@/lib/mock-data";

export default function OwnerDashboardPage() {
  return (
    <OwnerShell>
      <div className="space-y-8">
        
        {/* Welcome Header */}
        <div className="bg-[var(--surface)] p-6 rounded-3xl border border-[var(--surface-border)] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="font-display font-extrabold text-2xl text-[var(--text-primary)]">
                Host Partner Hub
              </h1>
              <Badge variant="amber" size="sm">DEMO DATA — UI PREVIEW</Badge>
            </div>
            <p className="text-xs text-[var(--text-secondary)]">Manage your PG properties, room inventory & booking approval requests</p>
          </div>
          <Link href="/owner/properties/new">
            <Button variant="primary" size="md" className="bg-[#FF5A36] hover:bg-[#E0482B] text-white rounded-2xl gap-2 font-bold shadow-md">
              <Plus className="h-4 w-4" /> Add New Property
            </Button>
          </Link>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 rounded-3xl border-[var(--surface-border)] bg-[var(--surface)] space-y-2">
            <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Active Properties</div>
            <div className="font-display font-black text-3xl text-emerald-500">{MOCK_OWNER_DATA.stats.totalProperties}</div>
            <div className="text-[10px] text-[var(--text-secondary)]">Listings in preview</div>
          </Card>

          <Card className="p-4 rounded-3xl border-[var(--surface-border)] bg-[var(--surface)] space-y-2">
            <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Active Rooms</div>
            <div className="font-display font-black text-3xl text-[var(--text-primary)]">{MOCK_OWNER_DATA.stats.activeRooms}</div>
            <div className="text-[10px] text-[var(--text-secondary)]">Occupancy: <strong className="text-emerald-500">{MOCK_OWNER_DATA.stats.occupancyRate} (Demo)</strong></div>
          </Card>

          <Card className="p-4 rounded-3xl border-[var(--surface-border)] bg-[var(--surface)] space-y-2">
            <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Pending Enquiries</div>
            <div className="font-display font-black text-3xl text-amber-500">{MOCK_OWNER_DATA.stats.pendingEnquiries}</div>
            <div className="text-[10px] text-[var(--text-secondary)]">Awaiting host response</div>
          </Card>

          <Card className="p-4 rounded-3xl border-[var(--surface-border)] bg-[var(--surface)] space-y-2">
            <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Est. Monthly Revenue</div>
            <div className="font-display font-black text-2xl text-[#FF5A36]">{MOCK_OWNER_DATA.stats.monthlyRevenue}</div>
            <div className="text-[10px] text-[var(--text-secondary)]">Preview calculated metric</div>
          </Card>
        </div>

        {/* Incoming Requests Stream */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 rounded-3xl border-[var(--surface-border)] bg-[var(--surface)] space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--surface-border)] pb-3">
              <h3 className="font-bold text-base text-[var(--text-primary)] flex items-center gap-2">
                <Inbox className="h-4 w-4 text-[#FF5A36]" /> Inbound Student Enquiries
              </h3>
              <Link href="/owner/enquiries" className="text-xs text-[#FF5A36] font-semibold hover:underline">View All</Link>
            </div>

            <div className="space-y-3">
              {MOCK_OWNER_DATA.incomingEnquiries.map((ie) => (
                <div key={ie.id} className="p-3 rounded-2xl bg-[var(--surface-hover)] border border-[var(--surface-border)] space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[var(--text-primary)]">{ie.senderName} ({ie.property})</span>
                    <Badge variant="amber" size="sm">{ie.status}</Badge>
                  </div>
                  <div className="text-xs text-[var(--text-secondary)]">&ldquo;{ie.question}&rdquo;</div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 rounded-3xl border-[var(--surface-border)] bg-[var(--surface)] space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--surface-border)] pb-3">
              <h3 className="font-bold text-base text-[var(--text-primary)] flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-emerald-500" /> Booking Approvals Queue
              </h3>
              <Link href="/owner/bookings" className="text-xs text-[#FF5A36] font-semibold hover:underline">View All</Link>
            </div>

            <div className="space-y-3">
              {MOCK_OWNER_DATA.bookingRequests.map((br) => (
                <div key={br.id} className="p-3 rounded-2xl bg-[var(--surface-hover)] border border-[var(--surface-border)] flex items-center justify-between">
                  <div className="text-xs">
                    <div className="font-bold text-[var(--text-primary)]">{br.applicantName}</div>
                    <div className="text-[10px] text-[var(--text-muted)]">{br.property} • {br.roomType}</div>
                  </div>
                  <div className="flex gap-2">
                    <Link href="/owner/bookings">
                      <Button variant="primary" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-xs rounded-xl">Review Request</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </OwnerShell>
  );
}
