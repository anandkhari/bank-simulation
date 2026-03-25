"use client";

import { useState, useRef } from "react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import { 
  UploadCloud, PlusCircle, ChevronDown, ChevronUp, RefreshCw, Loader2 
} from "lucide-react";

const EMPTY_FORM = {
  date: "",
  description: "",
  type: "credit",
  amount: "",
};

export default function UploadTransaction({ accountId, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showManual, setShowManual] = useState(false);
  const fileInputRef = useRef(null);

  /* ----------------------------- */
  /* Date Parsing (Excel → ISO)    */
  /* ----------------------------- */
  function parseExcelDate(value) {
    if (!value) return null;
    try {
      if (typeof value === "number") {
        const parsed = XLSX.SSF.parse_date_code(value);
        if (!parsed) return null;
        const year = parsed.y;
        const month = String(parsed.m).padStart(2, "0");
        const day = String(parsed.d).padStart(2, "0");
        return `${year}-${month}-${day}`;
      }
      if (typeof value === "string") {
        const trimmed = value.trim();
        const parsed = new Date(trimmed);
        if (isNaN(parsed.getTime())) return null;
        return parsed.toISOString().split("T")[0];
      }
      return null;
    } catch {
      return null;
    }
  }

  /* ----------------------------- */
  /* Money Normalization           */
  /* ----------------------------- */
  function parseMoney(value) {
    if (value === null || value === undefined || value === "") return null;
    const number = Number(value);
    if (Number.isNaN(number)) return null;
    return Number(number.toFixed(2));
  }

  /* ----------------------------- */
  /* File Validation               */
  /* ----------------------------- */
  function validateFile(file) {
    if (!file) throw new Error("No file selected");

    const allowedMimes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
    ];
    if (!allowedMimes.includes(file.type)) {
      throw new Error(
        "Unsupported file format. Please upload an Excel (.xlsx) file.",
      );
    }

    const allowedExtensions = ["xlsx", "xls", "csv"];
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!allowedExtensions.includes(extension)) {
      throw new Error("Unsupported file format. Upload Excel or CSV.");
    }
  }

  /* ----------------------------- */
  /* Sheet Parser                  */
  /* ----------------------------- */
  function parseSheet(sheetData, sheetName) {
    const transactions = [];
    let currentDate = null;
    let openingBalance = null;

    for (let rowIndex = 0; rowIndex < sheetData.length; rowIndex++) {
      const row = sheetData[rowIndex];

      if (!row || !Array.isArray(row)) continue;
      if (rowIndex === 0) continue;

      if (rowIndex === 1) {
        openingBalance = parseMoney(row[12]);
        continue;
      }

      if (
        row.every((cell) => cell === null || cell === undefined || cell === "")
      )
        continue;

      const description = row[2];
      if (!description) continue;

      if (String(description).trim().toLowerCase() === "opening balance")
        continue;

      if (row[0]) {
        const parsedDate = parseExcelDate(row[0]);
        if (parsedDate) currentDate = parsedDate;
      }

      if (!currentDate) continue;

      const debit = parseMoney(row[6]);
      const credit = parseMoney(row[9]);
      const balance = parseMoney(row[12]);

      if (debit === null && credit === null) continue;

      const amount = credit !== null ? credit : -(debit ?? 0);
      const type = credit !== null ? "credit" : "debit";

      transactions.push({
        date: currentDate,
        description: String(description).trim(),
        debit: debit ?? 0,
        credit: credit ?? 0,
        amount,
        type,
        balance_after: balance,
        source: "excel_import",
      });
    }

    return { transactions, openingBalance };
  }

  /* ----------------------------- */
  /* Upload Handler                */
  /* ----------------------------- */
  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a statement file");
      return;
    }

    try {
      setUploading(true);

      validateFile(file);

      const buffer = await file.arrayBuffer();

      let workbook;
      try {
        workbook = XLSX.read(buffer, { type: "array", cellDates: false });
      } catch (err) {
        const msg = err?.message?.toLowerCase() || "";
        if (msg.includes("password") || msg.includes("encrypted")) {
          throw new Error(
            "This file is password protected. Please upload an unprotected version.",
          );
        }
        throw new Error(
          "File appears to be corrupt or unreadable. Please check the file and try again.",
        );
      }

      if (workbook.SheetNames.length > 20) {
        throw new Error("Too many sheets in this file. Maximum allowed is 20.");
      }

      const allSheets = [];

      for (const sheetName of workbook.SheetNames) {
        const sheet = workbook.Sheets[sheetName];
        if (!sheet) continue;

        const sheetData = XLSX.utils.sheet_to_json(sheet, {
          header: 1,
          blankrows: false,
        });

        if (!sheetData || sheetData.length < 3) continue;

        const { transactions, openingBalance } = parseSheet(
          sheetData,
          sheetName,
        );

        if (transactions.length === 0) continue;

        allSheets.push({
          sheet_name: sheetName,
          opening_balance: openingBalance,
          transactions,
        });
      }

      if (allSheets.length === 0) {
        throw new Error("No valid transactions found in the file.");
      }

      const response = await fetch("/api/admin/upload-transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          account_id: accountId,
          sheets: allSheets,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Upload failed");
      }

      toast.success(
        `Imported ${result.count} transactions across ${result.statements} statements`,
      );

      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      onUploadSuccess?.();
    } catch (error) {
      console.error("Statement Upload Error:", error);
      toast.error(error.message || "Statement parsing failed");
    } finally {
      setUploading(false);
    }
  };

  /* ----------------------------- */
  /* Manual Transaction Submit     */
  /* ----------------------------- */
  const handleManualSubmit = async () => {
    if (!form.date) return toast.error("Please select a date");
    if (!form.description.trim()) return toast.error("Description is required");
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0)
      return toast.error("Enter a valid amount");

    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    if (form.date < todayStr) {
      return toast.error("Transaction date cannot be in the past");
    }

    const amount = Number(Number(form.amount).toFixed(2));
    const signedAmount = form.type === "credit" ? amount : -amount;

    const transaction = {
      date: form.date,
      description: form.description.trim(),
      type: form.type,
      debit: form.type === "debit" ? amount : 0,
      credit: form.type === "credit" ? amount : 0,
      amount: signedAmount,
    };

    try {
      setSubmitting(true);

      const response = await fetch("/api/admin/upload-transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          account_id: accountId,
          is_manual: true,
          sheets: [
            {
              sheet_name: "manual",
              opening_balance: null,
              transactions: [transaction],
            },
          ],
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to save");

      toast.success("Transaction saved successfully");
      setForm(EMPTY_FORM);
      setShowManual(false);
      onUploadSuccess?.();
    } catch (error) {
      toast.error(error.message || "Failed to save transaction");
    } finally {
      setSubmitting(false);
    }
  };

  /* ----------------------------- */
  /* Recalculate Logic             */
  /* ----------------------------- */
  const handleRecalculate = async () => {
    if (!confirm("Scan and fix math errors in running balances?")) return;
    
    setIsRecalculating(true);
    try {
      const res = await fetch("/api/admin/transactions/recalculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account_id: accountId }),
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success("Balances perfectly synced!");
        onUploadSuccess?.(); // Refreshes the parent table
      } else {
        toast.error(data.error || "Recalculation failed");
      }
    } catch (err) {
      toast.error("Network error while syncing");
    } finally {
      setIsRecalculating(false);
    }
  };

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  /* ----------------------------- */
  /* UI                            */
  /* ----------------------------- */
  return (
    <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-xl">
      <div className="flex flex-col items-center gap-4">
        {/* Drop zone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-brand transition"
        >
          <UploadCloud className="mx-auto text-brand mb-3" size={40} />
          <p className="text-gray-700 font-medium">
            Click here to select your bank statement
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Supports Excel (.xlsx) files only
          </p>
          {file && (
            <p className="text-sm text-green-600 mt-3">Selected: {file.name}</p>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="hidden"
        />

        <button
          onClick={handleUpload}
          disabled={uploading || isRecalculating}
          className="bg-brand hover:bg-brand-hover text-white px-6 py-2 rounded-lg transition disabled:opacity-50"
        >
          {uploading ? "Processing Statement..." : "Upload Statement"}
        </button>
      </div>

      {/* Divider + Actions (Manual Toggle & Sync Math) */}
      <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
        <button
          onClick={() => setShowManual((v) => !v)}
          className="flex items-center gap-2 text-sm text-brand hover:text-brand-hover font-medium transition"
        >
          <PlusCircle size={16} />
          Enter manually
          {showManual ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        <button
          onClick={handleRecalculate}
          disabled={isRecalculating || uploading || submitting}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-purple-600 font-medium transition disabled:opacity-50"
          title="Recalculate and fix all running balances"
        >
          {isRecalculating ? (
            <Loader2 size={14} className="animate-spin text-purple-600" />
          ) : (
            <RefreshCw size={14} />
          )}
          {isRecalculating ? "Recalculating..." : "Recalculate"}
        </button>
      </div>

      {/* Manual form */}
      {showManual && (
        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-3">
          {/* Type toggle */}
          <div>
            <p className="text-xs text-gray-500 mb-2">Transaction type</p>
            <div className="flex gap-2">
              {["credit", "debit"].map((t) => (
                <button
                  key={t}
                  onClick={() => setForm((f) => ({ ...f, type: t }))}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition ${
                    form.type === t
                      ? t === "credit"
                        ? "bg-green-50 text-green-700 border-green-300"
                        : "bg-red-50 text-red-700 border-red-300"
                      : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
                  }`}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Date + Amount */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={set("date")}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Amount</label>
              <input
                type="number"
                value={form.amount}
                onChange={set("amount")}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">
              Description
            </label>
            <input
              type="text"
              value={form.description}
              onChange={set("description")}
              placeholder="e.g. Salary, rent payment..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand"
            />
          </div>

          {/* Cancel + Save */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => {
                setShowManual(false);
                setForm(EMPTY_FORM);
              }}
              className="flex-1 py-2 rounded-lg text-sm border border-gray-200 text-gray-500 hover:border-gray-400 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleManualSubmit}
              disabled={submitting}
              className="flex-1 bg-brand hover:bg-brand-hover text-white py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Save Transaction"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}