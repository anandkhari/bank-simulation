"use client";

import { useState, useRef } from "react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import { UploadCloud } from "lucide-react";

export default function UploadTransaction({ accountId, onUploadSuccess }) {

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  /* ----------------------------- */
  /* Date Parsing (Excel → ISO)    */
  /* ----------------------------- */

  function parseExcelDate(value) {

    if (!value) return null;

    try {

      /* Excel numeric date */
      if (typeof value === "number") {

        const parsed = XLSX.SSF.parse_date_code(value);

        if (!parsed) return null;

        const year = parsed.y;
        const month = String(parsed.m).padStart(2, "0");
        const day = String(parsed.d).padStart(2, "0");

        return `${year}-${month}-${day}`;
      }

      /* String date */
      if (typeof value === "string") {

        const trimmed = value.trim();

        const parsed = new Date(trimmed);

        if (isNaN(parsed.getTime())) {
          return null;
        }

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

    if (value === null || value === undefined || value === "") {
      return null;
    }

    const number = Number(value);

    if (Number.isNaN(number)) {
      return null;
    }

    return Number(number.toFixed(2));
  }

  /* ----------------------------- */
  /* Transaction Parser            */
  /* ----------------------------- */

  function parseTransactions(sheetData) {

    const transactions = [];
    let currentDate = null;

    for (const row of sheetData) {

      if (!row || !Array.isArray(row)) continue;

      /* ----------------------------- */
      /* Detect Date                   */
      /* ----------------------------- */

      if (row[0]) {

        const parsedDate = parseExcelDate(row[0]);

        if (parsedDate) {
          currentDate = parsedDate;
        } else {
          /* Skip header rows like:
             "Details of your account activity" */
          continue;
        }
      }

      if (!currentDate) continue;

      /* ----------------------------- */
      /* Description                   */
      /* ----------------------------- */

      const description = row[2];

      if (!description) continue;

      /* ----------------------------- */
      /* Parse transaction             */
      /* ----------------------------- */

      const debit = parseMoney(row[6]);
      const credit = parseMoney(row[9]);
      const balance = parseMoney(row[12]);

      if (debit === null && credit === null) continue;

      transactions.push({
        date: currentDate,
        description: String(description).trim(),
        debit,
        credit,
        balance_after: balance
      });

    }

    return transactions;
  }

  /* ----------------------------- */
  /* File Validation               */
  /* ----------------------------- */

  function validateFile(file) {

    if (!file) {
      throw new Error("No file selected");
    }

    const allowed = ["xlsx", "xls", "csv"];
    const extension = file.name.split(".").pop()?.toLowerCase();

    if (!allowed.includes(extension)) {
      throw new Error("Unsupported file format. Upload Excel or CSV.");
    }
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

      const workbook = XLSX.read(buffer, {
        type: "array",
        cellDates: false
      });

      const allTransactions = [];

      /* ----------------------------- */
      /* Loop through sheets           */
      /* ----------------------------- */

      for (const sheetName of workbook.SheetNames) {

        const sheet = workbook.Sheets[sheetName];

        if (!sheet) continue;

        const sheetData = XLSX.utils.sheet_to_json(sheet, {
          header: 1,
          blankrows: false
        });

        if (!sheetData || sheetData.length < 2) continue;

        const sheetTransactions = parseTransactions(sheetData);

        if (sheetTransactions.length > 0) {
          allTransactions.push(...sheetTransactions);
        }
      }

      if (allTransactions.length === 0) {
        throw new Error("No valid transactions found in the statement");
      }

      /* ----------------------------- */
      /* Send to API                   */
      /* ----------------------------- */

      const response = await fetch("/api/admin/upload-statement", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          account_id: accountId,
          transactions: allTransactions
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Upload failed");
      }

      toast.success(`Imported ${result.count} transactions`);

      /* ----------------------------- */
      /* Reset UI                      */
      /* ----------------------------- */

      setFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      onUploadSuccess?.();

    } catch (error) {

      console.error("Statement Upload Error:", error);
      toast.error(error.message || "Statement parsing failed");

    } finally {

      setUploading(false);

    }
  };

  /* ----------------------------- */
  /* UI                            */
  /* ----------------------------- */

  return (

    <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-xl">

      <div className="flex flex-col items-center gap-4">

        <div
          onClick={() => fileInputRef.current?.click()}
          className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-brand transition"
        >

          <UploadCloud className="mx-auto text-brand mb-3" size={40} />

          <p className="text-gray-700 font-medium">
            Click here to select your bank statement
          </p>

          <p className="text-sm text-gray-500 mt-1">
            Supports Excel (.xlsx, .xls) and CSV files
          </p>

          {file && (
            <p className="text-sm text-green-600 mt-3">
              Selected: {file.name}
            </p>
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
          disabled={uploading}
          className="bg-brand hover:bg-brand-hover text-white px-6 py-2 rounded-lg transition disabled:opacity-50"
        >
          {uploading ? "Processing Statement..." : "Upload Statement"}
        </button>

      </div>

    </div>
  );
}