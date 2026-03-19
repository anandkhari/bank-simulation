import { ExternalLink } from "lucide-react";

export default function AccountSummaryFooter() {
  return (
    <div className="mt-16">
     

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
