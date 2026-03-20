"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

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
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        // Already logged in — go straight to dashboard
        router.replace("/client/dashboard");
      } else {
        // Not logged in — go to login
        router.replace("/client/login");
      }
    };

    checkSession();
  }, [router]);

  return <Loader />;
}