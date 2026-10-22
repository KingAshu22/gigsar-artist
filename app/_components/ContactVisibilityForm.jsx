"use client";

import { useState } from "react";
import { Mail, MessageCircle, Phone, Send } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";

const OPTIONS = [
  {
    key: "email",
    label: "Email",
    description: "Show your email address so clients can email you directly.",
    icon: Mail,
    needs: "email",
  },
  {
    key: "call",
    label: "Call Now Button",
    description: "Clients can tap to call your mobile number.",
    icon: Phone,
    needs: "contact",
  },
  {
    key: "whatsapp",
    label: "WhatsApp Button",
    description: "Clients can start a WhatsApp chat with you.",
    icon: MessageCircle,
    needs: "contact",
  },
  {
    key: "enquiryOnly",
    label: "Only Send Enquiry Button",
    description:
      "Keep your contact details private. Clients fill in their event details and Gigsar emails the enquiry to you.",
    icon: Send,
  },
];

// Lets an artist (or admin) choose which contact options appear on the
// public Gigsar profile. "Only Send Enquiry" is exclusive of the others.
export default function ContactVisibilityForm({
  contact,
  email,
  initialValue,
  onSave,
}) {
  const [visibility, setVisibility] = useState(initialValue);
  const [saving, setSaving] = useState(false);

  const toggle = (key) => {
    setVisibility((current) => {
      if (key === "enquiryOnly") {
        return { email: false, call: false, whatsapp: false, enquiryOnly: true };
      }
      const next = { ...current, [key]: !current[key], enquiryOnly: false };
      if (!next.email && !next.call && !next.whatsapp) {
        next.enquiryOnly = true;
      }
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(visibility);
      toast.success("Profile contact settings saved");
    } catch (error) {
      console.error("Error saving contact settings:", error);
      toast.error("Could not save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const missing = { email: !email, contact: !contact };

  return (
    <div className="max-w-2xl">
      <p className="text-gray-600 mb-5">
        Choose what clients can see on your public Gigsar profile. The Send
        Enquiry button is always available.
      </p>

      <div className="flex flex-col gap-3">
        {OPTIONS.map(({ key, label, description, icon: Icon, needs }) => {
          const checked = !!visibility[key];
          const unavailable = needs && missing[needs];
          return (
            <label
              key={key}
              className={`flex items-start gap-4 rounded-lg border p-4 cursor-pointer transition-colors ${
                checked ? "border-primary bg-red-50" : "border-gray-300 hover:bg-gray-50"
              }`}
            >
              <input
                type={key === "enquiryOnly" ? "radio" : "checkbox"}
                name={key === "enquiryOnly" ? "enquiryOnly" : undefined}
                className="mt-1 size-4 accent-red-600"
                checked={checked}
                onChange={() => toggle(key)}
              />
              <Icon className="size-5 mt-0.5 shrink-0 text-gray-700" />
              <div>
                <p className="font-semibold text-gray-900">{label}</p>
                <p className="text-sm text-gray-600">{description}</p>
                {checked && unavailable && (
                  <p className="text-sm text-amber-700 mt-1">
                    No {needs === "email" ? "email address" : "mobile number"} on
                    this profile yet. Add it in Basic Details or this button
                    will not appear.
                  </p>
                )}
              </div>
            </label>
          );
        })}
      </div>

      <Button className="mt-6" onClick={handleSave} disabled={saving}>
        {saving ? "Saving..." : "Save"}
      </Button>
    </div>
  );
}
