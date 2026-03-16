"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function CreateAccountPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const user_id = searchParams.get("user_id");

  const [form, setForm] = useState({
    account_name: "",
    account_type: "Chequing",
    currency: "CAD",
    balance: "",
    transit_number: "",
    account_number: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const loadingToast = toast.loading("Creating account...");

    try {
      const res = await fetch("/api/admin/create-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          user_id,
        }),
      });

      const data = await res.json();

      toast.dismiss(loadingToast);

      if (res.ok) {
        toast.success("Account created successfully");

        setTimeout(() => {
          router.push(`/admin/customers/${user_id}`);
        }, 700);
      } else {
        toast.error(data.error || "Failed to create account");
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Server error occurred");
    }
  };

  return (
    <div className="flex justify-center pt-10">
      <div className="w-full max-w-xl bg-white shadow-lg rounded-xl p-8 border border-blue-100">
        <h1 className="text-2xl font-semibold text-blue-700 mb-6">
          Create Account
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* ACCOUNT NAME */}
          <input
            type="text"
            name="account_name"
            placeholder="Account Name"
            value={form.account_name}
            onChange={handleChange}
            className="w-full border p-3 rounded text-black"
            required
          />

          {/* ACCOUNT TYPE */}
          <select
            name="account_type"
            value={form.account_type}
            onChange={handleChange}
            className="w-full border p-3 rounded text-black"
          >
            <option>Chequing</option>
            <option>Savings</option>
          </select>

          {/* CURRENCY */}
          <select
            name="currency"
            value={form.currency}
            onChange={handleChange}
            className="w-full border p-3 rounded text-black"
          >
            <option>CAD</option>
            <option>USD</option>
          </select>

          {/* INITIAL BALANCE */}
          <input
            type="number"
            name="balance"
            placeholder="Initial Balance"
            value={form.balance}
            onChange={handleChange}
            className="w-full border p-3 rounded text-black"
            required
          />

          {/* TRANSIT NUMBER */}
          <input
            type="text"
            name="transit_number"
            placeholder="Transit Number (04352)"
            pattern="[0-9]{5}"
            title="Transit number must be 5 digits"
            value={form.transit_number}
            onChange={handleChange}
            className="w-full border p-3 rounded text-black"
            required
          />

          {/* ACCOUNT NUMBER */}
          <input
            type="text"
            name="account_number"
            placeholder="Account Number (9876346)"
            pattern="[0-9]{7}"
            title="Account number must be 7 digits"
            value={form.account_number}
            onChange={handleChange}
            className="w-full border p-3 rounded text-black"
            required
          />

          {/* CREATE BUTTON */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded"
          >
            Create Account
          </button>
        </form>
      </div>
    </div>
  );
}