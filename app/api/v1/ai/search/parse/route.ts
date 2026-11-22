import { NextResponse } from "next/server";
import { parseQueryRequestSchema } from "@/lib/validators/ai";
import { queryUnderstandingService } from "@/lib/services/ai-search-parser";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = parseQueryRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: "Invalid request payload", details: validation.error.format() },
        { status: 400 }
      );
    }

    const { query } = validation.data;
    const intent = await queryUnderstandingService.parseQuery(query);

    return NextResponse.json({
      success: true,
      intent,
    });
  } catch (error) {
    console.error("AI Query Parse Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error during query understanding" },
      { status: 500 }
    );
  }
}
