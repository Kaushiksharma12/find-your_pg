import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/mongoose";
import { Enquiry } from "@/lib/models/Enquiry";
import { Notification } from "@/lib/models/Notification";
import { getSessionUser } from "@/lib/auth/session";
import { replyEnquirySchema } from "@/lib/validators/enquiry";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const result = replyEnquirySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || "Invalid message payload" },
        { status: 400 }
      );
    }

    await dbConnect();

    const enquiry = await Enquiry.findById(id);
    if (!enquiry) {
      return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });
    }

    const isUser = enquiry.user.toString() === user.id;
    const isOwner = enquiry.owner.toString() === user.id;

    if (!isUser && !isOwner) {
      return NextResponse.json({ error: "Forbidden: Not part of this conversation" }, { status: 403 });
    }

    enquiry.messages.push({
      sender: user.id as unknown as import("mongoose").Types.ObjectId,
      message: result.data.message,
      sentAt: new Date(),
    });

    if (isOwner && enquiry.status === "OPEN") {
      enquiry.status = "REPLIED";
    }

    await enquiry.save();

    const recipientId = isOwner ? enquiry.user : enquiry.owner;
    await Notification.create({
      recipient: recipientId,
      type: "ENQUIRY_REPLIED",
      title: "New Enquiry Message",
      message: `${user.name} replied to an enquiry thread.`,
      link: isOwner ? "/dashboard/enquiries" : "/owner/enquiries",
    });

    return NextResponse.json({ enquiry }, { status: 200 });
  } catch (err: unknown) {
    console.error("Reply Enquiry Error:", err);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
