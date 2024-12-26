"use client";
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import PhotoUploader from "@/app/_components/PhotoUploader";
import { useRouter } from "next/navigation";
import Modal from "@/app/_components/Modal";
import { HashLoader } from "react-spinners";
import Script from "next/script";
import { Button } from "@/components/ui/button";
import SingleSearch from "@/app/_components/SingleSearch";
import toast from "react-hot-toast";

const ArtistRegistration = () => {
  const inputRef = useRef(null);

  const [expiryTime, setExpiryTime] = useState(null);
  const [artistName, setArtistName] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [gender, setGender] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [artistType, setArtistType] = useState("");
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isNameExist, setIsNameExist] = useState(false);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState();
  const [selectedState, setSelectedState] = useState();
  const [selectedCity, setSelectedCity] = useState();
  const [currentStep, setCurrentStep] = useState(1); // Step tracker
  const router = useRouter();

  useEffect(() => {
    getCountries();
    // Only run this effect on the client
    if (typeof window !== "undefined") {
      setExpiryTime(localStorage.getItem("authExpiry"));
      setContactNumber("+" + localStorage.getItem("mobile"));
    }
  }, []);

  const handleNextStep = () => {
    setCurrentStep((prevStep) => prevStep + 1);
  };

  const handlePrevStep = () => {
    setCurrentStep((prevStep) => prevStep - 1);
  };

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

    // Clean up artist name: remove extra spaces from both ends
    const formattedArtistName = artistName
      .trim()
      .toLowerCase()
      .replace(/ /g, "-");

    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API}/artist/artistName/${formattedArtistName}`
      );

      if (response.status === 200) {
        setIsNameExist(true); // Artist found
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setShowConfirmationModal(true); // Artist not found
        setError(null);
        setSuccess(false);
      } else {
        console.error("An unexpected error occurred", error);
        setError("An unexpected error occurred");
      }
    }
  };

  const handleConfirmSubmit = async () => {
    try {
      setShowConfirmationModal(false);
      setIsLoading(true);

      // Clean up location: remove everything after the first comma
      const formattedLocation = location.split(",")[0].trim();

      // Clean up artist name: remove extra spaces from both ends
      const formattedArtistName = artistName.trim();

      // Handle the submission of form data
      const formData = {
        expiryTime,
        artistName: formattedArtistName,
        profilePic,
        gender,
        contactNumber,
        email,
        location: formattedLocation, // Use the cleaned-up location
        artistType,
        showGigsar: "hidden",
        showBookMySinger: false,
      };

      await axios.post(
        `${process.env.NEXT_PUBLIC_API}/artist-direct-registration`,
        formData,
        { withCredentials: true }
      );
      setSuccess(true);
    } catch (error) {
      // Handle error
      console.error("Error submitting form:", error);
      setError(error.message || "An error occurred during submission.");
    } finally {
      // Reset loading state
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-5">
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        onLoad={() => {
          if (inputRef.current) {
            const autocomplete = new google.maps.places.Autocomplete(
              inputRef.current,
              {
                types: ["(cities)"],
              }
            );

            autocomplete.addListener("place_changed", () => {
              const place = autocomplete.getPlace();
              if (place.geometry) {
                setLocation(place.formatted_address);
              }
            });
          }
        }}
      />
      <h1 className="text-xl font-bold mb-4">Artist Registration</h1>
      <form onSubmit={handleSubmit}>
        {/* Step 1: Artist Name, Gender, Email */}
        {currentStep === 1 && (
          <>
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
                onChange={(e) => setArtistName(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
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

            <div className="flex justify-end w-full mt-4">
              {artistName && gender && email && (
                <button
                  type="button"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={handleNextStep}
                >
                  Next
                </button>
              )}
            </div>
          </>
        )}

        {/* Step 2: Profile Pic */}
        {currentStep === 2 && (
          <>
            <label className="block text-sm font-medium text-gray-700">
              Upload Profile Pic
            </label>
            <PhotoUploader
              artistName={artistName}
              setProfilePic={setProfilePic}
            />
            <div className="flex justify-between w-full mt-4">
              <button
                type="button"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={handlePrevStep}
              >
                Previous
              </button>

              <button
                type="button"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={handleNextStep}
              >
                Next
              </button>
            </div>
          </>
        )}

        {/* Step 3: Country */}
        {currentStep === 3 && (
          <>
            <label>
              Please select the country name from the dropdown below
            </label>
            <SingleSearch
              type={"Country"}
              list={countries}
              selectedItem={selectedCountry}
              setSelectedItem={setSelectedCountry}
            />
            <div className="flex justify-between w-full mt-4">
              <button
                type="button"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={handlePrevStep}
              >
                Previous
              </button>
              {selectedCountry && (
                <button
                  type="button"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={handleNextStep}
                >
                  Next
                </button>
              )}
            </div>
          </>
        )}

        {/* Step 4: State */}
        {currentStep === 4 && (
          <>
            <SingleSearch
              type={"State"}
              list={states}
              selectedItem={selectedState}
              setSelectedItem={setSelectedState}
            />

            <div className="flex justify-between w-full mt-4">
              <button
                type="button"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={handlePrevStep}
              >
                Previous
              </button>
              {selectedState && (
                <button
                  type="button"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={handleNextStep}
                >
                  Next
                </button>
              )}
            </div>
          </>
        )}

        {/* Step 5: City */}
        {currentStep === 5 && (
          <>
            <SingleSearch
              type={"City"}
              list={cities}
              selectedItem={selectedCity}
              setSelectedItem={setSelectedCity}
            />

            <div className="flex justify-between w-full mt-4">
              <button
                type="button"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={handlePrevStep}
              >
                Previous
              </button>
              {selectedState && (
                <button
                  type="button"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={handleNextStep}
                >
                  Next
                </button>
              )}
            </div>
          </>
        )}

        {/* Step 6: Artist Type */}
        {currentStep === 6 && (
          <>
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
                <option value="session-artist">
                  Session Artist (Musician)
                </option>
                <option value="music-composer">Music Composer</option>
                <option value="lyricist">Lyricist</option>
                <option value="master-mixing-engineer">
                  Master Mixing Engineer
                </option>
              </select>
            </div>

            <div className="flex justify-between w-full mt-4">
              <button
                type="button"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={handlePrevStep}
              >
                Previous
              </button>

              {artistType && (
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Submit
                </button>
              )}
            </div>
          </>
        )}
      </form>

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
      <Modal
        isOpen={isNameExist}
        title={"Name Already Exists"}
        onClose={() => {
          setIsNameExist(false);
        }}
      >
        <p className="text-center">
          Artist Already exist with name <strong>{artistName}</strong>.<br />{" "}
          Kindly fill any other Name.
        </p>
        <div className="flex justify-center mt-4">
          <Button onClick={() => setIsNameExist(false)}>Close</Button>
        </div>
      </Modal>
    </div>
  );
};

export default ArtistRegistration;
