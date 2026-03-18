"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import UploadTransaction from "./components/UploadTransaction";
import toast from "react-hot-toast";
import { Trash2 } from "lucide-react";

export default function AccountPage() {
  const { id } = useParams();

  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTransactions, setSelectedTransactions] = useState([]);

  const [formData, setFormData] = useState({
    transit_number: "",
    account_number: "",
    account_name: "",
    account_type: "",
    balance: "",
  });

  const fetchAccountData = async () => {
    try {
      const res = await fetch(`/api/admin/accounts/${id}`);
      const data = await res.json();

      if (res.ok) {
        setAccount(data.account);
        setTransactions(data.transactions);

        const [transit, acc] = (data.account?.account_number || "").split("-");

        setFormData({
          transit_number: transit || "",
          account_number: acc || "",
          account_name: data.account?.account_name || "",
          account_type: data.account?.account_type || "",
          balance: data.account?.balance || "",
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load account");
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchAccountData();
  }, []);

  useEffect(() => {
    if (transactions.length > 0) {
      console.log(
        "🧪 ALL IDS:",
        transactions.map((tx) => tx?.id),
      );
    }
  }, [transactions]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleSelect = (id) => {
    setSelectedTransactions((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleDeleteAll = async () => {
    if (!confirm("⚠️ This will delete ALL transactions permanently. Continue?"))
      return;

    try {
      const res = await fetch("/api/admin/transactions/delete-all", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ account_id: id }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("All transactions deleted");
        fetchAccountData();
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTransactions.length === 0) {
      toast.error("No transactions selected");
      return;
    }
    if (selectedTransactions.length > 200) {
      toast.error("Too many transactions selected. Try smaller batches.");
      return;
    }
    if (!confirm("Delete selected transactions?")) return;

    try {
      const res = await fetch("/api/admin/transactions/bulk-delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ids: selectedTransactions,
          account_id: id,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(`${selectedTransactions.length} transactions deleted`);
        setSelectedTransactions([]);
        fetchAccountData();
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error("Error deleting transactions");
    }
  };

  const handleSave = async () => {
    if (!confirm("⚠️ You are editing account details. Continue?")) return;

    if (!formData.transit_number || !formData.account_number) {
      toast.error("Account number is incomplete");
      return;
    }

    try {
      const res = await fetch("/api/admin/accounts/update", {
        method: "POST",
        body: JSON.stringify({
          id,
          transit_number: formData.transit_number,
          account_number: formData.account_number,
          account_name: formData.account_name,
          account_type: formData.account_type,
          balance: formData.balance,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Account updated successfully");
        setIsEditing(false);
        fetchAccountData();
      } else {
        toast.error(data.error || "Update failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
  };

  if (loading) {
    return <div className="p-10 text-gray-600">Loading account details...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold text-gray-800">
            Account Overview
          </h1>
          <p className="text-gray-500 mt-1">Manage account and transactions</p>
        </div>

        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-yellow-500 hover:bg-yellow-600 text-black px-5 py-2 rounded-lg"
          >
            Edit Account
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg"
            >
              Save
            </button>

            <button
              onClick={() => {
                setIsEditing(false);
                fetchAccountData();
              }}
              className="bg-gray-300 hover:bg-gray-400 px-5 py-2 rounded-lg"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* ACCOUNT CARD */}
      <div className="bg-white rounded-xl shadow border border-gray-100 p-6">
        {isEditing && (
          <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded">
            Admin Edit Mode Enabled
          </div>
        )}

        <div className="grid md:grid-cols-4 gap-6">
          {/* ACCOUNT NUMBER SPLIT */}
          <div>
            <p className="text-gray-500 text-sm mb-1">Account Number</p>

            {isEditing ? (
              <div className="flex gap-2">
                <input
                  name="transit_number"
                  value={formData.transit_number}
                  onChange={handleChange}
                  placeholder="Transit"
                  className="w-1/3 border p-2 rounded"
                />

                <span className="self-center text-gray-500">-</span>

                <input
                  name="account_number"
                  value={formData.account_number}
                  onChange={handleChange}
                  placeholder="Account"
                  className="w-2/3 border p-2 rounded"
                />
              </div>
            ) : (
              <p className="text-gray-700 text-lg font-medium">
                {account?.account_number}
              </p>
            )}
          </div>

          {/* ACCOUNT NAME */}
          <Field
            label="Account Name"
            value={account?.account_name}
            isEditing={isEditing}
            name="account_name"
            formData={formData}
            handleChange={handleChange}
          />

          {/* ACCOUNT TYPE DROPDOWN */}
          <div>
            <p className="text-gray-500 text-sm mb-1">Account Type</p>

            {isEditing ? (
              <select
                name="account_type"
                value={formData.account_type}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              >
                <option value="">Select Type</option>
                <option value="savings">Savings</option>
                <option value="current">Chequing</option>
                <option value="checking">Checking</option>
              </select>
            ) : (
              <p className="text-gray-700 text-lg font-medium">
                {account?.account_type}
              </p>
            )}
          </div>

          {/* BALANCE */}
          <div>
            <p className="text-gray-500 text-sm">Current Balance</p>

            {isEditing ? (
              <input
                name="balance"
                value={formData.balance}
                onChange={handleChange}
                type="number"
                className="w-full border p-2 rounded"
              />
            ) : (
              <p className="text-blue-700 text-xl font-semibold">
                ${account?.balance}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* TRANSACTIONS */}
      {/* TRANSACTIONS CONTAINER */}
      <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
        {/* CONTEXTUAL HEADER 
      Switches between "Default" and "Selection" modes 
  */}
        <div
          className={`p-6 border-b transition-all duration-300 ${
            selectedTransactions.length > 0
              ? "bg-red-50 border-red-100"
              : "bg-white border-gray-100"
          }`}
        >
          {selectedTransactions.length === 0 ? (
            /* --- DEFAULT STATE: 3-Column Layout --- */
            <div className="grid grid-cols-1 md:grid-cols-3 items-center w-full gap-4">
              {/* Column 1: Branding/Title */}
              <div className="text-left">
                <h2 className="text-xl font-semibold text-gray-800 tracking-tight">
                  Transactions
                </h2>
                <p className="text-gray-400 text-xs mt-0.5">
                  Review and manage history
                </p>
              </div>

              {/* Column 2: Upload (The Hero / Middle) */}
              <div className="flex justify-center">
                <div className="bg-gray-50 p-1.5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <UploadTransaction
                    accountId={id}
                    onUploadSuccess={fetchAccountData}
                  />
                </div>
              </div>

              {/* Column 3: Danger Zone (Far Right) */}
              <div className="flex justify-center items-center gap-6">
                {/* Vertical Divider for breathing space */}
                <div className="h-8 w-px bg-gray-200 hidden md:block" />

                <button
                  onClick={handleDeleteAll}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
                >
                  <Trash2 size={16} />
                  Delete All
                </button>
              </div>
            </div>
          ) : (
            /* --- SELECTION STATE: Focus on Action --- */
            <div className="flex justify-between items-center w-full animate-in fade-in slide-in-from-top-1">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSelectedTransactions([])}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-red-100 text-red-600 hover:bg-red-100 transition-colors shadow-sm"
                  title="Clear selection"
                >
                  <span className="text-lg font-bold">✕</span>
                </button>
                <div>
                  <span className="text-red-900 font-bold block leading-none">
                    {selectedTransactions.length} Selected
                  </span>
                  <p className="text-red-600 text-xs mt-1">
                    Bulk action mode enabled
                  </p>
                </div>
              </div>

              <button
                onClick={handleBulkDelete}
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-2.5 rounded-lg shadow-lg shadow-red-200 font-semibold transition-all transform active:scale-95"
              >
                Delete Selected
              </button>
            </div>
          )}
        </div>

        {/* TABLE SECTION */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-50/50 text-gray-500 text-[11px] uppercase tracking-widest font-bold">
              <tr>
                <th className="p-4 text-left">Date</th>
                <th className="p-4 text-left">Description</th>
                <th className="p-4 text-left">Debit</th>
                <th className="p-4 text-left">Credit</th>
                <th className="p-4 text-left">Balance</th>
                <th className="p-4 text-right">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer"
                    checked={
                      transactions.length > 0 &&
                      selectedTransactions.length === transactions.length
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedTransactions(
                          transactions.map((tx) => tx.id),
                        );
                      } else {
                        setSelectedTransactions([]);
                      }
                    }}
                  />
                </th>
              </tr>
            </thead>

            <tbody className="text-gray-700 divide-y divide-gray-50">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-20 text-center">
                    <div className="flex flex-col items-center opacity-40">
                      <span className="text-5xl mb-4 text-gray-300">📂</span>
                      <p className="text-gray-500 font-medium">
                        No transactions found
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className={`group transition-colors duration-150 ${
                      selectedTransactions.includes(tx.id)
                        ? "bg-red-50/40"
                        : "hover:bg-gray-50/80"
                    }`}
                  >
                    <td className="p-4 text-sm text-gray-500">
                      {new Date(tx.date).toLocaleDateString("en-GB")}
                    </td>
                    <td className="p-4 text-sm font-medium text-gray-800">
                      {tx.description}
                    </td>
                    <td className="p-4 text-sm text-red-600 font-medium">
                      {tx.debit ? `-$${tx.debit}` : "—"}
                    </td>
                    <td className="p-4 text-sm text-green-600 font-medium">
                      {tx.credit ? `+$${tx.credit}` : "—"}
                    </td>
                    <td className="p-4 text-sm font-bold text-gray-900">
                      ${tx.balance_after}
                    </td>
                    <td className="p-4 text-right">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer"
                        checked={selectedTransactions.includes(tx.id)}
                        onChange={() => toggleSelect(tx.id)}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* FIELD COMPONENT */
function Field({ label, value, isEditing, name, formData, handleChange }) {
  return (
    <div>
      <p className="text-gray-500 text-sm">{label}</p>

      {isEditing ? (
        <input
          name={name}
          value={formData[name]}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
      ) : (
        <p className="text-gray-700 text-lg font-medium">{value}</p>
      )}
    </div>
  );
}
