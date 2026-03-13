"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export default function SignedOutPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">

      {/* TOP NAVIGATION */}
      <div className="bg-[#003A8F] text-white text-sm">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between px-6 py-2">

          <div className="flex gap-8">
            <p className="cursor-pointer hover:underline">Personal</p>
            <p className="cursor-pointer hover:underline">Business</p>
            <p className="cursor-pointer hover:underline">Commercial</p>
            <p className="cursor-pointer hover:underline">Wealth</p>
            <p className="cursor-pointer hover:underline">Institutional ▾</p>
            <p className="cursor-pointer hover:underline">About RBC</p>
          </div>

          <p className="cursor-pointer hover:underline">
            Deals at RBC
          </p>

        </div>
      </div>

      {/* MAIN HEADER */}
      <div className="bg-brand text-white">

        <div className="max-w-[1200px] mx-auto flex items-center justify-between px-6 py-4">

          {/* LOGO */}
          <div className="flex items-center gap-3">

            <img
              src="/rbc-logo.svg"
              alt="RBC"
              className="w-12"
            />

          </div>

          {/* SEARCH */}
          <div className="flex items-center gap-3 w-[380px] border-b border-white pb-1">

            <Search size={18} />

            <input
              placeholder="Search RBC..."
              className="bg-transparent outline-none placeholder-white w-full text-sm"
            />

          </div>

          {/* RIGHT ACTIONS */}
          <div className="flex items-center gap-6 text-sm">

            <p className="cursor-pointer hover:underline">
              Contact Us
            </p>

            <p className="cursor-pointer">
              EN ▾
            </p>

            <button
              onClick={() => router.push("/client/login")}
              className="bg-yellow-400 text-black px-6 py-2 font-medium hover:bg-yellow-300"
            >
              Sign In
            </button>

          </div>

        </div>

      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-[1200px] mx-auto px-6 py-12">

        {/* PAGE TITLE */}
        <h1 className="text-[42px] text-brand mb-10 font-light">
          You've Signed Out of Online Banking
        </h1>


        {/* WEBINAR / EVENTS PANEL */}
        <div className="bg-gray-100 p-10 grid grid-cols-2 gap-10 items-center mb-12">

          {/* LEFT SIDE */}
          <div>

            <p className="text-gray-500 text-sm mb-3">
              Live Webinar
            </p>

            <h2 className="text-2xl mb-3 text-gray-600 font-medium">
              Planning for your retirement
            </h2>

            <p className="text-gray-600 mb-5">
              February 25 at 06:30 PM EST
            </p>

            <button className="text-brand font-normal tracking-wide hover:underline">
              › Register Online
            </button>

          </div>


          {/* RIGHT SIDE */}
          <div className="border-l pl-10">

            <h2 className="text-2xl mb-5  text-gray-600  font-medium">
              Search for More Local Events
            </h2>

            <button className="border border-brand text-brand px-6 py-2 bg-white">
              See More Events
            </button>

          </div>

        </div>


        {/* PROMOTIONAL GRID */}
        <div className="grid grid-cols-3 gap-8">

          {/* IMAGE PROMO */}
          <div className="bg-white">

            <img
              src="/sign-out2.avif"
              alt="Promo"
              className="w-full"
            />

          </div>


          {/* MORTGAGE PROMO */}
          <div className="bg-white p-6 border">

            <h3 className="text-xl text-brand mb-4 font-medium">
              Get up to $5,700 in value with an eligible RBC mortgage*
            </h3>

            <p className="text-gray-600 text-sm mb-6">
              That’s up to $3,500 cash, 55,000 Avion points,
              plus rebates if switching. Offer ends February 28, 2026.
            </p>

            <button className="bg-brand text-white px-6 py-2">
              Find Out How
            </button>

          </div>


          {/* AVION REWARDS */}
          <div className="bg-gray-100 p-6 border">

            <h3 className="text-xl text-brand mb-4 font-medium">
              Save More with Avion Rewards
            </h3>

            <p className="text-gray-600 text-sm">
              As an RBC client, you get Avion Premium-level benefits,
              like cash back, points and special offers.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}