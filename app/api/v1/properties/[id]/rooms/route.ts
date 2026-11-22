import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/mongoose";
import { Property } from "@/lib/models/Property";
import { Room } from "@/lib/models/Room";
import { getSessionUser } from "@/lib/auth/session";
import { createRoomSchema } from "@/lib/validators/property";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await dbConnect();
    const rooms = await Room.find({ property: id }).lean();
    return NextResponse.json({ rooms }, { status: 200 });
  } catch (err: unknown) {
    console.error("Fetch Rooms Error:", err);
    return NextResponse.json({ error: "Failed to fetch rooms" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const result = createRoomSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || "Invalid room inputs" },
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

    const newRoom = await Room.create({
      ...result.data,
      property: property._id,
    });

    return NextResponse.json({ room: newRoom }, { status: 201 });
  } catch (err: unknown) {
    console.error("Create Room Error:", err);
    return NextResponse.json({ error: "Failed to create room" }, { status: 500 });
  }
}
