import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/db/mongoose";
import { Room } from "@/lib/models/Room";
import { Property } from "@/lib/models/Property";
import { getSessionUser } from "@/lib/auth/session";
import { updateRoomSchema } from "@/lib/validators/property";

export async function PATCH(req: Request, { params }: { params: Promise<{ roomId: string }> }) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { roomId } = await params;
    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      return NextResponse.json({ error: "Invalid room ID" }, { status: 400 });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Malformed JSON body" }, { status: 400 });
    }

    const result = updateRoomSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || "Invalid or protected room fields in update payload" },
        { status: 400 }
      );
    }

    await dbConnect();

    const room = await Room.findById(roomId);
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    const property = await Property.findById(room.property);
    if (!property || property.owner.toString() !== user.id) {
      return NextResponse.json({ error: "Forbidden: You do not own this room" }, { status: 403 });
    }

    Object.assign(room, result.data);
    await room.save();

    return NextResponse.json({ room }, { status: 200 });
  } catch (err: unknown) {
    console.error("Update Room Error:", err);
    return NextResponse.json({ error: "Failed to update room" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ roomId: string }> }) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { roomId } = await params;

    await dbConnect();

    const room = await Room.findById(roomId);
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    const property = await Property.findById(room.property);
    if (!property || property.owner.toString() !== user.id) {
      return NextResponse.json({ error: "Forbidden: You do not own this room" }, { status: 403 });
    }

    await Room.findByIdAndDelete(roomId);

    return NextResponse.json({ success: true, message: "Room deleted" }, { status: 200 });
  } catch (err: unknown) {
    console.error("Delete Room Error:", err);
    return NextResponse.json({ error: "Failed to delete room" }, { status: 500 });
  }
}
