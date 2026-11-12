import { NextResponse } from "next/server";
import { SESSION_COOKIE, getRequestSession, sessionCookieOptions } from "@/lib/session";

export const dynamic = "force-dynamic";

// Lets the browser ask who is signed in (the cookie itself is httpOnly).
export async function GET(req) {
  const session = await getRequestSession(req, "artist");
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true, mobile: session.mobile });
}

// Sign out.
export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.set(SESSION_COOKIE, "", sessionCookieOptions(0));
  return res;
}
