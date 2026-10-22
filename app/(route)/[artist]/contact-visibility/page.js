"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { HashLoader } from "react-spinners";
import { Button } from "@/components/ui/button";
import withAuth from "@/lib/withAuth";
import ContactVisibilityForm from "@/app/_components/ContactVisibilityForm";

function getMobile() {
  const stored = localStorage.getItem("mobile");
  try {
    return String(JSON.parse(stored));
  } catch {
    return stored || "";
  }
}

const ContactVisibility = ({ params }) => {
  const router = useRouter();
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getArtist = async () => {
      try {
        const response = await axios.get(
          `/api/contact-visibility/${params.artist}`,
          { params: { mobile: getMobile() } }
        );
        setArtist(response.data);
      } catch (error) {
        console.error("Error fetching artist:", error);
      } finally {
        setLoading(false);
      }
    };
    getArtist();
  }, [params.artist]);

  const handleSave = async (contactVisibility) => {
    await axios.put(`/api/contact-visibility/${params.artist}`, {
      mobile: getMobile(),
      contactVisibility,
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex justify-center items-center p-10">
          <HashLoader color="#dc2626" size={80} />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-5">
      <Button className="mb-2" onClick={() => router.push("/")}>
        Back to Dashboard
      </Button>
      <hr className="mb-10" />
      <h1 className="text-xl font-bold mb-4">Public Contact Options</h1>
      {artist ? (
        <ContactVisibilityForm
          contact={artist.contact}
          email={artist.email}
          initialValue={artist.contactVisibility}
          onSave={handleSave}
        />
      ) : (
        <p className="text-gray-500">
          Could not load your profile. Please sign in again.
        </p>
      )}
    </div>
  );
};

export default withAuth(ContactVisibility);
