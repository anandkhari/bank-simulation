"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function CustomerProfilePage() {

  const { id } = useParams();
  const router = useRouter();

  const [customer, setCustomer] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomerData = async () => {

    try {

      const res = await fetch(`/api/admin/customers/${id}`);
      const data = await res.json();

      if (res.ok) {
        setCustomer(data.customer);
        setAccounts(data.accounts);
      }

    } catch (error) {
      console.error(error);
    }

    setLoading(false);
  };
  

  useEffect(() => {
    fetchCustomerData();
  }, []);

  if (loading) {
    return <div className="p-10 text-gray-600">Loading...</div>;
  }

  return (
    <div className="p-8 space-y-8">

      {/* Customer Info */}
      <div className="bg-white p-6 rounded-lg shadow">

        <h1 className="text-2xl font-semibold text-blue-700 mb-4">
          Customer Profile
        </h1>

        <div className="grid grid-cols-2 gap-4">

          <div>
            <p className="text-gray-500 text-sm">Name</p>
            <p className="text-lg text-gray-600">{customer?.name}</p>
          </div>

          <div>
            <p className="text-gray-500 text-sm">Client Card</p>
            <p className="text-lg text-gray-600">{customer?.client_card}</p>
          </div>

          <div>
            <p className="text-gray-500 text-sm">Email</p>
            <p className="text-lg text-gray-600">{customer?.email}</p>
          </div>

          <div>
            <p className="text-gray-500 text-sm">Phone</p>
            <p className="text-lg text-gray-600">{customer?.phone}</p>
          </div>

        </div>

      </div>

      {/* Accounts */}
      <div className="bg-white p-6 rounded-lg shadow">

        <div className="flex justify-between items-center mb-4">

          <h2 className="text-xl font-semibold text-blue-700">
            Accounts
          </h2>

          <button
            onClick={() => router.push(`/admin/create-account?user_id=${id}`)}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Create Account
          </button>

        </div>

        <table className="w-full">

          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="p-3 text-left">Account Number</th>
              <th className="p-3 text-left">Account Name</th>
              <th className="p-3 text-left">Type</th>
              <th className="p-3 text-left">Balance</th>
            </tr>
          </thead>

          <tbody className="text-gray-500">

            {accounts.length === 0 && (
              <tr>
                <td colSpan="4" className="p-4 text-gray-600">
                  No accounts created yet
                </td>
              </tr>
            )}

            {accounts.map((account) => (
              <tr
                key={account.id}
                onClick={() => router.push(`/admin/accounts/${account.id}`)}
                className="border-t hover:bg-gray-50 cursor-pointer transition"
              >

                <td className="p-3">
                  {account.account_number}
                </td>

                <td className="p-3">
                  {account.account_name}
                </td>

                <td className="p-3">
                  {account.account_type}
                </td>

                <td className="p-3">
                  ${account.balance}
                </td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}