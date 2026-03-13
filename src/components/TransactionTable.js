"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function TransactionTable({ accountId }) {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    loadTransactions();
  }, []);

  async function loadTransactions() {
    const { data } = await supabase
      .from("transactions")
      .select("*")
      .eq("account_id", accountId)
      .order("date", { ascending: false });

    setTransactions(data);
  }

  return (
    <table border="1" cellPadding="10">
      <thead>
        <tr>
          <th>Date</th>
          <th>Description</th>
          <th>Debit</th>
          <th>Credit</th>
          <th>Balance</th>
        </tr>
      </thead>

      <tbody>
        {transactions.map((t) => (
          <tr key={t.id}>
            <td>{t.date}</td>
            <td>{t.description}</td>
            <td>{t.debit}</td>
            <td>{t.credit}</td>
            <td>{t.balance_after}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}