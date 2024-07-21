"use client";
import React, { useEffect, useState } from "react";
import "react-cropper-custom/dist/index.css";
import "@/app/_components/modal.css"; // Import CSS
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import { useRouter } from "next/navigation";
import Modal from "@/app/_components/Modal";
import { HashLoader } from "react-spinners";
import { Button } from "@/components/ui/button";

const EditArtist = ({ params }) => {
  const [id, setId] = useState();

  const getArtist = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API}/artist/artistName/` + params.artist
      );
      const artistData = response.data;

      setId(artistData._id);
      setArtistName(artistData.name);
      setYoutubeLink(artistData.youtube);
      setOriginalSongName(artistData.original);
      setPerformanceTime(artistData.time);
      setAwards(artistData.awards);
      setInstagramLink(artistData.instagram);
      setFacebookLink(artistData.facebook);
      setSpotifyLink(artistData.spotify);
      setMusicTraining(artistData.training);
      setAboutArtist(artistData.blog);
    } catch (error) {
      console.error("Error fetching artists:", error);
    } finally {
      // Reset loading state
      setFetchData(false);
    }
  };

  const [artistName, setArtistName] = useState();
  const [originalSongName, setOriginalSongName] = useState("");
  const [performanceTime, setPerformanceTime] = useState("");
  const [instruments, setInstruments] = useState([]);
  const [awards, setAwards] = useState("");
  const [instagramLink, setInstagramLink] = useState("");
  const [facebookLink, setFacebookLink] = useState("");
  const [spotifyLink, setSpotifyLink] = useState("");
  const [youtubeLink, setYoutubeLink] = useState("");
  const [musicTraining, setMusicTraining] = useState("");
  const [aboutArtist, setAboutArtist] = useState("");
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [fetchData, setFetchData] = useState(true);
  const router = useRouter();

  useEffect(() => {
    getArtist();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowConfirmationModal(true);
    setError(null);
    setSuccess(false);
  };

  const handleConfirmSubmit = async () => {
    try {
      setShowConfirmationModal(false);
      setIsLoading(true);
      // Handle the submission of form data
      const formData = {
        originalSongName,
        performanceTime,
        instruments,
        awards,
        instagramLink,
        facebookLink,
        youtubeLink,
        spotifyLink,
        musicTraining,
        aboutArtist,
      };

      const response = axios.post(
        `${process.env.NEXT_PUBLIC_API}/edit-other-details/${id}`,
        formData,
        { withCredentials: true }
      );
    } catch (error) {
      // Handle error
      console.error("Error submitting form:", error);
      setError(error.message || "An error occurred during submission.");
    } finally {
      // Reset loading state
      setIsLoading(false);
      setSuccess(true);
    }
  };

  return (
    <>
      {fetchData ? (
        <div className="container mx-auto py-10">
          <div className="flex justify-center items-center p-10">
            <HashLoader color="#dc2626" size={80} />
          </div>
        </div>
      ) : (
        <div className="container mx-auto p-5">
          <Button
            className="mb-2"
            onClick={() => {
              router.push("/");
            }}
          >
            Back to Dashboard
          </Button>
          <hr className="mb-10" />
          <h1 className="text-xl font-bold mb-4">Other Details</h1>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="originalSong"
                className="block text-sm font-medium text-gray-700"
              >
                Original Songs Name
              </label>
              <input
                type="text"
                id="originalSongs"
                value={originalSongName}
                onChange={(e) => setOriginalSongName(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="performanceTime"
                className="block text-sm font-medium text-gray-700"
              >
                Performance Time in Mins
              </label>
              <input
                type="number"
                id="performanceTime"
                value={performanceTime}
                onChange={(e) => setPerformanceTime(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="performanceTime"
                className="block text-sm font-medium text-gray-700"
              >
                Any Awards/Achievements/Fame
              </label>
              <input
                type="text"
                id="awards"
                value={awards}
                onChange={(e) => setAwards(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="instagramLink"
                className="block text-sm font-medium text-gray-700"
              >
                Instagram Profile Link
              </label>
              <input
                type="text"
                id="instagramLink"
                value={instagramLink}
                onChange={(e) => setInstagramLink(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="facebookLink"
                className="block text-sm font-medium text-gray-700"
              >
                Facebook Profile Link
              </label>
              <input
                type="text"
                id="facebookLink"
                value={facebookLink}
                onChange={(e) => setFacebookLink(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="youtubeLink"
                className="block text-sm font-medium text-gray-700"
              >
                Youtube Channel Link
              </label>
              <input
                type="text"
                id="youtubeLink"
                value={youtubeLink}
                onChange={(e) => setYoutubeLink(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="spotifyLink"
                className="block text-sm font-medium text-gray-700"
              >
                Spotify Profile Link
              </label>
              <input
                type="text"
                id="spotifyLink"
                value={spotifyLink}
                onChange={(e) => setSpotifyLink(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="musicTraining"
                className="block text-sm font-medium text-gray-700"
              >
                Music Training From
              </label>
              <input
                type="text"
                id="musicTraining"
                value={musicTraining}
                onChange={(e) => setMusicTraining(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="aboutArtist"
                className="block text-sm font-medium text-gray-700"
              >
                Tell Me About Yourself
              </label>
              <Textarea
                id="aboutArtist"
                value={aboutArtist}
                onChange={(e) => setAboutArtist(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Update
            </button>
          </form>
          {/* Confirmation modal */}
          <Modal
            isOpen={showConfirmationModal}
            onClose={() => setShowConfirmationModal(false)}
            title="Are you sure you want to update?"
            description={`This will update the profile for ${artistName}`}
          >
            <div className="flex justify-between">
              <button
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                type="button"
                onClick={() => setShowConfirmationModal(false)}
              >
                Cancel
              </button>
              <button
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                type="button"
                onClick={handleConfirmSubmit}
              >
                Update
              </button>
            </div>
          </Modal>

          <Modal isOpen={isLoading} title="Updating Artist Data...">
            <div className="flex justify-center items-center">
              <HashLoader color="#dc2626" size={80} />
            </div>
          </Modal>

          {error && <p className="error">{error}</p>}
          <Modal
            isOpen={success}
            onClose={() => setSuccess(false)}
            title="Artist Data Updated"
            description={`${artistName}'s Form has been successfully updated.`}
          >
            <div className="flex justify-center">
              <button
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                type="button"
                onClick={() => router.push("/")}
              >
                Dashboard
              </button>
            </div>
          </Modal>
        </div>
      )}
    </>
  );
};

export default EditArtist;
