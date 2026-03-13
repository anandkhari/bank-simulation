"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function CreateAccountPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const user_id = searchParams.get("user_id");

  const [manualNumber, setManualNumber] = useState(false);

  const [form, setForm] = useState({
    account_name: "",
    account_type: "Chequing",
    currency: "CAD",
    balance: 0,
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
          account_number: manualNumber ? form.account_number : null,
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
          <input
            type="text"
            name="account_name"
            placeholder="Account Name"
            value={form.account_name}
            onChange={handleChange}
            className="w-full border p-3 rounded text-black"
            required
          />

          <select
            name="account_type"
            value={form.account_type}
            onChange={handleChange}
            className="w-full border p-3 rounded text-black"
          >
            <option>Chequing</option>
            <option>Savings</option>
          </select>

          <select
            name="currency"
            value={form.currency}
            onChange={handleChange}
            className="w-full border p-3 rounded text-black"
          >
            <option>CAD</option>
            <option>USD</option>
          </select>

          <input
            type="number"
            name="balance"
            placeholder="Initial Balance"
            value={form.balance}
            onChange={handleChange}
            className="w-full border p-3 rounded text-black"
          />

          {/* ACCOUNT NUMBER MODE */}

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={manualNumber}
              onChange={() => setManualNumber(!manualNumber)}
            />

            <span className="text-sm text-gray-600">
              Manually enter account number
            </span>
          </div>

          {manualNumber && (
            <input
              type="text"
              name="account_number"
              placeholder="7 digit account number"
              value={form.account_number}
              onChange={handleChange}
              pattern="[0-9]{7}"
              maxLength={7}
              className="w-full border p-3 rounded text-black"
              required
            />
          )}

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
