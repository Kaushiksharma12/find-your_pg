import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth/session";

export async function POST() {
  try {
    await clearSessionCookie();
    const response = NextResponse.json({ success: true, message: "Logged out successfully" }, { status: 200 });
    response.cookies.set("staynest_session", "", {
      httpOnly: true,
      expires: new Date(0),
      path: "/",
    });
    return response;
  } catch (err: unknown) {
    console.error("Logout Error:", err);
    return NextResponse.json({ error: "Failed to log out" }, { status: 500 });
  }
}
