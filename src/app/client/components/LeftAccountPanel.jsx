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

import FilterDrawer from "@/app/client/components/FilterDrawer";

export default function LeftAccountPanel() {
  const { id } = useParams();

  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [visibleCount, setVisibleCount] = useState(50);

  const [searchTerm, setSearchTerm] = useState("");
  const [showFilter, setShowFilter] = useState(false);

  const [filters, setFilters] = useState({
    type: "all",
    startDate: "",
    endDate: "",
    minAmount: "",
    maxAmount: "",
  });

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

      const { data: txData } = await supabase
        .from("transactions")
        .select("*")
        .eq("account_id", id)
        .order("date", { ascending: false });

      if (txData) {
        setTransactions(txData);
        setFilteredTransactions(txData);
      }

      const { data: user } = await supabase.auth.getUser();

      if (user?.user?.user_metadata?.full_name) {
        setUserName(user.user.user_metadata.full_name);
      }

    };

    loadData();
  }, [id]);

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const formatMoney = (amount) =>
    Number(amount).toFixed(2);

  const applyFiltersAndSearch = () => {
    let filtered = [...transactions];

    if (filters.type === "deposits") {
      filtered = filtered.filter((tx) => tx.credit > 0);
    }

    if (filters.type === "withdrawals") {
      filtered = filtered.filter((tx) => tx.debit > 0);
    }

    if (filters.type === "cheques") {
      filtered = filtered.filter((tx) =>
        tx.description?.toLowerCase().includes("cheque")
      );
    }

    if (filters.startDate) {
      filtered = filtered.filter(
        (tx) => new Date(tx.date) >= new Date(filters.startDate)
      );
    }

    if (filters.endDate) {
      filtered = filtered.filter(
        (tx) => new Date(tx.date) <= new Date(filters.endDate)
      );
    }

    if (filters.minAmount) {
      filtered = filtered.filter(
        (tx) => (tx.credit || tx.debit) >= Number(filters.minAmount)
      );
    }

    if (filters.maxAmount) {
      filtered = filtered.filter(
        (tx) => (tx.credit || tx.debit) <= Number(filters.maxAmount)
      );
    }

    if (searchTerm.trim() !== "") {
      const keyword = searchTerm.toLowerCase();

      filtered = filtered.filter((tx) =>
        tx.description?.toLowerCase().includes(keyword)
      );
    }

    setVisibleCount(50);
    setFilteredTransactions(filtered);
  };

  const clearAllFilters = () => {
    setFilters({
      type: "all",
      startDate: "",
      endDate: "",
      minAmount: "",
      maxAmount: "",
    });

    setSearchTerm("");
    setVisibleCount(50);
    setFilteredTransactions(transactions);
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

          <div className="flex flex-col items-center px-6 cursor-pointer">
            <FileText size={20} />
            <span className="text-xs mt-1 text-center">
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

      {/* CURRENT ACCOUNT CARD */}
      <div className="bg-gray-50 p-5 grid grid-cols-4 gap-6 items-center">

        <img src="/card-placeholder.png" alt="card" className="w-36" />

        <div>
          <p className="text-gray-800 text-sm">Current Balance</p>
          <p className="font-semibold text-gray-800">
            ${formatMoney(account.balance)}
          </p>
        </div>

        <div>
          <p className="text-gray-600 text-sm">Available Balance</p>
          <p className="font-semibold text-gray-800">
            ${formatMoney(account.balance)}
          </p>
        </div>

        <div>
          <p className="text-gray-600 text-sm">Authorized Overdraft</p>
          <p className="font-semibold text-gray-800">$0.00</p>
        </div>

      </div>

      {/* TRANSACTIONS HEADER */}
      <div className="flex justify-between items-center text-base text-gray-600">

        <p>Transactions as of {today}</p>

        <button className="flex items-center gap-2 text-brand">
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

      {/* RESULTS INFO */}
      <div className="flex items-center gap-6 text-gray-600 text-sm mt-4">

        <p>We found {filteredTransactions.length} results.</p>

        <button
          onClick={clearAllFilters}
          className="text-brand underline"
        >
          Reset
        </button>

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

        {filteredTransactions.slice(0, visibleCount).map((tx) => (

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

            <p className="text-right">
              ${formatMoney(tx.balance_after)}
            </p>

          </div>

        ))}

      </div>

      {/* SHOW MORE */}
      <div className="text-center py-6">

        <p className="text-gray-600 mb-4">
          Showing {Math.min(visibleCount, filteredTransactions.length)} of{" "}
          {filteredTransactions.length} transactions
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