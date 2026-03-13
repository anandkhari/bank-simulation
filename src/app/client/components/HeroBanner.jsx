"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { FileText, Mail, Gift, Rocket, Printer } from "lucide-react";


export default function HeroBanner() {

  const [greeting, setGreeting] = useState("");

  useEffect(() => {

    const hour = new Date().getHours();

    if (hour < 12) {
      setGreeting("Good Morning");
    } else if (hour < 18) {
      setGreeting("Good Afternoon");
    } else {
      setGreeting("Good Evening");
    }

  }, []);

  return (

    <div className="relative w-full h-[230px] text-white">

  {/* Background Image */}
  <Image
    src="/background-crop.jpg"
    alt="Hero Banner"
    fill
    priority
    className="object-cover"
  />

  {/* Dark Overlay */}
  <div className="absolute inset-0 bg-black/40"></div>

  {/* Content */}
 <div className="absolute inset-0 flex items-end pb-5">

    <div className="max-w-[1200px] mx-auto w-full px-6 flex justify-between">

      {/* LEFT TEXT */}
      <div>

        <h1 className="text-[34px] font-light mb-1">
          Accounts Summary
        </h1>

        <p className="text-lg text-white/60">
          {greeting}
        </p>

      </div>

      {/* QUICK ACTIONS */}
      <div className="flex items-center gap-5 text-sm">

        {/* Statements */}
        <div className="flex flex-col items-center cursor-pointer hover:text-white/80 transition">

          <FileText size={26} className="text-white/60 mb-2" />

          <p className="text-center leading-tight text-white/60">
            Statements / <br />
            Documents
          </p>

        </div>


        {/* Messages */}
        <div className="flex flex-col items-center cursor-pointer hover:text-white/80 transition">

          <Mail size={26} className="text-white/60 mb-2" />

          <p className="text-center leading-tight text-white/60">
            Messages / <br />
            Alerts
          </p>

        </div>


        {/* Offers */}
        <div className="flex flex-col items-center cursor-pointer hover:text-white/80 transition">

          <Gift size={26} className="text-white/60 mb-2" />

          <p className="text-center leading-tight text-white/60">
            Offers <br />
            For You
          </p>

        </div>


        {/* Beyond Banking */}
        <div className="flex flex-col items-center cursor-pointer hover:text-white/80 transition">

          <Rocket size={26} className="text-white/60 mb-2" />

          <p className="text-center leading-tight text-white/60">
            Beyond <br />
            Banking
          </p>

        </div>


        {/* Print */}
        <div className="flex flex-col items-center cursor-pointer hover:text-white/80 transition">

          <Printer size={26} className="text-white/60 mb-2" />

          <p className="text-white/60">
            Print
          </p>

        </div>

      </div>

    </div>

  </div>

</div>
  );

}