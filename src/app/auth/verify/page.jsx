"use client";

import { useState, useEffect, useRef } from "react";
import { auth } from "@/app/lib/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

export default function VerifyPhone() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Use refs to persist objects across re-renders without triggering them
  const recaptchaRef = useRef(null);
  const confirmationResultRef = useRef(null);

  // Initialize reCAPTCHA once on mount
  useEffect(() => {
    if (!recaptchaRef.current) {
      recaptchaRef.current = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
        callback: (response) => {
          console.log("reCAPTCHA solved");
        },
      });
    }

    return () => {
      if (recaptchaRef.current) {
        recaptchaRef.current.clear();
        recaptchaRef.current = null;
      }
    };
  }, []);

  async function sendOTP() {
    if (!phone) return alert("Enter phone number");
    setLoading(true);

    try {
      // Latest Firebase docs recommend using the verifier instance directly
      const confirmation = await signInWithPhoneNumber(
        auth, 
        phone, 
        recaptchaRef.current
      );
      
      confirmationResultRef.current = confirmation;
      setSent(true);
      alert("OTP sent successfully!");
    } catch (err) {
      console.error("OTP ERROR:", err);
      handleAuthError(err);
      // Reset reCAPTCHA if it fails so the user can try again
      if (recaptchaRef.current) recaptchaRef.current.render();
    } finally {
      setLoading(false);
    }
  }

  async function verifyOTP() {
    if (!otp) return alert("Enter OTP");
    setLoading(true);

    try {
      await confirmationResultRef.current.confirm(otp);
      alert("Phone Verified ✅");
      // Redirect user or update UI here
    } catch (err) {
      console.error(err);
      alert("Invalid OTP. Please check the code and try again.");
    } finally {
      setLoading(false);
    }
  }

  // Improved Error Handler
  function handleAuthError(err) {
    const messages = {
      "auth/invalid-phone-number": "The phone number is not valid.",
      "auth/too-many-requests": "Too many attempts. Please wait 30 minutes.",
      "auth/quota-exceeded": "SMS quota reached for today.",
      "auth/invalid-app-credential": "Check if your domain is authorized in Firebase Console.",
    };
    alert(messages[err.code] || err.message);
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-r from-[#001F3F] to-[#0B5EA6]">
      <div className="w-full max-w-[480px] bg-white p-8 shadow-md rounded-lg">
        <h2 className="text-xl font-medium text-[#1f1f1f]">Verify Your Number</h2>
        <p className="text-sm text-gray-600 mt-2">Enter your number to receive a 6-digit code.</p>

        <div className="mt-6">
          <PhoneInput
            defaultCountry="CA"
            value={phone}
            onChange={setPhone}
            className="border px-3 py-2 rounded"
          />
        </div>

        {!sent ? (
          <button
            onClick={sendOTP}
            disabled={loading}
            className="w-full mt-6 h-[48px] bg-[#1666AF] text-white font-bold rounded hover:bg-[#0e4d8a] disabled:bg-gray-400"
          >
            {loading ? "Processing..." : "Send OTP"}
          </button>
        ) : (
          <div className="mt-6 space-y-4">
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="6-digit code"
              className="w-full h-[48px] border px-4 rounded"
            />
            <button
              onClick={verifyOTP}
              disabled={loading}
              className="w-full h-[48px] bg-[#28a745] text-white font-bold rounded hover:bg-[#218838]"
            >
              {loading ? "Verifying..." : "Confirm Code"}
            </button>
            <button 
              onClick={() => setSent(false)} 
              className="text-sm text-blue-600 underline w-full text-center"
            >
              Change Phone Number
            </button>
          </div>
        )}

        {/* Required for Firebase - Keep this empty and visible in the DOM */}
        <div id="recaptcha-container" className="mt-4"></div>
      </div>
    </main>
  );
}