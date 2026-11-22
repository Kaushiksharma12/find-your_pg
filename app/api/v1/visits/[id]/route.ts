import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/db/mongoose";
import { Visit } from "@/lib/models/Visit";
import { Notification } from "@/lib/models/Notification";
import { getSessionUser } from "@/lib/auth/session";
import { updateVisitStatusSchema } from "@/lib/validators/visit";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid visit ID" }, { status: 400 });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Malformed JSON body" }, { status: 400 });
    }

    const result = updateVisitStatusSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || "Invalid visit status payload" },
        { status: 400 }
      );
    }

    const { status, note } = result.data;

    await dbConnect();

    const visit = await Visit.findById(id);
    if (!visit) {
      return NextResponse.json({ error: "Visit request not found" }, { status: 404 });
    }

    const isOwner = visit.owner.toString() === user.id;
    const isRenter = visit.user.toString() === user.id;

    if (!isOwner && !isRenter) {
      return NextResponse.json({ error: "Forbidden: Not authorized" }, { status: 403 });
    }

    const previousStatus = visit.status;

    if (previousStatus === "DECLINED" || previousStatus === "COMPLETED" || previousStatus === "CANCELLED") {
      return NextResponse.json(
        { error: `Cannot transition visit from terminal state ${previousStatus} to ${status}` },
        { status: 400 }
      );
    }

    if (isRenter && !isOwner) {
      if (status !== "CANCELLED") {
        return NextResponse.json(
          { error: "Forbidden: Renters can only cancel their site visit requests" },
          { status: 403 }
        );
      }
    } else if (isOwner) {
      const validOwnerTransition =
        ((previousStatus === "REQUESTED" || previousStatus === "RESCHEDULED") &&
          (status === "CONFIRMED" || status === "RESCHEDULED" || status === "DECLINED" || status === "CANCELLED")) ||
        (previousStatus === "CONFIRMED" &&
          (status === "COMPLETED" || status === "RESCHEDULED" || status === "CANCELLED"));

      if (!validOwnerTransition) {
        return NextResponse.json(
          { error: `Invalid visit status transition from ${previousStatus} to ${status}` },
          { status: 400 }
        );
      }
    }

    visit.status = status;
    if (note) visit.note = note;
    await visit.save();

    if (isRenter && !isOwner) {
      await Notification.create({
        recipient: visit.owner,
        type: "VISIT_UPDATED",
        title: "Visit Request Cancelled",
        message: `A site visit request was cancelled by the renter.`,
        link: "/owner/visits",
      });
    } else {
      await Notification.create({
        recipient: visit.user,
        type: "VISIT_UPDATED",
        title: "Visit Request Updated",
        message: `Your visit request status has been updated to ${status}.`,
        link: "/dashboard/visits",
      });
    }

    return NextResponse.json({ visit }, { status: 200 });
  } catch (err: unknown) {
    console.error("Update Visit Error:", err);
    return NextResponse.json({ error: "Failed to update visit request" }, { status: 500 });
  }
}
