import { NextResponse } from "next/server";
import { verifyOtp, OtpError } from "@/lib/whatsappOtp";
import { SESSION_COOKIE, createSessionToken, sessionCookieOptions } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const { phone, otp } = await req.json().catch(() => ({}));
    const mobile = await verifyOtp(phone, otp, "artist");

    // The signed httpOnly cookie is what the server trusts from now on.
    const res = NextResponse.json({ success: true, mobile });
    res.cookies.set(
      SESSION_COOKIE,
      await createSessionToken(mobile, "artist"),
      sessionCookieOptions()
    );
    return res;
  } catch (err) {
    if (!(err instanceof OtpError)) console.error("Verify OTP error:", err);
    return NextResponse.json(
      { success: false, message: err instanceof OtpError ? err.message : "Something went wrong." },
      { status: err.status || 500 }
    );
  }
}
