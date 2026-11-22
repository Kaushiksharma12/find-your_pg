import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/db/mongoose";
import { Booking } from "@/lib/models/Booking";
import { Notification } from "@/lib/models/Notification";
import { UserInteraction } from "@/lib/models/UserInteraction";
import { getSessionUser } from "@/lib/auth/session";
import { updateBookingStatusSchema } from "@/lib/validators/booking";
import { releaseDateInventory } from "@/lib/services/inventory-service";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid booking ID" }, { status: 400 });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Malformed JSON body" }, { status: 400 });
    }

    const result = updateBookingStatusSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || "Invalid status payload" },
        { status: 400 }
      );
    }

    const { status, declineReason } = result.data;

    await dbConnect();

    const booking = await Booking.findById(id);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const isOwner = booking.owner.toString() === user.id;
    const isRenter = booking.user.toString() === user.id;

    if (!isOwner && !isRenter) {
      return NextResponse.json({ error: "Forbidden: Unauthorized to update this booking" }, { status: 403 });
    }

    const previousStatus = booking.status;

    // Terminal state guard: CANCELLED, REJECTED, and COMPLETED bookings cannot transition further
    if (previousStatus === "CANCELLED" || previousStatus === "REJECTED" || previousStatus === "COMPLETED") {
      return NextResponse.json(
        { error: `Cannot transition booking from terminal state ${previousStatus} to ${status}` },
        { status: 400 }
      );
    }

    // Role-based transition enforcement
    if (isRenter && !isOwner) {
      if (status !== "CANCELLED") {
        return NextResponse.json(
          { error: "Forbidden: Renters can only cancel their booking requests" },
          { status: 403 }
        );
      }
      if (previousStatus !== "PENDING" && previousStatus !== "CONFIRMED") {
        return NextResponse.json(
          { error: `Cannot cancel booking in ${previousStatus} state` },
          { status: 400 }
        );
      }
    } else if (isOwner) {
      const validOwnerTransition =
        (previousStatus === "PENDING" && (status === "CONFIRMED" || status === "REJECTED")) ||
        (previousStatus === "CONFIRMED" && (status === "COMPLETED" || status === "CANCELLED"));

      if (!validOwnerTransition) {
        return NextResponse.json(
          { error: `Invalid booking status transition from ${previousStatus} to ${status}` },
          { status: 400 }
        );
      }
    }

    // Atomic state transition guard against concurrent duplicate updates
    const updatePayload: { status: typeof status; declineReason?: string } = { status };
    if (declineReason) {
      updatePayload.declineReason = declineReason;
    }

    const updatedBooking = await Booking.findOneAndUpdate(
      { _id: id, status: previousStatus },
      { $set: updatePayload },
      { returnDocument: "after" }
    );

    if (!updatedBooking) {
      return NextResponse.json(
        { error: "Booking status was modified concurrently. Please refresh and try again." },
        { status: 409 }
      );
    }

    // Release date inventory exactly once when transitioning from PENDING/CONFIRMED to REJECTED/CANCELLED
    if (
      (status === "REJECTED" || status === "CANCELLED") &&
      (previousStatus === "PENDING" || previousStatus === "CONFIRMED")
    ) {
      await releaseDateInventory(
        updatedBooking.room.toString(),
        updatedBooking.checkInDate,
        updatedBooking.checkOutDate
      );
    }

    // Notify the appropriate counterparty
    if (isRenter && !isOwner && status === "CANCELLED") {
      await Notification.create({
        recipient: updatedBooking.owner,
        type: "BOOKING_CANCELLED",
        title: "Booking Request Cancelled",
        message: `Booking request ${updatedBooking.bookingCode} was cancelled by the renter.`,
        link: "/owner/bookings",
      });
    } else {
      await Notification.create({
        recipient: updatedBooking.user,
        type: status === "CONFIRMED" ? "BOOKING_ACCEPTED" : "BOOKING_REJECTED",
        title: status === "CONFIRMED" ? "Booking Confirmed!" : "Booking Request Update",
        message:
          status === "CONFIRMED"
            ? `Your booking request ${updatedBooking.bookingCode} has been confirmed by the host!`
            : `Your booking request ${updatedBooking.bookingCode} was ${status.toLowerCase()}.`,
        link: "/dashboard/bookings",
      });
    }

    if (status === "CONFIRMED") {
      await UserInteraction.create({
        user: updatedBooking.user,
        eventType: "BOOKING_CONFIRMED",
        property: updatedBooking.property,
        room: updatedBooking.room,
        metadata: { bookingCode: updatedBooking.bookingCode },
      });
    }

    return NextResponse.json({ booking: updatedBooking }, { status: 200 });
  } catch (err: unknown) {
    console.error("Update Booking Status Error:", err);
    return NextResponse.json({ error: "Failed to update booking status" }, { status: 500 });
  }
}
