"use client";

export default function FilterDrawer({
  show,
  onClose,
  filters,
  setFilters,
  onApply,
  onClear
}) {

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end ">

      {/* OVERLAY */}
      <div
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
      />

      {/* DRAWER */}
      <div className="relative w-72 h-full bg-white shadow-xl p-6 overflow-y-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6 p-2 shadow-sm">
          <h2 className="text-base tracking-wide text-gray-800">Filter by</h2>

          <button
            onClick={onClose}
            className="text-gray-500"
          >
            ✕
          </button>
        </div>

        {/* TRANSACTION TYPE */}
        <div className="mb-8">

          <p className="text-sm font-medium text-gray-600 mb-3">
            Transaction Type
          </p>

          <div className="space-y-2 text-sm">

            <label className="flex items-center  text-gray-600  gap-2">
              <input
                type="radio"
                name="type"
                checked={filters.type === "all"}
                onChange={() =>
                  setFilters({ ...filters, type: "all" })
                }
              />
              All transactions
            </label>

            <label className="flex items-center  text-gray-600  gap-2">
              <input
                type="radio"
                name="type"
                checked={filters.type === "cheques"}
                onChange={() =>
                  setFilters({ ...filters, type: "cheques" })
                }
              />
              Cheques
            </label>

            <label className="flex items-center  text-gray-600  gap-2">
              <input
                type="radio"
                name="type"
                checked={filters.type === "deposits"}
                onChange={() =>
                  setFilters({ ...filters, type: "deposits" })
                }
              />
              Deposits
            </label>

            <label className="flex items-center  text-gray-600  gap-2">
              <input
                type="radio"
                name="type"
                checked={filters.type === "withdrawals"}
                onChange={() =>
                  setFilters({ ...filters, type: "withdrawals" })
                }
              />
              Withdrawals
            </label>

          </div>
        </div>

        {/* DATE RANGE */}
        <div className="mb-8">

          <p className="text-sm font-medium  text-gray-600 mb-3">
            Date Range
          </p>

          <div className="space-y-3">

            <input
              type="date"
              value={filters.startDate}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  startDate: e.target.value
                })
              }
              className="border w-full p-2 text-sm"
            />

            <input
              type="date"
              value={filters.endDate}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  endDate: e.target.value
                })
              }
              className="border w-full p-2 text-sm"
            />

          </div>
        </div>

        {/* AMOUNT RANGE */}
        <div className="mb-10">

          <p className="text-sm font-medium  text-gray-600  mb-3">
            Amount Range
          </p>

          <div className="space-y-3">

            <input
              type="number"
              placeholder="Min"
              value={filters.minAmount}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  minAmount: e.target.value
                })
              }
              className="border w-full p-2 text-sm"
            />

            <input
              type="number"
              placeholder="Max"
              value={filters.maxAmount}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  maxAmount: e.target.value
                })
              }
              className="border w-full p-2 text-sm"
            />

          </div>

        </div>

        {/* APPLY BUTTON */}
        <button
          onClick={onApply}
          className="w-full bg-brand text-white py-3 mb-3"
        >
          Apply
        </button>

        {/* CLEAR BUTTON */}
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