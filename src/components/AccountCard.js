"use client";

import Link from "next/link";

export default function AccountCard({ account }) {
  return (
    <div
      style={{
        border: "1px solid #ddd",
        padding: 20,
        marginBottom: 20,
      }}
    >
      <h3>{account.account_name}</h3>

      <p>Account Number: {account.account_number}</p>

      <p>Balance: {account.balance} {account.currency}</p>

      <Link href={`/accounts/${account.id}`}>
        View Account
      </Link>
    </div>
  );
}