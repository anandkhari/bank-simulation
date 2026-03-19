import puppeteer from "puppeteer";

export async function generateStatementPDF({ account, statement, transactions }) {

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
function buildHTML({ account, statement, transactions }) {

  const rows = buildTransactionRows(transactions);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; font-size: 11px; color: #000; }

        .header-bar { background: #005DAA; height: 8px; width: 100%; }

        .header { display: flex; justify-content: space-between; padding: 20px 0 10px 0; }
        .header-left { font-size: 10px; line-height: 1.6; }
        .header-left .bank-name { font-weight: bold; font-size: 11px; }
        .header-right { text-align: right; }
        .header-right .title { font-size: 20px; font-weight: bold; margin-bottom: 16px; }
        .header-right .period { font-size: 12px; margin-bottom: 6px; }
        .header-right .account-number { font-size: 11px; }
        .header-right .account-number span { font-weight: bold; }

        .client-info { margin: 20px 0; font-size: 11px; line-height: 1.6; }
        .client-info .name { font-weight: bold; }

        .divider { border-top: 1.5px solid #000; margin: 16px 0 10px 0; }

        .section-title { font-size: 13px; font-weight: bold; margin-bottom: 10px; }

        table { width: 100%; border-collapse: collapse; }
        thead tr th {
          font-size: 10px;
          font-weight: bold;
          padding: 4px 6px;
          border-bottom: 1px solid #000;
          text-align: left;
        }
        thead tr th.right { text-align: right; }

        tbody tr td {
          font-size: 10px;
          padding: 3px 6px;
          vertical-align: top;
        }
        tbody tr td.right { text-align: right; }

        tbody tr.opening td { font-weight: bold; }

        .footer { margin-top: 20px; font-size: 9px; text-align: right; color: #555; }
      </style>
    </head>
    <body>

      <div class="header-bar"></div>

      <div class="header">
        <div class="header-left">
          <div class="bank-name">ROYAL BANK OF CANADA</div>
          <div>P.O. BOX 4047 TERMINAL A</div>
          <div>TORONTO ON  M5W 1L5</div>
        </div>
        <div class="header-right">
          <div class="title">Business Account Statement</div>
          <div class="period">${formatDate(statement.start_date)} to ${formatDate(statement.end_date)}</div>
          <div class="account-number"><span>Account number:</span> ${account.account_number || ""}</div>
        </div>
      </div>

      <div class="client-info">
        <div class="name">${account.account_name || ""}</div>
        <div>${account.address || ""}</div>
      </div>

      <div class="divider"></div>

      <div class="section-title">Account Activity Details</div>

      <table>
        <thead>
          <tr>
            <th style="width:60px">Date</th>
            <th>Description</th>
            <th class="right" style="width:110px">Cheques &amp; Debits($)</th>
            <th class="right" style="width:110px">Deposits &amp; Credits($)</th>
            <th class="right" style="width:80px">Balance</th>
          </tr>
        </thead>
        <tbody>
          <tr class="opening">
            <td></td>
            <td>Opening Balance</td>
            <td></td>
            <td></td>
            <td class="right">${formatMoney(statement.opening_bal)}</td>
          </tr>
          ${rows}
        </tbody>
      </table>

    </body>
    </html>
  `;
}

/* ----------------------------- */
/* Transaction Rows Builder      */
/* ----------------------------- */
function buildTransactionRows(transactions) {
  let lastDate = null;
  return transactions.map((t) => {
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
  }).join("");
}

/* ----------------------------- */
/* Helpers                       */
/* ----------------------------- */
function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-CA", {
    year: "numeric", month: "long", day: "numeric",
  });
}

function formatShortDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-CA", {
    day: "numeric", month: "short",
  });
}

function formatMoney(value) {
  if (value === null || value === undefined) return "";
  return Number(value).toLocaleString("en-CA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}