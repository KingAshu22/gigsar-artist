"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, MessagesSquare, Calendar } from "lucide-react";
import Header from "./Header";
import { useEffect, useState } from "react";
import axios from "axios";
import useAuth from "@/lib/hook";

export default function BottomNav() {
  const pathname = usePathname();
  const [mobileNumber, setMobileNumber] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(useAuth());
  const [linkId, setLinkId] = useState("");

  // Fetch the mobile number from localStorage
  useEffect(() => {
    const storedNumber = localStorage.getItem("mobile");
    if (storedNumber) {
      const parsedNumber = JSON.parse(storedNumber);
      setMobileNumber(parsedNumber);
    } else {
      console.warn("Mobile number not found in localStorage");
    }
  }, [isAuthenticated]);

  // Fetch artist details when mobile number is available
  useEffect(() => {
    if (mobileNumber) {
      getArtist();
    }
  }, [mobileNumber]);

  // Fetch artist data from the backend using the mobile number
  const getArtist = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API}/artist/contact/+${mobileNumber}`
      );

      if (response.data && response.data.linkid) {
        setLinkId(response.data.linkid);
      } else {
        console.warn("Link ID not found in response");
      }
    } catch (error) {
      console.error("Error fetching artist:", error);
    }
  };

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

  const navItems = [
    { path: "/", icon: <LayoutDashboard />, label: "Dashboard" },
    { path: "/chat", icon: <MessagesSquare />, label: "Chat" },
    {
      path: `/${linkId}/calendar`,
      icon: <Calendar />,
      label: "Calendar",
    },
  ];

  // Render only the Header if not authenticated (i.e., no mobile number)
  if (!mobileNumber) {
    return <Header />;
  }

  return (
    <>
      {isAuthenticated && (
        <div className="bg-[#3E3636] fixed bottom-0 left-0 right-0 overflow-x-hidden">
          <nav className="container mx-auto px-4 py-2">
            <div className="flex justify-between items-center">
              {navItems.map(({ path, icon, label }) => (
                <Link
                  href={path}
                  key={path}
                  className={`flex flex-col items-center justify-center text-white transition-all duration-200 ${
                    pathname.startsWith(path)
                      ? "bg-red-500 rounded-lg p-1"
                      : "p-2"
                  }`}
                >
                  <div
                    className={`p-2 rounded-full transition-transform duration-200 ${
                      pathname.startsWith(path) ? "scale-110" : ""
                    }`}
                  >
                    {icon}
                  </div>
                  <span className="text-xs md:text-sm">{label}</span>
                </Link>
              ))}
            </div>
          </nav>
        </div>
      )}
      <Header />
    </>
  );
}
