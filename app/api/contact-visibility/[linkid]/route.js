import { NextResponse } from "next/server";
import Artist from "@/models/Artist";
import { connectToDB } from "@/lib/mongoose";
import { normalizeContactVisibility, phoneDigits } from "@/lib/contactVisibility";
import { getRequestSession } from "@/lib/session";

export const runtime = "nodejs";

// Only the artist whose number matches the profile can view or change it.
// The number comes from the signed session cookie, never from the request body.
async function findOwnArtist(linkid, mobile) {
  await connectToDB();
  const artist = await Artist.findOne({ linkid }).lean();
  if (!artist) return { status: 404 };
  const digits = phoneDigits(mobile);
  if (!digits || phoneDigits(artist.contact) !== digits) return { status: 403 };
  return { artist };
}

export async function GET(req, { params }) {
  const session = await getRequestSession(req, "artist");
  const { artist, status } = await findOwnArtist(params.linkid, session?.mobile);
  if (!artist) {
    return NextResponse.json({ error: "Not allowed" }, { status });
  }

  return NextResponse.json({
    name: artist.name,
    contact: artist.contact,
    email: artist.email,
    contactVisibility: normalizeContactVisibility(artist.contactVisibility),
  });
}

export async function PUT(req, { params }) {
  const body = await req.json().catch(() => ({}));
  const session = await getRequestSession(req, "artist");
  const { artist, status } = await findOwnArtist(params.linkid, session?.mobile);
  if (!artist) {
    return NextResponse.json({ error: "Not allowed" }, { status });
  }

  const contactVisibility = normalizeContactVisibility(body.contactVisibility);
  await Artist.updateOne({ _id: artist._id }, { $set: { contactVisibility } });

  return NextResponse.json({ contactVisibility });
}
