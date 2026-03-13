"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AdminLayout({ children }) {

  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {

    const checkAuth = async () => {

      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push("/admin-login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (!profile || profile.role !== "admin") {
        await supabase.auth.signOut();
        router.push("/admin-login");
        return;
      }

      setChecking(false);
    };

    checkAuth();

  }, []);

  const handleLogout = async () => {

    await supabase.auth.signOut();

    router.push("/admin-login");
  };

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Checking authentication...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">

      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white p-6 flex flex-col justify-between">

        <div>

          <h2 className="text-xl font-semibold mb-8">
            Admin Panel
          </h2>

          <nav className="flex flex-col gap-4">

            <Link href="/admin">Dashboard</Link>

            <Link href="/admin/create-customer">
              Create Customer
            </Link>

            <Link href="/admin/customers">
              Customers
            </Link>

        

          </nav>

        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="mt-8 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg"
        >
          Logout
        </button>

      </div>

      {/* Page content */}
      <div className="flex-1 bg-gray-100 p-10">
        {children}
      </div>

    </div>
  );
}