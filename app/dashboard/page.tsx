"use client";

import * as React from "react";
import Link from "next/link";
import {
  MessageSquare,
  Calendar,
  CalendarCheck,
  Heart,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Star,
} from "lucide-react";

import { UserShell } from "@/components/shells/user-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MOCK_USER_PROFILE, PROPERTIES_DATA } from "@/lib/mock-data";

export default function UserDashboardPage() {
  const recommendedProperty = PROPERTIES_DATA[0];

  return (
    <UserShell>
      <div className="space-y-8">
        
        {/* Welcome Banner */}
        <div className="bg-[var(--surface)] p-6 rounded-3xl border border-[var(--surface-border)] shadow-sm space-y-1">
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--text-primary)]">
            Welcome back, {MOCK_USER_PROFILE.name.split(" ")[0]}!
          </h1>
          <p className="text-xs text-[var(--text-secondary)]">
            Here&apos;s what&apos;s happening with your accommodation journey.
          </p>
        </div>

        {/* Top 4 KPI Metric Cards (Matching Reference Image) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Enquiries */}
          <Link href="/dashboard/enquiries">
            <Card className="p-4 rounded-3xl border-[var(--surface-border)] bg-[var(--surface)] hover:border-[#FF5A36]/50 transition-all card-hover-effect cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-2xl bg-[#FFF1EE] dark:bg-[#FF5A36]/10 text-[#FF5A36] flex items-center justify-center font-bold">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <Badge variant="terracotta" size="sm">Active</Badge>
              </div>
              <div className="mt-4">
                <div className="font-display font-black text-2xl text-[var(--text-primary)]">
                  {MOCK_USER_PROFILE.stats.enquiries}
                </div>
                <div className="text-xs font-semibold text-[var(--text-secondary)]">Active Enquiries</div>
              </div>
            </Card>
          </Link>

          {/* Card 2: Upcoming Visit */}
          <Link href="/dashboard/visits">
            <Card className="p-4 rounded-3xl border-[var(--surface-border)] bg-[var(--surface)] hover:border-amber-500/50 transition-all card-hover-effect cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-2xl bg-amber-100 dark:bg-amber-900/40 text-amber-500 flex items-center justify-center font-bold">
                  <Calendar className="h-5 w-5" />
                </div>
                <Badge variant="glass" size="sm" className="text-amber-500 bg-amber-50 dark:bg-amber-950">Scheduled</Badge>
              </div>
              <div className="mt-4">
                <div className="font-display font-black text-2xl text-[var(--text-primary)]">
                  {MOCK_USER_PROFILE.stats.upcomingVisits}
                </div>
                <div className="text-xs font-semibold text-[var(--text-secondary)]">Upcoming Visit</div>
              </div>
            </Card>
          </Link>

          {/* Card 3: Active Booking */}
          <Link href="/dashboard/bookings">
            <Card className="p-4 rounded-3xl border-[var(--surface-border)] bg-[var(--surface)] hover:border-emerald-500/50 transition-all card-hover-effect cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-500 flex items-center justify-center font-bold">
                  <CalendarCheck className="h-5 w-5" />
                </div>
                <Badge variant="glass" size="sm" className="text-emerald-500 bg-emerald-50 dark:bg-emerald-950">Confirmed</Badge>
              </div>
              <div className="mt-4">
                <div className="font-display font-black text-2xl text-[var(--text-primary)]">
                  {MOCK_USER_PROFILE.stats.activeBookings}
                </div>
                <div className="text-xs font-semibold text-[var(--text-secondary)]">Active Booking</div>
              </div>
            </Card>
          </Link>

          {/* Card 4: Shortlisted PGs */}
          <Link href="/dashboard/saved">
            <Card className="p-4 rounded-3xl border-[var(--surface-border)] bg-[var(--surface)] hover:border-[#FF5A36]/50 transition-all card-hover-effect cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-2xl bg-[#FFF1EE] dark:bg-[#FF5A36]/10 text-[#FF5A36] flex items-center justify-center font-bold">
                  <Heart className="h-5 w-5 fill-[#FF5A36]" />
                </div>
                <Badge variant="glass" size="sm" className="text-[#FF5A36] bg-[#FFF1EE] dark:bg-[#FF5A36]/20">Saved</Badge>
              </div>
              <div className="mt-4">
                <div className="font-display font-black text-2xl text-[var(--text-primary)]">
                  {MOCK_USER_PROFILE.stats.shortlisted}
                </div>
                <div className="text-xs font-semibold text-[var(--text-secondary)]">Shortlisted PGs</div>
              </div>
            </Card>
          </Link>
        </div>

        {/* Main 2-Column Split: Activity Stream vs Recommended Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Panel: Recent Activity Timeline */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg text-[var(--text-primary)]">Recent Activity</h2>
              <Link href="/dashboard/notifications" className="text-xs font-semibold text-[#FF5A36] hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-3">
              {MOCK_USER_PROFILE.activities.map((act) => (
                <Card
                  key={act.id}
                  className="p-4 rounded-2xl border-[var(--surface-border)] bg-[var(--surface)] flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-[var(--surface-hover)] border border-[var(--surface-border)] flex items-center justify-center text-[#FF5A36]">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-[var(--text-primary)]">{act.title}</div>
                      <div className="text-[10px] text-[var(--text-muted)]">{act.time}</div>
                    </div>
                  </div>

                  <Badge
                    variant={
                      act.statusVariant === "success"
                        ? "emerald"
                        : act.statusVariant === "warning"
                        ? "amber"
                        : "terracotta"
                    }
                    size="sm"
                  >
                    {act.status}
                  </Badge>
                </Card>
              ))}
            </div>
          </div>

          {/* Right Panel: Recommended for You Card (Matching Reference Image) */}
          <div className="lg:col-span-4 space-y-4">
            <h2 className="font-bold text-lg text-[var(--text-primary)]">Recommended For You</h2>

            <Card className="rounded-3xl overflow-hidden border-[var(--surface-border)] bg-[var(--surface)] shadow-md space-y-3">
              <div className="relative h-44 w-full">
                <img
                  src={recommendedProperty.images[0]}
                  alt={recommendedProperty.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-[#FF5A36]">
                  <Heart className="h-4 w-4 fill-[#FF5A36]" />
                </div>
              </div>

              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[var(--text-primary)]">{recommendedProperty.title}</span>
                  <span className="font-bold text-amber-500 flex items-center gap-1">
                    <Star className="h-3 w-3 fill-amber-500" /> {recommendedProperty.rating}
                  </span>
                </div>

                <div className="text-[11px] text-[var(--text-muted)] flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-[#FF5A36]" />
                  <span>{recommendedProperty.locality}, {recommendedProperty.city}</span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[var(--surface-border)]">
                  <div className="font-bold text-sm text-[#FF5A36]">
                    ₹{recommendedProperty.startingPrice.toLocaleString()} <span className="text-[10px] text-[var(--text-secondary)] font-normal">/mo</span>
                  </div>
                  <Link href={`/properties/${recommendedProperty.id}`}>
                    <Button variant="primary" size="sm" className="bg-[#FF5A36] text-xs rounded-xl">
                      View Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </UserShell>
  );
}
