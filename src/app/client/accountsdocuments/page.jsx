"use client";

import { useState, useEffect,useRef } from "react";
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
  "Aug",
  "September",
  "October",
  "November",
  "December",
];

export default function AccountDocuments() {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [selectedType, setSelectedType] = useState(
    "Statements & general documents",
  );
  const [month, setMonth] = useState("All Months");
  const [year, setYear] = useState("Select");

  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [statements, setStatements] = useState([]);
  const [error, setError] = useState("");

  const currentYear = new Date().getFullYear();
  const years = [
    "Select",
    ...Array.from({ length: 7 }, (_, i) => String(currentYear - i)),
  ];

  const [userName, setUserName] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("name")
          .eq("id", user.id)
          .single();

        setUserName(profile?.name);
      }
    };
    fetchUser();
  }, []);

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

      const { data, error: fetchError } = await query.order("start_date", {
        ascending: false,
      });

      if (fetchError) throw fetchError;

      setStatements(data || []);
      setSearched(true);
    } catch (err) {
      console.error("Error fetching statements:", err);
      setError(
        "Something went wrong while fetching documents. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (url, filename) => {
    const response = await fetch(url);
    const blob = await response.blob();
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename || "statement.pdf";
    link.click();
    URL.revokeObjectURL(link.href);
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

      <div className="max-w-6xl mx-auto px-4 py-20">
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
              <div className="mt-12 max-w-3xl">
                {statements.length === 0 ? (
                  <div className="text-center py-16 border border-gray-200 bg-gray-50">
                    <FileText
                      size={40}
                      className="mx-auto text-gray-300 mb-4"
                    />
                    <p className="text-gray-500 text-[15px]">
                      No documents found for the selected filters.
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-gray-500 mb-6">
                      Current view: {statements.length}{" "}
                      {statements.length === 1 ? "result" : "results"} for this
                      search
                    </p>

                    <table className="w-full border-collapse">
                      <thead>
                        {/* Applied border-t-2 and border-b-2 for the heavy lines. 
      Using border-gray-900 (or border-black) to match the high-contrast bank style.
    */}
                        <tr className="border-t-1 border-b-2 border-gray-600">
                          <th className="text-left text-[14px] font-semidold text-gray-900 py-5 pr-8">
                            Account
                          </th>
                          <th className="text-left text-[14px] font-semibold text-gray-900 py-5 pr-8">
                            Date
                          </th>
                          <th className="text-left text-[14px] font-semibold text-gray-900 py-5">
                            Document
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-gray-100">
                        {statements.map((stmt) => (
                          <tr
                            key={stmt.id}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="py-5 pr-8 text-[14px] text-gray-700">
                              {userName}
                            </td>
                            <td className="py-5 pr-8 text-[14px] text-gray-700">
                              {formatDate(stmt.start_date)}
                            </td>
                            <td className="py-5">
                              <div className="flex flex-col gap-1">
                                <span className="text-[14px] text-gray-700">
                                  Statement
                                </span>
                                <button
                                  onClick={() =>
                                    handleDownload(
                                      stmt.file_url,
                                      `${stmt.month}_${stmt.year}_statement.pdf`,
                                    )
                                  }
                                  className="flex items-center cursor-pointer gap-1.5 text-blue-600 hover:underline text-[14px] font-medium w-fit"
                                >
                                  PDF
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    <polyline points="7 10 12 15 17 10" />
                                    <line x1="12" y1="15" x2="12" y2="3" />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>

                      {/* Added a footer to close the table with the same heavy line seen in statements */}
                      <tfoot>
                        <tr>
                          <td
                            colSpan={3}
                            className="border-t-1 border-gray-600 py-2"
                          ></td>
                        </tr>
                      </tfoot>
                    </table>
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
  const [dropUp, setDropUp] = useState(false); // Track direction
  const containerRef = useRef(null);

  const toggleDropdown = () => {
    if (!open && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const dropdownHeight = 240; // This should match your max-h-60 (60 * 4px)

      // If space below is less than dropdown height, drop up
      setDropUp(spaceBelow < dropdownHeight);
    }
    setOpen(!open);
  };

  return (
    <div className="relative" ref={containerRef}>
      <div
        onClick={toggleDropdown}
        className="border border-gray-400 p-4 flex justify-between items-center cursor-pointer hover:border-gray-600 bg-white h-[52px] relative z-10"
      >
        <span className="text-gray-600 text-[15px]">{value || "Select"}</span>
        <ChevronDown
          size={20}
          className={`text-brand transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </div>

      <div
        className={`absolute left-0 right-0 bg-white border border-gray-300 z-50 shadow-lg transition-all duration-200 ease-out 
          ${dropUp ? "bottom-full mb-1 origin-bottom" : "top-full mt-1 origin-top"}
          ${open 
            ? "opacity-100 translate-y-0 scale-100 pointer-events-auto" 
            : `opacity-0 ${dropUp ? "translate-y-2" : "-translate-y-2"} scale-95 pointer-events-none`
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
