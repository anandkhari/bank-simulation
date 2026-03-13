"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function RightDashboard() {
  const [userName, setUserName] = useState("");
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    const loadUserData = async () => {
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData?.session) return;

      const userId = sessionData.session.user.id;

      /* Get profile name */
      const { data: profile } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", userId)
        .single();

      if (profile) {
        setUserName(profile.name);
      }

      /* Get accounts */
      const { data: accountData } = await supabase
        .from("accounts")
        .select("*")
        .eq("user_id", userId);

      if (accountData) {
        setAccounts(accountData);
      }
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
            className="flex-1 border p-3 text-sm"
          />

          <button className="bg-[var(--client-brand)] hover:bg-[var(--client-brand-hover)] text-white px-8">Search</button>
        </div>
      </div>

      <h3 className="font-medium p-2 text-gray-800 mb-4">
        Quick Payments & Transfers
      </h3>

      {/* QUICK TRANSFER */}
      <div className="bg-gray-100 ml-2  p-10">
        <div className="space-y-3 text-sm">
          {/* FROM ACCOUNT */}
          <div>
            <label className="block text-gray-800 mb-1">From</label>

            <select className="w-full bg-white  text-gray-400 border p-2">
              {accounts.map((account) => (
                <option key={account.id}>
                  {userName} = ${account.balance}
                </option>
              ))}
            </select>
          </div>

          {/* TO ACCOUNT */}
          <div>
            <label className="block text-gray-800 mb-1">To</label>

            <select className="w-full  bg-white  text-gray-500 border p-2">
              <option>Select...</option>
            </select>
          </div>

          {/* AMOUNT */}
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block  text-gray-800 mb-1">Amount</label>

              <input
                placeholder="$ 0.00"
                className="w-full border  text-gray-500  bg-white p-2"
              />
            </div>

            <div className="w-[90px]">
              <label className="block text-gray-500 mb-1">Currency</label>

              <select className="w-full  bg-white border p-2">
                <option>CAD</option>
              </select>
            </div>
          </div>

          <button className="w-full bg-[var(--client-brand)] hover:bg-[var(--client-brand-hover)] text-white py-2 mt-2">
            Submit
          </button>
        </div>
      </div>

      {/* MONEY MANAGEMENT */}
     <div className="bg-white p-5 shadow-md">

  <h3 className="font-medium text-gray-800 mb-3">
    Money Management
  </h3>

  <div className="space-y-2 text-sm text-[var(--client-brand)] tracking-wide">

    <p className="cursor-pointer hover:underline">
      Pay Bills & Transfer Funds
    </p>

    <p className="cursor-pointer hover:underline">
      Pay Employees and Vendors
    </p>

    <p className="cursor-pointer hover:underline">
      Stop a Cheque or Pre-Authorized Payment
    </p>

    <p className="cursor-pointer hover:underline">
      Register for Interac e-Transfer Autodeposit
    </p>

    <p className="cursor-pointer hover:underline">
      Pay & Sync with Quickbooks
    </p>

  </div>

</div>
    </div>
  );
}
