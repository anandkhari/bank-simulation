"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function SuccessPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/client/dashboard");
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-start overflow-hidden">
      {/* BACKGROUND IMAGE */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/login-rb.png"
          alt="Background"
          fill
          priority
          className="object-cover blur-md opacity-40"
        />
      </div>

      {/* HEADER */}
      <div className="pt-16 text-center text-white flex flex-col items-center">
        {/* RBC LOGO */}
        <Image
          src="/rbc-logo.svg"
          alt="RBC Logo"
          width={40}
          height={40}
          className="mb-4"
        />

        {/* TITLE */}
        <h1 className="text-2xl font-normal">Secure Sign-in</h1>
      </div>

      {/* SUCCESS CARD */}
      <div className="mt-12 bg-[#f4f4f4] w-[90%] max-w-[500px] h-[480px] flex flex-col items-center justify-center relative shadow-lg">
        {/* green top border */}
        <div className="absolute top-0 left-0 right-0 h-[5px] bg-green-600"></div>

        {/* check icon */}
        <div className="w-16 h-16 border-4 border-green-600 rounded-full flex items-center justify-center mb-6">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#1c7c36"
            strokeWidth="3"
          >
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* text */}
        <h2 className="text-3xl text-[#1f1f1f]">Success!</h2>
      </div>
    </main>
  );
}
