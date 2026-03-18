import { ExternalLink } from "lucide-react";

export default function AccountSummaryFooter() {
  return (
    <div className="mt-16">
      {/* PROMO SECTION */}
      <div className="relative bg-gray-50 py-20 flex justify-end pr-24">
        {/* PROMO CARD */}
        <div className="bg-white border border-gray-300 w-[400px] p-8">
          <h3 className="text-[26px] text-brand font-medium leading-snug">
            Interac e-Transfer® Request Money
          </h3>

          <p className="text-gray-600 mt-4 text-[17px]">
            Request payments from clients - no paper required.
          </p>

          <button className="mt-6 bg-brand hover:bg-brand-hover text-white px-5 py-2 text-sm font-medium">
            Find out How
          </button>
        </div>

        {/* FEEDBACK TAB */}
        <div className="absolute right-0 top-[50%] -translate-y-1/2">
          <div className="bg-brand text-white px-6 py-4 rotate-[-90deg] text-sm font-medium cursor-pointer">
            Feedback
          </div>
        </div>
      </div>

      {/* FOOTER BAR */}
      <div className="bg-[#3c3c3c] text-gray-200 text-sm px-10 py-6 flex justify-between items-center">
        <p>Royal Bank of Canada Website, © 1995-2026</p>

        <div className="flex items-center gap-4">
          <a className="flex items-center gap-1 hover:underline">
            Legal
            <ExternalLink size={14} />
          </a>

          <div className="w-[1px] h-4 bg-gray-400"></div>

          <a className="flex items-center gap-1 hover:underline">
            Accessibility
            <ExternalLink size={14} />
          </a>

          <div className="w-[1px] h-4 bg-gray-400"></div>

          <a className="flex items-center gap-1 hover:underline">
            Privacy and Security
            <ExternalLink size={14} />
          </a>

          <div className="w-[1px] h-4 bg-gray-400"></div>

          <a className="hover:underline">Advertising & Cookies</a>
        </div>
      </div>
    </div>
  );
}
