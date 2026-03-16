"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Info, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LeftPanel() {
  const [accounts, setAccounts] = useState([]);
  const [userName, setUserName] = useState("");
  const [totalBalance, setTotalBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  /* Format account number like 03282-1001403 */
  const formatAccountNumber = (num) => {
    if (!num) return "";

    const str = num.toString();

    const transit = str.slice(0, 5);
    const account = str.slice(5);

    return `${transit}-${account}`;
  };

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();

        if (!sessionData?.session) return;

        const userId = sessionData.session.user.id;

        /* Fetch profile */
        const { data: profile } = await supabase
          .from("profiles")
          .select("name")
          .eq("id", userId)
          .single();

        if (profile) setUserName(profile.name);

        /* Fetch accounts */
        const { data: accountData } = await supabase
          .from("accounts")
          .select("*")
          .eq("user_id", userId);

        if (accountData) {
          const sortedAccounts = accountData.sort((a, b) => {
            if (a.account_type.toLowerCase().includes("chequing")) return -1;
            if (b.account_type.toLowerCase().includes("chequing")) return 1;
            return 0;
          });

          setAccounts(sortedAccounts);

          const total = sortedAccounts.reduce(
            (sum, acc) => sum + Number(acc.balance),
            0,
          );

          setTotalBalance(total);
        }
      } catch (err) {
        console.error("Error loading accounts:", err);
      }

      setLoading(false);
    };

    loadAccounts();
  }, []);

  return (
    <div className="space-y-8 py-10">
      {/* SERVICE NOTICE */}
      {/* <div className="bg-gray-50 border-l-4 border-brand p-5 text-sm shadow-sm">
        <div className="flex gap-3">

          <div className="w-6 h-6 bg-brand text-white rounded-full flex items-center justify-center">
            <Info size={14} />
          </div>

          <div className="flex-1">
            <div className="flex justify-between">
              <p className="font-medium tracking-wide text-gray-600">
                Potential Canada Post service disruption
              </p>

              <button className="text-brand underline text-xs">
                Collapse
              </button>
            </div>

            <p className="text-gray-600 text-sm mt-3">
              A Canada Post strike could impact the delivery of your printed
              documents. To avoid disruption, you can view, save and print them
              electronically.
            </p>

            <a className="text-brand text-xs underline mt-5 inline-block cursor-pointer">
              View Account Documents
            </a>
          </div>
        </div>
      </div> */}

      {/* BANK ACCOUNTS */}
      <div className="bg-white pt-5">
        <div className="flex justify-between items-center border-b-2 border-gray-700 pb-2">
          <h2 className="text-lg font-medium text-gray-600">Bank Accounts</h2>

          <span className="text-gray-700 text-lg font-semibold">
            <span className="text-gray-600 text-sm mr-4 font-normal">
              Total:
            </span>
            ${totalBalance.toFixed(2)}
            <span className="text-xs align-super ml-2 text-gray-500">CAD</span>
          </span>
        </div>

        {loading && (
          <p className="py-4 text-gray-500 text-sm">Loading accounts...</p>
        )}

        {!loading && accounts.length === 0 && (
          <p className="py-4 text-gray-500 text-sm">No accounts found</p>
        )}

        {!loading &&
          accounts.map((account) => (
            <div
              key={account.id}
              onClick={() => router.push(`/client/accounts/${account.id}`)}
              className="py-4 border-b px-4 flex justify-between tracking-wide items-center cursor-pointer hover:bg-gray-50"
            >
              <div>
                <p className="text-brand font-medium">{userName}</p>

                <p className="text-gray-500 text-sm">
                  {account.account_type}{" "}
                  {formatAccountNumber(account.account_number)}
                </p>
              </div>

              <div className="flex items-center gap-4">
                {/* BALANCE */}
                <div className="font-medium text-lg text-gray-800">
                  ${Number(account.balance).toFixed(2)}
                  <span className="text-xs  align-super ml-1 text-gray-500">
                    CAD
                  </span>
                </div>

                {/* THREE DOT MENU */}
                <div className="flex flex-col gap-[3px] cursor-pointer">
                  <span className="w-[4px] h-[4px] bg-brand rounded-full"></span>
                  <span className="w-[4px] h-[4px] bg-brand rounded-full"></span>
                  <span className="w-[4px] h-[4px] bg-brand rounded-full"></span>
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* FINANCIAL PRODUCTS */}

      <div className="space-y-6">
        <div className="border-b-2 border-gray-700 pt-4">
          <h2 className="text-lg font-medium text-gray-600">Credit Cards</h2>
        </div>

        <div className="flex items-center gap-2 text-brand text-sm mt-2 cursor-pointer">
          <div className="w-6 h-6 border border-brand rounded-full flex items-center justify-center">
            <Plus size={14} />
          </div>

          <span>Grow Your Business with Credit</span>
        </div>

        <div className="border-b-2 border-gray-700 pt-4">
          <h3 className="font-medium text-gray-600">Investments</h3>
        </div>

        <div className="border-b-2 border-gray-700 pt-4">
          <h3 className="font-medium text-gray-600">Lines & Loans</h3>
        </div>

        <div className="flex items-center gap-2 text-brand text-sm mt-2 cursor-pointer">
          <div className="w-6 h-6 border border-brand rounded-full flex items-center justify-center">
            <Plus size={14} />
          </div>

          <span>Grow Your Business with Credit</span>
        </div>

        <div className="border-b-2 border-gray-700 pt-4">
          <h3 className="font-medium text-gray-600">Mortgages</h3>
        </div>
      </div>
    </div>
  );
}
