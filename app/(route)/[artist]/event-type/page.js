"use client";
import React, { useEffect, useState } from "react";
import "react-cropper-custom/dist/index.css";
import "@/app/_components/modal.css"; // Import CSS
import axios from "axios";
import { useRouter } from "next/navigation";
import Modal from "@/app/_components/Modal";
import { HashLoader } from "react-spinners";
import SearchList from "@/app/_components/SearchList";
import eventTypesOptions from "@/constants/eventTypes";
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
      setCorporateBudget(artistData.corporateBudget);
      setCollegeBudget(artistData.collegeBudget);
      setWeddingBudget(artistData.price);
      setSingerCumGuitaristBudget(artistData.singerCumGuitaristBudget);
      setSingerPlusGuitaristBudget(artistData.singerPlusGuitaristBudget);
      setTicketingConcertBudget(artistData.ticketingConcertBudget);

      const eventTypesArray = artistData.eventsType
        .split(",")
        .map((type) => type.trim());

      setEventTypes(eventTypesArray);
    } catch (error) {
      console.error("Error fetching artists:", error);
    } finally {
      // Reset loading state
      setFetchData(false);
    }
  };

  const [artistName, setArtistName] = useState();
  const [eventTypes, setEventTypes] = useState([]);
  const [corporateBudget, setCorporateBudget] = useState("");
  const [collegeBudget, setCollegeBudget] = useState("");
  const [weddingBudget, setWeddingBudget] = useState("");
  const [singerCumGuitaristBudget, setSingerCumGuitaristBudget] = useState("");
  const [singerPlusGuitaristBudget, setSingerPlusGuitaristBudget] =
    useState("");
  const [ticketingConcertBudget, setTicketingConcertBudget] = useState("");
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [fetchData, setFetchData] = useState(true);
  const router = useRouter();

  useEffect(() => {
    getArtist();
  }, []);

  const formatArtistName = (name) => {
    return name.toLowerCase().replace(/ /g, "-");
  };

  const handleEventTypeChange = (event) => {
    const selectedEventType = event.target.value;
    if (event.target.checked) {
      setEventTypes([...eventTypes, selectedEventType]);
    } else {
      setEventTypes(eventTypes.filter((type) => type !== selectedEventType));
    }
  };

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
        eventTypes,
        corporateBudget,
        collegeBudget,
        weddingBudget,
        singerCumGuitaristBudget,
        singerPlusGuitaristBudget,
        ticketingConcertBudget,
      };

      const response = axios.post(
        `${process.env.NEXT_PUBLIC_API}/edit-event-type/${id}`,
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
          <h1 className="text-xl font-bold mb-4">Event Types & Budget</h1>
          <form onSubmit={handleSubmit}>
            <SearchList
              type="Event Types"
              list={eventTypesOptions}
              topList={eventTypesOptions}
              selectedItems={eventTypes}
              setSelectedItems={setEventTypes}
            />

            {eventTypes.includes("Corporate") && (
              <div className="mb-4">
                <label
                  htmlFor="corporateBudget"
                  className="block text-sm font-medium text-gray-700"
                >
                  Corporate Event Budget
                </label>
                <input
                  type="number"
                  id="corporateBudget"
                  value={corporateBudget}
                  step={10000}
                  onChange={(e) => setCorporateBudget(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                />
              </div>
            )}

            {eventTypes.includes("College") && (
              <div className="mb-4">
                <label
                  htmlFor="collegeBudget"
                  className="block text-sm font-medium text-gray-700"
                >
                  College Event Budget
                </label>
                <input
                  type="number"
                  id="collegeBudget"
                  value={collegeBudget}
                  onChange={(e) => setCollegeBudget(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                />
              </div>
            )}

            {eventTypes.includes("Wedding") && (
              <div className="mb-4">
                <label
                  htmlFor="weddingBudget"
                  className="block text-sm font-medium text-gray-700"
                >
                  Wedding/Private Event Budget
                </label>
                <input
                  type="number"
                  id="weddingBudget"
                  value={weddingBudget}
                  onChange={(e) => setWeddingBudget(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                />
              </div>
            )}

            {eventTypes.includes("House Party") && (
              <>
                <div className="mb-4">
                  <label
                    htmlFor="singerCumGuitaristBudget"
                    className="block text-sm font-medium text-gray-700"
                  >
                    House Party Budget
                  </label>
                  <input
                    type="number"
                    id="singerCumGuitaristBudget"
                    value={singerCumGuitaristBudget}
                    onChange={(e) =>
                      setSingerCumGuitaristBudget(e.target.value)
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                  />
                </div>
              </>
            )}

            {eventTypes.includes("Ticketing Concert") && (
              <div className="mb-4">
                <label
                  htmlFor="ticketingConcertBudget"
                  className="block text-sm font-medium text-gray-700"
                >
                  Ticketing Concert Budget
                </label>
                <input
                  type="number"
                  id="ticketingConcertBudget"
                  value={ticketingConcertBudget}
                  onChange={(e) => setTicketingConcertBudget(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                />
              </div>
            )}

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
            description={`This will update Event Type & Budget Details for ${artistName}`}
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

          <Modal
            isOpen={isLoading}
            title="Updating Event Type & Budget Details..."
          >
            <div className="flex justify-center items-center">
              <HashLoader color="#dc2626" size={80} />
            </div>
          </Modal>

          {error && <p className="error">{error}</p>}
          <Modal
            isOpen={success}
            onClose={() => setSuccess(false)}
            title="Artist Data Updated"
            description={`${artistName}'s Event Details & Budget Details Updated Successfully.`}
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
