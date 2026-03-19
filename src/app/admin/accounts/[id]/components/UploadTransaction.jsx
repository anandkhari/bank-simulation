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

    // MIME type check (not just extension)
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

      // Row 1 (index 0): merged title header → skip
      if (rowIndex === 0) continue;

      // Row 2 (index 1): Opening Balance row
      if (rowIndex === 1) {
        openingBalance = parseMoney(row[12]); // Column M
        continue;
      }

      // Skip fully empty rows
      if (
        row.every((cell) => cell === null || cell === undefined || cell === "")
      )
        continue;

      // Skip section divider rows (merged empty rows mid-sheet)
      const description = row[2];
      if (!description) continue;

      // Skip any stray "Opening Balance" text rows
      if (String(description).trim().toLowerCase() === "opening balance")
        continue;

      // Date: forward fill from column A
      if (row[0]) {
        const parsedDate = parseExcelDate(row[0]);
        if (parsedDate) currentDate = parsedDate;
      }

      if (!currentDate) continue;

      // Parse amounts
      const debit = parseMoney(row[6]); // Column G
      const credit = parseMoney(row[9]); // Column J
      const balance = parseMoney(row[12]); // Column M

      if (debit === null && credit === null) continue;

      // Calculate signed amount and type
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

      // Stage 1: Validate file
      validateFile(file);

      const buffer = await file.arrayBuffer();

      // Stage 1: Catch corrupt or password-protected files
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

      // Stage 1: Sheet count cap
      if (workbook.SheetNames.length > 20) {
        throw new Error("Too many sheets in this file. Maximum allowed is 20.");
      }

      const allSheets = [];

      // Stage 2: Loop through sheets
for (const sheetName of workbook.SheetNames) {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) continue;

  const sheetData = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    blankrows: false,
  });

  if (!sheetData || sheetData.length < 3) continue;

  const { transactions, openingBalance } = parseSheet(sheetData, sheetName);

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

      console.log(
        "[statement-upload] parsed sheets",
        allSheets.map((sheet) => ({
          sheet_name: sheet.sheet_name,
          transaction_count: sheet.transactions.length,
        })),
      );

      // Send to backend API
     const response = await fetch("/api/admin/upload-transactions",  {
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

      // Reset UI
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
          disabled={uploading}
          className="bg-brand hover:bg-brand-hover text-white px-6 py-2 rounded-lg transition disabled:opacity-50"
        >
          {uploading ? "Processing Statement..." : "Upload Statement"}
        </button>
      </div>
    </div>
  );
}
