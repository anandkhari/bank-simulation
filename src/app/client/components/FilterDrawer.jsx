"use client";

import { Calendar } from "lucide-react";

export default function FilterDrawer({
  show,
  onClose,
  filters,
  setFilters,
  onApply,
  onClear,
}) {
  return (
    <div
      className={`fixed inset-0 z-50 flex justify-end transition-opacity  duration-800 ${
        show
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      }`}
    >
      {/* OVERLAY */}
      <div
        className={`absolute inset-0 bg-black/30 transition-opacity duration-300 ${
          show ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* DRAWER */}
      <div
        className={`relative w-72 h-full bg-white shadow-xl p-6 overflow-y-auto transform transition-transform duration-300 ease-in-out ${
          show ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6 p-2 shadow-sm">
          <h2 className="text-base tracking-wide text-gray-800">Filter by</h2>

          <button onClick={onClose} className="text-gray-500">
            ✕
          </button>
        </div>

        {/* TRANSACTION TYPE */}
        <div className="mb-8">
          <p className="text-sm font-medium text-gray-600 mb-3">
            Transaction Type
          </p>

          <div className="space-y-2 text-sm text-gray-600">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={filters.type === "all"}
                onChange={() => setFilters({ ...filters, type: "all" })}
              />
              All transactions
            </label>

            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={filters.type === "cheques"}
                onChange={() => setFilters({ ...filters, type: "cheques" })}
              />
              Cheques
            </label>

            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={filters.type === "deposits"}
                onChange={() => setFilters({ ...filters, type: "deposits" })}
              />
              Deposits
            </label>

            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={filters.type === "withdrawals"}
                onChange={() => setFilters({ ...filters, type: "withdrawals" })}
              />
              Withdrawals
            </label>
          </div>
        </div>

        {/* DATE RANGE */}
        {/* DATE RANGE */}
<div className="mb-8">
  <p className="text-sm font-medium text-gray-600 mb-3">Date Range</p>

  <div className="space-y-4">
    {/* START DATE */}
    <div className="relative">
      <input
        type="date"
        value={filters.startDate}
        onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
      />
      <div className="border border-gray-400 p-3 text-sm rounded-lg bg-white flex justify-between items-center hover:border-gray-600 transition">
        <span className={filters.startDate ? "text-gray-800" : "text-gray-500"}>
          {filters.startDate || "YYYY-MM-DD"}
        </span>
        <Calendar size={18} className="text-gray-500" />
      </div>
    </div>

    {/* END DATE */}
    <div className="relative">
      <input
        type="date"
        value={filters.endDate}
        onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
      />
      <div className="border border-gray-400 p-3 text-sm rounded-lg bg-white flex justify-between items-center hover:border-gray-600 transition">
        <span className={filters.endDate ? "text-gray-800" : "text-gray-500"}>
          {filters.endDate || "YYYY-MM-DD"}
        </span>
        <Calendar size={18} className="text-gray-500" />
      </div>
    </div>
  </div>
</div>

        {/* AMOUNT RANGE */}
        <div className="mb-10">
          <p className="text-sm font-medium text-gray-600 mb-4">Amount Range</p>

          <div className="space-y-6">
            <div>
              <p className="text-sm text-gray-600 mb-2">Min.</p>
              <input
                type="number"
                placeholder="$0.00"
                value={filters.minAmount}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    minAmount: e.target.value,
                  })
                }
                className="border w-full p-3 text-sm placeholder-gray-400"
              />
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-2">Max.</p>
              <input
                type="number"
                placeholder="$0.00"
                value={filters.maxAmount}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    maxAmount: e.target.value,
                  })
                }
                className="border w-full p-3 text-sm placeholder-gray-400"
              />
            </div>
          </div>
        </div>

        {/* APPLY */}
        <button
          onClick={onApply}
          className="w-full bg-brand text-white py-3 mb-3"
        >
          Apply
        </button>

        {/* CLEAR */}
        <button
          onClick={onClear}
          className="w-full border border-brand text-brand py-3"
        >
          Clear filters
        </button>
      </div>
    </div>
  );
}
