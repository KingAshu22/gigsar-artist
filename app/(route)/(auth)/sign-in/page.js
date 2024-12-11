"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import * as animationData from "../../../../public/verified.json";
import LottieImg from "@/app/_components/Lottie";
import toast from "react-hot-toast";
import Link from "next/link";

export default function SignIn() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpSection, setShowOtpSection] = useState(false);
  const [OTPlessSignin, setOTPlessSignin] = useState(null);
  const [returnUrl, setReturnUrl] = useState("");
  const [error, setError] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [countryFlag, setCountryFlag] = useState("");
  const [timer, setTimer] = useState(0);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [showVerifiedGif, setShowVerifiedGif] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const rawReturnUrl = searchParams.get("redirect_url") || "/";
    if (typeof window !== "undefined") {
      const returnUrlPath = new URL(rawReturnUrl, window.location.origin)
        .pathname;
      setReturnUrl(returnUrlPath);
    }
  }, [searchParams]);

  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then((response) => response.json())
      .then((data) => {
        const countryCode = data.country_calling_code;
        const countryFlag = `https://flagicons.lipis.dev/flags/4x3/${data.country.toLowerCase()}.svg`;
        setCountryCode(countryCode);
        setCountryFlag(countryFlag);
      })
      .catch((error) => console.error("Error fetching IP data:", error));

    const script = document.createElement("script");
    script.src = "https://otpless.com/v2/headless.js";
    script.id = "otpless-sdk";
    script.setAttribute("data-appid", "P2E0047ZZJ3U12JSZ4TV");
    script.onload = () => {
      if (typeof window.OTPless !== "undefined") {
        const callback = (userinfo) => {
          console.log("OTPless callback userinfo:", userinfo);
          const authExpiry = Date.now() + 7 * 24 * 60 * 60 * 1000;
          const mobile = userinfo.identities[0].identityValue;
          const city = userinfo.network.ipLocation.city.name;
          localStorage.setItem("authExpiry", authExpiry.toString());
          localStorage.setItem("mobile", mobile.toString());
          localStorage.setItem("city", city.toString());
          localStorage.setItem("hasRefreshed", "false");
          router.push(returnUrl);
        };

        const instance = new window.OTPless(callback);
        setOTPlessSignin(instance);
      }
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [router, returnUrl]);

  const startTimer = () => {
    setIsButtonDisabled(true);
    setTimer(120);
    const countdown = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer === 1) {
          clearInterval(countdown);
          setIsButtonDisabled(false);
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);
  };

  const handlePhoneAuth = () => {
    if (!phone) {
      toast.error("Please fill your phone number");
      return;
    }

    // Check if the phone number is exactly 10 digits
    if (phone.length !== 10 || !/^[0-9]+$/.test(phone)) {
      toast.error("Please enter a valid 10-digit phone number.");
      return;
    }
    // Check for country code +91 and ensure the phone number is exactly 10 digits
    if (countryCode === "+91") {
      if (phone.length !== 10) {
        toast.error("Please enter a valid 10-digit phone number.");
        return;
      }
    }
    if (OTPlessSignin) {
      OTPlessSignin.initiate({
        channel: "PHONE",
        phone,
        countryCode,
      });
      setShowOtpSection(true);
      startTimer();
    }
  };

  const handleVerifyOTP = () => {
    if (OTPlessSignin) {
      OTPlessSignin.verify({
        channel: "PHONE",
        phone,
        otp,
        countryCode,
      })
        .then((response) => {
          console.log("Verification Response:", response);
          if (response.success && response.response.requestID) {
            setShowVerifiedGif(true);
            setTimeout(() => {
              router.push(returnUrl);
            }, 2000);
          } else {
            setError(
              "OTP is incorrect. Please try again or Session storage issue"
            );
          }
        })
        .catch((error) => {
          console.error("Error verifying OTP:", error);
          setError("OTP is incorrect. Please try again.");
        });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {showVerifiedGif ? (
        <div className="flex items-center justify-center">
          <LottieImg animationData={animationData} loop={false} />
        </div>
      ) : (
        <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-3xl font-bold mb-6 text-center text-primary">
            Artist Sign In
          </h2>
          <p className="text-center text-gray-500 mb-8">
            Sign in to access your dashboard
          </p>
          <div className="space-y-6">
            <div id="mobile-section">
              <label
                htmlFor="mobile-input"
                className="block text-sm font-medium text-gray-700"
              >
                Mobile Number
              </label>
              <div className="flex items-center space-x-2 w-full">
                {countryFlag && (
                  <Image
                    src={countryFlag}
                    alt="Country Flag"
                    width={25}
                    height={25}
                  />
                )}
                <span className="text-lg">{countryCode}</span>
                <input
                  type="number"
                  id="mobile-input"
                  placeholder="Enter mobile number"
                  className="flex-1 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <p className="text-sm mt-2">
                By Signing In, you agree to accept the{" "}
                <Link
                  href="/terms-and-conditions"
                  target="_blank"
                  className="text-primary"
                >
                  Terms & Conditions
                </Link>
              </p>
              <button
                onClick={handlePhoneAuth}
                className={
                  isButtonDisabled
                    ? "w-full mt-4 px-4 py-2 bg-primary opacity-75 text-white rounded-lg hover:bg-red-800 transition duration-200"
                    : "w-full mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-red-800 transition duration-200"
                }
                disabled={isButtonDisabled}
              >
                {isButtonDisabled ? `Resend OTP in ${timer}s` : "Send OTP"}
              </button>
            </div>

            {showOtpSection && (
              <div id="otp-section">
                <label
                  htmlFor="otp-input"
                  className="block text-sm font-medium text-gray-700"
                >
                  OTP
                </label>
                <input
                  type="text"
                  id="otp-input"
                  placeholder="Enter OTP"
                  maxLength={6}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
                <button
                  onClick={handleVerifyOTP}
                  className="w-full mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-200"
                >
                  Verify OTP
                </button>
              </div>
            )}

            {error && (
              <div className="mt-4 text-red-500 text-center">{error}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
