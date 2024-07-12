"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Spinner } from "react-bootstrap";
import withAuth from "@/lib/withAuth";
import ArtistDetail from "@/app/_components/ArtistDetail";
import ArtistPricing from "@/app/_components/ArtistPricing";

function ArtistDetails({ params }) {
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getArtist();
  }, []);

  const getArtist = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API}/artist/artistName/` + params.artist
      );
      setArtist(response.data);
    } catch (error) {
      console.error("Error fetching artist:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5 md:px-10">
      <h2 className="font-bold text-2xl mb-5 text-gray-800">Artist Details</h2>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Artist Detail */}
          <div className="col-span-3">
            {artist ? (
              <ArtistDetail artist={artist} />
            ) : (
              <p className="text-gray-500">Artist details not available.</p>
            )}
          </div>
          {/* Artist Pricing */}
          <div>{artist ? <ArtistPricing artist={artist} /> : null}</div>
        </div>
      )}
    </div>
  );
}

export default withAuth(ArtistDetails);
