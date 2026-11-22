import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/db/mongoose";
import { Review } from "@/lib/models/Review";
import { Booking } from "@/lib/models/Booking";
import { Property } from "@/lib/models/Property";
import { getSessionUser } from "@/lib/auth/session";
import { createReviewSchema } from "@/lib/validators/review";

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

    const result = createReviewSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || "Invalid review inputs" },
        { status: 400 }
      );
    }

    const { bookingId, propertyId, rating, comment } = result.data;
    if (!mongoose.Types.ObjectId.isValid(bookingId) || !mongoose.Types.ObjectId.isValid(propertyId)) {
      return NextResponse.json({ error: "Invalid booking or property ID format" }, { status: 400 });
    }

    await dbConnect();

    // Verify stay eligibility
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return NextResponse.json({ error: "Associated booking record not found" }, { status: 404 });
    }

    if (booking.user.toString() !== user.id) {
      return NextResponse.json({ error: "Forbidden: You did not make this booking" }, { status: 403 });
    }

    if (booking.property.toString() !== propertyId) {
      return NextResponse.json(
        { error: "Booking does not match the specified property" },
        { status: 400 }
      );
    }

    if (booking.status !== "CONFIRMED" && booking.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "Reviews are strictly restricted to confirmed or completed stays." },
        { status: 400 }
      );
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ booking: booking._id });
    if (existingReview) {
      return NextResponse.json(
        { error: "A review has already been submitted for this booking." },
        { status: 409 }
      );
    }

    const newReview = await Review.create({
      booking: booking._id,
      user: user.id,
      property: propertyId,
      rating,
      comment,
      status: "PUBLISHED",
    });

    // Update Property average rating & review count
    const allPropertyReviews = await Review.find({ property: propertyId, status: "PUBLISHED" });
    const totalRating = allPropertyReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = Number((totalRating / allPropertyReviews.length).toFixed(1));

    await Property.findByIdAndUpdate(propertyId, {
      rating: avgRating,
      reviewCount: allPropertyReviews.length,
    });

    return NextResponse.json({ review: newReview }, { status: 201 });
  } catch (err: unknown) {
    console.error("Create Review Error:", err);
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}
