"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function CustomersPage() {

  const router = useRouter();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const fetchCustomers = async () => {

    try {

      const res = await fetch("/api/admin/customers");
      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "Failed to fetch customers.");
        return;
      }

      setCustomers(Array.isArray(data) ? data : []);

    } catch {

      setError("Failed to fetch customers.");

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleDeleteCustomer = async (e, id) => {

    e.stopPropagation();

    const confirmDelete = confirm(
      "Are you sure you want to delete this customer?\nAll accounts and transactions will also be deleted."
    );

    if (!confirmDelete) return;

    try {

      setDeletingId(id);

      const res = await fetch(`/api/admin/delete-user/${id}`, {
        method: "DELETE"
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to delete user");
        return;
      }

      setCustomers((prev) => prev.filter((c) => c.id !== id));

    } catch (err) {

      console.error(err);
      alert("Server error");

    } finally {

      setDeletingId(null);

    }

  };

  return (

    <div>

      <h1 className="text-2xl font-semibold text-blue-700 mb-8">
        Customers
      </h1>

      <div className="bg-white shadow rounded-lg text-gray-600 overflow-hidden">

        <table className="w-full">

          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="p-3 text-left">Client Card</th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Phone</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>

            {loading && (
              <tr>
                <td className="p-4" colSpan="5">
                  Loading customers...
                </td>
              </tr>
            )}

            {!loading && error && (
              <tr>
                <td className="p-4 text-red-600" colSpan="5">
                  {error}
                </td>
              </tr>
            )}

            {!loading && customers.length === 0 && (
              <tr>
                <td className="p-4" colSpan="5">
                  No customers found
                </td>
              </tr>
            )}

            {customers.map((customer) => (

              <tr
                key={customer.id}
                onClick={() => router.push(`/admin/customers/${customer.id}`)}
                className="border-t hover:bg-blue-50 cursor-pointer transition"
              >

                <td className="p-3">{customer.client_card}</td>
                <td className="p-3">{customer.name}</td>
                <td className="p-3">{customer.email}</td>
                <td className="p-3">{customer.phone}</td>

                <td className="p-3">

                  <button
                    onClick={(e) => handleDeleteCustomer(e, customer.id)}
                    disabled={deletingId === customer.id}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                  >
                    {deletingId === customer.id ? "Deleting..." : "Delete"}
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>

  );

}