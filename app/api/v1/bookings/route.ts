import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/db/mongoose";
import { Booking } from "@/lib/models/Booking";
import { Room } from "@/lib/models/Room";
import { Property } from "@/lib/models/Property";
import { Notification } from "@/lib/models/Notification";
import { UserInteraction } from "@/lib/models/UserInteraction";
import { getSessionUser } from "@/lib/auth/session";
import { createBookingSchema } from "@/lib/validators/booking";
import { reserveDateInventory } from "@/lib/services/inventory-service";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    await dbConnect();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: any = {};
    if (user.role === "renter") {
      filter.user = user.id;
    } else if (user.role === "owner") {
      filter.owner = user.id;
    }

    const bookings = await Booking.find(filter)
      .populate("property", "title city locality images startingPrice")
      .populate("room", "name price deposit occupancy")
      .populate("user", "name email phone avatar")
      .populate("owner", "name email phone")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ bookings }, { status: 200 });
  } catch (err: unknown) {
    console.error("Fetch Bookings Error:", err);
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Malformed JSON body" }, { status: 400 });
    }
    const result = createBookingSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || "Invalid booking details" },
        { status: 400 }
      );
    }

    const { propertyId, roomId, checkInDate, checkOutDate, guestCount } = result.data;
    if (!mongoose.Types.ObjectId.isValid(propertyId) || !mongoose.Types.ObjectId.isValid(roomId)) {
      return NextResponse.json({ error: "Invalid property or room ID format" }, { status: 400 });
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (checkOut <= checkIn) {
      return NextResponse.json({ error: "Check-out date must be after check-in date." }, { status: 400 });
    }

    await dbConnect();

    const property = await Property.findById(propertyId);
    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    const room = await Room.findById(roomId);
    if (!room || !room.isAvailable) {
      return NextResponse.json({ error: "Selected room is not available" }, { status: 404 });
    }

    if (room.property.toString() !== property._id.toString()) {
      return NextResponse.json(
        { error: "Selected room does not belong to the specified property" },
        { status: 400 }
      );
    }

    // Atomic Date Inventory Reservation Lock
    const reservation = await reserveDateInventory(roomId, checkIn, checkOut, room.totalInventory);
    if (!reservation.success) {
      return NextResponse.json(
        { error: `Room inventory fully booked for date: ${reservation.dateFailed}` },
        { status: 409 }
      );
    }

    const bookingCode = `SN-BK-${Math.floor(1000 + Math.random() * 9000)}`;

    const newBooking = await Booking.create({
      bookingCode,
      user: user.id,
      property: property._id,
      room: room._id,
      owner: property.owner,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      guestCount,
      monthlyRent: room.price,
      deposit: room.deposit,
      status: "PENDING",
      paymentStatus: "PAY_ON_ARRIVAL",
    });

    // Send Notification to Owner
    await Notification.create({
      recipient: property.owner,
      type: "BOOKING_REQUESTED",
      title: "New Booking Request",
      message: `${user.name} requested to book ${room.name} at ${property.title}.`,
      link: "/owner/bookings",
    });

    // Log AI Interaction Event
    await UserInteraction.create({
      user: user.id,
      eventType: "BOOKING_REQUESTED",
      property: property._id,
      room: room._id,
      metadata: { bookingCode, checkInDate, checkOutDate },
    });

    return NextResponse.json({ booking: newBooking }, { status: 201 });
  } catch (err: unknown) {
    console.error("Create Booking Error:", err);
    return NextResponse.json({ error: "Failed to submit booking request" }, { status: 500 });
  }
}
