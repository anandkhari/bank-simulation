"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import UploadTransaction from "./components/UploadTransaction";
import toast from "react-hot-toast";
import { Trash2, X, ArrowUp, Filter, CalendarX, Loader2 } from "lucide-react";

function formatCurrency(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return "0.00";
  return num.toLocaleString("en-CA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function AccountPage() {
  const { id } = useParams();

  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleSelect = (id) => {
    setSelectedTransactions((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Always ascending — date first, then sort_order for same-day tiebreaking
  const filteredTransactions = useMemo(() => {
    let result = [...transactions];

    if (dateFrom) {
      result = result.filter((tx) => new Date(tx.date) >= new Date(dateFrom));
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      result = result.filter((tx) => new Date(tx.date) <= to);
    }

    result.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      if (dateA === dateB) return a.sort_order - b.sort_order;
      return dateA - dateB;
    });

    return result;
  }, [transactions, dateFrom, dateTo]);

  const clearFilters = () => {
    setDateFrom("");
    setDateTo("");
  };

  const isFiltered = dateFrom || dateTo;

  const handleDeleteAll = async () => {
    if (!confirm("⚠️ This will delete ALL transactions permanently. Continue?"))
      return;
    setIsDeleting(true);
    try {
      const res = await fetch("/api/admin/transactions/delete-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
    } finally {
      setIsDeleting(false);
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedTransactions, account_id: id }),
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
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6 md:space-y-8">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">
            Account Overview
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Manage account and transactions
          </p>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-600 text-black px-5 py-2.5 rounded-lg font-medium transition-colors"
          >
            Edit Account
          </button>
        ) : (
          <div className="flex w-full sm:w-auto gap-2">
            <button
              onClick={handleSave}
              className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-medium"
            >
              Save
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                fetchAccountData();
              }}
              className="flex-1 sm:flex-none bg-gray-300 hover:bg-gray-400 px-5 py-2.5 rounded-lg font-medium"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* ACCOUNT CARD */}
      <div className="bg-white rounded-xl shadow border border-gray-100 p-5 md:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-1">
            <p className="text-gray-500 text-xs md:text-sm uppercase tracking-wider font-semibold">
              Account Number
            </p>
            {isEditing ? (
              <div className="flex gap-2">
                <input
                  name="transit_number"
                  value={formData.transit_number}
                  onChange={handleChange}
                  placeholder="Transit"
                  className="w-1/3 border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <span className="self-center text-gray-500">-</span>
                <input
                  name="account_number"
                  value={formData.account_number}
                  onChange={handleChange}
                  placeholder="Account"
                  className="w-2/3 border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            ) : (
              <p className="text-gray-700 text-lg font-medium">
                {account?.account_number}
              </p>
            )}
          </div>
          <Field
            label="Account Name"
            value={account?.account_name}
            isEditing={isEditing}
            name="account_name"
            formData={formData}
            handleChange={handleChange}
          />
          <div className="space-y-1">
            <p className="text-gray-500 text-xs md:text-sm uppercase tracking-wider font-semibold">
              Account Type
            </p>
            {isEditing ? (
              <select
                name="account_type"
                value={formData.account_type}
                onChange={handleChange}
                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                <option value="">Select Type</option>
                <option value="savings">Savings</option>
                <option value="current">Chequing</option>
                <option value="checking">Checking</option>
              </select>
            ) : (
              <p className="text-gray-700 text-lg font-medium capitalize">
                {account?.account_type}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <p className="text-gray-500 text-xs md:text-sm uppercase tracking-wider font-semibold">
              Current Balance
            </p>
            {isEditing ? (
              <input
                name="balance"
                value={formData.balance}
                onChange={handleChange}
                type="number"
                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
              />
            ) : (
              <p className="text-blue-700 text-xl font-bold">
                ${formatCurrency(account?.balance)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* TRANSACTIONS CONTAINER */}
      <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
        <div
          className={`p-4 md:p-6 border-b transition-all duration-300 ${
            selectedTransactions.length > 0
              ? "bg-red-50 border-red-100"
              : "bg-white border-gray-100"
          }`}
        >
          {selectedTransactions.length === 0 ? (
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="text-left">
                <h2 className="text-xl font-semibold text-gray-800 tracking-tight">
                  Transactions
                </h2>
                <p className="text-gray-400 text-xs mt-0.5">
                  {filteredTransactions.length} results · oldest to newest
                </p>
              </div>
              <div className="w-full lg:w-auto flex flex-col sm:flex-row items-center gap-4">
                <div className="w-full sm:w-auto bg-gray-50 p-1.5 rounded-xl border border-gray-100 shadow-sm">
                  <UploadTransaction
                    accountId={id}
                    onUploadSuccess={fetchAccountData}
                  />
                </div>
                <button
                  onClick={() => setShowFilters((v) => !v)}
                  className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                    showFilters || isFiltered
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-700 border-gray-200"
                  }`}
                >
                  <Filter size={15} /> Filters {isFiltered && "· ON"}
                </button>
                <button
                  onClick={handleDeleteAll}
                  disabled={isDeleting}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all shadow-sm active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      Delete All
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-center w-full gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSelectedTransactions([])}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-red-100 text-red-600 hover:bg-red-100 transition-colors shadow-sm"
                >
                  <X size={20} />
                </button>
                <span className="text-red-900 font-bold">
                  {selectedTransactions.length} Selected
                </span>
              </div>
              <button
                onClick={handleBulkDelete}
                className="bg-red-600 text-white px-8 py-3 rounded-lg font-semibold transform active:scale-95 transition-all"
              >
                Delete Selected
              </button>
            </div>
          )}
        </div>

        {/* FILTER PANEL — date range only, no sort toggle */}
        {showFilters && (
          <div className="px-6 py-4 bg-gray-50/70 border-b border-gray-100">
            <div className="flex flex-wrap gap-6 items-end">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  From Date
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  To Date
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              {isFiltered && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-gray-200 bg-white"
                >
                  <CalendarX size={14} /> Clear
                </button>
              )}
            </div>
          </div>
        )}

        {/* TABLE — always ascending, balance_after is always correct */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[700px]">
            <thead className="bg-gray-50/50 text-gray-500 text-[11px] uppercase tracking-widest font-bold border-b">
              <tr>
                <th className="p-4 text-left">
                  Date <ArrowUp size={12} className="inline opacity-50" />
                </th>
                <th className="p-4 text-left">Description</th>
                <th className="p-4 text-left">Debit</th>
                <th className="p-4 text-left">Credit</th>
                <th className="p-4 text-left">Balance</th>
                <th className="p-4 text-right">
                  <input
                    type="checkbox"
                    className="w-4 h-4 cursor-pointer"
                    checked={
                      filteredTransactions.length > 0 &&
                      selectedTransactions.length === filteredTransactions.length
                    }
                    onChange={(e) =>
                      setSelectedTransactions(
                        e.target.checked
                          ? filteredTransactions.map((tx) => tx.id)
                          : []
                      )
                    }
                  />
                </th>
              </tr>
            </thead>
            <tbody className="text-gray-700 divide-y divide-gray-50">
              {filteredTransactions.map((tx) => (
                <tr
                  key={tx.id}
                  className={`group ${
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
                    {tx.debit ? `-$${formatCurrency(tx.debit)}` : "—"}
                  </td>
                  <td className="p-4 text-sm text-green-600 font-medium">
                    {tx.credit ? `+$${formatCurrency(tx.credit)}` : "—"}
                  </td>
                  <td className="p-4 text-sm font-bold text-gray-900">
                    ${formatCurrency(tx.balance_after)}
                  </td>
                  <td className="p-4 text-right">
                    <input
                      type="checkbox"
                      className="w-4 h-4 cursor-pointer"
                      checked={selectedTransactions.includes(tx.id)}
                      onChange={() => toggleSelect(tx.id)}
                    />
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

function Field({ label, value, isEditing, name, formData, handleChange }) {
  return (
    <div className="space-y-1">
      <p className="text-gray-500 text-xs md:text-sm uppercase tracking-wider font-semibold">
        {label}
      </p>
      {isEditing ? (
        <input
          name={name}
          value={formData[name]}
          onChange={handleChange}
          className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
        />
      ) : (
        <p className="text-gray-700 text-lg font-medium">{value}</p>
      )}
    </div>
  );
}