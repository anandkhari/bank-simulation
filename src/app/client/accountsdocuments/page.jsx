"use client";

import { useState, useEffect } from "react";
import { ChevronDown, FileText, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import ClientHeader from "../components/ClientHeader";
import AccountSummaryFooter from "../components/AccountSummaryFooter";

const months = [
  "All Months",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function AccountDocuments() {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [selectedType, setSelectedType] = useState("Statements & general documents");
  const [month, setMonth] = useState("All Months");
  const [year, setYear] = useState("Select");

  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [statements, setStatements] = useState([]);
  const [error, setError] = useState("");

  const currentYear = new Date().getFullYear();
  const years = ["Select", ...Array.from({ length: 7 }, (_, i) => String(currentYear - i))];

  // ── LOAD USER ACCOUNTS ──────────────────────────────────────
  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData?.session) return;

        const userId = sessionData.session.user.id;

        const { data: accountData, error } = await supabase
          .from("accounts")
          .select("*")
          .eq("user_id", userId);

        if (error) throw error;

        if (accountData) {
          const sorted = accountData.sort((a, b) => {
            if (a.account_type?.toLowerCase().includes("chequing")) return -1;
            if (b.account_type?.toLowerCase().includes("chequing")) return 1;
            return 0;
          });
          setAccounts(sorted);
        }
      } catch (err) {
        console.error("Error loading accounts:", err);
      }
    };

    loadAccounts();
  }, []);

  // ── SHOW DOCUMENTS ──────────────────────────────────────────
  const handleShowDocuments = async () => {
    setError("");
    setStatements([]);
    setSearched(false);

    // Validation
    if (!selectedAccount) {
      setError("Please select an account.");
      return;
    }
    if (year === "Select") {
      setError("Please select a year.");
      return;
    }

    setLoading(true);

    try {
      let query = supabase
        .from("statements")
        .select("*")
        .eq("account_id", selectedAccount.id)
        .eq("year", year);

      // Only filter by month if not "All Months"
      if (month !== "All Months") {
        query = query.eq("month", month);
      }

      const { data, error: fetchError } = await query.order("start_date", { ascending: false });

      if (fetchError) throw fetchError;

      setStatements(data || []);
      setSearched(true);
    } catch (err) {
      console.error("Error fetching statements:", err);
      setError("Something went wrong while fetching documents. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── OPEN PDF ─────────────────────────────────────────────────
  const handleOpenPDF = async (fileUrl) => {
    try {
      // If it's already a full public URL, open directly
      if (fileUrl.startsWith("http")) {
        window.open(fileUrl, "_blank");
        return;
      }

      // Otherwise generate a signed URL from Supabase storage
      const { data, error } = await supabase.storage
        .from("statements")
        .createSignedUrl(fileUrl, 60 * 60); // 1 hour expiry

      if (error) throw error;

      window.open(data.signedUrl, "_blank");
    } catch (err) {
      console.error("Error opening PDF:", err);
      setError("Could not open the document. Please try again.");
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      <ClientHeader />

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row gap-16 items-start">

          {/* LEFT SIDEBAR */}
          <div className="w-full md:w-64 flex-shrink-0 mt-48">
            <h2 className="text-[17px] font-medium text-gray-800 mb-6 px-1">
              Your Documents
            </h2>

            <nav className="flex flex-col border-t border-gray-300">
              <div className="relative border-b border-gray-300">
                <div className="absolute left-0 top-[15%] bottom-[15%] w-[4px] bg-brand" />
                <button className="w-full text-left pl-8 pr-4 py-5 text-brand text-[15px]">
                  Account Documents
                </button>
              </div>

              <div className="border-b border-gray-300">
                <button className="w-full text-left pl-8 pr-4 py-5 text-[#006ac3] hover:underline text-[15px]">
                  Fee Statements
                </button>
              </div>
            </nav>
          </div>

          {/* RIGHT CONTENT */}
          <div className="flex-1 w-full">
            <h1 className="text-[32px] md:text-[40px] font-light text-gray-700 mb-10">
              Account Documents
            </h1>

            <div className="mb-10 space-y-1">
              <button className="block text-[14px] text-brand hover:underline">
                Manage document delivery preferences
              </button>
              <button className="block text-[14px] text-brand hover:underline">
                Frequently asked questions about eDocuments
              </button>
            </div>

            <div className="max-w-xl space-y-8">

              {/* TYPE */}
              <Field label="What documents are you looking for?">
                <SelectBox
                  value={selectedType}
                  options={["Statements & general documents"]}
                  onChange={setSelectedType}
                />
              </Field>

              {/* ACCOUNTS */}
              <Field label="Accounts">
                <SelectBox
                  value={
                    selectedAccount
                      ? `${selectedAccount.account_number} - ${selectedAccount.account_name}`
                      : "Select account"
                  }
                  options={accounts}
                  onChange={setSelectedAccount}
                  renderOption={(acc) =>
                    `${acc.account_number} - ${acc.account_name}`
                  }
                />
              </Field>

              {/* MONTH + YEAR */}
              <div className="flex gap-6">
                <div className="w-[250px]">
                  <Field label="Month">
                    <SelectBox
                      value={month}
                      options={months}
                      onChange={setMonth}
                    />
                  </Field>
                </div>

                <div className="w-[150px]">
                  <Field label="Year">
                    <SelectBox
                      value={year}
                      options={years}
                      onChange={setYear}
                    />
                  </Field>
                </div>
              </div>

              <p className="text-[16px] text-gray-500">
                Up to 7 years of documents are available
              </p>

              {/* ERROR */}
              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 px-4 py-3 rounded">
                  <AlertCircle size={16} className="flex-shrink-0" />
                  {error}
                </div>
              )}

              <button
                onClick={handleShowDocuments}
                disabled={loading}
                className="bg-brand text-white px-12 py-3.5 font-semibold text-[16px] disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading && <Loader2 size={18} className="animate-spin" />}
                {loading ? "Loading..." : "Show Documents"}
              </button>
            </div>

            {/* ── RESULTS ── */}
            {searched && (
              <div className="mt-12 max-w-2xl">
                {statements.length === 0 ? (
                  <div className="text-center py-16 border border-gray-200 bg-gray-50">
                    <FileText size={40} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 text-[15px]">
                      No documents found for the selected filters.
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-gray-500 mb-4">
                      {statements.length} {statements.length === 1 ? "document" : "documents"} found
                    </p>

                    <div className="border border-gray-200 divide-y divide-gray-100">
                      {statements.map((stmt) => (
                        <div
                          key={stmt.id}
                          onClick={() => handleOpenPDF(stmt.file_url)}
                          className="flex items-center justify-between px-6 py-5 hover:bg-gray-50 cursor-pointer group transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <FileText
                              size={22}
                              className="text-brand flex-shrink-0"
                            />
                            <div>
                              <p className="text-[15px] font-medium text-gray-800 group-hover:text-brand transition-colors">
                                {stmt.month} {stmt.year} Statement
                              </p>
                              <p className="text-[13px] text-gray-400 mt-0.5">
                                {formatDate(stmt.start_date)} – {formatDate(stmt.end_date)}
                                {stmt.opening_bal != null && stmt.closing_bal != null && (
                                  <span className="ml-3">
                                    · Opening ${Number(stmt.opening_bal).toFixed(2)} → Closing ${Number(stmt.closing_bal).toFixed(2)}
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>

                          <span className="text-brand text-[13px] font-medium group-hover:underline flex-shrink-0">
                            View PDF
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <AccountSummaryFooter />
    </div>
  );
}

/* ── FIELD WRAPPER ─────────────────────────────────────────── */
function Field({ label, children }) {
  return (
    <div className="space-y-1">
      <label className="block text-[16px] text-gray-800">{label}</label>
      {children}
    </div>
  );
}

/* ── SELECT BOX ────────────────────────────────────────────── */
function SelectBox({ value, options = [], onChange, renderOption }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <div
        onClick={() => setOpen(!open)}
        className="border border-gray-400 p-4 flex justify-between items-center cursor-pointer hover:border-gray-600 bg-white h-[52px] relative z-10"
      >
        <span className="text-gray-600 text-[15px]">{value || "Select"}</span>
        <ChevronDown
          size={20}
          className={`text-brand transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </div>

      <div
        className={`absolute left-0 right-0 bottom-full mb-1 bg-white border border-gray-300 z-50 shadow-lg origin-bottom transition-all duration-200 ease-out ${
          open
            ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
            : "opacity-0 translate-y-2 scale-95 pointer-events-none"
        }`}
      >
        <div className="flex flex-col max-h-60 overflow-y-auto">
          {options.map((opt, i) => (
            <div
              key={opt.id || i}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className="p-3 hover:bg-gray-100 cursor-pointer text-[15px] text-gray-700 border-b border-gray-100 last:border-b-0"
            >
              {renderOption ? renderOption(opt) : opt}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}