// Which contact options an artist allows on their public Gigsar profile.
// "enquiryOnly" means no direct contact details are shown; clients can only
// reach the artist through the Send Enquiry flow.
export const DEFAULT_CONTACT_VISIBILITY = {
  email: false,
  call: false,
  whatsapp: false,
  enquiryOnly: true,
};

export function normalizeContactVisibility(value) {
  if (!value || value.enquiryOnly) {
    return { ...DEFAULT_CONTACT_VISIBILITY };
  }

  const visibility = {
    email: !!value.email,
    call: !!value.call,
    whatsapp: !!value.whatsapp,
    enquiryOnly: false,
  };

  if (!visibility.email && !visibility.call && !visibility.whatsapp) {
    return { ...DEFAULT_CONTACT_VISIBILITY };
  }

  return visibility;
}

// Removes contact details the artist has not chosen to make public, so they
// never reach the browser.
export function toPublicArtist(artist) {
  const data = typeof artist.toObject === "function" ? artist.toObject() : { ...artist };
  const visibility = normalizeContactVisibility(data.contactVisibility);

  if (!visibility.email) delete data.email;
  if (!visibility.call && !visibility.whatsapp) delete data.contact;

  data.contactVisibility = visibility;
  return data;
}

export function phoneDigits(phone) {
  return String(phone || "").replace(/\D/g, "");
}
