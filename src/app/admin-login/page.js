"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";

export default function AdminLogin() {

  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);

    try {

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }

      const user = data?.user;

      if (!user) {
        toast.error("Authentication failed");
        setLoading(false);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError || !profile) {
        toast.error("Unable to verify user role");
        setLoading(false);
        return;
      }

      if (profile.role !== "admin") {
        toast.error("Only admins can access the admin console");
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      toast.success("Login successful");

      router.push("/admin");

    } catch (err) {

      console.error(err);
      toast.error("Something went wrong");

    } finally {

      setLoading(false);

    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">

      <div className="bg-white p-8 rounded-xl shadow w-full max-w-md">

        <h1 className="text-2xl font-semibold text-gray-800 mb-6">
          Admin Login
        </h1>

        <form onSubmit={handleLogin} className="space-y-4">

          <div>
            <label className="text-sm text-gray-600">Email</label>
            <input
              type="email"
              required
              className="w-full border rounded-lg p-2 mt-1"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Password</label>
            <input
              type="password"
              required
              className="w-full border rounded-lg p-2 mt-1"
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
            />
          </div>

          <button
            disabled={loading}
            className="w-full bg-black text-white py-2 rounded-lg"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

      </div>

    </div>
  );
}