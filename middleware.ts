import { NextResponse, NextRequest } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "staynest_session";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect role-isolated routes
  const isUserRoute = pathname.startsWith("/dashboard");
  const isOwnerRoute = pathname.startsWith("/owner");

  if (!isUserRoute && !isOwnerRoute) {
    return NextResponse.next();
  }

  // Fail-secure: refuse all protected routes if secret is not configured
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret || jwtSecret.trim().length === 0) {
    return new NextResponse("Server configuration error: authentication unavailable.", { status: 500 });
  }
  const secretKey = new TextEncoder().encode(jwtSecret);
  const token = req.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    // Redirect unauthenticated user to home with auth prompt
    const loginUrl = new URL("/", req.url);
    loginUrl.searchParams.set("authReason", "Authentication required to access this area.");
    return NextResponse.redirect(loginUrl);
  }

  try {
    const { payload } = await jwtVerify(token, secretKey);
    const role = payload.role as string;

    if (isUserRoute && role !== "renter") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    if (isOwnerRoute && role !== "owner") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  } catch {
    // Invalid or expired token -> redirect to home
    const loginUrl = new URL("/", req.url);
    loginUrl.searchParams.set("authReason", "Session expired. Please sign in again.");
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/owner/:path*"],
};
