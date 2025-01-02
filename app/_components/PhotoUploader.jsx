import React, { useState, useEffect } from "react";
import Dropzone from "react-dropzone";
import { Cropper, getCroppedImg } from "react-cropper-custom";
import "react-cropper-custom/dist/index.css";
import "./modal.css";
import {
  S3Client,
  PutObjectCommand,
  ListObjectsCommand,
  DeleteObjectCommand, // Added for deleting the image from S3
} from "@aws-sdk/client-s3";
import { nanoid } from "nanoid";
import { fromBase64 } from "@aws-sdk/util-base64";

const PhotoUploader = ({ artistName, setProfilePic, initialImageLink }) => {
  console.log("InitialImageLink: ", initialImageLink);

  const [imageSrc, setImageSrc] = useState(null);
  const [cropData, setCropData] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [showCroppedImage, setShowCroppedImage] = useState(false);
  const [awsLink, setAwsLink] = useState(initialImageLink);
  const [isFirstDrop, setIsFirstDrop] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialImageLink && initialImageLink.length > 1) {
      setAwsLink(initialImageLink);
      setShowCroppedImage(true);
      setCropData(initialImageLink);
    }
  }, [initialImageLink]);

  const onFileDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageSrc(reader.result);
        setShowModal(true);
        if (isFirstDrop) {
          handleImageZoom();
          setIsFirstDrop(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageZoom = async () => {
    setZoom(2);
    setTimeout(() => {
      setZoom(1);
    }, 500);
  };

  const onCropComplete = async (croppedArea) => {
    try {
      const croppedImg = await getCroppedImg(imageSrc, croppedArea);
      setCropData(croppedImg);
    } catch (e) {
      console.error(e);
    }
  };

  const handleProfileUpload = async (base64) => {
    try {
      const img = new Image();
      img.src = base64;
      img.onload = async () => {
        const canvas = document.createElement("canvas");
        canvas.width = 350;
        canvas.height = 350;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, 350, 350);
        const webpData = canvas.toDataURL("image/webp", 0.8);
        const imageData = webpData.split(",")[1];
        const location = await uploadProfileToS3(imageData);
        setProfilePic(location);
        setShowModal(false);
        setShowCroppedImage(true);
        setAwsLink(location);
      };
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  const uploadProfileToS3 = async (base64) => {
    try {
      const s3Client = new S3Client({
        region: process.env.NEXT_PUBLIC_REGION,
        credentials: {
          accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY,
          secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY,
        },
      });

      const folderName = artistName.replace(/\s+/g, "-");
      const folderKey = `${folderName}/`;

      // Check if the folder exists
      const listObjectsCommand = new ListObjectsCommand({
        Bucket: process.env.NEXT_PUBLIC_BUCKET,
        Prefix: folderKey,
      });
      const { Contents } = await s3Client.send(listObjectsCommand);

      if (!Contents || Contents.length === 0) {
        // Create the folder
        const createFolderParams = {
          Bucket: process.env.NEXT_PUBLIC_BUCKET,
          Key: folderKey,
        };
        const putObjectCommand = new PutObjectCommand(createFolderParams);
        await s3Client.send(putObjectCommand);
      }

      const fileName = `${nanoid()}.webp`;
      const buffer = fromBase64(base64);
      const uploadParams = {
        Bucket: process.env.NEXT_PUBLIC_BUCKET,
        Key: `${folderKey}${fileName}`,
        Body: buffer,
        ACL: "public-read",
        ContentType: "image/webp",
      };
      const putObjectCommand = new PutObjectCommand(uploadParams);
      await s3Client.send(putObjectCommand);

      const awsImageUrl = `https://${process.env.NEXT_PUBLIC_BUCKET}.s3.${process.env.NEXT_PUBLIC_REGION}.amazonaws.com/${folderName}/${fileName}`;

      setAwsLink(awsImageUrl);

      return awsImageUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };

  const handleSave = () => {
    handleProfileUpload(cropData);
  };

  const handleDeleteImage = async () => {
    try {
      // Attempt to delete the image using awsLink
      await deleteImageFromS3(awsLink);

      // If the delete operation is successful, reset the state
      setImageSrc(null);
      setCropData(null);
      setShowModal(false);
      setShowCroppedImage(false);
      setProfilePic(null);
      setAwsLink(null);
    } catch (error) {
      // If an error occurs with awsLink, try with initialImageLink
      console.error("Error deleting image with awsLink:", error);

      try {
        await deleteImageFromS3(initialImageLink);

        // Reset the state after successful delete
        setImageSrc(null);
        setCropData(null);
        setShowModal(false);
        setShowCroppedImage(false);
        setProfilePic(null);
        setAwsLink(null);
      } catch (secondError) {
        // Handle the error for the second attempt (with initialImageLink)
        setError("Error deleting image");
        console.error(
          "Error deleting image with initialImageLink:",
          secondError
        );
      }
    }
  };

  const deleteImageFromS3 = async (imageUrl) => {
    // Extract the key from the image URL
    const objectKey = new URL(imageUrl).pathname.slice(1);

    // Create S3 client
    const s3Client = new S3Client({
      region: process.env.NEXT_PUBLIC_REGION,
      credentials: {
        accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY,
        secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY,
      },
    });

    const deleteParams = {
      Bucket: process.env.NEXT_PUBLIC_BUCKET,
      Key: objectKey,
    };

    const deleteCommand = new DeleteObjectCommand(deleteParams);

    // Send delete object command to S3
    await s3Client.send(deleteCommand);
  };

  return (
    <>
      {!showCroppedImage && (
        <div className="mb-4">
          <Dropzone
            onDrop={onFileDrop}
            accept={{ "image/*": [] }}
            maxSize={5000000}
            maxFiles={1}
            multiple={false}
          >
            {({ getRootProps, getInputProps }) => (
              <section className="bg-gray-200 rounded-lg p-4 pt-8 pb-8 text-center max-w-36">
                <div {...getRootProps()}>
                  <input {...getInputProps()} />
                  <p>
                    Drag & drop Image to upload here or click to upload image.
                  </p>
                </div>
              </section>
            )}
          </Dropzone>
        </div>
      )}
      {showCroppedImage && cropData && (
        <>
          <div className="relative mb-4">
            <button
              className="absolute top-3 font-bold text-2xl left-32 bg-red-500 w-8 h-8 text-white pb-1 rounded-full"
              onClick={() => {
                handleDeleteImage(awsLink);
              }}
              type="button"
            >
              x
            </button>
            <label className="block text-sm font-medium text-gray-700">
              Profile Pic
            </label>
            <img
              src={cropData}
              alt="Cropped Image"
              className="mb-4 rounded-lg max-w-36"
            />
          </div>
        </>
      )}
      {showModal && imageSrc && (
        <div className="modal-overlay">
          <div className="modal flex flex-col gap-4">
            <Cropper
              src={imageSrc}
              width={300}
              height={300}
              zoom={zoom}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
            />
            <div className="flex justify-between">
              <button
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                type="button"
                onClick={() => {
                  // Reset image selection state
                  setImageSrc(null);
                  setShowModal(false);
                }}
              >
                Cancel
              </button>
              <button
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                type="button"
                onClick={handleSave}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PhotoUploader;
