"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import UploadTransaction from "./components/UploadTransaction";

export default function AccountPage() {

  const { id } = useParams();

  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAccountData = async () => {
    try {

      const res = await fetch(`/api/admin/accounts/${id}`);
      const data = await res.json();

      if (res.ok) {
        setAccount(data.account);
        setTransactions(data.transactions);
      }

    } catch (error) {
      console.error(error);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchAccountData();
  }, []);

  if (loading) {
    return (
      <div className="p-10 text-gray-600">
        Loading account details...
      </div>
    );
  }

  

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8">

      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-800">
          Account Overview
        </h1>
        <p className="text-gray-500 mt-1">
          Manage transactions and upload statements
        </p>
      </div>

      {/* Account Summary Card */}
      <div className="bg-white rounded-xl shadow border border-gray-100 p-6">

        <div className="grid md:grid-cols-4 gap-6">

          <div>
            <p className="text-gray-500 text-sm">Account Number</p>
            <p className="text-gray-700 text-lg font-medium">
              {account?.account_number}
            </p>
          </div>

          <div>
            <p className="text-gray-500 text-sm">Account Name</p>
            <p className="text-gray-700 text-lg font-medium">
              {account?.account_name}
            </p>
          </div>

          <div>
            <p className="text-gray-500 text-sm">Account Type</p>
            <p className="text-gray-700 text-lg font-medium">
              {account?.account_type}
            </p>
          </div>

          <div>
            <p className="text-gray-500 text-sm">Current Balance</p>
            <p className="text-blue-700 text-xl font-semibold">
              ${account?.balance}
            </p>
          </div>

        </div>

      </div>

      {/* Transactions Section */}
      <div className="bg-white rounded-xl shadow border border-gray-100">

        {/* Transactions Header */}
        <div className="flex justify-between items-center p-6 border-b">

          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Transactions
            </h2>
            <p className="text-gray-500 text-sm">
              Upload statements or review transaction history
            </p>
          </div>

          <UploadTransaction
            accountId={id}
            onUploadSuccess={fetchAccountData}
          />

        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">

          <table className="w-full">

            <thead className="bg-gray-50 text-gray-600 text-sm">
              <tr>
                <th className="p-4 text-left">Date</th>
                <th className="p-4 text-left">Description</th>
                <th className="p-4 text-left">Debit</th>
                <th className="p-4 text-left">Credit</th>
                <th className="p-4 text-left">Balance</th>
              </tr>
            </thead>

            <tbody className="text-gray-700">

              {transactions.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-6 text-center text-gray-500">
                    No transactions available
                  </td>
                </tr>
              )}

              {transactions.map((tx) => (
                <tr
                  key={tx.id}
                  className="border-t hover:bg-gray-50 transition"
                >

                  <td className="p-4">
                  {new Date(tx.date).toLocaleDateString("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric"
})}
                  </td>

                  <td className="p-4">
                    {tx.description}
                  </td>

                  <td className="p-4 text-red-600">
                    {tx.debit ? `$${tx.debit}` : "-"}
                  </td>

                  <td className="p-4 text-green-600">
                    {tx.credit ? `$${tx.credit}` : "-"}
                  </td>

                  <td className="p-4 font-medium">
                    ${tx.balance_after}
                  </td>

                </tr>
              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}