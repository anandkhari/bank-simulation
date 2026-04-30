"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useParams } from "next/navigation";
import {
  ChevronDown,
  FileText,
  Mail,
  Gift,
  Rocket,
  Printer,
  SlidersHorizontal,
  Download,
} from "lucide-react";
import { HelpCircle, Bell, Receipt, Repeat, Send } from "lucide-react";
import FilterDrawer from "@/app/client/components/FilterDrawer";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function LeftAccountPanel() {
  const { id } = useParams();

  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(50);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [activeFilter, setActiveFilter] = useState("14");
  const router = useRouter();

  const [filters, setFilters] = useState({
    type: "all",
    startDate: "",
    endDate: "",
    minAmount: "",
    maxAmount: "",
  });

  const downloadCSV = () => {
  const headers = [
    "Account Type",
    "Account Number", 
    "Transaction Date",
    "Cheque Number",
    "Description 1",
    "Description 2",
    "CAD$",
    "USD$",
  ];

  const rows = filteredTransactions.map((tx) => {
    const date = new Date(tx.date + "T00:00:00");
    const formattedDate = `${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}/${date.getFullYear()}`;
    const cadAmount = tx.credit > 0 ? tx.credit : tx.debit > 0 ? -tx.debit : 0;

    return [
      "Chequing",
      account?.account_number || "",
      formattedDate,
      "", // Cheque Number
      `"${(tx.description || "").replace(/"/g, '""')}"`,
      "", // Description 2
      cadAmount,
      "", // USD$
    ];
  });

  const csvContent = [headers, ...rows]
    .map((row) => row.join(","))
    .join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `transactions-${account?.account_number || "export"}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

  const [userName, setUserName] = useState("");

  const today = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  useEffect(() => {
    const loadData = async () => {
      const { data: accountData } = await supabase
        .from("accounts")
        .select("*")
        .eq("id", id)
        .single();

      if (accountData) setAccount(accountData);

    setTransactionsLoading(true);
     const { data: txData, error: txError } = await supabase
  .from("transactions")
  .select("*")
  .eq("account_id", id)
  .order("date", { ascending: false })
  .order("sort_order", { ascending: false });

if (txError) {
  console.error("Failed to load transactions:", txError.message);
}



      if (txData) {
        setTransactions(txData);
        setFilteredTransactions(getQuickFilteredTransactions(txData, "14"));
      }
      setTransactionsLoading(false);

      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session) {
        const userId = sessionData.session.user.id;
        const { data: profile } = await supabase
          .from("profiles")
          .select("name")
          .eq("id", userId)
          .single();
        if (profile) setUserName(profile.name);
      }
    };

    loadData();
  }, [id]);

  const formatDate = (date) =>
    new Date(date + "T00:00:00").toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const formatMoney = (amount) => Number(amount).toFixed(2);

  const getQuickFilteredTransactions = (list, filter) => {
    const now = new Date();
    let filtered = [...list];

    if (filter === "14") {
      const f = new Date();
      f.setDate(f.getDate() - 14);
      const fromStr = f.toLocaleDateString("en-CA");
      filtered = filtered.filter((tx) => tx.date >= fromStr);
    }

    if (filter === "30") {
      const f = new Date();
      f.setDate(f.getDate() - 30);
      const fromStr = f.toLocaleDateString("en-CA");
      filtered = filtered.filter((tx) => tx.date >= fromStr);
    }

    if (filter === "lastMonth") {
      const firstOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastOfPrevMonth  = new Date(now.getFullYear(), now.getMonth(), 0);
      const firstStr = firstOfPrevMonth.toLocaleDateString("en-CA");
      const lastStr  = lastOfPrevMonth.toLocaleDateString("en-CA");
      filtered = filtered.filter((tx) => tx.date >= firstStr && tx.date <= lastStr);
    }

    return filtered;
  };

  // ── QUICK DATE FILTER (14 days / 30 days / Last Month) ────────
  const applyQuickFilter = (filter) => {
    setActiveFilter(filter);
    setVisibleCount(50);
    setFilteredTransactions(getQuickFilteredTransactions(transactions, filter));
  };

  // ── FILTER DRAWER + SEARCH ────────────────────────────────────
  const applyFiltersAndSearch = () => {
    const todayDate = new Date();
    todayDate.setHours(23, 59, 59, 999);

    if (filters.startDate && new Date(filters.startDate) > todayDate) {
      toast.error("Start date cannot be in the future");
      return;
    }
    if (filters.endDate && new Date(filters.endDate) > todayDate) {
      toast.error("End date cannot be in the future");
      return;
    }
    if (
      filters.startDate &&
      filters.endDate &&
      filters.startDate > filters.endDate
    ) {
      toast.error("Start date cannot be after end date");
      return;
    }
    if (filters.minAmount && Number(filters.minAmount) < 0) {
      toast.error("Minimum amount cannot be negative");
      return;
    }
    if (filters.maxAmount && Number(filters.maxAmount) < 0) {
      toast.error("Maximum amount cannot be negative");
      return;
    }
    if (
      filters.minAmount &&
      filters.maxAmount &&
      Number(filters.minAmount) > Number(filters.maxAmount)
    ) {
      toast.error("Minimum amount cannot be greater than maximum amount");
      return;
    }

    // Clear quick filter when using search/drawer
    setActiveFilter(null);

    let filtered = [...transactions];

    if (filters.type === "deposits") {
      filtered = filtered.filter((tx) => Number(tx.credit) > 0);
    }
    if (filters.type === "withdrawals") {
      filtered = filtered.filter((tx) => Number(tx.debit) > 0);
    }
    if (filters.type === "cheques") {
      const chequeTerms = ["cheque", "cheq", "chq", "check"];
      filtered = filtered.filter((tx) =>
        chequeTerms.some((term) =>
          tx.description?.toLowerCase().includes(term)
        )
      );
    }

    if (filters.startDate) {
      filtered = filtered.filter((tx) => tx.date >= filters.startDate);
    }
    if (filters.endDate) {
      filtered = filtered.filter((tx) => tx.date <= filters.endDate);
    }

    if (filters.minAmount) {
      filtered = filtered.filter((tx) => {
        const amount =
          Number(tx.credit) > 0 ? Number(tx.credit) : Number(tx.debit);
        return amount >= Number(filters.minAmount);
      });
    }
    if (filters.maxAmount) {
      filtered = filtered.filter((tx) => {
        const amount =
          Number(tx.credit) > 0 ? Number(tx.credit) : Number(tx.debit);
        return amount <= Number(filters.maxAmount);
      });
    }

    if (searchTerm.trim() !== "") {
      const keyword = searchTerm.trim().toLowerCase();
      filtered = filtered.filter((tx) =>
        tx.description?.toLowerCase().includes(keyword)
      );
    }

    setVisibleCount(50);
    setFilteredTransactions(filtered);
  };

  // ── CLEAR ALL ─────────────────────────────────────────────────
  const clearAllFilters = () => {
    setActiveFilter("14");
    setFilters({
      type: "all",
      startDate: "",
      endDate: "",
      minAmount: "",
      maxAmount: "",
    });
    setSearchTerm("");
    setVisibleCount(50);
    setFilteredTransactions(getQuickFilteredTransactions(transactions, "14"));
  };

  if (!account) {
    return <p className="p-6">Loading account...</p>;
  }

  return (
    <div className="space-y-8 py-6">
      {/* ACCOUNT HEADER */}
      <div className="flex justify-between items-center border-b pb-4">
        <div className="flex items-center gap-2 text-brand font-medium cursor-pointer">
          <span>
            {userName || "User"} ({(account?.account_number || "").slice(-4)})
          </span>
          <ChevronDown size={16} />
        </div>

        {/* ICON PANEL */}
        <div className="flex items-center text-brand text-sm">
          <div
            onClick={() => router.push("/client/accountsdocuments")}
            className="flex flex-col items-center px-6 cursor-pointer hover:underline"
          >
            <FileText size={20} />
            <span className="text-xs mt-1 text-center leading-tight">
              Statements/
              <br />
              Documents
            </span>
          </div>
          <div className="border-l h-10"></div>
          <div className="flex flex-col items-center px-6 cursor-pointer">
            <Mail size={20} />
            <span className="text-xs mt-1 text-center">
              Messages/
              <br />
              Alerts
            </span>
          </div>
          <div className="border-l h-10"></div>
          <div className="flex flex-col items-center px-6 cursor-pointer">
            <Gift size={20} />
            <span className="text-xs mt-1 text-center">
              Offers
              <br />
              For You
            </span>
          </div>
          <div className="border-l h-10"></div>
          <div className="flex flex-col items-center px-6 cursor-pointer">
            <Rocket size={20} />
            <span className="text-xs mt-1 text-center">
              Beyond
              <br />
              Banking
            </span>
          </div>
          <div className="border-l h-10"></div>
          <div className="flex flex-col items-center px-6 cursor-pointer">
            <Printer size={20} />
            <span className="text-xs mt-1 text-center">Print</span>
          </div>
        </div>
      </div>

      {/* BALANCE GRID */}
      <div className="bg-gray-50 border">
        <div className="grid grid-cols-4 items-center">
          <div className="p-3">
            <img
              src="/card-placeholder.png"
              alt="card"
              className="w-44 rounded-md shadow-sm"
            />
          </div>
          <div className="border-l p-2">
            <div className="font-light text-gray-800 text-base flex items-center gap-1">
              Current Balance:
              <HelpCircle size={14} className="text-[var(--client-brand)]" />
            </div>
            <p className="text-lg font-normal text-gray-900 mt-1">
              ${formatMoney(account.balance)}
            </p>
          </div>
          <div className="border-l p-6">
            <div className="font-light text-gray-800 text-base flex items-center gap-1">
              Available Balance:
              <HelpCircle size={16} className="text-[var(--client-brand)]" />
            </div>
            <p className="text-lg font-normal text-gray-900 mt-1">
              ${formatMoney(account.balance)}
            </p>
          </div>
          <div className="border-l p-6">
            <div className="font-light text-gray-800 text-base flex items-center gap-1">
              Authorized Overdraft:
              <HelpCircle size={16} className="text-[var(--client-brand)]" />
            </div>
            <p className="text-lg font-normal text-gray-900 mt-1">$0.00</p>
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="bg-white px-6 py-4 flex justify-between text-[var(--client-brand)] text-sm">
          <div className="flex items-center gap-2 cursor-pointer hover:underline">
            <FileText size={18} />
            View <br /> Statements
          </div>
          <div className="flex items-center gap-2 cursor-pointer hover:underline">
            <Bell size={18} />
            Set Up <br /> Alerts
          </div>
          <div className="flex items-center gap-2 cursor-pointer hover:underline">
            <Receipt size={18} />
            Pay <br /> Bills
          </div>
          <div className="flex items-center gap-2 cursor-pointer hover:underline">
            <Repeat size={18} />
            Transfer <br /> Funds
          </div>
          <div className="flex items-center gap-2 cursor-pointer hover:underline">
            <Send size={18} />
            Interac e- <br />
            Transfer
          </div>
        </div>
      </div>

      {/* TRANSACTIONS HEADER */}
      <div className="flex justify-between items-center text-base text-gray-600">
        <p>Transactions as of {today}</p>
        <button onClick={downloadCSV} className="flex items-center gap-2 text-brand">
          <Download size={18} />
          Download
        </button>
      </div>

      {/* SEARCH */}
      <div className="flex gap-2">
        <input
          placeholder="Search transactions"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 border p-3 text-sm"
        />
        <button
          onClick={applyFiltersAndSearch}
          className="bg-brand hover:bg-brand-hover text-white px-6"
        >
          Search
        </button>
        <button
          onClick={() => setShowFilter(true)}
          className="border border-brand text-brand px-6 flex items-center gap-2"
        >
          <SlidersHorizontal size={18} />
          Filter
        </button>
      </div>

      {/* RESULTS INFO + QUICK DATE FILTERS */}
      <div className="flex items-center justify-between text-gray-600 text-sm mt-4">

        {/* LEFT: count + reset */}
        <div className="flex items-center gap-6">
          <p>
            We found {filteredTransactions.length}{" "}
            {filteredTransactions.length === 1 ? "result" : "results"}.
          </p>
          <button onClick={clearAllFilters} className="text-brand underline">
            Reset
          </button>
        </div>

        {/* RIGHT: 14 days / 30 days / Last Month */}
        <div className="flex items-center gap-3">
          <span className="text-gray-500">Display:</span>
          <button
            onClick={() => applyQuickFilter("14")}
            className={
              activeFilter === "14"
                ? "font-bold text-brand underline"
                : "text-brand hover:underline"
            }
          >
            14 days
          </button>
          <button
            onClick={() => applyQuickFilter("30")}
            className={
              activeFilter === "30"
                ? "font-bold text-black"
                : "text-brand hover:underline"
            }
          >
            30 days
          </button>
          <button
            onClick={() => applyQuickFilter("lastMonth")}
            className={
              activeFilter === "lastMonth"
                ? "font-bold text-brand underline"
                : "text-brand hover:underline"
            }
          >
            Last Month
          </button>
        </div>
      </div>

      <p className="text-gray-600 text-sm mt-2">
        Note: Transactions made today or over the weekend may not show in search
        results.
      </p>

      {/* TABLE */}
      <div className="bg-white border">
        <div className="grid grid-cols-5 border-b py-4 px-3 text-sm font-medium text-gray-700">
          <p>Date</p>
          <p>Description</p>
          <p>Withdrawals</p>
          <p>Deposits</p>
          <p className="text-right">Balance</p>
        </div>

        {transactionsLoading ? (
          <div className="px-3 py-8 text-sm text-gray-600">
            Loading transactions...
          </div>
        ) : (
          filteredTransactions.slice(0, visibleCount).map((tx) => (
            <div
              key={tx.id}
              className="grid grid-cols-5 border-b border-gray-200 py-4 px-3 text-gray-600 text-sm items-center hover:bg-gray-50"
            >
              <p>{formatDate(tx.date)}</p>
              <p>{tx.description}</p>
              <p>{tx.debit ? `-$${formatMoney(tx.debit)}` : ""}</p>
              <p className="text-green-600">
                {tx.credit ? `$${formatMoney(tx.credit)}` : ""}
              </p>
              <p className="text-right">${formatMoney(tx.balance_after)}</p>
            </div>
          ))
        )}
      </div>

      {/* SHOW MORE */}
      <div className="text-center py-6">
        <p className="text-gray-600 mb-4">
          Showing {Math.min(visibleCount, filteredTransactions.length)} of{" "}
          {filteredTransactions.length}{" "}
          {filteredTransactions.length === 1 ? "transaction" : "transactions"}
        </p>
        {visibleCount < filteredTransactions.length && (
          <button
            onClick={() => setVisibleCount((prev) => prev + 50)}
            className="border-2 border-brand text-brand px-10 py-3 hover:bg-gray-50"
          >
            Show More
          </button>
        )}
      </div>

      <FilterDrawer
        show={showFilter}
        onClose={() => setShowFilter(false)}
        filters={filters}
        setFilters={setFilters}
        onApply={() => {
          applyFiltersAndSearch();
          setShowFilter(false);
        }}
        onClear={() => {
          clearAllFilters();
          setShowFilter(false);
        }}
      />
    </div>
  );
}
