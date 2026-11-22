import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/mongoose";
import { User } from "@/lib/models/User";
import { loginSchema } from "@/lib/validators/auth";
import { verifyPassword } from "@/lib/auth/password";
import { setSessionCookie } from "@/lib/auth/session";

export async function POST(req: Request) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Malformed JSON body" }, { status: 400 });
    }
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || "Invalid login credentials" },
        { status: 400 }
      );
    }

    const { email, password, role } = result.data;

    await dbConnect();

    const user = await User.findOne({ email: email.toLowerCase() }).select("+passwordHash");
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    if (role && user.role !== role) {
      return NextResponse.json(
        { error: `Account exists but is registered as ${user.role}, not ${role}.` },
        { status: 403 }
      );
    }

    const sessionUser = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
    };

    await setSessionCookie(sessionUser);

    return NextResponse.json({ user: sessionUser }, { status: 200 });
  } catch (err: unknown) {
    console.error("Login Error:", err);
    return NextResponse.json({ error: "Internal server error during login" }, { status: 500 });
  }
}
