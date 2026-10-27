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
  const [returnUrl, setReturnUrl] = useState("/");
  const [error, setError] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [countryFlag, setCountryFlag] = useState("");
  const [timer, setTimer] = useState(0);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [showVerifiedGif, setShowVerifiedGif] = useState(false);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const rawReturnUrl = searchParams.get("redirect_url") || "/";
    if (typeof window !== "undefined") {
      const returnUrlPath = new URL(rawReturnUrl, window.location.origin).pathname;
      setReturnUrl(returnUrlPath);
    }
  }, [searchParams]);

  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then((response) => response.json())
      .then((data) => {
        if (!data.country_calling_code || !data.country) return;
        setCountryCode(data.country_calling_code);
        setCountryFlag(`https://flagicons.lipis.dev/flags/4x3/${data.country.toLowerCase()}.svg`);
      })
      .catch((error) => console.error("Error fetching IP data:", error));
  }, []);

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

  const handlePhoneAuth = async () => {
    setError("");
    if (!phone) {
      toast.error("Please fill your phone number");
      return;
    }

    if (phone.length !== 10 || !/^[0-9]{10}$/.test(phone)) {
      toast.error("Please enter a valid 10-digit phone number.");
      return;
    }

    setSending(true);
    try {
      const response = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: `${countryCode}${phone}` }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Failed to send OTP");
      }
      toast.success("OTP sent on WhatsApp. Copy it from WhatsApp and paste it here.");
      setOtp("");
      setShowOtpSection(true);
      startTimer();
    } catch (err) {
      toast.error(err.message || "Something went wrong while sending OTP");
    } finally {
      setSending(false);
    }
  };

  const handlePasteOtp = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const code = text.replace(/D/g, "").slice(0, 6);
      if (code) setOtp(code);
      else toast.error("No OTP found in clipboard");
    } catch {
      toast.error("Could not read clipboard. Please paste the OTP manually.");
    }
  };

  const handleVerifyOTP = async () => {
    setError("");
    if (!/^[0-9]{6}$/.test(otp)) {
      setError("Please enter the 6-digit OTP.");
      return;
    }

    setVerifying(true);
    try {
      const response = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: `${countryCode}${phone}`, otp }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        setError(data.message || "OTP is incorrect. Please try again.");
        return;
      }

      setShowVerifiedGif(true);
      localStorage.setItem("authExpiry", (Date.now() + 7 * 24 * 60 * 60 * 1000).toString());
      localStorage.setItem("mobile", data.mobile);
      localStorage.setItem("city", "");
      localStorage.setItem("hasRefreshed", "false");

      setTimeout(() => {
        router.push(returnUrl);
      }, 2000);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center p-4">
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
              <label htmlFor="mobile-input" className="block text-sm font-medium text-gray-700 mb-3">
                Mobile Number
              </label>
              <div className="mt-2 flex items-center space-x-2 w-full">
                {countryFlag && (
                  <Image src={countryFlag} alt="Country Flag" width={25} height={25} />
                )}
                <span className="text-lg">{countryCode}</span>
                <input
                  type="number"
                  id="mobile-input"
                  placeholder="Enter mobile number"
                  maxLength={10}
                  className="flex-1 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={phone}
                  onChange={(e) => {
                    const input = e.target.value.replace(/[^0-9]/g, "");
                    if (input.length <= 10) setPhone(input);
                  }}
                />
              </div>
              <p className="text-sm mt-2">
                By Signing In, you agree to accept the{" "}
                <Link href="/terms-and-conditions" target="_blank" className="text-primary">
                  Terms & Conditions
                </Link>
              </p>
              <button
                onClick={handlePhoneAuth}
                className={`w-full mt-4 px-4 py-2 rounded-lg text-white transition duration-200 ${
                  isButtonDisabled || sending
                    ? "bg-primary opacity-75"
                    : "bg-primary hover:bg-red-800"
                }`}
                disabled={isButtonDisabled || sending}
              >
                {sending
                  ? "Sending..."
                  : isButtonDisabled
                  ? `Resend WhatsApp OTP in ${timer}s`
                  : "Send WhatsApp OTP"}
              </button>
            </div>

            {showOtpSection && (
              <div id="otp-section">
                <label htmlFor="otp-input" className="block text-sm font-medium text-gray-700">
                  OTP
                </label>
                <p className="text-sm text-gray-500 mb-2">
                  We sent a 6-digit code to your WhatsApp. Tap &quot;Copy code&quot; there and paste it below.
                </p>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    id="otp-input"
                    placeholder="Enter OTP"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    className="flex-1 w-full px-4 py-2 border rounded-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/D/g, "").slice(0, 6))}
                    onKeyDown={(e) => e.key === "Enter" && handleVerifyOTP()}
                  />
                  <button
                    type="button"
                    onClick={handlePasteOtp}
                    className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100 transition duration-200"
                  >
                    Paste
                  </button>
                </div>
                <button
                  onClick={handleVerifyOTP}
                  disabled={verifying}
                  className={`w-full mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-200 ${verifying ? "opacity-75" : ""}`}
                >
                  {verifying ? "Verifying..." : "Verify OTP"}
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
