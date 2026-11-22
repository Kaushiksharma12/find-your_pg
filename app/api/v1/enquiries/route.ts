import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/mongoose";
import { Enquiry } from "@/lib/models/Enquiry";
import { Property } from "@/lib/models/Property";
import { Notification } from "@/lib/models/Notification";
import { UserInteraction } from "@/lib/models/UserInteraction";
import { getSessionUser } from "@/lib/auth/session";
import { createEnquirySchema } from "@/lib/validators/enquiry";

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

    const enquiries = await Enquiry.find(filter)
      .populate("property", "title city locality images")
      .populate("user", "name email avatar")
      .populate("owner", "name email avatar")
      .sort({ updatedAt: -1 })
      .lean();

    return NextResponse.json({ enquiries }, { status: 200 });
  } catch (err: unknown) {
    console.error("Fetch Enquiries Error:", err);
    return NextResponse.json({ error: "Failed to fetch enquiries" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await req.json();
    const result = createEnquirySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || "Invalid enquiry input" },
        { status: 400 }
      );
    }

    const { propertyId, roomId, message, subject } = result.data;

    await dbConnect();

    const property = await Property.findById(propertyId);
    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    const newEnquiry = await Enquiry.create({
      user: user.id,
      property: property._id,
      room: roomId || undefined,
      owner: property.owner,
      subject: subject || `Enquiry about ${property.title}`,
      messages: [{ sender: user.id, message, sentAt: new Date() }],
      status: "OPEN",
    });

    await Notification.create({
      recipient: property.owner,
      type: "ENQUIRY_RECEIVED",
      title: "New Property Enquiry",
      message: `${user.name} sent an enquiry regarding ${property.title}.`,
      link: "/owner/enquiries",
    });

    await UserInteraction.create({
      user: user.id,
      eventType: "ENQUIRY_SENT",
      property: property._id,
      metadata: { enquiryId: newEnquiry._id.toString() },
    });

    return NextResponse.json({ enquiry: newEnquiry }, { status: 201 });
  } catch (err: unknown) {
    console.error("Create Enquiry Error:", err);
    return NextResponse.json({ error: "Failed to submit enquiry" }, { status: 500 });
  }
}
