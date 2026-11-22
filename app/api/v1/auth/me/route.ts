import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";

export async function GET() {
  try {
    const user = await getSessionUser();
    return NextResponse.json({ user }, { status: 200 });
  } catch (err: unknown) {
    console.error("Session Me Error:", err);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
