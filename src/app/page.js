"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";


function Loader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="w-12 h-12 border-4 border-[#1666AF] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

export default function Page() {

  const router = useRouter();

  useEffect(() => {
    router.replace("/client/login");
  }, [router]);

  return (
    <div>
      <Loader />
    </div>
  );
}