"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { ExternalLink, Calendar } from "lucide-react";

export default function RightDashboard() {
  const [userName, setUserName] = useState("");
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    const loadUserData = async () => {
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData?.session) return;

      const userId = sessionData.session.user.id;

      const { data: profile } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", userId)
        .single();

      if (profile) setUserName(profile.name);

      const { data: accountData } = await supabase
        .from("accounts")
        .select("*")
        .eq("user_id", userId);

      if (accountData) setAccounts(accountData);
    };

    loadUserData();
  }, []);

  return (
    <div className="space-y-8 py-6">

      {/* SEARCH */}
      <div className="bg-white p-4">
        <div className="flex">
          <input
            placeholder="Enter your question here"
            className="flex-1 border p-3 text-sm text-gray-600 placeholder-gray-400"
          />

          <button className="bg-[var(--client-brand)] hover:bg-[var(--client-brand-hover)] text-white px-8">
            Search
          </button>
        </div>
      </div>

      {/* QUICK PAYMENTS */}
      <h3 className="font-medium p-2 text-gray-800 mb-4">
        Quick Payments & Transfers
      </h3>

      <div className="bg-gray-100 ml-2 p-10">
        <div className="space-y-3 text-sm">

          {/* FROM */}
          <div>
            <label className="block text-gray-800 mb-1">From</label>

            <select className="w-full bg-white text-gray-600 border p-2">
              {accounts.map((account) => (
                <option key={account.id}>
                  {userName} = ${account.balance}
                </option>
              ))}
            </select>
          </div>

          {/* TO */}
          <div>
            <label className="block text-gray-800 mb-1">To</label>

            <select className="w-full bg-white text-gray-600 border p-2">
              <option>Select...</option>
            </select>
          </div>

          {/* AMOUNT */}
          <div className="flex gap-4">

            <div className="flex-1">
              <label className="block text-gray-800 mb-1">Amount</label>

              <div className="flex border border-gray-400 bg-white">
                <div className="flex items-center justify-center px-3 border-r border-gray-400 text-gray-700">
                  $
                </div>

                <input
                  placeholder="0.00"
                  className="flex-1 p-2 outline-none text-gray-600 placeholder-gray-400"
                />
              </div>
            </div>

            {/* CURRENCY */}
            <div className="w-[120px]">
              <label className="block text-gray-800 mb-1">Currency</label>

              <div className="border border-gray-400 bg-white flex items-center justify-between px-3 py-2">
                <span className="text-gray-800">CAD</span>

                <svg
                  className="w-4 h-4 text-[var(--client-brand)]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>

          </div>

          <button className="w-full bg-[var(--client-brand)] hover:bg-[var(--client-brand-hover)] text-white py-2 mt-2">
            Submit
          </button>

        </div>
      </div>

      {/* MONEY MANAGEMENT */}
      <div className="bg-white p-6 border">

        <h3 className="font-medium text-gray-800 mb-4">
          Money Management
        </h3>

        <div className="space-y-3 text-sm text-[var(--client-brand)]">

          <p className="hover:underline cursor-pointer">
            Pay Bills & Transfer Funds
          </p>

          <p className="hover:underline cursor-pointer">
            Pay Employees and Vendors
          </p>

          <p className="hover:underline cursor-pointer">
            Request Money using <span className="italic">Interac e-Transfer</span>
          </p>

          <p className="hover:underline cursor-pointer">
            Purchase Foreign Cash
          </p>

          <p className="hover:underline cursor-pointer">
            Wire Payments
          </p>

          <div className="flex items-center gap-2 hover:underline cursor-pointer">
            Tax Filing Services
            <ExternalLink size={16} />
          </div>

        </div>
      </div>

      {/* BUSINESS TOOLS */}
      <div className="bg-white p-6 border">

        <h3 className="font-medium text-gray-800 mb-4">
          Business Tools and Resources
        </h3>

        <div className="space-y-3 text-sm text-[var(--client-brand)]">

          <p className="hover:underline cursor-pointer">
            Pay & Sync with Quickbooks
          </p>

          <div className="flex items-center gap-2 hover:underline cursor-pointer">
            RBC Global Connect
            <ExternalLink size={16} />
          </div>

          <div className="flex items-center gap-2 hover:underline cursor-pointer">
            RBC Global Trade
            <ExternalLink size={16} />
          </div>

        </div>

      </div>

      {/* ACCOUNT MANAGEMENT */}
      <div className="bg-white p-6 border">

        <h3 className="font-medium text-gray-800 mb-4">
          Account Management
        </h3>

        <div className="space-y-3 text-sm text-[var(--client-brand)]">

          <p className="hover:underline cursor-pointer">
            Profile and Preferences
          </p>

          <p className="hover:underline cursor-pointer">
            Account Services
          </p>

          <p className="hover:underline cursor-pointer">
            Daily Transaction Limits
          </p>

          <div className="flex items-center gap-3 mt-4 text-[var(--client-brand)] cursor-pointer hover:underline">
            <Calendar size={20} />
            Make or Change an Appointment
            <ExternalLink size={16} />
          </div>

        </div>

      </div>

      {/* CDIC BADGE */}
      <div className="flex justify-center pt-6">
        <img
          src="/cdic.png"
          alt="CDIC"
          className="h-10"
        />
      </div>

    </div>
  );
}