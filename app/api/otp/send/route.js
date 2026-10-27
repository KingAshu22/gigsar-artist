import { NextResponse } from "next/server";
import { sendOtp, OtpError } from "@/lib/whatsappOtp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const { phone } = await req.json().catch(() => ({}));
    await sendOtp(phone, "artist");
    return NextResponse.json({ success: true, message: "OTP sent on WhatsApp" });
  } catch (err) {
    if (!(err instanceof OtpError)) console.error("Send OTP error:", err);
    return NextResponse.json(
      { success: false, message: err instanceof OtpError ? err.message : "Something went wrong." },
      { status: err.status || 500 }
    );
  }
}
