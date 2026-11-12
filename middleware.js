import { NextResponse } from "next/server";
import { getRequestSession } from "@/lib/session";

// Everything in the artist portal needs a signed-in artist except these.
// The check uses the signed httpOnly session cookie set by /api/otp/verify,
// so editing localStorage no longer gets anyone in.
const PUBLIC = [
  /^\/sign-in(\/|$)/,
  /^\/terms-and-conditions(\/|$)/,
  /^\/api\/otp\//,
  /^\/api\/session$/,
];

export async function middleware(req) {
  const { pathname, search } = req.nextUrl;
  if (PUBLIC.some((re) => re.test(pathname))) return NextResponse.next();

  if (await getRequestSession(req, "artist")) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = req.nextUrl.clone();
  url.pathname = "/sign-in";
  url.search = `?redirect_url=${encodeURIComponent(pathname + search)}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Skip Next.js internals and static files (anything with a file extension).
  matcher: ["/((?!_next/|.*\\..*).*)"],
};
