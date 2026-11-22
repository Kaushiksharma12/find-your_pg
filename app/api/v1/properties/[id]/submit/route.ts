import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/mongoose";
import { Property } from "@/lib/models/Property";
import { getSessionUser } from "@/lib/auth/session";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { id } = await params;
    await dbConnect();

    const property = await Property.findById(id);
    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    if (property.owner.toString() !== user.id) {
      return NextResponse.json({ error: "Forbidden: You do not own this property" }, { status: 403 });
    }

    property.status = "PUBLISHED";
    await property.save();

    return NextResponse.json({ success: true, message: "Property published to marketplace", property }, { status: 200 });
  } catch (err: unknown) {
    console.error("Submit Property Error:", err);
    return NextResponse.json({ error: "Failed to submit property" }, { status: 500 });
  }
}
