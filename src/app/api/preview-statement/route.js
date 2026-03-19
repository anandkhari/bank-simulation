import { buildHTML } from "@/lib/generateStatementPDF";

export async function GET(req) {
  // Dummy data matching your interface
  const dummyData = {
    account: { account_name: "Anand K Hari", account_number: "06531-9061228", address: "123 Tech St, Toronto" },
    statement: { start_date: "2025-04-01", end_date: "2025-04-30", opening_bal: 3195.19 },
    transactions: [
        { date: "2025-04-18", description: "Deposit Stripe, Inc.", debit: 0, credit: 2904.23, balance_after: 6099.42 }
    ]
  };

  const html = buildHTML(dummyData);

  return new Response(html, {
    headers: { "Content-Type": "text/html" },
  });
}
