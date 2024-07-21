"use client";
import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlignJustify, LogOut } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import useAuth from "@/lib/hook";

const Header = () => {
  const [isMounted, setIsMounted] = useState(false);
  const isAuthenticated = useAuth();
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSignOut = useCallback(() => {
    sessionStorage.removeItem("mobile");
    sessionStorage.removeItem("authExpiry");
    window.dispatchEvent(new Event("storage")); // Trigger storage event manually
    window.location.reload(); // Force a page refresh
  }, [router]);

  const Menu = [
    { id: 1, name: "Home", path: "/" },
    { id: 2, name: "Artist Search", path: "/artist" },
    { id: 3, name: "Artist Login", path: "/" },
    { id: 4, name: "User Login", path: "/user-dashboard" },
  ];

  return (
    <div className="flex items-center justify-between p-4 shadow-sm bg-white">
      <div className="flex items-center gap-10">
        <Link href="/">
          <h1 className="font-bold text-4xl text-primary">Gigsar</h1>
        </Link>
        <ul className="hidden md:flex gap-8">
          {Menu.map((item, index) => (
            <Link href={item.path} key={index}>
              <li className="hover:text-primary cursor-pointer hover:scale-105 transition-all ease-in-out">
                {item.name}
              </li>
            </Link>
          ))}
        </ul>
      </div>
      {isMounted && (
        <div className="flex items-center gap-8 md:justify-end">
          <Popover className="md:hidden">
            <PopoverTrigger asChild>
              <Button variant="ghost" className="p-0 md:hidden">
                <AlignJustify className="w-6 h-6" />
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <ul className="flex flex-col gap-4 p-2">
                {Menu.map((item, index) => (
                  <Link href={item.path} key={index}>
                    <li className="hover:text-primary cursor-pointer hover:scale-105 transition-all ease-in-out">
                      {item.name}
                    </li>
                  </Link>
                ))}
              </ul>
            </PopoverContent>
          </Popover>
          <div>
            {isAuthenticated && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" className="p-0">
                    <LogOut className="w-6 h-6" />
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
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;
