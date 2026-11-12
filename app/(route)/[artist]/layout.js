import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import Artist from "@/models/Artist";
import { connectToDB } from "@/lib/mongoose";
import { phoneDigits } from "@/lib/contactVisibility";
import { SESSION_COOKIE, readSessionToken } from "@/lib/session";

export const dynamic = "force-dynamic";

// Runs on the server for every /<artist>/... page. Only the artist whose
// contact number matches the signed-in number may open their own pages, so
// changing the name in the URL no longer opens someone else's profile.
export default async function ArtistOwnerLayout({ children, params }) {
  const session = await readSessionToken(cookies().get(SESSION_COOKIE)?.value, "artist");
  if (!session) {
    redirect(`/sign-in?redirect_url=${encodeURIComponent(`/${params.artist}`)}`);
  }

  await connectToDB();
  const artist = await Artist.findOne({ linkid: params.artist }, { contact: 1 }).lean();

  if (!artist || phoneDigits(artist.contact) !== phoneDigits(session.mobile)) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4 p-5 text-center">
        <h2 className="text-2xl font-bold text-gray-800">Not allowed</h2>
        <p className="text-gray-600">
          This profile isn&apos;t linked to the number you signed in with.
        </p>
        <Link href="/" className="text-primary underline">
          Go to your dashboard
        </Link>
      </div>
    );
  }

  return children;
}
