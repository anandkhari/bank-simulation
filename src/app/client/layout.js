"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function ClientLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  const isPublicPage = pathname === "/client/login" || pathname === "/client/signed-out";

  useEffect(() => {
    // Skip auth check for public pages
    if (isPublicPage) {
      setChecking(false);
      return;
    }

    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/client/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (!profile || profile.role !== "client") {
        await supabase.auth.signOut();
        router.replace("/client/login");
        return;
      }

      setChecking(false);
    };

    checkAuth();
  }, [router, isPublicPage]);

  if (checking) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#005DAA] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}