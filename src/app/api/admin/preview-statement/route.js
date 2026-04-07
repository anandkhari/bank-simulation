import { NextResponse } from "next/server";
import { generateStatementPDF } from "@/lib/generateStatementPDF";

export async function GET() {
  const account = {
    account_number: "03282 100-140-3",
    name: "1000836779 Ontario Ltd.",
    address_line1: "51 NEWCASTLE CRT",
    address_line2: "KITCHENER ON N2R 0G7",
  };

  const statement = {
    start_date: "2026-02-20",
    end_date: "2026-03-19",
    opening_bal: 3072.46,
    closing_bal: 3718.45,
    total_deposits: 40362.94,
    total_deposit_count: 39,
    total_debits: 39716.95,
    total_debit_count: 20,
  };

  // Generating 65 dummy transactions to test pagination (15 on P1, ~39 on P2, remainder on P3)
  const transactions = Array.from({ length: 65 }, (_, i) => {
    const isDebit = i % 3 === 0; // Create a mix of debits and credits
    const amount = parseFloat((Math.random() * 1000 + 10).toFixed(2));
    
    return {
      date: i < 30 ? "2026-01-20" : i < 55 ? "2026-01-21" : "2026-01-22",
      description: isDebit 
        ? `ATM Withdrawal - ${Math.random().toString(36).substring(7).toUpperCase()}`
        : `e-Transfer - Autodeposit ${i % 2 === 0 ? "ABUL AZAD" : "RINI MOLLAH"}`,
      debit: isDebit ? amount : 0,
      credit: isDebit ? 0 : amount,
      balance_after: 5000.00 + i * 10, // Dummy incrementing balance
    };
  });

  try {
    const pdfBuffer = await generateStatementPDF({ account, statement, transactions });

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline; filename=rbc-statement-test.pdf",
      },
    });
  } catch (err) {
    console.error("Preview error:", err);
    return new NextResponse(`PDF generation failed: ${err.message}`, { status: 500 });
  }
}