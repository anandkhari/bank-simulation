import { NextResponse } from "next/server";
import { generateStatementPDF } from "@/lib/generateStatementPDF";

export async function GET() {
  const account = {
    account_number: "03282 100-140-3",
    name: "MUSIC4CHARITY FOUNDATION",
    address_line1: "51 NEWCASTLE CRT",
    address_line2: "KITCHENER ON N2R 0G7",
  };

  const statement = {
    start_date: "2026-02-19",
    end_date: "2026-03-19",
    opening_bal: -7.51,
    closing_bal: 18.73,
    account_fees: 3.75,
    total_deposits: 30.0,
    total_deposit_count: 1,
    total_debits: 3.76,
    total_debit_count: 2,
  };

  const transactions = [
    {
      date: "2026-02-20",
      description: "e-Transfer received SOHELLYYOIJSUF",
      debit: 0,
      credit: 30.0,
      balance_after: 22.49,
    },
    {
      date: "2026-03-02",
      description: "Monthly fee",
      debit: 3.75,
      credit: 0,
      balance_after: 18.74,
    },
    {
      date: "2026-03-17",
      description: "Overdraft interest @ RBP+05.00%P.A",
      debit: 0.01,
      credit: 0,
      balance_after: 18.73,
    },
  ];

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
