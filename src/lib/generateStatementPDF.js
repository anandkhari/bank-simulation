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
      <style>
        /* Specific print-media overrides */
        @page { size: A4; margin: 0; }
        body { -webkit-print-color-adjust: exact; }
        .no-split { break-inside: avoid; }

        /* 1. Headings */
h1, .section-title {
  font-family: "Helvetica Neue", Helvetica, sans-serif;
  font-weight: 700;
  letter-spacing: -0.02em;
}

/* 2. Table Headers/Labels */
thead th {
  font-family: "Helvetica Neue", Helvetica, sans-serif;
  font-weight: 700;
  font-size: 10px;
  text-transform: none; /* RBC uses standard case for headers usually */
}

/* 3. Transaction Content */
tbody td {
  font-family: Arial, sans-serif; /* Arial is slightly narrower, good for data */
  font-weight: 400;
  font-size: 10px;
  font-variant-numeric: tabular-nums; /* Makes numbers line up perfectly */
}
      </style>
    </head>
    <body class="bg-[#f0f0f0] flex justify-center py-10">
      <div class="w-[210mm] min-h-[297mm] bg-white p-[15mm] shadow-lg">
        
    
        <div class="bg-[#005DAA] h-2 w-full mb-8"></div>


        <div class="flex justify-between items-start mb-8">
          <div class="flex flex-row gap-2">
            <img src="/rbc-logo.svg" alt="RBC Logo" class="w-12 h-auto" />
            <div class="text-[9px] leading-tight text-gray-800">
              <strong class="text-[10px]">ROYAL BANK OF CANADA</strong><br/>
              P.O. BOX 4047 TERMINAL A<br/>
              TORONTO ON M5W 1L5
            </div>
          </div>
          
          <div class="text-right  max-w-[300px]">
            <h1 class="text-xl font-bold  mb-2">Business Account Statement</h1>
            <p class="text-[11px] mt-20 mb-4">${formatDate(statement.start_date)} to ${formatDate(statement.end_date)}</p>
            <p class="text-[11px] font-bold">Account number: <span class="font-normal">${account.account_number || ""}</span></p>
            
          </div>
        </div>


        <div class="mb-6 text-[11px] leading-normal">
          <p class="font-bold text-[12px]">${account.account_name || ""}</p>
          <p class="text-gray-700">${account.address || "No address provided"}</p>
        </div>

        <div class="border-t-2 border-black mb-4"></div>

        <h2 class="text-[13px] font-bold uppercase mb-4">Account Activity Details</h2>


        <table class="w-full border-collapse table-fixed">
          <thead>
            <tr class="border-t-2 border-b-2 border-black text-[10px] font-bold">
              <th class="w-[12%] py-2 text-left">Date</th>
              <th class="w-[43%] py-2 text-left">Description</th>
              <th class="w-[15%] py-2 text-right">Cheques & Debits($)</th>
              <th class="w-[15%] py-2 text-right">Deposits & Credits($)</th>
              <th class="w-[15%] py-2 text-right">Balance</th>
            </tr>
          </thead>
          <tbody class="text-[10px]">
         
            <tr class="font-bold border-b border-black bg-gray-50">
              <td class="py-2"></td>
              <td class="py-2">Opening Balance</td>
              <td class="py-2"></td>
              <td class="py-2"></td>
              <td class="py-2 text-right">${formatMoney(statement.opening_bal)}</td>
            </tr>
            ${rows}
          </tbody>
        </table>
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
