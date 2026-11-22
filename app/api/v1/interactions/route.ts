import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/db/mongoose";
import { UserInteraction } from "@/lib/models/UserInteraction";
import { Property } from "@/lib/models/Property";
import { getSessionUser } from "@/lib/auth/session";

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    const body = await req.json();
    const { eventType, propertyId, roomId, sessionId, searchId, searchCriteria, metadata } = body;

    if (!eventType) {
      return NextResponse.json({ error: "eventType is required" }, { status: 400 });
    }

    await dbConnect();

    // Resolve propertyId to ObjectId if valid or via slug lookup to prevent CastErrors
    let targetPropertyObjectId: mongoose.Types.ObjectId | undefined = undefined;
    if (propertyId) {
      const propStr = propertyId.toString();
      if (mongoose.Types.ObjectId.isValid(propStr) && String(new mongoose.Types.ObjectId(propStr)) === propStr) {
        targetPropertyObjectId = new mongoose.Types.ObjectId(propStr);
      } else {
        const foundBySlug = await Property.findOne({ slug: propStr }).select("_id").lean();
        if (foundBySlug?._id) {
          targetPropertyObjectId = foundBySlug._id as mongoose.Types.ObjectId;
        }
      }
    }

    // Priority 2: Optional search attribution validation
    let attributed = false;
    let verifiedSearchId: string | undefined = undefined;
    let attributionMetadata: Record<string, unknown> = {};

    if (typeof searchId === "string" && searchId.trim().length > 0) {
      const cleanSearchId = searchId.trim();
      const searchDoc = await UserInteraction.findOne({
        searchId: cleanSearchId,
        eventType: "SEARCH_PERFORMED",
      }).lean();

      if (searchDoc) {
        const meta = (searchDoc.metadata as Record<string, unknown>) || {};
        const topIds = Array.isArray(meta.topCandidateIds) ? meta.topCandidateIds : [];
        const candIds = Array.isArray(meta.candidatePropertyIds) ? meta.candidatePropertyIds : [];
        const candidateIds: string[] = [...topIds, ...candIds]
          .map((id: unknown) => (id !== null && id !== undefined ? String(id).toLowerCase() : ""))
          .filter(Boolean);

        const targetPropId = (propertyId || "").toString().toLowerCase();
        const targetPropObjId = targetPropertyObjectId?.toString().toLowerCase();
        const isCandidate = Boolean(
          (targetPropId && candidateIds.includes(targetPropId)) ||
          (targetPropObjId && candidateIds.includes(targetPropObjId))
        );

        if (isCandidate) {
          attributed = true;
          verifiedSearchId = cleanSearchId;
          attributionMetadata = {
            attributed: true,
            verifiedAt: new Date(),
          };
        } else {
          attributionMetadata = {
            attributed: false,
            attributionIgnoredReason: "candidate_mismatch",
            unverifiedSearchId: cleanSearchId,
          };
        }
      } else {
        attributionMetadata = {
          attributed: false,
          attributionIgnoredReason: "search_not_found",
          unverifiedSearchId: cleanSearchId,
        };
      }
    }

    const combinedMetadata = {
      ...(metadata || {}),
      ...(propertyId && !targetPropertyObjectId ? { rawPropertyIdentifier: propertyId } : {}),
      ...(Object.keys(attributionMetadata).length > 0 ? { attribution: attributionMetadata } : {}),
    };

    const interaction = await UserInteraction.create({
      user: user?.id || undefined,
      sessionId: sessionId || undefined,
      searchId: verifiedSearchId || undefined,
      eventType,
      property: targetPropertyObjectId || undefined,
      room: roomId || undefined,
      searchCriteria: searchCriteria || undefined,
      metadata: Object.keys(combinedMetadata).length > 0 ? combinedMetadata : undefined,
    });

    return NextResponse.json(
      { success: true, interactionId: interaction._id, attributed },
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error("Log Interaction Error:", err);
    return NextResponse.json({ error: "Failed to record interaction event" }, { status: 500 });
  }
}
