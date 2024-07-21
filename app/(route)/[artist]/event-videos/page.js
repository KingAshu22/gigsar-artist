"use client";
import React, { useEffect, useState } from "react";
import "react-cropper-custom/dist/index.css";
import "@/app/_components/modal.css"; // Import CSS
import axios from "axios";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Modal from "@/app/_components/Modal";
import { HashLoader } from "react-spinners";
import ReactPlayer from "react-player/lazy";

const EditArtist = ({ params }) => {
  const [id, setId] = useState("");
  const [artistName, setArtistName] = useState("");
  const [weddingLink, setWeddingLink] = useState([""]);
  const [corporateLink, setCorporateLink] = useState([""]);
  const [collegeLink, setCollegeLink] = useState([""]);
  const [concertLink, setConcertLink] = useState([""]);
  const [originalLink, setOriginalLink] = useState([""]);
  const [bollywoodLink, setBollywoodLink] = useState([""]);
  const [coverLink, setCoverLink] = useState([""]);
  const [cafeLink, setCafeLink] = useState([""]);
  const [houseLink, setHouseLink] = useState([""]);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [fetchData, setFetchData] = useState(true);
  const router = useRouter();

  const extractLinks = (artistData, eventName) => {
    return artistData.events
      .filter((event) => event.name === eventName)
      .map((event) => event.links)
      .flat();
  };

  const getArtist = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API}/artist/artistName/` + params.artist
      );
      const artistData = response.data;

      setId(artistData._id);
      setArtistName(artistData.name);

      setWeddingLink(extractLinks(artistData, "Wedding Videos"));
      setCorporateLink(extractLinks(artistData, "Corporate Videos"));
      setCollegeLink(extractLinks(artistData, "College Videos"));
      setConcertLink(extractLinks(artistData, "Ticketing Concert Videos"));
      setOriginalLink(extractLinks(artistData, "Original Videos"));
      setBollywoodLink(extractLinks(artistData, "Bollywood Playback Videos"));
      setCoverLink(extractLinks(artistData, "Cover Videos"));
      setCafeLink(extractLinks(artistData, "Cafe/Clubs Videos"));
      setHouseLink(extractLinks(artistData, "House Party Videos"));
    } catch (error) {
      console.error("Error fetching artist:", error);
    } finally {
      console.log(houseLink);
      setFetchData(false);
    }
  };

  useEffect(() => {
    getArtist();
  }, [params.artist]);

  const addMoreLinks = (setter) => {
    setter((prevLinks) => [...prevLinks, ""]);
  };

  const extractVideoId = (link) => {
    const regex =
      /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = link.match(regex);
    return match ? match[1] : null;
  };

  const handleLinkChange = (index, value, links, setter) => {
    const videoId = extractVideoId(value);
    const updatedLinks = [...links];
    updatedLinks[index] = videoId || "";
    setter(updatedLinks);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowConfirmationModal(true);
    setError(null);
    setSuccess(false);
  };

  const handleConfirmSubmit = async () => {
    try {
      setShowConfirmationModal(false);
      setIsLoading(true);
      const formData = {
        weddingLink,
        corporateLink,
        collegeLink,
        concertLink,
        originalLink,
        bollywoodLink,
        coverLink,
        cafeLink,
        houseLink,
      };

      await axios.post(
        `${process.env.NEXT_PUBLIC_API}/edit-event-videos/${id}`,
        formData,
        { withCredentials: true }
      );
      setSuccess(true);
    } catch (error) {
      console.error("Error submitting form:", error);
      setError(error.message || "An error occurred during submission.");
    } finally {
      setIsLoading(false);
    }
  };

  const eventTypes = [
    ["Wedding/Private Event Videos Youtube Link:", weddingLink, setWeddingLink],
    ["Corporate Event Videos Youtube Link:", corporateLink, setCorporateLink],
    ["College Event Videos Youtube Link:", collegeLink, setCollegeLink],
    ["Ticketing Concert Videos Youtube Link:", concertLink, setConcertLink],
    ["Original Videos Youtube Link:", originalLink, setOriginalLink],
    [
      "Bollywood Playback Videos Youtube Link:",
      bollywoodLink,
      setBollywoodLink,
    ],
    ["Cover Videos Youtube Link:", coverLink, setCoverLink],
    ["Cafe/Clubs Videos Youtube Link:", cafeLink, setCafeLink],
    ["House Party Event Videos Youtube Link:", houseLink, setHouseLink],
  ];

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
          <h1 className="text-2xl font-bold mb-4 text-primary">Event Videos</h1>
          <form onSubmit={handleSubmit}>
            {eventTypes.map(([label, links, setter], idx) => (
              <div className="mb-20" key={idx}>
                <div>
                  <label className="block text-lg mb-2 font-bold text-gray-700">
                    {label}
                  </label>
                  {links.map((link, index) => (
                    <div key={index} className="mb-4">
                      {link.length > 1 && (
                        <>
                          <ReactPlayer
                            url={`https://www.youtube.com/watch?v=${link}`}
                            width="480px"
                            height="270px"
                            class="desktop"
                          />

                          <ReactPlayer
                            url={`https://www.youtube.com/watch?v=${link}`}
                            width="312px"
                            height="175.5px"
                            class="mobile"
                          />
                        </>
                      )}
                      <input
                        type="text"
                        value={link}
                        autoComplete="off"
                        className="mt-0 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        onChange={(e) =>
                          handleLinkChange(index, e.target.value, links, setter)
                        }
                      />
                    </div>
                  ))}
                </div>
                <Button type="button" onClick={() => addMoreLinks(setter)}>
                  Add Link
                </Button>
                <hr
                  className="mt-4"
                  style={{
                    borderWidth: "1px",
                    borderColor: "#f44336",
                  }}
                />
              </div>
            ))}
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Update
            </button>
          </form>

          <Modal
            isOpen={showConfirmationModal}
            onClose={() => setShowConfirmationModal(false)}
            title="Are you sure you want to Submit?"
            description={`This will update Event Videos for ${artistName}`}
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

          <Modal isOpen={isLoading} title="Updating Event Videos...">
            <div className="flex justify-center items-center">
              <HashLoader color="#dc2626" size={80} />
            </div>
          </Modal>

          {error && <p className="error">{error}</p>}
          <Modal
            isOpen={success}
            onClose={() => setSuccess(false)}
            title="Event Videos Updated"
            description={`${artistName}'s Event Videos have been successfully updated.`}
          >
            <div className="flex justify-center">
              <button
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={() => router.push("/")}
              >
                Go Back to Home
              </button>
            </div>
          </Modal>
        </div>
      )}
    </>
  );
};

export default EditArtist;
