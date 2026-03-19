import puppeteer from "puppeteer";

export async function generateStatementPDF({
  account,
  statement,
  transactions,
}) {
  const html = buildHTML({ account, statement, transactions });

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });

  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: { top: "20mm", bottom: "20mm", left: "15mm", right: "15mm" },
  });

  await browser.close();

  return pdfBuffer;
}

/* ----------------------------- */
/* HTML Builder                  */
/* ----------------------------- */
export function buildHTML({ account, statement, transactions }) {
  const rows = buildTransactionRows(transactions);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <script src="https://cdn.tailwindcss.com"></script>
      <script>
        tailwind.config = {
          theme: {
            extend: {
              fontFamily: {
                helvetica: ['"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
                serif: ['Cambria', 'Georgia', '"Times New Roman"', 'serif'],
              }
            }
          }
        }
      </script>
      <style>
        @page { size: A4; margin: 0; }
        body { -webkit-print-color-adjust: exact; }
        .no-split { break-inside: avoid; }
        thead th { font-variant-numeric: tabular-nums; }
        tbody td { font-variant-numeric: tabular-nums; }
      </style>
    </head>
    <body class="bg-[#f0f0f0] flex justify-center py-10">
      <div class="w-[210mm] min-h-[297mm] bg-white shadow-lg flex flex-col">

        <!-- Blue top bar: full width, no padding -->
        <div class="bg-[#005DAA] h-10 w-full"></div>

        <!-- Content area with padding -->
        <div class="p-[10mm]">

          <!-- Header: Left + Right columns -->
          <div class="flex justify-between items-start mb-8">

            <!-- LEFT: Logo + Bank address + Reference line + Business address -->
            <div class="w-[42%]">

              <!-- Logo + Bank address -->
              <div class="flex flex-row gap-2 items-start mb-8">
                <img src="/rbc-logo.svg" alt="RBC Logo" class="w-[60px] h-auto" />
                <div class="font-helvetica text-[10px] leading-tight">
                  <strong>ROYAL BANK OF CANADA</strong><br/>
                  P.O. BOX 4047 TERMINAL A<br/>
                  TORONTO ON &nbsp; M5W 1L5
                </div>
              </div>

            <!-- Reference line -->
<p class="text-[9px] text-gray-500 tracking-wide font-mono mb-1">
  RBBDA30000_4780138 E &nbsp; D &nbsp; 03282 &nbsp;&nbsp;&nbsp; 00101
</p>

<!-- Business name & address -->
<div class="font-helvetica text-[13px] font-bold leading-snug">
  <p>1000836779 Ontario Ltd.</p>
  <p>51 NEWCASTLE CRT</p>
  <p>KITCHENER ON N2R 0G7</p>
</div>

            </div>

            <!-- RIGHT: Statement info -->
            <div class="w-[40%] font-helvetica text-black text-[13px]">

              <!-- Title -->
              <h1 class="font-serif text-right text-[20px] font-bold mb-14 leading-tight">
                Business Account Statement
              </h1>

              <!-- Date range -->
              <p class="font-serif text-end text-[14px] mb-2 leading-tight">
                ${formatDate(statement.start_date)} to ${formatDate(statement.end_date)}
              </p>

              <!-- Account number row -->
              <div class="flex justify-between items-baseline py-0.5">
                <span class="font-serif text-[12px] font-bold">Account number:</span>
                <span class="font-serif font-bold tracking-wider text-[12px]">${account.account_number || ""}</span>
              </div>

              <!-- Divider -->
              <hr style="border-color: black; border-top-width: 1px;" class="my-1" />

              <!-- How to reach us -->
              <div class="py-0.5">
                <p class="font-serif text-[12px] font-bold leading-tight">How to reach us:</p>
                <p class="font-serif text-[10px] leading-tight">Please contact your RBC Banking representative or call</p>
                <p class="font-serif text-right text-[12px] leading-tight">1-800-Royal<sup>&#174;</sup>2-0</p>
                <p class="font-serif text-right text-[12px] leading-tight">(1-800-769-2520)</p>
                <p class="font-serif text-right text-[10px] leading-tight">www.rbcroyalbank.com/business</p>
              </div>

              <!-- Bottom divider -->
              <hr style="border-color: black; border-top-width: 1px;" class="mt-1" />

            </div>
          </div>

          <!-- ── Account Summary Section ── -->
          <div class="border-t-2 border-black mb-3 w-[60%]"></div>
          <!-- ── Account Summary Section ── -->

<div class="max-w-[60%] mb-14">
  <h2 class="font-serif text-[16px] font-bold mb-3">Account Summary for this Period</h2>

  <!-- Account type label -->
  <p class="font-helvetica text-[10px] font-bold mb-0.5">Royal Business Account &#174;</p>

  <!-- Branch name & address -->
  <p class="font-helvetica text-[11px] font-bold leading-tight">${statement.branch_name || "Royal Bank of Canada"}</p>
  <p class="font-helvetica text-[10px] leading-tight mb-3">${statement.branch_address || ""}</p>

  <!-- Summary rows -->
  <table class="w-full border-collapse table-fixed mb-6">
    <tbody class="font-helvetica text-[10px]">

      <tr class="border-b border-gray-300">
        <td class="py-1">Opening Balance on ${formatDate(statement.start_date)}</td>
        <td class="py-1 text-right">${formatMoney(statement.opening_bal)}</td>
      </tr>

      <tr class="border-b border-gray-300">
        <td class="py-1">Total deposits &amp; credits (${statement.total_deposit_count || ""})</td>
        <td class="py-1 text-right">+ ${formatMoney(statement.total_deposits)}</td>
      </tr>

      <tr class="border-b-2 border-gray-800">
        <td class="py-1">Total cheques &amp; debits (${statement.total_debit_count || ""})</td>
        <td class="py-1 text-right">- ${formatMoney(statement.total_debits)}</td>
      </tr>

      <tr>
        <td class="py-1 font-bold">Closing balance on ${formatDate(statement.end_date)}</td>
        <td class="py-1 font-bold text-right">= ${formatMoney(statement.closing_bal)}</td>
      </tr>

    </tbody>
  </table>
</div>

          <!-- ── Account Activity Section ── -->
          <div class="border-t-2 border-black mb-3"></div>
          <h2 class="font-helvetica text-[16px] font-bold  mb-4">Account Activity Details</h2>

          <table class="w-full border-collapse table-fixed">
            <thead>
              <tr class=" border-b-2 border-black text-[10px] font-bold">
                <th class="font-helvetica w-[12%] py-2 text-left">Date</th>
                <th class="font-helvetica w-[43%] py-2 text-left">Description</th>
                <th class="font-helvetica w-[15%] py-2 text-right">Cheques & Debits($)</th>
                <th class="font-helvetica w-[15%] py-2 text-right">Deposits & Credits($)</th>
                <th class="font-helvetica w-[15%] py-2 text-right">Balance</th>
              </tr>
            </thead>
            <tbody class="font-helvetica text-[10px]">
              <tr class="font-bold border-b border-black bg-gray-50">
                <td class="py-2"></td>
                <td class="font-helvetica py-2">Opening Balance</td>
                <td class="py-2"></td>
                <td class="py-2"></td>
                <td class="font-helvetica py-2 text-right">${formatMoney(statement.opening_bal)}</td>
              </tr>
              ${rows}
            </tbody>
          </table>

        </div>
      </div>
    </body>
    </html>
  `;
}
/* ----------------------------- */
/* Transaction Rows Builder      */
/* ----------------------------- */
function buildTransactionRows(transactions) {
  let lastDate = null;
  return transactions
    .map((t) => {
      const dateLabel = t.date !== lastDate ? formatShortDate(t.date) : "";
      lastDate = t.date;
      return `
      <tr>
        <td>${dateLabel}</td>
        <td>${t.description}</td>
        <td class="right">${t.debit > 0 ? formatMoney(t.debit) : ""}</td>
        <td class="right">${t.credit > 0 ? formatMoney(t.credit) : ""}</td>
        <td class="right">${formatMoney(t.balance_after)}</td>
      </tr>
    `;
    })
    .join("");
}

/* ----------------------------- */
/* Helpers                       */
/* ----------------------------- */
function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatShortDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-CA", {
    day: "numeric",
    month: "short",
  });
}

function formatMoney(value) {
  if (value === null || value === undefined) return "";
  return Number(value).toLocaleString("en-CA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
