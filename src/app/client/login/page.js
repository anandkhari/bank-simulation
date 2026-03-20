"use client";

import Image from "next/image";
import { Lock, ChevronLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabaseClient";
import { Eye, EyeOff } from "lucide-react";

export default function BankingLogin() {
  const router = useRouter();

  const [step, setStep] = useState("card");

  const [cardNumber, setCardNumber] = useState("");
  const [password, setPassword] = useState("");

  const [touched, setTouched] = useState(false);
  const [checked, setChecked] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [intro, setIntro] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIntro(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const isCardError = touched && step === "card" && cardNumber.trim() === "";
  const isPasswordError =
    touched && step === "password" && password.trim() === "";

  const handleNext = async () => {
    setTouched(true);

    if (step === "card" && cardNumber.trim() === "") return;
    if (step === "password" && password.trim() === "") return;

    if (step === "card") {
      setTouched(false);
      setStep("password");
      return;
    }

    try {
      setLoading(true);

      const cleanCard = cardNumber.replace(/\D/g, "");
      const loginEmail = `${cleanCard}@bank.local`;

      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password,
      });

      if (error) {
        toast.error("Invalid card number or password");
        setLoading(false);
        return;
      }

      // ── Check role — only allow "client" ──────────────────
      const { data: { user } } = await supabase.auth.getUser();

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError || !profile || profile.role !== "client") {
        await supabase.auth.signOut();
        toast.error("Access denied. This portal is for clients only.");
        setLoading(false);
        return;
      }

      toast.success("Login successful");
      router.push("/client/success");
    } catch {
      toast.error("Login failed");
    }

    setLoading(false);
  };

  return (
    <main className="relative min-h-screen bg-white w-full overflow-hidden">
      {/* HERO IMAGE */}
      <div
        className={`absolute inset-0 transition-transform duration-[1800ms] ease-[cubic-bezier(.77,0,.18,1)] hidden md:block ${
          intro ? "-translate-x-[25%]" : "translate-x-0"
        }`}
      >
        <Image
          src="/landing.jpg"
          alt="Bank Hero"
          fill
          priority
          className="object-cover"
        />

        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center z-10">
          <Image
            src="/rbc-logo.svg"
            alt="RBC Logo"
            width={48}
            height={48}
            className="mb-6"
          />
          <h1 className="text-xl tracking-wide mb-1">Secure Sign-In</h1>
          <p className="text-sm text-white/90">RBC Online Banking</p>
        </div>
      </div>

      {/* LOGIN PANEL */}
      <div
        className={`absolute inset-y-0 right-0 w-full md:w-1/2 delay-[900ms] bg-white shadow-[-30px_0_60px_rgba(0,0,0,0.15)]
        transition-transform duration-[1000ms] ease-out ${
          intro ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="overflow-hidden relative h-full">
          <div
            className={`flex w-[200%] transition-transform duration-800 ease-out ${
              step === "password" ? "-translate-x-1/2" : "translate-x-0"
            }`}
          >
            {/* ================= CARD PANEL ================= */}
            <div className="w-1/2 bg-[#f4f4f4] px-6 md:px-16 flex justify-center pt-20">
              <div className="w-full max-w-[420px] flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-base text-[#1f1f1f]">
                    Client Card or Username
                  </label>
                  <Lock className="w-[18px] h-[18px] text-[#6b6b6b]" />
                </div>

                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  onBlur={() => setTouched(true)}
                  className={`w-full h-[48px] px-[15px] border bg-white text-base outline-none ${
                    isCardError
                      ? "border-[#b91a0e]"
                      : cardNumber
                        ? "border-[#006ac3]"
                        : "border-[#6f6f6f]"
                  }`}
                />

                {isCardError && (
                  <div className="flex items-center gap-3 mt-3 text-[#b91a0e]">
                    <div className="w-5 h-5 bg-[#b91a0e] flex items-center justify-center text-white text-sm font-bold">
                      !
                    </div>
                    <p className="text-base">
                      Please enter your client card or username
                    </p>
                  </div>
                )}

                <label className="flex items-center mt-4 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => setChecked(!checked)}
                    className="sr-only"
                  />
                  <div className="w-[22px] h-[22px] border border-[#006ac3] flex items-center justify-center bg-white">
                    {checked && (
                      <svg
                        className="w-4 h-4 text-[#006ac3]"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                      >
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="ml-3 text-sm text-[#1f1f1f]">
                    Save client card or username
                  </span>
                  <span className="ml-3 w-5 h-5 border border-[#006ac3] text-[#006ac3] text-xs flex items-center justify-center rounded-full">
                    ?
                  </span>
                </label>

                <button
                  onClick={handleNext}
                  className="w-full mt-6 h-[48px] bg-[#1666AF] text-white"
                >
                  Next
                </button>

                <div className="mt-5 space-y-3 text-sm text-[#006ac3]">
                  <p>Recover Your Username</p>
                  <p>Enrol in Online Banking</p>
                </div>

                <div className="mt-8">
                  <h3 className="text-[18px] text-[#1f1f1f] mb-4">
                    Service Notices
                  </h3>
                  <div className="space-y-4 text-sm text-[#006ac3]">
                    <p>Important Information: Canada Post Service Disruption</p>
                  </div>
                </div>

                <Footer />
              </div>
            </div>

            {/* ================= PASSWORD PANEL ================= */}
            <div className="w-1/2 bg-[#f4f4f4] px-6 md:px-16 flex justify-center pt-20">
              <div className="w-full max-w-[420px] flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <button
                    onClick={() => setStep("card")}
                    className="text-[#006ac3] flex items-center justify-center w-8 h-8"
                  >
                    <ChevronLeft size={28} strokeWidth={1} />
                  </button>
                  <p className="text-base text-[#1f1f1f]">
                    Signing in with {cardNumber}
                  </p>
                </div>

                <div className="flex items-center justify-between mb-2">
                  <label className="text-base text-[#1f1f1f]">Password</label>
                  <Lock className="w-[18px] h-[18px] text-[#6b6b6b]" />
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => setTouched(true)}
                    autoComplete="current-password"
                    className={`w-full h-[48px] px-[15px] pr-[45px] border bg-white text-base outline-none [&::-ms-reveal]:hidden [&::-ms-clear]:hidden [&::-webkit-contacts-auto-fill-button]:hidden [&::-webkit-credentials-auto-fill-button]:hidden ${
                      isPasswordError
                        ? "border-[#b91a0e]"
                        : password
                          ? "border-[#006ac3]"
                          : "border-[#6f6f6f]"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                  </button>
                </div>

                {isPasswordError && (
                  <div className="flex items-center gap-3 mt-3 text-[#b91a0e]">
                    <div className="w-5 h-5 bg-[#b91a0e] flex items-center justify-center text-white text-sm font-bold">
                      !
                    </div>
                    <p className="text-base">Please enter your password</p>
                  </div>
                )}

                <button
                  onClick={handleNext}
                  disabled={loading}
                  className="w-full mt-6 h-[48px] bg-[#1666AF] text-white flex items-center justify-center gap-1 disabled:opacity-90"
                >
                  {loading ? "Loading..." : "Sign In"}
                </button>

                <div className="mt-5 space-y-3 text-sm text-[#006ac3]">
                  <p>Reset Your Password</p>
                  <p>Having Trouble Signing In?</p>
                </div>

                <Footer />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function Footer() {
  return (
    <div className="border-t border-[#d9d9d9] mt-8 pt-6">
      <div className="flex items-center gap-3 text-[#006ac3] text-sm cursor-pointer">
        <span>Other Online Services</span>
        <div className="w-4 h-[2px] bg-[#006ac3] relative">
          <div className="absolute top-[-4px] w-4 h-[2px] bg-[#006ac3]" />
        </div>
      </div>
      <div className="border-t border-[#e5e5e5] mt-6"></div>
      <div className="mt-6 text-[#1f1f1f] text-sm leading-6">
        <p>RBC Online Banking is provided by Royal Bank of Canada.</p>
        <p>Royal Bank of Canada Website, © 1995-2026</p>
      </div>
      <div className="flex flex-wrap gap-x-6 gap-y-3 mt-4 text-[#006ac3] text-sm">
        <span>Legal ↗</span>
        <span>Accessibility ↗</span>
        <span>Privacy & Security ↗</span>
        <span>Advertising & Cookies</span>
      </div>
    </div>
  );
}