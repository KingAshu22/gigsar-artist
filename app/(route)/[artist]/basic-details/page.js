"use client";
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import PhotoUploader from "@/app/_components/PhotoUploader";
import { useRouter } from "next/navigation";
import Modal from "@/app/_components/Modal";
import { HashLoader } from "react-spinners";
import Script from "next/script";
import SingleSearch from "@/app/_components/SingleSearch";

const basicDetails = ({ params }) => {
  const [id, setId] = useState();

  const getArtist = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API}/artist/artistName/` + params.artist
      );
      const artistData = response.data;

      setId(artistData._id);
      setArtistName(artistData.name);
      setProfilePic(artistData.profilePic);
      setGender(artistData.gender);
      setContactNumber(artistData.contact);
      setEmail(artistData.email);
      setArtistType(artistData.artistType);

      // Split location into parts
      const locationParts = artistData.location
        ? artistData.location.split(", ")
        : [];
      const city = locationParts[0] || "";
      const state = locationParts[1] || "";
      const country = locationParts[2] || "";

      // Set country first, then fetch states
      setSelectedCountry(country);

      // Fetch states and set selected state
      await getStates(country);
      setSelectedState(state);

      // Fetch cities based on the state and set selected city
      await getCities(state);
      setSelectedCity(city);
    } catch (error) {
      console.error("Error fetching artist:", error);
    } finally {
      setFetchData(false);
    }
  };

  const inputRef = useRef(null);

  const [artistName, setArtistName] = useState("");
  const [profilePic, setProfilePic] = useState();
  const [gender, setGender] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [artistType, setArtistType] = useState("");
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [fetchData, setFetchData] = useState(true);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState();
  const [selectedState, setSelectedState] = useState();
  const [selectedCity, setSelectedCity] = useState();
  const router = useRouter();

  useEffect(() => {
    getCountries();
    getArtist();
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      setSelectedState("");
      setSelectedCity("");
      getStates(selectedCountry);
    }
  }, [selectedCountry]);

  useEffect(() => {
    if (selectedState) {
      setSelectedCity("");
      getCities(selectedState);
    }
  }, [selectedState]);

  useEffect(() => {
    if (selectedCity) {
      setLocation(`${selectedCity}, ${selectedState}, ${selectedCountry}`);
    }
  }, [selectedCity]);

  const getCountries = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API}/countries`
      );
      setCountries(response.data);
    } catch (error) {
      console.error("Error fetching countries:", error);
    }
  };

  const getStates = async (country) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/states`,
        { countryName: country }
      );
      setStates(response.data);
    } catch (error) {
      console.error("Error fetching states:", error);
    }
  };

  const getCities = async (state) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/cities`,
        {
          countryName: selectedCountry,
          stateName: state,
        }
      );
      setCities(response.data);
    } catch (error) {
      console.error("Error fetching cities:", error);
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

      const formattedArtistName = artistName.trim();

      const formData = {
        artistName: formattedArtistName,
        profilePic,
        gender,
        contactNumber,
        email,
        location,
        artistType,
      };

      await axios.post(
        `${process.env.NEXT_PUBLIC_API}/edit-basic-details/${id}`,
        formData,
        { withCredentials: true }
      );
    } catch (error) {
      console.error("Error submitting form:", error);
      setError(error.message || "An error occurred during submission.");
    } finally {
      setIsLoading(false);
      setSuccess(true);
    }
  };

  return (
    <div className="container mx-auto p-5">
      <h1 className="text-xl font-bold mb-4">Artist Registration</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="artistName"
            className="block text-sm font-medium text-gray-700"
          >
            Artist Name
          </label>
          <input
            type="text"
            id="artistName"
            value={artistName}
            required
            readOnly
            onChange={(e) => setArtistName(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <label className="block text-sm font-medium text-gray-700">
          Upload Profile Pic
        </label>
        <PhotoUploader
          artistName={artistName}
          setProfilePic={setProfilePic}
          initialImageLink={profilePic}
        />

        <div className="mb-4">
          <label
            htmlFor="gender"
            className="block text-sm font-medium text-gray-700"
          >
            Gender
          </label>
          <select
            id="gender"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="mb-4">
          <label
            htmlFor="contactNumber"
            className="block text-sm font-medium text-gray-700"
          >
            Contact Number
          </label>
          <input
            type="text"
            id="contactNumber"
            value={contactNumber}
            readOnly
            onChange={(e) => setContactNumber(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          />
        </div>
        <SingleSearch
          type={"Country"}
          list={countries}
          selectedItem={selectedCountry}
          setSelectedItem={setSelectedCountry}
        />

        <SingleSearch
          type={"State"}
          list={states}
          selectedItem={selectedState}
          setSelectedItem={setSelectedState}
        />

        <SingleSearch
          type={"City"}
          list={cities}
          selectedItem={selectedCity}
          setSelectedItem={setSelectedCity}
        />

        <div className="mb-4">
          <label
            htmlFor="artistType"
            className="block text-sm font-medium text-gray-700"
          >
            Artist Type
          </label>
          <select
            id="artistType"
            value={artistType}
            onChange={(e) => setArtistType(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          >
            <option value="">Select Artist Type</option>
            <option value="singer-band">Singer/Live Band</option>
            <option value="instrumentalist">Instrumentalist</option>
            <option value="dj">DJ</option>
            <option value="comedian">Comedian</option>
            <option value="actor">Actor</option>
            <option value="magician">Magician</option>
            <option value="dancer">Dancer</option>
            <option value="anchor">Anchor</option>
            <option value="foreign-artist">Foreign Artist</option>
            <option value="event-manager">Event Manager</option>
            <option value="wedding-planner">Wedding Planner</option>
            <option value="artist-manager">Artist Manager</option>
            <option value="rapper">Rapper</option>
            <option value="voice-over-artist">Voice over Artist</option>
            <option value="session-artist">Session Artist (Musician)</option>
            <option value="music-composer">Music Composer</option>
            <option value="lyricist">Lyricist</option>
            <option value="master-mixing-engineer">
              Master Mixing Engineer
            </option>
          </select>
        </div>
        {artistName &&
          gender &&
          email &&
          selectedCountry &&
          selectedState &&
          selectedCity &&
          artistType && (
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Submit
            </button>
          )}
      </form>
      {/* Confirmation modal */}
      <Modal
        isOpen={showConfirmationModal}
        onClose={() => setShowConfirmationModal(false)}
        title="Are you sure you want to submit the form?"
        description={`This will create a profile for ${artistName}`}
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
            Submit
          </button>
        </div>
      </Modal>

      <Modal isOpen={isLoading} title="Submitting Form...">
        <div className="flex justify-center items-center">
          <HashLoader color="#dc2626" size={80} />
        </div>
      </Modal>

      {error && <p className="error">{error}</p>}
      <Modal
        isOpen={success}
        onClose={() => setSuccess(false)}
        title="Artist Registered"
        description={`${artistName}'s Basic Details has been saved successfully. Continue in Artist Dashboard to add more details about you`}
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
  );
};

export default basicDetails;
