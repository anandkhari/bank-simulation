"use client";

import Image from "next/image";
import { Lock } from "lucide-react";
import { useState } from "react";

export default function BankingLogin() {
  const [value, setValue] = useState("");
  const [touched, setTouched] = useState(false);
  const [checked, setChecked] = useState(true);

  const isError = touched && value.trim() === "";

  return (
    <main className="grid md:grid-cols-2 min-h-screen bg-[#ffffff] w-full">
      {/* LEFT HERO */}
      <div className="relative hidden md:block">
        <Image
          src="/login-rb.png"
          alt="Bank Hero"
          fill
          priority
          className="object-cover"
        />
      </div>

      {/* RIGHT PANEL */}
      <div className="bg-[#f4f4f4] px-6 md:px-16 flex justify-center pt-20">
        <div className="w-full max-w-[420px] flex flex-col">

          {/* LABEL ROW */}
          <div className="flex items-center justify-between mb-2">
            <label className="text-base font-normal text-[#1f1f1f]">
              Client Card or Username
            </label>
            <Lock className="w-[18px] h-[18px] text-[#6b6b6b]" />
          </div>

          {/* INPUT */}
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={() => setTouched(true)}
            className={`
              w-full h-[48px] px-[15px]
              border rounded-none bg-white
              text-[#1f1f1f] text-base font-light
              outline-none transition-colors
              ${
                isError
                  ? "border-[#b91a0e]"
                  : value.length > 0
                  ? "border-[#006ac3]"
                  : "border-[#6f6f6f]"
              }
            `}
          />

          {/* ERROR */}
          {isError && (
            <div className="flex items-center gap-3 mt-3 text-[#b91a0e]">
              <div className="w-5 h-5 bg-[#b91a0e] flex items-center justify-center text-white text-sm font-bold">
                !
              </div>
              <p className="text-base">
                Please enter your client card or username
              </p>
            </div>
          )}

          {/* CHECKBOX */}
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

          {/* BUTTON */}
          <button
            onClick={() => setTouched(true)}
            className="w-full mt-6 h-[48px] bg-[#1666AF] text-white font-normal rounded-none"
          >
            Next
          </button>

          {/* LINKS */}
          <div className="mt-5 space-y-3 text-sm text-[#006ac3]">
            <p className="cursor-pointer">Recover Your Username</p>
            <p className="cursor-pointer">Enrol in Online Banking</p>
          </div>

          {/* SERVICE NOTICES */}
          <div className="mt-8">
            <h3 className="text-[18px] font-normal text-[#1f1f1f] mb-4">
              Service Notices
            </h3>

            <div className="space-y-4 text-sm text-[#006ac3]">
              <p>Important Information: Canada Post Service Disruption</p>
            </div>
          </div>

          {/* FOOTER */}
          <div className="border-t border-[#d9d9d9] mt-8 pt-6">

            {/* Other Services */}
            <div className="flex items-center gap-3 text-[#006ac3] text-sm cursor-pointer">
              <span>Other Online Services</span>
              <div className="w-4 h-[2px] bg-[#006ac3] relative">
                <div className="absolute top-[-4px] w-4 h-[2px] bg-[#006ac3]" />
              </div>
            </div>

            {/* Thin divider */}
            <div className="border-t border-[#e5e5e5] mt-6"></div>

            {/* Footer text */}
            <div className="mt-6 text-[#1f1f1f] text-sm leading-6">
              <p>RBC Online Banking is provided by Royal Bank of Canada.</p>
              <p>Royal Bank of Canada Website, © 1995-2026</p>
            </div>

            {/* Footer links */}
            <div className="flex flex-wrap gap-x-6 gap-y-3 mt-4 text-[#006ac3] text-sm">
              <span className="flex items-center gap-1 cursor-pointer">
                Legal <span>↗</span>
              </span>
              <span className="flex items-center gap-1 cursor-pointer">
                Accessibility <span>↗</span>
              </span>
              <span className="flex items-center gap-1 cursor-pointer">
                Privacy & Security <span>↗</span>
              </span>
              <span className="cursor-pointer">
                Advertising & Cookies
              </span>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}