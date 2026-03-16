"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { User ,Lock ,ChevronDown} from "lucide-react";


export default function ClientHeader() {
  const router = useRouter();

  const [userName, setUserName] = useState("");
  const [date, setDate] = useState("");

  async function handleLogout() {

  await supabase.auth.signOut();

  router.push("/client/signed-out");

}

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getSession();

      if (!data?.session) return;

      const userId = data.session.user.id;

      const { data: profile } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", userId)
        .single();

      if (profile) {
        setUserName(profile.name);
      }
    };

    loadUser();

    const today = new Date();

    const formatted = today.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    setDate(formatted);
  }, []);

 

  return (
    <div className="w-full bg-white">
      {/* TOP HEADER */}
      <div className=" border-b  max-w-6xl mx-auto">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between py-4 px-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Image src="/rbc-logo.svg" alt="RBC" width={35} height={35} />

            <span className="text-[var(--client-brand)] mb-4 font-medium text-sm">
              Royal Bank
            </span>
          </div>

          {/* User Section */}
          <div className="flex items-center gap-10">
            <div className="text-[var(--client-brand)] text-sm flex items-center font-medium uppercase gap-2 cursor-pointer">
              <User size={18} />

              {userName || "User"}

              <ChevronDown size={16} />
            </div>
            <button
              onClick={handleLogout}
             className="bg-yellow-400 hover:bg-yellow-500 text-black text-xs px-4 py-2 flex items-center gap-2 cursor-pointer transition-colors duration-200">
              <Lock size={16} />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* MAIN NAVIGATION */}
      <div className="bg-[var(--client-brand)] text-white ">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4">
          <div className="flex gap-8 py-3 text-sm">
            <button className="hover:underline">Products & Services</button>

            <button className=" border-b-2 border-yellow-400 pb-1">
              My Accounts
            </button>

            <button className="hover:underline">Help Centre</button>
          </div>

          <div className="text-sm opacity-90">{date}</div>
        </div>
      </div>

  {/* SECONDARY NAVIGATION */}
<div className="bg-gray-100 border-b">
  <div className="max-w-6xl mx-auto flex gap-8 px-4 text-sm">

    <button
      onClick={() => router.push("/client/dashboard")}
      className="py-3 border-b-2 border-[var(--client-brand)] font-medium text-[var(--client-brand)]"
    >
      Accounts Summary
    </button>

    <button className="py-3 text-gray-600 hover:text-[var(--client-brand)]">
      Profile & Account Settings
    </button>

  </div>
</div>
    </div>
  );
}
