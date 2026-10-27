import { NextResponse } from "next/server";
import { verifyOtp, OtpError } from "@/lib/whatsappOtp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const { phone, otp } = await req.json().catch(() => ({}));
    const mobile = await verifyOtp(phone, otp, "artist");
    return NextResponse.json({ success: true, mobile });
  } catch (err) {
    if (!(err instanceof OtpError)) console.error("Verify OTP error:", err);
    return NextResponse.json(
      { success: false, message: err instanceof OtpError ? err.message : "Something went wrong." },
      { status: err.status || 500 }
    );
  }
}
