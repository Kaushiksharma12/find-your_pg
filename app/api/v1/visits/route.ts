import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/mongoose";
import { Visit } from "@/lib/models/Visit";
import { Property } from "@/lib/models/Property";
import { Notification } from "@/lib/models/Notification";
import { UserInteraction } from "@/lib/models/UserInteraction";
import { getSessionUser } from "@/lib/auth/session";
import { createVisitSchema } from "@/lib/validators/visit";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    await dbConnect();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: any = {};
    if (user.role === "renter") filter.user = user.id;
    else if (user.role === "owner") filter.owner = user.id;

    const visits = await Visit.find(filter)
      .populate("property", "title city locality address images")
      .populate("user", "name email phone avatar")
      .populate("owner", "name email phone")
      .sort({ scheduledDate: 1 })
      .lean();

    return NextResponse.json({ visits }, { status: 200 });
  } catch (err: unknown) {
    console.error("Fetch Visits Error:", err);
    return NextResponse.json({ error: "Failed to fetch visit requests" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await req.json();
    const result = createVisitSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || "Invalid visit details" },
        { status: 400 }
      );
    }

    const { propertyId, scheduledDate, timeSlot, visitType, note } = result.data;

    await dbConnect();

    const property = await Property.findById(propertyId);
    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    const newVisit = await Visit.create({
      user: user.id,
      property: property._id,
      owner: property.owner,
      scheduledDate: new Date(scheduledDate),
      timeSlot,
      visitType,
      note,
      status: "REQUESTED",
    });

    await Notification.create({
      recipient: property.owner,
      type: "VISIT_REQUESTED",
      title: "New Site Visit Request",
      message: `${user.name} requested a ${visitType.toLowerCase()} visit for ${property.title}.`,
      link: "/owner/visits",
    });

    await UserInteraction.create({
      user: user.id,
      eventType: "SITE_VISIT_REQUESTED",
      property: property._id,
      metadata: { visitId: newVisit._id.toString() },
    });

    return NextResponse.json({ visit: newVisit }, { status: 201 });
  } catch (err: unknown) {
    console.error("Create Visit Error:", err);
    return NextResponse.json({ error: "Failed to schedule visit" }, { status: 500 });
  }
}
