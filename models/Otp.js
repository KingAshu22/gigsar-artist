import { Schema, model, models } from "mongoose";

// One pending WhatsApp login code per phone number per app.
// Only a hash of the code is stored; MongoDB deletes expired rows automatically.
const OtpSchema = new Schema({
  phone: { type: String, required: true },
  app: { type: String, required: true },
  codeHash: { type: String, required: true },
  attempts: { type: Number, default: 0 },
  sentAt: { type: Date, required: true },
  expiresAt: { type: Date, required: true },
});

OtpSchema.index({ phone: 1, app: 1 }, { unique: true });
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Otp = models.Otp || model("Otp", OtpSchema, "whatsapp_otps");

export default Otp;
