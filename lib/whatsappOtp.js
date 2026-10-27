import crypto from "crypto";
import Otp from "@/models/Otp";
import { connectToDB } from "@/lib/mongoose";

// WhatsApp OTP over the Meta Direct API connector.
// Required env var: WHATSAPP_CONNECTOR_ID
// Optional overrides: WHATSAPP_API_BASE_URL, WHATSAPP_PHONE_NUMBER_ID,
// WHATSAPP_OTP_TEMPLATE, WHATSAPP_OTP_TEMPLATE_LANG, OTP_SECRET
const BASE_URL =
  process.env.WHATSAPP_API_BASE_URL || "https://metagraph.backendprod.com/v20.0";
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || "1459911407203032";
const TEMPLATE_NAME = process.env.WHATSAPP_OTP_TEMPLATE || "gigsar_auth";
const TEMPLATE_LANG = process.env.WHATSAPP_OTP_TEMPLATE_LANG || "en";

const OTP_TTL_MS = 10 * 60 * 1000; // code is valid for 10 minutes
const RESEND_COOLDOWN_MS = 60 * 1000; // at most one code per minute per number
const MAX_ATTEMPTS = 5; // wrong guesses allowed before a new code is needed

export class OtpError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

// "+91 98765-43210" -> "919876543210"
export function normalizePhone(raw) {
  const digits = String(raw || "").replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 15) {
    throw new OtpError("Please enter a valid phone number.");
  }
  return digits;
}

function hashCode(phone, code) {
  const secret = process.env.OTP_SECRET || process.env.WHATSAPP_CONNECTOR_ID || "";
  return crypto.createHmac("sha256", secret).update(`${phone}:${code}`).digest("hex");
}

async function sendTemplate(phone, code) {
  const connectorId = process.env.WHATSAPP_CONNECTOR_ID;
  if (!connectorId) {
    throw new OtpError("WhatsApp OTP is not configured.", 500);
  }

  const res = await fetch(`${BASE_URL}/${PHONE_NUMBER_ID}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "connector-id": connectorId,
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: phone,
      type: "template",
      template: {
        name: TEMPLATE_NAME,
        language: { code: TEMPLATE_LANG },
        components: [
          { type: "body", parameters: [{ type: "text", text: code }] },
          {
            type: "button",
            sub_type: "url",
            index: "0",
            parameters: [{ type: "text", text: code }],
          },
        ],
      },
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.error) {
    console.error("WhatsApp OTP send failed:", res.status, JSON.stringify(data));
    throw new OtpError("Could not send WhatsApp OTP. Please check the number and try again.", 502);
  }
  return data;
}

// `app` keeps codes for the user site and the artist portal separate.
export async function sendOtp(rawPhone, app) {
  const phone = normalizePhone(rawPhone);
  await connectToDB();

  const existing = await Otp.findOne({ phone, app });
  if (existing && Date.now() - existing.sentAt.getTime() < RESEND_COOLDOWN_MS) {
    throw new OtpError("Please wait a minute before requesting another OTP.", 429);
  }

  const code = crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");
  await sendTemplate(phone, code);

  await Otp.findOneAndUpdate(
    { phone, app },
    {
      codeHash: hashCode(phone, code),
      attempts: 0,
      sentAt: new Date(),
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
    },
    { upsert: true }
  );
  return phone;
}

export async function verifyOtp(rawPhone, rawCode, app) {
  const phone = normalizePhone(rawPhone);
  const code = String(rawCode || "").replace(/\D/g, "");
  if (code.length !== 6) {
    throw new OtpError("Please enter the 6-digit OTP.");
  }

  await connectToDB();
  const record = await Otp.findOne({ phone, app });
  if (!record || record.expiresAt.getTime() < Date.now()) {
    throw new OtpError("OTP has expired. Please request a new one.", 410);
  }
  if (record.attempts >= MAX_ATTEMPTS) {
    await Otp.deleteOne({ _id: record._id });
    throw new OtpError("Too many wrong attempts. Please request a new OTP.", 429);
  }

  const expected = Buffer.from(record.codeHash, "hex");
  const actual = Buffer.from(hashCode(phone, code), "hex");
  if (!crypto.timingSafeEqual(expected, actual)) {
    await Otp.updateOne({ _id: record._id }, { $inc: { attempts: 1 } });
    throw new OtpError("OTP is incorrect. Please try again.", 401);
  }

  await Otp.deleteOne({ _id: record._id });
  return phone;
}
