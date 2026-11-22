import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/mongoose";
import { Review } from "@/lib/models/Review";
import { Property } from "@/lib/models/Property";
import { getSessionUser } from "@/lib/auth/session";
import { respondReviewSchema } from "@/lib/validators/review";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const result = respondReviewSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || "Invalid response comment" },
        { status: 400 }
      );
    }

    await dbConnect();

    const review = await Review.findById(id);
    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    const property = await Property.findById(review.property);
    if (!property || property.owner.toString() !== user.id) {
      return NextResponse.json({ error: "Forbidden: You do not own this property" }, { status: 403 });
    }

    review.ownerReply = {
      comment: result.data.comment,
      repliedAt: new Date(),
    };

    await review.save();

    return NextResponse.json({ review }, { status: 200 });
  } catch (err: unknown) {
    console.error("Owner Respond Review Error:", err);
    return NextResponse.json({ error: "Failed to post owner response" }, { status: 500 });
  }
}
