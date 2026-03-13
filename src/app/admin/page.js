"use client";

import Link from "next/link";
import {
  UserPlus,
  Users,
  CreditCard,
  ArrowRightLeft,
} from "lucide-react";

export default function AdminDashboard() {

  const cards = [
    {
      title: "Create Customer",
      description: "Add a new banking customer",
      href: "/admin/create-customer",
      icon: <UserPlus size={22} />,
    },
    {
      title: "View Customers",
      description: "See all registered customers",
      href: "/admin/customers",
      icon: <Users size={22} />,
    },
    // {
    //   title: "Create Account",
    //   description: "Assign a bank account to a user",
    //   href: "/admin/create-account",
    //   icon: <CreditCard size={22} />,
    // },
    // {
    //   title: "Transactions",
    //   description: "Manage banking transactions",
    //   href: "/admin/transactions",
    //   icon: <ArrowRightLeft size={22} />,
    // },
  ];

  return (
    <main className="min-h-screen bg-gray-50 px-10 py-12">

      {/* HEADER */}
      <div className="mb-12">
        <h1 className="text-3xl font-semibold text-gray-800">
          Admin Dashboard
        </h1>

        <p className="text-gray-500 mt-2">
          Manage customers, accounts and banking transactions
        </p>
      </div>

      {/* DASHBOARD GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 max-w-4xl">

        {cards.map((card, index) => (
          <Link
            key={index}
            href={card.href}
            className="group p-6 bg-white border border-gray-200 rounded-xl hover:shadow-lg transition-all duration-200 hover:border-brand"
          >

            {/* ICON */}
            <div className="w-10 h-10 flex items-center justify-center bg-brand/10 text-brand rounded-lg mb-4">
              {card.icon}
            </div>

            {/* TITLE */}
            <h2 className="text-lg font-semibold text-gray-800 group-hover:text-brand">
              {card.title}
            </h2>

            {/* DESCRIPTION */}
            <p className="text-sm text-gray-500 mt-1">
              {card.description}
            </p>

          </Link>
        ))}

      </div>

    </main>
  );
}