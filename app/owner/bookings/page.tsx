"use client";

import * as React from "react";
import { CalendarCheck, CheckCircle2, XCircle, Clock, Loader2, User, Building2 } from "lucide-react";
import { OwnerShell } from "@/components/shells/owner-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface PopulatedUser {
  name?: string;
  email?: string;
  phone?: string;
}

interface PopulatedProperty {
  title?: string;
  locality?: string;
  city?: string;
}

interface PopulatedRoom {
  name?: string;
  price?: number;
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
  userId?: PopulatedUser | string;
  user?: PopulatedUser | string;
  propertyId?: PopulatedProperty | string;
  property?: PopulatedProperty | string;
  roomId?: PopulatedRoom | string;
  room?: PopulatedRoom | string;
  createdAt: string;
}

export default function OwnerBookingsPage() {
  const [bookings, setBookings] = React.useState<BookingItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [actionId, setActionId] = React.useState<string | null>(null);

  // FindYourPeace Modal Feedback State
  const [modalFeedback, setModalFeedback] = React.useState<{
    title: string;
    description: string;
    variant: "success" | "error";
  } | null>(null);

  const fetchHostBookings = React.useCallback(async () => {
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

  const handleUpdateStatus = async (bookingId: string, newStatus: "CONFIRMED" | "REJECTED") => {
    setActionId(bookingId);
    try {
      const res = await fetch(`/api/v1/bookings/${bookingId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (res.ok) {
        setModalFeedback({
          title: newStatus === "CONFIRMED" ? "Booking Approved Successfully" : "Booking Request Declined",
          description:
            newStatus === "CONFIRMED"
              ? "The booking has been confirmed. Date-based room inventory has been reserved and the renter has been notified."
              : "The booking request has been declined and inventory has been released.",
          variant: newStatus === "CONFIRMED" ? "success" : "error",
        });
        await fetchHostBookings();
      } else {
        setModalFeedback({
          title: "Action Could Not Be Completed",
          description: data.error || "An error occurred while updating the booking request status.",
          variant: "error",
        });
      }
    } catch {
      setModalFeedback({
        title: "Action Could Not Be Completed",
        description: "Failed to communicate with host management backend.",
        variant: "error",
      });
    } finally {
      setActionId(null);
    }
  };

  return (
    <OwnerShell>
      <div className="space-y-6">
        <div className="border-b border-[var(--surface-border)] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="font-display font-extrabold text-2xl text-[var(--text-primary)]">Booking Approvals Queue</h1>
            <p className="text-xs text-[var(--text-secondary)]">Review and manage move-in applications submitted by prospective tenants</p>
          </div>
          <Badge variant="emerald" size="sm">Host Partner Controls</Badge>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-[var(--text-muted)] flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
            <span>Loading applicant requests...</span>
          </div>
        ) : bookings.length === 0 ? (
          <Card className="p-12 text-center rounded-3xl border border-[var(--surface-border)] bg-[var(--surface)] space-y-4">
            <CalendarCheck className="h-12 w-12 text-[var(--text-muted)] mx-auto opacity-50" />
            <div className="space-y-1">
              <h3 className="font-bold text-lg text-[var(--text-primary)]">No Pending Booking Requests</h3>
              <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
                Applications submitted by students will appear here for your review and approval.
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {bookings.map((req) => {
              const bookingId = req._id || req.id || "";
              const userObj = typeof req.user === "object" && req.user !== null ? req.user : typeof req.userId === "object" && req.userId !== null ? req.userId : null;
              const propObj = typeof req.property === "object" && req.property !== null ? req.property : typeof req.propertyId === "object" && req.propertyId !== null ? req.propertyId : null;
              const roomObj = typeof req.room === "object" && req.room !== null ? req.room : typeof req.roomId === "object" && req.roomId !== null ? req.roomId : null;
              const applicantName = userObj?.name || "Prospective Tenant";
              const applicantEmail = userObj?.email || "";
              const propTitle = propObj?.title || "Property";
              const roomName = roomObj?.name || "Room";
              const displayAmount = req.totalAmount ?? req.monthlyRent ?? roomObj?.price ?? 0;

              return (
                <Card key={bookingId || req.bookingCode} className="p-6 rounded-3xl border border-[var(--surface-border)] bg-[var(--surface)] space-y-4 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[var(--surface-border)] pb-3 gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-[var(--text-primary)]">{applicantName}</h3>
                        {req.status === "PENDING" && <Badge variant="amber" size="sm">PENDING YOUR APPROVAL</Badge>}
                        {req.status === "CONFIRMED" && <Badge variant="emerald" size="sm">CONFIRMED</Badge>}
                        {req.status === "REJECTED" && <Badge variant="rose" size="sm">DECLINED</Badge>}
                        {req.status === "CANCELLED" && <Badge variant="glass" size="sm">CANCELLED BY TENANT</Badge>}
                      </div>
                      <div className="text-xs text-[var(--text-muted)] pt-0.5">
                        Target: <strong>{propTitle}</strong> • {roomName} {applicantEmail ? `(${applicantEmail})` : ""}
                      </div>
                    </div>

                    <div className="text-left sm:text-right">
                      <div className="font-extrabold text-[#FF5A36] text-base">
                        ₹{displayAmount.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-[var(--text-muted)] font-mono">Ref: {req.bookingCode}</div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-3">
                    <div className="space-y-0.5 text-[var(--text-secondary)]">
                      <div>Requested Move-in: <strong>{req.checkInDate ? req.checkInDate.split("T")[0] : "TBD"}</strong></div>
                      <div>Target Check-out: <strong>{req.checkOutDate ? req.checkOutDate.split("T")[0] : "TBD"}</strong></div>
                    </div>

                    {req.status === "PENDING" && bookingId ? (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleUpdateStatus(bookingId, "CONFIRMED")}
                          disabled={actionId === bookingId}
                          variant="primary"
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-xl font-bold gap-1"
                        >
                          {actionId === bookingId ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                          <span>Approve & Reserve Room</span>
                        </Button>

                        <Button
                          onClick={() => handleUpdateStatus(bookingId, "REJECTED")}
                          disabled={actionId === bookingId}
                          variant="outline"
                          size="sm"
                          className="text-xs rounded-xl text-rose-500 border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/20 gap-1"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          <span>Decline Request</span>
                        </Button>
                      </div>
                    ) : (
                      <div className="text-xs text-[var(--text-muted)] font-medium">
                        Request resolution complete ({req.status})
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* FindYourPeace Modal Feedback Dialog (Zero browser alert()) */}
        {modalFeedback && (
          <Dialog open={!!modalFeedback} onOpenChange={() => setModalFeedback(null)}>
            <DialogContent className="max-w-md text-center space-y-4">
              <DialogHeader>
                <div
                  className={`h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-2 ${
                    modalFeedback.variant === "success"
                      ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-500"
                      : "bg-rose-100 dark:bg-rose-950/40 text-rose-500"
                  }`}
                >
                  {modalFeedback.variant === "success" ? <CheckCircle2 className="h-6 w-6" /> : <XCircle className="h-6 w-6" />}
                </div>
                <DialogTitle className="text-xl font-display font-extrabold text-[var(--text-primary)]">
                  {modalFeedback.title}
                </DialogTitle>
                <DialogDescription className="text-xs text-[var(--text-secondary)]">
                  {modalFeedback.description}
                </DialogDescription>
              </DialogHeader>

              <Button
                onClick={() => setModalFeedback(null)}
                variant="primary"
                size="md"
                className="w-full bg-[#FF5A36] text-white font-bold rounded-2xl"
              >
                Acknowledge & Close
              </Button>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </OwnerShell>
  );
}
