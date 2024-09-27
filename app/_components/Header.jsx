"use client";
import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlignJustify, LogOut, Pencil } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import useAuth from "@/lib/hook";
import axios from "axios";
import Image from "next/image";
import Modal from "./Modal";

const Header = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [shortName, setShortName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [artist, setArtist] = useState({});
  const [linkId, setLinkId] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(useAuth());
  const router = useRouter();

  useEffect(() => {
    const storedNumber = localStorage?.getItem("mobile");
    console.log("Stored Number:", storedNumber);

    if (storedNumber !== undefined) {
      setMobileNumber(JSON?.parse(storedNumber));
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (mobileNumber) {
      getArtist();
    }
  }, [mobileNumber]);

  const getArtist = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API}/artist/contact/+${mobileNumber}`
      );

      if (response.data) {
        setArtist(response.data);
        const name = response.data.name;

        // Get initials (e.g., KP for Krishna Pandey)
        const initials = name
          .split(" ") // Split the name into an array of words
          .map((word) => word[0]) // Take the first letter of each word
          .join("") // Join the letters to form initials
          .toUpperCase(); // Ensure it's in uppercase

        setShortName(initials); // Set the short name as initials
        setProfilePic(response.data.profilePic);
        setLinkId(response.data.linkid);
      }
    } catch (error) {
      console.error("Error fetching artist:", error);
    }
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setInterval(() => {
      const mobile = localStorage.getItem("mobile");
      const authExpiry = localStorage.getItem("authExpiry");
      if (mobile && authExpiry && Date.now() < parseInt(authExpiry, 10)) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    }, []);
  }, 2000);

  const handleSignOut = useCallback(() => {
    localStorage.removeItem("mobile");
    localStorage.removeItem("authExpiry");
    window.dispatchEvent(new Event("storage")); // Trigger storage event manually
    window.location.reload(); // Force a page refresh
  }, [router]);

  return (
    <>
      <div className="flex items-center justify-between p-4 shadow-sm bg-white">
        <div className="flex items-center gap-0">
          <h3 className="mt-4 font-bold text-gray-600">Artist.</h3>
          <Link href="/">
            <h1 className="font-bold text-4xl text-primary">Gigsar</h1>
          </Link>
          <h3 className="mt-4 font-bold text-gray-600">.com</h3>
        </div>
        {isMounted && (
          <div className="flex items-center gap-8 md:justify-end">
            <div className="flex items-center gap-4">
              {isAuthenticated && (
                <>
                  <Avatar
                    onClick={() => {
                      setShowProfile(true);
                    }}
                  >
                    <AvatarImage src={profilePic} />
                    <AvatarFallback>{shortName}</AvatarFallback>
                  </Avatar>
                </>
              )}
            </div>
          </div>
        )}
      </div>
      <Modal
        isOpen={showProfile}
        onClose={() => {
          setShowProfile(false);
        }}
        title="Artist Details"
      >
        <div className="flex flex-col items-center space-y-6 p-6 relative">
          {/* Profile Picture */}
          <div className="relative">
            <Avatar className="w-24 h-24 border-2 border-gray-300 shadow-lg">
              <AvatarImage src={profilePic} className="rounded-full" />
              <AvatarFallback className="bg-gray-200 text-xl font-bold">
                {shortName}
              </AvatarFallback>
            </Avatar>

            {/* Pencil Icon */}
            <button
              onClick={() => {
                setShowProfile(false);
                router.push(`/${linkId}/basic-details`);
              }}
              className="absolute bottom-0 right-0 bg-white border border-gray-300 rounded-full p-1 hover:bg-gray-100 shadow"
            >
              <Pencil className="w-4 h-4 text-gray-700" />
            </button>
          </div>

          {/* Artist Details */}
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-semibold text-gray-800">
              {artist?.name}
            </h3>
            <p className="text-sm text-gray-500">
              <span className="font-semibold">Type</span>:{" "}
              {artist?.artistType
                ?.split("-")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")}
            </p>
            <p className="text-sm text-gray-500">
              {" "}
              <span className="font-semibold">Mobile</span>: {artist?.contact}
            </p>
            <p className="text-sm text-gray-500">
              {" "}
              <span className="font-semibold">Email</span>: {artist?.email}
            </p>
          </div>

          {/* Sign Out Button */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" className="bg-primary text-white">
                <LogOut className="w-6 h-6" /> Sign Out
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <div className="p-4">
                <p>Are you sure you want to sign out?</p>
                <Button onClick={handleSignOut} className="mt-2">
                  Sign Out
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </Modal>
    </>
  );
};

export default Header;
