"use client";

import * as React from "react";
import { CalendarCheck, ShieldCheck, CheckCircle2, Clock, Eye, AlertCircle, XCircle, Loader2 } from "lucide-react";
import { UserShell } from "@/components/shells/user-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface PopulatedProperty {
  title?: string;
  images?: string[];
  locality?: string;
  city?: string;
}

interface PopulatedRoom {
  name?: string;
  price?: number;
  occupancy?: string;
}

interface BookingItem {
  id?: string;
  _id?: string;
  bookingCode: string;
  status: "PENDING" | "CONFIRMED" | "REJECTED" | "CANCELLED" | "COMPLETED";
  checkInDate: string;
  checkOutDate: string;
  totalAmount?: number;
  monthlyRent?: number;
  depositAmount?: number;
  deposit?: number;
  propertyId?: PopulatedProperty | string;
  property?: PopulatedProperty | string;
  roomId?: PopulatedRoom | string;
  room?: PopulatedRoom | string;
  createdAt: string;
}

export default function BookingsPage() {
  const [bookings, setBookings] = React.useState<BookingItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedBooking, setSelectedBooking] = React.useState<BookingItem | null>(null);
  const [cancellingId, setCancellingId] = React.useState<string | null>(null);

  const fetchBookings = React.useCallback(async () => {
    try {
      const res = await fetch("/api/v1/bookings");
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings || []);
      }
    } catch {
      // Fallback empty list
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    let active = true;
    fetch("/api/v1/bookings")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data) {
          setBookings(data.bookings || []);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleCancelBooking = async (bookingId: string) => {
    setCancellingId(bookingId);
    try {
      const res = await fetch(`/api/v1/bookings/${bookingId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" }),
      });

      if (res.ok) {
        setSelectedBooking(null);
        await fetchBookings();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to cancel booking request.");
      }
    } catch {
      alert("Failed to cancel booking request.");
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <UserShell>
      <div className="space-y-6">
        <div className="border-b border-[var(--surface-border)] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="font-display font-extrabold text-2xl text-[var(--text-primary)]">Booking Requests & Stays</h1>
            <p className="text-xs text-[var(--text-secondary)]">Track submitted accommodation requests, host decision statuses, and check-in details</p>
          </div>
          <Badge variant="emerald" size="sm" className="w-fit">Real Session Sync</Badge>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-[var(--text-muted)] flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-[#FF5A36]" />
            <span>Loading your accommodation bookings...</span>
          </div>
        ) : bookings.length === 0 ? (
          <Card className="p-12 text-center rounded-3xl border border-[var(--surface-border)] bg-[var(--surface)] space-y-4">
            <CalendarCheck className="h-12 w-12 text-[var(--text-muted)] mx-auto opacity-50" />
            <div className="space-y-1">
              <h3 className="font-bold text-lg text-[var(--text-primary)]">No Active Booking Requests</h3>
              <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
                Explore student PGs and co-living spaces on the FindYourPeace marketplace to request your move-in.
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {bookings.map((bk) => {
              const bookingId = bk._id || bk.id || "";
              const propObj = typeof bk.property === "object" && bk.property !== null ? bk.property : typeof bk.propertyId === "object" && bk.propertyId !== null ? bk.propertyId : null;
              const roomObj = typeof bk.room === "object" && bk.room !== null ? bk.room : typeof bk.roomId === "object" && bk.roomId !== null ? bk.roomId : null;
              const propTitle = propObj?.title || "FindYourPeace Accommodation";
              const roomName = roomObj?.name || "Standard Room";
              const locality = propObj?.locality || "";
              const city = propObj?.city || "";
              const displayAmount = bk.totalAmount ?? bk.monthlyRent ?? roomObj?.price ?? 0;

              return (
                <Card
                  key={bookingId || bk.bookingCode}
                  className={`p-6 rounded-3xl border-2 transition-all space-y-4 bg-[var(--surface)] ${
                    bk.status === "PENDING"
                      ? "border-amber-500/40"
                      : bk.status === "CONFIRMED"
                      ? "border-emerald-500/40"
                      : bk.status === "REJECTED"
                      ? "border-rose-500/40 opacity-80"
                      : "border-[var(--surface-border)] opacity-60"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[var(--surface-border)] pb-3 gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-lg text-[var(--text-primary)]">{propTitle}</h3>
                        {bk.status === "PENDING" && (
                          <Badge variant="amber" size="sm">
                            <Clock className="h-3 w-3 mr-1" /> PENDING OWNER APPROVAL
                          </Badge>
                        )}
                        {bk.status === "CONFIRMED" && (
                          <Badge variant="emerald" size="sm">
                            <CheckCircle2 className="h-3 w-3 mr-1" /> CONFIRMED BY HOST
                          </Badge>
                        )}
                        {bk.status === "REJECTED" && (
                          <Badge variant="rose" size="sm">
                            <XCircle className="h-3 w-3 mr-1" /> DECLINED BY HOST
                          </Badge>
                        )}
                        {bk.status === "CANCELLED" && (
                          <Badge variant="glass" size="sm">
                            CANCELLED
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-[var(--text-muted)] pt-0.5">
                        Room: <strong>{roomName}</strong> {locality ? `• ${locality}, ${city}` : ""}
                      </div>
                    </div>

                    <div className="text-left sm:text-right">
                      <div className="font-extrabold text-[#FF5A36] text-lg">
                        ₹{displayAmount.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-[var(--text-muted)] font-mono">Ref: {bk.bookingCode}</div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-3 pt-1">
                    <div className="space-y-0.5 text-[var(--text-secondary)]">
                      <div>Move-in Date: <strong className="text-[var(--text-primary)]">{bk.checkInDate ? bk.checkInDate.split("T")[0] : "TBD"}</strong></div>
                      <div>Check-out Date: <strong className="text-[var(--text-primary)]">{bk.checkOutDate ? bk.checkOutDate.split("T")[0] : "TBD"}</strong></div>
                    </div>

                    <div className="flex items-center gap-2">
                      {bk.status === "PENDING" && bookingId && (
                        <Button
                          onClick={() => handleCancelBooking(bookingId)}
                          disabled={cancellingId === bookingId}
                          variant="outline"
                          size="sm"
                          className="rounded-xl text-xs text-rose-500 border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                        >
                          {cancellingId === bookingId ? "Cancelling..." : "Cancel Request"}
                        </Button>
                      )}

                      <Button
                        onClick={() => setSelectedBooking(bk)}
                        variant="outline"
                        size="sm"
                        className="rounded-xl text-xs gap-1"
                      >
                        <Eye className="h-3.5 w-3.5" /> View Request Details
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Booking Details Modal */}
        {selectedBooking && (
          <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
            <DialogContent className="max-w-md space-y-4">
              <DialogHeader>
                <DialogTitle className="text-xl font-display font-extrabold text-[var(--text-primary)]">
                  Booking Request Overview
                </DialogTitle>
                <DialogDescription className="text-xs text-[var(--text-secondary)]">
                  Detailed status breakdown for reference code <span className="font-mono text-[#FF5A36]">{selectedBooking.bookingCode}</span>
                </DialogDescription>
              </DialogHeader>

              <div className="p-4 rounded-2xl bg-[var(--surface-hover)] border border-[var(--surface-border)] text-xs space-y-2.5">
                <div className="flex justify-between items-center border-b border-[var(--surface-border)] pb-2">
                  <span className="font-bold">Lifecycle Status:</span>
                  {selectedBooking.status === "PENDING" && <Badge variant="amber" size="sm">PENDING OWNER APPROVAL</Badge>}
                  {selectedBooking.status === "CONFIRMED" && <Badge variant="emerald" size="sm">CONFIRMED BY HOST</Badge>}
                  {selectedBooking.status === "REJECTED" && <Badge variant="rose" size="sm">DECLINED BY HOST</Badge>}
                  {selectedBooking.status === "CANCELLED" && <Badge variant="glass" size="sm">CANCELLED</Badge>}
                </div>

                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Target Move-in:</span>
                  <span className="font-semibold">{selectedBooking.checkInDate ? selectedBooking.checkInDate.split("T")[0] : "TBD"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Target Check-out:</span>
                  <span className="font-semibold">{selectedBooking.checkOutDate ? selectedBooking.checkOutDate.split("T")[0] : "TBD"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Total Calculated Amount:</span>
                  <span className="font-bold text-[#FF5A36]">₹{(selectedBooking.totalAmount || 0).toLocaleString()}</span>
                </div>
              </div>

              {selectedBooking.status === "PENDING" && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-600 text-xs flex items-start gap-2">
                  <Clock className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>The host has been notified of your request and will review availability.</span>
                </div>
              )}

              <Button
                onClick={() => setSelectedBooking(null)}
                variant="primary"
                size="md"
                className="w-full bg-[#FF5A36] font-bold rounded-2xl"
              >
                Close Details
              </Button>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </UserShell>
  );
}
