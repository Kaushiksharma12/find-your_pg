import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/db/mongoose";
import { Property } from "@/lib/models/Property";
import { Room } from "@/lib/models/Room";
import { Review } from "@/lib/models/Review";
import { getSessionUser } from "@/lib/auth/session";
import { aiSearchEmbeddingService } from "@/lib/services/ai-search-embedding-service";
import { updatePropertySchema } from "@/lib/validators/property";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await dbConnect();

    // Query by ID or slug
    const property = await Property.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { slug: id }],
    })
      .populate("owner", "name phone avatar verifiedHost")
      .lean();

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    const rooms = await Room.find({ property: property._id, isAvailable: true }).lean();
    const reviews = await Review.find({ property: property._id, status: "PUBLISHED" })
      .populate("user", "name avatar")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ property: { ...property, rooms, reviews } }, { status: 200 });
  } catch (err: unknown) {
    console.error("Fetch Property Detail Error:", err);
    return NextResponse.json({ error: "Failed to fetch property detail" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid property ID" }, { status: 400 });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Malformed JSON body" }, { status: 400 });
    }

    const result = updatePropertySchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || "Invalid or protected property fields in update payload" },
        { status: 400 }
      );
    }

    await dbConnect();

    const property = await Property.findById(id);
    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    if (property.owner.toString() !== user.id) {
      return NextResponse.json({ error: "Forbidden: You do not own this property" }, { status: 403 });
    }

    Object.assign(property, result.data);
    await property.save();

    // Best-effort non-blocking vector regeneration for Phase 2
    aiSearchEmbeddingService
      .generateAndPersistPropertyEmbedding(property._id.toString())
      .catch((err: unknown) => console.error("Non-blocking vector update error:", err));

    return NextResponse.json({ property }, { status: 200 });
  } catch (err: unknown) {
    console.error("Update Property Error:", err);
    return NextResponse.json({ error: "Failed to update property" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid property ID" }, { status: 400 });
    }

    await dbConnect();

    const property = await Property.findById(id);
    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    if (property.owner.toString() !== user.id) {
      return NextResponse.json({ error: "Forbidden: You do not own this property" }, { status: 403 });
    }

    property.status = "UNAVAILABLE";
    await property.save();
    await Room.updateMany({ property: property._id }, { $set: { isAvailable: false } });

    return NextResponse.json({ success: true, message: "Property archived", property }, { status: 200 });
  } catch (err: unknown) {
    console.error("Delete Property Error:", err);
    return NextResponse.json({ error: "Failed to archive property" }, { status: 500 });
  }
}
