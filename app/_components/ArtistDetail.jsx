import { Button } from "@/components/ui/button";
import {
  BadgeIndianRupee,
  Clock,
  GraduationCap,
  Guitar,
  IndianRupee,
  MapPin,
  Music,
  Star,
  Type,
  User,
} from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import ReactPlayer from "react-player/lazy";
import { formatToIndianNumber } from "@/lib/utils";
import { useRouter } from "next/navigation";
import Modal from "@/app/_components/Modal";

function ArtistDetail({ artist }) {
  const router = useRouter();
  const [eventName, setEventName] = useState("");
  const [eventInfo, setEventInfo] = useState("");
  const [selectedEventType, setSelectedEventType] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const selectedEventType = params.get("selectedEventType");

    const eventTypeMapping = {
      Corporate: "corporateBudget",
      College: "collegeBudget",
      Wedding: "price",
      Reception: "price",
      Haldi: "price",
      Mehendi: "price",
      "Mayra/Bhaat": "price",
      "Musical/Vedic Pheras": "price",
      Sangeet: "price",
      "House Party": "singerCumGuitaristBudget",
      "Ticketing Concert": "ticketingConcertBudget",
      Virtual: "singerCumGuitaristBudget",
    };

    const eventInfoMapping = {
      Corporate: "1 x Singer + 4 Instrumental Artists",
      College: "1 x Singer + 4 Instrumental Artists",
      Wedding: "1 x Singer + 4 Instrumental Artists",
      Reception: "1 x Singer + 4 Instrumental Artists",
      Haldi: "1 x Singer + 4 Instrumental Artists",
      Mehendi: "1 x Singer + 4 Instrumental Artists",
      "Mayra/Bhaat": "1 x Singer + 4 Instrumental Artists",
      "Musical/Vedic Pheras": "1 x Singer + 4 Instrumental Artists",
      Sangeet: "1 x Singer + 4 Instrumental Artists",
      "House Party": `1 x Singer Cum Guitarist or Singer + Guitarist<br/> 1 x Top Speaker with Stand<br/> 1 x Monitor Speaker with Stand<br/> 1 x Live Mixer<br/> 1 x Microphone with Stand<br/> 1 x Guitar Line Out<br/> Wires & other related Accessories<br/> Travelling Expenses in the same City`,
      "Ticketing Concert": "1 x Singer + 4 Instrumental Artists",
      Virtual: "1 x Singer + 4 Instrumental Artists",
    };

    setEventName(selectedEventType);
    setSelectedEventType(eventTypeMapping[selectedEventType] || "");
    setEventInfo(eventInfoMapping[selectedEventType] || "");
  }, []);

  const handleBookClick = (event, price) => {
    router.push(`/book/${artist.linkid}?event=${event}`);
  };

  const renderPricing = () => {
    if (selectedEventType && artist[selectedEventType]) {
      const price = artist[selectedEventType];
      return (
        <>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">{`${eventName} Event:`}</span>
            <span className="font-medium text-gray-900 whitespace-nowrap">
              ₹ {formatToIndianNumber(price)}
            </span>
          </div>
          <p
            className="mt-4 text-sm text-gray-500"
            dangerouslySetInnerHTML={{ __html: eventInfo }}
          ></p>
          <hr />
          <Button
            className="mt-3 rounded-full"
            onClick={() => handleBookClick(eventName, price)}
          >
            Book {artist.name} for {eventName} at ₹{" "}
            {formatToIndianNumber(price)}
          </Button>
        </>
      );
    }

    return (
      <div className="space-y-2">
        {artist.price && (
          <>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Wedding Event:</span>
              <span className="font-medium text-gray-900 whitespace-nowrap">
                ₹ {formatToIndianNumber(artist.price)}
              </span>
              <Button
                className="mt-3 rounded-full"
                onClick={() => handleBookClick("Wedding", artist.price)}
              >
                Book
              </Button>
            </div>
            <hr />
          </>
        )}
        {artist.corporateBudget && (
          <>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Corporate Event:</span>
              <span className="font-medium text-gray-900 whitespace-nowrap">
                ₹ {formatToIndianNumber(artist.corporateBudget)}
              </span>
              <Button
                className="mt-3 rounded-full"
                onClick={() =>
                  handleBookClick("Corporate", artist.corporateBudget)
                }
              >
                Book
              </Button>
            </div>
            <hr />
          </>
        )}
        {artist.collegeBudget && (
          <>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">College Event:</span>
              <span className="font-medium text-gray-900 whitespace-nowrap">
                ₹ {formatToIndianNumber(artist.collegeBudget)}
              </span>
              <Button
                className="mt-3 rounded-full"
                onClick={() => handleBookClick("College", artist.collegeBudget)}
              >
                Book
              </Button>
            </div>
            <hr />
          </>
        )}
        {artist.singerCumGuitaristBudget && (
          <>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">House/Private Event:</span>
              <span className="font-medium text-gray-900 whitespace-nowrap">
                ₹ {formatToIndianNumber(artist.singerCumGuitaristBudget)}
              </span>
              <Button
                className="mt-3 rounded-full"
                onClick={() =>
                  handleBookClick(
                    "House/Private",
                    artist.singerCumGuitaristBudget
                  )
                }
              >
                Book
              </Button>
            </div>
            <hr />
          </>
        )}
      </div>
    );
  };

  const openModal = (image) => {
    setSelectedImage(image);
    setModalOpen(true);
  };

  const closeModal = () => {
    setSelectedImage(null);
    setModalOpen(false);
  };

  return (
    <div className="container mx-auto p-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex justify-center md:justify-start">
          <Image
            src={artist.profilePic}
            width={200}
            height={200}
            alt={artist.name}
            className="border rounded-lg w-full h-auto object-cover cursor-pointer"
            onClick={() => openModal(artist.profilePic)}
          />
        </div>
        <div className="col-span-2 flex flex-col gap-4">
          <h2 className="font-bold text-3xl text-gray-800">{artist.name}</h2>
          <div className="flex flex-col md:flex-row md:gap-10 gap-4">
            <div className="flex flex-col gap-3">
              <div className="flex gap-2 items-center text-gray-600 text-lg">
                <User className="bg-gray-200 rounded-lg p-2" />
                <span>{artist.code}</span>
              </div>
              <div className="flex gap-2 items-center text-gray-600 text-lg">
                <Music className="bg-gray-200 rounded-lg p-2" />
                <span className="capitalize">Genre: {artist.genre}</span>
              </div>
              <div className="flex gap-2 items-center text-gray-600 text-lg">
                <MapPin className="bg-gray-200 rounded-lg p-2" />
                <span className="capitalize">{artist.location}</span>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex gap-2 items-center text-gray-600 text-lg">
                <Type className="bg-gray-200 rounded-lg p-2" />
                <span className="capitalize whitespace-nowrap">
                  Type: {artist.artistType}
                </span>
              </div>
              <div className="flex gap-2 items-center text-gray-600 text-lg">
                <GraduationCap className="bg-gray-200 rounded-lg p-2" />
                <span>Events: {artist.eventsType}</span>
              </div>
              <div className="flex gap-2 items-center text-gray-600 text-lg">
                <Clock className="bg-gray-200 rounded-lg p-2" />
                <span>Duration: {artist.time} Mins</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="p-5 border rounded-lg mt-5 shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Pricing</h2>
        <div className="space-y-2">{renderPricing()}</div>
      </div>
      <div className="p-5 border rounded-lg mt-5 shadow-lg">
        <h2 className="font-bold text-2xl text-primary mb-4">Gallery</h2>
        <div className="grid grid-cols-3 md:grid-cols-3 gap-4 mb-20">
          {artist.gallery.map((link, index) => (
            <div key={index} className="w-full">
              <Image
                src={link.link}
                width={200}
                height={200}
                alt={artist.name}
                className="border rounded-lg object-cover cursor-pointer"
                onClick={() => openModal(link.link)}
              />
            </div>
          ))}
        </div>
        <h2 className="font-bold text-2xl text-primary mb-4">Videos</h2>
        <div className="space-y-6">
          {artist.events.map((event, index) => (
            <div key={index}>
              <h3 className="font-semibold text-xl text-gray-700 mb-2">
                {event.name}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {event.links.map((link, linkIndex) => (
                  <div key={linkIndex} className="w-full h-64">
                    <ReactPlayer
                      url={`https://www.youtube.com/watch?v=${link}`}
                      className="react-player"
                      width="100%"
                      height="100%"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <h2 className="font-bold text-2xl text-gray-800 mt-8">About Me</h2>
        <div
          className="text-gray-600 tracking-wide mt-4 text-justify"
          dangerouslySetInnerHTML={{ __html: artist.blog }}
        ></div>
      </div>

      {/* Modal for Gallery Images */}
      <Modal isOpen={modalOpen} onClose={closeModal} title="Gallery Image">
        <div className="flex justify-center">
          <Image
            src={selectedImage}
            width={400}
            height={400}
            alt="Selected Image"
            className="border rounded-lg object-contain"
          />
        </div>
        <div className="flex justify-center mt-4">
          <Button onClick={closeModal}>Close</Button>
        </div>
      </Modal>
    </div>
  );
}

export default ArtistDetail;
