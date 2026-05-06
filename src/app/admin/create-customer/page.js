"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function CreateCustomerPage() {
  const [form, setForm] = useState({
    client_card: "",
    password: "",
    name: "",
    email: "",
    phone: "",
  });

  const router = useRouter();

  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const loadingToast = toast.loading("Creating customer...");

    try {
      const res = await fetch("/api/admin/create-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      toast.dismiss(loadingToast);

      if (res.ok) {
        toast.success("Customer created successfully");

        router.push(`/admin/create-account?user_id=${data.user_id}`);

        setForm({
          client_card: "",
          password: "",
          name: "",
          email: "",
          phone: "",
        });
      } else {
        toast.error(data.error || "Failed to create customer");
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Server error occurred");
    }
  };

  return (
    <div className="flex justify-center items-start pt-10">
      <div className="w-full max-w-xl bg-white shadow-lg rounded-xl p-8 border border-blue-100">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-blue-700">
            Create Customer
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Add a new banking customer to the system
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm text-gray-600">Client Card Number</label>
            <input
              type="text"
              name="client_card"
              placeholder="Client Card Number"
              value={form.client_card}
              onChange={handleChange}
              maxLength={16}
              pattern="[0-9]{16}"
              title="Please enter a valid 16-digit card number"
              className="w-full border p-3 rounded text-black"
              required
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Password</label>

            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                className="w-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 p-3 pr-12 rounded-md text-gray-900"
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-600">Full Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 p-3 rounded-md mt-1 text-gray-900"
              required
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Email Address</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 p-3 rounded-md mt-1 text-gray-900"
            />
          </div>

          <div className="relative">
            <label className="text-sm text-gray-600">Phone Number</label>
            <div className="flex mt-1">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                +1
              </span>
             <input
  type="tel"
  name="phone"
  value={form.phone}
  onChange={handleChange}
  placeholder="1234567890"
  // Allows digits, spaces, hyphens, dots, and parentheses; 10 to 15 characters long
  pattern="[\d\s\-\(\)\.]{10,15}" 
  className="flex-1 border border-gray-300 p-3 rounded-r-md"
/>
            </div>
          </div>

          {/* Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 transition text-white font-medium py-3 rounded-md"
          >
            Create Customer
          </button>

          {/* Message */}
          {message && (
            <p className="text-sm text-blue-600 text-center mt-2">{message}</p>
          )}
        </form>
      </div>
    </div>
  );
}
