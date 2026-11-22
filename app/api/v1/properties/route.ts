import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/mongoose";
import { Property } from "@/lib/models/Property";
import { getSessionUser } from "@/lib/auth/session";
import { createPropertySchema } from "@/lib/validators/property";

function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const city = searchParams.get("city");
    const type = searchParams.get("type");
    const preferredFor = searchParams.get("preferredFor");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const query = searchParams.get("query");

    await dbConnect();

    const filter: Record<string, unknown> = { status: { $in: ["PUBLISHED", "SUBMITTED", "APPROVED"] } };

    if (city) filter.city = new RegExp(escapeRegex(city), "i");
    if (type) filter.type = type;
    if (preferredFor && preferredFor !== "Anyone") filter.preferredFor = preferredFor;
    if (minPrice || maxPrice) {
      const priceFilter: Record<string, number> = {};
      if (minPrice) priceFilter.$gte = Number(minPrice);
      if (maxPrice) priceFilter.$lte = Number(maxPrice);
      filter.startingPrice = priceFilter;
    }
    if (query) {
      const safeQuery = escapeRegex(query);
      filter.$or = [
        { title: new RegExp(safeQuery, "i") },
        { locality: new RegExp(safeQuery, "i") },
        { description: new RegExp(safeQuery, "i") },
      ];
    }

    const properties = await Property.find(filter)
      .populate("owner", "name phone avatar verifiedHost")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ properties }, { status: 200 });
  } catch (err: unknown) {
    console.error("Fetch Properties Error:", err);
    return NextResponse.json({ error: "Failed to fetch properties" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "owner") {
      return NextResponse.json({ error: "Unauthorized: Only Host Partners can create properties" }, { status: 403 });
    }

    const body = await req.json();
    const result = createPropertySchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || "Invalid property payload" },
        { status: 400 }
      );
    }

    await dbConnect();

    const slug = `${result.data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;

    const newProperty = await Property.create({
      ...result.data,
      owner: user.id,
      slug,
      status: "PUBLISHED",
    });

    return NextResponse.json({ property: newProperty }, { status: 201 });
  } catch (err: unknown) {
    console.error("Create Property Error:", err);
    return NextResponse.json({ error: "Failed to create property" }, { status: 500 });
  }
}
