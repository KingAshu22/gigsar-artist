"use client";
import React, { useEffect, useState } from "react";
import "react-cropper-custom/dist/index.css";
import "@/app/_components/modal.css"; // Import CSS
import axios from "axios";
import PhotoUploader from "@/app/_components/PhotoUploader";
import { useRouter } from "next/navigation";
import Modal from "@/app/_components/Modal";
import { HashLoader } from "react-spinners";
import { Button } from "@/components/ui/button";

const EditArtist = ({ params }) => {
  const [id, setId] = useState();
  const [artistName, setArtistName] = useState();
  const [galleryLink, setGalleryLink] = useState([]);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [fetchData, setFetchData] = useState(true);
  const router = useRouter();

  const getArtist = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API}/artist/artistName/${params.artist}`
      );
      const artistData = response.data;

      setId(artistData._id);
      setArtistName(artistData.name);
      setGalleryLink(artistData.gallery.map((item) => item.link));
    } catch (error) {
      console.error("Error fetching artists:", error);
    } finally {
      setFetchData(false);
    }
  };

  useEffect(() => {
    getArtist();
  }, [params.artist]);

  const handleGalleryUpload = (link, index) => {
    setGalleryLink((prevLinks) => {
      const newLinks = [...prevLinks];
      newLinks[index] = link;
      return newLinks;
    });
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

      const formData = { galleryLink };
      await axios.post(
        `${process.env.NEXT_PUBLIC_API}/edit-gallery/${id}`,
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
          <h1 className="text-xl font-bold mb-4">Gallery Photos</h1>
          <form onSubmit={handleSubmit}>
            {/* Gallery Image Uploaders */}
            <div className="mb-4">
              <h3>Upload Gallery Images</h3>
              <div className="gallery-uploader-container grid grid-cols-2 md:grid-cols-3 gap-4 justify-center">
                {[...Array(9)].map((_, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <label
                      htmlFor={`galleryImage${index + 1}`}
                      className="block text-sm font-medium text-gray-700 text-center"
                    >
                      Upload Gallery Image {index + 1}
                    </label>
                    <PhotoUploader
                      id={`galleryImage${index + 1}`}
                      artistName={artistName}
                      setProfilePic={(link) => handleGalleryUpload(link, index)}
                      initialImageLink={galleryLink[index]}
                    />
                  </div>
                ))}
              </div>
            </div>

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
            description={`This will add Gallery Images for ${artistName}`}
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

          <Modal isOpen={isLoading} title="Adding Gallery Images...">
            <div className="flex justify-center items-center">
              <HashLoader color="#dc2626" size={80} />
            </div>
          </Modal>

          {error && <p className="error">{error}</p>}
          <Modal
            isOpen={success}
            onClose={() => setSuccess(false)}
            title="Gallery Images Updated"
            description={`${artistName}'s Gallery Images have been updated`}
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
